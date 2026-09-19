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
});
