import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPublishedPost } from "@/data/posts";
import { logOperationalError } from "@/lib/operational-log";

export async function proxy(request: NextRequest) {
  // RSC navigation has no standalone document status. The page still applies
  // notFound(); this preflight exists to make direct HTTP requests truthful.
  if (request.headers.get("rsc") === "1") return NextResponse.next();

  const slug = request.nextUrl.pathname.slice("/blog/".length);
  try {
    if (await getPublishedPost(slug)) return NextResponse.next();
  } catch (error) {
    logOperationalError("article availability preflight", error);
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL("/article-not-found", request.url), {
    status: 404,
  });
}

export const config = { matcher: "/blog/:slug" };
