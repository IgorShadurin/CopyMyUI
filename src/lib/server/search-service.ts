import {
  ComponentAccessType,
  ComponentStatus,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { buildSearchIndexQuery, normalizeSearchQuery } from "@/lib/search";

type SearchClient = PrismaClient | Prisma.TransactionClient;

let ensureSearchPromise: Promise<void> | null = null;
let ftsSearchDisabled = process.env.NODE_ENV === "development";

async function createSearchTable(client: SearchClient) {
  await client.$executeRawUnsafe(`
    CREATE VIRTUAL TABLE IF NOT EXISTS component_search
    USING fts5(
      componentId UNINDEXED,
      slug UNINDEXED,
      title,
      summary,
      description,
      authorName,
      authorEmail,
      authorProfileSlug,
      tokenize = 'unicode61 remove_diacritics 2'
    )
  `);
}

export async function ensureSearchInfrastructure(client: SearchClient = prisma) {
  if (client !== prisma) {
    await createSearchTable(client);
    return;
  }

  if (!ensureSearchPromise) {
    ensureSearchPromise = createSearchTable(client);
  }

  await ensureSearchPromise;
}

type SearchDocument = {
  componentId: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorProfileSlug: string;
};

async function getSearchDocument(client: SearchClient, componentId: string) {
  const component = await client.component.findUnique({
    where: { id: componentId },
    select: {
      id: true,
      slug: true,
      approvedRevisionId: true,
      owner: {
        select: {
          name: true,
          email: true,
          profileSlug: true,
        },
      },
      approvedRevision: {
        select: {
          title: true,
          summary: true,
          description: true,
        },
      },
    },
  });

  if (!component?.approvedRevisionId || !component.approvedRevision) {
    return null;
  }

  return {
    componentId: component.id,
    slug: component.slug,
    title: component.approvedRevision.title,
    summary: component.approvedRevision.summary,
    description: component.approvedRevision.description,
    authorName: component.owner.name ?? "",
    authorEmail: component.owner.email ?? "",
    authorProfileSlug: component.owner.profileSlug ?? "",
  } satisfies SearchDocument;
}

async function insertSearchDocument(client: SearchClient, document: SearchDocument) {
  await client.$executeRaw`
    INSERT INTO component_search (
      componentId,
      slug,
      title,
      summary,
      description,
      authorName,
      authorEmail,
      authorProfileSlug
    ) VALUES (
      ${document.componentId},
      ${document.slug},
      ${document.title},
      ${document.summary},
      ${document.description},
      ${document.authorName},
      ${document.authorEmail},
      ${document.authorProfileSlug}
    )
  `;
}

export async function syncApprovedComponentSearchIndex(
  client: SearchClient,
  componentId: string
) {
  await ensureSearchInfrastructure(client);
  await client.$executeRaw`DELETE FROM component_search WHERE componentId = ${componentId}`;

  const document = await getSearchDocument(client, componentId);

  if (!document) {
    return;
  }

  await insertSearchDocument(client, document);
}

export async function rebuildApprovedComponentSearchIndex(
  client: SearchClient = prisma
) {
  await ensureSearchInfrastructure(client);
  await client.$executeRawUnsafe("DELETE FROM component_search");

  const components = await client.component.findMany({
    where: {
      approvedRevisionId: { not: null },
    },
    select: {
      id: true,
    },
  });

  for (const component of components) {
    await syncApprovedComponentSearchIndex(client, component.id);
  }
}

export async function searchApprovedComponentIds({
  query,
  categorySlug,
  accessType,
  sort = "top",
  limit = 48,
}: {
  query: string;
  categorySlug?: string;
  accessType?: "free" | "premium";
  sort?: "top" | "newest";
  limit?: number;
}) {
  const normalizedQuery = normalizeSearchQuery(query);
  const ftsQuery = buildSearchIndexQuery(normalizedQuery);

  if (!ftsQuery) {
    return {
      ids: [] as string[],
      normalizedQuery,
    };
  }

  if (ftsSearchDisabled) {
    const fallbackIds = await searchApprovedComponentIdsFallback({
      normalizedQuery,
      categorySlug,
      accessType,
      sort,
      limit,
    });

    return {
      ids: fallbackIds,
      normalizedQuery,
    };
  }

  try {
    await ensureSearchInfrastructure();

    const accessFilter =
      accessType === "premium"
        ? Prisma.sql`AND revision.accessType = ${ComponentAccessType.PREMIUM}`
        : accessType === "free"
          ? Prisma.sql`AND revision.accessType = ${ComponentAccessType.FREE}`
          : Prisma.empty;

    const categoryFilter = categorySlug
      ? Prisma.sql`
          AND EXISTS (
            SELECT 1
            FROM "ComponentCategory" component_category
            JOIN "Category" category ON category.id = component_category.categoryId
            WHERE component_category.componentId = component.id
              AND category.slug = ${categorySlug}
          )
        `
      : Prisma.empty;

    const orderBy =
      sort === "newest"
        ? Prisma.raw(
            "component.publishedAt DESC, rank ASC, component.favoritesCount DESC"
          )
        : Prisma.raw(
            "rank ASC, component.favoritesCount DESC, component.publishedAt DESC"
          );

    const rows = await prisma.$queryRaw<Array<{ componentId: string }>>(Prisma.sql`
      SELECT component_search.componentId AS componentId, bm25(component_search) AS rank
      FROM component_search
      JOIN "Component" component ON component.id = component_search.componentId
      JOIN "ComponentRevision" revision ON revision.id = component.approvedRevisionId
      WHERE component_search MATCH ${ftsQuery}
        ${accessFilter}
        ${categoryFilter}
      ORDER BY ${orderBy}
      LIMIT ${Math.max(1, Math.min(limit, 100))}
    `);

    return {
      ids: Array.from(new Set(rows.map((row) => row.componentId))),
      normalizedQuery,
    };
  } catch (error) {
    ftsSearchDisabled = true;

    if (process.env.NODE_ENV === "development") {
      console.warn(
        "FTS search failed; disabling FTS for this process and falling back to relation query.",
        error
      );
    }

    const fallbackIds = await searchApprovedComponentIdsFallback({
      normalizedQuery,
      categorySlug,
      accessType,
      sort,
      limit,
    });

    return {
      ids: fallbackIds,
      normalizedQuery,
    };
  }
}

async function searchApprovedComponentIdsFallback({
  normalizedQuery,
  categorySlug,
  accessType,
  sort,
  limit,
}: {
  normalizedQuery: string;
  categorySlug?: string;
  accessType?: "free" | "premium";
  sort?: "top" | "newest";
  limit?: number;
}) {
  const safeLimit = Math.max(1, Math.min(limit ?? 48, 100));
  const accessFilter =
    accessType === "premium"
      ? { approvedRevision: { is: { accessType: ComponentAccessType.PREMIUM } } }
      : accessType === "free"
        ? { approvedRevision: { is: { accessType: ComponentAccessType.FREE } } }
        : {};
  const categoryFilter = categorySlug
    ? {
        categoryLinks: {
          some: {
            category: {
              slug: categorySlug,
            },
          },
        },
      }
    : {};
  const orderBy =
    sort === "newest"
      ? [
          { publishedAt: "desc" as const },
          { favoritesCount: "desc" as const },
        ]
      : [
          { favoritesCount: "desc" as const },
          { publishedAt: "desc" as const },
        ];

  const components = await prisma.component.findMany({
    where: {
      status: ComponentStatus.APPROVED,
      approvedRevisionId: { not: null },
      ...accessFilter,
      ...categoryFilter,
      OR: [
        { slug: { contains: normalizedQuery } },
        { owner: { name: { contains: normalizedQuery } } },
        { owner: { email: { contains: normalizedQuery } } },
        { owner: { profileSlug: { contains: normalizedQuery } } },
        {
          approvedRevision: {
            is: {
              OR: [
                { title: { contains: normalizedQuery } },
                { summary: { contains: normalizedQuery } },
                { description: { contains: normalizedQuery } },
              ],
            },
          },
        },
      ],
    },
    orderBy,
    take: safeLimit,
    select: { id: true },
  });

  return components.map((component) => component.id);
}
