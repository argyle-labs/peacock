# 01 Mount health

As an operator I can see mount health per host, including write failures and
drift, with the fix proposed or applied, so that I can restore storage without
shelling into hosts.

## Preconditions

- Operator is signed in with read access to storage.
- At least one host reports mounts (or none, for the empty state).

## Screen states

- empty: no hosts report mounts.
- loading: first snapshot not yet received.
- populated: every mount healthy.
- error: mount list request fails.
- degraded: some mounts have write failures or drift; one host stale or unreachable.

## Acceptance criteria

- [ ] Mounts are grouped per host, each row showing path, source and status.
- [ ] A mount that reads but fails writes shows a "write failed" badge distinct from "down".
- [ ] A mount whose actual state differs from desired shows a "drift" badge with desired vs actual.
- [ ] A row with a proposed fix shows the plan in a PlanView and an approve control.
- [ ] A row with an applied fix shows the result and timestamp, with no approve control.
- [ ] A stale host is shown as stale, not as healthy.
- [ ] Approving a proposed fix sends exactly one intent and shows pending until the pushed update arrives.
- [ ] The list updates from a pushed event without a manual refresh.
- [ ] The error state shows a Banner with retry; empty shows EmptyState.

## Primitives and patterns

- exists: DataTable, Badge, StatusDot, SectionHead, Spinner, Button
- new: EmptyState, Skeleton, Banner, CodeBlock, PlanView, ApprovalGate, HostResultList

## Orca tools and events

- storage.mount.list (named in brief)
- system.health (named in brief)
- mount fix propose/apply tool: TBD
- mount change event: TBD

## Logic placement

- Server: write-failure detection, drift computation, fix proposal, risk, apply.
- SDK: entity cache keyed by id, WS subscription, optimistic pending state for the approve intent.
- UI: renders the view-model; forwards `approve_fix(mountId)`.
