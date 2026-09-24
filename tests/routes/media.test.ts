import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const authorizeMutation = vi.fn(),
  isMediaConfigured = vi.fn();
vi.mock("@/auth/authorize", () => ({ authorizeMutation }));
vi.mock("@/media/config", () => ({ isMediaConfigured }));
describe("media rejection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authorizeMutation.mockResolvedValue(null);
    isMediaConfigured.mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllEnvs());
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
  it("signs an accepted upload with Cloudinary's SHA-256 format", async () => {
    vi.stubEnv("CLOUDINARY_API_SECRET", "test-only-api-secret");
    vi.stubEnv("CLOUDINARY_API_KEY", "test-only-api-key");
    vi.stubEnv("CLOUDINARY_CLOUD_NAME", "test-cloud");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        secure_url: "https://res.cloudinary.com/test/image.png",
      }),
    } as Response);
    const form = new FormData();
    form.set(
      "file",
      new File(
        [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
        "cover.png",
        { type: "image/png" },
      ),
    );
    const { POST } = await import("@/app/api/media/route");
    const response = await POST({ formData: async () => form } as never);
    expect(response.status).toBe(201);
    expect(fetch).toHaveBeenCalledOnce();
    const upload = vi.mocked(fetch).mock.calls[0]![1]?.body as FormData;
    const timestamp = upload.get("timestamp");
    expect(upload.get("signature")).toBe(
      createHash("sha256")
        .update(
          `folder=internship-journal/covers&timestamp=${timestamp}test-only-api-secret`,
        )
        .digest("hex"),
    );
  });
});
