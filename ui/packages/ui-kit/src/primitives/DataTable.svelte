<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import type { CellSpec } from '../types';
  import Cell from './Cell.svelte';

  /* Three rendering paths per column, in precedence order:
     - `row`: a single snippet given the whole row item, rendering all <td>s itself.
     - `cell` (on a column): a per-column snippet given the row item — the
       documented web-only escape hatch for genuinely bespoke cells. Wins over
       `spec` when both are given, the same way Badge's `color` escape hatch
       wins over its `tone` default: the more specific override beats the
       portable default.
     - `spec` (on a column): a portable `CellSpec` rendered by `Cell` — the
       preferred, cross-platform way to describe a column.
     If a column defines `cell`, it is used for that column regardless of whether `row`
     is also supplied. If NEITHER `row` nor a column's `cell`/`spec` is supplied, the
     column's raw label is rendered as a fallback (no-op display). Mixing modes across
     different columns is not supported — pick one style per table. */
  let {
    columns,
    rows,
    emptyText = 'No items',
    row: rowSnippet,
    loading = false,
  }: {
    columns: { label: string; width?: string; cell?: Snippet<[T]>; spec?: CellSpec }[];
    rows: T[];
    emptyText?: string;
    row?: Snippet<[T]>;
    loading?: boolean;
  } = $props();
</script>

<table class="data-table">
  <thead>
    <tr>
      {#each columns as col (col.label)}
        <th style={col.width ? `width:${col.width}` : ''}>{col.label}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#if loading}
      <tr><td colspan={columns.length} class="empty">Loading…</td></tr>
    {:else}
      {#each rows as item}
        {#if rowSnippet}
          <tr>{@render rowSnippet(item)}</tr>
        {:else}
          <tr>
            {#each columns as col (col.label)}
              <td
                >{#if col.cell}{@render col.cell(item)}{:else if col.spec}<Cell
                    spec={col.spec}
                    row={item}
                  />{/if}</td
              >
            {/each}
          </tr>
        {/if}
      {:else}
        <tr><td colspan={columns.length} class="empty">{emptyText}</td></tr>
      {/each}
    {/if}
  </tbody>
</table>

<style>
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-sm);
  }
  .data-table th,
  .data-table td {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    vertical-align: middle;
  }
  .data-table th {
    color: var(--color-text-dim);
    font-weight: var(--weight-medium);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .data-table tr:last-child td {
    border-bottom: none;
  }
  .empty {
    color: var(--color-text-faint);
    font-style: italic;
    text-align: center;
    padding: var(--space-6) !important;
  }
</style>
