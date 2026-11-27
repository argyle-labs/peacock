# Model gap review (2026-11-26)

An independent adversarial review of docs/models/*. These items are open until the user decides each one.

1. DECIDED: every action fits a standard verb; plugins add no actions or grants of their own. Plugin-specific grants are scope only (`@plugin:<uuid>`).
2. DECIDED: Groups = people; Collections = resources.
3. DECIDED: allow-only and additive; `super` is unscoped and reserved for a separate super-admin account. (Original:)
   - deny vs allow-only;
   - how scopes combine;
   - whether `*` matches one segment or many;
   - whether `super` can be scoped.
4. DECIDED: area-level grants automatically cover categories added later in their area.
5. FIXED: grants.md uses area.kind.role names.
6. DECIDED: `systems` area (host, vm, lxc, container, hypervisor; mounts and shares under host); Caddy under `network.proxy`; no storage area.
7. DECIDED: categories are capabilities that resources expose via plugins; orca aggregates by capability across all providers.
8. Widget principals lack rules for the attacher losing the grant, expiry, uninstall, and shared dashboards.
9. Push needs rules for grant revocation mid-subscription, backpressure, and who authorizes relayed data.
10. Failover: rediscovering a node, resubscribing, and where locks and jobs live.
11. Plans: expiry, who may confirm, audit, and the link to remediation approvals and rollback.
12. UI-only previews break parity with CLI and MCP for high-risk actions.
13. No model yet for:
    - notifications;
    - remediation policy;
    - offboarding;
    - locks;
    - audit scope;
    - kiosk;
    - access requests;
    - invites;
    - update policy.
14. Per-user dashboards and "git wins": silent overwrites, and personal layouts end up in a shared repo.
15. `update` vs `upgrade` is confusing.
16. Missing verbs (move/migrate, repair, approve, rotate, report), and the behaviour of a grant on a verb that doesn't exist yet.
17. DECIDED: the unified screen is "Systems" and covers everything.
18. Risk decided at action time can't be predicted, so the UI can't know in advance whether a button needs re-auth.
