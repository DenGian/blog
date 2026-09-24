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
    const { default: HomePage } = await import("@/app/(public)/page");
    const html = renderToStaticMarkup(await HomePage());
    expect(html).toContain("Week 15");
    expect(html).not.toContain("tijdelijk niet beschikbaar");
  });

  it("distinguishes no published posts from a database outage on the homepage", async () => {
    const { default: HomePage } = await import("@/app/(public)/page");
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
    const { default: BlogPage } = await import("@/app/(public)/blog/page");
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

describe("journal presentation", () => {
  it("shows the dated footer and safe profile links without an admin entry", async () => {
    const { Footer } = await import("@/components/site/Footer");
    const html = renderToStaticMarkup(createElement(Footer));
    expect(html).toContain("© 2025 Ian Mondelaers");
    expect(html).not.toContain("Beheer");
    expect(html).toMatch(
      /href="https:\/\/[^\"]+" target="_blank" rel="noopener noreferrer"[^>]*>LinkedIn/,
    );
    expect(html).toMatch(
      /href="https:\/\/[^\"]+" target="_blank" rel="noopener noreferrer"[^>]*>GitHub/,
    );
  });

  it("uses direct contact copy and no form explanation", async () => {
    const { default: ContactPage } =
      await import("@/app/(public)/contact/page");
    const html = renderToStaticMarkup(createElement(ContactPage));
    expect(html).toContain("Neem gerust contact op.");
    expect(html).not.toMatch(
      /verifieerbare|contactformulier|spamrisico|onbeheerde mailintegratie/i,
    );
  });

  it("introduces the stage without the old portrait or heading", async () => {
    const { default: AboutPage } = await import("@/app/(public)/about/page");
    const html = renderToStaticMarkup(createElement(AboutPage));
    expect(html).toContain("HolonCom");
    expect(html).not.toContain("Ik ben Ian.");
    expect(html).not.toContain("profile-image.jpg");
    expect(html).not.toContain("profile.png");
    expect(html).not.toContain("<img");
  });

  it("keeps personal photo URLs out of the homepage", async () => {
    listPublishedPosts.mockResolvedValue({ posts: [] });
    const { default: HomePage } = await import("@/app/(public)/page");
    const html = renderToStaticMarkup(await HomePage());
    expect(html).not.toMatch(/profile-image\.jpg|profile\.png/);
  });

  it("keeps the article introduction grounded in the work", async () => {
    listPublishedPosts.mockResolvedValue({
      posts: [],
      total: 0,
      page: 1,
      totalPages: 1,
    });
    getTags.mockResolvedValue([]);
    const { default: BlogPage } = await import("@/app/(public)/blog/page");
    const html = renderToStaticMarkup(
      await BlogPage({ searchParams: Promise.resolve({}) }),
    );
    expect(html).not.toContain("tot het afscheid");
  });
});
