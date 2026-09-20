import type { NextRequest } from "next/server";
import { getSiteUrl } from "@/lib/env";
export function hasValidMutationOrigin(request: NextRequest): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    return new URL(origin).origin === getSiteUrl().origin;
  } catch {
    return false;
  }
}
