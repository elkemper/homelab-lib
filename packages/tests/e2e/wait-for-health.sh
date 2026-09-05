#!/bin/sh
# Polls $E2E_BASE_URL/api/health until 200 (used before running the api suite).
set -eu
BASE="${E2E_BASE_URL:-http://localhost:3214}"
for i in $(seq 1 60); do
  if curl -sf -o /dev/null "$BASE/api/health"; then
    echo "healthy: $BASE"
    exit 0
  fi
  sleep 1
done
echo "server never became healthy: $BASE" >&2
exit 1
