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
