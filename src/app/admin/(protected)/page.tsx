import Link from "next/link";
import { listAllPosts } from "@/data/posts";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { requireAdminPage } from "@/auth/require-admin";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  await requireAdminPage();
  const posts = await listAllPosts().catch(() => []);
  const drafts = posts.filter((post) => post.status === "draft").length;
  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="kicker">Contentoverzicht</p>
          <h1>Dashboard</h1>
          <p>
            {posts.length} artikelen · {drafts} concepten ·{" "}
            {posts.length - drafts} gepubliceerd
          </p>
        </div>
        <Link className="button primary" href="/admin/posts/new">
          Nieuw artikel
        </Link>
      </div>
      {posts.length ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Artikel</th>
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
          <h2>Nog geen artikelen</h2>
          <p>Maak eerst een concept aan.</p>
        </div>
      )}
    </div>
  );
}
