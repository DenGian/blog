import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/auth/session";
import { LogoutButton } from "@/components/admin/LogoutButton";
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <section className="admin-shell">
      <header className="admin-nav">
        <Link href="/admin">
          <strong>Blogbeheer</strong>
        </Link>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/posts/new">Nieuwe blogpost</Link>
          <LogoutButton />
        </nav>
      </header>
      {children}
    </section>
  );
}
