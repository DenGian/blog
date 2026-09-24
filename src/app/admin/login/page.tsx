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
  let configured = false;
  let configurationError = false;
  let authenticated = false;
  try {
    authenticated = await isAdmin();
    configured = isAuthConfigured();
  } catch {
    configurationError = true;
  }
  if (authenticated) redirect("/admin");
  return (
    <section className="admin-page login-page">
      <div className="admin-card">
        <p className="kicker">Beheer</p>
        <h1>Aanmelden</h1>
        <p>Meld je aan om de artikelen te beheren.</p>
        {configurationError && (
          <p className="notice warning" role="alert">
            Aanmelden is niet beschikbaar. Controleer de beheerinstellingen.
          </p>
        )}
        <LoginForm configured={configured} />
      </div>
    </section>
  );
}
