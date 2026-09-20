import Link from "next/link";
import type { PostView } from "@/domain/posts/types";
import { CoverImage } from "./CoverImage";
const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
export function PostCard({
  post,
  featured = false,
}: {
  post: PostView;
  featured?: boolean;
}) {
  return (
    <article className={`post-card${featured ? " featured" : ""}`}>
      <Link
        className="card-cover"
        href={`/blog/${post.slug}`}
        tabIndex={-1}
        aria-hidden
      >
        <CoverImage src={post.coverImage} alt={post.title} />
      </Link>
      <div className="card-body">
        <div className="eyebrow">
          <time dateTime={post.publishedAt ?? post.createdAt}>
            {dateFormatter.format(new Date(post.publishedAt ?? post.createdAt))}
          </time>
          <span>{post.readingTime} min.</span>
        </div>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        <ul className="tag-list" aria-label="Onderwerpen">
          {post.tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              <Link href={`/blog?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
