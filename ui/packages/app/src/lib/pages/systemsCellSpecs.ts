/**
 * The `CellSpec`s used by the `/systems` route's `spec`-driven columns, kept
 * here (rather than inlined in `+page.svelte`) so the portability round-trip
 * test imports the exact same object the page renders, not a copy that could
 * silently drift from it.
 */

import type { CellSpec } from '@peacock/ui-kit';

// No `role` column: the local system is marked on the Hostname cell. No
// `lastSeen` column: `last_checked` is the Health cell's tooltip (see
// `+page.svelte`).
export const memberSpecs: Record<string, CellSpec> = {
  health: { kind: 'status', field: 'health' },
  version: { kind: 'text', field: 'version' },
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

// `MeshStaleRow.reason` is `"departed" | "orphan" | "stale self identity"`.
// `stale[]` rows are NOT a separate category in the UI — hemlock and bragi
// are paired systems (an `orphan` row just means orca's discovery view and
// its active-member roster disagree about that peer's identity; see the
// orca-side gap noted in `+page.svelte`). They're merged into the one
// systems table there, with `reason` surfaced as information in the Health
// cell's tooltip, never as a badge that partitions rows into tiers.
export const staleReasonLabels: Record<string, string> = {
  departed: 'Left the mesh',
  orphan: 'Seen on network, not paired',
  'stale self identity': "This system's former identity",
};

// Kept for portability (round-trip test + any future native rendering of
// this row shape) even though `+page.svelte` renders `stale[]` rows via its
// own escape-hatch cells rather than these specs directly.
export const staleSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'hostname' },
  addr: { kind: 'addr', hostField: 'addr', portField: 'port' },
  reason: { kind: 'badge', field: 'reason', tone: 'neutral', labelMap: staleReasonLabels },
  // Measured: `stale[].last_seen_at` is epoch SECONDS (unlike
  // `members[].last_checked`, which is milliseconds — see memberSpecs above).
  lastSeen: { kind: 'relTime', field: 'last_seen_at', unit: 's' },
};

export const offerSpecs: Record<string, CellSpec> = {
  hostname: { kind: 'text', field: 'peer_hostname' },
  addr: { kind: 'addr', hostField: 'peer_addr', portField: 'peer_port' },
  inviter: { kind: 'mono', field: 'inviter_peer_id' },
  ttl: { kind: 'uptime', field: 'ttl_secs' },
};
