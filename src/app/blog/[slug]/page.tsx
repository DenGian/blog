import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/posts/CoverImage";
import { Comments } from "@/components/posts/Comments";
import { getAdjacentPosts, getPublishedPost } from "@/data/posts";
import { getSiteUrl } from "@/lib/env";
import { logOperationalError } from "@/lib/operational-log";
export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug).catch((error) => {
    logOperationalError("article metadata retrieval", error);
    return null;
  });
  if (!post) notFound();
  const path = `/blog/${post.slug}`;
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      url: path,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: post.coverImage
        ? [{ url: post.coverImage, alt: post.title }]
        : undefined,
    },
  };
}
export default async function ArticlePage({ params }: Props) {
  const slug = (await params).slug;
  const post = await getPublishedPost(slug).catch((error) => {
    logOperationalError("article retrieval", error);
    return null;
  });
  if (!post) notFound();
  const adjacent = await getAdjacentPosts(post).catch((error) => {
    logOperationalError("adjacent article retrieval", error);
    return { previous: null, next: null };
  });
  const published = new Intl.DateTimeFormat("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.publishedAt ?? post.createdAt));
  const updated =
    new Date(post.updatedAt).getTime() >
    new Date(post.publishedAt ?? post.createdAt).getTime() + 86_400_000
      ? new Intl.DateTimeFormat("nl-BE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(post.updatedAt))
      : null;
  const structured = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { "@type": "Person", name: "Ian Mondelaers" },
    mainEntityOfPage: new URL(`/blog/${post.slug}`, getSiteUrl()).toString(),
    image: post.coverImage ?? undefined,
  }).replace(/</g, "\\u003c");
  return (
    <article className="article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structured }}
      />
      <header className="article-header shell narrow">
        <Link className="back-link" href="/blog">
          ← Alle artikelen
        </Link>
        <ul className="tag-list">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/blog?tag=${encodeURIComponent(tag)}`}>{tag}</Link>
            </li>
          ))}
        </ul>
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
        <div className="article-meta">
          <span>Door Ian Mondelaers</span>
          <time dateTime={post.publishedAt ?? post.createdAt}>{published}</time>
          {updated && <span>Bijgewerkt {updated}</span>}
          <span>{post.readingTime} min. leestijd</span>
        </div>
      </header>
      <div className="article-cover shell">
        <CoverImage src={post.coverImage} alt={post.title} priority />
      </div>
      <div
        className="article-content shell narrow"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      <nav
        className="article-nav shell narrow"
        aria-label="Vorige en volgende artikel"
      >
        <div>
          {adjacent.previous && (
            <>
              <small>Vorige</small>
              <Link href={`/blog/${adjacent.previous.slug}`}>
                {adjacent.previous.title}
              </Link>
            </>
          )}
        </div>
        <div>
          {adjacent.next && (
            <>
              <small>Volgende</small>
              <Link href={`/blog/${adjacent.next.slug}`}>
                {adjacent.next.title}
              </Link>
            </>
          )}
        </div>
      </nav>
      <div className="shell narrow">
        <Comments />
      </div>
    </article>
  );
}
