import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 12001,
    host: '127.0.0.1',
    // HMR goes through the orca proxy on :12000 (which forwards WSS → 12001)
    // so the browser only ever talks to one origin. This makes session
    // cookies same-origin and avoids cross-port ETP cookie blocks.
    hmr: { clientPort: 12000, protocol: 'ws' },
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
