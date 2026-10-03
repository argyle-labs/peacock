/**
 * The `CellSpec`s used by the `/systems` route's `spec`-driven columns, kept
 * here (rather than inlined in `+page.svelte`) so the portability round-trip
 * test imports the exact same object the page renders, not a copy that could
 * silently drift from it.
 */

import type { CellSpec } from '@peacock/ui-kit';

export const memberSpecs: Record<string, CellSpec> = {
  health: { kind: 'status', field: 'health' },
  role: { kind: 'badge', field: 'role', toneMap: { local: 'accent' } },
  version: { kind: 'text', field: 'version' },
  lastSeen: { kind: 'relTime', field: 'last_checked' },
};

export const candidateSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'hostname' },
  addr: { kind: 'addr', hostField: 'addr', portField: 'port' },
  invite: {
    kind: 'badge',
    field: 'can_invite',
    toneMap: { true: 'success', false: 'neutral' },
    labelMap: { true: 'yes', false: 'no' },
  },
  fp: { kind: 'mono', field: 'pubkey_fp' },
};

export const staleSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'hostname' },
  addr: { kind: 'addr', hostField: 'addr', portField: 'port' },
  reason: { kind: 'badge', field: 'reason', tone: 'warning' },
  lastSeen: { kind: 'relTime', field: 'last_seen_at' },
};

export const offerSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'peer_hostname' },
  addr: { kind: 'addr', hostField: 'peer_addr', portField: 'peer_port' },
  inviter: { kind: 'mono', field: 'inviter_peer_id' },
  ttl: { kind: 'uptime', field: 'ttl_secs' },
};
