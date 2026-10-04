import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cell, { _resetPathErrorLogForTest } from './Cell.svelte';
import type { CellSpec } from '../types';

function renderCell(spec: CellSpec, row: unknown) {
  return render(Cell, { props: { spec, row } });
}

beforeEach(() => {
  _resetPathErrorLogForTest();
});

describe('Cell', () => {
  it('renders text, with an em-dash for a missing field', () => {
    const { container } = renderCell({ kind: 'text', field: 'name' }, { name: 'frigg' });
    expect(container.textContent).toContain('frigg');
  });

  it('renders em-dash for text when the field is missing', () => {
    const { container } = renderCell({ kind: 'text', field: 'name' }, {});
    expect(container.textContent?.trim()).toBe('—');
  });

  it('renders em-dash for text when the field is null', () => {
    const { container } = renderCell({ kind: 'text', field: 'name' }, { name: null });
    expect(container.textContent?.trim()).toBe('—');
  });

  it('renders mono with monospace styling', () => {
    const { container } = renderCell({ kind: 'mono', field: 'id' }, { id: 'abc123' });
    expect(container.querySelector('.mono')?.textContent).toBe('abc123');
  });

  it('renders status "up" as a healthy StatusDot', () => {
    renderCell({ kind: 'status', field: 'health' }, { health: 'up' });
    expect(screen.getByText(/up/)).toBeTruthy();
  });

  it('renders status for an unrecognised value as unknown, not a crash', () => {
    const { container } = renderCell({ kind: 'status', field: 'health' }, { health: 'weird' });
    expect(container.querySelector('.unknown')).toBeTruthy();
  });

  it('renders badge with the default tone and the field value as label', () => {
    const { container } = renderCell({ kind: 'badge', field: 'role' }, { role: 'peer' });
    expect(container.querySelector('.badge')?.textContent).toBe('peer');
  });

  it('applies toneMap/labelMap keyed on the stringified field value', () => {
    const { container } = renderCell(
      {
        kind: 'badge',
        field: 'can_invite',
        toneMap: { true: 'success', false: 'neutral' },
        labelMap: { true: 'yes', false: 'no' },
      },
      { can_invite: true },
    );
    expect(container.querySelector('.badge')?.textContent).toBe('yes');
  });

  it('renders relTime for a timestamp and em-dash for a missing one', () => {
    const { container: a } = renderCell({ kind: 'relTime', field: 'ts' }, { ts: Date.now() });
    expect(a.textContent).toMatch(/now|ago/);
    const { container: b } = renderCell({ kind: 'relTime', field: 'ts' }, {});
    expect(b.textContent?.trim()).toBe('—');
  });

  it("renders relTime with unit 's' as an epoch-seconds value", () => {
    const tenMinutesAgoSec = Math.round(Date.now() / 1000) - 10 * 60;
    const { container } = renderCell(
      { kind: 'relTime', field: 'ts', unit: 's' },
      { ts: tenMinutesAgoSec },
    );
    expect(container.textContent?.trim()).toBe('10m ago');
    expect(container.querySelector('.path-error')).toBeNull();
  });

  it('renders an implausible relTime as the error state with the raw value in the title', () => {
    const secondsReadAsMs = Math.round(Date.now() / 1000);
    const { container } = renderCell({ kind: 'relTime', field: 'ts' }, { ts: secondsReadAsMs });
    const err = container.querySelector('.path-error');
    expect(err).toBeTruthy();
    expect(err?.textContent).toContain('invalid timestamp');
    expect(err?.getAttribute('title')).toBe(`implausible timestamp: ${secondsReadAsMs}`);
    expect(err?.querySelector('[aria-hidden="true"]')?.textContent).toBe('⚠');
  });

  it('renders uptime for a duration and em-dash for a missing one', () => {
    const { container: a } = renderCell({ kind: 'uptime', field: 'secs' }, { secs: 7200 });
    expect(a.textContent?.trim()).toBe('2h');
    const { container: b } = renderCell({ kind: 'uptime', field: 'secs' }, {});
    expect(b.textContent?.trim()).toBe('—');
  });

  it('renders addr as host:port, and em-dash when either side is missing', () => {
    const { container: a } = renderCell(
      { kind: 'addr', hostField: 'addr', portField: 'port' },
      { addr: '10.0.0.5', port: 8080 },
    );
    expect(a.textContent?.trim()).toBe('10.0.0.5:8080');
    const { container: b } = renderCell(
      { kind: 'addr', hostField: 'addr', portField: 'port' },
      { addr: '10.0.0.5' },
    );
    expect(b.textContent?.trim()).toBe('—');
  });

  it('resolves a dotted path through an array index', () => {
    const { container } = renderCell(
      { kind: 'text', field: 'items.1.name' },
      { items: [{ name: 'x' }, { name: 'y' }] },
    );
    expect(container.textContent?.trim()).toBe('y');
  });

  it('renders the path-error state for a non-navigable path, distinct from the em-dash', () => {
    // Typo on the INTERMEDIATE segment ("daemonn"): `health` exists but
    // `health.daemonn` does not, so `.running` can never be reached — this
    // is the case `resolvePath` can always catch at runtime. A typo on the
    // trailing segment (e.g. "running" -> "runnning") is indistinguishable
    // from a legitimately-omitted optional field and is NOT caught here;
    // see the `PathResult` docblock in `../types.ts`.
    const { container } = renderCell({ kind: 'text', field: 'health.daemonn.running' }, {
      health: { daemon: { running: true } },
    } as unknown as Record<string, unknown>);
    const err = container.querySelector('.path-error');
    expect(err).toBeTruthy();
    expect(container.textContent?.trim()).not.toBe('—');
    expect(err?.getAttribute('title')).toContain('health.daemonn.running');
  });

  it('renders the path-error state for addr when either side is non-navigable', () => {
    const { container } = renderCell(
      { kind: 'addr', hostField: 'peer.addr', portField: 'port' },
      { port: 8080 },
    );
    expect(container.querySelector('.path-error')).toBeTruthy();
  });

  it('never throws for a non-navigable path, across every kind', () => {
    const specs: CellSpec[] = [
      { kind: 'text', field: 'bogus.path' },
      { kind: 'mono', field: 'bogus.path' },
      { kind: 'status', field: 'bogus.path' },
      { kind: 'badge', field: 'bogus.path' },
      { kind: 'relTime', field: 'bogus.path' },
      { kind: 'uptime', field: 'bogus.path' },
      { kind: 'addr', hostField: 'bogus.path', portField: 'bogus.path' },
    ];
    for (const spec of specs) {
      expect(() => renderCell(spec, { bogus: 5 })).not.toThrow();
    }
  });

  it('logs a non-navigable path to the console once per unique path, even across many rows', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 50; i++) {
      renderCell({ kind: 'text', field: 'bogus.path' }, { bogus: 5 });
    }
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('logs each distinct non-navigable path separately', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderCell({ kind: 'text', field: 'bogus.a' }, { bogus: 5 });
    renderCell({ kind: 'text', field: 'bogus.b' }, { bogus: 5 });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
