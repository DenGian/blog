import { describe, expect, it, vi } from "vitest";
import { hasValidMutationOrigin } from "@/auth/origin";
function request(headers: Record<string, string>) {
  return { headers: new Headers(headers) } as never;
}
describe("mutation origin protection", () => {
  it("rejects a missing origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(hasValidMutationOrigin(request({}))).toBe(false);
    vi.unstubAllEnvs();
  });
  it("rejects malformed origins", () => {
    process.env.SITE_URL = "https://journal.example";
    expect(hasValidMutationOrigin(request({ origin: "not a url" }))).toBe(
      false,
    );
  });
  it("rejects cross-site requests", () => {
    expect(
      hasValidMutationOrigin(
        request({
          "sec-fetch-site": "cross-site",
          origin: "https://attacker.example",
        }),
      ),
    ).toBe(false);
  });
  it("accepts the configured same origin", () => {
    process.env.SITE_URL = "https://journal.example";
    expect(
      hasValidMutationOrigin(request({ origin: "https://journal.example" })),
    ).toBe(true);
  });
  it("accepts the current Vercel preview origin", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "journal-pr-2.vercel.app";
    process.env.SITE_URL = "https://journal.example";
    expect(
      hasValidMutationOrigin(
        request({ origin: "https://journal-pr-2.vercel.app" }),
      ),
    ).toBe(true);
  });
});
