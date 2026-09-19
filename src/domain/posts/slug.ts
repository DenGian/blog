export function createSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}
export function slugWithSuffix(base: string, suffix: number): string {
  const ending = `-${suffix}`;
  return `${base.slice(0, 100 - ending.length).replace(/-+$/g, "")}${ending}`;
}
