import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    // Output to ui/dist (two levels up) because the Rust plugin embeds that
    // exact path at compile time — see src/render.rs `#[folder = "ui/dist/"]`.
    // Moving this requires changing that attribute in lockstep.
    adapter: adapter({ pages: '../../dist', assets: '../../dist', fallback: 'index.html' }),
    alias: { $lib: 'src/lib' },
  },
};
