import { listPublishedPosts } from "@/data/posts";
import type { PostView } from "@/domain/posts/types";
import { getSiteUrl } from "@/lib/env";
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
    posts = (await listPublishedPosts({ limit: 24 })).posts;
  } catch {}
  const items = posts
    .map(
      (post) =>
        `<entry><title>${xml(post.title)}</title><id>${new URL(`/blog/${post.slug}`, origin)}</id><link href="${new URL(`/blog/${post.slug}`, origin)}"/><updated>${post.updatedAt}</updated><summary>${xml(post.excerpt)}</summary></entry>`,
    )
    .join("");
  const body = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>Software Engineering Stagejournaal</title><id>${origin}</id><link href="${new URL("/feed.xml", origin)}" rel="self"/><updated>${posts[0]?.updatedAt ?? new Date().toISOString()}</updated>${items}</feed>`;
  return new Response(body, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
