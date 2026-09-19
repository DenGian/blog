import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/auth/session";
import { isAuthConfigured } from "@/lib/env";
export const metadata: Metadata = {
  title: "Beheer aanmelden",
  robots: { index: false, follow: false },
};
export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <section className="admin-page login-page">
      <div className="admin-card">
        <p className="kicker">Beveiligd beheer</p>
        <h1>Aanmelden</h1>
        <p>Alle beheermutaties worden opnieuw op de server geautoriseerd.</p>
        <LoginForm configured={isAuthConfigured()} />
      </div>
    </section>
  );
}
