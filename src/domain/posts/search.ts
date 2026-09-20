export const MAX_SEARCH_LENGTH = 80;
export function normalizeSearch(value: unknown): string {
  return typeof value === "string"
    ? value.trim().slice(0, MAX_SEARCH_LENGTH)
    : "";
}
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
