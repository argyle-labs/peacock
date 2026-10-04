import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 12004,
    host: '127.0.0.1',
    // Two supported dev topologies:
    //
    //  1. Direct (default, no daemon surgery): open http://localhost:12004.
    //     Vite serves the UI with HMR and proxies /api to the real local orca
    //     daemon on :12000, so you develop against live fleet data. Cookies
    //     ignore port, so the daemon's `orca_session` cookie set on
    //     localhost:12000 is still sent to localhost:12004 — no auth dance.
    //
    //  2. Through orca's dev proxy: with the daemon in dev mode it forwards
    //     its `/` route to the `dev_upstream` peacock registers (see
    //     src/main.rs) and the browser uses :12000 for everything.
    //
    // Must not be 12001 — see DEV_UPSTREAM in src/main.rs.
    proxy: {
      '/api': { target: 'http://127.0.0.1:12000', changeOrigin: false, ws: true },
    },
    // Pre-transform critical first-paint modules on dev server boot so the
    // browser doesn't pay per-module transform latency on a cold reload.
    // Keep this list TIGHT — every entry blocks dev server start.
    warmup: {
      clientFiles: [
        './src/routes/+layout.svelte',
        './src/routes/+layout.ts',
        './src/routes/+page.svelte',
        './src/lib/stores/runTool.ts',
        './src/lib/stores/session.svelte.ts',
        './src/lib/stores/theme.svelte.ts',
      ],
    },
    // The design system is a workspace sibling, not a prebuilt dependency, so
    // Vite must be allowed to read outside packages/app to serve its sources.
    fs: { allow: ['..'] },
  },
  optimizeDeps: {
    // The generated client is self-contained: openapi-ts emits its own fetch
    // client under src/lib/client/client + core, and `zod` is its only external
    // import. An older config pre-bundled '@hey-api/client-fetch', which the
    // generator no longer emits and which is not installed — vite logged
    // "Failed to resolve dependency" on every dev start. `exclude` likewise
    // listed a '$lib/...' alias, which is not a package specifier and so never
    // did anything.
    //
    // @peacock/ui-kit is a workspace sibling consumed as source, so it must not
    // be pre-bundled or edits to it stop triggering HMR.
    exclude: ['@peacock/ui-kit'],
  },
  build: {
    rolldownOptions: {
      output: {
        // Rolldown's `codeSplitting.strategy: 'smart'` isn't in vite's
        // RollupOptions types yet (vite still ships rollup typings). Cast
        // through `unknown` rather than `any` so the escape is explicit
        // and contained to this single line.
        codeSplitting: { strategy: 'smart' } as unknown as boolean,
      },
    },
  },
});
