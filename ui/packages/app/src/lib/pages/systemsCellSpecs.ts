/**
 * The `CellSpec`s used by the `/systems` route's `spec`-driven columns, kept
 * out of `+page.svelte` so the portability round-trip test imports the exact
 * objects the page renders.
 */

import type { CellSpec } from '@peacock/ui-kit';

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

// Labels for `MeshStaleRow.reason`, shown in the Health cell tooltip.
export const staleReasonLabels: Record<string, string> = {
  departed: 'Left the mesh',
  orphan: 'Seen on network, not paired',
  'stale self identity': "This system's former identity",
};

export const offerSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'peer_hostname' },
  addr: { kind: 'addr', hostField: 'peer_addr', portField: 'peer_port' },
  inviter: { kind: 'mono', field: 'inviter_peer_id' },
  ttl: { kind: 'uptime', field: 'ttl_secs' },
};
