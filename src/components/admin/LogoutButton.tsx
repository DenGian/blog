"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        className="text-button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          const response = await fetch("/api/auth/logout", { method: "POST" });
          if (!response.ok) {
            setError("Afmelden is mislukt. Probeer opnieuw.");
            setBusy(false);
            return;
          }
          router.replace("/admin/login");
          router.refresh();
        }}
      >
        {busy ? "Afmelden…" : "Afmelden"}
      </button>
      {error && (
        <span className="form-error" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
