<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColorSwatch from './ColorSwatch.svelte';

  const { Story } = defineMeta({
    title: 'Tokens/Colors',
    tags: ['autodocs'],
  });

  const PALETTES = ['violet', 'ocean', 'ice-age', 'forest', 'sunset', 'rose', 'mono'] as const;
  const MODES = ['dark', 'light'] as const;

  const RAMP = [
    '--color-red',
    '--color-orange',
    '--color-yellow',
    '--color-green',
    '--color-teal',
    '--color-cyan',
    '--color-blue',
    '--color-indigo',
    '--color-purple',
    '--color-pink',
    '--color-gray',
  ];

  const SEMANTIC = [
    '--color-success',
    '--color-warning',
    '--color-error',
    '--color-info',
    '--color-accent',
    '--color-accent-dim',
  ];
</script>

<!-- ── Layer 1: the full named ramp, every palette × mode (14 blocks × 11 hues) ── -->
<Story name="Named ramp (all 14 palette/mode blocks)">
  {#snippet template()}
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      {#each PALETTES as palette}
        {#each MODES as mode}
          <div data-theme={palette} data-mode={mode}>
            <div
              style="padding:1rem; background:var(--color-bg); border:1px solid var(--color-border); border-radius:8px;"
            >
              <h4 style="margin:0 0 0.75rem; color:var(--color-text); font-size:0.85rem;">
                {palette} / {mode}
              </h4>
              <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                {#each RAMP as token}
                  <ColorSwatch {token} />
                {/each}
              </div>
            </div>
          </div>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>

<!-- ── Layer 2: the semantic tokens that alias into the ramp ── -->
<Story name="Semantic tokens (all 14 palette/mode blocks)">
  {#snippet template()}
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      {#each PALETTES as palette}
        {#each MODES as mode}
          <div data-theme={palette} data-mode={mode}>
            <div
              style="padding:1rem; background:var(--color-bg); border:1px solid var(--color-border); border-radius:8px;"
            >
              <h4 style="margin:0 0 0.75rem; color:var(--color-text); font-size:0.85rem;">
                {palette} / {mode}
              </h4>
              <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                {#each SEMANTIC as token}
                  <ColorSwatch {token} />
                {/each}
              </div>
            </div>
          </div>
        {/each}
      {/each}
    </div>
  {/snippet}
</Story>
