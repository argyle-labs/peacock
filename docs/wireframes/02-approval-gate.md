# 02 Approval gate — wireframes

Low-fidelity frames for [story 02](../user-stories/02-approval-gate.md).
Desktop frames are ~96 columns; the phone frame is ~40 columns.
Primitive status follows the story: `exists` = exported from
`ui/packages/ui-kit/src/index.ts`; `new` = not yet built.

AC keys used below:

- AC1 requester, action, risk, targets shown
- AC2 full plan visible before Approve enabled
- AC3 Approve + Deny present; Deny takes optional reason
- AC4 non-super-admin sees plan read-only
- AC5 submitting disables both controls, shows pending
- AC6 server rejection shows Banner, re-enables controls
- AC7 decided elsewhere updates from pushed event
- AC8 stale plan warns, requires reload before approving
- AC9 distinct lifecycle labels; decided is read-only
- AC10 expired/executed show no Approve
- AC11 bound plan/args summary always visible; mismatch hides Approve
- AC12 ineligible caller sees Approve disabled with reason
- AC13 step-up prompts second factor; `none` provider shows "second factor unavailable"
- AC14 self-approval (open policy decision)

## F1 Loading

```text
+----------------------------------------------------------------------------------------------+
| Approvals                                                                                    |
+------------------------------+---------------------------------------------------------------+
| [####################]       | [##########################]  [######]                        |
| [##########]                 | [##############]                                              |
|------------------------------| ------------------------------------------------------------- |
| [####################]       | [###########################################################] |
| [##########]                 | [###########################################################] |
|------------------------------| [###########################################]                 |
| [####################]       |                                                               |
| [##########]                 |                                     [#######]  [#######]      |
+------------------------------+---------------------------------------------------------------+
```

- List rows and detail pane: Skeleton (new). Header: SectionHead (exists).
- No decision controls render while loading (AC2).

## F2 Empty

```text
+----------------------------------------------------------------------------------------------+
| Approvals                                                                                    |
+----------------------------------------------------------------------------------------------+
|                                                                                              |
|                                     ( check icon )                                           |
|                                  No pending approvals                                        |
|                  High-risk actions that need a decision appear here.                         |
|                                                                                              |
+----------------------------------------------------------------------------------------------+
```

- EmptyState (new) with CheckIcon (exists). SectionHead (exists).

## F3 Populated — pending, eligible super-admin (main state)

```text
+----------------------------------------------------------------------------------------------+
| Approvals                                                                       3 pending    |
+------------------------------+---------------------------------------------------------------+
| > Restart storage server     | Restart storage server              [PENDING] [RISK: HIGH]    |
|   alice · [HIGH] · 2m ago    | Requested by alice · 2m ago · expires in 28m                  |
|------------------------------| Targets: storage-a, storage-b                                 |
|   Delete volume              | ------------------------------------------------------------- |
|   bob · [CRITICAL] · 5m ago  | Plan                                                          |
|------------------------------| +-----------------------------------------------------------+ |
|   Rotate root credential     | | 1. drain mounts on storage-a  (4 clients)                 | |
|   carol · [HIGH] · 9m ago    | | 2. restart service smb on storage-a                       | |
|                              | | 3. repeat for storage-b                                   | |
|                              | +-----------------------------------------------------------+ |
|                              | Bound args  hash 9f3c…a1                                      |
|                              | +-----------------------------------------------------------+ |
|                              | | { "targets": ["storage-a","storage-b"], "drain": true }   | |
|                              | +-----------------------------------------------------------+ |
|                              |                                                               |
|                              |                                       [ Deny ]  [ Approve ]   |
+------------------------------+---------------------------------------------------------------+
```

- List: DataTable + Cell (exists), RiskBadge (new) per row — AC1.
- Detail header: Badge (exists) lifecycle label, RiskBadge (new) — AC1, AC9.
- Plan region: PlanView (new); args: CodeBlock (new) — AC2, AC11.
- Controls: ApprovalGate (new) wrapping Button (exists) x2 — AC3. Approve is
  enabled only once PlanView has rendered the full plan (AC2).

## F3p Populated — phone width

```text
+--------------------------------------+
| < Approvals              3 pending   |
+--------------------------------------+
| Restart storage server               |
| [PENDING] [RISK: HIGH]               |
| alice · 2m ago · expires 28m         |
| Targets: storage-a, storage-b        |
|--------------------------------------|
| Plan                                 |
| +----------------------------------+ |
| | 1. drain mounts on storage-a     | |
| | 2. restart smb on storage-a      | |
| | 3. repeat for storage-b          | |
| +----------------------------------+ |
| Bound args  hash 9f3c…a1         [v] |
| +----------------------------------+ |
| | { "targets": [...],              | |
| |   "drain": true }                | |
| +----------------------------------+ |
|--------------------------------------|
| [ Deny ]               [ Approve ]   |
+--------------------------------------+
```

- List collapses to its own screen; detail is full-width with a back link.
- Bound args collapsible via ChevronDownIcon (exists), summary line always
  shown (AC11). Controls pinned to the bottom (ApprovalGate, AC3).

## F4 Deny reason

```text
+--------------------------------------------------+
| Deny "Restart storage server"                 x  |
|--------------------------------------------------|
| Reason (optional)                                |
| +----------------------------------------------+ |
| |                                              | |
| +----------------------------------------------+ |
|                                                  |
|                         [ Cancel ]  [ Deny ]     |
+--------------------------------------------------+
```

- Modal (exists), Button (exists) — AC3.

## F5 Step-up second factor

```text
+--------------------------------------------------+
| Confirm with second factor                    x  |
|--------------------------------------------------|
| Approving "Restart storage server" requires a    |
| second factor.                                   |
| Code  [ _ _ _ _ _ _ ]                            |
|                                                  |
|                       [ Cancel ]  [ Confirm ]    |
+--------------------------------------------------+
```

- Modal (exists), Button (exists) — AC13.

## F6 Submitting

```text
| Restart storage server              [PENDING] [RISK: HIGH]    |
| ...plan and bound args as F3...                               |
|                                  (o) Submitting decision…     |
|                                    [ Deny ]  [ Approve ]      |
|                                    (disabled)  (disabled)     |
```

- Spinner (exists), Button disabled (exists) inside ApprovalGate (new) — AC5.

## F7 Error — decision rejected

```text
| +-----------------------------------------------------------+ |
| | ! Decision rejected: request is no longer pending.      x | |
| +-----------------------------------------------------------+ |
| Restart storage server              [PENDING] [RISK: HIGH]    |
| ...plan and bound args as F3...                               |
|                                    [ Deny ]  [ Approve ]      |
```

- Banner (new) with the server message; controls re-enabled — AC6.

## F8 Error — plan failed to load

```text
| Restart storage server              [PENDING] [RISK: HIGH]    |
| Requested by alice · 2m ago                                   |
| +-----------------------------------------------------------+ |
| | ! Plan failed to load.                         [ Retry ]  | |
| +-----------------------------------------------------------+ |
|                                    [ Deny ]  [ Approve ]      |
|                                   (enabled)  (disabled)       |
|                                   Approve needs the full plan |
```

- Banner (new), Button (exists). Approve disabled with reason — AC2.

## F9 Degraded — stale plan / unresolved targets

```text
| +-----------------------------------------------------------+ |
| | ! Plan is stale; 1 target unresolved.     [ Reload plan ] | |
| +-----------------------------------------------------------+ |
| Restart storage server              [PENDING] [RISK: HIGH]    |
| Targets: storage-a, ? storage-b (unknown)                     |
| ...plan and bound args as F3...                               |
|                                    [ Deny ]  [ Approve ]      |
|                                   (enabled)  (disabled)       |
|                                Reload the plan to approve     |
```

- Banner (new) warning, StatusDot (exists) on unknown target, PlanView (new)
  — AC8. Approve re-enables after reload yields a current plan.

## F10 Read-only — non-super-admin

```text
| Restart storage server              [PENDING] [RISK: HIGH]    |
| Requested by alice · 2m ago · Targets: storage-a, storage-b   |
| ...plan and bound args as F3...                               |
| View only: deciding requires the super-admin role.            |
```

- PlanView, CodeBlock (new); no ApprovalGate controls rendered — AC4.

## F11 Approved (awaiting execution)

```text
| Restart storage server             [APPROVED] [RISK: HIGH]    |
| Approved by dave · 1m ago · awaiting execution                |
| ...plan and bound args as F3 (read-only)...                   |
```

- Badge (exists) lifecycle label, PlanView, CodeBlock (new) — AC9, AC11.

## F12 Denied

```text
| Restart storage server               [DENIED] [RISK: HIGH]    |
| Denied by dave · 1m ago                                       |
| Reason: maintenance window not scheduled                      |
| ...plan and bound args as F3 (read-only)...                   |
```

- Badge (exists), PlanView, CodeBlock (new) — AC9, AC3 (reason shown).

## F13 Expired

```text
| Restart storage server              [EXPIRED] [RISK: HIGH]    |
| Expired 4m ago · no decision was made                         |
| ...plan and bound args as F3 (read-only)...                   |
```

- Badge (exists); no ApprovalGate controls — AC9, AC10.

## F14 Executed

```text
| Restart storage server             [EXECUTED] [RISK: HIGH]    |
| Approved by dave · executed 30s ago                           |
| Outcome: success · 2 of 2 targets restarted                   |
| ...plan and bound args as F3 (read-only)...                   |
```

- Badge (exists), StatusDot (exists) outcome, PlanView, CodeBlock (new);
  no Approve — AC9, AC10.

## F15 Args mismatch

```text
| Restart storage server              [PENDING] [RISK: HIGH]    |
| +-----------------------------------------------------------+ |
| | ! Arguments changed; this approval no longer applies.     | |
| +-----------------------------------------------------------+ |
| Bound args  hash 9f3c…a1        | Current args  hash 77be…02  |
| +-----------------------------+ | +-------------------------+ |
| | "targets": ["storage-a",    | | | "targets": ["storage-a",| |
| |             "storage-b"]    | | |  "storage-b","storage-c"]| |
| +-----------------------------+ | +-------------------------+ |
|                                                  [ Deny ]     |
```

- Banner (new), CodeBlock x2 (new) side by side; Approve not rendered — AC11.

## F16 Approver ineligible

```text
| ...header, plan and bound args as F3...                       |
|                                    [ Deny ]  [ Approve ]      |
|                                   (enabled)  (disabled)       |
|          Signed in with a service token; it cannot approve.   |
```

- Button disabled with reason text in ApprovalGate (new) — AC12. Reason
  variants: service token, unbound token, system caller, missing role.

## F17 Second factor unavailable

```text
| ...header, plan and bound args as F3...                       |
|                       [ Deny ]   Second factor unavailable    |
```

- ApprovalGate (new) renders the text in place of Approve — AC13.

## F18 Self-approval (policy open: both variants)

```text
allowed:
| Restart storage server  [PENDING] [RISK: HIGH] [YOUR REQUEST] |
|                                    [ Deny ]  [ Approve ]      |

forbidden:
| Restart storage server  [PENDING] [RISK: HIGH] [YOUR REQUEST] |
|                       [ Cancel request ] [ Deny ] [ Approve ] |
|                                                  (disabled)   |
|                  Requester cannot approve own request         |
```

- Badge (exists) "your request", ApprovalGate (new), Button (exists) — AC14.

## F19 Decided elsewhere (pushed event)

```text
| Restart storage server  [PENDING -> APPROVED] [RISK: HIGH]    |
| ...detail switches to F11 read-only...                        |
                                  +-----------------------------+
                                  | Approved by dave elsewhere  |
                                  +-----------------------------+
```

- Toast (new) announcing the change; list row Badge updates; detail moves to
  F11/F12/F13/F14 — AC7.

## Flow

1. F1 Loading -> F2 Empty (no items) or F3 Populated (list/get tool: TBD).
2. F3 select row -> detail loads; F8 if the plan fails (Retry re-fetches),
   F9 if stale (Reload plan re-fetches).
3. F3 Approve -> F5 if step-up is required -> F6 -> sends `approve(id)`.
   F3 Deny -> F4 -> F6 -> sends `deny(id, reason)`.
4. F6 -> F11 Approved or F12 Denied on success; F7 on server rejection
   (controls re-enabled, back to F3).
5. F11 -> F14 Executed when the server runs the action.
6. Any open item -> F19 on an approval changed event (TBD), then F11-F14.
7. Variants of F3 decided by the server view-model: F10 (no role), F13
   (expired), F15 (args mismatch), F16 (ineligible caller), F17 (`none`
   provider), F18 (own request). These send only `deny(id, reason)` where
   Deny is shown; none send `approve(id)`.
