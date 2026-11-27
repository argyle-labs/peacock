# 05 Notifications inbox

As an operator I can review deduplicated notifications, resolve them, and
approve proposed actions so that I handle each problem once.

## Preconditions

- Operator is signed in.
- Notifications may carry a proposed action.

## Screen states

- empty: inbox is clear.
- loading: first fetch pending.
- populated: open and resolved notifications.
- error: list or action request fails.
- degraded: notification feed disconnected; showing last known data.

## Acceptance criteria

- [ ] Repeated occurrences are shown as one item with a count and last-seen time.
- [ ] Items are ordered by severity then recency, as provided by the server.
- [ ] Resolve moves an item out of the open list and keeps it under resolved.
- [ ] An item with a proposed action shows its plan and an approve control.
- [ ] Approving sends one intent and shows pending until the server confirms.
- [ ] A disconnected feed shows a Banner and the data as stale.
- [ ] New notifications appear from a pushed event without refresh.
- [ ] Bulk select supports resolving several items at once.

## Primitives and patterns

- exists: Badge, Button, Drawer, DataTable, StatusDot
- new: Tabs, Checkbox, Toast, Banner, EmptyState, Skeleton, ApprovalGate, PlanView, NotificationItem, RiskBadge

## Orca tools and events

- notify.list (named in brief)
- notify.update (resolve)
- proposed-action approve tool: TBD
- notification event: TBD

## Logic placement

- Server: dedupe, counting, ordering, proposed-action generation and execution.
- SDK: cache, subscription, optimistic resolve with rollback.
- UI: renders the view-model; forwards `resolve(ids)` and `approve(id)`.
