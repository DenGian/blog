export function isPublicPostStatus(status: unknown): boolean {
  return status === "published" || status === undefined;
}
