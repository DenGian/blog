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
          <h1>Nieuwe blogpost</h1>
          <p>Nieuwe blogposts worden eerst als concept opgeslagen.</p>
        </div>
      </div>
      <PostForm mediaConfigured={isMediaConfigured()} />
    </div>
  );
}
