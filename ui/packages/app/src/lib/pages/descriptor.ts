/**
 * Page-descriptor seam.
 *
 * The same operator surface is planned for SwiftUI and Jetpack Compose, and
 * orca plugins are eventually meant to expose their own widgets — which they
 * cannot do by shipping Svelte components. So a domain page should be
 * describable as DATA (columns, fields, actions) that a small renderer walks,
 * not bespoke markup wired by hand on every route.
 *
 * `DataTable` now accepts a per-column `cell` snippet (wrapped in its own
 * `<td>` by the primitive) in addition to the whole-row `row` snippet, so
 * `Column<T>` carries `cell` alongside the header metadata (`label`/`width`)
 * that drives `DataTable`'s `columns` prop via `tableColumns()` — one source
 * of truth for order/labels/widths/cells. Snippets can only be declared with
 * `{#snippet}` in template markup (there is no way to synthesize one from a
 * plain accessor function in this file), so every column — text or
 * composite — still gets its `cell` wired up at the call site in the page's
 * `<script>`/markup, not here. This file stays honest about that: it is a
 * header-and-cell *projection* onto `DataTable`'s props, not a renderer that
 * can build cells on its own.
 *
 * `PageAction` has no caller yet in this slice (the systems list has no
 * mutating actions), but it's declared now so the dry-run/confirm gate has
 * exactly one shape to target later: a verb + args, never an inline handler
 * closure a native client couldn't reconstruct.
 */

import type { Snippet } from 'svelte';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  /** Per-column cell renderer; `DataTable` wraps the result in its own `<td>`. */
  cell?: Snippet<[T]>;
}

export interface PageAction<TArgs extends Record<string, unknown> = Record<string, unknown>> {
  verb: string;
  args: TArgs;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  destructive?: boolean;
}

/** Project a `Column<T>[]` descriptor down to the shape `DataTable` accepts. */
export function tableColumns<T>(
  columns: Column<T>[],
): { label: string; width?: string; cell?: Snippet<[T]> }[] {
  return columns.map(({ label, width, cell }) => ({ label, width, cell }));
}
