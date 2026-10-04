/** Shared by `Cell`'s `relTime`/`uptime` kinds and by pages that render these
 * values inside a bespoke snippet, so both paths format identically. */

/** `ok: false` marks a timestamp outside the plausible window — typically an
 * epoch-unit mismatch (seconds read as milliseconds lands in 1970; orca#700). Callers
 * must render it distinctly from a real "3m ago". */
export type RelTimeResult = { ok: true; text: string } | { ok: false; text: string };

// orca did not exist before this date, so anything earlier is a unit bug.
const EARLIEST_PLAUSIBLE_MS = Date.parse('2023-01-01T00:00:00Z');
// Inter-host clock skew tolerated before a future timestamp counts as a bug.
// Skew inside this window is still shown ("… ahead"), never "just now".
const FUTURE_SKEW_MS = 5 * 60 * 1000;

function fmtAgo(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  return `${Math.floor(sec / 3600)}h`;
}

/** @param unit the epoch unit of `ts`; callers must know it, not guess it. */
export function relTime(ts: number | null | undefined, unit: 'ms' | 's' = 'ms'): RelTimeResult {
  if (ts == null || ts === 0) return { ok: true, text: '—' };
  const ms = unit === 's' ? ts * 1000 : ts;
  const now = Date.now();
  if (!Number.isFinite(ms) || ms < EARLIEST_PLAUSIBLE_MS || ms > now + FUTURE_SKEW_MS) {
    return { ok: false, text: 'invalid timestamp' };
  }
  const sec = Math.round((now - ms) / 1000);
  if (sec < 0) return { ok: true, text: `${fmtAgo(-sec)} ahead (clock skew)` };
  if (sec < 5) return { ok: true, text: 'just now' };
  return { ok: true, text: `${fmtAgo(sec)} ago` };
}

export function fmtUptime(secs: number | null | undefined): string {
  if (secs == null) return '—';
  if (secs < 0 || !Number.isFinite(secs)) return 'invalid duration';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}
