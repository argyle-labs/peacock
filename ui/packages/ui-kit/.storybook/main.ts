import type { StorybookConfig } from '@storybook/svelte-vite';

// Storybook is the design system's contract: every primitive in the catalog
// (src/index.ts) is expected to have a story here, and addon-a11y runs over all
// of them. A primitive with no story is not considered part of the vocabulary.
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts|svelte)'],
  addons: [
    '@storybook/addon-svelte-csf',
    '@chromatic-com/storybook',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/svelte-vite',
  viteFinal: config => ({ ...config, base: '/storybook/' }),
};
export default config;
