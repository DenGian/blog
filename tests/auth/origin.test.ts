import { describe, expect, it } from "vitest";
import { hasValidMutationOrigin } from "@/auth/origin";
function request(headers: Record<string, string>) {
  return { headers: new Headers(headers) } as never;
}
describe("mutation origin protection", () => {
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
});
