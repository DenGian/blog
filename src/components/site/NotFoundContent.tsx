import Link from "next/link";

export function NotFoundContent() {
  return (
    <section className="section shell narrow empty-state">
      <p className="kicker">404</p>
      <h1>Deze pagina bestaat niet.</h1>
      <p>
        De link kan verouderd zijn, of de blogpost is nog niet gepubliceerd.
      </p>
      <Link className="button primary" href="/blog">
        Naar de blog
      </Link>
    </section>
  );
}
