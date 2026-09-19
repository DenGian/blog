import { beforeEach, describe, expect, it, vi } from "vitest";
const authorizeMutation = vi.fn();
const createPost = vi.fn();
vi.mock("@/auth/authorize", () => ({ authorizeMutation }));
vi.mock("@/data/posts", () => ({ createPost }));
describe("post write route", () => {
  beforeEach(() => vi.clearAllMocks());
  it("returns the authorization response before reading or writing", async () => {
    const denied = Response.json(
      { error: "Authenticatie vereist." },
      { status: 401 },
    );
    authorizeMutation.mockResolvedValue(denied);
    const { POST } = await import("@/app/api/posts/route");
    const response = await POST(
      new Request("http://localhost/api/posts", {
        method: "POST",
        body: "{}",
      }) as never,
    );
    expect(response.status).toBe(401);
    expect(createPost).not.toHaveBeenCalled();
  });
  it("rejects invalid post input", async () => {
    authorizeMutation.mockResolvedValue(null);
    const { POST } = await import("@/app/api/posts/route");
    const response = await POST(
      new Request("http://localhost/api/posts", {
        method: "POST",
        body: JSON.stringify({ title: "x" }),
      }) as never,
    );
    expect(response.status).toBe(422);
    expect(createPost).not.toHaveBeenCalled();
  });
});
