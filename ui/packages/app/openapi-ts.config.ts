import { defineConfig } from '@hey-api/openapi-ts';

// Generates the typed REST client + zod schemas the SvelteKit UI uses to talk
// to orca's REST API.
//
// Input is the COMMITTED ./openapi.json, not a live daemon. Refresh it with
// `npm run gen:spec` (wraps `orca openapi emit`, which needs no server boot);
// `npm run gen:client` regenerates from whatever spec is committed and so works
// offline and in CI with no orca binary present. `npm run gen` does both.
//
// Both ./openapi.json and ./src/lib/client are committed, and CI re-runs
// `gen:client` and fails on any diff — a stale client is a red build, not
// silent rot. Never hand-edit anything under src/lib/client.
export default defineConfig({
  input: './openapi.json',
  output: {
    path: './src/lib/client',
    postProcess: ['prettier'],
  },
  plugins: ['@hey-api/client-fetch', '@hey-api/typescript', '@hey-api/sdk', 'zod'],
});
