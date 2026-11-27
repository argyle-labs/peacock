# Model gap review (2026-11-26)

An independent adversarial review of docs/models/*. These items are open until the user decides each one.

1. DECIDED: every action fits a standard verb; plugins add no actions or grants of their own. Plugin-specific grants are scope only (`@plugin:<uuid>`).
2. "Group" has two meanings: grants given to people, and resource sets used as a scope. They need two named types.
3. Grant evaluation is undefined:
   - deny vs allow-only;
   - how scopes combine;
   - whether `*` matches one segment or many;
   - whether `super` can be scoped.
4. The contents of `media:viewer` and `media:admin` are undefined, including whether they automatically cover new media categories.
5. grants.md uses stale category names (`media.player`, `media.tv-downloader`, `inventory.service`).
6. Infrastructure has no category: Proxmox, Docker, VMs, LXC, systems, mounts and shares. "compute" is jargon, and `storage` contradicts the interview.
7. A resource with many categories needs a rule for showing it once (tags, not duplicate entries).
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
