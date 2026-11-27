# 01 Mount health — wireframes

Low-fidelity frames for [story 01](../user-stories/01-mount-health.md).
Primitive names marked `(new)` are not yet exported from `@peacock/ui-kit`.
AC numbers refer to the acceptance criteria in story order:

1. grouped per host, path/source/status
2. "write failed" badge distinct from "down"
3. "missing" badge with expected path and source
4. "drift" badge with desired vs actual
5. proposed fix: PlanView + approve control
6. applied fix: result + timestamp, no approve
7. stale host shown as stale
8. approve sends one intent, pending until pushed update
9. list updates from pushed event
10. error Banner with retry; empty EmptyState

## F1 Loading (desktop)

```text
+------------------------------------------------------------------------+
| Mount health                                                [Spinner]  |
+------------------------------------------------------------------------+
| ##########  host                                                       |
|   | ################   | ##########   | ######  |                      |
|   | ################   | ##########   | ######  |                      |
| ##########  host                                                       |
|   | ################   | ##########   | ######  |                      |
+------------------------------------------------------------------------+
```

- Header: SectionHead + Spinner.
- Body: Skeleton (new) rows in the DataTable column layout.
- Shown until the first snapshot from `storage.mount.list` arrives.

## F2 Empty (desktop)

```text
+------------------------------------------------------------------------+
| Mount health                                                           |
+------------------------------------------------------------------------+
|                                                                        |
|                        [ icon ]                                        |
|                 No hosts report mounts                                 |
|      Mounts appear here when a host reports them.                      |
|                                                                        |
+------------------------------------------------------------------------+
```

- SectionHead; EmptyState (new). AC10.

## F3 Error (desktop)

```text
+------------------------------------------------------------------------+
| Mount health                                                           |
+------------------------------------------------------------------------+
| [!] Mount list could not be loaded: <reason>               [ Retry ]   |
+------------------------------------------------------------------------+
```

- Banner (new), tone error, with Button "Retry" re-requesting
  `storage.mount.list`. AC10.

## F4 Healthy (desktop)

```text
+------------------------------------------------------------------------+
| Mount health                                  3 hosts · 9 mounts ok    |
+------------------------------------------------------------------------+
| (o) host-a                                       updated 4s ago        |
|   PATH              SOURCE                     STATUS                  |
|   /mnt/data         nas:/data                  (o) [ok]                |
|   /mnt/downloads    nas:/downloads             (o) [ok]                |
| (o) host-b                                       updated 2s ago        |
|   PATH              SOURCE                     STATUS                  |
|   /mnt/media        nas:/media                 (o) [ok]                |
+------------------------------------------------------------------------+
```

- Header: SectionHead with summary.
- Host groups: HostResultList (new); host line uses StatusDot.
- Rows: DataTable with Cell columns path, source, status (StatusDot + Badge). AC1.
- Content replaces in place on the mount change event. AC9.

## F5 Degraded (desktop)

```text
+------------------------------------------------------------------------+
| Mount health                       3 hosts · 2 issues · 1 stale        |
+------------------------------------------------------------------------+
| (!) host-a                                       updated 3s ago        |
|   PATH              SOURCE              STATUS                         |
|   /mnt/data         nas:/data           (o) [ok]                       |
|   /mnt/downloads    nas:/downloads      (!) [write failed]          v  |
|   /mnt/books        nas:/books          (x) [missing]               v  |
|     expected /mnt/books  from nas:/books                               |
|   /mnt/media        nas:/media          (!) [drift]                 v  |
|     desired  nas:/media  rw,vers=3                                     |
|     actual   nas:/media  ro,vers=3                                     |
|   /mnt/backup       nas:/backup         (x) [down]                     |
| (-) host-b  [stale]                    last seen 14m ago               |
|   /mnt/media        nas:/media          (-) [stale]                    |
| (o) host-c                                       updated 1s ago        |
|   /mnt/data         nas:/data           (o) [ok]                       |
+------------------------------------------------------------------------+
```

- HostResultList (new) groups; DataTable rows. AC1.
- Badge "write failed" (warning tone) distinct from Badge "down" (error). AC2.
- Badge "missing" with expected path and source sub-row. AC3.
- Badge "drift" with desired vs actual in CodeBlock (new, diff). AC4.
- Stale host: StatusDot neutral + Badge "stale"; its rows render "stale",
  never "ok". AC7.
- `v` expands a row to F6/F7. Rows change in place on pushed events. AC9.

## F6 Row expanded, proposed fix (desktop)

```text
|   /mnt/media        nas:/media          (!) [drift]                 ^  |
|   +--------------------------------------------------------------+     |
|   | Proposed fix                                    [risk: low]  |     |
|   | 1. unmount /mnt/media                                        |     |
|   | 2. mount nas:/media /mnt/media -o rw,vers=3                  |     |
|   | 3. verify write                                              |     |
|   |                                                              |     |
|   |                                   [ Approve fix ]            |     |
|   +--------------------------------------------------------------+     |
```

- PlanView (new) listing steps from the server proposal
  (`storage.mount.update`). AC5.
- ApprovalGate (new) wraps Button "Approve fix". AC5.

## F7 Row expanded, pending approval (desktop)

```text
|   /mnt/media        nas:/media          (!) [drift] [pending]       ^  |
|   +--------------------------------------------------------------+     |
|   | Proposed fix                                    [risk: low]  |     |
|   | 1. unmount /mnt/media ...                                    |     |
|   |                                   [ (spin) Applying... ]     |     |
|   +--------------------------------------------------------------+     |
```

- ApprovalGate (new) in pending state: Button disabled + Spinner, Badge
  "pending". One `approve_fix(mountId)` intent sent; a second click sends
  nothing. Clears when the pushed update arrives. AC8, AC9.

## F8 Row expanded, applied fix (desktop)

```text
|   /mnt/media        nas:/media          (o) [ok]                    ^  |
|   +--------------------------------------------------------------+     |
|   | Fix applied                       2026-11-26 14:02:11        |     |
|   | remounted rw, write verified                                 |     |
|   +--------------------------------------------------------------+     |
```

- PlanView (new) in result mode: result text + timestamp; no approve
  control. AC6.

## F9 Degraded (phone)

```text
+--------------------------+
| Mount health             |
| 2 issues · 1 stale       |
+--------------------------+
| (!) host-a          3s   |
| /mnt/downloads           |
| nas:/downloads           |
| [write failed]        v  |
| ------------------------ |
| /mnt/books               |
| nas:/books               |
| [missing]             v  |
| expected /mnt/books      |
| ------------------------ |
| /mnt/media               |
| nas:/media               |
| [drift]               v  |
+--------------------------+
| (-) host-b [stale]  14m  |
| /mnt/media    [stale]    |
+--------------------------+
```

- Same HostResultList (new) and Badge set as F5; DataTable rows stack as
  path / source / status. Expanding opens the F6 plan in a Drawer
  (bottom sheet). AC1-AC7.

## Flow

1. F1 loading -> first snapshot -> F2 empty, F4 healthy or F5 degraded;
   request failure -> F3.
2. F3 Retry -> intent: `storage.mount.list` re-request -> F1.
3. F5 expand a row with a proposal -> F6 (no intent; local UI state).
4. F6 Approve fix -> intent: `approve_fix(mountId)` (once) -> F7 pending.
5. F7 pushed mount change event -> F8 applied, row status updated in F5/F4.
6. Any frame: pushed mount change event updates rows in place; a host
   that stops reporting turns stale (F5 host-b).
