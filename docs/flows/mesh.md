# mesh: Topology, systems & mesh

Low-fidelity wireframes for every flow in the `mesh` area of [INDEX.md](INDEX.md). Phone frame first (about 40 columns), desktop (about 90 columns) where the layout differs. Every screen is an orca JSON dashboard; widget kinds named under each frame are what orca declares, and each UI decides how to render them. Every control is grant-gated: "grant holder" means whoever holds the grant for that action, and the super grant holds all grants.

Shared chrome on every frame: `[=]` opens the drawer menu, the search bar is the command palette. Shared states from INDEX.md (loading, empty, error, 401, 403, offline, lock, step-up) are drawn where a flow needs them and use the same pattern everywhere.

Shared drawer (phone, open):

```text
+--------------------------------------+
| [x]  orca           mesh: home  [v]  |
|--------------------------------------|
|  Search                              |
|  Dashboards                          |
|  Topology                            |
|  Systems                             |
|  Containers & VMs                    |
|  Services                            |
|  Schedules                           |
|  Files                               |
|  Remote access                       |
|  Plugins                             |
|  Jobs                                |
|  Notifications                       |
|  Account                             |
+--------------------------------------+
```
Widgets: navigation list (entries limited to what the user's grants allow), mesh switcher.

---

## mesh-01 Topology view

### 1a Phone, graph, populated

```text
+--------------------------------------+
| [=] [ Search topology...         ]   |
|--------------------------------------|
| Topology        [Graph|List] [Filt]  |
|--------------------------------------|
|        (willow)       (maple)        |
|          storage       storage       |
|             \            /           |
|              \          /            |
|              (frigg) hypervisor      |
|               /     \                |
|        (baldur)    (thor)            |
|         lxc         lxc              |
|        /   |   \                     |
|  [tv-dl] [idx] [player]              |
|          ok    ! link broken         |
|                                      |
|  ! 1 broken link      [Show]         |
|--------------------------------------|
| Legend: ok  ! degraded  x down       |
+--------------------------------------+
```
Widgets: topology graph (nodes = systems, guests, services, storage; edges = parent/child, mounts, service links), status tile (broken-link count), filter control.

### 1b Phone, list view (accessible)

```text
+--------------------------------------+
| [=] [ Search topology...         ]   |
|--------------------------------------|
| Topology        [Graph|List] [Filt]  |
|--------------------------------------|
| v willow         storage      ok     |
| v maple          storage      ok     |
| v frigg          hypervisor   ok     |
|   v baldur       lxc          ok     |
|     > tv-dl      tv downldr   ok     |
|     > indexer    indexer      ok     |
|     > player     media player !      |
|        link tv-dl->player broken     |
|   > thor         lxc          ok     |
+--------------------------------------+
```
Widgets: table (tree rows, expand/collapse, status column).

### 1c Phone, node detail (bottom sheet)

```text
+--------------------------------------+
|  ...graph dimmed above...            |
|======================================|
| player            media player   !   |
| on baldur > frigg                    |
|--------------------------------------|
| Depends on                           |
|   baldur (lxc)              ok       |
|   willow:/data/media        ok       |
| Linked from                          |
|   tv-dl -> scan folder      broken   |
| Affects                              |
|   (none)                             |
|--------------------------------------|
| [Repair link]   [Open service]       |
+--------------------------------------+
```
Widgets: status tile, table (depends on / linked from / affects), form-action buttons. `Repair link` shows only to the repair grant holder; it hands off to the remediation flow in `ops`.

### 1d Phone, down-propagation highlighting

```text
+--------------------------------------+
| [=] [ Search topology...         ]   |
|--------------------------------------|
| x frigg is down (last seen 4m ago)   |
|--------------------------------------|
|              (frigg) x               |
|               /     \                |
|        (baldur)x   (thor)x           |
|        /   |   \                     |
|  [tv-dl]x [idx]x [player]x           |
|                                      |
|  6 items affected by frigg  [List]   |
+--------------------------------------+
```
Widgets: topology graph (affected subtree highlighted), status tile.

### 1e Desktop, populated with detail panel

```text
+------------------------------------------------------------------------------------------+
| [<] orca  [ Search everything...                                          ]   mesh: home |
|------+-----------------------------------------------------------------------------------|
| Srch | Topology                          [Graph|List]  [Filter: all v]  [Fit] [+][-]    |
| Dash |---------------------------------------------------------+-------------------------|
| Topo |      (willow)            (maple)                        | player   media player ! |
| Sys  |         \                  /                            | on baldur > frigg       |
| C&VM |          \                /                             |-------------------------|
| Svc  |           (frigg) hypervisor                            | Depends on              |
| Sch  |            /          \                                 |  baldur          ok     |
| File |     (baldur)        (thor)                              |  willow:/data    ok     |
| VPN  |     /   |    \                                          | Linked from             |
| Plug |  [tv-dl][idx][player]!                                  |  tv-dl scan     broken  |
| Jobs |                                                         |                         |
|      |                                                         | [Repair link] [Open]    |
+------+---------------------------------------------------------+-------------------------+
```
Widgets: topology graph, table, form-action buttons. Drawer collapses to icons/short labels on desktop.

### 1f States

```text
Loading                     Empty (single system)         Offline
+------------------------+  +------------------------+    +------------------------+
| Topology               |  | Topology               |    | ! Disconnected. Last   |
|  [....skeleton....]    |  |    (this-machine)      |    |   known state 10:42.   |
|  [....skeleton....]    |  |  Only one system.      |    |   Controls disabled.   |
|                        |  |  [Join a machine]      |    |  (graph, greyed)       |
+------------------------+  +------------------------+    |  [Repair link] (off)   |
                                                          +------------------------+
Error                       Permission-limited
+------------------------+  +------------------------+
| ! Could not load       |  | Topology               |
|   topology. [Retry]    |  |  shows only nodes your |
|                        |  |  grants cover; others  |
+------------------------+  |  collapse to "3 hidden"|
                            +------------------------+
```

Frame sequence: 1a <-> 1b; 1a/1b -> 1c; 1d on any down event; 1e on desktop.
Intents: `system.topology` (read, refreshed by server push); `Repair link` -> remediation intent owned by `ops`; `Join a machine` -> mesh-02.

---

## mesh-02 Join a machine by address

### 2a Phone, form

```text
+--------------------------------------+
| [=] [ Search...                  ]   |
|--------------------------------------|
| < Add a machine                      |
| [Join by address|Offer|Enter code]   |
|--------------------------------------|
| Join this machine to a mesh by       |
| dialing an inviter.                  |
|                                      |
| Inviter address                      |
| [ host:port                      ]   |
| Join token                           |
| [ ********************      ] [eye]  |
|                                      |
|               [ Join ]               |
+--------------------------------------+
```
Widgets: form that runs an action (address, secret token field).

### 2b Phone, dialing (job)

```text
+--------------------------------------+
| < Add a machine                      |
|--------------------------------------|
| Joining via host:port                |
|  [x] Dial inviter                    |
|  [>] Exchange token                  |
|  [ ] Establish mesh identity         |
|  [ ] Sync roster                     |
|                                      |
|  [ Cancel ]  cancelling rolls back   |
|              completed steps         |
+--------------------------------------+
```
Widgets: job progress (steps, cancel with rollback).

### 2c Phone, joined / failure

```text
Joined                                  Failure
+--------------------------------------+ +--------------------------------------+
| v Joined mesh "home"                 | | x Join failed                        |
|   as <machine name>                  | |   Step: Exchange token               |
|                                      | |   Token rejected by inviter.         |
| [Open in topology] [View system]     | |   Completed steps rolled back.       |
+--------------------------------------+ | [Edit and retry]  [View job]         |
                                         +--------------------------------------+
```
Widgets: status tile, form-action buttons.

Desktop: same form centered in the content area with the drawer expanded; no layout change.

Frame sequence: 2a -> 2b -> 2c (joined | failure -> 2a with input preserved).
Intents: `system.join` (addr, token); job cancel.

---

## mesh-03 Offer to a discovered machine

### 3a Phone, discovered list

```text
+--------------------------------------+
| < Add a machine                      |
| [Join by address|Offer|Enter code]   |
|--------------------------------------|
| Discovered on this network           |
|  (scanning...)                       |
|--------------------------------------|
| hemlock     10.x.x.x       [Offer]   |
| mint        10.x.x.x       [Offer]   |
| unknown-3   10.x.x.x       [Offer]   |
|--------------------------------------|
| Not listed? [Join by address]        |
+--------------------------------------+
```
Widgets: table with row actions (live-updating from mDNS discovery).

### 3b Empty

```text
+--------------------------------------+
| Discovered on this network           |
|  No machines found.                  |
|  Machines must run orca and be on    |
|  the same network.                   |
|  [Rescan]  [Join by address]         |
+--------------------------------------+
```

### 3c Offer sent with code

```text
+--------------------------------------+
| < Offer to hemlock                   |
|--------------------------------------|
| Enter this code on hemlock:          |
|                                      |
|          [ K 7 Q 2 M 9 ]             |
|                                      |
| Waiting for hemlock to accept...     |
|                                      |
|            [ Withdraw offer ]        |
+--------------------------------------+
```
Widgets: status tile (pairing code, large), form-action button.

### 3d Accepted

```text
+--------------------------------------+
| v hemlock joined the mesh            |
| [Open in topology]  [View system]    |
+--------------------------------------+
```

Desktop: discovered table on the left, offer/code panel on the right.

```text
+------------------------------------------------------------------------------------------+
| [<] orca  [ Search everything...                                          ]   mesh: home |
|------+-----------------------------------------------------------------------------------|
| ...  | Add a machine   [Join by address | Offer | Enter code]                            |
|      |-----------------------------------------+-----------------------------------------|
|      | Discovered            (scanning...)     | Offer to hemlock                        |
|      | hemlock   10.x.x.x   [Offer] <-         |   Code:  K7Q2M9                         |
|      | mint      10.x.x.x   [Offer]            |   Waiting for hemlock to accept...      |
|      |                                         |   [Withdraw offer]                      |
+------+-----------------------------------------+-----------------------------------------+
```

Frame sequence: 3a (or 3b) -> 3c -> 3d.
Intents: mDNS discovery list (read); `system.join` offer (target); offer withdraw.

---

## mesh-04 Accept an offer

### 4a Phone, code entry

```text
+--------------------------------------+
| < Add a machine                      |
| [Join by address|Offer|Enter code]   |
|--------------------------------------|
| Enter the 6-character code shown on  |
| the machine that sent the offer.     |
|                                      |
|     [ _ ][ _ ][ _ ][ _ ][ _ ][ _ ]   |
|                                      |
|             [ Accept ]               |
+--------------------------------------+
```
Widgets: form that runs an action (code field).

### 4b Invalid code

```text
+--------------------------------------+
|     [ K ][ 7 ][ Q ][ 2 ][ M ][ 8 ]   |
|  x Code not recognized or expired.   |
|             [ Accept ]               |
+--------------------------------------+
```

### 4c Joined

```text
+--------------------------------------+
| v Joined mesh "home"                 |
| [Open in topology]  [View system]    |
+--------------------------------------+
```

Desktop: same form centered; no layout change.

Frame sequence: 4a -> 4b (retry) -> 4c.
Intents: `system.join` accept (code).

---

## mesh-05 Remove a machine

### 5a Phone, impact preview

```text
+--------------------------------------+
| < Remove thor from mesh              |
|--------------------------------------|
| Removing thor affects:               |
|  - 2 services hosted on thor         |
|  - 1 mount passed through thor       |
|  - 3 schedules on thor               |
|  - plugins installed on thor: 2      |
|  [See full list]                     |
|                                      |
| Type "thor" to confirm               |
| [                                ]   |
|                                      |
|  [Cancel]          [Remove thor]     |
+--------------------------------------+
```
Widgets: table (impact list from orca), form that runs an action (typed confirm).

### 5b Step-up re-auth

```text
+--------------------------------------+
| Confirm it's you                     |
|--------------------------------------|
| Removing a machine requires          |
| re-entering your credentials.        |
|                                      |
| Authenticator code                   |
| [ ______ ]                           |
|                                      |
|  [Cancel]              [Confirm]     |
+--------------------------------------+
```
Widgets: step-up prompt (second factor as configured for the user).

### 5c Removing (job) / removed

```text
+--------------------------------------+ +--------------------------------------+
| Removing thor                        | | v thor removed from the mesh         |
|  [x] Revoke mesh identity            | | [Back to topology]                   |
|  [>] Update roster                   | +--------------------------------------+
|  [ ] Clean up references             |
|  [ Cancel ] rolls back completed     |
+--------------------------------------+
```
Widgets: job progress (cancel with rollback), status tile.

### 5d Locked / permission-limited

```text
+--------------------------------------+ +--------------------------------------+
| ! thor is being edited by alex.      | | Remove machine                       |
|   Removal unavailable until the      | |  (control hidden or disabled per     |
|   lock is released.                  | |   widget rule; no mesh grant)        |
+--------------------------------------+ +--------------------------------------+
```

Desktop: impact preview in a modal over the system detail; no other change.

Frame sequence: entry from mesh-06 detail -> 5a -> 5b -> 5c.
Intents: mesh remove impact preview (read); mesh remove (with step-up); job cancel.

---

## mesh-06 Systems list and detail

### 6a Phone, list

```text
+--------------------------------------+
| [=] [ Search systems...          ]   |
|--------------------------------------|
| Systems (5)          [Filter] [+Add] |
|--------------------------------------|
| frigg        hypervisor     ok       |
|  GPU: NVIDIA   cert 81d   cpu 22%    |
|--------------------------------------|
| baldur       lxc            ok       |
|  QuickSync     cert 81d   cpu 40%    |
|--------------------------------------|
| willow       storage        ok       |
|  disks 6       cert 12d!  cpu  5%    |
|--------------------------------------|
| thor         lxc            x down   |
|  last seen 2h ago (last known)       |
+--------------------------------------+
```
Widgets: table with row actions (status, capabilities, cert expiry, load). `+Add` opens mesh-02/03/04.

### 6b Phone, detail

```text
+--------------------------------------+
| [=] [ Search...                  ]   |
|--------------------------------------|
| < frigg                      [...]   |
| hypervisor  ok   connected via frigg |
|--------------------------------------|
| [Overview|Storage|Certs|Metrics|Logs]|
|--------------------------------------|
| CPU  22% [~~~~/\~~]  RAM 61% [~~~~]  |
| Capabilities                         |
|  NVIDIA GPU, 32 cores, 128 GB        |
| Health                               |
|  orca agent      ok                  |
|  guest agent     ok                  |
| Hosts                                |
|  baldur (lxc), thor (lxc)            |
|--------------------------------------|
| [...] Edit settings / Install orca / |
|       Schedules / Remove from mesh   |
+--------------------------------------+
```
Widgets: status tiles, charts (cpu/ram), table (hosted guests), action menu (items limited by grants).

### 6c Storage and Certs tabs

```text
Storage                                 Certs
+--------------------------------------+ +--------------------------------------+
| Own disks                            | | mesh cert     expires in 81d   ok    |
|  nvme0  1 TB   42% used              | | web cert      expires in 12d   !     |
| Mounted network storage              | |                                      |
|  willow:/data  -> /mnt/data   ok     | |                                      |
| Passed through to                    | |                                      |
|  baldur: /mnt/data -> /data          | |                                      |
+--------------------------------------+ +--------------------------------------+
```
Widgets: tables. Metrics tab: charts over the retention window. Logs tab: live log stream.

### 6d Unreachable machine (last known state)

```text
+--------------------------------------+
| < thor                               |
| lxc  x unreachable                   |
| Last known state from 2h ago.        |
| Actions disabled until it returns.   |
|--------------------------------------|
| CPU  -- (last 40%)   RAM -- (55%)    |
| Capabilities: QuickSync              |
| [...] (disabled)                     |
+--------------------------------------+
```

### 6e Desktop, list + detail

```text
+------------------------------------------------------------------------------------------+
| [<] orca  [ Search everything...                                          ]   mesh: home |
|------+-----------------------------------------------------------------------------------|
| ...  | Systems (5)                 [Filter v]  [+ Add machine]                           |
|      |-----------------------------------------------------------------------------------|
|      | Name    Kind        Status  Capabilities      Cert    CPU   RAM                  |
|      | frigg   hypervisor  ok      NVIDIA GPU        81d     22%   61%   [...]          |
|      | baldur  lxc         ok      QuickSync         81d     40%   55%   [...]          |
|      | willow  storage     ok      6 disks           12d !    5%   20%   [...]          |
|      | thor    lxc         x down  QuickSync (last)  --      --    --    (disabled)     |
|      |-----------------------------------------------------------------------------------|
|      | frigg  [Overview | Storage | Certs | Metrics | Logs]                             |
|      |  CPU [~~~/\~~~~~]   RAM [~~~~~~~~]   GPU [~~~~]    Hosts: baldur, thor           |
+------+-----------------------------------------------------------------------------------+
```

States: loading (skeleton rows), error (retry), permission-limited (only systems the user's grants cover; columns/actions hidden per widget rule).

Frame sequence: 6a -> 6b (tabs 6c); unreachable -> 6d.
Intents: systems list, per-system telemetry, storage, cert expiry, metrics and logs reads; action menu links to mesh-05, 07, 08, 09.

---

## mesh-07 Edit system settings

### 7a Phone, form under lock

```text
+--------------------------------------+
| < Edit frigg                         |
| You are editing. Others see          |
| "being edited by you".               |
|--------------------------------------|
| Hostname                             |
| [ frigg                          ]   |
| Settings                             |
|  (fields declared by orca for this   |
|   system)                            |
|  [ ...                           ]   |
|                                      |
|  [Cancel]               [Save]       |
+--------------------------------------+
```
Widgets: form that runs an action (fields declared by orca). Opening the form takes the lock; it times out after inactivity.

### 7b Locked by someone else

```text
+--------------------------------------+
| < frigg                              |
| ! Being edited by alex.              |
|   You can view; editing is           |
|   unavailable until alex finishes.   |
|--------------------------------------|
| Hostname   frigg                     |
| [Edit] (disabled)                    |
+--------------------------------------+
```

### 7c Saved / lock timed out / session expired

```text
+--------------------------------------+ +--------------------------------------+
| v Saved. Lock released.              | | ! Your edit lock timed out.          |
+--------------------------------------+ |   Your input is kept.                |
                                         |   [Re-open for editing]              |
+--------------------------------------+ +--------------------------------------+
| ! Session expired. Sign in again;    |
|   your input is kept.                |
+--------------------------------------+
```

Desktop: form opens as a side panel over the system detail; no other change.

Frame sequence: mesh-06 detail -> 7a (or 7b) -> 7c.
Intents: acquire edit lock; hostname/settings edit; release lock.

---

## mesh-08 Install/uninstall orca on a host

### 8a Phone, target pick

```text
+--------------------------------------+
| < Install orca                       |
|--------------------------------------|
| Target host                          |
| ( ) pick an existing system          |
|     [ select...                v ]   |
| ( ) host by address                  |
|     [ host                       ]   |
|     credentials                      |
|     [ ...                        ]   |
| Channel  [stable v]                  |
|                                      |
|              [ Install ]             |
+--------------------------------------+
```
Widgets: form that runs an action (target, channel; fields declared by orca).

### 8b Progress (job)

```text
+--------------------------------------+
| Installing orca on host-x            |
|  [x] Connect                         |
|  [x] Check prerequisites             |
|  [>] Install package      ######--   |
|  [ ] Start service                   |
|  [ ] Join mesh                       |
|                                      |
|  [ Cancel ]  rolls back completed    |
+--------------------------------------+
```
Widgets: job progress (cancel with rollback), live log stream (expandable).

### 8c Failure

```text
+--------------------------------------+
| x Install failed at "Check prereqs"  |
|   (error text from orca)             |
|   Completed steps rolled back.       |
| [View log]  [Retry]                  |
+--------------------------------------+
```

### 8d Uninstall (from system detail)

```text
+--------------------------------------+
| < Uninstall orca from thor           |
| This removes orca from thor:         |
|  (impact list from orca)             |
|                                      |
|  [Cancel]           [Uninstall]      |
+--------------------------------------+
   -> step-up if the action is marked high-risk (as 5b)
   -> job progress (as 8b)
```

Desktop: form left, live job log right during progress.

Frame sequence: 8a -> 8b -> done | 8c; uninstall: 6b -> 8d -> step-up -> 8b.
Intents: install (target, channel); uninstall (target); job cancel.

---

## mesh-09 Schedules

### 9a Phone, list (per system)

```text
+--------------------------------------+
| [=] [ Search schedules...        ]   |
|--------------------------------------|
| Schedules   [System: all v]  [+New]  |
|--------------------------------------|
| nightly backup     frigg             |
|  daily 02:00   last ok   next 02:00  |
|--------------------------------------|
| library scan       baldur            |
|  every 6h      last !    next 14:00  |
+--------------------------------------+
```
Widgets: table with row actions, filter.

### 9b Create

```text
+--------------------------------------+
| < New schedule                       |
|--------------------------------------|
| System     [ frigg               v ] |
| Work       [ select action...    v ] |
| When       [ daily at 02:00      v ] |
|            (advanced: cron expr)     |
| Preview: next runs                   |
|  Fri 02:00, Sat 02:00, Sun 02:00     |
|                                      |
|  [Cancel]              [Create]      |
+--------------------------------------+
```
Widgets: form that runs an action.

### 9c Detail

```text
+--------------------------------------+
| < nightly backup                     |
| on frigg   daily 02:00               |
|--------------------------------------|
| Recent runs                          |
|  Thu 02:00   ok      3m              |
|  Wed 02:00   ok      3m              |
|  Tue 02:00   failed  [View job]      |
+--------------------------------------+
```
Widgets: status tile, table (run history linking to jobs).

### 9d Empty

```text
+--------------------------------------+
| Schedules                            |
|  No scheduled work on this system.   |
|  [+ New schedule]                    |
+--------------------------------------+
```

Desktop: list with columns (name, system, when, last, next); detail opens in a side panel.

Frame sequence: 9a (or 9d) -> 9b -> 9c; 9a -> 9c.
Intents: schedule list, schedule create, schedule detail.

---

## mesh-10 VPN remote access

### 10a Phone, provider pick

```text
+--------------------------------------+
| [=] [ Search...                  ]   |
|--------------------------------------|
| Remote access                        |
| Remote access is through a VPN.      |
| Pick a provider:                     |
|--------------------------------------|
| [ Tailscale            installed ]   |
| [ OpenVPN              available ]   |
| [ (other VPN plugins)            ]   |
+--------------------------------------+
```
Widgets: table with row actions (VPN-provider generic; entries come from plugins).

### 10b Setup

```text
+--------------------------------------+
| < Set up <provider>                  |
|--------------------------------------|
| (fields declared by the VPN plugin)  |
| [ ...                            ]   |
| Systems to include                   |
|  [x] frigg  [x] baldur  [ ] thor     |
|                                      |
|              [ Set up ]              |
+--------------------------------------+
   -> step-up if marked high-risk
   -> job progress with cancel + rollback
```
Widgets: form that runs an action (plugin-declared fields), job progress.

### 10c Status

```text
+--------------------------------------+
| Remote access     <provider>   ok    |
|--------------------------------------|
| frigg      connected                 |
| baldur     connected                 |
| thor       not enrolled  [Enroll]    |
| Users with VPN access: 4  [View]     |
+--------------------------------------+
```
Widgets: status tile, table with row actions.

Desktop: provider list left, setup/status right.

Frame sequence: 10a -> 10b -> 10c.
Intents: VPN provider list (generic); VPN setup (plugin action); VPN status; enroll system.

---

## mesh-11 File browser

### 11a Phone, tree

```text
+--------------------------------------+
| [=] [ Search files...            ]   |
|--------------------------------------|
| Files     [Shares|Container config]  |
|--------------------------------------|
| willow:/data  >  media  >            |
|--------------------------------------|
| [dir] movies                     >   |
| [dir] tv                         >   |
| [   ] notes.txt   2 KB         [...] |
|--------------------------------------|
|                 [Upload]             |
+--------------------------------------+
```
Widgets: table with row actions (tree navigation, breadcrumb), form-action button.

### 11b File view

```text
+--------------------------------------+
| < notes.txt                    [...] |
| willow:/data/media   2 KB            |
|--------------------------------------|
| (file contents, read-only preview)   |
|                                      |
|--------------------------------------|
| [Download]                           |
+--------------------------------------+
```

### 11c Upload progress

```text
+--------------------------------------+
| Uploading 2 files to .../media       |
|  poster.jpg   ########--  80%        |
|  info.nfo     done                   |
|  [ Cancel ]                          |
+--------------------------------------+
```
Widgets: job progress.

### 11d States

```text
Empty folder                Permission-limited              Offline
+------------------------+  +---------------------------+  +------------------------+
| This folder is empty.  |  | Only shares your grants   |  | ! willow unreachable.  |
| [Upload]               |  | cover are listed; Upload  |  |   Last known listing.  |
+------------------------+  | hidden without write.     |  |   Upload/Download off. |
                            +---------------------------+  +------------------------+
```

Desktop: two panes, folder tree left, listing right, preview as a third pane.

```text
+------------------------------------------------------------------------------------------+
| [<] orca  [ Search everything...                                          ]   mesh: home |
|------+----------------------+------------------------------+-----------------------------|
| ...  | Shares               | willow:/data/media           | notes.txt   2 KB            |
|      |  v willow:/data      |  [dir] movies                |  (preview)                  |
|      |     v media          |  [dir] tv                    |                             |
|      |  > maple:/backups    |  [   ] notes.txt   <-        |  [Download]                 |
|      | Container config     |                              |                             |
|      |  > baldur/player     |  [Upload]  (drop files here) |                             |
+------+----------------------+------------------------------+-----------------------------+
```

Frame sequence: 11a -> 11b -> download; 11a -> 11c.
Intents: file list (share or container config path); file read; download; upload.

---

## Open questions

1. Topology: which node kinds and edge kinds orca returns from `system.topology` (systems, guests, services, mounts, service links, networks), and whether peacock or orca computes "affected by" sets for down-propagation.
2. Topology: is the multi-mesh unified view shown in this screen, and how are nodes from different meshes distinguished?
3. Join/offer/accept: how a joiner obtains a join token (generated where, by which grant, with what expiry), and whether peacock running on machine A can run `join`/`accept` on behalf of a different, not-yet-joined machine B or only for its own host.
4. Offer: pairing-code lifetime, and whether an offer can be withdrawn.
5. Mesh remove: what orca actually does to services, mounts, schedules and plugins on the removed machine, and whether a removed machine's orca keeps running standalone.
6. Mesh remove and uninstall: are they marked high-risk (step-up) by orca/plugin, or is that per deployment?
7. System settings: which settings beyond hostname are editable.
8. Install orca: supported target types and credentials (SSH key, password, Proxmox guest exec), and whether a fresh install auto-joins the mesh.
9. Schedules: the API has create/list/detail only; are update, delete, pause and run-now planned? What kinds of "work" can be scheduled, and does "cron diff/apply" surface in this screen?
10. VPN: the setup fields per provider, whether VPN enrollment is per system or mesh-wide, and how per-user VPN access (from invites) is shown here.
11. File browser: is editing files in place in scope (story-gaps lists file edit), size limits for upload/download, and whether container config folders are grant-scoped per container.
12. Cert expiry: thresholds for warning, and whether renewing a cert is an action on this screen.
13. Systems metrics/logs tabs: whether these are the same widgets as the `data` area metrics/logs flows or links into them.
