# 04 Fleet update rollout — wireframes

Low-fidelity frames for [story 04](../user-stories/04-fleet-update-rollout.md).
Desktop frames are ~100 columns; the phone frame is ~40 columns.

Acceptance criteria keys:

- AC1 Preview lists each host with current and target version before anything runs.
- AC2 Apply is disabled until a preview exists and is not stale.
- AC3 While applying, each host shows its own progress state.
- AC4 After apply, each host shows success or failure with a reason.
- AC5 A failed host does not mark the rollout as fully successful.
- AC6 Hosts skipped by server policy show the skip reason.
- AC7 Progress updates arrive from pushed events without polling.
- AC8 A high-risk rollout goes through the approval gate (story 02).

## F1 Empty — fleet up to date

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                                         [ Preview update ] (dis.)  |
|  ( Preview )----( Apply )----( Result )                                                          |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|                                         (  check  )                                              |
|                                  All hosts are up to date                                        |
|                           No host has an available update.                                       |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

- Header: SectionHead, Button (Preview update, disabled), Stepper (new).
- Body: EmptyState (new).
- AC2: Apply step not reachable; no preview exists.

## F2 Loading — preview being computed

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                                                    [ Apply ] (dis.)|
|  (*Preview )----( Apply )----( Result )                                                          |
+--------------------------------------------------------------------------------------------------+
|  [ ] Host            Current           Target            Status                                  |
|  ----------------------------------------------------------------------------------------------- |
|  [ ] ░░░░░░░░        ░░░░░░░░          ░░░░░░░░          ░░░░░░                                  |
|  [ ] ░░░░░░░░        ░░░░░░░░          ░░░░░░░░          ░░░░░░                                  |
|  [ ] ░░░░░░░░        ░░░░░░░░          ░░░░░░░░          ░░░░░░                                  |
|                                                                   (spin) Computing preview       |
+--------------------------------------------------------------------------------------------------+
```

- Header: SectionHead, Stepper (new), Button (Apply, disabled).
- Body: DataTable with Skeleton (new) rows, Spinner.
- AC2: Apply disabled while no preview exists.

## F3 Populated — preview ready

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                              Preview computed 12s ago   [ Refresh ] [ Apply 3 ]    |
|  ( Preview*)----( Apply )----( Result )                                                          |
+--------------------------------------------------------------------------------------------------+
| Plan: 3 hosts update, 1 host skipped, order: serial, concurrency 1                    [Risk: low]|
+--------------------------------------------------------------------------------------------------+
|  [x] Host            Current           Target            Status                                  |
|  ----------------------------------------------------------------------------------------------- |
|  [x] (o) host-a      orca 0.14.2       orca 0.15.0       [will update]                           |
|  [x] (o) host-b      orca 0.14.2       orca 0.15.0       [will update]                           |
|  [x] (o) host-c      orca 0.14.1       orca 0.15.0       [will update]                           |
|  [ ] (o) host-d      orca 0.14.2       orca 0.15.0       [skipped] Policy: maintenance window    |
|                                                                    closed until 02:00            |
+--------------------------------------------------------------------------------------------------+
```

- Header: SectionHead, Stepper (new), Button (Refresh, Apply).
- Plan strip: PlanView (new), Badge (risk tone).
- Table: DataTable, Checkbox (new), StatusDot (system.health), Badge, Cell.
- AC1: Current and Target columns per host, rendered before any run.
- AC2: Apply enabled; preview exists and is fresh.
- AC6: host-d row shows skip Badge and server-supplied reason; checkbox disabled.

## F4 Populated — preview stale

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                                    [ Refresh ] [ Apply 3 ] (dis.)  |
|  ( Preview*)----( Apply )----( Result )                                                          |
+--------------------------------------------------------------------------------------------------+
| (!) Preview is stale: fleet state changed since it was computed. Refresh to apply.  [ Refresh ]  |
+--------------------------------------------------------------------------------------------------+
|  [x] Host            Current           Target            Status                                  |
|  [x] (o) host-a      orca 0.14.2       orca 0.15.0       [will update]                           |
|  ...                                                                                             |
+--------------------------------------------------------------------------------------------------+
```

- Banner (new, warning), Button, DataTable.
- AC2: Apply disabled because the server marks the preview stale.

## F5 Approval gate — high-risk rollout

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates (dimmed)                                                                           |
|        +------------------------------------------------------------------------------+          |
|        | Approval required                                              [Risk: high]  |          |
|        |------------------------------------------------------------------------------|          |
|        | Plan: 6 hosts, includes gateway host-gw, parallel 3                          |          |
|        |  host-gw   orca 0.14.2 -> 0.15.0                                             |          |
|        |  host-a    orca 0.14.2 -> 0.15.0   ...                                       |          |
|        |------------------------------------------------------------------------------|          |
|        | Reason from server: rollout touches the gateway host.                        |          |
|        |                                        [ Cancel ]  [ Request approval ]      |          |
|        +------------------------------------------------------------------------------+          |
+--------------------------------------------------------------------------------------------------+
```

- Modal, PlanView (new), RiskBadge (Badge variant), ApprovalGate (story 02), Button.
- AC8: Apply on a high-risk preview opens the approval gate instead of running.

## F6 Applying — in progress

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                              Rollout running    2 of 3 done        |
|  ( Preview )----( Apply*)----( Result )                                                          |
|  [=====================================-------------------]  66%                                 |
+--------------------------------------------------------------------------------------------------+
|  Host              Target            State                                                       |
|  ----------------------------------------------------------------------------------------------- |
|  (o) host-a        orca 0.15.0       [updated]                                                   |
|  (o) host-b        orca 0.15.0       [updated]                                                   |
|  (~) host-c        orca 0.15.0       [restarting]   [====------]                                 |
|  (-) host-d        orca 0.15.0       [skipped] Policy: maintenance window closed until 02:00     |
+--------------------------------------------------------------------------------------------------+
```

- Header: SectionHead, Stepper (new), ProgressBar (rollup from server).
- Body: HostResultList (new) with StatusDot, Badge, per-row ProgressBar.
- AC3: each host row carries its own state and progress.
- AC6: skipped host keeps its reason.
- AC7: rows change on pushed progress events; no refresh control, no poll.

## F7 Degraded — finished with mixed results

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                        [Partial: 2 updated, 1 failed, 1 skipped]   |
|  ( Preview )----( Apply )----( Result*)                                                          |
+--------------------------------------------------------------------------------------------------+
| (x) Rollout finished with failures. 1 host did not update.                     [ New preview ]   |
+--------------------------------------------------------------------------------------------------+
|  Host              Before         After          Result                                          |
|  ----------------------------------------------------------------------------------------------- |
|  (o) host-a        0.14.2         0.15.0         [success]                                       |
|  (o) host-b        0.14.2         0.15.0         [success]                                       |
|  (x) host-c        0.14.1         0.14.1         [failed] Health check failed after restart      |
|  (-) host-d        0.14.2         0.14.2         [skipped] Policy: maintenance window closed     |
+--------------------------------------------------------------------------------------------------+
```

- Header: SectionHead, Stepper (new), Badge (warning rollup).
- Banner (new, error), Button.
- Body: HostResultList (new), StatusDot, Badge.
- AC4: every host shows success or failure; failures carry a server reason.
- AC5: rollup Badge reads Partial, not Success, when any host failed.
- AC6: skip reason retained in result.

## F8 Healthy — finished, all succeeded

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                                       [Success: 3 updated]         |
|  ( Preview )----( Apply )----( Result*)                                                          |
+--------------------------------------------------------------------------------------------------+
|  (o) host-a        0.14.2         0.15.0         [success]                                       |
|  (o) host-b        0.14.2         0.15.0         [success]                                       |
|  (o) host-c        0.14.1         0.15.0         [success]                                       |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, Stepper (new), Badge (success), HostResultList (new).
- AC4: per-host success. AC5: Success rollup only when no host failed.

## F9 Error — preview or apply request fails

```text
+--------------------------------------------------------------------------------------------------+
| Fleet updates                                                                    [ Apply ] (dis.)|
|  ( Preview*)----( Apply )----( Result )                                                          |
+--------------------------------------------------------------------------------------------------+
| (x) Preview failed: update service unreachable on 2 members.                       [ Retry ]     |
+--------------------------------------------------------------------------------------------------+
|                                         (  !  )                                                   |
|                                   No preview available                                           |
+--------------------------------------------------------------------------------------------------+
```

- Banner (new, error) with server message, Button (Retry), EmptyState (new).
- AC2: Apply disabled; no valid preview. Apply failure uses the same Banner
  above the preview table, which stays visible.

## F10 Host detail drawer

```text
+------------------------------------------------------------+-------------------------------------+
| Fleet updates (result table)                               | host-c                         [x]  |
|                                                            |-------------------------------------|
|                                                            | (x) failed                          |
|                                                            | Before   orca 0.14.1                |
|                                                            | Target   orca 0.15.0                |
|                                                            | Reason   Health check failed after  |
|                                                            |          restart                    |
|                                                            | Steps  download ok / install ok /   |
|                                                            |        restart failed               |
+------------------------------------------------------------+-------------------------------------+
```

- Drawer, StatusDot, MetricRow, Badge.
- AC4: full failure reason and step outcome per host.

## F11 Phone — preview ready (main state)

```text
+--------------------------------------+
| Fleet updates                        |
| (1 Preview*)-(2)-(3)                 |
| Plan: 3 update, 1 skipped [Risk:low] |
|--------------------------------------|
| [x] (o) host-a                       |
|     0.14.2 -> 0.15.0  [will update]  |
| [x] (o) host-b                       |
|     0.14.2 -> 0.15.0  [will update]  |
| [x] (o) host-c                       |
|     0.14.1 -> 0.15.0  [will update]  |
| [ ] (o) host-d          [skipped]    |
|     Policy: maintenance window       |
|     closed until 02:00               |
|--------------------------------------|
| [ Refresh ]        [   Apply 3    ]  |
+--------------------------------------+
```

- Stepper (new, compact), PlanView (new), Badge, Checkbox (new), StatusDot,
  DataTable in stacked-row layout, Button bar pinned bottom.
- AC1, AC2, AC6 as in F3.

## Flow

1. F1 Empty or F3 entry. `Preview update` sends `preview()` (update preview tool: TBD) -> F2.
2. F2 -> F3 when the preview arrives, or F9 on failure. `Retry` sends `preview()`.
3. F3: checkbox toggles adjust the selection; server-skipped hosts are not selectable.
   A pushed fleet change marks the preview stale -> F4; `Refresh` sends `preview()`.
4. F3 `Apply` sends `apply(previewId)` (update apply tool: TBD).
   - High-risk preview -> F5; `Request approval` hands off to the story 02 gate;
     once approved the rollout starts -> F6. `Cancel` returns to F3.
   - Otherwise -> F6.
5. F6 rows update from the update progress event (TBD) over WS -> F7 or F8 on completion.
   Apply request failure -> F9 Banner over F3.
6. F7/F8: selecting a host row opens F10. `New preview` sends `preview()` -> F2.
