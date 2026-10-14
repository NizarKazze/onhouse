"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminApiError,
  adminApi,
  errorsByField,
  type AdminArtist,
  type AdminEvent,
  type EventInput,
} from "@/components/admin/adminApi";
import { ImageField } from "@/components/admin/ImageField";
import {
  Alert,
  ConfirmDialog,
  Field,
  PublishedBadge,
  buttonGhost,
  buttonSolid,
  inputClass,
  orNull,
} from "@/components/admin/ui";

type Editing = { mode: "create" } | { mode: "edit"; event: AdminEvent } | null;

const STATUS_LABEL: Record<AdminEvent["status"], string> = {
  next: "Próximo (destacado)",
  upcoming: "Por venir",
  past: "Pasado",
};

const pad3 = (n: number) => String(n).padStart(3, "0");

export function EventsPanel() {
  const [events, setEvents] = useState<AdminEvent[] | null>(null);
  const [artists, setArtists] = useState<AdminArtist[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<AdminEvent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [eventList, artistList] = await Promise.all([
        adminApi.listEvents(),
        adminApi.listArtists(),
      ]);
      setEvents(eventList);
      setArtists(artistList);
    } catch (err) {
      setLoadError(err instanceof AdminApiError ? err.message : "No se pudo cargar la lista.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteEvent(toDelete.id);
      setNotice(`Evento «${toDelete.title}» eliminado.`);
      setToDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof AdminApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    const nextNumber = Math.max(0, ...(events ?? []).map((event) => event.number)) + 1;
    return (
      <EventForm
        initial={editing.mode === "edit" ? editing.event : null}
        suggestedNumber={nextNumber}
        artists={artists}
        onCancel={() => setEditing(null)}
        onSaved={async (saved, created) => {
          setEditing(null);
          setNotice(`Evento «${saved.title}» ${created ? "creado" : "guardado"}.`);
          await load();
        }}
      />
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[26px] font-black tracking-[-0.02em] uppercase">Eventos</h2>
        <button
          type="button"
          className={buttonSolid}
          disabled={events === null}
          onClick={() => {
            setNotice(null);
            setEditing({ mode: "create" });
          }}
        >
          Nuevo evento
        </button>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {loadError && (
        <Alert>
          {loadError}{" "}
          <button type="button" className="cursor-pointer underline" onClick={() => void load()}>
            Reintentar
          </button>
        </Alert>
      )}

      {events === null && !loadError && <p className="text-[rgba(242,240,238,.6)]">Cargando…</p>}
      {events?.length === 0 && (
        <p className="text-[rgba(242,240,238,.6)]">Todavía no hay eventos.</p>
      )}

      {events && events.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--onh-line)] text-[10.5px] tracking-[0.2em] text-[rgba(242,240,238,.55)] uppercase">
                <th className="py-2 pr-3 font-semibold">Nº</th>
                <th className="py-2 pr-3 font-semibold">Título</th>
                <th className="py-2 pr-3 font-semibold">Fecha</th>
                <th className="py-2 pr-3 font-semibold">Sala</th>
                <th className="py-2 pr-3 font-semibold">Cartel</th>
                <th className="py-2 pr-3 font-semibold">Estado</th>
                <th className="py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-[var(--onh-line)] align-top">
                  <td className="py-3 pr-3 text-[rgba(242,240,238,.6)]">{pad3(event.number)}</td>
                  <td className="py-3 pr-3 font-semibold">{event.title}</td>
                  <td className="py-3 pr-3">{event.date ?? "TBA"}</td>
                  <td className="py-3 pr-3">{event.venue ?? "TBA"}</td>
                  <td className="py-3 pr-3">{event.artists.length}</td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-col items-start gap-1">
                      <PublishedBadge published={event.isPublished} />
                      <span className="text-[12px] text-[rgba(242,240,238,.55)]">
                        {STATUS_LABEL[event.status]}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="cursor-pointer px-2 py-1 text-[12px] underline"
                      onClick={() => {
                        setNotice(null);
                        setEditing({ mode: "edit", event });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer px-2 py-1 text-[12px] text-[#ff6b6b] underline"
                      onClick={() => {
                        setDeleteError(null);
                        setToDelete(event);
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="Eliminar evento"
        confirmLabel="Eliminar"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        body={
          <>
            <p className="m-0">
              ¿Seguro que quieres eliminar <strong>{toDelete?.title}</strong>? Esta acción no se
              puede deshacer. Los artistas del cartel no se eliminan.
            </p>
            {deleteError && <p className="mt-2 mb-0 text-[#ff6b6b]">{deleteError}</p>}
          </>
        }
      />
    </section>
  );
}

function EventForm({
  initial,
  suggestedNumber,
  artists,
  onCancel,
  onSaved,
}: {
  initial: AdminEvent | null;
  suggestedNumber: number;
  artists: AdminArtist[];
  onCancel: () => void;
  onSaved: (event: AdminEvent, created: boolean) => void;
}) {
  const [number, setNumber] = useState(String(initial?.number ?? suggestedNumber));
  const [title, setTitle] = useState(initial?.title ?? `ONHOUSE ${pad3(suggestedNumber)}`);
  const [city, setCity] = useState(initial?.city ?? "IBIZA");
  const [venue, setVenue] = useState(initial?.venue ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [doorsOpen, setDoorsOpen] = useState(initial?.doorsOpen ?? "23:59");
  const [doorsClose, setDoorsClose] = useState(initial?.doorsClose ?? "06:00");
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? "");
  const [descriptionEs, setDescriptionEs] = useState(initial?.descriptionEs ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [ticketUrl, setTicketUrl] = useState(initial?.ticketUrl ?? "");
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [lineup, setLineup] = useState<number[]>(initial?.artists.map((a) => a.id) ?? []);
  const [toAdd, setToAdd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const byId = new Map(artists.map((artist) => [artist.id, artist]));
  const available = artists.filter((artist) => !lineup.includes(artist.id));

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= lineup.length) return;
    const next = [...lineup];
    [next[index], next[target]] = [next[target], next[index]];
    setLineup(next);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const data: EventInput = {
      number: Number.parseInt(number, 10),
      title: title.trim(),
      city: city.trim(),
      venue: orNull(venue),
      date: orNull(date),
      doorsOpen: orNull(doorsOpen),
      doorsClose: orNull(doorsClose),
      descriptionEn: descriptionEn.trim(),
      descriptionEs: descriptionEs.trim(),
      imageUrl: orNull(imageUrl),
      ticketUrl: orNull(ticketUrl),
      isPublished,
      artistIds: lineup,
    };
    try {
      const saved = initial
        ? await adminApi.updateEvent(initial.id, data)
        : await adminApi.createEvent(data);
      onSaved(saved, !initial);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : "No se pudo guardar.");
      setFieldErrors(errorsByField(err));
    } finally {
      setBusy(false);
    }
  }

  const invalid = (field: string) => (fieldErrors[field] ? true : undefined);

  return (
    <form onSubmit={submit} className="flex max-w-[860px] flex-col gap-5" noValidate>
      <h2 className="m-0 text-[26px] font-black tracking-[-0.02em] uppercase">
        {initial ? `Editar: ${initial.title}` : "Nuevo evento"}
      </h2>

      {error && <Alert>{error}</Alert>}

      <div className="grid gap-5 sm:grid-cols-[120px_1fr_1fr]">
        <Field label="Número *" htmlFor="event-number" error={fieldErrors.number}>
          <input
            id="event-number"
            type="number"
            min={1}
            max={9999}
            required
            className={inputClass}
            value={number}
            aria-invalid={invalid("number")}
            onChange={(e) => setNumber(e.target.value)}
          />
        </Field>
        <Field label="Título *" htmlFor="event-title" error={fieldErrors.title}>
          <input
            id="event-title"
            required
            maxLength={120}
            className={inputClass}
            value={title}
            aria-invalid={invalid("title")}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label="Ciudad *" htmlFor="event-city" error={fieldErrors.city}>
          <input
            id="event-city"
            required
            maxLength={80}
            className={inputClass}
            value={city}
            aria-invalid={invalid("city")}
            onChange={(e) => setCity(e.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <Field label="Sala" htmlFor="event-venue" error={fieldErrors.venue} hint="Vacío = TBA">
          <input
            id="event-venue"
            maxLength={120}
            className={inputClass}
            value={venue}
            aria-invalid={invalid("venue")}
            onChange={(e) => setVenue(e.target.value)}
          />
        </Field>
        <Field label="Fecha" htmlFor="event-date" error={fieldErrors.date} hint="Vacío = TBA">
          <input
            id="event-date"
            type="date"
            className={inputClass}
            value={date}
            aria-invalid={invalid("date")}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label="Apertura" htmlFor="event-open" error={fieldErrors.doorsOpen}>
          <input
            id="event-open"
            type="time"
            className={inputClass}
            value={doorsOpen}
            aria-invalid={invalid("doorsOpen")}
            onChange={(e) => setDoorsOpen(e.target.value)}
          />
        </Field>
        <Field
          label="Cierre"
          htmlFor="event-close"
          error={fieldErrors.doorsClose}
          hint="Antes de la apertura = día siguiente"
        >
          <input
            id="event-close"
            type="time"
            className={inputClass}
            value={doorsClose}
            aria-invalid={invalid("doorsClose")}
            onChange={(e) => setDoorsClose(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Descripción (EN) *" htmlFor="event-desc-en" error={fieldErrors.descriptionEn}>
        <textarea
          id="event-desc-en"
          required
          maxLength={5000}
          className={`${inputClass} min-h-[96px]`}
          value={descriptionEn}
          aria-invalid={invalid("descriptionEn")}
          onChange={(e) => setDescriptionEn(e.target.value)}
        />
      </Field>
      <Field label="Descripción (ES) *" htmlFor="event-desc-es" error={fieldErrors.descriptionEs}>
        <textarea
          id="event-desc-es"
          required
          maxLength={5000}
          className={`${inputClass} min-h-[96px]`}
          value={descriptionEs}
          aria-invalid={invalid("descriptionEs")}
          onChange={(e) => setDescriptionEs(e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageField
          label="Póster"
          variant="event"
          value={imageUrl}
          onChange={setImageUrl}
          error={fieldErrors.imageUrl}
        />
        <Field
          label="Enlace de entradas"
          htmlFor="event-tickets"
          error={fieldErrors.ticketUrl}
          hint="Vacío = el botón lleva a Contacto"
        >
          <input
            id="event-tickets"
            maxLength={500}
            placeholder="https://"
            className={inputClass}
            value={ticketUrl}
            aria-invalid={invalid("ticketUrl")}
            onChange={(e) => setTicketUrl(e.target.value)}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3 border border-[var(--onh-line)] p-4">
        <legend className="px-1 text-[10.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.6)] uppercase">
          Cartel (en orden)
        </legend>
        {fieldErrors.artistIds && (
          <p className="m-0 text-[12px] text-[#ff6b6b]">{fieldErrors.artistIds}</p>
        )}
        {lineup.length === 0 && (
          <p className="m-0 text-[13px] text-[rgba(242,240,238,.5)]">Sin artistas (se muestra TBA).</p>
        )}
        <ol className="m-0 flex list-none flex-col gap-2 p-0">
          {lineup.map((artistId, index) => {
            const artist = byId.get(artistId);
            return (
              <li
                key={artistId}
                className="flex flex-wrap items-center gap-2 border border-[var(--onh-line)] px-3 py-2"
              >
                <span className="w-6 text-[rgba(242,240,238,.5)]">{index + 1}.</span>
                <span className="flex-1 font-semibold">
                  {artist ? `${artist.name} · ${artist.genre}` : `Artista #${artistId}`}
                  {artist && !artist.isPublished && (
                    <span className="ml-2 text-[12px] font-normal text-[rgba(242,240,238,.5)]">
                      (borrador, no se muestra)
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  aria-label="Subir"
                  className="cursor-pointer px-2"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Bajar"
                  className="cursor-pointer px-2"
                  disabled={index === lineup.length - 1}
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="cursor-pointer px-2 text-[12px] text-[#ff6b6b] underline"
                  onClick={() => setLineup(lineup.filter((id) => id !== artistId))}
                >
                  Quitar
                </button>
              </li>
            );
          })}
        </ol>
        {available.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Artista a añadir"
              className={`${inputClass} w-auto min-w-[220px]`}
              value={toAdd}
              onChange={(e) => setToAdd(e.target.value)}
            >
              <option value="">Elige un artista…</option>
              {available.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name} · {artist.genre} (#{artist.id})
                </option>
              ))}
            </select>
            <button
              type="button"
              className={buttonGhost}
              disabled={!toAdd}
              onClick={() => {
                setLineup([...lineup, Number(toAdd)]);
                setToAdd("");
              }}
            >
              Añadir al cartel
            </button>
          </div>
        )}
      </fieldset>

      <label className="flex items-center gap-3 text-[14px]">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
        />
        Publicado (visible en la web)
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonSolid} disabled={busy}>
          {busy ? "Guardando…" : initial ? "Guardar cambios" : "Crear evento"}
        </button>
        <button type="button" className={buttonGhost} onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
