import type { GpuInfo } from '$lib/client/types.gen';

// `relTime`/`fmtUptime` moved to @peacock/ui-kit — `Cell`'s `relTime`/`uptime`
// kinds need them, and a page-level snippet (the escape hatch) should format
// identically rather than keeping a second copy. Re-exported here so existing
// call sites don't need to know where they live.
export { relTime, fmtUptime } from '@peacock/ui-kit';

export function fmtMb(mb: number | null | undefined): string {
  if (mb == null) return '—';
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${mb} MB`;
}

export function fmtGb(gb: number): string {
  return `${gb.toFixed(1)} GB`;
}

export function fmtGpu(g: GpuInfo): string {
  const util = g.utilizationPercent != null ? ` ${g.utilizationPercent.toFixed(0)}%` : '';
  return `${g.name}${util}`;
}
