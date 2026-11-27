# User story gap analysis

Inputs: `docs/user-stories/*`, `docs/wireframes/*`, `ui/packages/app/openapi.json`, `ui/packages/app/src`.
"API, no story" = the spec supports it and no story covers it. "No API" = neither exists.

## Blocking

1. No story for first contact: bootstrap, sign-in, signup, sessions, tokens (API exists).
2. Story 02 needs approval list/get/decide and step-up endpoints; none exist in the spec.
3. Story 03 assumes a `tool.*` API; none exists. Closest: `service.*` + `service.instance.*`. No action-run endpoint.
4. Every story relies on server push; the spec declares no WS channel or event names.
5. Story 07 adopt endpoints (discover/plan/apply/verify) do not exist.
6. Navigation (`src/lib/nav.ts:22-31`) has only Systems and Releases; 10+ domains have API and no screen.

## By domain

### Auth, sessions, tokens
- API: `/api/auth/web/{signin,signout,signup,signup_status,me,change_password}`, `auth.login/logout`, `auth.session.*`, `auth.token.*`. Screens: signin, signup, account/password.
- API, no story: first-run signup gated by `signup_status`; session expiry mid-task; signout; token list/create (secret shown once)/revoke; session list/kill.
- No API: SSO/OIDC; step-up / second factor (required by 02:13, 02:44).
- Missing states: session expired with unsaved input; 401 vs 403; signin lockout.

### Approvals
- No approval resource. Related: notify event class `approval`, remediation mode "propose", `system.remediation.get/set`, `agent_hook.approve/list` (plugin hooks only).
- 01, 05, 07 each define their own approve intent; only 02 defines expiry, args binding, execute-once.
- Missing: requester cancel, approval history, quorum/delegation, approver notification, self-approval policy (02:45 open).

### Navigation and cross-cutting
- No story for IA/nav, global search (CommandPalette exists), namespace switcher, RBAC visibility of controls, dark mode, mobile, onboarding, accessibility (only 06:26).
- No API: general audit log (`system.history` is host-scoped).
- WS disconnect covered only in 05; ServerHealthBanner has no story.
- Concurrent edit: unverified whether entities carry a version/etag.
- Long-running cancel: no story or API for cancelling rollout, backup, adopt, scan; `system.update` break_lock unstoried.

### Namespaces and roles
- API, no story: namespace create/switch/delete, access grant/revoke, who-has-what view, per-screen 403.

### Systems, mesh, fleet
- Story 04: `system.update` (dryRun preview + execute) and `system.update.status` exist; story marks them TBD. Missing: single-flight lock and break_lock, channel switch, unreachable peers, daemons-only vs plugin updates.
- Story 06: `system.topology` exists; story marks it TBD.
- API, no story: join/pairing, install/uninstall, mesh remove, per-host logs/history/telemetry, cert expiry, cron diff/apply, remediation policy (drives "proposed" vs "applied" in 01 and 05), hostname edit, service restart.

### Storage
- API, no story: mount create/edit/delete, shares + repair-permissions, replication, exports.
- Unknown: storage-server failover API (willow/maple).

### Backup
- API, no story: list/status, run now, `backup.check` checksum verify, restore with approval, sync.

### Services, specs, deploy, containers
- API, no story: spec authoring, deploy to target, container lifecycle, deploy history, service health.
- No API: stack/LXC/VM-specific endpoints in this spec; `container.delete`.

### Plugins
- API, no story: install (trust exchange/signing), update with channel, uninstall, plugin UI assets (`serve_asset`), hook approval.

### Secrets, PKI, config, files
- API, no story: secret create/rotate (value never shown back), grants, config-source diff/apply/push, file browser/edit, cert issue.

### Other domains
- Schedules: create/list/detail only; no update/delete API.
- Notify: channel/subscription setup unstoried; bulk resolve and dedupe counts (05) unverified against `notify.update`.
- Security: scan progress, findings triage.
- Models and agents: model CRUD, backends check, agents.
- Identity: unit identity, privilege audit/repair.
- Media: libraries, units, rescan.
- `web.update`: purpose unknown.

## Contradictions in existing stories
- README:15-17 says tools are never invented; 03 and 07 depend on unspecified tools.
- 01:42 treats `storage.mount.update` as propose/apply; propose-for-approval actually comes from remediation policy.
- Approver role differs: 02 says super-admin, 01/05/07 say operator. No role model defined.
- 03:25 maps to `orca tool --id`, which has no REST counterpart (possibly MCP-only).
- 04:46 `apply(previewId)`: dryRun returns no persisted preview id, so preview and apply can't be bound.
- 07:35-36 auto-rollback needs a backup the wizard took; no API says how.
- Permission-denied, session-expired, WS-disconnect states missing from most stories.

## Holds
- Thin-UI rule consistent; screen-state taxonomy consistent; 06 has an accessible list view; mobile drawer and theming exist in code.

## To verify
- Push transport and event names (outside openapi.json?).
- Whether approvals ride on notify `class=approval` + remediation.
- Whether SSO exists outside the committed spec.
- Whether the tool surface is reachable from REST.
