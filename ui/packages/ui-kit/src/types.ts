/**
 * Data shapes the primitive catalog accepts.
 *
 * These are owned by the design system, NOT imported from orca's generated API
 * client. The kit must stay free of orca knowledge for two reasons:
 *
 *   1. The same vocabulary is meant to be implemented in SwiftUI and Compose,
 *      where `$lib/client/types.gen` does not exist.
 *   2. A plugin will eventually declare a widget as data; it must be able to
 *      target these shapes without compiling against orca's REST types.
 *
 * They are deliberately structural, so a value straight off the API (e.g. the
 * generated `ChartPoint`) satisfies them without conversion or casting.
 */

/** One plotted point, pre-scaled by the producer to the chart's own space. */
export interface ChartPoint {
  x: number;
  y: number;
}

/** A single row in a table — opaque to the kit; columns select out of it. */
export type Row = Record<string, unknown>;

/** Semantic intent shared by `Badge` and anything that renders tone-coloured
 * state (e.g. `Cell`'s `badge` kind). Shared here so the two never drift. */
export type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'accent';

/**
 * A `CellSpec` describes one table cell as DATA, not markup. It is the
 * portable half of `Column<T>`'s rendering (the other half is the Svelte
 * `cell` snippet escape hatch — see `@peacock/app/lib/pages/descriptor`).
 *
 * THE HARD INVARIANT: a `CellSpec` must contain no functions and must
 * survive `JSON.parse(JSON.stringify(spec))` unchanged. If a cell needs a
 * callback, that's the signal it needs another `kind`, or a declarative
 * parameter (a `toneMap`/`labelMap`, say) — never a closure. This is what
 * lets an orca plugin ship a table column as JSON and have SwiftUI/Compose
 * render it with their own native widgets, with no Svelte involved.
 *
 * `field` (and `hostField`/`portField`) is a dotted path resolved against
 * the row at render time via `resolvePath` below — e.g. `health.daemon.running`.
 *
 * Kept deliberately small — this switch (in `Cell.svelte`) is exactly what
 * every other platform must reimplement natively, so each kind earns its
 * place:
 *   - text    plain value, em-dash on null/undefined/empty
 *   - mono    same as text, monospace (addresses, ids, fingerprints)
 *   - status  tri-state health (`"up" | "down" | anything else`) -> StatusDot + label
 *   - badge   value rendered in a `Badge`; `tone` is the default, `toneMap`/
 *             `labelMap` key off the field's *stringified* value for the
 *             handful of columns whose tone/label depends on that value
 *             (e.g. a boolean "can invite" -> yes/no, success/neutral)
 *   - relTime a past timestamp (ms) rendered as "3m ago"
 *   - uptime  a duration in seconds rendered as "3h"
 *   - addr    `host:port` built from two fields, monospace — general enough
 *             to earn a kind because it recurs across every mesh listing
 *             (candidates, stale, inbound offers), always as two separate
 *             row fields rather than one pre-joined string
 */
export type CellSpec =
  | { kind: 'text'; field: string }
  | { kind: 'mono'; field: string }
  | { kind: 'status'; field: string }
  | {
      kind: 'badge';
      field: string;
      tone?: Tone;
      toneMap?: Record<string, Tone>;
      labelMap?: Record<string, string>;
    }
  | { kind: 'relTime'; field: string }
  | { kind: 'uptime'; field: string }
  | { kind: 'addr'; hostField: string; portField: string };

/**
 * Result of resolving a `CellSpec.field` path against a row.
 *
 * The two failure-shaped states are NOT the same thing, and callers must not
 * collapse them:
 *   - `{ ok: true, value }` — the path is navigable in this row's shape. The
 *     leaf itself may still be `null`/`undefined` — that's ordinary missing
 *     *data* (e.g. a host genuinely has no disk info this cycle).
 *   - `{ ok: false }` — some segment before the end was missing or was not
 *     an object, so the path does not exist in this shape at all. That's a
 *     programming error (a typo, or the API renamed the field) and must be
 *     surfaced loudly rather than rendered identically to missing data.
 *
 * NOTE on what this cannot catch: a typo on the FINAL segment of a path
 * whose parent object genuinely exists (e.g. `health.daemon.runnning`
 * against a row that does have `health.daemon`) is indistinguishable at
 * runtime from a legitimately-absent optional field — orca's generated
 * types model "no value" as `field?: T | null`, so both an omitted key and
 * an explicit `null` are valid, quiet, "no data" states, and a bare key-typo
 * looks exactly like one of them. Only `tsc` checking `field` against the
 * row's real type can catch that case; see the `CellSpec`/`Path<T>` tradeoff
 * discussed where `Cell` is implemented.
 */
export type PathResult = { ok: true; value: unknown } | { ok: false };

/** Resolves a dotted path (`"health.daemon.running"`, `"items.0.name"`)
 * against an arbitrary row value — never throws, never uses
 * `eval`/`new Function`. See `PathResult` for how "not navigable" differs
 * from "navigable, leaf is null/undefined". */
export function resolvePath(row: unknown, path: string): PathResult {
  let cur: unknown = row;
  for (const part of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return { ok: false };
    cur = (cur as Record<string, unknown>)[part];
  }
  return { ok: true, value: cur };
}
