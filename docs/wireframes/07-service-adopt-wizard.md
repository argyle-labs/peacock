# 07 Service adopt wizard — wireframes

Low-fidelity frames for [story 07](../user-stories/07-service-adopt-wizard.md).
Desktop frames are 100 columns; the phone frame is 40 columns. AC numbers refer
to the acceptance criteria in story order:

1. Steps in order, current marked
2. Discover lists candidates; one must be chosen
3. Plan shows exactly what changes before apply is enabled
4. Parameters via schema form, validated before plan
5. Plan lists what will be backed up
6. Apply blocked until backup confirmed
7. High-risk plan requires approval; full plan shown while awaiting
8. Failed/partial apply triggers automatic rollback
9. Failed verify triggers rollback
10. Rolled back shows reason and failing step
11. Rollback failure shows what is left in place and operator action needed
12. Apply cannot run twice for the same plan
13. Verify reports per-check pass/fail
14. Failed step offers retry and does not advance
15. Leaving mid-wizard applies nothing unconfirmed

Stepper legend: `(*)` current, `(v)` done, `(x)` failed, `( )` pending.

## F1 Loading (discovery in progress)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service                                                                       [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (*) Discover ---- ( ) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| Host  [ freyr                v ]                                                                  |
|                                                                                                  |
| (o) Discovering services on freyr...                                                              |
| [::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::] |
| [::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::] |
| [::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::] |
|                                                                                                  |
|                                                                        [ Continue ] (disabled)   |
+--------------------------------------------------------------------------------------------------+
```

- WizardShell (new): header, Cancel, footer actions.
- Stepper (new): AC1.
- Select (new): host picker.
- Spinner + Skeleton (new) rows: loading state.
- Button (disabled Continue): AC2.

## F2 Empty (nothing discoverable)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service                                                                       [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (*) Discover ---- ( ) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| Host  [ freyr                v ]                                                                  |
|                                                                                                  |
|                        +--------------------------------------------------+                      |
|                        |        No unmanaged services on freyr            |                      |
|                        |  Every running service here is managed by orca.  |                      |
|                        |               [ Discover again ]                 |                      |
|                        +--------------------------------------------------+                      |
|                                                                                                  |
|                                                                        [ Continue ] (disabled)   |
+--------------------------------------------------------------------------------------------------+
```

- EmptyState (new) with Button: empty state.
- Stepper: AC1. Disabled Continue: AC2.

## F3 Discover populated (choose a candidate)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service                                                                       [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (*) Discover ---- ( ) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| Host  [ freyr                v ]                                                                  |
| SectionHead: Candidates (3)                                                                       |
| +----+----------------+-----------+------------------------+-----------+                          |
| |    | Service        | Kind      | Image / unit           | Status    |                          |
| +----+----------------+-----------+------------------------+-----------+                          |
| | (o)| lazylibrarian  | container | linuxserver/lazylib... | [running] |                          |
| | ( )| calibre-web    | container | linuxserver/calibre... | [running] |                          |
| | ( )| node-exporter  | systemd   | node_exporter.service  | [running] |                          |
| +----+----------------+-----------+------------------------+-----------+                          |
|                                                                                                  |
|                                                                                 [ Continue ]     |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, DataTable + Cell, Badge (status): AC2 candidate list.
- Continue enabled only with a selection: AC2. Sends `choose`.

## F4 Plan parameters (schema form)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (*) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| SectionHead: Parameters                                                                           |
| Instance name   [ lazylibrarian           ]                                                       |
| Data path       [ /mnt/data/books         ]                                                       |
| Port            [ 52x0                    ]  ! Must be a number between 1 and 65535               |
| Update channel  [ stable             v    ]                                                       |
|                                                                                                  |
|                                                         [ Back ]   [ Generate plan ] (disabled)  |
+--------------------------------------------------------------------------------------------------+
```

- SchemaForm (new) of TextInput + Select (new) with inline validation: AC4.
- Generate plan disabled while invalid: AC4. Sends `plan`.

## F5 Plan populated (low risk)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (*) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| SectionHead: Changes (4)                                          Risk [low]                      |
| | + create  orca service record lazylibrarian                                                    |
| | ~ modify  container labels lazylibrarian (+orca.managed, +orca.id)                             |
| | ~ modify  restart policy: unless-stopped -> always                                             |
| | + create  health check http://:5299/                                                           |
| SectionHead: Will be backed up (2)                                                                |
| | /config            (container volume, 41 MB)                                                    |
| | container spec     (inspect snapshot)                                                           |
| > Show raw plan                                                                                   |
|   +----------------------------------------------------------------------------------------+     |
|   | CodeBlock: plan JSON                                                                    |     |
|   +----------------------------------------------------------------------------------------+     |
|                                                                 [ Back ]   [ Back up ]          |
+--------------------------------------------------------------------------------------------------+
```

- PlanView (new): change list, Badge risk, backup list, CodeBlock raw plan: AC3, AC5.
- No Apply button at this step; next action is Back up: AC3, AC6.

## F6 Awaiting approval (high-risk plan)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (*) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [!] Banner (warning): This plan edits the fleet reverse proxy. Apply is blocked until approved.   |
|     Approval requested from: admins                         Status [awaiting approval]           |
|--------------------------------------------------------------------------------------------------|
| SectionHead: Changes (5)                                          Risk [high]                     |
| | ~ modify  caddy route books.<domain> -> freyr:5299                                             |
| | + create  orca service record lazylibrarian                                                    |
| | ...                                                                                            |
| SectionHead: Will be backed up (3)                                                                |
| | caddy config, /config, container spec                                                          |
|                                                                                                  |
|                                                   [ Back ]   [ Back up ]   [ Apply ] (disabled)   |
+--------------------------------------------------------------------------------------------------+
```

- Banner (new), Badge, PlanView (full plan): AC7.
- Approval rendered by the approval-gate pattern from story 02: AC7.
- Apply disabled until approval and backup confirmed: AC6, AC7.

## F7 Backing up

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (*) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| (o) Backing up 2 items                                                                            |
| /config          [##################..............]  58%                                          |
| container spec   [v] done                                                                         |
|                                                                                                  |
|                                                                        [ Apply ] (disabled)       |
+--------------------------------------------------------------------------------------------------+
```

- Spinner, ProgressBar per item, Badge: backing-up state.
- Apply disabled until backup confirmed: AC6.

## F8 Backup failed

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (x) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [x] Banner (error): Backup did not complete. /config: destination full (maple:/backups).          |
| /config          [x] failed                                                                       |
| container spec   [v] done                                                                         |
|                                                                                                  |
|                                                    [ Retry backup ]   [ Apply ] (disabled)        |
+--------------------------------------------------------------------------------------------------+
```

- Banner, Badge, Stepper failed marker: backup-failed state.
- Retry, no advance: AC14. Apply disabled: AC6.

## F9 Backup confirmed, ready to apply

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (*) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [v] Backup confirmed: 2 items, checksums verified, maple:/backups/adopt/lazylibrarian/...          |
| > Plan (4 changes)                                                                                |
|                                                                                  [ Apply ]       |
+--------------------------------------------------------------------------------------------------+
```

- Banner (success), collapsed PlanView: AC3, AC6. Apply sends `apply`.

## F10 Applying

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                                     |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (*) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| (o) Applying 4 changes                       [###############...................]  2 / 4         |
| [v] create  orca service record                                                                   |
| [v] modify  container labels                                                                      |
| (o) modify  restart policy                                                                        |
| ( ) create  health check                                                                          |
|                                                                        [ Applying... ] (disabled) |
+--------------------------------------------------------------------------------------------------+
```

- Spinner, ProgressBar, per-change Badge: loading (apply).
- Apply button disabled and Cancel hidden once apply runs: AC12, AC15.

## F11 Verify populated (all pass)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                         [ Done ]    |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (v) Apply ---- (v) Verify                         |
|--------------------------------------------------------------------------------------------------|
| SectionHead: Verification (3/3 passed)                                                            |
| +----------------------+--------+-----------------------------+                                   |
| | Check                | Result | Detail                      |                                   |
| | container running    | [pass] | up 14s                      |                                   |
| | http health          | [pass] | 200 in 41 ms                |                                   |
| | labels present       | [pass] | orca.managed, orca.id       |                                   |
| +----------------------+--------+-----------------------------+                                   |
| lazylibrarian is managed by orca.                                         [ Open service ]        |
+--------------------------------------------------------------------------------------------------+
```

- DataTable + Badge per check: AC13. Stepper all done: AC1.

## F12 Degraded (verify partial failure, rollback triggered)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                                     |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (v) Apply ---- (x) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [!] Banner (warning): Verify failed 1 of 3 checks. Rolling back from backup.                      |
| | container running    | [pass] | up 14s                      |                                   |
| | http health          | [fail] | connection refused :5299    |                                   |
| | labels present       | [pass] | orca.managed, orca.id       |                                   |
+--------------------------------------------------------------------------------------------------+
```

- Banner, DataTable + Badge: degraded, AC9, AC13. Transitions to F14.

## F13 Error (step fails, earlier steps visible)

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                        [ Cancel ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (x) Plan ---- ( ) Backup ---- ( ) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| > Discover: lazylibrarian on freyr (container)                                                    |
| [x] Banner (error): Plan generation failed: container inspect timed out on freyr.                 |
|                                                         [ Back ]   [ Retry plan ]                 |
+--------------------------------------------------------------------------------------------------+
```

- Banner, Stepper failed marker, collapsed earlier step summary: error state.
- Retry, no advance: AC14.

## F14 Rolling back

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                                     |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (x) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [!] Banner (warning): Apply failed at "modify restart policy". Restoring from backup.             |
| (o) Restoring 2 items                        [##########........................]  1 / 2         |
| [v] container spec                                                                                |
| (o) /config                                                                                       |
+--------------------------------------------------------------------------------------------------+
```

- Banner, Spinner, ProgressBar: rolling-back state, AC8 (also reached from F12 for AC9).
- No actions rendered while restoring: AC15.

## F15 Rolled back

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                         [ Close ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (x) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [i] Banner (info): lazylibrarian restored from backup. orca does not manage it.                   |
| Failing step   Apply: modify restart policy                                                       |
| Reason         docker: container update rejected (read-only spec)                                 |
| > Details                                                                                         |
|   +----------------------------------------------------------------------------------------+     |
|   | CodeBlock: error output                                                                 |     |
|   +----------------------------------------------------------------------------------------+     |
|                                                                   [ Start new plan ]             |
+--------------------------------------------------------------------------------------------------+
```

- Banner, MetricRow (failing step, reason), CodeBlock: AC10.
- Start new plan returns to F4; the failed plan cannot be re-applied: AC12.

## F16 Rollback failed

```text
+--------------------------------------------------------------------------------------------------+
| Adopt service: lazylibrarian                                                         [ Close ]   |
|--------------------------------------------------------------------------------------------------|
| (v) Discover ---- (v) Plan ---- (v) Backup ---- (x) Apply ---- ( ) Verify                         |
|--------------------------------------------------------------------------------------------------|
| [x] Banner (error): Rollback failed. Operator action needed.                                      |
| SectionHead: Left in place                                                                        |
| | ~ container labels       orca.managed, orca.id still set                                       |
| | x /config                not restored (restore write failed)                                   |
| SectionHead: Backup location                                                                      |
| | maple:/backups/adopt/lazylibrarian/<id>                                                        |
|                                                      [ Retry rollback ]   [ Copy details ]       |
+--------------------------------------------------------------------------------------------------+
```

- Banner, PlanView (left-in-place list), CodeBlock-style path: AC11. Retry: AC14.

## F17 Leave confirmation (Modal)

```text
+--------------------------------------------------------------------------------------------------+
| ...wizard dimmed...                                                                               |
|            +--------------------------------------------------------------+                      |
|            | Leave adopt wizard?                                          |                      |
|            | Nothing has been applied. The plan and backup are discarded. |                      |
|            |                                 [ Stay ]   [ Leave ]         |                      |
|            +--------------------------------------------------------------+                      |
+--------------------------------------------------------------------------------------------------+
```

- Modal, Button: AC15. Shown from Cancel in F1–F9 and F13.

## F18 Phone: plan populated (main state)

```text
+--------------------------------------+
| < Adopt: lazylibrarian       Cancel  |
|--------------------------------------|
| Step 2 of 5: Plan                    |
| (v)-(*)-( )-( )-( )                  |
|--------------------------------------|
| Changes (4)            Risk [low]    |
| + orca service record                |
| ~ container labels                   |
| ~ restart policy -> always           |
| + health check :5299/                |
|--------------------------------------|
| Will be backed up (2)                |
| /config (41 MB)                      |
| container spec                       |
| > Raw plan                           |
|--------------------------------------|
| [ Back ]           [ Back up ]       |
+--------------------------------------+
```

- WizardShell compact header, Stepper compact (dots + "Step n of 5"): AC1.
- PlanView stacked: AC3, AC5. Sticky footer actions: AC6.

## Flow

1. F1 loading → F3 candidates (or F2 empty; Discover again re-runs discovery).
2. F3 select + Continue → sends `choose` → F4.
3. F4 valid form + Generate plan → sends `plan` → F5 (low risk) or F6 (high risk); plan failure → F13, Retry sends `plan`.
4. F5/F6 Back up → F7 → F9 (confirmed) or F8 (failed; Retry re-runs backup).
5. F6 stays blocked until the approval gate (story 02) resolves; then F9.
6. F9 Apply → sends `apply` → F10 (button locked for this plan).
7. F10 success → sends `verify` → F11 (all pass) or F12 (partial fail).
8. F10 failure or F12 → server rolls back automatically → F14 → F15 (restored) or F16 (rollback failed; Retry rollback).
9. F15 Start new plan → F4 with a new plan.
10. Cancel from any pre-apply frame → F17; Leave discards the plan and backup and applies nothing.
