<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Cell from '../Cell.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Cell',
    component: Cell,
    tags: ['autodocs'],
  });
</script>

<Story name="text">
  {#snippet template()}
    <Cell spec={{ kind: 'text', field: 'name' }} row={{ name: 'frigg' }} />
  {/snippet}
</Story>

<Story name="mono">
  {#snippet template()}
    <Cell spec={{ kind: 'mono', field: 'fp' }} row={{ fp: 'ab:cd:ef:01' }} />
  {/snippet}
</Story>

<Story name="status (up / down / unknown)">
  {#snippet template()}
    <div style="display:flex; gap:1rem;">
      <Cell spec={{ kind: 'status', field: 'health' }} row={{ health: 'up' }} />
      <Cell spec={{ kind: 'status', field: 'health' }} row={{ health: 'down' }} />
      <Cell spec={{ kind: 'status', field: 'health' }} row={{ health: 'unknown' }} />
    </div>
  {/snippet}
</Story>

<Story name="badge (default tone)">
  {#snippet template()}
    <Cell spec={{ kind: 'badge', field: 'role' }} row={{ role: 'peer' }} />
  {/snippet}
</Story>

<Story name="badge (toneMap + labelMap)">
  {#snippet template()}
    <div style="display:flex; gap:1rem;">
      <Cell
        spec={{
          kind: 'badge',
          field: 'can_invite',
          toneMap: { true: 'success', false: 'neutral' },
          labelMap: { true: 'yes', false: 'no' },
        }}
        row={{ can_invite: true }}
      />
      <Cell
        spec={{
          kind: 'badge',
          field: 'can_invite',
          toneMap: { true: 'success', false: 'neutral' },
          labelMap: { true: 'yes', false: 'no' },
        }}
        row={{ can_invite: false }}
      />
    </div>
  {/snippet}
</Story>

<Story name="relTime">
  {#snippet template()}
    <Cell spec={{ kind: 'relTime', field: 'ts' }} row={{ ts: Date.now() - 65000 }} />
  {/snippet}
</Story>

<Story name="uptime">
  {#snippet template()}
    <Cell spec={{ kind: 'uptime', field: 'secs' }} row={{ secs: 90000 }} />
  {/snippet}
</Story>

<Story name="addr">
  {#snippet template()}
    <Cell
      spec={{ kind: 'addr', hostField: 'addr', portField: 'port' }}
      row={{ addr: '10.0.0.5', port: 8080 }}
    />
  {/snippet}
</Story>

<Story name="missing value (every kind)">
  {#snippet template()}
    <div style="display:flex; flex-direction:column; gap:0.5rem;">
      <Cell spec={{ kind: 'text', field: 'name' }} row={{}} />
      <Cell spec={{ kind: 'mono', field: 'fp' }} row={{}} />
      <Cell spec={{ kind: 'status', field: 'health' }} row={{}} />
      <Cell spec={{ kind: 'badge', field: 'role' }} row={{}} />
      <Cell spec={{ kind: 'relTime', field: 'ts' }} row={{}} />
      <Cell spec={{ kind: 'uptime', field: 'secs' }} row={{}} />
      <Cell spec={{ kind: 'addr', hostField: 'addr', portField: 'port' }} row={{}} />
    </div>
  {/snippet}
</Story>

<Story name="unknown value vs. non-navigable path">
  {#snippet template()}
    {@const row = { health: { daemon: { running: true } } }}
    <p style="font-size: var(--text-xs); color: var(--color-text-dim); margin: 0 0 0.5rem;">
      Left column: the field exists on the row and is genuinely absent — normal data, quiet em-dash.
      Right column: the <code>field</code> string has a typo on an intermediate segment (<code
        >daemonn</code
      >) and cannot be navigated against this row's shape at all — a programming error, rendered
      loudly and never confused with the em-dash.
    </p>
    <div style="display:flex; gap:2rem;">
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <span style="font-size: var(--text-xs);">genuinely missing data</span>
        <Cell spec={{ kind: 'text', field: 'health.disk' }} {row} />
      </div>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <span style="font-size: var(--text-xs);">non-navigable path (typo)</span>
        <Cell spec={{ kind: 'text', field: 'health.daemonn.running' }} {row} />
      </div>
    </div>
  {/snippet}
</Story>
