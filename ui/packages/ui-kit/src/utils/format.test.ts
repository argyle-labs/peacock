import { describe, it, expect } from 'vitest';
import { relTime, fmtUptime } from './format';

describe('relTime', () => {
  it('renders em-dash for a missing timestamp', () => {
    expect(relTime(null)).toEqual({ ok: true, text: '—' });
    expect(relTime(undefined)).toEqual({ ok: true, text: '—' });
    expect(relTime(0)).toEqual({ ok: true, text: '—' });
  });

  it('renders a millisecond timestamp as minutes ago (default unit)', () => {
    const tenMinutesAgoMs = Date.now() - 10 * 60 * 1000;
    expect(relTime(tenMinutesAgoMs)).toEqual({ ok: true, text: '10m ago' });
  });

  it('renders a seconds-unit timestamp as minutes ago', () => {
    const tenMinutesAgoSec = Math.round(Date.now() / 1000) - 10 * 60;
    expect(relTime(tenMinutesAgoSec, 's')).toEqual({ ok: true, text: '10m ago' });
  });

  it('treats a seconds value fed through the ms path as implausible', () => {
    // Measured bug: `last_seen_at` (seconds) run through the ms-assuming
    // path resolves to 1970 — ~497013h ago — and must be flagged, not
    // formatted as if it were a real timestamp.
    const secondsValueMisreadAsMs = Math.round(Date.now() / 1000);
    const result = relTime(secondsValueMisreadAsMs, 'ms');
    expect(result.ok).toBe(false);
  });

  it('flags a timestamp from before orca could have existed', () => {
    const result = relTime(Date.parse('2020-06-15T00:00:00Z'));
    expect(result).toEqual({ ok: false, text: 'invalid timestamp' });
  });

  it('flags a timestamp far in the future as implausible', () => {
    const result = relTime(Date.now() + 24 * 60 * 60 * 1000);
    expect(result.ok).toBe(false);
  });

  it('allows a small amount of future clock skew', () => {
    const result = relTime(Date.now() + 30 * 1000);
    expect(result.ok).toBe(true);
  });
});

describe('fmtUptime', () => {
  it('renders em-dash for a missing duration', () => {
    expect(fmtUptime(null)).toBe('—');
    expect(fmtUptime(undefined)).toBe('—');
  });

  it('renders hours for a duration under a day', () => {
    expect(fmtUptime(7200)).toBe('2h');
  });
});
