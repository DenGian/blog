import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="admin-page">
      <div className="admin-card">
        <p className="kicker">404</p>
        <h1>Pagina niet gevonden</h1>
        <p>Deze beheerpagina bestaat niet.</p>
        <Link className="button secondary" href="/admin/login">
          Naar aanmelden
        </Link>
      </div>
    </section>
  );
}
