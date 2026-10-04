import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// App-side unit tests only. Storybook's browser-mode story tests live with the
// components, in packages/ui-kit — see that package's vitest.config.ts.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    conditions: ['browser'],
    alias: {
      $lib: '/src/lib',
      '$app/environment': '/src/mocks/app-environment.ts',
      '$app/navigation': '/src/mocks/app-navigation.ts',
    },
  },
  test: {
    name: 'unit',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.ts'],
    exclude: ['node_modules/**', 'e2e/**'],
  },
});
