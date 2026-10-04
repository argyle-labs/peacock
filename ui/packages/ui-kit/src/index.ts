/**
 * @peacock/ui-kit — the closed primitive catalog.
 *
 * ## Why this file is a barrel and not a convenience
 *
 * peacock's operator surface is the web client today, but the same surface is
 * planned for SwiftUI and Compose, and plugins are eventually meant to expose
 * their own widgets. A plugin cannot ship a Svelte component — it would be
 * unrenderable on a native client — so plugins will instead *declare* UI as
 * typed data that each platform renders with its own native components.
 *
 * That only works if the set of renderable node types is CLOSED and NAMED. This
 * barrel is that set for web. Three rules follow, and they are the whole point:
 *
 *   1. Route and domain code imports from `@peacock/ui-kit` ONLY. A route that
 *      hand-rolls markup is a node type that no other platform can render, and
 *      that a plugin could never ask for.
 *   2. Every primitive styles itself from the tokens in `./tokens/tokens.css`
 *      and never a raw colour, radius, spacing or font value — those tokens are
 *      the layer that is compiled to Swift and Kotlin.
 *   3. Adding a primitive is a deliberate act: it widens the vocabulary every
 *      platform must eventually implement. Prefer composing existing nodes.
 *
 * ## The colour rule
 *
 * Colour tokens are two layers: a full NAMED RAMP (--color-red, --color-blue,
 * --color-purple, …, one per hue, per palette, per mode) and SEMANTIC tokens
 * (--color-success, --color-warning, --color-error, --color-info, plus the
 * accent/text/surface/border tokens) that alias into that ramp. A component
 * reaches for a SEMANTIC token by default — a named colour is an escape hatch
 * for when the meaning genuinely is "this specific colour" rather than "this
 * state." This is what lets the vocabulary compile to SwiftUI/Compose and
 * lets a plugin-declared widget ask for "error" instead of "red".
 *
 * Storybook (with addon-a11y) is the contract for what each node looks like and
 * how it behaves. If it is not in a story, it is not in the vocabulary.
 */

// ── Actions ──────────────────────────────────────────────────────────────────
export { default as Button } from './primitives/Button.svelte';
export { default as IconButton } from './primitives/IconButton.svelte';
export { default as ToggleSwitch } from './primitives/ToggleSwitch.svelte';
export { default as SegmentedControl } from './primitives/SegmentedControl.svelte';

// ── Status & display ─────────────────────────────────────────────────────────
export { default as Badge } from './primitives/Badge.svelte';
export { default as StatusDot } from './primitives/StatusDot.svelte';
export { default as MetricRow } from './primitives/MetricRow.svelte';
export { default as ProgressBar } from './primitives/ProgressBar.svelte';
export { default as Spinner } from './primitives/Spinner.svelte';

// ── Data ─────────────────────────────────────────────────────────────────────
export { default as DataTable } from './primitives/DataTable.svelte';
export { default as Cell } from './primitives/Cell.svelte';
export { default as Chart } from './primitives/Chart.svelte';

// ── Types ────────────────────────────────────────────────────────────────────
export type { Tone, CellSpec, ChartPoint, Row, PathResult } from './types';
export { resolvePath } from './types';
export { relTime, fmtUptime } from './utils/format';
export { pushOverlay } from './utils/overlayFocus';

// ── Structure & overlays ─────────────────────────────────────────────────────
export { default as SectionHead } from './primitives/SectionHead.svelte';
export { default as Modal } from './primitives/Modal.svelte';
export { default as Drawer } from './primitives/Drawer.svelte';
export { default as Popover } from './primitives/Popover.svelte';

// ── Icons ────────────────────────────────────────────────────────────────────
export { default as CheckIcon } from './primitives/icons/CheckIcon.svelte';
export { default as ChevronDownIcon } from './primitives/icons/ChevronDownIcon.svelte';
export { default as MoonIcon } from './primitives/icons/MoonIcon.svelte';
export { default as SearchIcon } from './primitives/icons/SearchIcon.svelte';
export { default as SidebarToggleIcon } from './primitives/icons/SidebarToggleIcon.svelte';
export { default as SunIcon } from './primitives/icons/SunIcon.svelte';
