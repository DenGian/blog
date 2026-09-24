import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { authorizeMutation } from "@/auth/authorize";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/media/cloudinary";
import { isMediaConfigured } from "@/media/config";
function hasValidSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg")
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png")
    return bytes
      .slice(0, 8)
      .every(
        (value, index) =>
          value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index],
      );
  if (type === "image/webp")
    return (
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
    );
  if (type === "image/avif")
    return new TextDecoder().decode(bytes.slice(4, 12)).includes("ftypavif");
  return false;
}
export async function POST(request: NextRequest) {
  const denied = await authorizeMutation(request);
  if (denied) return denied;
  if (!isMediaConfigured())
    return NextResponse.json(
      { error: "Media-upload is niet geconfigureerd." },
      { status: 503 },
    );
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (
    !(file instanceof File) ||
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    ) ||
    file.size < 1 ||
    file.size > MAX_IMAGE_BYTES
  )
    return NextResponse.json(
      { error: "Gebruik JPEG, PNG, WebP of AVIF tot maximaal 5 MB." },
      { status: 422 },
    );
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes.slice(0, 16), file.type))
    return NextResponse.json(
      { error: "De bestandsinhoud komt niet overeen met het afbeeldingstype." },
      { status: 422 },
    );
  const timestamp = Math.floor(Date.now() / 1_000);
  const folder = "internship-journal/covers";
  const signature = createHash("sha256")
    .update(
      `folder=${folder}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`,
    )
    .digest("hex");
  const upload = new FormData();
  upload.set("file", new Blob([bytes], { type: file.type }), file.name);
  upload.set("api_key", process.env.CLOUDINARY_API_KEY!);
  upload.set("timestamp", String(timestamp));
  upload.set("folder", folder);
  upload.set("signature", signature);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(process.env.CLOUDINARY_CLOUD_NAME!)}/image/upload`,
      { method: "POST", body: upload },
    );
    const result = (await response.json()) as { secure_url?: string };
    if (!response.ok || !result.secure_url?.startsWith("https://"))
      throw new Error();
    return NextResponse.json({ url: result.secure_url }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Uploaden naar de mediaprovider is mislukt." },
      { status: 502 },
    );
  }
}
