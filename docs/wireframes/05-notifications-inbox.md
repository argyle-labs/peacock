# 05 Notifications inbox — wireframes

Low-fidelity frames for [story 05](../user-stories/05-notifications-inbox.md).
Desktop frames are 80 columns; the phone frame is 40 columns. Acceptance
criteria are referenced as AC1–AC8 in story order:

- AC1 dedupe count + last seen
- AC2 server order (severity, then recency)
- AC3 resolve moves item to Resolved
- AC4 proposed action shows plan + approve
- AC5 approve sends one intent, pending until confirmed
- AC6 disconnected feed shows Banner + stale data
- AC7 pushed event adds item without refresh
- AC8 bulk select resolves several items

## F1 Loading (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [ Open ] [ Resolved ]                                                        |
|------------------------------------------------------------------------------|
| [ ] ░░░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        ░░░░░░  ░░░░          |
| [ ] ░░░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░              ░░░░░░  ░░░░          |
| [ ] ░░░░░░  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    ░░░░░░  ░░░░          |
| [ ] ░░░░░░  ░░░░░░░░░░░░░░░░░░░░░░░                   ░░░░░░  ░░░░          |
+------------------------------------------------------------------------------+
```

- Header: SectionHead (exists).
- Tab strip: Tabs (new), disabled until first fetch resolves.
- Rows: Skeleton (new) inside NotificationItem (new) row shape.
- State: `notify.list` first fetch pending.

## F2 Empty (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [*Open 0*] [ Resolved 12 ]                                                   |
|------------------------------------------------------------------------------|
|                                                                              |
|                              ( check icon )                                  |
|                            Inbox is clear.                                   |
|               New notifications appear here as they arrive.                  |
|                                                                              |
+------------------------------------------------------------------------------+
```

- Header: SectionHead; counts in Tabs (new) labels via Badge (exists).
- Body: EmptyState (new) with CheckIcon (exists).
- AC7: the list subscribes to the notification event; a pushed item replaces
  the EmptyState with F3 without refresh.

## F3 Populated, Open tab (desktop, main state)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [*Open 4*] [ Resolved 12 ]                                                   |
|------------------------------------------------------------------------------|
| [ ] SEV       NOTIFICATION                              COUNT  LAST SEEN     |
|------------------------------------------------------------------------------|
| [ ] (●) crit  Mount /data/media stale on thor            x14    2m ago   [>]  |
|               Proposed action: remount from willow  [RISK: medium]           |
| [ ] (●) crit  Backup checksum mismatch: gitea            x1     9m ago   [>]  |
| [ ] (●) warn  Sonarr import failing                      x37    1m ago   [>]  |
| [ ] (●) info  Plugin update available: plex              x1     3h ago   [>]  |
|------------------------------------------------------------------------------|
|                                                   [ Resolve ]  (disabled)    |
+------------------------------------------------------------------------------+
```

- List: DataTable (exists) of NotificationItem (new); Checkbox (new) column.
- SEV column: StatusDot (exists) + Badge (exists) severity tone.
- COUNT + LAST SEEN columns: Badge count, `relTime` (exists) — AC1.
- Row order is rendered as received from `notify.list` — AC2.
- Proposed-action line: RiskBadge (new) — AC4 entry point; `[>]` opens F5.
- Footer: Button (exists), enabled when at least one Checkbox is set — AC8.

## F4 Bulk select (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [*Open 4*] [ Resolved 12 ]                                                   |
|------------------------------------------------------------------------------|
| [-] SEV       NOTIFICATION                              COUNT  LAST SEEN     |
|------------------------------------------------------------------------------|
| [x] (●) crit  Mount /data/media stale on thor            x14    2m ago   [>]  |
| [ ] (●) crit  Backup checksum mismatch: gitea            x1     9m ago   [>]  |
| [x] (●) warn  Sonarr import failing                      x37    1m ago   [>]  |
| [ ] (●) info  Plugin update available: plex              x1     3h ago   [>]  |
|------------------------------------------------------------------------------|
| 2 selected                                    [ Clear ]  [ Resolve 2 ]       |
+------------------------------------------------------------------------------+
```

- Header Checkbox (new) in indeterminate state; row Checkbox (new).
- Footer: Button (exists) x2.
- AC8: `Resolve 2` forwards `resolve([id1, id3])` as one intent.
- AC3: SDK removes both rows optimistically; they appear under Resolved (F7).

## F5 Detail drawer with proposed action (desktop)

```text
+---------------------------------------------+--------------------------------+
| Notifications                               | Mount /data/media stale    [x] |
| [*Open 4*] [ Resolved 12 ]                  | (●) crit   x14   last 2m ago   |
|---------------------------------------------|                                |
| [ ] (●) crit  Mount /data/media stale  [>]  | First seen 4h ago on thor      |
| [ ] (●) crit  Backup checksum mism...  [>]  |--------------------------------|
| [ ] (●) warn  Sonarr import failing    [>]  | Proposed action [RISK: medium] |
| [ ] (●) info  Plugin update availa...  [>]  |  1. unmount /data/media (thor) |
|                                             |  2. mount from willow          |
|                                             |  3. verify read on thor        |
|                                             |--------------------------------|
|                                             | [ Resolve ]        [ Approve ] |
+---------------------------------------------+--------------------------------+
```

- Container: Drawer (exists).
- Summary: StatusDot, Badge (exist) — AC1.
- Plan: PlanView (new) with RiskBadge (new) — AC4.
- Actions: ApprovalGate (new) wrapping Button (exists) Approve; Resolve
  Button forwards `resolve([id])` — AC3.

## F6 Approve pending (desktop)

```text
+---------------------------------------------+--------------------------------+
| Notifications                               | Mount /data/media stale    [x] |
| [*Open 4*] [ Resolved 12 ]                  | (●) crit   x14   last 2m ago   |
|---------------------------------------------|--------------------------------|
| [ ] (●) crit  Mount /data/media stale  [>]  | Proposed action [RISK: medium] |
| [ ] (●) crit  Backup checksum mism...  [>]  |  1. unmount /data/media (thor) |
| [ ] (●) warn  Sonarr import failing    [>]  |  2. mount from willow          |
| [ ] (●) info  Plugin update availa...  [>]  |  3. verify read on thor        |
|                                             |--------------------------------|
|                                             | [ Resolve ]   [ (o) Pending  ] |
+---------------------------------------------+--------------------------------+
                                  +------------------------------------------+
                                  | Approval sent. Waiting for confirmation. |
                                  +------------------------------------------+
```

- ApprovalGate (new) in pending state: Button disabled with Spinner (exists).
- Toast (new) confirms the intent was sent.
- AC5: `approve(id)` sent once; control stays pending until the server event
  confirms, then the item moves to Resolved.

## F7 Populated, Resolved tab (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [ Open 2 ] [*Resolved 14*]                                                   |
|------------------------------------------------------------------------------|
| SEV       NOTIFICATION                              COUNT  RESOLVED          |
|------------------------------------------------------------------------------|
| (○) crit  Mount /data/media stale on thor            x14    just now        |
| (○) warn  Sonarr import failing                      x37    just now        |
| (○) warn  SMB guest session reuse on maple           x3     1d ago          |
+------------------------------------------------------------------------------+
```

- Tabs (new), DataTable (exists), NotificationItem (new) resolved variant,
  StatusDot (exists) muted tone, `relTime` (exists).
- AC3: resolved items are kept and listed here.

## F8 Degraded: feed disconnected (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| +--------------------------------------------------------------------------+ |
| | (!) Live updates disconnected. Showing data from 6m ago.   Reconnecting… | |
| +--------------------------------------------------------------------------+ |
| [*Open 4*] [ Resolved 12 ]                                                   |
|------------------------------------------------------------------------------|
| [ ] (●) crit  Mount /data/media stale on thor   x14  2m ago  [stale]   [>]   |
| [ ] (●) crit  Backup checksum mismatch: gitea   x1   9m ago  [stale]   [>]   |
| [ ] (●) warn  Sonarr import failing             x37  1m ago  [stale]   [>]   |
| [ ] (●) info  Plugin update available: plex     x1   3h ago  [stale]   [>]   |
+------------------------------------------------------------------------------+
```

- Banner (new) warn tone with Spinner (exists).
- Stale marker: Badge (exists) on each NotificationItem (new) — AC6.
- Resolve and approve stay available; intents go to the server directly.

## F9 Error: list fetch failed (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [ Open ] [ Resolved ]                                                        |
|------------------------------------------------------------------------------|
|                                                                              |
|                         (!) Notifications did not load.                      |
|                         notify.list: 503 Service Unavailable                 |
|                                  [ Retry ]                                   |
|                                                                              |
+------------------------------------------------------------------------------+
```

- EmptyState (new) error variant + Button (exists).
- Retry re-issues `notify.list`.

## F10 Error: action failed (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [*Open 4*] [ Resolved 12 ]                                                   |
|------------------------------------------------------------------------------|
| [x] (●) crit  Mount /data/media stale on thor            x14    2m ago   [>]  |
| [ ] (●) crit  Backup checksum mismatch: gitea            x1     9m ago   [>]  |
| [x] (●) warn  Sonarr import failing                      x37    1m ago   [>]  |
| [ ] (●) info  Plugin update available: plex              x1     3h ago   [>]  |
|------------------------------------------------------------------------------|
| 2 selected                                    [ Clear ]  [ Resolve 2 ]       |
+------------------------------------------------------------------------------+
                                  +------------------------------------------+
                                  | (!) Resolve failed: 2 items restored.    |
                                  +------------------------------------------+
```

- Toast (new) error tone.
- SDK rolls back the optimistic resolve; rows return with selection kept
  (AC3, AC8). An approve failure shows the same Toast and returns
  ApprovalGate (new) in F5 to its idle state (AC5).

## F11 Pushed arrival (desktop)

```text
+------------------------------------------------------------------------------+
| Notifications                                                                |
| [*Open 5*] [ Resolved 12 ]                                                   |
|------------------------------------------------------------------------------|
| [ ] (●) crit  Mount /data/media stale on thor            x15    now      [>]  |
| [ ] (●) crit  Gateway loki unreachable           [new]   x1     now      [>]  |
| [ ] (●) crit  Backup checksum mismatch: gitea            x1     9m ago   [>]  |
| [ ] (●) warn  Sonarr import failing                      x37    1m ago   [>]  |
| [ ] (●) info  Plugin update available: plex              x1     3h ago   [>]  |
+------------------------------------------------------------------------------+
```

- NotificationItem (new) with Badge (exists) `new` marker.
- AC7: inserted from the notification event at the server-provided position.
- AC1: a repeat occurrence bumps the existing row's count and last seen
  (x14 -> x15) instead of adding a row.

## F12 Populated, Open tab (phone)

```text
+--------------------------------------+
| Notifications                        |
| [*Open 4*] [ Resolved 12 ]           |
|--------------------------------------|
| [ ] (●) crit            x14  2m ago  |
|     Mount /data/media stale on thor  |
|     Proposed action [RISK: medium] > |
|--------------------------------------|
| [ ] (●) crit            x1   9m ago  |
|     Backup checksum mismatch: gitea >|
|--------------------------------------|
| [ ] (●) warn            x37  1m ago  |
|     Sonarr import failing           >|
|--------------------------------------|
| [ ] (●) info            x1   3h ago  |
|     Plugin update available: plex   >|
|--------------------------------------|
|              [ Resolve ] (disabled)  |
+--------------------------------------+
```

- NotificationItem (new) stacked layout in place of DataTable columns;
  Checkbox, Tabs, RiskBadge (new); StatusDot, Badge, Button (exist).
- Covers AC1, AC2, AC4, AC8. Tapping `>` opens F5 as a full-height Drawer.

## Flow

1. F1 Loading -> `notify.list` resolves -> F3 (items) or F2 (none); failure -> F9.
2. F9 Retry -> intent `notify.list` -> F1.
3. F2 / F3 receive the notification event -> F11 (AC7).
4. F3 select rows -> F4 -> `Resolve N` -> intent `resolve(ids)` via
   `notify.update` -> rows leave Open, appear in F7 (AC3, AC8); failure -> F10.
5. F3 `[>]` -> F5 -> `Resolve` -> intent `resolve([id])` -> F7.
6. F5 `Approve` -> intent `approve(id)` (tool TBD) -> F6 -> server confirms
   -> item moves to F7 (AC5); failure -> Toast, F5 idle.
7. Any frame, feed disconnects -> F8; reconnect -> Banner clears, back to the
   prior frame with fresh data (AC6).
