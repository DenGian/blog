import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compare, hash } from "bcryptjs";
import { getClientRateLimitKey, validateServerEnvironment } from "@/lib/env";
import {
  checkLoginRateLimit,
  resetDevelopmentRateLimits,
} from "@/auth/rate-limit";
import { getSessionOptions } from "@/auth/session";
const base = {
  MONGODB_URI: "mongodb://127.0.0.1/test",
  MONGODB_DATABASE: "journal_test",
  SITE_URL: "http://localhost:3000",
};
describe("security configuration", () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env = { ...original, ...base };
    resetDevelopmentRateLimits();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    process.env = original;
    vi.restoreAllMocks();
  });
  it("allows deliberately absent CMS auth", () =>
    expect(validateServerEnvironment(base)).toBeTruthy());
  it.each([
    [
      { ...base, ADMIN_PASSWORD_HASH: "bad", SESSION_SECRET: "x".repeat(32) },
      "bcrypt",
    ],
    [{ ...base, ADMIN_PASSWORD_HASH: "$2b$12$" + "a".repeat(53) }, "together"],
    [{ ...base, UPSTASH_REDIS_REST_URL: "https://redis.example" }, "together"],
    [{ ...base, CLOUDINARY_CLOUD_NAME: "cloud" }, "Cloudinary"],
    [{ ...base, NEXT_PUBLIC_GISCUS_REPO: "owner/repo" }, "Giscus"],
  ])("rejects invalid or partial configuration", (env, message) =>
    expect(() => validateServerEnvironment(env)).toThrow(message),
  );
  it("rejects placeholder and localhost Vercel production origins", () =>
    expect(() =>
      validateServerEnvironment({
        ...base,
        SITE_URL: "https://example.invalid",
        VERCEL_ENV: "production",
      }),
    ).toThrow(/production origin/));
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
