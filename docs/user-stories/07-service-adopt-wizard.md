# 07 Service adopt wizard

As an operator I can adopt an existing service through discover, plan, backup,
apply and verify so that orca manages it without breaking it, and a failed
adopt restores the service from backup.

## Preconditions

- Operator can manage services.
- A host has a running service not yet managed by orca.

## Screen states

- empty: nothing discoverable.
- loading: discovery, planning, apply or verification in progress.
- populated: each step complete in turn (discover, plan, backup, apply, verify).
- error: a step fails; earlier steps stay visible.
- degraded: apply succeeded but verify reports partial failures.
- awaiting approval: the plan is high risk; the full plan is shown and apply is blocked until approved.
- backing up: backup in progress.
- backup failed: backup did not complete; apply stays disabled; retry offered.
- rolling back: restore from backup in progress after a failed or partial apply.
- rolled back: service restored; shows the reason and the failing step.
- rollback failed: needs operator action; shows what is left in place.

## Acceptance criteria

- [ ] Steps appear in order: discover, plan, backup, apply, verify, with the current step marked.
- [ ] Discover lists candidates; one must be chosen to continue.
- [ ] Plan shows exactly what will change before apply is enabled.
- [ ] Parameters are collected through a schema form and validated before plan.
- [ ] The plan lists what will be backed up.
- [ ] Apply cannot start until the backup is confirmed.
- [ ] A high-risk plan (for example one that edits the fleet reverse proxy) requires approval before apply, through the approval gate ([story 02](02-approval-gate.md)); the full plan is shown while awaiting approval.
- [ ] A failed or partial apply triggers automatic rollback: the service is restored from the backup.
- [ ] A failed verify triggers rollback.
- [ ] A rolled back result shows the reason and the failing step.
- [ ] A rollback failure shows what is left in place and that operator action is needed.
- [ ] Apply cannot run twice for the same plan.
- [ ] Verify reports per-check pass or fail.
- [ ] A failed step offers retry and does not advance.
- [ ] Leaving mid-wizard does not apply anything not yet confirmed.

## Primitives and patterns

- exists: Button, Badge, Spinner, ProgressBar, SectionHead, DataTable
- new: Stepper, TextInput, Select, CodeBlock, Banner, EmptyState, Skeleton, SchemaForm, PlanView, WizardShell

## Orca tools and events

- adopt discover tool: TBD
- adopt plan tool: TBD
- adopt backup tool: TBD
- adopt apply tool: TBD
- adopt rollback tool: TBD
- adopt approval tool: TBD
- adopt verify tool: TBD
- adopt progress event: TBD

## Logic placement

- Server (core executor): discovery, plan generation, risk assessment, backup, apply, rollback, verification, step state machine.
- SDK: schema validation, intent submission, subscription; mirrors backup, apply and rollback progress into the view-model.
- UI: renders the step list from the view-model; forwards `choose`, `plan`, `apply`, `verify`.
