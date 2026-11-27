# 04 Fleet update rollout

As an operator I can preview an update, apply it, and see the per-host result so
that I know exactly which hosts changed and which failed.

## Preconditions

- At least one host has an available update (or none, for empty).
- Operator has permission to apply updates.

## Screen states

- empty: fleet up to date.
- loading: preview being computed.
- populated: preview listing hosts and version changes.
- error: preview or apply request fails.
- degraded: apply in progress or finished with mixed per-host results.

## Acceptance criteria

- [ ] Preview lists each host with current and target version before anything runs.
- [ ] Apply is disabled until a preview exists and is not stale.
- [ ] While applying, each host shows its own progress state.
- [ ] After apply, each host shows success or failure with a reason.
- [ ] A failed host does not mark the rollout as fully successful.
- [ ] Hosts skipped by server policy show the skip reason.
- [ ] Progress updates arrive from pushed events without polling.
- [ ] A high-risk rollout goes through the approval gate (story 02).

## Primitives and patterns

- exists: DataTable, ProgressBar, Badge, Button, StatusDot, SectionHead
- new: Stepper, Checkbox, Banner, EmptyState, Skeleton, PlanView, HostResultList

## Orca tools and events

- update preview tool: TBD
- update apply tool: TBD
- update progress event: TBD
- system.health (named in brief) for host state

## Logic placement

- Server: preview computation, ordering, concurrency, policy skips, per-host execution and rollup.
- SDK: event subscription, pending state.
- UI: renders preview and per-host results; forwards `apply(previewId)`.
