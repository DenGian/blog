import { notFound } from "next/navigation";
import { getPostById } from "@/data/posts";
import { requireAdminPage } from "@/auth/require-admin";
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
        <h1>{post.title}</h1>
        <p className="lead">{post.excerpt}</p>
      </header>
      <div
        className="article-content shell narrow"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
