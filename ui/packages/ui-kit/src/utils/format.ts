/** Shared by `Cell`'s `relTime`/`uptime` kinds and by pages that still render
 * these values inside a bespoke snippet (the escape hatch). Lives in ui-kit,
 * not the app, so both paths format identically and never drift apart. */

export function relTime(ts: number | null | undefined): string {
  if (!ts) return '—';
  const sec = Math.round((Date.now() - ts) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  return `${Math.round(sec / 3600)}h ago`;
}

export function fmtUptime(secs: number | null | undefined): string {
  if (secs == null) return '—';
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h`;
  return `${Math.floor(secs / 86400)}d`;
}
