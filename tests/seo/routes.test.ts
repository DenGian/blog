import { beforeEach, describe, expect, it, vi } from "vitest";
const listAllPublishedPosts = vi.fn();
vi.mock("@/data/posts", () => ({ listAllPublishedPosts }));
vi.mock("@/lib/env", () => ({
  getSiteUrl: () => new URL("https://journal.example"),
}));
const makePost = (index: number) => ({
  id: String(index),
  title: `Post & ${index}`,
  slug: `post-${index}`,
  content: "<p>x</p>",
  excerpt: `Summary <${index}>`,
  tags: [],
  coverImage: null,
  status: "published" as const,
  publishedAt: "2025-01-01T00:00:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: `2025-01-${String((index % 28) + 1).padStart(2, "0")}T00:00:00.000Z`,
  readingTime: 1,
  seoTitle: null,
  seoDescription: null,
  legacy: index === 0,
});
describe("sitemap and Atom completeness", () => {
  beforeEach(() =>
    listAllPublishedPosts.mockResolvedValue(
      Array.from({ length: 30 }, (_, index) => makePost(index)),
    ),
  );
  it("includes more than 24 published canonical URLs without volatile static dates", async () => {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    expect(entries).toHaveLength(34);
    expect(
      entries.find((entry) => entry.url === "https://journal.example/")
        ?.lastModified,
    ).toBeUndefined();
    expect(entries.at(-1)?.url).toBe("https://journal.example/blog/post-29");
  });
  it("emits valid escaped Atom with self and alternate HTML links", async () => {
    const { GET } = await import("@/app/feed.xml/route");
    const body = await (await GET()).text();
    const document = new DOMParser().parseFromString(body, "application/xml");
    expect(document.querySelector("parsererror")).toBeNull();
    expect(document.querySelectorAll("entry")).toHaveLength(30);
    expect(body).toContain("Post &amp; 0");
    expect(body).toContain('rel="alternate" type="text/html"');
  });
});
