# workloads — Containers/VMs, services & storage passthrough

Low-fidelity wireframes for every flow in the `workloads` area of `INDEX.md`. Each flow shows the phone frame first (about 40 columns). A desktop frame (about 90 columns) follows where the layout differs. Every screen is an orca JSON dashboard. Plugins declare widget kinds and the UI decides how to render them. "Grant holder" means whoever holds the grant for the action, and the super grant holds every grant.

Shared chrome on every screen:

- `[=]` opens the drawer menu. On web the drawer is collapsible and on phone it slides over the content.
- `[/ Search or run...]` is the search bar, which is also the command palette.
- `(!)` marks a control the user's grants hide or disable. The widget rule decides whether a missing grant hides the control or disables it.

Intents use the orca operation names. Where no API exists yet, the name is a placeholder and appears in Open questions.

---

## workloads-01 Containers and VMs

### 1a. Unified list (populated), phone

```text
+--------------------------------------+
| [=]  Containers & VMs          (2)!  |
| [/ Search or run...               ]  |
+--------------------------------------+
| Filter: [All v] [System v] [State v] |
+--------------------------------------+
| o sonarr        container   baldur   |
|   running  2d    cpu 3%  mem 210M  > |
| o plex          container   mimir    |
|   running  9h    cpu 41% mem 1.2G  > |
| x jellyfin      container   thor     |
|   exited (137)  4m ago             > |
| o baldur        LXC         frigg    |
|   running  14d                     > |
| - win-test      VM          frigg    |
|   stopped                          > |
+--------------------------------------+
| (swipe row: Start / Stop / Restart)  |
+--------------------------------------+
```

Widgets: table with row actions (kind column = container | LXC | VM), filter form, status tile (count of failing in header).

### 1b. Unified list, desktop

```text
+------------+-----------------------------------------------------------------------------+
| [<] Drawer | [/ Search or run...                                                     ]   |
|  Search    +-----------------------------------------------------------------------------+
|  Dashboards| Containers & VMs                    [All v] [System v] [State v] [Runtime v]|
|  Topology  +-----------------------------------------------------------------------------+
|  Systems   | [ ] Name      Kind       System  Runtime  State          CPU  Mem   Actions |
| >Workloads | [ ] sonarr    container  baldur  docker   running 2d     3%   210M  [...]   |
|  Services  | [ ] plex      container  mimir   docker   running 9h     41%  1.2G  [...]   |
|  Storage   | [ ] jellyfin  container  thor    podman   exited (137)   -    -     [Start] |
|  Jobs      | [ ] baldur    LXC        frigg   proxmox  running 14d    12%  4.1G  [...]   |
|  ...       | [ ] win-test  VM         frigg   proxmox  stopped        -    -     [Start] |
|            +-----------------------------------------------------------------------------+
|            | Selected: 0      [Start] [Stop] [Restart]                                    |
+------------+-----------------------------------------------------------------------------+
```

Widgets: table with row actions and bulk actions, filter form.

### 1c. States, phone

```text
LOADING                       EMPTY
+----------------------------+ +----------------------------+
| [=] Containers & VMs       | | [=] Containers & VMs       |
| [/ Search or run...     ]  | | [/ Search or run...     ]  |
| ░░░░░░░░░░░░░░░░░░░░░░░░░  | |                            |
| ░░░░░░░░░░░░░░░░░░░░░░░░░  | | No containers or VMs on    |
| ░░░░░░░░░░░░░░░░░░░░░░░░░  | | systems you can see.       |
+----------------------------+ | [Create a service]  (!)    |
                               +----------------------------+
ERROR                          OFFLINE / STALE
+----------------------------+ +----------------------------+
| [=] Containers & VMs       | | ! Offline. Last known      |
| Could not load workloads.  | |   state 14:02. Actions     |
| baldur: request timed out  | |   disabled.                |
| [Retry]                    | | o sonarr  running  (14:02) |
+----------------------------+ | o plex    running  (14:02) |
                               | [Start] [Stop] (disabled)  |
                               +----------------------------+
PERMISSION-LIMITED
+----------------------------+
| o sonarr   running       > |
|   (view only: no lifecycle |
|    grant on baldur)        |
| Hidden: 3 items you can't  |
|   see are not listed.      |
+----------------------------+
```

The "Hidden" footer appears only if the widget rule allows disclosing a count. See Open questions.

### 1d. Detail with lifecycle and console, phone

```text
+--------------------------------------+
| [<] sonarr               container   |
+--------------------------------------+
| o running 2d   on baldur (LXC/frigg) |
| image  lscr.io/.../sonarr:4.0        |
| ports  8989                          |
| mounts /data/media/tv, /downloads  > |
+--------------------------------------+
| [Start] [Stop] [Restart]             |
+--------------------------------------+
| CPU  ▁▂▂▃▂▁▂  Mem ▃▃▃▄▃▃▃  (1h v)     |
+--------------------------------------+
| Tabs: [Logs] [Console] [Service]     |
| > 14:01 Import complete: S02E04      |
| > 14:02 RSS sync                     |
+--------------------------------------+
```

Widgets: status tile, action form (lifecycle buttons), chart, live log stream, terminal/VM console (Console tab), link to the service (workloads-02).

### 1e. Lifecycle action running, phone

```text
+--------------------------------------+
| [<] sonarr                           |
| Restarting...  step 1/2 stop         |
| [=========>           ]   [Cancel]   |
+--------------------------------------+
| Restart done. o running 3s           |
+--------------------------------------+
| Restart failed: exited (1)           |
| [View logs] [Retry]                  |
+--------------------------------------+
```

### 1f. Being edited by X, phone

```text
+--------------------------------------+
| [<] baldur                    LXC    |
| (lock) Being changed by alex         |
|        (job: build storage chain)    |
| [Start] [Stop] [Restart] (disabled)  |
| [View job]                           |
+--------------------------------------+
```

### 1g. Console, desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | win-test (VM on frigg)        [Start] [Stop] [Restart]   o running          |
|            +-----------------------------------------------------------------------------+
|            | [Logs] [Console*] [Metrics]                                                  |
|            | +-------------------------------------------------------------------------+ |
|            | |  VM console / terminal                                                  | |
|            | |  C:\> _                                                                 | |
|            | +-------------------------------------------------------------------------+ |
|            | [Send Ctrl-Alt-Del] [Full screen] [Disconnect]                               |
+------------+-----------------------------------------------------------------------------+
```

Widgets: terminal/VM console, action form.

**Frame sequence:** 1a/1b list -> 1c states -> 1d detail -> 1e action progress -> 1g console. 1f applies to any frame under a lock.
**Intents:** `container.list` (plus VM/LXC listing, see OQ), `container.get`, `container.start`, `container.stop`, `container.restart`, log stream subscribe, console open, job status subscribe, job cancel.

---

## workloads-02 Services list and detail

### 2a. List grouped by generic, phone

```text
+--------------------------------------+
| [=]  Services                        |
| [/ Search or run...               ]  |
+--------------------------------------+
| Media players                    (2) |
|  o Plex         mimir     healthy  > |
|  o Jellyfin     thor      healthy  > |
| TV downloaders                   (1) |
|  ! Sonarr       baldur  1 broken   > |
| Movie downloaders                (2) |
|  o Radarr       baldur    healthy  > |
|  o Radarr (4K)  baldur    healthy  > |
| Download clients                 (1) |
|  x qBittorrent  baldur    down     > |
+--------------------------------------+
| [+ Create]  [Adopt]                  |
+--------------------------------------+
```

Widgets: table grouped by generic category, with health status tiles per row. Action form buttons go to workloads-03 and workloads-04.

### 2b. List, desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | [/ Search or run...                                                     ]   |
|            | Services                      [Generic v] [System v] [Health v]  [+ Create] [Adopt]
|            +-----------------------------------------------------------------------------+
|            | Media players                                                                |
|            |   Plex         mimir   o healthy   links 3/3                       [...]     |
|            |   Jellyfin     thor    o healthy   links 2/2                       [...]     |
|            | TV downloaders                                                               |
|            |   Sonarr       baldur  ! degraded  links 3/4  (scan -> Plex broken) [Repair] |
|            | Download clients                                                             |
|            |   qBittorrent  baldur  x down      links 0/2                       [...]     |
+------------+-----------------------------------------------------------------------------+
```

### 2c. Detail with connections, phone

```text
+--------------------------------------+
| [<] Sonarr          TV downloader    |
+--------------------------------------+
| ! degraded   instance: sonarr        |
| runs on  baldur (LXC) via docker   > |
+--------------------------------------+
| Connections                          |
|  o indexer provider  -> Prowlarr     |
|  o download client   -> qBittorrent  |
|  o download client   -> SABnzbd      |
|  x scan target       -> Plex         |
|     "Plex not notified since 3d"     |
|     [Repair]                         |
+--------------------------------------+
| Mounts  /data/media/tv  o            |
|         /downloads      o            |
+--------------------------------------+
| [Actions] [Deploy history] [Delete]  |
+--------------------------------------+
```

Widgets: status tile, table (connections by generic role), action form, mini topology graph (desktop), links to 01/05/06/07/11.

### 2d. Detail, desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Sonarr  (TV downloader)   ! degraded     [Actions v] [History] [Delete]      |
|            +--------------------------------------+--------------------------------------+
|            | Health                               | Connections (graph)                  |
|            |  API      o 120ms                    |   [Prowlarr]                         |
|            |  Disk     o 2.1T free                |       |                              |
|            |  Queue    o 3 items                  |   [Sonarr]--->[qBittorrent]          |
|            +--------------------------------------+       |  x                           |
|            | Workload: sonarr (container, baldur) |       +--x-->[Plex]  [Repair]        |
|            | Mounts:   /data/media/tv, /downloads |                                      |
+------------+--------------------------------------+--------------------------------------+
```

### 2e. States

```text
EMPTY                               OFFLINE / STALE
+----------------------------------+ +----------------------------------+
| [=] Services                     | | ! Offline. Last known 14:02.     |
| No services yet.                 | | TV downloaders                   |
| [+ Create] [Adopt]   (!)         | |  ! Sonarr  degraded (14:02)      |
+----------------------------------+ | [Repair] [Actions] (disabled)    |
                                     +----------------------------------+
PERMISSION-LIMITED                  ERROR
+----------------------------------+ +----------------------------------+
| Sonarr  ! degraded               | | Could not load services.         |
| Connections: view only           | | [Retry]                          |
| [Repair] hidden: no services     | +----------------------------------+
|   grant on baldur                |
+----------------------------------+
```

Loading uses the same skeleton rows as 1c.

**Frame sequence:** 2a/2b -> 2c/2d -> branch to 05 repair, 06 actions, 07 delete, 11 history.
**Intents:** `service.list`, `service.get`, `service.instance.list`, service health read, connection/topology read (`system.topology`), push subscribe for health.

---

## workloads-03 Create a service

### 3a. Step 1: pick generic, then plugin, phone

```text
+--------------------------------------+
| [<] Create service        1 of 5     |
| [/ Filter generics...             ]  |
+--------------------------------------+
| What kind of service?                |
|  ( ) Media player                    |
|  (o) TV downloader                   |
|  ( ) Movie downloader                |
|  ( ) Download client                 |
|  ( ) Indexer provider                |
+--------------------------------------+
| Provided by (installed plugins):     |
|  (o) Sonarr                          |
|  Not installed? [Browse plugins]     |
+--------------------------------------+
|                      [Next]          |
+--------------------------------------+
```

Widgets: action form (radio list from generics, then plugins that provide the chosen generic).

### 3b. Step 2: deployment target with capability badges, phone

```text
+--------------------------------------+
| [<] Create service        2 of 5     |
+--------------------------------------+
| Where should it run?                 |
|  (o) baldur  LXC on frigg            |
|      [docker] [QuickSync]            |
|  ( ) mimir   VM                      |
|      [docker] [NVIDIA GPU]           |
|  ( ) thor    host                    |
|      [podman]                        |
|  -- ingrid   unreachable (14:02) --  |
|      (disabled)                      |
|  -- loki     no runtime this plugin  |
|      supports (disabled)             |
+--------------------------------------+
| [Back]               [Next]          |
+--------------------------------------+
```

Widgets: action form (target list, read-only capability badges reported by each system). Unsupported or unreachable targets are disabled, with the reason shown.

### 3c. Step 3: mount selection, phone

```text
+--------------------------------------+
| [<] Create service        3 of 5     |
+--------------------------------------+
| Mounts this service needs            |
| (plugin suggests by role)            |
|  [x] media/tv     -> /data/media/tv  |
|      from willow:data   o ready      |
|  [x] downloads    -> /downloads      |
|      from willow:downloads           |
|      ! chain missing on baldur       |
|        orca will build it            |
|  [ ] media/movies                    |
|  [+ Add mount]                       |
|  Share missing? [Register/create]    |
+--------------------------------------+
| [Back]               [Next]          |
+--------------------------------------+
```

"Register/create" opens workloads-10 inline and returns here.

```text
PREREQUISITE NOT MET
+--------------------------------------+
| x downloads  willow:downloads        |
|   SMB permissions deny user 'orca'   |
|   [Repair permissions] (workloads-10)|
|   Next is disabled until resolved    |
+--------------------------------------+
```

Widgets: action form (checklist), status tile per mount (ready | chain to build | blocked).

### 3d. Step 4: wiring preview, phone

```text
+--------------------------------------+
| [<] Create service        4 of 5     |
+--------------------------------------+
| orca will connect (by generic role): |
|  [x] register with indexer provider  |
|      -> Prowlarr                     |
|  [x] use download client             |
|      -> qBittorrent                  |
|      -> SABnzbd                      |
|  [x] media players scan media/tv     |
|      -> Plex, Jellyfin               |
+--------------------------------------+
| Storage chain to build:              |
|  willow -> frigg -> baldur -> sonarr |
+--------------------------------------+
| [Back]               [Next]          |
+--------------------------------------+
```

Whether the user can untick individual wiring links is unsettled. See Open questions.

### 3e. Step 5: review and run, desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Create service: review                                            5 of 5    |
|            +--------------------------------------+--------------------------------------+
|            | Service   Sonarr (TV downloader)     | Plan                                 |
|            | Target    baldur (LXC on frigg)      |  1 mount willow:downloads on frigg   |
|            | Runtime   docker                     |  2 pass mount into baldur            |
|            | Mounts    media/tv, downloads        |  3 bind into sonarr container        |
|            | Wiring    3 links                    |  4 deploy sonarr                     |
|            |                                      |  5 register with Prowlarr            |
|            |                                      |  6 add qBittorrent, SABnzbd          |
|            |                                      |  7 set Plex/Jellyfin scan            |
|            +--------------------------------------+--------------------------------------+
|            | [Back]                                                  [Create (runs job)] |
+------------+-----------------------------------------------------------------------------+
```

### 3f. Job progress, cancel and rollback, phone

```text
RUNNING                              CANCEL CONFIRM
+----------------------------------+ +----------------------------------+
| Creating Sonarr          job #81 | | Cancel and roll back?            |
| o 1 mount on frigg               | | Done steps 1-3 will be undone.   |
| o 2 pass into baldur             | | [Keep running] [Cancel+rollback] |
| > 3 bind into container  ....    | +----------------------------------+
|   4 deploy                       |
|   5-7 wiring                     | ROLLING BACK / ROLLED BACK
| [Cancel]                         | +----------------------------------+
+----------------------------------+ | < undo 3 ... < undo 2 o < undo 1 o|
                                     | Rolled back. Nothing left behind.|
FAILED                               +----------------------------------+
+----------------------------------+
| x 4 deploy: image pull failed    |
| Steps 1-3 rolled back.           |
| [View logs] [Retry] [Edit plan]  |
+----------------------------------+

DONE
+----------------------------------+
| Sonarr created. o healthy        |
| [Open service]                   |
+----------------------------------+
```

Widgets: job progress (table of steps with live status), action form (cancel), live log stream (from View logs).

### 3g. Step-up, when the plugin marks the action high-risk

```text
+----------------------------------+
| Confirm it's you                 |
| "Create service" is marked       |
| high-risk by the sonarr plugin.  |
| Password [________]              |
|  or TOTP [______]                |
| [Cancel]            [Confirm]    |
+----------------------------------+
```

The same step-up frame (access-04) applies to every high-risk action in this file. Later flows refer to it as "3g".

**Frame sequence:** 3a -> 3b -> 3c (-> workloads-10 -> 3c) -> 3d -> 3e -> [3g] -> 3f.
**Intents:** generics/plugin list, system capabilities (`system.list` / systems telemetry), `storage.mount.list`, share list, chain plan (dry run), `service.create` + deploy to target (dry run then execute), job status subscribe, job cancel.

---

## workloads-04 Adopt an existing service

### 4a. Discover, phone

```text
+--------------------------------------+
| [<] Adopt a service      1 of 4      |
+--------------------------------------+
| Scanning systems for running         |
| services orca doesn't manage...      |
| [=======>          ]  baldur, thor   |
+--------------------------------------+
| Found                                |
|  ( ) overseerr   baldur  container   |
|      matches: Request manager        |
|  (o) navidrome   thor    container   |
|      matches: Music player           |
|  ( ) unknown:9000  loki  no plugin   |
|      [Find plugin]                   |
+--------------------------------------+
| [Next]                               |
+--------------------------------------+
```

EMPTY: "Nothing unmanaged found on systems you can see. [Scan again]".

### 4b. Plan, phone

```text
+--------------------------------------+
| [<] Adopt navidrome      2 of 4      |
+--------------------------------------+
| orca will:                           |
|  - record container as instance      |
|  - track mounts /music (thor:/mnt/m) |
|  - store its credentials as secrets  |
|  - connect: media players scan music |
| orca will not change:                |
|  - the running container             |
| ! 1 conflict: port 4533 also used by |
|   a managed service on thor          |
+--------------------------------------+
| [Back]           [Apply (job)]       |
+--------------------------------------+
```

### 4c. Apply (job), then 4d Verify, phone

```text
APPLY                                VERIFY
+----------------------------------+ +----------------------------------+
| Adopting navidrome       job #82 | | Verify navidrome                 |
| o record instance                | | o reachable     o health check   |
| > import credentials ...         | | o mounts match  x scan link      |
| [Cancel]  (rolls back records)   | | Adopted with 1 issue.            |
+----------------------------------+ | [Repair link] [Open service]     |
                                     +----------------------------------+
```

### 4e. Desktop: discover and plan side by side

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Adopt a service                                                              |
|            +--------------------------------------+--------------------------------------+
|            | Found (3)                 [Rescan]   | Plan for navidrome                   |
|            |  overseerr  baldur  Request manager  |  record instance                     |
|            | >navidrome  thor    Music player     |  track mount /music                  |
|            |  :9000      loki    no plugin        |  import credentials -> secrets       |
|            |                                      |  connect media-player scan           |
|            |                                      |  ! port 4533 conflict                |
|            |                                      |                    [Apply (job)]     |
+------------+--------------------------------------+--------------------------------------+
```

Widgets: job progress (scan), table with row select, action form, status tiles (verify).
States: offline disables Rescan and Apply. Permission-limited lists only systems the user holds the grant for. Lock shows "being adopted by X" on the candidate. Step-up uses 3g if marked.

**Frame sequence:** 4a -> 4b -> [3g] -> 4c -> 4d (-> workloads-05).
**Intents:** adopt discover, adopt plan, adopt apply, adopt verify (none of these exist yet, see OQ), job status subscribe, job cancel.

---

## workloads-05 Repair a broken service link

### 5a. Broken link in topology, phone (list view)

```text
+--------------------------------------+
| [=]  Topology     [Graph | List*]    |
| [/ Search or run...               ]  |
+--------------------------------------+
| ! 1 broken link                      |
|  Sonarr --scan--> Plex          x    |
|   Plex has not been notified of      |
|   imports since 3d                   |
|   [Repair]                           |
+--------------------------------------+
| Sonarr --download--> qBittorrent  o  |
| Sonarr --indexer-->  Prowlarr     o  |
+--------------------------------------+
```

### 5b. Graph, desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Topology                                              [Graph*] [List]        |
|            |                                                                             |
|            |   [willow]                                                                  |
|            |      |                                                                      |
|            |   [frigg]--[baldur]--[Sonarr]==x==>[Plex @ mimir]                           |
|            |                         |                                                   |
|            |                      [qBittorrent]                                          |
|            |                                                                             |
|            |  Selected link: Sonarr -> Plex (scan target)   x broken 3d     [Repair]     |
+------------+-----------------------------------------------------------------------------+
```

Widgets: topology graph (with accessible list view), status tile.

### 5c. Repair proposal, phone

```text
+--------------------------------------+
| [<] Repair Sonarr -> Plex            |
+--------------------------------------+
| Cause: Plex token in Sonarr expired  |
| orca proposes:                       |
|  1 rotate Plex token for Sonarr      |
|  2 update Sonarr connection          |
|  3 test notify                       |
+--------------------------------------+
| [Not now]          [Repair (job)]    |
+--------------------------------------+
```

If remediation policy requires approval, the button reads "[Request approval]" and the flow continues in ops-05.

### 5d. Job, then result, phone

```text
+--------------------------------------+   +--------------------------------------+
| Repairing link           job #83     |   | o Link repaired. Test notify OK.     |
| o 1 rotate token                     |   +--------------------------------------+
| > 2 update connection ...            |   | x Repair failed at 3: Plex 401       |
| [Cancel] (rolls back token)          |   |   Rolled back. [Retry] [Logs]        |
+--------------------------------------+   +--------------------------------------+
```

States: offline shows the link with its last-known status and disables Repair. Lock shows "Plex being changed by X" and disables Repair. Permission-limited keeps the link visible and hides Repair if the user lacks the services grant on either end. Step-up uses 3g.

**Frame sequence:** 5a/5b -> 5c -> [3g] -> 5d.
**Intents:** `system.topology`, repair proposal (remediation), remediation run or approval request, job status subscribe, job cancel.

---

## workloads-06 Run service actions

### 6a. Action list for an instance, phone

```text
+--------------------------------------+
| [<] Radarr (4K)  instance radarr4k   |
+--------------------------------------+
| Actions (declared by plugin)         |
|  Rescan library                    > |
|  Search missing                    > |
|  Refresh metadata                  > |
|  Clear queue           high-risk   > |
|  Rebuild DB (!) needs instance grant |
+--------------------------------------+
```

### 6b. Action form, phone

```text
+--------------------------------------+
| [<] Search missing                   |
| on: Radarr (4K)  (this instance only)|
+--------------------------------------+
| Scope      [Monitored only v]        |
| Limit      [ 50 ]                    |
| Dry run    [x]                       |
+--------------------------------------+
| [Cancel]                 [Run]       |
+--------------------------------------+
```

### 6c. Result, phone

```text
QUICK RESULT                         LONG RUNNING (job)
+----------------------------------+ +----------------------------------+
| o Search missing done            | | Rebuild DB              job #84  |
|   12 searches queued             | | [=====>        ]  [Cancel]       |
| [Run again] [Done]               | +----------------------------------+
+----------------------------------+
ERROR                               DRY RUN RESULT
+----------------------------------+ +----------------------------------+
| x Failed: API 503                | | Would queue 12 searches.         |
| [Retry] [Logs]                   | | [Run for real]                   |
+----------------------------------+ +----------------------------------+
```

### 6d. Desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Radarr (4K) > Actions                                                       |
|            +-------------------------+---------------------------------------------------+
|            | Rescan library          | Search missing                                    |
|            |>Search missing          |  Scope   [Monitored only v]                       |
|            | Refresh metadata        |  Limit   [50]                                     |
|            | Clear queue  high-risk  |  Dry run [x]                       [Run]          |
|            | Rebuild DB   (!)        |  Result: 12 searches queued                       |
+------------+-------------------------+---------------------------------------------------+
```

Widgets: table (action list), action form (generated from the plugin's action schema), job progress, status tile.
States: offline lists the actions with every one disabled. Lock shows "instance being changed by X". High-risk actions use 3g. Permission-limited hides or disables actions per the widget rule.

**Frame sequence:** 6a -> 6b -> [3g] -> 6c.
**Intents:** `service.instance.get` (declared actions), action run (no endpoint exists yet, see OQ), job status subscribe, job cancel.

---

## workloads-07 Delete a service

### 7a. Data-choice dialog, phone

```text
+--------------------------------------+
| Delete Sonarr?                       |
+--------------------------------------+
| What happens to its data?            |
| Config   (o) Keep  ( ) Delete        |
| Database (o) Keep  ( ) Delete        |
| Managed media (/data/media/tv)       |
|          (o) Keep  ( ) Delete        |
+--------------------------------------+
| Backup first?                        |
|  [ ] Take a backup before deleting   |
|      destination [nas-backups v]     |
+--------------------------------------+
| Also affected:                       |
|  - Plex, Jellyfin stop scanning tv   |
|  - Prowlarr link removed             |
+--------------------------------------+
| [Cancel]            [Continue]       |
+--------------------------------------+
```

There are no defaults beyond Keep, and the backup box is unchecked.

### 7b. Confirm, phone

```text
+--------------------------------------+
| Confirm delete                       |
| Delete: Sonarr, its DB               |
| Keep:   config, managed media        |
| Backup: none                         |
| Type the service name: [________]    |
| [Back]              [Delete (job)]   |
+--------------------------------------+
```

Step-up (3g) follows if the plugin marks delete high-risk.

### 7c. Job, phone

```text
+--------------------------------------+
| Deleting Sonarr          job #85     |
| o backup (skipped)                   |
| o unwire links                       |
| > stop + remove container ...        |
|   delete DB                          |
| [Cancel] (restores completed steps)  |
+--------------------------------------+
| o Sonarr deleted. Config kept at     |
|   baldur:/opt/orca/sonarr            |
+--------------------------------------+
```

Desktop: same dialog as a centered modal over the service detail (2d). The layout does not otherwise differ.
States: offline disables Delete. Lock shows "being edited by X" with Delete disabled. Permission-limited hides Delete. Failure shows the failed step plus a rollback summary, as in 3f.

**Frame sequence:** 2c -> 7a -> 7b -> [3g] -> 7c.
**Intents:** delete impact preview (dry run), optional `backup` run, `service.delete` with data choices, job status subscribe, job cancel.

---

## workloads-08 Mounts

### 8a. Per-system mount list, phone

```text
+--------------------------------------+
| [=]  Mounts          [System: frigg v]|
| [/ Search or run...               ]  |
+--------------------------------------+
| o /mnt/data       willow:data   SMB  |
|   2.1T free  used by baldur        > |
| x /mnt/downloads  willow:dl     SMB  |
|   stale handle 12m ago             > |
|   [Remount] [Edit]                   |
| o /mnt/backup     maple:backup  NFS  |
+--------------------------------------+
| [+ New mount]                        |
+--------------------------------------+
```

### 8b. Desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Mounts                                           [System: frigg v] [+ New]  |
|            +-----------------------------------------------------------------------------+
|            | Path            Source         Type  Health          Free   Used by   Act.  |
|            | /mnt/data       willow:data    SMB   o healthy       2.1T   baldur    [...]  |
|            | /mnt/downloads  willow:dl      SMB   x stale 12m     -      baldur    [...]  |
|            | /mnt/backup     maple:backup   NFS   o healthy       8.0T   -         [...]  |
+------------+-----------------------------------------------------------------------------+
```

### 8c. Editor, phone

```text
+--------------------------------------+
| [<] Edit /mnt/downloads   (lock: you)|
+--------------------------------------+
| Source share [willow:downloads v]    |
| Mount path   [/mnt/downloads    ]    |
| Type         (o) SMB ( ) NFS         |
| Credential   [secret: willow-smb v]  |
| Options      [vers=3.0,uid=1000 ]    |
+--------------------------------------+
| ! Used by baldur -> sonarr, radarr.  |
|   They will be remounted.            |
+--------------------------------------+
| [Delete]  [Cancel]  [Save (job)]     |
+--------------------------------------+
```

```text
LOCKED BY OTHER                      DELETE IN USE
+----------------------------------+ +----------------------------------+
| (lock) Being edited by alex      | | Delete /mnt/downloads?           |
| Fields read-only.                | | In use by 2 services through     |
| [View only]                      | | baldur. They lose /downloads.    |
+----------------------------------+ | [Cancel] [Delete (job)]          |
                                     +----------------------------------+
```

Widgets: table with row actions, status tile (health), action form (editor), job progress.
States: an empty list shows "No mounts on frigg. [+ New mount]". Offline shows the last-known mounts with editing disabled. Permission-limited makes the list read-only and hides New, Edit and Delete. Step-up uses 3g for delete if marked.

**Frame sequence:** 8a/8b -> 8c -> [3g] -> job (3f pattern).
**Intents:** `storage.mount.list`, mount health read, `storage.mount.create`, `storage.mount.update`, `storage.mount.delete`, remount, lock acquire/release.

---

## workloads-09 Storage passthrough chain

### 9a. Chain view, phone

```text
+--------------------------------------+
| [<] Storage chain: downloads         |
+--------------------------------------+
| willow  (storage)  share downloads o |
|   |  SMB                             |
| frigg   (Proxmox)  /mnt/downloads  o |
|   |  bind mount                      |
| baldur  (LXC)      /downloads      x |
|   |  missing                         |
| sonarr  (docker)   /downloads      - |
| radarr  (docker)   /downloads      - |
+--------------------------------------+
| ! 1 missing layer                    |
| [Build chain (job)]                  |
+--------------------------------------+
```

### 9b. Desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Storage chain: downloads                                   [Build chain]    |
|            |                                                                             |
|            |  [willow share]--SMB-->[frigg /mnt/downloads]--bind-->[baldur /downloads] x |
|            |         o                       o                         |                 |
|            |                                                   +-------+-------+         |
|            |                                                [sonarr]        [radarr]    |
|            |                                                                             |
|            |  Layer detail: baldur /downloads  missing bind mount mp2 -> /downloads      |
+------------+-----------------------------------------------------------------------------+
```

Widgets: topology graph (chain, with list view), status tiles per layer, action form.

### 9c. Missing prerequisite, phone

```text
+--------------------------------------+
| Can't build chain                    |
| x willow share 'downloads': user     |
|   'orca' lacks write                 |
|   [Repair permissions] (workloads-10)|
| x frigg: path /mnt/downloads absent  |
|   [Create mount] (workloads-08)      |
| Build is disabled until resolved.    |
+--------------------------------------+
```

### 9d. Build job, phone

```text
+--------------------------------------+
| Building chain           job #86     |
| o frigg mount present                |
| > bind into baldur (restart LXC) ... |
|   bind into sonarr, radarr           |
| [Cancel] (removes added layers)      |
+--------------------------------------+
```

States: offline shows the last-known layer status with Build disabled. Lock shows "baldur being changed by X". Permission-limited keeps the chain visible and hides Build if any layer is outside the user's grants. Step-up uses 3g if marked (LXC restart).

**Frame sequence:** 9a/9b -> (9c -> 08/10 -> 9a) -> [3g] -> 9d.
**Intents:** chain read (topology + mounts), chain plan (dry run), chain build, job status subscribe, job cancel.

---

## workloads-10 Register or create a share

### 10a. Share list on a storage system, phone

```text
+--------------------------------------+
| [=]  Shares         [System: willow v]|
+--------------------------------------+
| o data        SMB   registered       |
|   perms o                          > |
| ! downloads   SMB   registered       |
|   perms: orca lacks write          > |
|   [Repair permissions]               |
+--------------------------------------+
| [Register existing] [Create new]     |
+--------------------------------------+
```

### 10b. Form, phone

```text
REGISTER EXISTING                    CREATE NEW
+----------------------------------+ +----------------------------------+
| System [willow v]                | | System [willow v]                |
| Share  [backup  v] (discovered)  | | Name   [comics        ]          |
| Cred   [secret: willow-smb v]    | | Path   [/mnt/user/comics]        |
| [Check permissions]              | | Access users [orca, scott]       |
| [Register]                       | | [Create (job)]                   |
+----------------------------------+ +----------------------------------+
```

### 10c. Permission check and repair, phone

```text
+--------------------------------------+
| Permission check: downloads          |
| o orca can read                      |
| x orca can write                     |
| o path matches /mnt/user/downloads   |
+--------------------------------------+
| Repair will:                         |
|  - grant 'orca' write on downloads   |
| [Cancel]        [Repair (job)]       |
+--------------------------------------+
| o Repaired. Share usable mesh-wide.  |
|   [Back to create service] (if from  |
|    workloads-03)                     |
+--------------------------------------+
```

Desktop: the list on the left and the form or check panel on the right, as in 4e.
Widgets: table with row actions, action form, status tiles (check results), job progress.
States: an empty list shows "No shares on willow. [Register existing] [Create new]". Offline (storage system unreachable) shows the last-known shares with every action disabled. Lock shows "share being changed by X". Permission-limited makes the list read-only. Step-up uses 3g if marked.

**Frame sequence:** 10a -> 10b -> 10c -> (return to 03 or 09).
**Intents:** shares list, share discover, share register, share create, permission check, `repair-permissions`, job status subscribe.

---

## workloads-11 Deploy history

### 11a. Timeline, phone

```text
+--------------------------------------+
| [<] Sonarr > Deploy history          |
| Filter: [All v]                      |
+--------------------------------------+
| o 11-26 14:00  4.0.10  alex          |
|   deploy  baldur  ok             >   |
| x 11-20 09:12  4.0.9   auto-update   |
|   deploy  baldur  failed, rolled  >  |
|   back                               |
| o 11-02 18:30  4.0.8   scott         |
|   create  baldur  ok             >   |
+--------------------------------------+
```

### 11b. Detail, phone

```text
+--------------------------------------+
| [<] Deploy 11-20 09:12               |
+--------------------------------------+
| By       auto-update policy          |
| Target   baldur (docker)             |
| Change   image 4.0.8 -> 4.0.9        |
| Result   x failed at health check    |
|          rolled back to 4.0.8        |
| Job      #61  [View steps] [Logs]    |
+--------------------------------------+
```

### 11c. Desktop

```text
+------------+-----------------------------------------------------------------------------+
| Drawer     | Sonarr > Deploy history                                                     |
|            +--------------------------------------+--------------------------------------+
|            | When          Ver     By      Result | Deploy 11-20 09:12                   |
|            | 11-26 14:00   4.0.10  alex    o ok   |  image 4.0.8 -> 4.0.9                |
|            |>11-20 09:12   4.0.9   auto    x rb   |  failed at health check              |
|            | 11-02 18:30   4.0.8   scott   o ok   |  rolled back. job #61 [Steps] [Logs] |
+------------+--------------------------------------+--------------------------------------+
```

Widgets: table (timeline), status tiles, links to the job detail (ops-08) and logs.
States: empty shows "No deploys recorded". Loading, error and offline behave as in 1c, and the history is read-only, so offline has nothing to disable. Permission-limited hides entries for targets outside the user's grants.

**Frame sequence:** 2c -> 11a/11c -> 11b -> ops-08.
**Intents:** deploy history list, deploy history get, job get.

---

## Open questions

1. VM and LXC listing and lifecycle: the spec has only container endpoints. Stack, LXC and VM endpoints and `container.delete` are absent.
2. Widget rule for hidden items: should a permission-limited list disclose a count of hidden items, or show nothing?
3. Console widget: transport, and which runtimes support a terminal versus a VM console.
4. Create service wiring: can the user untick individual wiring links in the preview, or is the wiring all-or-nothing?
5. Create service when the needed plugin is not installed: install inline, or leave the flow for plugins-03?
6. Adopt endpoints (discover, plan, apply, verify) do not exist, and handling of a discovered service with no matching plugin is undefined.
7. Action run surface: no endpoint runs a service instance action. It is also unclear whether actions declare a dry-run capability and a long-running/job flag.
8. Delete: whether to require typing the service name, and whether cancelling a delete job can restore a deleted DB.
9. Delete wiring impact: do the other services' links get removed automatically, or flagged as broken?
10. Repair: is a repair gated by remediation policy (auto, approve, notify) the same way as remediation fixes?
11. Passthrough chain API: no chain plan or build operation exists. Chain steps that restart an LXC may need their own warning or step-up.
12. Shares: which storage systems (Unraid and others) support create versus register-only, and where the share credentials live.
13. Storage-server failover (willow/maple): no API exists, and it is unclear whether chains or mounts expose a switch-source control.
14. Mount health: which conditions count as unhealthy (stale handle, unreachable, read-only), and whether a remount action exists.
15. Deploy history: no defined source records automatic (policy-driven) deploys versus user deploys, and retention is undefined.
16. Grant names for workload, services, instance, and storage actions are undefined (INDEX OQ 1).
17. Rollback on cancel: what each job type here (create, adopt, delete, chain build, share create) records so it can roll back (INDEX OQ 11).
18. Locks: the lock granularity (service, instance, system, mount) and the lock timeout (INDEX OQ 12).
