# 03 Tool actions and instance scope

As an operator I can list tools, open one, and run an action on all instances or
exactly one so that I can act on radarr without touching radarr4k by accident.

Example: `add` targets exactly one instance; `search` fans out to all and
reports per instance.

## Preconditions

- Operator is signed in; at least one tool is registered.
- A tool may have multiple instances (for example radarr and radarr4k).
- radarr and radarr4k are two instances of ONE tool, each reported separately: `search` and read actions fan out with per-instance results; `add` targets exactly one instance.

## Screen states

- empty: no tools registered.
- loading: tool list or detail loading.
- populated: tool detail with actions and instances.
- error: list, detail or run request fails.
- degraded: some instances unreachable; a fan-out run has mixed per-instance results.

## Acceptance criteria

- [ ] The tool list shows each tool by name and opens detail by id (equivalent to `orca tool --id <toolId>`).
- [ ] Detail lists actions with a form generated from the action's parameter schema.
- [ ] Each action's instance cardinality (single or fan-out) is read from its action schema; the UI never hardcodes it.
- [ ] An action marked single-instance (`add`) requires choosing exactly one instance and cannot run without it.
- [ ] The server rejects an `add` that names no instance or more than one; the UI shows that error and never guesses a default instance.
- [ ] An action marked fan-out (`search`) defaults to all instances and may be narrowed to one.
- [ ] After a fan-out run, results are listed per instance with success or error each.
- [ ] One failing instance does not hide the others' results.
- [ ] High-risk actions show the risk badge and route to the approval gate (story 02).
- [ ] Invalid parameters are flagged before submit using schema validation.
- [ ] Unreachable instances are shown disabled in the scope picker.

## Primitives and patterns

- exists: DataTable, Button, Badge, SegmentedControl, Spinner, SectionHead
- new: TextInput, Select, Checkbox, Tabs, Toast, EmptyState, Skeleton, SchemaForm, ActionRunner, InstanceScopePicker, PerInstanceResult, RiskBadge

## Orca tools and events

- tool list tool: TBD
- tool detail by id (`orca tool --id`): CLI named in brief; API tool name TBD
- tool action run tool: TBD
- run result event: TBD

## Logic placement

- Server: action schemas, instance cardinality rules (single vs fan-out) and their enforcement (rejecting an `add` with zero or multiple instances), fan-out execution, per-instance results, risk.
- SDK: schema-driven validation, intent submission, result cache.
- UI: reads the instance requirement from the action schema only; does not enforce or default it. Renders SchemaForm and results from the view-model; forwards `run(toolId, action, params, scope)`.
