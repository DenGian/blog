import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

const listPublishedPosts = vi.fn();
const getTags = vi.fn();
vi.mock("@/data/posts", () => ({ listPublishedPosts, getTags }));
vi.mock("@/components/posts/PostCard", () => ({
  PostCard: ({ post }: { post: { title: string } }) =>
    createElement("article", null, post.title),
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => createElement("img", { alt }),
}));

describe("public database states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getTags.mockResolvedValue([]);
  });

  it("shows recent articles when the database responds", async () => {
    listPublishedPosts.mockResolvedValue({ posts: [{ title: "Week 15" }] });
    const { default: HomePage } = await import("@/app/page");
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain("Week 15");
    expect(html).not.toContain("tijdelijk niet beschikbaar");
  });

  it("distinguishes no published posts from a database outage on the homepage", async () => {
    const { default: HomePage } = await import("@/app/page");
    listPublishedPosts.mockResolvedValue({ posts: [] });
    expect(renderToStaticMarkup(await HomePage())).toContain(
      "nog geen artikelen gepubliceerd",
    );
    listPublishedPosts.mockRejectedValue(
      new Error("Database connection failed."),
    );
    expect(renderToStaticMarkup(await HomePage())).toContain(
      "tijdelijk niet beschikbaar",
    );
  });

  it("distinguishes no filter matches from a database outage on the index", async () => {
    const { default: BlogPage } = await import("@/app/blog/page");
    listPublishedPosts.mockResolvedValue({
      posts: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });
    const props = { searchParams: Promise.resolve({ search: "unmatched" }) };
    expect(renderToStaticMarkup(await BlogPage(props))).toContain(
      "Geen artikelen gevonden",
    );
    listPublishedPosts.mockRejectedValue(
      new Error("Database connection failed."),
    );
    expect(renderToStaticMarkup(await BlogPage(props))).toContain(
      "tijdelijk niet beschikbaar",
    );
  });
});
