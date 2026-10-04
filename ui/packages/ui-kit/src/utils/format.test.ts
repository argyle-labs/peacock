import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { relTime, fmtUptime } from './format';

const NOW = Date.parse('2026-06-01T12:00:00Z');

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('relTime', () => {
  it('renders em-dash for a missing timestamp', () => {
    expect(relTime(null)).toEqual({ ok: true, text: '—' });
    expect(relTime(undefined)).toEqual({ ok: true, text: '—' });
    expect(relTime(0)).toEqual({ ok: true, text: '—' });
  });

  it('renders a millisecond timestamp as minutes ago (default unit)', () => {
    expect(relTime(NOW - 10 * 60 * 1000)).toEqual({ ok: true, text: '10m ago' });
  });

  it('renders a seconds-unit timestamp as minutes ago', () => {
    expect(relTime(NOW / 1000 - 10 * 60, 's')).toEqual({ ok: true, text: '10m ago' });
  });

  it('treats a seconds value fed through the ms path as implausible', () => {
    // A seconds epoch read as milliseconds resolves to January 1970.
    expect(relTime(NOW / 1000, 'ms').ok).toBe(false);
  });

  it('flags a timestamp from before orca could have existed', () => {
    expect(relTime(Date.parse('2020-06-15T00:00:00Z'))).toEqual({
      ok: false,
      text: 'invalid timestamp',
    });
  });

  it('flags negative inputs as implausible', () => {
    expect(relTime(-5)).toEqual({ ok: false, text: 'invalid timestamp' });
    expect(relTime(-5, 's')).toEqual({ ok: false, text: 'invalid timestamp' });
  });

  it('switches from minutes to hours exactly at the 1h boundary', () => {
    expect(relTime(NOW - 3599 * 1000)).toEqual({ ok: true, text: '59m ago' });
    expect(relTime(NOW - 3600 * 1000)).toEqual({ ok: true, text: '1h ago' });
  });

  it('flags a timestamp beyond the future skew window as implausible', () => {
    expect(relTime(NOW + 6 * 60 * 1000).ok).toBe(false);
    expect(relTime(NOW + 60 * 60 * 1000).ok).toBe(false);
  });

  it('shows clock skew inside the window instead of "just now"', () => {
    expect(relTime(NOW + 30 * 1000)).toEqual({ ok: true, text: '30s ahead (clock skew)' });
    expect(relTime(NOW + 4 * 60 * 1000)).toEqual({ ok: true, text: '4m ahead (clock skew)' });
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

  it('switches from minutes to hours exactly at the 1h boundary', () => {
    expect(fmtUptime(3599)).toBe('59m');
    expect(fmtUptime(3600)).toBe('1h');
  });

  it('flags a negative duration instead of rendering "-1m"', () => {
    expect(fmtUptime(-60)).toBe('invalid duration');
  });
});
