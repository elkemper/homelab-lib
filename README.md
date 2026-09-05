# HomeLab Lib

Self-hosted web library for fb2 ebook archives (Librusec `.hlc2` catalogs).
Search hundreds of thousands of books in milliseconds, see series and
co-authors, download books as `.fb2` — all from your own server, no cloud.  
(Web-based alternative to MyHomeLib)

## Features

- **Instant full-text search** — SQLite FTS5 index over titles, authors, and
  series, ranked Title > Author > Series, with prefix matching
  (`"har"*` finds *Harbor*). Multi-word queries, exact result counts.
- **One row per book** — co-authors grouped (`Chronicle John, Doe Jane`),
  series title + volume number shown on every card.
- **One-click fb2 downloads** — books stream straight from zip archives via
  short-lived signed URLs (5-minute expiry, no login prompt on the link).
- **Users & admin** — first boot creates the admin from env; admins manage
  users (create / list / delete) from the UI. Session tokens with expiry.
- **Homelab-friendly** — single SQLite file + archive dir on a volume, one
  Docker image, amd64 + arm64, ~seconds startup with automatic migrations.

## Quickstart

With Docker Compose (recommended):

```bash
DB_PATH=/app/data/lib.hlc2 ARCHIVE_PATH=/app/data/archive \
ADMIN_USERNAME=admin ADMIN_PASSWORD=secret JWT_SECRET=secret \
  docker compose up --build
```

Then open `http://localhost:3214`, log in as `admin`, and search.

Or run a published release (no build):

```yaml
services:
  homelab-lib:
    image: elkemper/homelab-lib:1.0   # or :latest
    ports: ["3214:3214"]
    volumes: ["/app/data:/app/data"]
    environment:
      - DB_PATH=/app/data/lib.hlc2
      - ARCHIVE_PATH=/app/data/archive
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=secret
      - JWT_SECRET=secret
```

What you need on the volume: a Librusec catalog file (`DB_PATH`) and the
zip archives it references (`ARCHIVE_PATH`). The container applies DB migrations
itself on start — back up the catalog file before upgrading, the FTS
rebuild adds ~50MB and takes seconds on large libraries.

## Using it

- **Search** — type 2+ characters; results are paginated (50/page) with the
  total count on every page. Deleted catalog entries never appear.
- **Download** — open a book, hit download: the metadata call mints a
  5-minute URL, the file streams as `<Title>.fb2`.
- **Admin** — log in as the admin user to manage accounts. Deleting the
  admin (`id=0`) is refused; deleting a user invalidates their sessions.

## Configuration

All via environment (or `packages/server/.env` for local runs):

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DB_PATH` | yes | — | SQLite catalog file |
| `ADMIN_USERNAME` | yes | — | Bootstrapped as user `id=0` on every start |
| `ADMIN_PASSWORD` | yes | `admin` | Re-applied to the admin user on every start |
| `JWT_SECRET` | yes | `supersecretjwtkey` | Strong random string in production |
| `ARCHIVE_PATH` | for downloads | — | Dir with `<Folder>.zip` archives |
| `PORT` | no | `3214` | |
| `REQUEST_RATE_LIMIT` | no | `20` | Requests per 10s window, per IP |
| `ALLOWED_ORIGINS` | no | `http://localhost:3000` | Currently unused (CORS is `*`) |

---

## Development

Prerequisites: Node.js **v24**, npm; for e2e/CI also `sqlite3`, `zip`, Docker.

### Project structure

- `packages/server`: Koa backend — `db/`, `routes/` + `controllers/`,
  `migrations/` (knex, incl. the grouped/prefix FTS rebuild), `tests/unit/`.
- `packages/client`: React frontend.
- `packages/tests`: black-box API e2e (vitest + `fetch`, no UI) with SQL seed.
- `scripts/e2e.sh`: one e2e entry point, locally and in CI.
- `dockerfile` (lowercase), `docker-compose.yml` (prod),
  `docker-compose.ci.yml` (ephemeral CI env).
- `.github/workflows/`: `ci.yml` (unit + e2e), `release.yml` (Docker Hub).

### Setup, build, run

```bash
cp packages/server/.env.template packages/server/.env  # then fill in values
npm install
npm run build            # client + server
npm run start --workspace=packages/server   # build + migrate + run
```

`start-server` skips the build (migrate + run). Server at
`http://localhost:3214` (or your `PORT`).

### Testing

```bash
npm test                                   # unit, mocked DB
TARGET=local ./scripts/e2e.sh              # API e2e, local process, no Docker
TARGET=compose ./scripts/e2e.sh            # API e2e, ephemeral compose (as CI)
```

E2e seeds 57 books (multi-author grouping, series, deleted exclusion,
ranking, pagination) and asserts auth → search → download → users flows.
Test deps are standalone (`npm --prefix packages/tests install`; re-run
after a root `npm install`, which prunes them).

### CI & releasing

- `ci.yml` on every push/PR: `unit` (tsc, client build, unit tests), then
  `e2e` (seed → compose → API suite → logs on failure → teardown).
- Tag a green commit `git tag release-1.0 && git push origin release-1.0`. 
- `release.yml` publishes  `elkemper/homelab-lib:1.0` + `:latest` (amd64/arm64).
- One-time: repo Settings → Secrets → Actions →
  `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` (Read & Write PAT).
