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
    field: 'canInvite',
    toneMap: { true: 'success', false: 'neutral' },
    labelMap: { true: 'yes', false: 'no' },
  },
  fp: { kind: 'mono', field: 'pubkeyFp' },
};

// Labels for `MeshStaleRow.reason`, shown in the Health cell tooltip.
export const staleReasonLabels: Record<string, string> = {
  departed: 'Left the mesh',
  orphan: 'Seen on network, not paired',
  'stale self identity': "This system's former identity",
};

export const offerSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'peerHostname' },
  addr: { kind: 'addr', hostField: 'peerAddr', portField: 'peerPort' },
  inviter: { kind: 'mono', field: 'inviterPeerId' },
  ttl: { kind: 'uptime', field: 'ttlSecs' },
};
