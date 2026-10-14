# ONHOUSE API

Backend for the ONHOUSE website: a public read-only API for events and artists,
and an authenticated admin API used by the `/admin` panel of the Next.js site.

**Stack:** Python 3.12+ · FastAPI · SQLAlchemy 2 · Alembic · PostgreSQL 14+ (psycopg 3) ·
Pydantic v2 · Argon2id.

```
backend/
├── app/
│   ├── main.py            # app factory, middleware, routers
│   ├── config.py          # settings from env vars (+ production guards)
│   ├── db.py              # engine / sessions (TLS, serverless pool option)
│   ├── models.py          # ORM models
│   ├── errors.py          # centralised JSON error envelope
│   ├── middleware.py      # security headers, body limit, rate limit
│   ├── cli.py             # create-admin, set-password, seed
│   ├── routers/           # public.py, auth.py, admin.py
│   ├── schemas/           # request/response validation (Pydantic)
│   ├── security/          # passwords, sessions+CSRF, login throttle, deps
│   └── services/          # queries, serialisation, derived schedule/status
├── migrations/            # Alembic (the schema's source of truth)
├── tests/                 # pytest (SQLite by default, PostgreSQL via env var)
├── requirements.txt       # pinned runtime deps
└── requirements-dev.txt   # + pytest, httpx, pip-audit
```

## 1. Create the database from scratch

PostgreSQL 14+ (local, or a managed service such as Neon / Vercel Postgres).
Locally, as a superuser:

```sql
CREATE USER onhouse WITH PASSWORD '<strong password>';
CREATE DATABASE onhouse OWNER onhouse ENCODING 'UTF8';
```

On Neon / Vercel Postgres the database and its owner role already exist; just
use the connection string they give you.

Then create the tables with the migrations — never by hand:

```bash
alembic upgrade head        # create / update the schema
alembic check               # verify models and migrations agree
alembic downgrade base      # (drops everything — careful)
```

## 2. Run locally

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate            # Windows  (source .venv/bin/activate elsewhere)
pip install -r requirements-dev.txt
copy .env.example .env            # then fill in DATABASE_URL (or PG*) and SECRET_KEY
alembic upgrade head
python -m app.cli seed            # optional: the site's launch content
python -m app.cli create-admin <username>   # prompts for the password (min 12 chars)
uvicorn app.main:app --reload --port 8000
```

- API: <http://127.0.0.1:8000/api/events> · interactive docs (dev only): <http://127.0.0.1:8000/docs>
- Frontend: in `frontend/.env.local` set `API_URL=http://127.0.0.1:8000`, then `npm run dev`
  and open <http://localhost:3000/admin>.

Other commands: `python -m app.cli set-password <username>` (rotates the password
and revokes that admin's sessions).

## 3. Tests

```bash
pytest                                            # fast, on a temp SQLite file
# Same suite + migrations against a real, EMPTY PostgreSQL database:
TEST_DATABASE_URL="postgresql+psycopg://user:pass@127.0.0.1:5432/onhouse_test" pytest
pip-audit -r requirements.txt                     # known-vulnerability check
```

## 4. Environment variables

See `.env.example` for all of them. The important ones:

| Variable | Purpose |
|---|---|
| `APP_ENV` | `development` / `production`. Production enables HSTS, `Secure` + `__Host-` cookies, hides `/docs`, and refuses to start with unsafe config. |
| `SECRET_KEY` | ≥ 32 random chars. Signs CSRF tokens. `python -c "import secrets;print(secrets.token_urlsafe(48))"` |
| `DATABASE_URL` (or `POSTGRES_URL`) *or* `PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD` | Database connection. `postgres://` URLs are accepted as-is. |
| `DATABASE_URL_UNPOOLED` (or `POSTGRES_URL_NON_POOLING`) | Direct, non-pooler URL used only by `alembic`. Optional. |
| `PGSSLMODE` | TLS when using the PG* values (`require` for managed Postgres). With a URL, put `?sslmode=require` in it. |
| `DB_NULL_POOL` | `true` on serverless (Vercel). |
| `FRONTEND_URL`, `EXTRA_ALLOWED_ORIGINS` | Allowed origins for CORS and the Origin check. |
| `ALLOWED_HOSTS` | Host header allow-list (required in production). |
| `CLIENT_IP_HEADER` | Header carrying the real client IP behind a trusted proxy (`x-real-ip` on Vercel). |
| `SESSION_IDLE_MINUTES`, `SESSION_ABSOLUTE_HOURS` | Session expiry (60 min idle / 12 h absolute). |
| `LOGIN_*`, `RATE_LIMIT_PER_MINUTE`, `ADMIN_WRITE_LIMIT_PER_MINUTE` | Brute-force and rate limits. |
| `STORAGE_BACKEND`, `UPLOAD_DIR`, `MAX_UPLOAD_MB`, `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN`, `S3_*` | Where uploaded images go (section 7). |
| `EVENT_TIMEZONE` | Timezone for event dates (`Europe/Madrid`). |

## 5. API

All errors: `{"error": {"code", "message", "details?": [{"field","message","type"}]}}`.

Public (published content only, cached 60 s):

| Method | Path | |
|---|---|---|
| GET | `/api/events` | All published events, schedule order, with derived `status` (`next`/`upcoming`/`past`), `startsAt`/`endsAt` and line-up |
| GET | `/api/events/{id}` | One event (404 for drafts) |
| GET | `/api/artists` | Published artists in `sortOrder`, with links and `nextEvent` |
| GET | `/api/artists/{id}` | One artist (404 for drafts) |
| GET | `/api/health` | Liveness + DB check |

Admin (session cookie; writes also need `X-CSRF-Token`):

| Method | Path | |
|---|---|---|
| POST | `/api/admin/auth/login` | `{username, password}` → sets cookie, returns `{username, csrfToken}` |
| POST | `/api/admin/auth/logout` | Revokes the session (204) |
| GET | `/api/admin/auth/me` | Current session + CSRF token |
| GET/POST | `/api/admin/artists` | List (incl. drafts) / create (201) |
| GET/PUT/DELETE | `/api/admin/artists/{id}` | Read / full replace / delete (204) |
| GET/POST | `/api/admin/events` | List / create — body includes `artistIds` in billing order |
| GET/PUT/DELETE | `/api/admin/events/{id}` | Read / full replace / delete (204) |
| POST | `/api/admin/uploads` | Multipart image upload → `{url}` (201) |

Also public: `GET /uploads/{name}` serves locally stored uploads.

Status codes: 200, 201, 204, 401 (no/expired session), 403 (CSRF/Origin),
404, 409 (duplicate event number), 413 (body > 64 KB), 422 (validation), 429
(throttled, with `Retry-After`), 500 (generic, details only in server logs).

## 6. Data model

- `artists` — name, genre, bilingual description, `image_url`, `sort_order`, `is_published`, timestamps.
- `artist_links` — social links, one per platform (`UNIQUE(artist_id, platform)`, `CHECK` on platform). `ON DELETE CASCADE`.
- `events` — `number` (UNIQUE, shown as 001), title, city, venue (NULL = TBA), `event_date` (NULL = TBA), `doors_open/close`, bilingual description, `image_url`, `ticket_url`, `is_published`, timestamps.
- `event_artists` — the many-to-many line-up with `position`. PK `(event_id, artist_id)`; both FKs `ON DELETE CASCADE`: deleting an event or an artist removes only the link rows.
- `admin_users`, `admin_sessions` (SHA-256 of the token only), `login_attempts`.

Not stored because it is derived: event `status`, `startsAt/endsAt` (date + doors
in `EVENT_TIMEZONE`; a closing time earlier than opening falls on the next day,
no closing time = 06:00 next day), the line-up string and the artist's `nextEvent`.

## 7. Images (upload button)

The admin forms have a **"Subir imagen"** button. `POST /api/admin/uploads`
(multipart, field `file`; admin session + CSRF) returns `{"url": ...}`, and that
URL is what gets saved in the database — never the image itself.

Every upload is decoded with Pillow and re-encoded to WebP (max 2560 px):
this proves it is a real image (JPEG/PNG/WebP/AVIF only), strips EXIF/GPS
metadata, neutralises disguised files and caps decompression bombs. File names
are random (`<32 hex>.webp`); nothing from the client reaches a path. The
browser shrinks large phone photos before sending, so they fit the size limit.

Storage (`STORAGE_BACKEND`):

| Backend | Where | URL saved | Use when |
|---|---|---|---|
| `local` (default) | `backend/uploads/` (git-ignored) | `/uploads/<name>.webp`, served by the API and proxied by the site | Local development, or a server with a persistent disk |
| `blob` | Vercel Blob (public store) | `https://<store>.public.blob.vercel-storage.com/uploads/<name>.webp` | **Vercel** — the disk there is read-only and wiped on every deploy |
| `s3` | Any S3-compatible bucket (Cloudflare R2, S3, B2) | `S3_PUBLIC_BASE_URL/uploads/<name>.webp` | Render free, or any host when you prefer your own bucket |

Vercel Blob setup: backend project → *Storage* → *Create* → **Blob**, access
**Public** → connect it to the project → add `STORAGE_BACKEND=blob` → redeploy.
Connecting sets `BLOB_STORE_ID`: the API then authenticates with OIDC, using the
short-lived token Vercel attaches to every request (nothing else to configure).
Older stores set a static `BLOB_READ_WRITE_TOKEN` instead; either one is enough.

Cloudflare R2 setup (free: 10 GB, no egress fees): create a bucket → enable
public access (r2.dev URL or a custom domain such as `media.onhouse.es`) →
create an API token with *Object Read & Write* on that bucket → set the `S3_*`
variables. Images can still be given as a plain URL ("Usar una URL en su lugar").

Not yet done: deleting the old file when an image is replaced or its event/artist deleted (files are small; orphans are harmless).

## 8. Deploy (recommended: Vercel + Neon Postgres)

1. **Database:** in the Vercel backend project → *Storage* → create a Postgres
   (Neon) database, region `fra1`/Frankfurt. It injects `DATABASE_URL` / `POSTGRES_URL`
   automatically (pooled, with `sslmode=require`).
2. Put `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) in your local
   `.env` and run `alembic upgrade head` (it uses the direct URL automatically),
   then `python -m app.cli create-admin <you>`.
3. **Backend:** new Vercel project, *Root Directory* `backend` (FastAPI is auto-detected
   via `pyproject.toml → tool.vercel.entrypoint`). Env vars: `APP_ENV=production`,
   `SECRET_KEY`, `DATABASE_URL` (already set by the Storage integration),
   `DB_NULL_POOL=true`, `FRONTEND_URL=https://www.onhouse.es`,
   `ALLOWED_HOSTS=<project>.vercel.app`, `CLIENT_IP_HEADER=x-real-ip`,
   `STORAGE_BACKEND=blob` with a public Blob store connected (see section 7).
4. **Frontend:** in the existing Vercel project set `API_URL=https://<backend>.vercel.app`
   and redeploy. The browser only talks to `www.onhouse.es/api/*` (proxied).
5. Check `https://www.onhouse.es/api/health` and log in at `/admin`.

Alternative compute: Render free web service (`uvicorn app.main:app --host 0.0.0.0 --port $PORT`,
`DB_NULL_POOL=false`, `CLIENT_IP_HEADER=` empty) — works the same but sleeps after 15 min.
