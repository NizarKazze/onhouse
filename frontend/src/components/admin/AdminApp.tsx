"use client";

import { useEffect, useState } from "react";
import { AdminApiError, adminApi, setUnauthorizedHandler } from "@/components/admin/adminApi";
import { ArtistsPanel } from "@/components/admin/ArtistsPanel";
import { EventsPanel } from "@/components/admin/EventsPanel";
import { LoginForm } from "@/components/admin/LoginForm";
import { Alert, buttonGhost } from "@/components/admin/ui";

type AuthState =
  | { status: "checking" }
  | { status: "anonymous"; expired?: boolean }
  | { status: "error"; message: string }
  | { status: "authenticated"; username: string };

type Tab = "events" | "artists";

/**
 * The /admin shell. The page itself is public; everything it shows comes from
 * /api/admin/*, which the backend only serves to an authenticated session.
 */
export function AdminApp() {
  const [auth, setAuth] = useState<AuthState>({ status: "checking" });
  const [tab, setTab] = useState<Tab>("events");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => setAuth({ status: "anonymous", expired: true }));
    let cancelled = false;
    adminApi
      .me()
      .then((session) => {
        if (!cancelled) setAuth({ status: "authenticated", username: session.username });
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof AdminApiError && err.status === 401) {
          setAuth({ status: "anonymous" });
        } else {
          setAuth({
            status: "error",
            message: err instanceof AdminApiError ? err.message : "Error inesperado.",
          });
        }
      });
    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await adminApi.logout();
    } catch {
      // The session is dropped client-side regardless; the cookie is HttpOnly
      // and the server-side session expires on its own.
    } finally {
      setLoggingOut(false);
      setAuth({ status: "anonymous" });
    }
  }

  if (auth.status === "checking") {
    return <p className="p-8 text-[rgba(242,240,238,.6)]">Comprobando sesión…</p>;
  }

  if (auth.status === "error") {
    return (
      <div className="mx-auto max-w-[480px] p-8">
        <Alert>{auth.message}</Alert>
        <button
          type="button"
          className={`${buttonGhost} mt-4`}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (auth.status === "anonymous") {
    return (
      <>
        {auth.expired && (
          <div className="mx-auto max-w-[380px] px-4 pt-8">
            <Alert>Tu sesión ha caducado. Vuelve a iniciar sesión.</Alert>
          </div>
        )}
        <LoginForm onLoggedIn={(username) => setAuth({ status: "authenticated", username })} />
      </>
    );
  }

  const tabClass = (active: boolean) =>
    `cursor-pointer border-b-2 px-1 pb-2 text-[12px] font-semibold tracking-[0.2em] uppercase ${
      active ? "border-onh-bone text-onh-bone" : "border-transparent text-[rgba(242,240,238,.5)]"
    }`;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--onh-line)] pb-5">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-[34px] leading-none">ONHOUSE</span>
          <span className="text-[10.5px] font-semibold tracking-[0.24em] text-[rgba(242,240,238,.55)]">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4 text-[13px]">
          <span className="text-[rgba(242,240,238,.6)]">{auth.username}</span>
          <button type="button" className={buttonGhost} onClick={logout} disabled={loggingOut}>
            {loggingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      </header>

      <nav className="flex gap-6" aria-label="Secciones">
        <button type="button" className={tabClass(tab === "events")} onClick={() => setTab("events")}>
          Eventos
        </button>
        <button type="button" className={tabClass(tab === "artists")} onClick={() => setTab("artists")}>
          Artistas
        </button>
      </nav>

      <p className="m-0 text-[12px] text-[rgba(242,240,238,.45)]">
        Los cambios aparecen en la web pública en un minuto como máximo.
      </p>

      {tab === "events" ? <EventsPanel /> : <ArtistsPanel />}
    </div>
  );
}
