import { beforeEach, describe, expect, it, vi } from "vitest";
const isAdmin = vi.fn(),
  getAdminSession = vi.fn();
vi.mock("@/auth/session", () => ({ isAdmin, getAdminSession }));
describe("session authorization and logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "http://localhost:3000";
    vi.stubEnv("NODE_ENV", "test");
  });
  it("authorizes a valid admin session and rejects a missing one", async () => {
    const { authorizeMutation } = await import("@/auth/authorize");
    const request = new Request("http://localhost/api/posts", {
      headers: { origin: "http://localhost:3000" },
    }) as never;
    isAdmin.mockResolvedValue(false);
    expect((await authorizeMutation(request))?.status).toBe(401);
    isAdmin.mockResolvedValue(true);
    expect(await authorizeMutation(request)).toBeNull();
  });
  it("destroys the session on logout", async () => {
    const destroy = vi.fn();
    getAdminSession.mockResolvedValue({ destroy });
    const { POST } = await import("@/app/api/auth/logout/route");
    const response = await POST(
      new Request("http://localhost/api/auth/logout", {
        method: "POST",
        headers: { origin: "http://localhost:3000" },
      }) as never,
    );
    expect(response.status).toBe(200);
    expect(destroy).toHaveBeenCalledOnce();
  });
});
