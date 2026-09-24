import Link from "next/link";
import { listAllPosts } from "@/data/posts";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { requireAdminPage } from "@/auth/require-admin";
import { logOperationalError } from "@/lib/operational-log";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  await requireAdminPage();
  let posts;
  try {
    posts = await listAllPosts();
  } catch (error) {
    logOperationalError("admin post retrieval", error);
    const unavailable =
      error instanceof Error && error.message === "Database connection failed.";
    return (
      <div className="admin-main">
        <div className="empty-state" role="alert">
          <h1>
            {unavailable
              ? "Database tijdelijk niet bereikbaar"
              : "Blogposts konden niet worden geladen"}
          </h1>
          <p>
            {unavailable
              ? "De inhoudsservice reageert momenteel niet."
              : "Er trad een onverwachte fout op bij het ophalen van de blogposts."}{" "}
            Probeer het later opnieuw.
          </p>
        </div>
      </div>
    );
  }
  const drafts = posts.filter((post) => post.status === "draft").length;
  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="kicker">Contentoverzicht</p>
          <h1>Dashboard</h1>
          <p>
            {posts.length} blogposts · {drafts} concepten ·{" "}
            {posts.length - drafts} gepubliceerd
          </p>
        </div>
        <Link className="button primary" href="/admin/posts/new">
          Nieuwe blogpost
        </Link>
      </div>
      {posts.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Blogpost</th>
                <th>Status</th>
                <th>Bijgewerkt</th>
                <th>
                  <span className="sr-only">Acties</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <small>/{post.slug}</small>
                  </td>
                  <td>
                    <span className={`status ${post.status}`}>
                      {post.status === "published" ? "Gepubliceerd" : "Concept"}
                      {post.legacy && " · legacy"}
                    </span>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("nl-BE").format(
                      new Date(post.updatedAt),
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      {post.status === "published" ? (
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          Bekijk
                        </Link>
                      ) : (
                        <Link
                          href={`/admin/preview/${post.id}`}
                          target="_blank"
                        >
                          Voorbeeld
                        </Link>
                      )}
                      <Link href={`/admin/posts/${post.id}/edit`}>Bewerk</Link>
                      <DeleteButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h2>Nog geen blogposts</h2>
          <p>Maak eerst een concept aan.</p>
        </div>
      )}
    </div>
  );
}
