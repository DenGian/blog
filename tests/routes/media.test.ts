import { beforeEach, describe, expect, it, vi } from "vitest";
const authorizeMutation = vi.fn(),
  isMediaConfigured = vi.fn();
vi.mock("@/auth/authorize", () => ({ authorizeMutation }));
vi.mock("@/media/config", () => ({ isMediaConfigured }));
describe("media rejection", () => {
  beforeEach(() => {
    authorizeMutation.mockResolvedValue(null);
    isMediaConfigured.mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn());
  });
  it("rejects an invalid type before Cloudinary", async () => {
    const form = new FormData();
    form.set("file", new File(["text"], "cover.txt", { type: "text/plain" }));
    const { POST } = await import("@/app/api/media/route");
    const response = await POST(
      new Request("http://localhost/api/media", {
        method: "POST",
        body: form,
      }) as never,
    );
    expect(response.status).toBe(422);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("rejects a forged image signature before Cloudinary", async () => {
    const form = new FormData();
    form.set(
      "file",
      new File(["not a png"], "cover.png", { type: "image/png" }),
    );
    const { POST } = await import("@/app/api/media/route");
    const response = await POST(
      new Request("http://localhost/api/media", {
        method: "POST",
        body: form,
      }) as never,
    );
    expect(response.status).toBe(422);
    expect(fetch).not.toHaveBeenCalled();
  });
});
