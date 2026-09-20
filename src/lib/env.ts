import { z } from "zod";

const bcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const optionalUrl = z.union([z.literal(""), z.url()]).optional();
const rawSchema = z.object({
  MONGODB_URI: z.string().min(1),
  MONGODB_DATABASE: z
    .string()
    .trim()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/),
  SITE_URL: z.url(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  SESSION_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  NEXT_PUBLIC_GITHUB_URL: optionalUrl,
  NEXT_PUBLIC_LINKEDIN_URL: optionalUrl,
  NEXT_PUBLIC_GISCUS_REPO: z.string().optional(),
  NEXT_PUBLIC_GISCUS_REPO_ID: z.string().optional(),
  NEXT_PUBLIC_GISCUS_CATEGORY: z.string().optional(),
  NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
});
export type ServerEnvironment = z.infer<typeof rawSchema>;
function allOrNone(values: Array<string | undefined>): boolean {
  const configured = values.map((value) => Boolean(value?.trim()));
  return configured.every(Boolean) || configured.every((value) => !value);
}
export function validateServerEnvironment(
  source: Record<string, string | undefined> = process.env,
): ServerEnvironment {
  const result = rawSchema.safeParse({
    ...source,
    MONGODB_DATABASE: source.MONGODB_DATABASE ?? "blog_portfolio",
    SITE_URL: source.SITE_URL ?? "http://localhost:3000",
  });
  if (!result.success)
    throw new Error("Server configuration is invalid. See .env.example.");
  const env = result.data;
  if (!allOrNone([env.ADMIN_PASSWORD_HASH, env.SESSION_SECRET]))
    throw new Error(
      "ADMIN_PASSWORD_HASH and SESSION_SECRET must be configured together.",
    );
  if (env.ADMIN_PASSWORD_HASH && !bcryptHash.test(env.ADMIN_PASSWORD_HASH))
    throw new Error("ADMIN_PASSWORD_HASH is not a valid bcrypt hash.");
  if (env.SESSION_SECRET && env.SESSION_SECRET.length < 32)
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  if (!allOrNone([env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN]))
    throw new Error("Upstash URL and token must be configured together.");
  if (
    !allOrNone([
      env.CLOUDINARY_CLOUD_NAME,
      env.CLOUDINARY_API_KEY,
      env.CLOUDINARY_API_SECRET,
    ])
  )
    throw new Error("All Cloudinary credentials must be configured together.");
  if (
    !allOrNone([
      env.NEXT_PUBLIC_GISCUS_REPO,
      env.NEXT_PUBLIC_GISCUS_REPO_ID,
      env.NEXT_PUBLIC_GISCUS_CATEGORY,
      env.NEXT_PUBLIC_GISCUS_CATEGORY_ID,
    ])
  )
    throw new Error("All Giscus identifiers must be configured together.");
  const site = new URL(env.SITE_URL);
  if (
    !["http:", "https:"].includes(site.protocol) ||
    site.username ||
    site.password
  )
    throw new Error("SITE_URL must be an HTTP(S) origin without credentials.");
  if (
    env.VERCEL_ENV === "production" &&
    (site.protocol !== "https:" ||
      ["localhost", "127.0.0.1", "example.invalid"].includes(site.hostname))
  )
    throw new Error(
      "SITE_URL must be the real HTTPS production origin on Vercel.",
    );
  return env;
}
export function getServerEnv() {
  const env = validateServerEnvironment();
  return {
    MONGODB_URI: env.MONGODB_URI,
    MONGODB_DATABASE: env.MONGODB_DATABASE,
    SITE_URL: env.SITE_URL,
  };
}
export function getSiteUrl(): URL {
  return new URL(validateServerEnvironment().SITE_URL);
}
export function isAuthConfigured(): boolean {
  const env = validateServerEnvironment();
  return Boolean(env.ADMIN_PASSWORD_HASH && env.SESSION_SECRET);
}
export function getClientRateLimitKey(headers: Headers): string {
  const raw = process.env.VERCEL
    ? (headers.get("x-vercel-forwarded-for") ?? headers.get("x-real-ip"))
    : undefined;
  const normalized = raw?.split(",", 1)[0]?.trim().toLowerCase();
  return normalized && /^[0-9a-f:.]{3,64}$/.test(normalized)
    ? normalized
    : "unverified-client";
}
