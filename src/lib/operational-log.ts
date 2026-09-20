export function logOperationalError(context: string, error: unknown): void {
  const kind = error instanceof Error ? error.name : "UnknownError";
  console.error(`[journal] ${context} failed (${kind})`);
}
