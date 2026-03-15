export const MAX_SEARCH_QUERY_LENGTH = 120;
export const MAX_SEARCH_TOKENS = 8;

export function normalizeSearchQuery(query: string | null | undefined) {
  return (query ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, MAX_SEARCH_QUERY_LENGTH);
}

export function tokenizeSearchQuery(query: string | null | undefined) {
  const normalized = normalizeSearchQuery(query);
  const matches = normalized.match(/[\p{L}\p{N}]+/gu) ?? [];

  return Array.from(new Set(matches.map((token) => token.toLowerCase()))).slice(
    0,
    MAX_SEARCH_TOKENS
  );
}

export function buildSearchIndexQuery(query: string | null | undefined) {
  const tokens = tokenizeSearchQuery(query);

  return tokens.map((token) => `${token}*`).join(" AND ");
}
