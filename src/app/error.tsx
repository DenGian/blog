"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="section shell narrow empty-state">
      <h1>Er ging iets mis.</h1>
      <p>De pagina kon niet worden geladen. Probeer het gerust opnieuw.</p>
      <button className="button primary" onClick={reset}>
        Opnieuw proberen
      </button>
    </section>
  );
}
