import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostCard } from "@/components/posts/PostCard";
vi.mock("next/image", () => ({
  default: () => <span data-testid="next-image" />,
}));
const post = {
  id: "1",
  title: "Week 1",
  slug: "week-1",
  content: "<p>Inhoud</p>",
  excerpt: "Samenvatting",
  tags: ["docker"],
  coverImage: null,
  status: "published" as const,
  publishedAt: "2025-02-07T00:00:00.000Z",
  createdAt: "2025-02-07T00:00:00.000Z",
  updatedAt: "2025-02-07T00:00:00.000Z",
  readingTime: 3,
  seoTitle: null,
  seoDescription: null,
  legacy: false,
};
describe("PostCard", () => {
  it("renders article state accessibly", () => {
    render(<PostCard post={post} />);
    expect(screen.getByRole("heading", { name: "Week 1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Week 1" })).toHaveAttribute(
      "href",
      "/blog/week-1",
    );
    expect(screen.getByText("3 min.")).toBeInTheDocument();
  });
});
