import {
  ComponentAccessType,
  Prisma,
  type PrismaClient,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { buildSearchIndexQuery, normalizeSearchQuery } from "@/lib/search";

type SearchClient = PrismaClient | Prisma.TransactionClient;

let ensureSearchPromise: Promise<void> | null = null;

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
}
