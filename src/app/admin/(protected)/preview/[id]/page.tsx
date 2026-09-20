import { notFound } from "next/navigation";
import { getPostById } from "@/data/posts";
import { requireAdminPage } from "@/auth/require-admin";
import { CoverImage } from "@/components/posts/CoverImage";
export const dynamic = "force-dynamic";
export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const post = await getPostById((await params).id);
  if (!post) notFound();
  return (
    <article className="article">
      <div className="preview-banner">
        Beveiligd voorbeeld ·{" "}
        {post.status === "draft" ? "concept" : "gepubliceerd"}
      </div>
      <header className="article-header shell narrow">
        <ul className="tag-list" aria-label="Onderwerpen">
          {post.tags.map((tag) => (
            <li key={tag}>
              <span>{tag}</span>
            </li>
          ))}
        </ul>
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
        <div className="article-meta">
          <span>Door Ian Mondelaers</span>
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
    </article>
  );
}
