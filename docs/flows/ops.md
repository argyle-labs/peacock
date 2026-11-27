# ops — Notifications, remediation, approvals & jobs

Low-fidelity wireframes for every flow in the `ops` area of [INDEX.md](INDEX.md). Phone frames (about 40 cols) come first; desktop frames (about 90 cols) appear where the layout differs. Every screen is an orca JSON dashboard built from generic widget kinds; each UI decides how to render them. Every control is grant-gated: "grant holder" means whoever holds the grant for that action, and the super grant holds all grants.

Shared chrome on every frame: `≡` opens the slide-out drawer (collapsible rail on desktop), and the search bar doubles as the command palette. Shared states (loading, empty, error, offline, permission-limited, lock, step-up) are drawn once in ops-01 and only redrawn where a flow changes them.

Legend: `[Button]` action, `( )` / `(•)` radio, `[ ]` / `[x]` checkbox, `▾` select, `░` disabled control, `⟳` live/updating.

---

## ops-01 Notifications inbox

As any user I can see my notifications, resolve them and act on them.

### 1a Populated (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ Notifications            ⟳ live      │
│ [Open ▾] [All classes ▾]   [Select]  │
├──────────────────────────────────────┤
│ ● Backup failed: media-db      ×3    │
│   willow · 4m ago                    │
│   [View job] [Resolve]               │
├──────────────────────────────────────┤
│ ● Approval needed: restart sonarr    │
│   expires in 52m                     │
│   [Review]                           │
├──────────────────────────────────────┤
│ ● Fix needs input: mount path        │
│   maple · 20m ago                    │
│   [Provide input]                    │
├──────────────────────────────────────┤
│ ○ Plugin update available: plex      │
│   1h ago                 [Resolve]   │
├──────────────────────────────────────┤
│ ○ Job finished: library rescan       │
│   2h ago                 [Resolve]   │
└──────────────────────────────────────┘
```

Widgets: table with row actions (grouped list; dedupe count `×3`), form that runs actions (filters). Row actions are those the notification declares and the user's grants allow.

### 1b Bulk select (phone)

```text
┌──────────────────────────────────────┐
│ ✕  3 selected          [Select all]  │
├──────────────────────────────────────┤
│ [x] Backup failed: media-db   ×3     │
│ [ ] Approval needed: restart sonarr  │
│ [ ] Fix needs input: mount path      │
│ [x] Plugin update available: plex    │
│ [x] Job finished: library rescan     │
├──────────────────────────────────────┤
│        [Resolve 3]                   │
└──────────────────────────────────────┘
```

Widgets: table with row actions (multi-select), form that runs actions.

### 1c Populated (desktop)

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ [ Search orca…                                                       ⌘K ] │
│              ├───────────────────────────────────────────────────────────────────────────┤
│ Search       │ Notifications                 ⟳ live    [Open ▾] [All classes ▾] [System ▾]│
│ Dashboards   ├────┬────────────────────────────────────┬──────────┬────────┬─────────────┤
│ Notifications│ [ ]│ Title                              │ System   │ When   │             │
│ Jobs         ├────┼────────────────────────────────────┼──────────┼────────┼─────────────┤
│ Approvals    │ [ ]│ ● Backup failed: media-db      ×3  │ willow   │ 4m     │ [View job]  │
│ …            │ [ ]│ ● Approval needed: restart sonarr  │ freyr    │ 8m     │ [Review]    │
│              │ [ ]│ ● Fix needs input: mount path      │ maple    │ 20m    │ [Input]     │
│              │ [ ]│ ○ Plugin update available: plex    │ mimir    │ 1h     │ [Resolve]   │
│              │ [ ]│ ○ Job finished: library rescan     │ thor     │ 2h     │ [Resolve]   │
│              ├────┴────────────────────────────────────┴──────────┴────────┴─────────────┤
│              │ 0 selected                                            [Resolve selected]  │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

Widgets: table with row actions, form that runs actions. Selecting a row opens its detail in a side panel on desktop and a full screen on phone.

### 1d Detail (phone)

```text
┌──────────────────────────────────────┐
│ ←  Backup failed: media-db           │
├──────────────────────────────────────┤
│ Class      backup                    │
│ System     willow                    │
│ First      12:02   Last  12:41   ×3  │
│ Source     backup plugin             │
├──────────────────────────────────────┤
│ Checksum verification failed for     │
│ snapshot 2026-11-26T12:00.           │
├──────────────────────────────────────┤
│ [View job]  [Run backup again]       │
│ [Resolve]                            │
└──────────────────────────────────────┘
```

Widgets: status tiles, form that runs actions.

### 1e Loading / empty / error (phone)

```text
┌────────────────────────┐ ┌────────────────────────┐ ┌────────────────────────┐
│ ≡ [ Search…        ]   │ │ ≡ [ Search…        ]   │ │ ≡ [ Search…        ]   │
│ Notifications          │ │ Notifications          │ │ Notifications          │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒         │ │                        │ │ Could not load         │
│ ▒▒▒▒▒▒▒▒               │ │ No open notifications. │ │ notifications.         │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒         │ │ [Show resolved]        │ │ [Retry]                │
│ ▒▒▒▒▒▒▒▒               │ │                        │ │                        │
└────────────────────────┘ └────────────────────────┘ └────────────────────────┘
  loading                    empty                      error
```

### 1f Offline (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ ⚠ Disconnected. Last known 12:41.    │
│   Controls disabled until reconnect. │
├──────────────────────────────────────┤
│ ● Backup failed: media-db      ×3    │
│   ░View job░ ░Resolve░               │
│ ● Approval needed: restart sonarr    │
│   ░Review░                           │
└──────────────────────────────────────┘
```

Widgets: status tiles (connection banner), table with row actions (disabled). No actions are queued.

### 1g Session expired (phone)

```text
┌──────────────────────────────────────┐
│ Session expired                      │
│ Sign in again to continue. Your      │
│ selection is kept.                   │
│ Password [••••••••            ]      │
│ Code     [______]                    │
│ [Sign in]                            │
└──────────────────────────────────────┘
```

Widgets: form that runs actions.

Frame sequence: 1e loading → 1a/1c populated (or 1e empty / error) → 1d detail or 1b bulk → back to 1a. 1f and 1g overlay any frame.

Intents: `notify.list` (filters: state, class, system), `notify.subscribe` (live push), `notify.get`, `notify.update` (resolve, single and bulk), plus whichever action intent the row declares (e.g. open job, open approval, open input form).

---

## ops-02 Notification preferences

As any user I can choose which channels notify me of what. Reached from the account page and from the drawer.

### 2a Matrix (phone)

```text
┌──────────────────────────────────────┐
│ ←  Notification preferences          │
├──────────────────────────────────────┤
│ Backup                               │
│   Failure    [x] Inbox [x] Email     │
│   Success    [ ] Inbox [ ] Email     │
│ Jobs                                 │
│   Finished   [x] Inbox [ ] Email     │
│   Failed     [x] Inbox [x] Email     │
│ Approvals                            │
│   Pending    [x] Inbox [x] Email     │
│ Remediation                          │
│   Needs input[x] Inbox [ ] Email     │
│   Notify-only[x] Inbox [ ] Email     │
│ Security                             │
│   Finding    [x] Inbox [x] Email     │
├──────────────────────────────────────┤
│ [Save]                    [Reset]    │
└──────────────────────────────────────┘
```

Widgets: form that runs actions (class × channel matrix). Classes listed are those the user's grants let them receive; channels listed are those configured in ops-03. Backup success is off by default.

### 2b Matrix (desktop)

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ [ Search orca…                                                       ⌘K ] │
│              ├───────────────────────────────────────────────────────────────────────────┤
│ …            │ Notification preferences                                                  │
│              ├──────────────────────────────┬────────┬────────┬────────────┬─────────────┤
│              │ Class / event                │ Inbox  │ Email  │ orca cloud │ Mobile push │
│              ├──────────────────────────────┼────────┼────────┼────────────┼─────────────┤
│              │ Backup · failure             │  [x]   │  [x]   │    [ ]     │     ░       │
│              │ Backup · success             │  [ ]   │  [ ]   │    [ ]     │     ░       │
│              │ Jobs · finished              │  [x]   │  [ ]   │    [ ]     │     ░       │
│              │ Jobs · failed                │  [x]   │  [x]   │    [ ]     │     ░       │
│              │ Approvals · pending          │  [x]   │  [x]   │    [x]     │     ░       │
│              │ Remediation · needs input    │  [x]   │  [ ]   │    [ ]     │     ░       │
│              │ Security · finding           │  [x]   │  [x]   │    [ ]     │     ░       │
│              ├──────────────────────────────┴────────┴────────┴────────────┴─────────────┤
│              │ ░ = channel not configured                         [Reset]   [Save]       │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

Widgets: form that runs actions. Channel columns come from whichever channel plugins are registered; the names above are examples.

### 2c Saved / error

```text
┌──────────────────────────────────────┐
│ ✓ Preferences saved.                 │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ✕ Could not save. Changes kept.      │
│ [Retry]                              │
└──────────────────────────────────────┘
```

Frame sequence: loading → 2a/2b → 2c.

Intents: `notify.subscription.list`, `notify.channel.list`, `notify.subscription.set`.

---

## ops-03 Notification channels

As a channel grant holder I can configure notification channel plugins (including orca cloud).

### 3a Channel list (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ Notification channels    [+ Add]     │
├──────────────────────────────────────┤
│ Inbox (default)             ● ok     │
│   Returns content in peacock         │
├──────────────────────────────────────┤
│ Email · smtp plugin         ● ok     │
│   [Test] [Edit]                      │
├──────────────────────────────────────┤
│ orca cloud                  ▲ error  │
│   Last send failed 10m ago           │
│   [Test] [Edit]                      │
└──────────────────────────────────────┘
```

Widgets: table with row actions, status tiles (per-channel health).

### 3b Add channel (phone)

```text
┌──────────────────────────────────────┐
│ ←  Add channel                       │
├──────────────────────────────────────┤
│ Channel plugin                       │
│ (•) Email · smtp                     │
│ ( ) orca cloud                       │
│ ( ) …installed channel plugins       │
├──────────────────────────────────────┤
│ Fields declared by the plugin:       │
│ Host     [smtp.example        ]      │
│ Port     [587 ]                      │
│ From     [orca@example        ]      │
│ Password [secret ref ▾        ]      │
├──────────────────────────────────────┤
│ [Send test]           [Save]         │
└──────────────────────────────────────┘
```

Widgets: form that runs actions (fields declared by the channel plugin; secrets referenced, never shown).

### 3c Test send (phone)

```text
┌──────────────────────────────────────┐
│ Test send                            │
│ To  [you ▾]                          │
│ [Send]                               │
├──────────────────────────────────────┤
│ ⟳ Sending…                           │
│ ✓ Delivered 12:44                    │
│ ✕ Failed: auth rejected  [Edit]      │
└──────────────────────────────────────┘
```

Widgets: form that runs actions, status tiles (result).

### 3d Locked / step-up / permission-limited (phone)

```text
┌──────────────────────────────────────┐
│ ←  Email · smtp                      │
│ 🔒 Being edited by dana.             │
│    Read-only until released.         │
│ Host  smtp.example   ░               │
│ ░Save░                               │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ Confirm it's you                     │
│ This action is marked high-risk by   │
│ the channel plugin.                  │
│ Code [______]   [Use passkey]        │
│ [Confirm]     [Cancel]               │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ Notification channels                │
│ Inbox (default)  ● ok                │
│ Email · smtp     ● ok                │
│ (no Add/Edit/Test: view-only grant)  │
└──────────────────────────────────────┘
```

Frame sequence: 3a → 3b → 3c → 3a. 3d lock on opening an item someone else is editing; step-up only where the plugin marks the action high-risk.

Intents: `notify.channel.list`, `notify.channel.create`, `notify.channel.update`, `notify.channel.delete`, `notify.channel.test`, lock acquire/release on open/close.

---

## ops-04 Remediation policy

As any user I can make a plugin fix rule stricter; as a remediation grant holder I can loosen it.

### 4a Rule list (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ Remediation policy                   │
│ [All plugins ▾] [All systems ▾]      │
├──────────────────────────────────────┤
│ storage · remount stale mount        │
│   Default: auto-approve              │
│   Yours:   require approval  ✎       │
├──────────────────────────────────────┤
│ containers · restart unhealthy       │
│   Default: auto-approve              │
│   Yours:   (default)         ✎       │
├──────────────────────────────────────┤
│ storage · fix mount path             │
│   Default: requires input            │
│   Yours:   (default)         ✎       │
├──────────────────────────────────────┤
│ certs · expiring certificate         │
│   No known fix · notify only         │
└──────────────────────────────────────┘
```

Widgets: table with row actions. Each fix is declared by its plugin; "notify only" rows have no editable mode.

### 4b Edit rule (phone)

```text
┌──────────────────────────────────────┐
│ ←  storage · remount stale mount     │
├──────────────────────────────────────┤
│ Plugin default: auto-approve         │
│ Applies to [All systems ▾]           │
├──────────────────────────────────────┤
│ Mode                                 │
│ ( ) Auto-approve       ░ loosen      │
│ (•) Require approval                 │
│ ( ) Require input                    │
│ ( ) Notify only                      │
├──────────────────────────────────────┤
│ Looser than the current rule needs   │
│ the remediation grant.               │
│ [Save]         [Reset to default]    │
└──────────────────────────────────────┘
```

Widgets: form that runs actions. Modes looser than the current effective rule are disabled without the remediation grant; modes offered are those the plugin declares for that fix.

### 4c Desktop

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ [ Search orca…                                                       ⌘K ] │
│              ├───────────────────────────────────────────────────────────────────────────┤
│ …            │ Remediation policy              [All plugins ▾] [All systems ▾]           │
│              ├──────────────────────────────┬─────────────────┬──────────────────┬───────┤
│              │ Fix                          │ Plugin default  │ Effective        │       │
│              ├──────────────────────────────┼─────────────────┼──────────────────┼───────┤
│              │ storage · remount stale      │ auto-approve    │ require approval │ [Edit]│
│              │ containers · restart         │ auto-approve    │ auto-approve     │ [Edit]│
│              │ storage · fix mount path     │ requires input  │ requires input   │ [Edit]│
│              │ certs · expiring certificate │ notify only     │ notify only      │   —   │
│              └──────────────────────────────┴─────────────────┴──────────────────┴───────┘
│              │ ┌ Edit: storage · remount stale ───────────────────────────────────────┐  │
│              │ │ Mode (•) Require approval  ( ) Require input  ░Auto-approve░          │  │
│              │ │ Applies to [All systems ▾]               [Reset]  [Save]              │  │
│              │ └───────────────────────────────────────────────────────────────────────┘  │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

### 4d Locked

```text
┌──────────────────────────────────────┐
│ 🔒 Being edited by dana.             │
│ ░Save░                               │
└──────────────────────────────────────┘
```

Frame sequence: loading → 4a/4c → 4b → saved → 4a. 4d when another user holds the lock.

Intents: `system.remediation.get`, `system.remediation.set`, lock acquire/release.

---

## ops-05 Approve a remediation or action

As an approver grant holder I can review a pending action with its exact arguments and expiry and approve or deny it once. Reached from a notification (ops-01) or the drawer.

### 5a Pending list (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ Approvals                [Pending ▾] │
├──────────────────────────────────────┤
│ Restart sonarr                       │
│   containers · freyr · expires 52m   │
│   requested by remediation           │
├──────────────────────────────────────┤
│ Remount /data on thor                │
│   storage · thor · expires 3h        │
│   requested by alex                  │
└──────────────────────────────────────┘
```

Widgets: table with row actions.

### 5b Detail (phone)

```text
┌──────────────────────────────────────┐
│ ←  Restart sonarr                    │
├──────────────────────────────────────┤
│ Action   containers.restart          │
│ Target   sonarr on freyr             │
│ Reason   health check failed ×5      │
│ Requested 12:31 by remediation       │
│ Expires  13:31 (52m)                 │
├──────────────────────────────────────┤
│ Arguments (exact)                    │
│ ┌──────────────────────────────────┐ │
│ │ { "id": "…uuid…",                │ │
│ │   "graceful": true }             │ │
│ └──────────────────────────────────┘ │
├──────────────────────────────────────┤
│ Note [optional                 ]     │
│ [Deny]                  [Approve]    │
└──────────────────────────────────────┘
```

Widgets: status tiles, form that runs actions (arguments shown read-only, as sent).

### 5c Desktop

```text
┌──────────────┬───────────────────────────────┬───────────────────────────────────────────┐
│ ≡ orca       │ Approvals          [Pending ▾]│ Restart sonarr                            │
│              ├───────────────────────────────┤ Action   containers.restart               │
│ …            │ ▸ Restart sonarr      52m     │ Target   sonarr on freyr                  │
│              │   Remount /data       3h      │ Reason   health check failed ×5           │
│              │                               │ Expires  13:31 (52m)                      │
│              │                               │ Arguments                                 │
│              │                               │ { "id": "…uuid…", "graceful": true }      │
│              │                               │ Note [                               ]    │
│              │                               │                     [Deny]   [Approve]    │
└──────────────┴───────────────────────────────┴───────────────────────────────────────────┘
```

### 5d Step-up, expired, already decided (phone)

```text
┌──────────────────────────────────────┐
│ Confirm it's you                     │
│ containers marks this high-risk.     │
│ Code [______]   [Use passkey]        │
│ [Confirm approve]   [Cancel]         │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ⌛ Expired 13:31. No action ran.     │
│ ░Deny░  ░Approve░                    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ✓ Approved by dana at 12:40.         │
│ [View job]                           │
│ ░Deny░  ░Approve░                    │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ✓ You approved. Job started.         │
│ [View job]                           │
└──────────────────────────────────────┘
```

Widgets: form that runs actions, status tiles. Without the approver grant the detail is read-only with no Approve/Deny.

Frame sequence: 5a → 5b/5c → (5d step-up if high-risk) → 5d decided → ops-08 job. Expired or already-decided replaces 5b when that is the server state.

Intents: approval list, approval get, approval decide (approve/deny, once), step-up verify, `notify.update` on the source notification. The approval API does not exist yet (see Open questions).

---

## ops-06 Provide required input

As a grant holder I can supply the input a fix requires so it can run. Reached from a "needs input" notification.

### 6a Input form (phone)

```text
┌──────────────────────────────────────┐
│ ←  Fix mount path                    │
├──────────────────────────────────────┤
│ storage · maple                      │
│ Mount /data is missing its source.   │
├──────────────────────────────────────┤
│ Fields declared by the fix:          │
│ Source server [willow ▾        ]     │
│ Share         [data            ]     │
│ Read-only     [ ]                    │
├──────────────────────────────────────┤
│ [Cancel]                 [Run fix]   │
└──────────────────────────────────────┘
```

Widgets: form that runs actions (generated from the fix definition).

### 6b Validation / running / done (phone)

```text
┌──────────────────────────────────────┐
│ Share         [            ]         │
│ ✕ Required                           │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ⟳ Fix running…   [View job]          │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ✓ Input already provided by dana.    │
│ [View job]                           │
└──────────────────────────────────────┘
```

Frame sequence: 6a → (validation) → step-up if high-risk → 6b running → ops-08.

Intents: fix input definition get, fix run with inputs, step-up verify, `notify.update`.

---

## ops-07 Jobs list

As any user I can see running and recently finished jobs my grants allow.

### 7a List (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ Jobs                       ⟳ live    │
│ [Running ▾] [All kinds ▾]            │
├──────────────────────────────────────┤
│ ⟳ Backup media-db                    │
│   willow · step 3/5 · 4m             │
│   ███████████░░░░░░░  60%            │
├──────────────────────────────────────┤
│ ⟳ Update plex plugin                 │
│   mimir · step 1/4 · 30s             │
├──────────────────────────────────────┤
│ Recently finished                    │
│ ✓ Library rescan     thor   2h       │
│ ✕ Backup media-db    willow 3h       │
│ ↺ Remount /data      maple  5h       │
│   (cancelled, rolled back)           │
└──────────────────────────────────────┘
```

Widgets: table with row actions (with progress), form that runs actions (filters).

### 7b Desktop

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ [ Search orca…                                                       ⌘K ] │
│              ├───────────────────────────────────────────────────────────────────────────┤
│ …            │ Jobs   ⟳ live          [Running+recent ▾] [All kinds ▾] [All systems ▾]   │
│              ├─────────────────────┬─────────┬──────────────┬──────────┬────────┬────────┤
│              │ Job                 │ System  │ Progress     │ Started  │ By     │        │
│              ├─────────────────────┼─────────┼──────────────┼──────────┼────────┼────────┤
│              │ ⟳ Backup media-db   │ willow  │ ███░░ 3/5    │ 12:40    │ sched  │[Cancel]│
│              │ ⟳ Update plex       │ mimir   │ █░░░░ 1/4    │ 12:44    │ dana   │[Cancel]│
│              │ ✓ Library rescan    │ thor    │ done         │ 10:41    │ alex   │        │
│              │ ✕ Backup media-db   │ willow  │ failed 4/5   │ 09:40    │ sched  │        │
│              │ ↺ Remount /data     │ maple   │ rolled back  │ 07:12    │ remed. │        │
└──────────────┴─────────────────────┴─────────┴──────────────┴──────────┴────────┴────────┘
```

Widgets: table with row actions. Cancel appears only for the job's grant holders.

### 7c Empty / offline

```text
┌──────────────────────────────────────┐
│ Jobs                                 │
│ No running jobs.                     │
│ Nothing finished recently.           │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ⚠ Disconnected. Last known 12:44.    │
│ ⟳ Backup media-db  3/5 (stale)       │
│ ░Cancel░                             │
└──────────────────────────────────────┘
```

Frame sequence: loading → 7a/7b (or 7c) → row → ops-08.

Intents: job list (filters: state, kind, system), job subscribe (live progress).

---

## ops-08 Job detail and cancel

As a job's grant holder I can follow step-by-step progress and cancel, rolling back completed work.

### 8a Running (phone)

```text
┌──────────────────────────────────────┐
│ ←  Backup media-db         ⟳ live    │
├──────────────────────────────────────┤
│ willow · started 12:40 by schedule   │
│ ███████████░░░░░░░  step 3/5         │
├──────────────────────────────────────┤
│ ✓ 1 Snapshot database        0:12    │
│ ✓ 2 Compress                 1:40    │
│ ⟳ 3 Upload to destination    2:05    │
│ ○ 4 Verify checksum                  │
│ ○ 5 Prune old snapshots              │
├──────────────────────────────────────┤
│ Log                         [Expand] │
│ 12:44:02 uploaded 1.2/2.0 GB         │
│ 12:44:07 uploaded 1.3/2.0 GB         │
├──────────────────────────────────────┤
│ [Cancel]                             │
└──────────────────────────────────────┘
```

Widgets: status tiles (progress), table (steps), live log stream, form that runs actions (cancel).

### 8b Cancel confirm (phone)

```text
┌──────────────────────────────────────┐
│ Cancel this job?                     │
│ The job stops and completed steps    │
│ are rolled back:                     │
│   ↺ 2 Compress                       │
│   ↺ 1 Snapshot database              │
│ [Keep running]      [Cancel job]     │
└──────────────────────────────────────┘
```

### 8c Rolling back / rolled back / failed (phone)

```text
┌──────────────────────────────────────┐
│ ←  Backup media-db                   │
│ ↺ Rolling back…                      │
│ ✕ 3 Upload            stopped        │
│ ⟳ 2 Compress          rolling back   │
│ ○ 1 Snapshot database                │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ↺ Cancelled and rolled back 12:47.   │
│   Prior state restored.              │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ✕ Failed at step 4 Verify checksum.  │
│ checksum mismatch                    │
│ [View log]   [Run again]             │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ ✕ Rollback failed at step 1.         │
│ [View log]                           │
└──────────────────────────────────────┘
```

### 8d Desktop

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ ← Backup media-db · willow · ⟳ live                            [Cancel]   │
│              ├──────────────────────────────────┬────────────────────────────────────────┤
│ …            │ ███████████░░░░░░  3/5           │ Log                          ⟳ follow  │
│              │ ✓ 1 Snapshot database    0:12    │ 12:44:02 uploaded 1.2/2.0 GB           │
│              │ ✓ 2 Compress             1:40    │ 12:44:07 uploaded 1.3/2.0 GB           │
│              │ ⟳ 3 Upload               2:05    │ 12:44:12 uploaded 1.4/2.0 GB           │
│              │ ○ 4 Verify checksum              │                                        │
│              │ ○ 5 Prune old snapshots          │                                        │
└──────────────┴──────────────────────────────────┴────────────────────────────────────────┘
```

Without the job's grant: steps and log are visible as allowed, no Cancel. Offline: last known step, Cancel disabled. Step-up before cancel only where the plugin marks it high-risk.

Frame sequence: 8a/8d → 8b → (step-up) → 8c rolling back → rolled back; or 8a → done / 8c failed. A finish or failure notification goes out per ops-02 preferences.

Intents: job get, job subscribe (steps + log), job cancel, step-up verify.

---

## ops-09 Security findings

As a security grant holder I can run scans, watch progress and triage findings.

### 9a Findings (phone)

```text
┌──────────────────────────────────────┐
│ ≡  [ Search orca…              ⌘K ]  │
├──────────────────────────────────────┤
│ Security                 [Run scan]  │
│ Last scan 08:00 · 2 high · 5 medium  │
│ [Open ▾] [All severities ▾]          │
├──────────────────────────────────────┤
│ ▲ HIGH  Port exposed to WAN          │
│   mimir · plex · new                 │
├──────────────────────────────────────┤
│ ▲ HIGH  Outdated image with CVE      │
│   freyr · lazylibrarian              │
├──────────────────────────────────────┤
│ ■ MED   Secret in env var            │
│   thor · sonarr · acknowledged       │
└──────────────────────────────────────┘
```

Widgets: status tiles (summary), table with row actions, form that runs actions.

### 9b Scan progress (phone)

```text
┌──────────────────────────────────────┐
│ ←  Scan                    ⟳ live    │
│ Scope [All systems ▾]                │
│ ████████░░░░░░░░  4/9 systems        │
│ ✓ willow  ✓ maple  ✓ thor  ✓ freyr   │
│ ⟳ mimir   ○ njord  ○ …               │
│ Findings so far: 3                   │
│ [Cancel]                             │
└──────────────────────────────────────┘
```

Widgets: status tiles, table. A scan is a job; cancel and detail follow ops-08.

### 9c Finding detail / triage (phone)

```text
┌──────────────────────────────────────┐
│ ←  Port exposed to WAN               │
├──────────────────────────────────────┤
│ Severity  HIGH                       │
│ Target    plex on mimir              │
│ Found     08:00 by security plugin   │
│ Evidence  32400/tcp reachable from   │
│           outside the mesh           │
├──────────────────────────────────────┤
│ Status (•) Open ( ) Acknowledged     │
│        ( ) Resolved                  │
│ Note   [                       ]     │
│ [Save]                               │
│ [Run fix]  (if the plugin declares)  │
└──────────────────────────────────────┘
```

Widgets: status tiles, form that runs actions. Run fix follows ops-04 policy (auto, approval via ops-05, input via ops-06).

### 9d Desktop

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ Security    Last scan 08:00 · 2 high · 5 med        [Run scan]            │
│              ├──────┬──────────────────────────────┬─────────┬──────────────┬────────────┤
│ …            │ Sev  │ Finding                      │ System  │ Target       │ Status     │
│              ├──────┼──────────────────────────────┼─────────┼──────────────┼────────────┤
│              │ HIGH │ Port exposed to WAN          │ mimir   │ plex         │ open       │
│              │ HIGH │ Outdated image with CVE      │ freyr   │ lazylibrarian│ open       │
│              │ MED  │ Secret in env var            │ thor    │ sonarr       │ acked      │
└──────────────┴──────┴──────────────────────────────┴─────────┴──────────────┴────────────┘
```

Empty: "No open findings. Last scan 08:00." Without the security grant the area is absent from the drawer and search.

Frame sequence: 9a/9d → 9b → 9a → 9c → save, or Run fix → ops-05/06/08.

Intents: security scan run, scan subscribe (progress), findings list, finding get, finding triage update, fix run.

---

## Open questions

1. Approvals API: none exists. Do approvals ride on notify `class=approval` plus remediation "propose", or become their own resource?
2. Approvals: requester cancel, approval history, quorum or delegation, approver notification routing, and whether self-approval is allowed.
3. What does the approve action do after expiry: nothing (as drawn), or re-request?
4. Notification dedupe/grouping and bulk resolve: is this supported by `notify.update`, and what is the dedupe key?
5. Notification classes and events: what is the full list a user can subscribe to, and can plugins add classes?
6. Can a user set preferences per system or per plugin, or only per class?
7. Remediation policy scope: per fix only, or also per system / per resource? Is a user's stricter rule personal or mesh-wide?
8. Is "notify only" a selectable mode for fixes that do have a known fix?
9. Required input: who receives the "needs input" notification, and does input expire like approvals?
10. Jobs: how long do finished jobs stay in "recently finished"? Can the job's starter cancel without the grant, or only grant holders?
11. Rollback: which steps are rollback-capable is declared by whom, and what is shown when a step cannot be rolled back or rollback fails?
12. Security findings: triage statuses (open / acknowledged / resolved / suppressed?), scan scheduling, and whether findings raise notifications by default.
13. Mobile push and other second-factor channels as notification channels: when they arrive and how they appear in the channel matrix.
