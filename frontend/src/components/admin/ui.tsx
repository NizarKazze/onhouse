"use client";

import { useEffect, useRef } from "react";

/** Small, unstyled-by-default building blocks for the admin forms. */

export const inputClass =
  "w-full border border-[var(--onh-line)] bg-onh-black px-3 py-2.5 text-[14px] text-onh-bone outline-none transition-colors focus:border-onh-bone aria-[invalid=true]:border-[#ff6b6b]";

export const buttonSolid =
  "onh-btn-solid cursor-pointer px-5 py-3 text-[11px] disabled:cursor-wait disabled:opacity-50";
export const buttonGhost =
  "onh-btn-ghost cursor-pointer px-5 py-3 text-[11px] disabled:cursor-wait disabled:opacity-50";
export const buttonDanger =
  "cursor-pointer border border-[#ff6b6b] px-5 py-3 text-[11px] font-semibold tracking-[0.18em] text-[#ff6b6b] uppercase transition-colors hover:bg-[#ff6b6b] hover:text-onh-black disabled:cursor-wait disabled:opacity-50";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[10.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.6)] uppercase"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="m-0 text-[12px] text-[rgba(242,240,238,.45)]">{hint}</p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="m-0 text-[12px] text-[#ff6b6b]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success";
  children: React.ReactNode;
}) {
  const color =
    tone === "error"
      ? "border-[#ff6b6b] text-[#ff6b6b]"
      : "border-[#7bd88f] text-[#7bd88f]";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`border px-4 py-3 text-[13px] ${color}`}>
      {children}
    </div>
  );
}

/** Modal confirmation built on <dialog>: focus-trapped and Esc-closable. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      className="m-auto max-w-[440px] border border-[var(--onh-line)] bg-onh-black p-0 text-onh-bone backdrop:bg-[rgba(0,0,0,.7)]"
    >
      <div className="flex flex-col gap-5 p-6">
        <h2 className="m-0 text-[20px] font-black tracking-[-0.01em] uppercase">{title}</h2>
        <div className="text-[14px] leading-[1.6] text-[rgba(242,240,238,.75)]">{body}</div>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className={buttonGhost} onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button type="button" className={buttonDanger} onClick={onConfirm} disabled={busy}>
            {busy ? "Eliminando…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-[10px] font-semibold tracking-[0.18em] uppercase ${
        published
          ? "border-[rgba(242,240,238,.35)] text-[rgba(242,240,238,.75)]"
          : "border-dashed border-[rgba(242,240,238,.25)] text-[rgba(242,240,238,.45)]"
      }`}
    >
      {published ? "Publicado" : "Borrador"}
    </span>
  );
}

/** "" → null, so optional fields are sent as absent rather than empty. */
export function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
