import { NextResponse } from "next/server";

import { ApiError, apiErrorResponse, requireApiKey } from "@/lib/api";
import { listPublicComponents } from "@/lib/server/component-service";
import { normalizeSearchQuery } from "@/lib/search";

export async function GET(request: Request) {
  try {
    const auth = await requireApiKey(request);
    const url = new URL(request.url);
    const query = normalizeSearchQuery(url.searchParams.get("q"));

    if (!query) {
      throw new ApiError(
        400,
        "missing_query",
        "Search requires a non-empty `q` parameter."
      );
    }

    const category = url.searchParams.get("category")?.trim() || undefined;
    const access = url.searchParams.get("access")?.trim() || undefined;
    const sort = url.searchParams.get("sort")?.trim() || undefined;
    const components = await listPublicComponents(
      {
        query,
        categorySlug: category,
        accessType:
          access === "premium"
            ? "premium"
            : access === "free"
              ? "free"
              : undefined,
        sort: sort === "newest" ? "newest" : "top",
      },
      auth.user.id
    );

    return NextResponse.json({
      query,
      results: components,
      count: components.length,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
