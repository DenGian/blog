"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function DeleteButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function remove() {
    const answer = window.prompt(
      `Typ VERWIJDER om “${title}” definitief te verwijderen.`,
    );
    if (answer !== "VERWIJDER") return;
    setBusy(true);
    const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!response.ok) {
      window.alert("Verwijderen is mislukt.");
      setBusy(false);
      return;
    }
    router.refresh();
  }
  return (
    <button
      className="text-button danger-text"
      onClick={remove}
      disabled={busy}
    >
      {busy ? "Verwijderen…" : "Verwijder"}
    </button>
  );
}
