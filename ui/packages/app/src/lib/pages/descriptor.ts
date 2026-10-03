/**
 * Page-descriptor seam.
 *
 * The same operator surface is planned for SwiftUI and Jetpack Compose, and
 * orca plugins are eventually meant to expose their own widgets — which they
 * cannot do by shipping Svelte components. So a domain page should be
 * describable as DATA (columns, fields, actions) that a small renderer walks,
 * not bespoke markup wired by hand on every route.
 *
 * `Column<T>.spec` (`CellSpec`, defined in `@peacock/ui-kit`) is that data —
 * a JSON-serialisable description of the cell that `Cell` renders and that a
 * native client could render with its own widgets. `Column<T>.cell` is the
 * documented web-only escape hatch: a Svelte snippet for cells that are
 * genuinely bespoke or composite (joins across more than the row itself,
 * e.g. a value looked up from a sibling health map) and can't be expressed
 * as a `CellSpec` without turning the spec language into a template engine.
 *
 * Precedence when a column defines both: `cell` wins, the same way Badge's
 * `color` escape hatch wins over its `tone` default — the more specific
 * override beats the portable default. See `DataTable`'s doc comment for the
 * full three-way precedence (`row` snippet / column `cell` / column `spec`).
 *
 * `DataTable` accepts a per-column `cell` snippet or `spec` descriptor
 * (wrapped in its own `<td>` by the primitive) in addition to the whole-row
 * `row` snippet, so `Column<T>` carries `cell`/`spec` alongside the header
 * metadata (`label`/`width`) that drives `DataTable`'s `columns` prop via
 * `tableColumns()` — one source of truth for order/labels/widths/cells.
 */

import type { Snippet } from 'svelte';
import type { CellSpec } from '@peacock/ui-kit';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  /** Portable, preferred cell description — see `CellSpec` in `@peacock/ui-kit`. */
  spec?: CellSpec;
  /** Web-only escape hatch for bespoke/composite cells; wins over `spec` when both are given. */
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
): { label: string; width?: string; spec?: CellSpec; cell?: Snippet<[T]> }[] {
  return columns.map(({ label, width, spec, cell }) => ({ label, width, spec, cell }));
}
