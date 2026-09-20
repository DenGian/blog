import { z } from "zod";

type Environment = Record<string, string | undefined>;

const bcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const databaseName = /^[A-Za-z0-9_-]+$/;
const optionalUrl = z.union([z.literal(""), z.url()]).optional();

function configurationError(
  concern: string,
  issues: z.core.$ZodIssue[],
): Error {
  const names = [
    ...new Set(
      issues.map((issue) => String(issue.path[0] ?? concern)).filter(Boolean),
    ),
  ];
  return new Error(
    `Server configuration is invalid: ${names.join(", ")} ${
      names.length === 1 ? "is" : "are"
    } missing or invalid.`,
  );
}

function parse<T extends z.ZodType>(
  concern: string,
  schema: T,
  source: Environment,
): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) throw configurationError(concern, result.error.issues);
  return result.data;
}

function configured(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function requireAllOrNone(names: string[], source: Environment): boolean {
  const present = names.filter((name) => configured(source[name]));
  if (present.length === 0) return false;
  if (present.length !== names.length) {
    const missing = names.filter((name) => !configured(source[name]));
    throw new Error(
      `Server configuration is invalid: ${missing.join(", ")} ${
        missing.length === 1 ? "is" : "are"
      } missing.`,
    );
  }
  return true;
}

function parseHttpOrigin(name: string, value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Server configuration is invalid: ${name} is invalid.`);
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      `Server configuration is invalid: ${name} must be an HTTP(S) origin without credentials, path, query, or fragment.`,
    );
  return url;
}

function vercelOrigin(name: string, value: string): URL {
  if (value.includes("://") || /[/?#@]/.test(value))
    throw new Error(`Server configuration is invalid: ${name} is invalid.`);
  return parseHttpOrigin(name, `https://${value}`);
}

function assertDeployableOrigin(name: string, url: URL): URL {
  const hostname = url.hostname.toLowerCase();
  if (
    url.protocol !== "https:" ||
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("127.") ||
    hostname === "[::1]" ||
    hostname === "example.invalid" ||
    hostname.endsWith(".example.invalid")
  )
    throw new Error(
      `Server configuration is invalid: ${name} must be a real HTTPS deployment origin.`,
    );
  return url;
}

export type DatabaseEnvironment = {
  MONGODB_URI: string;
  MONGODB_DATABASE: string;
};

export function validateDatabaseEnvironment(
  source: Environment = process.env,
): DatabaseEnvironment {
  const env = parse(
    "database",
    z.object({
      MONGODB_URI: z.string().trim().min(1),
      MONGODB_DATABASE: z.string().trim().min(1).regex(databaseName),
    }),
    {
      ...source,
      MONGODB_DATABASE: source.MONGODB_DATABASE ?? "blog_portfolio",
    },
  );
  let uri: URL;
  try {
    uri = new URL(env.MONGODB_URI);
  } catch {
    throw new Error("Server configuration is invalid: MONGODB_URI is invalid.");
  }
  if (!["mongodb:", "mongodb+srv:"].includes(uri.protocol))
    throw new Error("Server configuration is invalid: MONGODB_URI is invalid.");
  return env;
}

export function validateAuthEnvironment(source: Environment = process.env): {
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
} {
  const names = ["ADMIN_PASSWORD_HASH", "SESSION_SECRET"];
  if (!requireAllOrNone(names, source)) return {};
  return parse(
    "administrator authentication",
    z.object({
      ADMIN_PASSWORD_HASH: z.string().regex(bcryptHash),
      SESSION_SECRET: z.string().min(32),
    }),
    source,
  );
}

export function validateRateLimitEnvironment(
  source: Environment = process.env,
): { UPSTASH_REDIS_REST_URL?: string; UPSTASH_REDIS_REST_TOKEN?: string } {
  const names = ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"];
  if (!requireAllOrNone(names, source)) return {};
  return parse(
    "rate limiting",
    z.object({
      UPSTASH_REDIS_REST_URL: z.url(),
      UPSTASH_REDIS_REST_TOKEN: z.string().trim().min(1),
    }),
    source,
  );
}

export function validateCloudinaryEnvironment(
  source: Environment = process.env,
): {
  CLOUDINARY_CLOUD_NAME?: string;
  CLOUDINARY_API_KEY?: string;
  CLOUDINARY_API_SECRET?: string;
} {
  const names = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];
  if (!requireAllOrNone(names, source)) return {};
  return parse(
    "Cloudinary",
    z.object({
      CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
      CLOUDINARY_API_KEY: z.string().trim().min(1),
      CLOUDINARY_API_SECRET: z.string().trim().min(1),
    }),
    source,
  );
}

export function validateGiscusEnvironment(source: Environment = process.env): {
  NEXT_PUBLIC_GISCUS_REPO?: string;
  NEXT_PUBLIC_GISCUS_REPO_ID?: string;
  NEXT_PUBLIC_GISCUS_CATEGORY?: string;
  NEXT_PUBLIC_GISCUS_CATEGORY_ID?: string;
} {
  const names = [
    "NEXT_PUBLIC_GISCUS_REPO",
    "NEXT_PUBLIC_GISCUS_REPO_ID",
    "NEXT_PUBLIC_GISCUS_CATEGORY",
    "NEXT_PUBLIC_GISCUS_CATEGORY_ID",
  ];
  if (!requireAllOrNone(names, source)) return {};
  return parse(
    "Giscus",
    z.object({
      NEXT_PUBLIC_GISCUS_REPO: z
        .string()
        .trim()
        .regex(/^[^/\s]+\/[^/\s]+$/),
      NEXT_PUBLIC_GISCUS_REPO_ID: z.string().trim().min(1),
      NEXT_PUBLIC_GISCUS_CATEGORY: z.string().trim().min(1),
      NEXT_PUBLIC_GISCUS_CATEGORY_ID: z.string().trim().min(1),
    }),
    source,
  );
}

export function validatePublicLinks(source: Environment = process.env) {
  return parse(
    "public links",
    z.object({
      NEXT_PUBLIC_GITHUB_URL: optionalUrl,
      NEXT_PUBLIC_LINKEDIN_URL: optionalUrl,
    }),
    source,
  );
}

/**
 * Preview deployments use their deployment-specific URL so same-origin admin
 * requests and preview metadata agree. Production prefers an explicit canonical
 * SITE_URL, then Vercel's project production URL, then its deployment URL.
 * Outside Vercel, SITE_URL wins and local development defaults to localhost.
 */
export function getSiteUrl(source: Environment = process.env): URL {
  const environment = source.VERCEL_ENV;
  if (environment === "preview" && configured(source.VERCEL_URL))
    return assertDeployableOrigin(
      "VERCEL_URL",
      vercelOrigin("VERCEL_URL", source.VERCEL_URL!),
    );

  if (configured(source.SITE_URL)) {
    const url = parseHttpOrigin("SITE_URL", source.SITE_URL!);
    return environment === "production"
      ? assertDeployableOrigin("SITE_URL", url)
      : url;
  }

  if (environment === "production") {
    if (configured(source.VERCEL_PROJECT_PRODUCTION_URL))
      return assertDeployableOrigin(
        "VERCEL_PROJECT_PRODUCTION_URL",
        vercelOrigin(
          "VERCEL_PROJECT_PRODUCTION_URL",
          source.VERCEL_PROJECT_PRODUCTION_URL!,
        ),
      );
    if (configured(source.VERCEL_URL))
      return assertDeployableOrigin(
        "VERCEL_URL",
        vercelOrigin("VERCEL_URL", source.VERCEL_URL!),
      );
    throw new Error(
      "Server configuration is invalid: SITE_URL or VERCEL_PROJECT_PRODUCTION_URL is missing.",
    );
  }

  if (environment === "preview")
    throw new Error(
      "Server configuration is invalid: VERCEL_URL or SITE_URL is missing.",
    );

  return new URL("http://localhost:3000");
}

export function getServerEnv(): DatabaseEnvironment {
  return validateDatabaseEnvironment();
}

export function isAuthConfigured(source: Environment = process.env): boolean {
  const env = validateAuthEnvironment(source);
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
