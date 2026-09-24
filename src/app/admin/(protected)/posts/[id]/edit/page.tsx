import { notFound } from "next/navigation";
import { PostForm } from "@/components/admin/PostForm";
import { getPostById } from "@/data/posts";
import { isMediaConfigured } from "@/media/config";
import { requireAdminPage } from "@/auth/require-admin";
export const dynamic = "force-dynamic";
export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const post = await getPostById((await params).id);
  if (!post) notFound();
  return (
    <div className="admin-main">
      <div className="admin-heading">
        <div>
          <p className="kicker">CMS</p>
          <h1>Blogpost bewerken</h1>
          <p>Bij het opslaan wordt de inhoud gecontroleerd en opgeschoond.</p>
        </div>
      </div>
      <PostForm post={post} mediaConfigured={isMediaConfigured()} />
    </div>
  );
}
