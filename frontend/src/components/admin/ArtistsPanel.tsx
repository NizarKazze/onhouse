"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminApiError,
  LINK_PLATFORMS,
  adminApi,
  errorsByField,
  type AdminArtist,
  type ArtistInput,
  type ArtistLink,
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

type Editing = { mode: "create" } | { mode: "edit"; artist: AdminArtist } | null;

export function ArtistsPanel() {
  const [artists, setArtists] = useState<AdminArtist[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<AdminArtist | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setArtists(await adminApi.listArtists());
    } catch (err) {
      setLoadError(err instanceof AdminApiError ? err.message : "No se pudo cargar la lista.");
    }
  }, []);

  useEffect(() => {
    // Initial fetch; setState happens after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await adminApi.deleteArtist(toDelete.id);
      setNotice(`Artista «${toDelete.name}» eliminado.`);
      setToDelete(null);
      await load();
    } catch (err) {
      setDeleteError(err instanceof AdminApiError ? err.message : "No se pudo eliminar.");
    } finally {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <ArtistForm
        initial={editing.mode === "edit" ? editing.artist : null}
        onCancel={() => setEditing(null)}
        onSaved={async (saved, created) => {
          setEditing(null);
          setNotice(`Artista «${saved.name}» ${created ? "creado" : "guardado"}.`);
          await load();
        }}
      />
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[26px] font-black tracking-[-0.02em] uppercase">Artistas</h2>
        <button
          type="button"
          className={buttonSolid}
          onClick={() => {
            setNotice(null);
            setEditing({ mode: "create" });
          }}
        >
          Nuevo artista
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

      {artists === null && !loadError && <p className="text-[rgba(242,240,238,.6)]">Cargando…</p>}
      {artists?.length === 0 && (
        <p className="text-[rgba(242,240,238,.6)]">Todavía no hay artistas.</p>
      )}

      {artists && artists.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--onh-line)] text-[10.5px] tracking-[0.2em] text-[rgba(242,240,238,.55)] uppercase">
                <th className="py-2 pr-3 font-semibold">Orden</th>
                <th className="py-2 pr-3 font-semibold">Nombre</th>
                <th className="py-2 pr-3 font-semibold">Género</th>
                <th className="py-2 pr-3 font-semibold">Eventos</th>
                <th className="py-2 pr-3 font-semibold">Estado</th>
                <th className="py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist.id} className="border-b border-[var(--onh-line)]">
                  <td className="py-3 pr-3 text-[rgba(242,240,238,.6)]">{artist.sortOrder}</td>
                  <td className="py-3 pr-3 font-semibold">{artist.name}</td>
                  <td className="py-3 pr-3">{artist.genre}</td>
                  <td className="py-3 pr-3">{artist.eventIds.length}</td>
                  <td className="py-3 pr-3">
                    <PublishedBadge published={artist.isPublished} />
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      className="cursor-pointer px-2 py-1 text-[12px] underline"
                      onClick={() => {
                        setNotice(null);
                        setEditing({ mode: "edit", artist });
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer px-2 py-1 text-[12px] text-[#ff6b6b] underline"
                      onClick={() => {
                        setDeleteError(null);
                        setToDelete(artist);
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
        title="Eliminar artista"
        confirmLabel="Eliminar"
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void confirmDelete()}
        body={
          <>
            <p className="m-0">
              ¿Seguro que quieres eliminar a <strong>{toDelete?.name}</strong>? Esta acción no se
              puede deshacer.
            </p>
            {toDelete && toDelete.eventIds.length > 0 && (
              <p className="mt-2 mb-0">
                También se quitará del cartel de {toDelete.eventIds.length} evento(s); los
                eventos no se eliminan.
              </p>
            )}
            {deleteError && <p className="mt-2 mb-0 text-[#ff6b6b]">{deleteError}</p>}
          </>
        }
      />
    </section>
  );
}

function ArtistForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: AdminArtist | null;
  onCancel: () => void;
  onSaved: (artist: AdminArtist, created: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [genre, setGenre] = useState(initial?.genre ?? "");
  const [descriptionEn, setDescriptionEn] = useState(initial?.descriptionEn ?? "");
  const [descriptionEs, setDescriptionEs] = useState(initial?.descriptionEs ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? true);
  const [links, setLinks] = useState<ArtistLink[]>(initial?.links ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const unusedPlatform = LINK_PLATFORMS.find(
    (platform) => !links.some((link) => link.platform === platform.value),
  );

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const data: ArtistInput = {
      name: name.trim(),
      genre: genre.trim(),
      descriptionEn: orNull(descriptionEn),
      descriptionEs: orNull(descriptionEs),
      imageUrl: orNull(imageUrl),
      sortOrder: Number.parseInt(sortOrder, 10) || 0,
      isPublished,
      links: links
        .map((link) => ({ ...link, url: link.url.trim() }))
        .filter((link) => link.url),
    };
    try {
      const saved = initial
        ? await adminApi.updateArtist(initial.id, data)
        : await adminApi.createArtist(data);
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
    <form onSubmit={submit} className="flex max-w-[760px] flex-col gap-5" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[26px] font-black tracking-[-0.02em] uppercase">
          {initial ? `Editar: ${initial.name}` : "Nuevo artista"}
        </h2>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre *" htmlFor="artist-name" error={fieldErrors.name}>
          <input
            id="artist-name"
            className={inputClass}
            required
            maxLength={120}
            value={name}
            aria-invalid={invalid("name")}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Género *" htmlFor="artist-genre" error={fieldErrors.genre} hint="Ej.: DEEP HOUSE">
          <input
            id="artist-genre"
            className={inputClass}
            required
            maxLength={80}
            value={genre}
            aria-invalid={invalid("genre")}
            onChange={(e) => setGenre(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Descripción (EN)" htmlFor="artist-desc-en" error={fieldErrors.descriptionEn}>
        <textarea
          id="artist-desc-en"
          className={`${inputClass} min-h-[96px]`}
          maxLength={5000}
          value={descriptionEn}
          aria-invalid={invalid("descriptionEn")}
          onChange={(e) => setDescriptionEn(e.target.value)}
        />
      </Field>
      <Field label="Descripción (ES)" htmlFor="artist-desc-es" error={fieldErrors.descriptionEs}>
        <textarea
          id="artist-desc-es"
          className={`${inputClass} min-h-[96px]`}
          maxLength={5000}
          value={descriptionEs}
          aria-invalid={invalid("descriptionEs")}
          onChange={(e) => setDescriptionEs(e.target.value)}
        />
      </Field>

      <ImageField
        label="Foto"
        value={imageUrl}
        onChange={setImageUrl}
        error={fieldErrors.imageUrl}
      />

      <div className="grid gap-5 sm:grid-cols-[140px]">
        <Field label="Orden" htmlFor="artist-order" error={fieldErrors.sortOrder}>
          <input
            id="artist-order"
            type="number"
            min={0}
            max={10000}
            className={inputClass}
            value={sortOrder}
            aria-invalid={invalid("sortOrder")}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-3 border border-[var(--onh-line)] p-4">
        <legend className="px-1 text-[10.5px] font-semibold tracking-[0.2em] text-[rgba(242,240,238,.6)] uppercase">
          Redes y enlaces
        </legend>
        {fieldErrors.links && <p className="m-0 text-[12px] text-[#ff6b6b]">{fieldErrors.links}</p>}
        {links.length === 0 && (
          <p className="m-0 text-[13px] text-[rgba(242,240,238,.5)]">Sin enlaces.</p>
        )}
        {links.map((link, index) => (
          <div key={index} className="flex flex-wrap gap-2">
            <select
              aria-label="Plataforma"
              className={`${inputClass} w-auto`}
              value={link.platform}
              onChange={(e) =>
                setLinks(
                  links.map((item, i) =>
                    i === index ? { ...item, platform: e.target.value as ArtistLink["platform"] } : item,
                  ),
                )
              }
            >
              {LINK_PLATFORMS.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
            <input
              aria-label="URL"
              className={`${inputClass} min-w-[200px] flex-1`}
              placeholder="https://"
              maxLength={500}
              value={link.url}
              onChange={(e) =>
                setLinks(links.map((item, i) => (i === index ? { ...item, url: e.target.value } : item)))
              }
            />
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setLinks(links.filter((_, i) => i !== index))}
            >
              Quitar
            </button>
          </div>
        ))}
        {unusedPlatform && (
          <div>
            <button
              type="button"
              className={buttonGhost}
              onClick={() => setLinks([...links, { platform: unusedPlatform.value, url: "" }])}
            >
              Añadir enlace
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
          {busy ? "Guardando…" : initial ? "Guardar cambios" : "Crear artista"}
        </button>
        <button type="button" className={buttonGhost} onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
