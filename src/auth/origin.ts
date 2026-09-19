import type { NextRequest } from "next/server";
export function hasValidMutationOrigin(request: NextRequest): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  const configured = process.env.SITE_URL;
  if (!configured) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).origin === new URL(configured).origin;
  } catch {
    return false;
  }
}
