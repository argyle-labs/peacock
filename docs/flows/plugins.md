# Plugins & updates — wireframes

Low-fidelity wireframes for area `plugins` in [INDEX.md](INDEX.md). Phone frame first (~40 cols), desktop (~90 cols) where layout differs. Every screen is an orca JSON dashboard; widget kinds named under each frame are what orca declares, and each UI decides how to render them. Every control is grant-gated: a control the viewer lacks the grant for is hidden or disabled per the widget's rule.

Intent names are written as `domain.verb`. `system.update`, `system.update.status` and `break_lock` exist in orca; the other names describe the operation and are confirmed against orca's API before build (see Open questions).

Shared chrome on every frame: `[=]` opens the drawer menu; the search bar is the command palette.

```text
Drawer (phone, open)            Search-as-palette (phone)
+--------------------------------------+  +--------------------------------------+
| orca           mesh: home  v     [x] |  | [=] [ plugins: jelly_            ][x]|
|--------------------------------------|  |--------------------------------------|
|  Search                              |  | Filters: [Plugins v] [Any state v]   |
|  Dashboards                          |  |--------------------------------------|
|  Topology                            |  | PLUGINS                              |
|  Containers & VMs                    |  |  Jellyfin     media player  Install >|
|  Services                            |  | ACTIONS                              |
| >Plugins                             |  |  Update Jellyfin on all machines    >|
|  Jobs                                |  |  Switch Jellyfin channel            >|
|  Notifications                       |  |                                      |
|  Account                             |  |                                      |
+--------------------------------------+  +--------------------------------------+
```

---

## plugins-01 Plugins tab

Lists every plugin from every registered source, with suggestions from what orca detected on the network.

### 01-a Loading

```text
+--------------------------------------+
| [=] [ Search plugins, actions...   ] |
|--------------------------------------|
| Plugins                              |
| [Installed] [Available] [All]        |
|--------------------------------------|
| ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     |
| ░░░░░░░░░░░░░░░░░░░░░░░             |
| ░░░░░░░░░░░░░░░░░░░░░░░░░░░░        |
+--------------------------------------+
```
Widgets: table (skeleton rows), filter chips.

### 01-b Populated (phone)

```text
+--------------------------------------+
| [=] [ Search plugins, actions...   ] |
|--------------------------------------|
| Plugins                  [+ Source]  |
| [Installed] [Available] [All]        |
| Category: [Any v]  Source: [Any v]   |
|--------------------------------------|
| SUGGESTED (detected on network)      |
| +----------------------------------+ |
| | Home Assistant   home automation | |
| | seen at 1 machine        Install>| |
| +----------------------------------+ |
| | Plex              media player   | |
| | seen at 2 machines       Install>| |
| +----------------------------------+ |
|--------------------------------------|
| INSTALLED                            |
| Proxmox     hypervisor  3/3  v1.4  * |
|   update available v1.5 (stable)    >|
| Caddy       reverse proxy 1/1 v2.0   |
| Vaultwarden password mgr  1/1 v0.9 β |
|--------------------------------------|
| AVAILABLE                            |
| Jellyfin    media player      Info  >|
| 1Password   password mgr      Info  >|
+--------------------------------------+
  * = update available   β = beta channel
```
Widgets: filter chips, select filters, status tiles (suggestions), table with row actions (installed, available). Rows show the generic category, not just the plugin name.

### 01-b Populated (desktop)

```text
+------------------------------------------------------------------------------------------+
| [<] orca  [ Search plugins, actions...                                         ]  (SK)   |
|----------+-------------------------------------------------------------------------------|
| Search   | Plugins                            [Update policy] [Run update] [+ Source]    |
| Dashbrds | [Installed] [Available] [All]   Category [Any v] Source [Any v] Channel [Any v]|
| Topology |-------------------------------------------------------------------------------|
| Cont/VMs | SUGGESTED (detected on network)                                               |
| Services | +-------------------------+ +-------------------------+                       |
| >Plugins | | Home Assistant          | | Plex                    |                       |
| Jobs     | | home automation         | | media player            |                       |
| Notifs   | | 1 machine     [Install] | | 2 machines    [Install] |                       |
| Account  | +-------------------------+ +-------------------------+                       |
|          |-------------------------------------------------------------------------------|
|          | Plugin       Category        Source     Machines Version  Channel  Actions    |
|          | Proxmox      hypervisor      argyle     3/3      1.4 *    stable   [...]      |
|          | Caddy        reverse proxy   argyle     1/1      2.0      stable   [...]      |
|          | Vaultwarden  password mgr    community  1/1      0.9      beta     [...]      |
|          | Jellyfin     media player    argyle     -        1.1      -        [Install]  |
+----------+-------------------------------------------------------------------------------+
  [...] row menu: Details, Install on more machines, Uninstall, Update, Switch channel, Policy
```
Widgets: same as phone; table gains columns on wide screens.

### 01-c Empty (no sources registered)

```text
+--------------------------------------+
| [=] [ Search plugins, actions...   ] |
|--------------------------------------|
| Plugins                              |
|                                      |
|   No plugin sources registered.      |
|   Add a source to see plugins.       |
|                                      |
|          [ + Add a source ]          |
+--------------------------------------+
```
Widgets: status tile (empty state with action).

### 01-d Error

```text
+--------------------------------------+
| [=] [ Search plugins, actions...   ] |
|--------------------------------------|
| Plugins                              |
| ! Source "community" unreachable.    |
|   Showing plugins from 2 of 3        |
|   sources.                [Retry]    |
|--------------------------------------|
| INSTALLED ...                        |
+--------------------------------------+
```
Widgets: status tile (error banner), table.

### 01-e Offline

```text
+--------------------------------------+
| [=] [ Search plugins, actions...   ] |
|--------------------------------------|
| ~ Offline. Last known state 14:02.   |
|   Actions disabled until reconnect.  |
|--------------------------------------|
| Proxmox   3/3  v1.4  *   (Update)    |
| Caddy     1/1  v2.0                  |
|  (controls greyed, no queued actions)|
+--------------------------------------+
```
Widgets: status tile (offline banner), table with row actions disabled.

### 01-f Permission-limited (view grant only)

```text
+--------------------------------------+
| [=] [ Search plugins, actions...   ] |
|--------------------------------------|
| Plugins                              |
| [Installed] [Available] [All]        |
|--------------------------------------|
| Proxmox   hypervisor  3/3  v1.4      |
| Caddy     reverse proxy 1/1 v2.0     |
|  (no Install / Uninstall / Update /  |
|   + Source: viewer holds no grant)   |
+--------------------------------------+
```
Widgets: table without row actions. Whether hidden or disabled follows each widget's visibility rule.

**Sequence:** 01-a → 01-b | 01-c | 01-d | 01-e | 01-f.
**Intents:** `plugin.list` (all sources, with filters), `plugin.suggest` (detected-on-network), push subscription for plugin state changes.

---

## plugins-02 Add a plugin source

### 02-a Form

```text
+--------------------------------------+
| [<] Add plugin source                |
|--------------------------------------|
| Source URL                           |
| [ https://plugins.example.org      ] |
| Name                                 |
| [ example                          ] |
|                                      |
|              [Cancel] [Check source] |
+--------------------------------------+
```
Widgets: form (runs a check action).

### 02-b Trust display — signed, trusted publisher

```text
+--------------------------------------+
| [<] Add plugin source                |
|--------------------------------------|
| example                              |
| plugins.example.org                  |
|--------------------------------------|
| Publisher   Example Labs             |
| Signature   valid                    |
| Signing key ed25519 3F9A..C21B       |
| Plugins     12                       |
|--------------------------------------|
| [ ] I trust this publisher's key     |
|                                      |
|                [Back] [Add source]   |
+--------------------------------------+
```
Widgets: status tiles (publisher, signature, key), form with confirmation check.

### 02-c Untrusted warning

```text
+--------------------------------------+
| [<] Add plugin source                |
|--------------------------------------|
| !! UNTRUSTED SOURCE                  |
| Signature: missing / does not verify |
| Publisher: unknown                   |
|                                      |
| Plugins from this source can run     |
| code on the machines you install     |
| them on.                             |
|--------------------------------------|
| [ ] Add anyway                       |
|           [Cancel] [Add untrusted]   |
+--------------------------------------+
```
Widgets: status tile (warning), form with confirmation check. Whether an untrusted source may be added at all is an open question.

### 02-d Step-up re-auth (if orca marks adding a source high-risk)

```text
+--------------------------------------+
|  Confirm it's you                    |
|  Adding a plugin source requires     |
|  re-entering your credentials.       |
|  Password [ ************          ]  |
|  Code     [ ______ ]  (TOTP)         |
|              [Cancel] [Confirm]      |
+--------------------------------------+
```
Widgets: form (step-up challenge). Input from 02-a/02-b is preserved behind the sheet.

### 02-e Error

```text
+--------------------------------------+
| [<] Add plugin source                |
| Source URL                           |
| [ https://plugins.example.org      ] |
| ! Could not reach source (timeout).  |
|              [Cancel] [Check source] |
+--------------------------------------+
```
Widgets: form with field-level error.

**Sequence:** 02-a → (02-e) → 02-b | 02-c → (02-d) → back to 01-b with new source's plugins.
**Intents:** `plugin.source.check` (fetch publisher, signature, key), `plugin.source.add`.

---

## plugins-03 Install a plugin

### 03-a Disclosure review (phone)

```text
+--------------------------------------+
| [<] Install Jellyfin                 |
|--------------------------------------|
| media player · v1.1 · stable         |
| Source: argyle  (signed, trusted)    |
|--------------------------------------|
| PERMISSIONS                          |
|  - run a container                   |
|  - read media mounts                 |
| ACCESS                               |
|  - secrets: jellyfin/api-key         |
|  - network: port 8096 on machine     |
| CONNECTS TO                          |
|  - storage mounts on target machine  |
| CHANGES                              |
|  - adds a reverse-proxy route        |
|  - registers as a "media player"     |
|--------------------------------------|
|                     [Cancel] [Next]  |
+--------------------------------------+
```
Widgets: status tiles (source trust), grouped list sections (permissions, access, connects to, changes).

### 03-a Disclosure review (desktop)

```text
+------------------------------------------------------------------------------------------+
| [<] Install Jellyfin          media player · v1.1 · stable · argyle (signed, trusted)    |
|------------------------------------------------------------------------------------------|
| PERMISSIONS               | ACCESS                     | CONNECTS TO / CHANGES          |
|  run a container          |  secret jellyfin/api-key   |  storage mounts on target      |
|  read media mounts        |  port 8096                 |  adds reverse-proxy route      |
|                           |                            |  registers "media player"      |
|------------------------------------------------------------------------------------------|
| Target machines                                                                          |
|  [x] baldur   docker   online                                                            |
|  [ ] thor     docker   online                                                            |
|  [-] frigg    proxmox  not supported by this plugin                                      |
|  [-] loki     docker   offline (last seen 2h)                                            |
|                                                                   [Cancel] [Install]    |
+------------------------------------------------------------------------------------------+
```
Desktop merges review and machine pick into one screen.

### 03-b Machine pick (phone)

```text
+--------------------------------------+
| [<] Install Jellyfin — machines      |
|--------------------------------------|
| [x] baldur   docker   online         |
| [ ] thor     docker   online         |
| [-] frigg    not supported           |
| [-] loki     offline                 |
| [-] mimir    no install grant here   |
|--------------------------------------|
|                [Back] [Install (1)]  |
+--------------------------------------+
```
Widgets: form (multi-select with per-row disabled reasons). Machines the viewer lacks a grant for are shown disabled or hidden per widget rule.

### 03-c Step-up re-auth (if the plugin marks install high-risk)

Same sheet as 02-d.

### 03-d Install job

```text
+--------------------------------------+
| [<] Installing Jellyfin              |
|--------------------------------------|
| baldur                               |
|  [✓] Verify signature                |
|  [✓] Pull image                      |
|  [>] Start container       ...       |
|  [ ] Register route                  |
|  [ ] Register generic                |
|--------------------------------------|
|                 [Cancel and roll back]|
+--------------------------------------+
```
Widgets: job progress (step list, live), action button.

### 03-e Cancelled / failed

```text
+--------------------------------------+
| [<] Install Jellyfin                 |
|--------------------------------------|
| x Install failed on baldur:          |
|   container exited (code 1)          |
| Rolled back: image removed, route    |
| not added. Machine at prior state.   |
|                                      |
|       [View logs]  [Close]           |
+--------------------------------------+
```
Widgets: status tile (result), live log stream link.

### 03-f Locked

```text
+--------------------------------------+
| [<] Install Jellyfin                 |
| ! Jellyfin on baldur is being edited |
|   by alex. You can't start a change  |
|   until they finish.                 |
|                            [Close]   |
+--------------------------------------+
```
Widgets: status tile (lock).

**Sequence:** 01-b → 03-a → 03-b → (03-c) → 03-d → done notification | 03-e; 03-f if locked.
**Intents:** `plugin.describe` (disclosure), `plugin.install` with target machine ids, `job.status` subscription, `job.cancel`.

---

## plugins-04 Uninstall a plugin

### 04-a Machine pick + impact preview

```text
+--------------------------------------+
| [<] Uninstall Proxmox                |
|--------------------------------------|
| Machines                             |
| [x] frigg                            |
| [ ] odin                             |
| [ ] tyr                              |
|--------------------------------------|
| IMPACT on frigg (preview)            |
|  - widgets on 2 dashboards stop      |
|    receiving data                    |
|  - "hypervisor" generic loses frigg  |
|  - 4 VMs/LXCs stop being managed     |
|    (they keep running)               |
|--------------------------------------|
|              [Cancel] [Uninstall]    |
+--------------------------------------+
```
Widgets: form (multi-select), status tiles / list (impact from a dry-run).

### 04-b Confirm

```text
+--------------------------------------+
|  Uninstall Proxmox from frigg?       |
|  The impact above will apply.        |
|                                      |
|         [Cancel] [Uninstall]         |
+--------------------------------------+
```
Widgets: confirmation dialog. Step-up sheet (02-d) follows if the plugin marks uninstall high-risk.

### 04-c Job

```text
+--------------------------------------+
| [<] Uninstalling Proxmox             |
|  frigg  [✓] Stop plugin              |
|         [>] Remove registrations ... |
|         [ ] Remove files             |
|                 [Cancel and roll back]|
+--------------------------------------+
```
Widgets: job progress.

**Sequence:** 01-b row menu → 04-a → 04-b → (step-up) → 04-c → result (as 03-e). Lock and offline states as 03-f / 01-e.
**Intents:** `plugin.uninstall` with `dryRun` (preview), `plugin.uninstall` (execute), `job.cancel`.

---

## plugins-05 Update policy

Policy values: manual (default), automatic, notify-and-approve. Scopes: per plugin, per system, per plugin-on-one-system, per channel.

### 05-a Policy (phone, list by scope)

```text
+--------------------------------------+
| [<] Update policy                    |
| Scope: [Plugins v]                   |
|   (Plugins | Systems | Plugin on     |
|    system | Channels)                |
|--------------------------------------|
| Default            manual            |
|--------------------------------------|
| Proxmox     notify-and-approve   •  >|
| Caddy       manual  (inherited)     >|
| Vaultwarden automatic            •  >|
+--------------------------------------+
  • = overridden here    (inherited) = from a broader scope
```
Widgets: select (scope), table with row actions.

### 05-b Edit one cell (phone)

```text
+--------------------------------------+
| [<] Proxmox on frigg                 |
|--------------------------------------|
| Effective   notify-and-approve       |
| Comes from  plugin: Proxmox          |
|--------------------------------------|
| ( ) Inherit                          |
| ( ) Manual                           |
| ( ) Notify and approve               |
| (o) Automatic                        |
|--------------------------------------|
|                  [Cancel] [Save]     |
+--------------------------------------+
```
Widgets: status tiles (effective value, source), form.

### 05-c Policy matrix (desktop)

```text
+------------------------------------------------------------------------------------------+
| [<] Update policy                   Channel: [stable v]        Default: manual           |
|------------------------------------------------------------------------------------------|
|              | (plugin)       | frigg          | odin           | baldur                 |
| (system)     |       -        | manual         | automatic •    | manual                 |
| Proxmox      | notify •       | automatic •    | notify  ↑      | -                      |
| Caddy        | manual ↑       | -              | -              | manual ↑               |
| Vaultwarden  | automatic •    | -              | -              | automatic ↑            |
|------------------------------------------------------------------------------------------|
| • overridden here   ↑ inherited   - not installed        click a cell to edit (05-b)     |
+------------------------------------------------------------------------------------------+
```
Widgets: table (matrix) with cell actions.

### 05-d Locked / permission-limited

```text
+--------------------------------------+
| [<] Update policy                    |
| ! Being edited by alex. Read only.   |
|--------------------------------------|
| Proxmox     notify-and-approve       |
| Caddy       manual  (inherited)      |
|  (no edit: lock held, or viewer has  |
|   no update-policy grant)            |
+--------------------------------------+
```
Widgets: status tile (lock), table read-only.

**Sequence:** 01-b [Update policy] → 05-a | 05-c → 05-b → saved; 05-d when locked, no grant, or offline.
**Intents:** `update.policy.get` (with effective value and its source per scope), `update.policy.set` (scope, value or inherit), lock acquire on open/release on leave.

---

## plugins-06 Run an update

### 06-a Preview (phone)

```text
+--------------------------------------+
| [<] Update                           |
| Target: [Proxmox v] [All machines v] |
|--------------------------------------|
| PREVIEW (dry run)                    |
| frigg   1.4 -> 1.5   ready           |
| odin    1.4 -> 1.5   ready           |
| tyr     1.4 -> 1.5   unreachable     |
|   last seen 3h; will be skipped      |
|--------------------------------------|
| Changes in 1.5                       |
|  - (release notes from plugin)       |
|--------------------------------------|
|          [Cancel] [Apply to 2]       |
+--------------------------------------+
```
Widgets: select (target), table (per-machine preview), text block (release notes), action button.

### 06-a Preview (desktop)

```text
+------------------------------------------------------------------------------------------+
| [<] Update     Target [Proxmox v]  Machines [All v]  Channel: stable                     |
|------------------------------------------------------------------------------------------|
| Machine  Current  Target  Status        | Changes in 1.5                                 |
| frigg    1.4      1.5     ready         |  (release notes from plugin)                   |
| odin     1.4      1.5     ready         |                                                |
| tyr      1.4      1.5     unreachable   |                                                |
|                                         |                                                |
|                                                              [Cancel] [Apply to 2]       |
+------------------------------------------------------------------------------------------+
```

### 06-b Lock held by another update

```text
+--------------------------------------+
| [<] Update                           |
| ! An update is already running       |
|   (started by alex, 14:01).          |
|   [View rollout]                     |
|   [Break lock]  (needs grant)        |
+--------------------------------------+
```
Widgets: status tile (lock), actions. Break lock shows a confirm and, if marked high-risk, the step-up sheet (02-d).

### 06-c Rollout progress

```text
+--------------------------------------+
| [<] Updating Proxmox -> 1.5          |
|--------------------------------------|
| frigg  [✓] done                      |
| odin   [>] restarting ...            |
| tyr    [-] skipped: unreachable      |
|--------------------------------------|
| ▓▓▓▓▓▓▓▓░░░░░░  1 of 2               |
|                 [Cancel and roll back]|
+--------------------------------------+
```
Widgets: job progress (per-machine rows, live), action button.

### 06-d Finished with failures / rolled back

```text
+--------------------------------------+
| [<] Update Proxmox -> 1.5            |
| frigg  1.5  done                     |
| odin   1.4  failed, rolled back      |
| tyr    1.4  skipped: unreachable     |
|        [View logs] [Retry failed]    |
+--------------------------------------+
```
Widgets: table (results), live log stream link, actions.

**Sequence:** 01-b or palette → 06-a → (step-up) → 06-c → 06-d / done notification; 06-b if lock held. Offline as 01-e (Apply disabled).
**Intents:** `system.update` with `dryRun` (preview), `system.update` (execute), `system.update.status` subscription, `job.cancel`, `break_lock`.

---

## plugins-07 Switch channel

### 07-a Channel pick

```text
+--------------------------------------+
| [<] Channel — Vaultwarden            |
| Applies to: [All machines v]         |
|--------------------------------------|
| (o) stable   0.8                     |
| ( ) beta     0.9                     |
|--------------------------------------|
| Current: beta 0.9                    |
|                 [Cancel] [Switch]    |
+--------------------------------------+
```
Widgets: select (scope: plugin, system, plugin on one system), form (radio).

### 07-b Confirm

```text
+--------------------------------------+
|  Switch Vaultwarden to stable?       |
|  Versions after switch:              |
|   baldur  0.9 beta -> 0.8 stable     |
|  Update policy for stable applies    |
|  from now on.                        |
|         [Cancel] [Switch]            |
+--------------------------------------+
```
Widgets: confirmation dialog with preview table. Whether switching moves the installed version immediately or only on the next update is an open question; the line "0.9 -> 0.8" is shown only if orca reports it.

**Sequence:** 01-b row menu or palette → 07-a → 07-b → (step-up) → job as 06-c if a version change runs. Lock / offline / no-grant as 05-d / 01-e.
**Intents:** `plugin.channel.set` (target plugin or system or plugin-on-system, channel) with preview, then execute.

---

## Open questions

1. Exact orca operation names for list, suggest, source check/add, describe, install, uninstall, policy get/set and channel switch; only `system.update`, `system.update.status` and `break_lock` are confirmed.
2. Can an untrusted (unsigned or unverified) source be added at all, or only viewed? Which grant allows it?
3. Which actions does orca core mark high-risk (adding a source, breaking a lock) versus actions plugins mark themselves (install, uninstall, update)?
4. What does a suggestion carry: detected service, machine, confidence? Can a suggestion be dismissed?
5. Uninstall: what happens to data, secrets and workloads the plugin created? (Interview settles this only for deleting a service: ask each time, backup only if approved.)
6. Does switching channel change the installed version immediately, or on the next update? Is downgrading beta -> stable allowed?
7. Precedence when per-plugin, per-system, per-plugin-on-system and per-channel policies conflict.
8. Notify-and-approve: does approval happen in the approvals flow (`ops`), and who receives it (holder of which grant)?
9. Does a fleet update cover orca daemons, plugins, or both in one rollout (story-gaps: daemons-only vs plugin updates)?
10. Is a machine that was unreachable during a rollout updated automatically when it returns, or left for the next manual run?
11. Push event names for plugin state, job progress and rollout status (story-gaps: no WS channel/event names declared).
12. Can a user review and change a source's trust (rotate or revoke the signing key) after adding it?
