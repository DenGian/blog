export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
export async function uploadCover(file: File): Promise<string> {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  )
    throw new Error("Gebruik JPEG, PNG, WebP of AVIF.");
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("De afbeelding mag maximaal 5 MB zijn.");
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/api/media", { method: "POST", body });
  const result = (await response.json().catch(() => null)) as {
    url?: string;
    error?: string;
  } | null;
  if (!response.ok || !result?.url)
    throw new Error(result?.error ?? "Uploaden is mislukt.");
  return result.url;
}
