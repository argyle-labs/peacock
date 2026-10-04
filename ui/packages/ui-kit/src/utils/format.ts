/** Shared by `Cell`'s `relTime`/`uptime` kinds and by pages that still render
 * these values inside a bespoke snippet (the escape hatch). Lives in ui-kit,
 * not the app, so both paths format identically and never drift apart. */

/**
 * `relTime`'s result is a discriminated union, not a bare string, because an
 * implausible timestamp must be visually distinguishable from a real "3m
 * ago" — see `EARLIEST_PLAUSIBLE_MS`/`FUTURE_SKEW_MS` below. Collapsing both
 * into the same string is exactly the silent-degradation failure mode this
 * project treats as a defect (measured: orca's `system.list` response has
 * mixed `last_checked` milliseconds and `last_seen_at` seconds within the
 * SAME payload — feeding a seconds value through the millisecond path
 * resolves to Jan 1970 and renders a confident-looking "497013h ago").
 */
export type RelTimeResult = { ok: true; text: string } | { ok: false; text: string };

// orca did not exist before this date — any resolved timestamp earlier than
// it is not "old data", it's a unit-mismatch bug (e.g. a seconds value fed
// through the milliseconds path, which lands in 1970).
const EARLIEST_PLAUSIBLE_MS = Date.parse('2023-01-01T00:00:00Z');
// Small allowance for clock skew between hosts; anything further in the
// future than this is a bug, not a fast clock.
const FUTURE_SKEW_MS = 60 * 60 * 1000;

/** @param unit the epoch unit of `ts` — callers must know this, not guess it
 * (see the module docblock); defaults to `'ms'` to match the existing
 * `CellSpec` contract. */
export function relTime(ts: number | null | undefined, unit: 'ms' | 's' = 'ms'): RelTimeResult {
  if (!ts) return { ok: true, text: '—' };
  const ms = unit === 's' ? ts * 1000 : ts;
  const now = Date.now();
  if (ms < EARLIEST_PLAUSIBLE_MS || ms > now + FUTURE_SKEW_MS) {
    return { ok: false, text: 'invalid timestamp' };
  }
  const sec = Math.round((now - ms) / 1000);
  if (sec < 5) return { ok: true, text: 'just now' };
  if (sec < 60) return { ok: true, text: `${sec}s ago` };
  if (sec < 3600) return { ok: true, text: `${Math.round(sec / 60)}m ago` };
  return { ok: true, text: `${Math.round(sec / 3600)}h ago` };
}

export function fmtUptime(secs: number | null | undefined): string {
  if (secs == null) return '—';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}
