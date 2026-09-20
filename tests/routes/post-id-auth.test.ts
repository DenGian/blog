import { beforeEach, describe, expect, it, vi } from "vitest";
const authorizeMutation = vi.fn();
const updatePost = vi.fn();
const deletePost = vi.fn();
vi.mock("@/auth/authorize", () => ({ authorizeMutation }));
vi.mock("@/data/posts", () => ({ updatePost, deletePost }));
describe("identified post mutations", () => {
  beforeEach(() => vi.clearAllMocks());
  it.each(["PUT", "DELETE"])(
    "blocks unauthenticated %s before data access",
    async (method) => {
      authorizeMutation.mockResolvedValue(
        Response.json({ error: "Authenticatie vereist." }, { status: 401 }),
      );
      const handlers = await import("@/app/api/posts/[id]/route");
      const request = new Request("http://localhost/api/posts/id", {
        method,
        body: method === "PUT" ? "{}" : undefined,
      }) as never;
      const response = await handlers[method as "PUT" | "DELETE"](request, {
        params: Promise.resolve({ id: "id" }),
      });
      expect(response.status).toBe(401);
      expect(updatePost).not.toHaveBeenCalled();
      expect(deletePost).not.toHaveBeenCalled();
    },
  );
  it("updates and deletes through authorized handlers", async () => {
    authorizeMutation.mockResolvedValue(null);
    updatePost.mockResolvedValue({ id: "507f1f77bcf86cd799439011" });
    deletePost.mockResolvedValue(true);
    const handlers = await import("@/app/api/posts/[id]/route");
    const input = {
      title: "Valid post",
      excerpt: "A sufficiently long excerpt",
      content: "<p>Safe content</p>",
      tags: [],
      status: "draft",
    };
    expect(
      (
        await handlers.PUT(
          new Request("http://localhost/api/posts/id", {
            method: "PUT",
            body: JSON.stringify(input),
          }) as never,
          { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.DELETE(
          new Request("http://localhost/api/posts/id", {
            method: "DELETE",
          }) as never,
          { params: Promise.resolve({ id: "507f1f77bcf86cd799439011" }) },
        )
      ).status,
    ).toBe(204);
  });
});
