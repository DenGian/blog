import { listAllPublishedPosts } from "@/data/posts";
import type { PostView } from "@/domain/posts/types";
import { getSiteUrl } from "@/lib/env";
import { logOperationalError } from "@/lib/operational-log";
function xml(value: string) {
  return value.replace(
    /[<>&'\"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character]!,
  );
}
export async function GET() {
  const origin = getSiteUrl();
  let posts: PostView[] = [];
  try {
    posts = await listAllPublishedPosts();
  } catch (error) {
    logOperationalError("feed post retrieval", error);
    return new Response("Feed tijdelijk niet beschikbaar.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
  const items = posts
    .map(
      (post) =>
        `<entry><title>${xml(post.title)}</title><id>${xml(new URL(`/blog/${post.slug}`, origin).toString())}</id><link href="${xml(new URL(`/blog/${post.slug}`, origin).toString())}" rel="alternate" type="text/html"/><updated>${xml(post.updatedAt)}</updated><summary>${xml(post.excerpt)}</summary></entry>`,
    )
    .join("");
  const updated = posts[0]?.updatedAt ?? "1970-01-01T00:00:00.000Z";
  const body = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Software Engineering Stagejournaal</title><id>${xml(origin.toString())}</id><link href="${xml(new URL("/", origin).toString())}" rel="alternate" type="text/html"/><link href="${xml(new URL("/feed.xml", origin).toString())}" rel="self" type="application/atom+xml"/><updated>${xml(updated)}</updated>${items}</feed>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
