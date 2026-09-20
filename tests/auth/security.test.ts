import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compare, hash } from "bcryptjs";
import {
  getClientRateLimitKey,
  getSiteUrl,
  validateAuthEnvironment,
  validateCloudinaryEnvironment,
  validateDatabaseEnvironment,
  validateGiscusEnvironment,
  validateRateLimitEnvironment,
} from "@/lib/env";
import {
  checkLoginRateLimit,
  resetDevelopmentRateLimits,
} from "@/auth/rate-limit";
import { getSessionOptions } from "@/auth/session";

describe("security configuration", () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env = { ...original };
    resetDevelopmentRateLimits();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = original;
    vi.restoreAllMocks();
  });

  it("resolves the local site URL without MongoDB configuration", () => {
    expect(getSiteUrl({}).toString()).toBe("http://localhost:3000/");
  });

  it("uses the deployment-specific Vercel preview URL", () => {
    expect(
      getSiteUrl({
        VERCEL_ENV: "preview",
        VERCEL_URL: "journal-git-feature.vercel.app",
        SITE_URL: "https://journal.example",
      }).toString(),
    ).toBe("https://journal-git-feature.vercel.app/");
  });

  it("uses explicit canonical SITE_URL in production", () => {
    expect(
      getSiteUrl({
        VERCEL_ENV: "production",
        SITE_URL: "https://journal.example",
        VERCEL_PROJECT_PRODUCTION_URL: "fallback.vercel.app",
      }).toString(),
    ).toBe("https://journal.example/");
  });

  it("falls back to Vercel's project production URL", () => {
    expect(
      getSiteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "journal.vercel.app",
      }).toString(),
    ).toBe("https://journal.vercel.app/");
  });

  it.each([
    "http://journal.example",
    "https://localhost:3000",
    "https://127.0.0.1",
    "https://127.1.2.3",
    "https://[::1]",
    "https://example.invalid",
    "https://user:password@journal.example",
    "ftp://journal.example",
  ])("rejects invalid production origin %s", (SITE_URL) => {
    expect(() => getSiteUrl({ VERCEL_ENV: "production", SITE_URL })).toThrow(
      /SITE_URL/,
    );
  });

  it("reports invalid database names without revealing values", () => {
    const secret = "not-a-database-uri-containing-secret-password";
    let message = "";
    try {
      validateDatabaseEnvironment({ MONGODB_URI: secret });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("MONGODB_URI");
    expect(message).not.toContain(secret);
    expect(message).not.toContain("secret-password");
  });

  it("keeps database validation strict and independent", () => {
    expect(() => validateDatabaseEnvironment({})).toThrow(/MONGODB_URI/);
    expect(
      validateDatabaseEnvironment({
        MONGODB_URI: "mongodb://127.0.0.1:27017/journal",
      }).MONGODB_DATABASE,
    ).toBe("blog_portfolio");
  });

  it.each([
    [
      () => validateAuthEnvironment({ ADMIN_PASSWORD_HASH: "hash" }),
      "SESSION_SECRET",
    ],
    [
      () =>
        validateRateLimitEnvironment({
          UPSTASH_REDIS_REST_URL: "https://redis.example",
        }),
      "UPSTASH_REDIS_REST_TOKEN",
    ],
    [
      () => validateCloudinaryEnvironment({ CLOUDINARY_CLOUD_NAME: "cloud" }),
      "CLOUDINARY_API_KEY",
    ],
    [
      () =>
        validateGiscusEnvironment({ NEXT_PUBLIC_GISCUS_REPO: "owner/repo" }),
      "NEXT_PUBLIC_GISCUS_REPO_ID",
    ],
  ])("rejects partial concern configuration", (validate, missingName) => {
    expect(validate).toThrow(missingName);
  });

  it("rejects malformed configured authentication", () => {
    expect(() =>
      validateAuthEnvironment({
        ADMIN_PASSWORD_HASH: "not-a-hash",
        SESSION_SECRET: "x".repeat(32),
      }),
    ).toThrow(/ADMIN_PASSWORD_HASH/);
  });

  it("verifies bcrypt success and failure", async () => {
    const digest = await hash("correct", 4);
    expect(await compare("correct", digest)).toBe(true);
    expect(await compare("wrong", digest)).toBe(false);
  });

  it("limits repeated development attempts", async () => {
    vi.stubEnv("NODE_ENV", "test");
    for (let i = 0; i < 8; i++)
      expect((await checkLoginRateLimit("client")).allowed).toBe(true);
    expect((await checkLoginRateLimit("client")).allowed).toBe(false);
  });

  it("fails closed in production without durable storage", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(await checkLoginRateLimit("client")).toMatchObject({
      allowed: false,
      configured: false,
    });
  });

  it("sets secure strict HttpOnly production session cookies", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getSessionOptions().cookieOptions).toMatchObject({
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/",
    });
  });

  it("does not trust forwarding headers outside Vercel", () =>
    expect(
      getClientRateLimitKey(new Headers({ "x-forwarded-for": "1.2.3.4" })),
    ).toBe("unverified-client"));

  it("normalizes a bounded Vercel identifier", () => {
    process.env.VERCEL = "1";
    expect(
      getClientRateLimitKey(
        new Headers({ "x-vercel-forwarded-for": "2001:DB8::1" }),
      ),
    ).toBe("2001:db8::1");
  });
});
