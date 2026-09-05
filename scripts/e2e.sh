#!/bin/sh
# API e2e entry point — same flow locally and in CI.
#   TARGET=compose ./scripts/e2e.sh   # ephemeral docker compose (CI default)
#   TARGET=local ./scripts/e2e.sh     # local node process, no docker needed
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${TARGET:-compose}"
PORT="${E2E_PORT:-3214}"
export E2E_BASE_URL="${E2E_BASE_URL:-http://localhost:$PORT}"
export E2E_ADMIN_USERNAME="${E2E_ADMIN_USERNAME:-e2eadmin}"
export E2E_ADMIN_PASSWORD="${E2E_ADMIN_PASSWORD:-e2epass}"
export E2E_JWT_SECRET="${E2E_JWT_SECRET:-e2e-ci-secret}"
DATA="$ROOT/.ci-data"
DB="$DATA/ci.hlc2"

need_vitest() {
  if ! npm ls vitest --workspace=homelab-lib.tests >/dev/null 2>&1; then
    echo "vitest not found — run 'npm install' at repo root first" >&2
    exit 1
  fi
}

seed() {
  rm -rf "$DATA"
  mkdir -p "$DATA"
  sqlite3 "$DB" < "$ROOT/packages/tests/e2e/seed.sql"
  sh "$ROOT/packages/tests/e2e/make-archives.sh" "$DATA"
}

run_tests() {
  sh "$ROOT/packages/tests/e2e/wait-for-health.sh"
  (cd "$ROOT" && npm run test:e2e --workspace=homelab-lib.tests)
}

if [ "$TARGET" = "local" ]; then
  need_vitest
  seed
  (cd "$ROOT/packages/server" && npm run build)
  # Same semantics as start-server (migrate + run), split so the server PID is
  # a direct node child that the EXIT trap can kill. Cwd matters: knex
  # resolves ./migrations relative to it.
  (cd "$ROOT/packages/server" && \
    DB_PATH="$DB" ARCHIVE_PATH="$DATA/archive" \
    ADMIN_USERNAME="$E2E_ADMIN_USERNAME" ADMIN_PASSWORD="$E2E_ADMIN_PASSWORD" \
    JWT_SECRET="$E2E_JWT_SECRET" \
    npx knex migrate:latest)
  DB_PATH="$DB" ARCHIVE_PATH="$DATA/archive" \
    ADMIN_USERNAME="$E2E_ADMIN_USERNAME" ADMIN_PASSWORD="$E2E_ADMIN_PASSWORD" \
    JWT_SECRET="$E2E_JWT_SECRET" REQUEST_RATE_LIMIT=1000 PORT="$PORT" \
    node "$ROOT/packages/server/dist/app.js" &
  SRV=$!
  trap 'kill $SRV 2>/dev/null || true' EXIT INT TERM
  run_tests
  exit 0
fi

# compose (default)
need_vitest
command -v docker >/dev/null || { echo "docker not found (use TARGET=local)" >&2; exit 1; }
seed
(cd "$ROOT" && docker compose -f docker-compose.ci.yml up --build -d)
rc=0
run_tests || rc=$?
if [ "$rc" -ne 0 ]; then
  (cd "$ROOT" && docker compose -f docker-compose.ci.yml logs --tail=100)
fi
(cd "$ROOT" && docker compose -f docker-compose.ci.yml down -v)
exit "$rc"
