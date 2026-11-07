# 02 Approval gate

As a super-admin I can approve or deny a high-risk action with the plan shown
so that nothing destructive runs without informed consent.

## Preconditions

- A high-risk action has been requested and is awaiting approval.
- The viewer holds the super-admin role (enforced by the server).
- Request lifecycle (server state machine): `pending` -> `approved` | `denied` | `expired`; `approved` -> `executed` exactly once. A request never returns to an earlier state; an `expired` request can be neither approved nor executed.
- The approval is bound to a hash of the exact arguments of the plan that was shown.
- Only a bound user holding the required role can approve. Service tokens, unbound tokens and system callers never approve, at any risk level.
- A step-up requirement needs a second factor on the decision. With the `none` provider, step-up fails closed.

## Screen states

- empty: no pending approvals.
- loading: approval request being fetched.
- populated: one or more pending approvals with plans.
- error: plan failed to load or decision submission failed.
- degraded: plan available but stale or partially unresolved (some targets unknown).
- approved: decided, awaiting execution; read-only.
- denied: decided, with reason if given; read-only.
- expired: past its deadline; read-only, no approve or deny controls.
- executed: already ran once; read-only, shows the outcome, no approve control.
- args mismatch: current arguments differ from the bound ones; approval shown as no longer applying, with the bound plan/args summary beside the current arguments.
- approver ineligible: Approve disabled with the reason (e.g. service token, unbound, missing role).
- second factor unavailable: step-up required but the provider is `none`; shows "second factor unavailable" in place of an Approve button.

## Acceptance criteria

- [ ] Each pending item shows requester, action, risk level and targets.
- [ ] The full plan is visible before the approve control is enabled.
- [ ] Approve and Deny are both present; Deny accepts an optional reason.
- [ ] A non-super-admin sees the plan read-only with no decision controls.
- [ ] Submitting a decision disables both controls and shows pending.
- [ ] A decision rejected by the server shows a Banner and re-enables the controls.
- [ ] An item decided elsewhere updates to its final state from a pushed event.
- [ ] A stale plan shows a warning and requires reload before approving.
- [ ] Each lifecycle state (pending, approved, denied, expired, executed) has a distinct label; decided requests are read-only.
- [ ] An expired or already-executed request shows no approve control and the server rejects any attempt.
- [ ] The bound plan/args summary is visible on every request; when the arguments changed, the mismatch state shows and Approve is not offered.
- [ ] A service token, unbound token or system caller sees Approve disabled with the reason, and the server refuses it at every risk level.
- [ ] With a step-up requirement the decision prompts for a second factor; with the `none` provider the view shows "second factor unavailable" and no Approve button.
- [ ] Open policy decision, self-approval (requester approves their own request), unresolved. If allowed: the requester sees normal controls, marked as their own request. If forbidden: the requester sees Approve disabled with the reason "requester cannot approve own request" and may still deny or cancel. Either way the server enforces it.

## Primitives and patterns

- exists: Modal, Button, Badge, Drawer
- new: PlanView, ApprovalGate, RiskBadge, CodeBlock, Banner, Toast, EmptyState, Skeleton

## Orca tools and events

- approval list/get/decide tools: TBD
- approval changed event: TBD

## Logic placement

- Server: risk classification, plan generation, lifecycle state machine (transitions, expiry, execute-once), args-hash binding and mismatch check, approver eligibility (bound user, role, no service/unbound/system), step-up and fail-closed on the `none` provider, role enforcement, staleness, execution after approval.
- SDK: intent submission, pending state, event subscription; mirrors server state (lifecycle, binding, eligibility, step-up availability) into the view-model without deciding any of it.
- UI: renders plan, state and controls; forwards `approve(id)` and `deny(id, reason)`. Disabled-with-reason is display only; the server enforces every refusal.
