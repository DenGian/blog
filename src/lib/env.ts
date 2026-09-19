import { z } from "zod";
const serverSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DATABASE: z.string().min(1).default("blog_portfolio"),
  SITE_URL: z.url().default("http://localhost:3000"),
});
export function getServerEnv() {
  const result = serverSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DATABASE: process.env.MONGODB_DATABASE,
    SITE_URL: process.env.SITE_URL,
  });
  if (!result.success)
    throw new Error("Server configuration is incomplete. See .env.example.");
  if (
    process.env.VERCEL_ENV === "production" &&
    new URL(result.data.SITE_URL).hostname === "localhost"
  )
    throw new Error("SITE_URL must be a production origin in production.");
  return result.data;
}
export function getSiteUrl(): URL {
  const value = process.env.SITE_URL ?? "http://localhost:3000";
  if (
    process.env.VERCEL_ENV === "production" &&
    new URL(value).hostname === "localhost"
  ) {
    throw new Error("SITE_URL must be a production origin in production.");
  }
  return new URL(value);
}
export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD_HASH &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32,
  );
}
