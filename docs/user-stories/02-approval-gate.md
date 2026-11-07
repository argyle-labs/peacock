# 02 Approval gate

As a super-admin I can approve or deny a high-risk action with the plan shown
so that nothing destructive runs without informed consent.

## Preconditions

- A high-risk action has been requested and is awaiting approval.
- The viewer holds the super-admin role (enforced by the server).

## Screen states

- empty: no pending approvals.
- loading: approval request being fetched.
- populated: one or more pending approvals with plans.
- error: plan failed to load or decision submission failed.
- degraded: plan available but stale or partially unresolved (some targets unknown).

## Acceptance criteria

- [ ] Each pending item shows requester, action, risk level and targets.
- [ ] The full plan is visible before the approve control is enabled.
- [ ] Approve and Deny are both present; Deny accepts an optional reason.
- [ ] A non-super-admin sees the plan read-only with no decision controls.
- [ ] Submitting a decision disables both controls and shows pending.
- [ ] A decision rejected by the server shows a Banner and re-enables the controls.
- [ ] An item decided elsewhere updates to its final state from a pushed event.
- [ ] A stale plan shows a warning and requires reload before approving.

## Primitives and patterns

- exists: Modal, Button, Badge, Drawer
- new: PlanView, ApprovalGate, RiskBadge, CodeBlock, Banner, Toast, EmptyState, Skeleton

## Orca tools and events

- approval list/get/decide tools: TBD
- approval changed event: TBD

## Logic placement

- Server: risk classification, plan generation, role enforcement, staleness, execution after approval.
- SDK: intent submission, pending state, event subscription.
- UI: renders plan and controls; forwards `approve(id)` and `deny(id, reason)`.
