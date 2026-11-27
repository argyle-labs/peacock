# Flow inventory

Every user flow orca must support, as rendered by peacock (web first, then TUI, iOS, Android). Peacock is a UI only: every flow runs the same orca operation the CLI and MCP run, and every screen is an orca JSON dashboard or widget that each UI renders its own way.

Sources: `I:` = `docs/analysis/interview-2026-11-26.md` (overrides everything); `G:` = `docs/analysis/story-gaps.md`; `S0N` = `docs/user-stories/0N-*.md`. "Grant holder" means whoever holds the grant for that action; the super grant holds all grants.

Shared states every flow needs, not repeated per flow: loading, empty, populated, error, permission-denied (403, control hidden or disabled per widget rule), session expired (401, input preserved), offline (last known state, controls disabled, no queued actions), "being edited by X" lock, step-up re-auth prompt where a plugin marks the action high-risk.

## Areas

| Slug | Area |
| --- | --- |
| `access` | Access & identity |
| `nav` | Search, navigation & dashboards |
| `mesh` | Topology, systems & mesh |
| `workloads` | Containers/VMs, services & storage passthrough |
| `plugins` | Plugins & updates |
| `ops` | Notifications, remediation, approvals & jobs |
| `data` | Backups, migration, secrets, config/git sync, metrics/logs, audit |
| `enduser` | End-user experience: apps/SSO, media requests, problem reports, home control, kiosk |

## access — Access & identity

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| access-01 | First-run setup. As the first person I can enter the one-time code from the setup logs and create the first account so that I hold the super grant. | Setup-code entry (invalid/expired code), create account, enroll TOTP, done. | I: First run; G: `signup_status`, `auth/web/signup` |
| access-02 | Sign in. As any user I can sign in with password and second factor so that I reach search. | Sign-in, second-factor prompt, lockout, wrong credentials, mesh picker when several meshes are connected. | I: Second factors, Multiple meshes; G: `auth/web/signin`, signin lockout |
| access-03 | Sign out. As any user I can sign out of this session. | Confirm, signed-out. | G: `auth/web/signout` |
| access-04 | Step-up re-auth. As any user I can re-enter my password or second factor when an action is marked high-risk so that it proceeds. | Modal prompt, failure, cancel. | I: Step-up re-auth, Secrets; G: no API |
| access-05 | Second-factor enrollment. As any user I can add and remove TOTP (then passkeys, mobile push, email codes) so that my account is protected. | Factor list, TOTP QR + verify, remove factor (step-up). | I: Second factors; G: no API |
| access-06 | Change password. As any user I can change my password. | Form, validation, success. | I: Account page; G: `change_password` |
| access-07 | Sessions and devices. As any user I can see my active sessions/devices and end any of them. | List, end session, end all others. | I: Account page; G: `auth.session.*` |
| access-08 | Invite a user. As an invite-grant holder I can create an invite with optional groups/grants attached and VPN access, delivered through a notification channel, so that the person is provisioned on join. | Invite form (groups/grants, expiry), delivery channel pick, default channel shows copyable invite content, sent. | I: Onboarding users, Remote access, Invite delivery |
| access-09 | Accept an invite. As an invited person I can open the invite, create my account and be provisioned automatically (accounts, grants, VPN). | Invite landing, invalid/expired invite, create account, provisioning progress, done. | I: Invite delivery |
| access-10 | Self sign-up. As a new person I can sign up and wait for approval and permissions. | Sign-up form, pending-approval state, approved/denied. | I: Onboarding users; G: `auth/web/signup` |
| access-11 | Approve sign-ups. As a request-receiving grant holder I can approve or deny pending sign-ups and assign groups/grants. | Pending list, detail, approve with grants, deny. | I: Onboarding users, Access requests |
| access-12 | Users list and detail. As a user-management grant holder I can see every user, their grants, groups, app accounts and sessions. | List with filters, user detail. | I: Roles, Grant scope |
| access-13 | Grant and revoke access. As a holder of both the grant-permission and the access itself I can grant or revoke grants scoped to mesh, machine or resource, with optional expiry. | Grant picker, scope picker, expiry, blocked state when I don't hold the access. | I: Roles, Grant scope |
| access-14 | Groups. As a group grant holder I can create, edit and delete grant groups, including viewing default groups plugins reference. | Group list, editor, default (read-only) groups. | I: Roles |
| access-15 | Who has what. As a grant-viewing holder I can see who holds a grant on a resource. | Resource access view, per-principal breakdown. | G: who-has-what view |
| access-16 | Request more access. As any user I can request access to an app or grant and follow its status. | Request form, my requests, approved/denied. | I: Account page, Access requests |
| access-17 | Decide access requests. As a request-receiving grant holder I can approve or deny access requests. | Inbox list, detail, approve with scope/expiry, deny. | I: Access requests |
| access-18 | Offboard a user. As a user-management grant holder I can remove a user after previewing what will be disabled (app accounts, VPN, sessions) for the retention period before deletion. | Removal preview, confirm (step-up), disabled-pending-deletion state, restore within retention. | I: Offboarding |
| access-19 | API tokens. As a token grant holder I can create a token with grants bounded by what I hold, see its secret once, list and revoke tokens. | Token list, create with grants, one-time secret reveal, revoke. | I: API tokens; G: `auth.token.*` |
| access-20 | Account page. As any user I can manage password, factors, sessions, per-app credentials, notification preferences and themes in one place. | Sectioned account page. | I: Account page |
| access-21 | Connect another mesh. As any user I can add a separate mesh to peacock (separate account per mesh) and optionally view meshes unified. | Add mesh, sign in to it, mesh switcher, unified-view toggle. | I: Multiple meshes |

## nav — Search, navigation & dashboards

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| nav-01 | Landing search. As any user I land on search and find anything my grants allow, filtered, with per-result actions. | Search landing, results grouped by generic, filters, no results, results limited by grants. | I: Default landing, Search |
| nav-02 | Command palette. As any user I can use the search bar as a command palette to run actions and jump anywhere, keyboard-first. | Palette open, action results, argument entry, confirmation. | I: Navigation |
| nav-03 | Drawer navigation. As any user I can open the slide-out drawer (collapsible on web) listing the dashboards my grants allow. | Drawer open/collapsed, mobile overlay. | I: Navigation; G: nav.ts gap |
| nav-04 | View default dashboards. As any user I can open the orca default dashboards (generic categories) my grants allow. | Dashboard render, widgets hidden or read-only per rule. | I: Default dashboards, Generics first |
| nav-05 | Personal dashboards. As any user I can create, rename, arrange (drag-and-drop canvas) and delete my own dashboards. | Dashboard list, edit mode canvas, widget add picker, resize, save, delete. | I: User dashboards, Admin landing |
| nav-06 | Shared dashboards. As a shared-dashboard grant holder I can publish a dashboard others view read-only. | Share toggle, audience, read-only view. | I: User dashboards |
| nav-07 | Plugin dashboards. As any user I can open the optional dashboards a plugin defines, built from its widgets. | Same as nav-04. | I: Plugin screens |
| nav-08 | Widget permission overrides. As a widget-rule grant holder I can view a widget's default visibility/control rules and override them, including widening access through that widget only. | Rule editor, default vs override, widened-access warning. | I: Widget permissions |
| nav-09 | Widget interaction. As any user I can use each widget kind: status tile, chart, table with row actions, action form, live log stream, terminal/VM console, topology graph. | Per-kind populated, disabled control, unknown-kind fallback. | I: Widget kinds, Rendering contract |
| nav-10 | Themes. As any user I can create custom themes, pick a default theme that applies across web, TUI and mobile. | Theme list, editor with live preview, set default. | I: Visual design |
| nav-11 | Connection failover. As any user I keep working when my connected machine goes down because peacock switches to another mesh machine. | Reconnecting banner, reconnected, all machines unreachable (offline state). | I: Connection failover, Offline |
| nav-12 | My action history. As any user I can see my own action history. | List, filters, detail. | I: Audit log |

## mesh — Topology, systems & mesh

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| mesh-01 | Topology view. As a topology grant holder I can see the whole mesh as a tree/graph with parent/child relationships and what affects what, with an accessible list view. | Graph, list view, node detail, down-propagation highlighting. | I: Default screens, Service wiring; S06; G: `system.topology` |
| mesh-02 | Join a machine by address. As a mesh grant holder I can join a machine by dialing an inviter with address + token. | Form, dialing, joined, failure. | I: Joining machines (`join`) |
| mesh-03 | Offer to a discovered machine. As a mesh grant holder I can push an offer to a machine discovered via mDNS and see its pairing code. | Discovered list, offer sent with code, accepted. | I: Joining machines (`offer`) |
| mesh-04 | Accept an offer. As a mesh grant holder I can complete an offer by its 6-char code. | Code entry, invalid code, joined. | I: Joining machines (`accept`) |
| mesh-05 | Remove a machine. As a mesh grant holder I can remove a machine from the mesh. | Impact preview, confirm (step-up), removed. | G: mesh remove |
| mesh-06 | Systems list and detail. As a systems grant holder I can see every orca system, its capabilities (GPU, QuickSync, etc.), health, certs and storage. | List, detail, unreachable machine (last known state). | I: Deployment target, Storage; G: telemetry, cert expiry |
| mesh-07 | Edit system settings. As a systems grant holder I can edit a machine's hostname and settings. | Form under lock, saved. | G: hostname edit |
| mesh-08 | Install/uninstall orca on a host. As a systems grant holder I can install or uninstall orca on a host. | Target pick, progress job, failure. | G: install/uninstall |
| mesh-09 | Schedules. As a schedule grant holder I can create, list and view scheduled work per system. | List, create, detail. | G: Schedules, cron diff/apply |
| mesh-10 | VPN remote access. As a VPN grant holder I can set up the VPN plugin (Tailscale, OpenVPN or equivalent) for remote access. | Provider pick, setup, status. | I: Remote access |
| mesh-11 | File browser. As a files grant holder I can browse shares and container config folders, upload and download. | Tree, file view, upload progress, download. | I: File browser; G: file browser/edit |

## workloads — Containers/VMs, services & storage passthrough

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| workloads-01 | Containers and VMs. As a workload grant holder I can see containers and VMs on one screen and start, stop, restart them. | Unified list, detail, lifecycle actions, console widget. | I: Default screens; G: container lifecycle |
| workloads-02 | Services list and detail. As a services grant holder I can see services by generic category with health and connections. | List grouped by generic, detail, broken-connection state. | I: Default screens, Generics first; G: `service.*` |
| workloads-03 | Create a service. As a services grant holder I can create a service, pick its deployment target from systems' capabilities, select mounts, and have orca build the storage chain and wire it to related services by generic role. | Generic/plugin pick, target pick with capability badges, mount selection, wiring preview, run as job. | I: Deployment target, Storage passthrough, Service wiring |
| workloads-04 | Adopt an existing service. As a services grant holder I can adopt a running service into orca. | Discover, plan, apply, verify. | S07; G: adopt endpoints missing |
| workloads-05 | Repair a broken service link. As a services grant holder I can see a broken link (e.g. downloader to media player scan) and accept orca's repair. | Link highlighted in topology, repair proposal, job. | I: Service wiring |
| workloads-06 | Run service actions. As an instance grant holder I can run a service instance's plugin-declared actions. | Action form, result, scoped to instance. | S03; G: no action-run endpoint |
| workloads-07 | Delete a service. As a services grant holder I can delete a service and choose each time what happens to config, DB and managed media, with an optional backup. | Data-choice dialog, optional backup, confirm, job. | I: Deleting a service |
| workloads-08 | Mounts. As a storage grant holder I can create, edit and delete mounts on a system and see mount health. | Per-system mount list, editor, unhealthy mount. | I: Storage; S01; G: Storage |
| workloads-09 | Storage passthrough chain. As a storage grant holder I can pass storage from a storage system through host, LXC and container layers to the subsystems that need it. | Chain view, missing-prerequisite state, build chain job. | I: Passthrough chains |
| workloads-10 | Register or create a share. As a storage grant holder I can register or create an SMB share on a storage system and use it across the mesh, and repair its permissions. | Share form, permission check, repair. | I: Storage; G: shares + repair-permissions |
| workloads-11 | Deploy history. As a services grant holder I can see deploy history for a service. | Timeline, detail. | G: deploy history |

## plugins — Plugins & updates

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| plugins-01 | Plugins tab. As a plugin grant holder I can list every plugin from every source, with suggestions from what is detected on the network. | List, suggested section, installed/available filter. | I: Default screens |
| plugins-02 | Add a plugin source. As a plugin grant holder I can register a source and see its publisher/signature trust. | Form, trust display, untrusted warning. | I: Plugin sources |
| plugins-03 | Install a plugin. As a plugin grant holder I can review its permissions, access and what it connects to or changes, pick target machines, and install. | Disclosure review, machine pick, install job. | I: Plugin sources; G: trust exchange |
| plugins-04 | Uninstall a plugin. As a plugin grant holder I can uninstall a plugin from chosen machines. | Impact preview, confirm, job. | G: uninstall |
| plugins-05 | Update policy. As an update grant holder I can set update policy (manual, automatic, notify-and-approve) per plugin, per system, per plugin-on-system and per channel. | Policy matrix, inherited vs overridden. | I: Updates |
| plugins-06 | Run an update. As an update grant holder I can preview and apply an update across the fleet and follow the rollout. | Preview, apply, rollout progress, unreachable machines, lock held by another update. | I: Updates; S04; G: `system.update`, break_lock |
| plugins-07 | Switch channel. As an update grant holder I can switch a plugin or system between stable and beta. | Channel pick, confirm. | I: Updates; G: channel switch |

## ops — Notifications, remediation, approvals & jobs

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| ops-01 | Notifications inbox. As any user I can see my notifications, resolve them and act on them. | Inbox, grouped/deduped, bulk resolve, live push. | I: Problem alerts; S05 |
| ops-02 | Notification preferences. As any user I can choose which channels notify me of what. | Per-class channel matrix. | I: Problem alerts, Account page |
| ops-03 | Notification channels. As a channel grant holder I can configure notification channel plugins (including orca cloud). | Channel list, setup, test send. | I: Problem alerts, Invite delivery; G: Notify |
| ops-04 | Remediation policy. As any user I can make a plugin fix rule stricter; as a remediation grant holder I can loosen it. | Rule list per plugin fix, default vs override, notify-only fixes. | I: Remediation policy; G: `system.remediation.*` |
| ops-05 | Approve a remediation or action. As an approver grant holder I can review a pending action with its exact arguments and expiry and approve or deny it once. | Approval detail, step-up, expired, already decided. | S02; G: approvals API missing |
| ops-06 | Provide required input. As a grant holder I can supply the input a fix requires so it can run. | Input form from fix definition. | I: Remediation policy |
| ops-07 | Jobs list. As any user I can see running and recently finished jobs my grants allow. | List, filters. | I: Long-running jobs |
| ops-08 | Job detail and cancel. As a job's grant holder I can follow step-by-step progress and cancel, rolling back completed work. | Live steps, cancel confirm, rolling back, rolled back, failed. | I: Long-running jobs |
| ops-09 | Security findings. As a security grant holder I can run scans, watch progress and triage findings. | Scan progress, findings list, triage. | G: Security |

## data — Backups, migration, secrets, config/git sync, metrics/logs, audit

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| data-01 | Backup coverage. As a backup grant holder I can see what is and isn't backed up. | Coverage view, gaps highlighted. | I: Backups; G: Backup |
| data-02 | Backup schedules and destinations. As a backup grant holder I can set schedules and destinations. | Schedule editor, destination editor. | I: Backups |
| data-03 | Run and verify a backup. As a backup grant holder I can run a backup now and checksum-verify it. | Run job, verify result, failed verification. | I: Backups; G: `backup.check` |
| data-04 | Restore. As a backup grant holder I can restore a whole service, a single file, or a whole machine. | Scope pick, snapshot pick, preview, step-up, job. | I: Backups |
| data-05 | Migrate. As a migration grant holder I can move a system or service to another runtime (VM, LXC, Docker, Podman, Apple containers) via backup/restore where the plugin supports it. | Source, target runtime pick (unsupported disabled), job. | I: Backups |
| data-06 | Secrets. As a secrets grant holder I can create and rotate secrets; viewing a value requires the view-secrets grant and step-up. | Secret list (values hidden), create, rotate, reveal after step-up. | I: Secrets; G: Secrets |
| data-07 | Config sources and git sync. As a config grant holder I can connect a git source, see sync status, and choose git-wins or manual conflict resolution. | Source setup, sync status, pulling (writes blocked), conflict resolver. | I: Git sync; G: config-source diff/apply/push |
| data-08 | Metrics history. As a metrics grant holder I can view metrics over time for any machine, service or container and set retention and storage location. | Chart widgets, range pick, retention settings. | I: Metrics history |
| data-09 | Logs. As a logs grant holder I can view live and past logs for any container, service or machine, search across the mesh, and set retention. | Live stream, search, retention settings. | I: Logs |
| data-10 | Audit log. As an audit grant holder I can view elevated actions and anomaly warnings. | List, filters, anomaly detail. | I: Audit log; G: no API |
| data-11 | Certificates. As a PKI grant holder I can issue certificates and see expiry. | Cert list, issue, expiring state. | G: cert issue, cert expiry |

## enduser — End-user experience

| Id | Flow | Screens / states | Traces to |
| --- | --- | --- | --- |
| enduser-01 | My apps. As any user I can see the apps granted to me and open them via SSO. | App grid, SSO launch, app unavailable. | I: App grants |
| enduser-02 | App credentials. As any user I can view and rotate the managed password for apps that can't use SSO. | Credential view (step-up), rotate. | I: App grants, Account page |
| enduser-03 | Grant an app. As an app grant holder I can grant an app to a user so orca creates their account, optionally with app admin for that app. | User/app pick, app-admin toggle, provisioning job. | I: App grants, App admin grant |
| enduser-04 | Media search and request. As a media grant holder I can search, see what's already in the library and request what's missing. | Search results with in-library state, request form. | I: Request experience |
| enduser-05 | My requests. As a media grant holder I can follow my requests' status. | List, status states. | I: Request experience |
| enduser-06 | Approve media requests. As a request-approval grant holder I can approve or deny requests and set per-user auto-approve (manual by default). | Pending list, decide, per-user setting. | I: Request approval |
| enduser-07 | Report a problem. As any user I can report a problem and follow it (received, being fixed, fixed) until notified it is resolved. | Report form, status tracker. | I: Request experience, User problem reports |
| enduser-08 | Problem-report handling. As a report-settings grant holder I can set per problem type: notify an admin, admin-approved auto-fix, or auto-fix. | Problem-type list, handling pick. | I: User problem reports |
| enduser-09 | Home control. As a home grant holder I can control Home Assistant entities from their dashboards or any dashboard. | Entity widgets, actuating, entity unavailable. | I: Home control |
| enduser-10 | Kiosk device sign-in. As a device grant holder I can sign a wall tablet or TV in as a limited device account via short code, QR or notification approval. | Device code/QR screen, approval notification, signed in. | I: Display/kiosk mode |
| enduser-11 | Kiosk display. As a device account I show one dashboard full-screen and always on. | Full-screen dashboard, offline last-known state. | I: Display/kiosk mode |

## Open questions

1. Grant catalog: the concrete grant names (e.g. invite, grant-to-others, view-secrets, approve, audit) are not defined; every "grant holder" above needs a named grant.
2. Default groups: which default groups exist and what they contain.
3. Default dashboard set: the interview says it "must be defined"; its contents are not.
4. SSO/OIDC provider: no API exists in the spec (G: To verify).
5. Approvals: no approval resource exists; whether it rides on notify `class=approval` + remediation, and self-approval, quorum, delegation and requester-cancel policy.
6. Step-up and second factors: no API exists; which actions core marks high-risk beyond plugin declarations.
7. Server push: transport and event names are undeclared.
8. Action run surface: no REST endpoint runs a service instance or tool action.
9. Adopt endpoints (discover/plan/apply/verify) do not exist.
10. Update preview binding: dryRun returns no persisted preview id.
11. Rollback on cancel: how each job type records prior state to roll back to.
12. Locks: whether entities carry a version/etag; lock timeout duration.
13. Offboarding retention period default.
14. Extended-downtime alert threshold.
15. Multi-mesh unified view: what is merged and how identity across meshes is presented.
16. Schedules: no update/delete API.
17. Storage-server failover API (willow/maple) is unknown.
18. Container delete and stack/LXC/VM-specific endpoints are absent from the spec.
19. Device account grant scope and kiosk exit/lock behavior.
20. Visual design direction: the interview marks a follow-up TODO.
21. AI/agents, orca cloud paid services, other languages: long-term, no flows drafted.
22. Models/agents, identity privilege audit/repair, media libraries/rescan, `web.update`: APIs exist, interview gives no flow; whether they get dashboards.
