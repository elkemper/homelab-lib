# Client (Frontend) Application

Preact + Vite frontend. Hand-written CSS (no UI frameworks), RU/EN i18n,
hash routing (`#/search?q=&p=`), fetch API client in `src/lib/`.

## Running locally

From the project root:

```bash
npm run dev --workspace=packages/client      # Vite dev server (:3000, proxies /api → :3214)
```

## Building

```bash
npm run build --workspace=packages/client    # tsc + vite build → build/ (served by the server)
```

Dual output: modern ESM bundle + SystemJS legacy chunk for Chrome ≥60
(e-ink readers). Budgets: JS ≤50KB gzip, CSS ≤5KB.

## Testing

```bash
npm run test --workspace=packages/client     # vitest: pagination, router, i18n, api
```
