import { describe, expect, it } from "vitest";
import { isPublicPostStatus } from "@/domain/posts/publication";
describe("publication boundary", () => {
  it("keeps legacy and published articles public", () => {
    expect(isPublicPostStatus(undefined)).toBe(true);
    expect(isPublicPostStatus("published")).toBe(true);
  });
  it("never exposes drafts", () => {
    expect(isPublicPostStatus("draft")).toBe(false);
    expect(isPublicPostStatus(null)).toBe(false);
  });
});
