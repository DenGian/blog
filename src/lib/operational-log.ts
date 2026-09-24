export function logOperationalError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : "";
  const variable = ["MONGODB_URI", "MONGODB_DATABASE", "SITE_URL"].find(
    (name) => message.includes(name),
  );
  const kind = variable
    ? `configuration: ${variable}`
    : message === "Database connection failed."
      ? "database connection"
      : "data query";
  console.error(`[journal] ${context} failed (${kind})`);
}
