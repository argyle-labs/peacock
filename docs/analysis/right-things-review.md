# Are we building the right things? (adversarial review, 2026-11-26)

14 assumptions: 4 hold, 8 fail, 2 unknown.

## Blocking
- A1 No widget/dashboard JSON schema in orca (only a nav-placement enum in contract/config-docs/plugin-schema.json:136). Every screen is supposed to be an orca JSON dashboard.
- A2 No grants model; orca still ships Role/Namespace (namespace/src/manager.rs:20, graphql/src/introspection.rs:277). ~40 unnamed grants referenced by flows.
- A3 No push transport / event contract (jobs, notifications, logs, locks, failover).
- A5 Default dashboard set and generic-category catalog undefined, yet screens drawn on them.
- A7 Consolidation dropped direct grants, invite-link validity and delivery channel from the invite sheet.
- A9 Client-side logic in designs: needs-attention ranking, dashboard undo/autosave, chip relevance, status normalization, expected-down propagation, wiring/delete previews, widened-access diff. Each needs a named orca operation or field.

## Non-blocking
- A8 RESOLVED: user chose one unified Inventory; a deployed item shows its service functionality on the same item.
- A10 Pending-update Approve in Plugins duplicates the Issue approve path.
- A11 No flow for admin "require 2FA".
- A13 Schedules, Security findings, Certificates, Adopt trace only to API gaps, not to the interview.
- Uncovered: extended-downtime alert, audit anomaly notification class, backup-success-off default, peacock-on-every-system state.

## Unknown
- A12 Does orca have an OIDC provider? (needed for SSO app launch)
- A14 Is TOTP mandatory for the first (super) account?

## Day-one journey
First-run and join OK; plugin install needs a manifest permission model; first dashboard and first invite break on A1/A2/A5 and missing default channel + VPN ordering.

## Recommended build order
1. Grants model + catalog in core; remove namespace/Role.
2. Widget-kind and dashboard JSON schema (rules, widget-scoped grants).
3. Generic category/seam catalog; default dashboards as orca JSON.
4. Push transport + event contract; job model (steps, cancel, rollback).
5. Step-up/TOTP API; notifications domain with copy-paste default channel; approvals as a notification class.
6. Day-one screens as renders of real JSON.
7. Everything else.

## Top 5 decisions
1. Grant shape. 2. Widget/dashboard JSON. 3. Generic categories and seams. 4. Push contract. 5. Persisted plan/preview objects and rollback records.
