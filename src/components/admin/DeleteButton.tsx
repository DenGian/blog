"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
export function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) setOpen(false);
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled)",
      );
      if (!controls?.length) return;
      const first = controls[0],
        last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, busy]);
  async function remove() {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Verwijderen is mislukt.");
      setBusy(false);
      return;
    }
    router.refresh();
  }
  return (
    <>
      <button
        className="text-button danger-text"
        onClick={() => setOpen(true)}
        disabled={busy}
      >
        Verwijder
      </button>
      {open && (
        <div className="dialog-backdrop">
          <div
            ref={dialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-${id}`}
            className="confirm-dialog"
          >
            <h2 id={`delete-${id}`}>Artikel verwijderen?</h2>
            <p>“{title}” wordt definitief verwijderd.</p>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button
                className="button secondary"
                autoFocus
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Annuleren
              </button>
              <button
                className="button danger"
                onClick={remove}
                disabled={busy}
              >
                {busy ? "Verwijderen…" : "Definitief verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
