import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// npm hoists dependencies to the workspace root (ui/node_modules), which is
// OUTSIDE this package. Vite's dev server refuses to serve files above the
// project root by default, so browser-mode story tests fail to import the
// addon's setup file. Allow the workspace root explicitly.
const workspaceRoot = path.resolve(dirname, '../..');

// Two projects over the design system:
//   unit      — plain jsdom component tests colocated with each primitive.
//   storybook — every story rendered in a real browser, with addon-a11y's
//               checks. Storybook is the vocabulary's contract, so a primitive
//               with no story is not considered part of the catalog.
export default defineConfig({
  plugins: [svelte()],
  resolve: { conditions: ['browser'] },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.{test,spec}.ts'],
          exclude: ['node_modules/**'],
          setupFiles: ['src/vitest-setup.ts'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        server: { fs: { allow: [workspaceRoot] } },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
