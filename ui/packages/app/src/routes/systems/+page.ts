// adapter-static SPA route: no server runtime to render against, and the
// roster/health fetch is poller-driven client-side (see +page.svelte), so
// there is nothing to load here. Declared explicitly per-route rather than
// relying solely on the root layout, since this is the first domain route.

export const ssr = false;
export const prerender = false;
