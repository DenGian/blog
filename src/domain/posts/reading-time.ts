export function calculateReadingTime(
  html: string,
  wordsPerMinute = 220,
): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&[a-zA-Z#0-9]+;/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
