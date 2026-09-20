"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: data.get("password") }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Aanmelden mislukt.");
      router.replace("/admin");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Aanmelden mislukt.");
      setBusy(false);
    }
  }
  return (
    <form className="admin-form login-form" onSubmit={submit}>
      <div className="field">
        <label htmlFor="password">Beheerderswachtwoord</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          disabled={!configured || busy}
        />
      </div>
      {!configured && (
        <p className="notice warning" role="status">
          Admin-login is lokaal nog niet geconfigureerd. Zie{" "}
          <code>.env.example</code>.
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button primary"
        type="submit"
        disabled={!configured || busy}
      >
        {busy ? "Aanmelden…" : "Veilig aanmelden"}
      </button>
    </form>
  );
}
