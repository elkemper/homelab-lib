import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import legacy from '@vitejs/plugin-legacy';

// Light build, no CSS libs. outDir stays `build` so the Koa static
// serving (packages/server/app.ts) and dockerfile keep working.
// Legacy chunk targets Chrome 60+ (covers e-ink Chrome 73): the
// plugin transpiles `?.` / `??` etc. via babel + core-js usage-based
// polyfills and serves modern SystemJS fallback automatically.
export default defineConfig({
  plugins: [
    preact(),
    legacy({
      targets: ['chrome >= 60'],
      modernPolyfills: false,
    }),
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
    // NOTE: no `target` here — @vitejs/plugin-legacy manages it:
    // modern chunk for evergreen browsers, SystemJS chunk for chrome>=60.
    cssTarget: 'chrome60',
    sourcemap: false,
    chunkSizeWarningLimit: 120,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3214',
    },
  },
});
