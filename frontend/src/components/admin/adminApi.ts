/**
 * Browser-side client for the admin API.
 *
 * Calls go to this site's own `/api/*` (proxied to the backend), so the
 * HttpOnly session cookie travels automatically and is never readable here.
 * The CSRF token lives only in memory and is sent on every write.
 */

export type LinkPlatform =
  | "instagram"
  | "soundcloud"
  | "spotify"
  | "resident_advisor"
  | "beatport"
  | "youtube"
  | "tiktok"
  | "website";

export const LINK_PLATFORMS: { value: LinkPlatform; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "spotify", label: "Spotify" },
  { value: "resident_advisor", label: "Resident Advisor" },
  { value: "beatport", label: "Beatport" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Web" },
];

export type ArtistLink = { platform: LinkPlatform; url: string };

export type AdminArtist = {
  id: number;
  name: string;
  genre: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
  links: ArtistLink[];
  eventIds: number[];
  createdAt: string;
  updatedAt: string;
};

export type ArtistInput = Omit<AdminArtist, "id" | "eventIds" | "createdAt" | "updatedAt">;

export type AdminEvent = {
  id: number;
  number: number;
  title: string;
  city: string;
  venue: string | null;
  date: string | null;
  doorsOpen: string | null;
  doorsClose: string | null;
  descriptionEn: string;
  descriptionEs: string;
  imageUrl: string | null;
  ticketUrl: string | null;
  isPublished: boolean;
  status: "next" | "upcoming" | "past";
  artists: { id: number; name: string; genre: string }[];
  createdAt: string;
  updatedAt: string;
};

export type EventInput = Omit<
  AdminEvent,
  "id" | "status" | "artists" | "createdAt" | "updatedAt"
> & { artistIds: number[] };

export type FieldError = { field: string; message: string };

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly details: FieldError[] = [],
  ) {
    super(message);
  }
}

let csrfToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called when any request finds the session gone (expired or revoked). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Usuario o contraseña incorrectos.",
  too_many_attempts: "Demasiados intentos fallidos. Espera unos minutos y vuelve a probar.",
  rate_limited: "Demasiadas peticiones. Espera un momento.",
  unauthorized: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
  csrf_failed: "La sesión no es válida. Recarga la página.",
  forbidden: "Operación no permitida.",
  not_found: "El elemento ya no existe. Recarga la lista.",
  conflict: "Ya existe un elemento con esos datos.",
  validation_error: "Revisa los campos marcados.",
  payload_too_large: "El archivo o el contenido es demasiado grande.",
  storage_unavailable: "No se pudo guardar la imagen. Inténtalo de nuevo o usa una URL.",
  internal_error: "Error del servidor. Inténtalo de nuevo.",
};

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  // FormData sets its own multipart Content-Type (with the boundary).
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new AdminApiError("No se puede conectar con el servidor.", 0, "network_error");
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON (e.g. a proxy error page) — handled below as a generic error.
  }

  if (!response.ok) {
    const error = (payload as { error?: { code?: string; message?: string; details?: FieldError[] } })
      ?.error;
    const code = error?.code ?? "http_error";
    if (response.status === 401 && path !== "/admin/auth/login") {
      csrfToken = null;
      onUnauthorized?.();
    }
    const message =
      MESSAGES[code] ??
      (response.status >= 500 ? MESSAGES.internal_error : error?.message ?? "Error inesperado.");
    throw new AdminApiError(message, response.status, code, error?.details ?? []);
  }
  return payload as T;
}

type Session = { username: string; csrfToken: string };

export const adminApi = {
  async login(username: string, password: string): Promise<Session> {
    const session = await request<Session>("POST", "/admin/auth/login", { username, password });
    csrfToken = session.csrfToken;
    return session;
  },
  async me(): Promise<Session> {
    const session = await request<Session>("GET", "/admin/auth/me");
    csrfToken = session.csrfToken;
    return session;
  },
  async logout(): Promise<void> {
    try {
      await request<void>("POST", "/admin/auth/logout");
    } finally {
      csrfToken = null;
    }
  },

  listArtists: () => request<AdminArtist[]>("GET", "/admin/artists"),
  createArtist: (data: ArtistInput) => request<AdminArtist>("POST", "/admin/artists", data),
  updateArtist: (id: number, data: ArtistInput) =>
    request<AdminArtist>("PUT", `/admin/artists/${id}`, data),
  deleteArtist: (id: number) => request<void>("DELETE", `/admin/artists/${id}`),

  listEvents: () => request<AdminEvent[]>("GET", "/admin/events"),
  createEvent: (data: EventInput) => request<AdminEvent>("POST", "/admin/events", data),
  updateEvent: (id: number, data: EventInput) =>
    request<AdminEvent>("PUT", `/admin/events/${id}`, data),
  deleteEvent: (id: number) => request<void>("DELETE", `/admin/events/${id}`),

  /**
   * Uploads an image; the server re-encodes it and returns the URL to save.
   * "event" images are centre-cropped to exactly 1920x1080.
   */
  async uploadImage(file: Blob, filename: string, variant: "free" | "event" = "free"): Promise<string> {
    const form = new FormData();
    form.append("file", file, filename);
    const { url } = await request<{ url: string }>(
      "POST",
      `/admin/uploads?variant=${variant}`,
      form,
    );
    return url;
  },
};

/** Server validation details keyed by top-level field ("links.0.url" → "links"). */
export function errorsByField(error: unknown): Record<string, string> {
  if (!(error instanceof AdminApiError)) return {};
  const result: Record<string, string> = {};
  for (const detail of error.details) {
    const key = detail.field.split(".")[0];
    if (key && !result[key]) result[key] = detail.message;
  }
  return result;
}
