<script module lang="ts">
  // Module-scoped (shared across every `Cell` instance), so a 50-row table
  // with one typo'd `field` logs it once, not once per row.
  const loggedPaths = new Set<string>();

  /** Test-only escape hatch — clears the dedup set between test cases. */
  export function _resetPathErrorLogForTest() {
    loggedPaths.clear();
  }
</script>

<script lang="ts">
  /**
   * Renders a `CellSpec` against a row. This `{#if}` chain on `spec.kind`
   * IS the native-rendering boundary: a SwiftUI/Compose client reimplements
   * this same switch over the same closed `kind` set with its own widgets.
   * Keep the set small (see `CellSpec` in `../types.ts`) rather than growing it here.
   *
   * A missing/null/undefined resolved value is always an explicit "—" (or,
   * for `status`, `StatusDot`'s `unknown` state) — never a blank cell and
   * never a crash. Silent degradation is treated as a defect in this project.
   *
   * A NON-NAVIGABLE path (a typo, or a field the API renamed) is a different
   * failure and must look different: it renders the `path-error` state below
   * instead of the em-dash, so "this host genuinely has no data" is never
   * confused with "this spec is broken". See `resolvePath`/`PathResult` in
   * `../types.ts`.
   */
  import type { CellSpec } from '../types';
  import { resolvePath } from '../types';
  import { relTime, fmtUptime } from '../utils/format';
  import StatusDot from './StatusDot.svelte';
  import Badge from './Badge.svelte';

  let { spec, row }: { spec: CellSpec; row: unknown } = $props();

  function resolve(field: string) {
    const result = resolvePath(row, field);
    if (!result.ok && import.meta.env.DEV && !loggedPaths.has(field)) {
      loggedPaths.add(field);
      // eslint-disable-next-line no-console -- deliberate dev-only diagnostic, see module docblock
      console.error(`[Cell] non-navigable field "${field}" — check the row shape/CellSpec`);
    }
    return result;
  }

  function text(v: unknown): string {
    return v == null || v === '' ? '—' : String(v);
  }

  function statusOk(v: unknown): boolean | null {
    if (v === 'up') return true;
    if (v === 'down') return false;
    return null;
  }
</script>

{#snippet pathError(field: string)}
  <span class="path-error" title={`field not found on row: "${field}"`}
    ><span aria-hidden="true">⚠</span> bad field</span
  >
{/snippet}

{#if spec.kind === 'text'}
  {@const r = resolve(spec.field)}
  {#if r.ok}
    {text(r.value)}
  {:else}
    {@render pathError(spec.field)}
  {/if}
{:else if spec.kind === 'mono'}
  {@const r = resolve(spec.field)}
  {#if r.ok}
    <span class="mono">{text(r.value)}</span>
  {:else}
    {@render pathError(spec.field)}
  {/if}
{:else if spec.kind === 'status'}
  {@const r = resolve(spec.field)}
  {#if r.ok}
    <StatusDot ok={statusOk(r.value)} />
    {text(r.value)}
  {:else}
    {@render pathError(spec.field)}
  {/if}
{:else if spec.kind === 'badge'}
  {@const r = resolve(spec.field)}
  {#if r.ok}
    {@const key = r.value == null ? undefined : String(r.value)}
    {@const tone = (key !== undefined && spec.toneMap?.[key]) || spec.tone || 'neutral'}
    {@const label = (key !== undefined && spec.labelMap?.[key]) || text(r.value)}
    <Badge {tone}>{label}</Badge>
  {:else}
    {@render pathError(spec.field)}
  {/if}
{:else if spec.kind === 'relTime'}
  {@const r = resolve(spec.field)}
  {#if r.ok}
    {@const result = relTime(typeof r.value === 'number' ? r.value : null, spec.unit ?? 'ms')}
    {#if result.ok}
      {result.text}
    {:else}
      <span class="path-error" title={`implausible timestamp: ${String(r.value)}`}
        ><span aria-hidden="true">⚠</span> {result.text}</span
      >
    {/if}
  {:else}
    {@render pathError(spec.field)}
  {/if}
{:else if spec.kind === 'uptime'}
  {@const r = resolve(spec.field)}
  {#if r.ok}
    {fmtUptime(typeof r.value === 'number' ? r.value : null)}
  {:else}
    {@render pathError(spec.field)}
  {/if}
{:else if spec.kind === 'addr'}
  {@const hostR = resolve(spec.hostField)}
  {@const portR = resolve(spec.portField)}
  {#if !hostR.ok || !portR.ok}
    {@render pathError(!hostR.ok ? spec.hostField : spec.portField)}
  {:else}
    <span class="mono"
      >{hostR.value == null || portR.value == null ? '—' : `${hostR.value}:${portR.value}`}</span
    >
  {/if}
{/if}

<style>
  .mono {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .path-error {
    color: var(--color-error);
    font-style: italic;
    font-size: var(--text-xs);
  }
</style>
