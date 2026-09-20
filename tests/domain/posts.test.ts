import { describe, expect, it } from "vitest";
import { createSlug, slugWithSuffix } from "@/domain/posts/slug";
import { calculateReadingTime } from "@/domain/posts/reading-time";
import { escapeRegex, normalizeSearch } from "@/domain/posts/search";
import { sanitizePostHtml } from "@/domain/posts/sanitize";
import { coverImageSchema, postInputSchema } from "@/domain/posts/schema";
import { legacyCoverBySlug } from "@/domain/posts/legacy-covers";
import { legacyCovers as migrationLegacyCovers } from "../../scripts/legacy-covers.mjs";

describe("post domain", () => {
  it("creates stable normalized slugs and bounded collision suffixes", () => {
    expect(createSlug("  Hé, Docker & CI/CD! ")).toBe("he-docker-ci-cd");
    expect(slugWithSuffix("a".repeat(100), 12)).toHaveLength(100);
  });
  it("calculates at least one minute and scales by word count", () => {
    expect(calculateReadingTime("<p>kort</p>")).toBe(1);
    expect(calculateReadingTime(`<p>${"woord ".repeat(221)}</p>`)).toBe(2);
  });
  it("escapes regex operators and bounds search", () => {
    expect(escapeRegex("a.*(b)")).toBe("a\\.\\*\\(b\\)");
    expect(normalizeSearch("x".repeat(100))).toHaveLength(80);
  });
  it("removes active HTML and unsafe URLs", () => {
    const clean = sanitizePostHtml(
      `<p onclick="steal()">Goed<script>alert(1)</script><a href="javascript:alert(1)">link</a><iframe src="https://bad.example"></iframe></p>`,
    );
    expect(clean).toContain("Goed");
    expect(clean).not.toMatch(/script|onclick|javascript|iframe/i);
  });
  it("normalizes valid input and rejects mass assignment", () => {
    const valid = postInputSchema.parse({
      title: "Een geldige titel",
      excerpt: "Een geldige samenvatting",
      content: "<p>Veilige inhoud</p>",
      tags: [" Docker ", "docker"],
      status: "draft",
    });
    expect(valid.slug).toBe("een-geldige-titel");
    expect(valid.tags).toEqual(["Docker"]);
    expect(
      postInputSchema.safeParse({
        title: "Goed genoeg",
        excerpt: "Een geldige samenvatting",
        content: "<p>Tekst</p>",
        tags: [],
        status: "draft",
        author: { admin: true },
      }).success,
    ).toBe(false);
  });
  it("accepts safe local/HTTPS covers and rejects ambiguous or credentialed URLs", () => {
    expect(coverImageSchema.safeParse("/covers/week.svg").success).toBe(true);
    expect(
      coverImageSchema.safeParse("https://res.cloudinary.com/example/image.png")
        .success,
    ).toBe(true);
    expect(migrationLegacyCovers).toEqual(legacyCoverBySlug);
    expect(
      coverImageSchema.safeParse("//attacker.example/image.png").success,
    ).toBe(false);
    expect(
      coverImageSchema.safeParse("https://user:pass@example.com/image.png")
        .success,
    ).toBe(false);
    expect(
      coverImageSchema.safeParse("http://example.com/image.png").success,
    ).toBe(false);
  });
  it("maps all fifteen legacy slugs to deterministic local SVG covers", () => {
    expect(Object.keys(legacyCoverBySlug)).toHaveLength(15);
    expect(
      Object.values(legacyCoverBySlug).every((value) =>
        /^\/covers\/week-\d{2}-[a-z-]+\.svg$/.test(value),
      ),
    ).toBe(true);
  });
});
