"use client";

import { useState } from "react";
import { AdminApiError, adminApi } from "@/components/admin/adminApi";
import { Alert, Field, buttonSolid, inputClass } from "@/components/admin/ui";

export function LoginForm({ onLoggedIn }: { onLoggedIn: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await adminApi.login(username, password);
      setPassword("");
      onLoggedIn(session.username);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "Error inesperado.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="flex w-full max-w-[380px] flex-col gap-5 border border-[var(--onh-line)] p-8"
      >
        <div>
          <div className="font-display text-[44px] leading-none">ONHOUSE</div>
          <div className="mt-1 text-[10.5px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.55)]">
            PANEL DE ADMINISTRACIÓN
          </div>
        </div>

        {error && <Alert>{error}</Alert>}

        <Field label="Usuario" htmlFor="login-username">
          <input
            id="login-username"
            className={inputClass}
            autoComplete="username"
            required
            maxLength={64}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Field>
        <Field label="Contraseña" htmlFor="login-password">
          <input
            id="login-password"
            type="password"
            className={inputClass}
            autoComplete="current-password"
            required
            maxLength={256}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <button type="submit" className={buttonSolid} disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
