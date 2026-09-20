import type { MetadataRoute } from "next";
import { listAllPublishedPosts } from "@/data/posts";
import { getSiteUrl } from "@/lib/env";
import { logOperationalError } from "@/lib/operational-log";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const fixed = ["", "/blog", "/about", "/contact"].map((path) => ({
    url: new URL(path || "/", origin).toString(),
    changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "" ? 1 : 0.7,
  }));
  try {
    const posts = await listAllPublishedPosts();
    return [
      ...fixed,
      ...posts.map((post) => ({
        url: new URL(`/blog/${post.slug}`, origin).toString(),
        lastModified: new Date(post.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ];
  } catch (error) {
    logOperationalError("sitemap post retrieval", error);
    return fixed;
  }
}
