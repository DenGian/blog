export default function Loading() {
  return (
    <div className="section shell" aria-live="polite">
      <div className="skeleton wide" />
      <div className="skeleton" />
      <span className="sr-only">Pagina laden…</span>
    </div>
  );
}
