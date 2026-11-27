# User stories

Operator stories that drive the peacock UI. Each story is a screen-level
Storybook story with an executable `play()` test, so the acceptance criteria
are checked, not just read.

## Story format

Each file has: title; `As a <role> I can <task> so that <outcome>`;
preconditions; screen states; acceptance criteria; primitives and patterns;
orca tools and events; logic placement.

- Primitive/pattern status: `exists` = exported from
  `ui/packages/ui-kit/src/index.ts`; `new` = not yet built.
- Tool status: a name is listed only when it appears in the planning brief
  or in the committed OpenAPI spec (`ui/packages/app/openapi.json`); anything
  unverified is marked `TBD`. Tools are never invented.

## Layers

tokens -> primitives (`@peacock/ui-kit`) -> patterns (composites that know orca
concepts but not routes) -> screens (`@peacock/app`).

## Story to Storybook mapping

One story file maps to one screen-level Storybook story per screen state
(empty, loading, populated, error, partial/degraded). Each Storybook story:

1. Renders the screen from a view-model.
2. Mocks the orca API with MSW, typed by the generated client.
3. Runs a `play()` test in which each acceptance bullet becomes one assertion.

The same composite ships in the app; stories are not a separate implementation.

## Thin-UI rule

- Server holds as much logic as possible, including all decisions, risk,
  dedupe and rollups.
- The client SDK (Rust, shared) holds only what must run locally: API
  client, entity cache, WS subscription, validation from schemas, optimistic
  updates, state machines.
- The UI is a pure render of a view-model plus forwarded intents. No business
  logic, no polling (server pushes over WS).

## Index

| # | Story | Status |
| --- | --- | --- |
| 01 | [Mount health](01-mount-health.md) | draft |
| 02 | [Approval gate](02-approval-gate.md) | draft |
| 03 | [Tool actions and instance scope](03-tool-actions-instance-scope.md) | draft |
| 04 | [Fleet update rollout](04-fleet-update-rollout.md) | draft |
| 05 | [Notifications inbox](05-notifications-inbox.md) | draft |
| 06 | [Topology and down propagation](06-topology-down-propagation.md) | draft |
| 07 | [Service adopt wizard](07-service-adopt-wizard.md) | draft |

## Primitives gap

Existing primitives: Button, IconButton, ToggleSwitch, SegmentedControl,
Badge, StatusDot, MetricRow, ProgressBar, Spinner, DataTable, Cell, Chart,
SectionHead, Modal, Drawer, Popover.

| Name | Kind | Needed by |
| --- | --- | --- |
| EmptyState | primitive | 01, 02, 03, 04, 05, 06, 07 |
| Skeleton | primitive | 01, 02, 03, 04, 05, 06, 07 |
| Banner (inline alert) | primitive | 01, 02, 04, 05, 06, 07 |
| TextInput | primitive | 03, 07 |
| Select | primitive | 03, 07 |
| Checkbox | primitive | 03, 04, 05 |
| Tabs | primitive | 03, 05 |
| CodeBlock (monospace, diff) | primitive | 01, 02, 07 |
| Stepper | primitive | 04, 07 |
| Toast | primitive | 02, 03, 05 |
| Graph (node-link) | primitive | 06 |
| ViewModelProvider / MSW harness | story infra | all |
| PlanView | pattern | 01, 02, 04, 05, 07 |
| ApprovalGate | pattern | 01, 02, 05 |
| RiskBadge (Badge variant) | pattern | 02, 03, 05 |
| HostResultList | pattern | 01, 04 |
| SchemaForm | pattern | 03, 07 |
| ActionRunner | pattern | 03 |
| InstanceScopePicker | pattern | 03 |
| PerInstanceResult | pattern | 03 |
| NotificationItem | pattern | 05 |
| TopologyView | pattern | 06 |
| WizardShell | pattern | 07 |
