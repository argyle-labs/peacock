import { describe, it, expect } from 'vitest';
import { resolvePath } from './types';

describe('resolvePath', () => {
  it('resolves a top-level field', () => {
    expect(resolvePath({ a: 1 }, 'a')).toEqual({ ok: true, value: 1 });
  });

  it('resolves a nested dotted path', () => {
    expect(resolvePath({ health: { daemon: { running: true } } }, 'health.daemon.running')).toEqual(
      { ok: true, value: true },
    );
  });

  it('resolves an array index segment', () => {
    expect(resolvePath({ items: [{ name: 'x' }, { name: 'y' }] }, 'items.1.name')).toEqual({
      ok: true,
      value: 'y',
    });
  });

  it('reports not-navigable for a missing intermediate', () => {
    expect(resolvePath({ health: {} }, 'health.daemon.running')).toEqual({ ok: false });
  });

  it('reports not-navigable for a null leaf parent', () => {
    expect(resolvePath({ health: { daemon: null } }, 'health.daemon.running')).toEqual({
      ok: false,
    });
  });

  it('resolves a null leaf value as-is when the path terminates there (ok, not an error)', () => {
    expect(resolvePath({ error: null }, 'error')).toEqual({ ok: true, value: null });
  });

  it('resolves an undefined leaf value as-is when the key is simply absent (ok, not an error)', () => {
    expect(resolvePath({}, 'name')).toEqual({ ok: true, value: undefined });
  });

  it('reports not-navigable for a path through a non-object', () => {
    expect(resolvePath({ a: 5 }, 'a.b')).toEqual({ ok: false });
  });

  it('reports not-navigable when the row itself is null or undefined', () => {
    expect(resolvePath(null, 'a')).toEqual({ ok: false });
    expect(resolvePath(undefined, 'a')).toEqual({ ok: false });
  });
});
