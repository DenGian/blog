import { PostForm } from "@/components/admin/PostForm";
import { isMediaConfigured } from "@/media/config";
import { requireAdminPage } from "@/auth/require-admin";
export default async function NewPostPage() {
  await requireAdminPage();
  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="kicker">CMS</p>
          <h1>Nieuw artikel</h1>
          <p>Nieuwe artikelen starten veilig als concept.</p>
        </div>
      </div>
      <PostForm mediaConfigured={isMediaConfigured()} />
    </div>
  );
}
