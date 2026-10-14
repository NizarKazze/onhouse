"use client";

import { useId, useRef, useState } from "react";
import { AdminApiError, adminApi } from "@/components/admin/adminApi";
import { buttonGhost, inputClass } from "@/components/admin/ui";

/** Files above this are shrunk in the browser first: hosting platforms cap
 * request bodies (Vercel: 4.5 MB) and phone photos are often 5–12 MB. */
const DIRECT_UPLOAD_LIMIT = 3.5 * 1024 * 1024;
/** Longest side and quality tried in order when shrinking. */
const STEPS: [number, number][] = [
  [2560, 0.88],
  [2048, 0.8],
  [1600, 0.72],
  [1280, 0.65],
];
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** Event photos: the server crops them to exactly this size. */
const EVENT_SIZE: [number, number] = [1920, 1080];

class TooLargeError extends Error {}

/**
 * Downscale/re-encode in steps until the image fits under the upload limit.
 * With `cover`, the image is centre-cropped to that exact size instead, so the
 * server never has to upscale a photo the browser already shrank.
 */
async function shrink(file: File, cover?: [number, number]): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  try {
    for (const [side, quality] of STEPS) {
      if (cover) {
        const [w, h] = cover;
        const scale = Math.max(w / bitmap.width, h / bitmap.height);
        const sw = w / scale;
        const sh = h / scale;
        canvas.width = w;
        canvas.height = h;
        context?.drawImage(
          bitmap,
          (bitmap.width - sw) / 2,
          (bitmap.height - sh) / 2,
          sw,
          sh,
          0,
          0,
          w,
          h,
        );
      } else {
        const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        context?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }
      // Some browsers can't encode WebP; the server re-encodes anyway.
      const blob = (await encode("image/webp", quality)) ?? (await encode("image/jpeg", quality));
      if (blob && blob.size <= DIRECT_UPLOAD_LIMIT) return blob;
    }
  } finally {
    bitmap.close();
  }
  throw new TooLargeError();
}

/**
 * Image picker for the admin forms: an "upload" button with a preview, plus
 * the raw URL as a fallback for images hosted elsewhere.
 */
export function ImageField({
  label,
  value,
  onChange,
  error,
  variant = "free",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  /** "event": cropped to 1920x1080 on upload, previewed at 16:9. */
  variant?: "free" | "event";
}) {
  const isEvent = variant === "event";
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrl, setShowUrl] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo no es una imagen.");
      return;
    }
    setUploading(true);
    try {
      const body =
        file.size > DIRECT_UPLOAD_LIMIT
          ? await shrink(file, isEvent ? EVENT_SIZE : undefined)
          : file;
      onChange(await adminApi.uploadImage(body, file.name, variant));
    } catch (err) {
      setUploadError(
        err instanceof TooLargeError
          ? "La imagen es demasiado pesada incluso reducida. Prueba con otra foto."
          : err instanceof AdminApiError
          ? err.details[0]?.message
            ? `${err.message} (${err.details[0].message})`
            : err.message
          : "No se pudo procesar la imagen. Prueba con un JPG o PNG.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const message = uploadError ?? error;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.6)] uppercase">
        {label}
      </span>

      <div className="flex flex-wrap items-start gap-4">
        <div className={`relative flex ${isEvent ? "h-[90px] w-[160px]" : "h-[120px] w-[96px]"} shrink-0 items-center justify-center overflow-hidden border border-[var(--onh-line)] bg-onh-panel`}>
          {value ? (
            // Plain <img>: an admin preview of an arbitrary URL, not site imagery.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Vista previa" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-[10px] tracking-[0.15em] text-[rgba(242,240,238,.4)] uppercase">
              Sin imagen
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonGhost}
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Subiendo…" : value ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {value && !uploading && (
              <button type="button" className={buttonGhost} onClick={() => onChange("")}>
                Quitar
              </button>
            )}
          </div>
          <p className="m-0 text-[12px] text-[rgba(242,240,238,.45)]">
            {isEvent
              ? "JPG, PNG, WebP o AVIF. Se recorta al centro y se guarda a 1920x1080 (16:9)."
              : "JPG, PNG, WebP o AVIF. Las fotos grandes se reducen automáticamente."}
          </p>
          <button
            type="button"
            className="w-fit cursor-pointer p-0 text-left text-[12px] text-[rgba(242,240,238,.55)] underline"
            onClick={() => setShowUrl(!showUrl)}
          >
            {showUrl ? "Ocultar URL" : "Usar una URL en su lugar"}
          </button>
          {showUrl && (
            <input
              aria-label={`${label} (URL)`}
              className={inputClass}
              maxLength={500}
              placeholder="https://… o /images/archivo.webp"
              value={value}
              aria-invalid={error ? true : undefined}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </div>
      </div>

      {message && (
        <p role="alert" className="m-0 text-[12px] text-[#ff6b6b]">
          {message}
        </p>
      )}
    </div>
  );
}
