# 07 Service adopt wizard

As an operator I can adopt an existing service through discover, plan, apply and
verify so that orca manages it without breaking it.

## Preconditions

- Operator can manage services.
- A host has a running service not yet managed by orca.

## Screen states

- empty: nothing discoverable.
- loading: discovery, planning, apply or verification in progress.
- populated: each step complete in turn (discover, plan, apply, verify).
- error: a step fails; earlier steps stay visible.
- degraded: apply succeeded but verify reports partial failures.

## Acceptance criteria

- [ ] Steps appear in order: discover, plan, apply, verify, with the current step marked.
- [ ] Discover lists candidates; one must be chosen to continue.
- [ ] Plan shows exactly what will change before apply is enabled.
- [ ] Parameters are collected through a schema form and validated before plan.
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
- adopt apply tool: TBD
- adopt verify tool: TBD
- adopt progress event: TBD

## Logic placement

- Server: discovery, plan generation, apply, verification, step state machine.
- SDK: schema validation, intent submission, subscription.
- UI: renders the current step from the view-model; forwards `choose`, `plan`, `apply`, `verify`.
