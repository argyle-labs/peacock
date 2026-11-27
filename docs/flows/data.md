# data — Backups, migration, secrets, config/git sync, metrics/logs, audit

Low-fidelity wireframes for every flow in the `data` area of [INDEX.md](INDEX.md). Phone frame first (about 40 columns), then desktop (about 90 columns) where the layout differs. Every screen is an orca JSON dashboard; widget kinds named under each frame are what orca declares, and each UI decides how to render them.

Legend:

- `[=]` opens the drawer menu; `[ Search... ]` is the search bar that acts as the command palette.
- `( )` button, `[x]` checkbox, `(o)` radio, `<v>` select, `###` progress.
- `~~( )~~` a disabled control.
- Shared states from INDEX.md (loading, empty, error, 403, 401, offline, lock, step-up) are drawn where the flow adds something specific to them.

Shared frames used by several flows:

```text
+--------------------------------------+   OFFLINE (any screen)
| [=]  [ Search...               ]     |
|--------------------------------------|
| ! Disconnected. Showing last known   |
|   state from 14:02. Controls are     |
|   disabled until the connection      |
|   returns.                           |
|--------------------------------------|
|  ...last known content, greyed...    |
|  ~~( Run now )~~  ~~( Edit )~~       |
+--------------------------------------+
```
Widgets: banner (status), the screen's own widgets in read-only mode.

```text
+--------------------------------------+   STEP-UP (plugin marks action high-risk)
|  Confirm it's you                    |
|  "Restore baldur" is a high-risk     |
|  action.                             |
|                                      |
|  Password  [****************]        |
|  or 2FA    [ 6-digit code    ]       |
|                                      |
|  ( Cancel )          ( Confirm )     |
|  ! Code incorrect. 2 tries left.     |
+--------------------------------------+
```
Widgets: form (step-up). The second-factor field shows the factors the user has enrolled.

```text
+--------------------------------------+   LOCKED
|  ! Being edited by Alex (since       |
|    14:05). You can view; changes     |
|    open when the lock is released    |
|    or times out.                     |
|  ~~( Edit )~~                        |
+--------------------------------------+
```
Widgets: banner (lock).

```text
+--------------------------------------+   JOB (long-running action)
|  Job: Backup radarr       Running    |
|  [x] Snapshot config          0:04   |
|  [x] Dump database            0:31   |
|  [>] Upload to destination    ###--  |
|  [ ] Checksum verify                 |
|                                      |
|  ( Cancel and roll back )            |
|--------------------------------------|
|  Cancelled: rolling back 2 steps...  |
|  Rolled back. Prior state restored.  |
+--------------------------------------+
```
Widgets: job progress (step list), form (cancel action).

---

## data-01 Backup coverage

```text
+--------------------------------------+   POPULATED
| [=]  [ Search...               ]     |
|--------------------------------------|
| Backups > Coverage                   |
| +----------+ +----------+ +-------+  |
| | 41       | | 6        | | 2     |  |
| | covered  | | not      | | stale |  |
| |          | | backed up| |       |  |
| +----------+ +----------+ +-------+  |
| Filter <All v>  <Any system v>       |
|--------------------------------------|
| ! radarr4k   service  no backup  >   |
| ! loki       machine  no backup  >   |
| ~ sonarr     service  last 9d    >   |
|   plex       service  2h ago  ok >   |
|   frigg      machine  1d ago  ok >   |
|   ...                                |
+--------------------------------------+
```
Widgets: status tiles (covered / not backed up / stale), table with row actions (filter by kind and system; gaps sorted first).

```text
+--------------------------------------+   ROW DETAIL
| < Coverage                           |
| radarr4k  (service on baldur)        |
| Not backed up                        |
|                                      |
| Data: config, database               |
| ( Add to a schedule )  -> data-02    |
| ( Back up now )        -> data-03    |
+--------------------------------------+
```
Widgets: status tile, form (actions). Actions hidden when the user lacks the backup grant for this resource.

```text
+--------------------------------------+   EMPTY / LOADING / ERROR
| Coverage                             |
| No backup destinations or schedules  |
| yet. Nothing is backed up.           |
| ( Add a destination )                |
|--------------------------------------|
| ░░░░░░░░ ░░░░  (loading skeleton)    |
|--------------------------------------|
| ! Could not load coverage from frigg.|
|   Other systems shown. ( Retry )     |
+--------------------------------------+
```

```text
+------------------------------------------------------------------------------------------+   DESKTOP
| [<]  [ Search...                                                        ]   (account)    |
|------+-----------------------------------------------------------------------------------|
| Home | Backups > Coverage                                                                |
| Back | [ 41 covered ] [ 6 not backed up ] [ 2 stale ]      <All kinds v> <Any system v>  |
| ups  |-----------------------------------------------------------------------------------|
| Data | Resource   Kind     System   Last backup  Verified  Schedule     Actions           |
| ...  | radarr4k   service  baldur   never        -         -            (Schedule)(Run)   |
|      | loki       machine  -        never        -         -            (Schedule)(Run)   |
|      | sonarr     service  baldur   9d ago       ok        nightly      (Run)             |
|      | plex       service  mimir    2h ago       ok        hourly       (Run)             |
+------+-----------------------------------------------------------------------------------+
```
Widgets: same as phone; table shows more columns.

Permission-limited: a user whose backup grant covers only baldur sees baldur resources only; tiles count only what they can see.

Frame sequence: Coverage (loading -> populated | empty | error) -> Row detail -> data-02 or data-03.
Intents: `backup.coverage.list` (filters), `backup.coverage.show` (resource id).

---

## data-02 Backup schedules and destinations

```text
+--------------------------------------+   LIST
| [=]  [ Search...               ]     |
|--------------------------------------|
| Backups > Schedules | Destinations   |
|--------------------------------------|
| nightly     02:00 daily   14 items > |
| hourly      every 1h       3 items > |
| ( + New schedule )                   |
+--------------------------------------+
```
Widgets: tabs, table with row actions.

```text
+--------------------------------------+   SCHEDULE EDITOR
| < Schedules         Edit "nightly"   |
| Name      [ nightly            ]     |
| Runs      <Daily v>  at [02:00]      |
| Keep      [ 14 ] snapshots           |
| Destination <maple-backups v>        |
| Verify after run  [x]                |
| Items                                |
|  [x] plex   [x] sonarr  [ ] radarr4k |
|  ( + Add items )                     |
| Notify on success [ ]  (off default) |
|                                      |
| ( Cancel )               ( Save )    |
| ! Destination unreachable; save      |
|   anyway or pick another.            |
+--------------------------------------+
```
Widgets: form (schedule). Opening the editor takes the lock; others see the LOCKED frame.

```text
+--------------------------------------+   DESTINATIONS
| Backups > Schedules | Destinations   |
| maple-backups  SMB    ok   2.1 TB  > |
| offsite-s3     S3     ok   ...     > |
| ( + New destination )                |
|--------------------------------------|
| New destination                      |
| Type <S3-compatible v>               |
|  (types come from installed plugins) |
| Endpoint [                    ]      |
| Bucket   [                    ]      |
| Credentials <secret: pick v> ->data-06|
| ( Test )                 ( Save )    |
| Test: ok, write+read 1 MB            |
+--------------------------------------+
```
Widgets: table with row actions, form (destination; fields declared by the destination plugin), status tile (test result).

```text
+------------------------------------------------------------------------------------------+   DESKTOP
| [<]  [ Search...                                                        ]                |
|------+---------------------------+-------------------------------------------------------|
| ...  | Schedules                 | Edit "nightly"                                        |
|      | > nightly   02:00  14     | Name [nightly]   Runs <Daily v> at [02:00]  Keep [14] |
|      |   hourly    1h      3     | Destination <maple-backups v>   Verify after run [x]  |
|      | (+ New)                   | Items: plex, sonarr, ... (+ Add)                      |
|      | Destinations              |                                     (Cancel) (Save)   |
+------+---------------------------+-------------------------------------------------------+
```
Widgets: list-detail layout of the same table and form.

Frame sequence: List -> Schedule editor (lock) -> Save | Destinations -> New destination -> Test -> Save.
Intents: `backup.schedule.list|create|update|delete`, `backup.destination.list|create|update|test|delete`, lock acquire/release on the edited item.

---

## data-03 Run and verify a backup

```text
+--------------------------------------+   RUN
| < Coverage                           |
| Back up plex now                     |
| Destination <maple-backups v>        |
| Verify checksum after [x]            |
| ( Cancel )             ( Run now )   |
+--------------------------------------+
```
Widgets: form (run). Then the shared JOB frame.

```text
+--------------------------------------+   VERIFY RESULT
| plex  snapshot 2026-11-26 14:10      |
| Checksum verify:  ok                 |
| 1,204 files  18.2 GB  matched        |
| ( Verify again )                     |
|--------------------------------------|
| ! Verify FAILED                      |
|   3 files do not match checksum:     |
|   db/library.db  config/prefs.xml .. |
|   ( Run backup again ) ( View log )  |
+--------------------------------------+
```
Widgets: status tile (verify result), table (mismatched files), form (actions). Failure also raises a notification.

```text
+--------------------------------------+   SNAPSHOT LIST
| plex > Snapshots                     |
| 11-26 14:10  18.2 GB  verified ok  > |
| 11-26 13:00  18.1 GB  verified ok  > |
| 11-25 13:00  18.1 GB  ! failed     > |
+--------------------------------------+
```
Widgets: table with row actions (verify, restore -> data-04).

Frame sequence: Run -> JOB (cancel -> rollback) -> Verify result (ok | failed) -> Snapshot list.
Intents: `backup.run` (resource, destination, verify), `backup.check` (snapshot id), `job.cancel`, `backup.snapshot.list`.

---

## data-04 Restore

```text
+--------------------------------------+   1 SCOPE
| [=]  [ Search...               ]     |
| Restore                              |
| What are you restoring?              |
| (o) A whole service                  |
| ( ) A single file                    |
| ( ) A whole machine                  |
| Target <plex v>                      |
|                        ( Next )      |
+--------------------------------------+
```

```text
+--------------------------------------+   2 SNAPSHOT
| < Scope        Restore plex          |
| (o) 11-26 14:10  verified ok         |
| ( ) 11-26 13:00  verified ok         |
| ( ) 11-25 13:00  ! verify failed     |
|     (picking this shows a warning)   |
|                        ( Next )      |
+--------------------------------------+
```

```text
+--------------------------------------+   2b FILE PICK (single file)
| Snapshot 11-26 14:10 > config/       |
|  [ ] prefs.xml       12 KB           |
|  [ ] Plug-in Support/  >             |
| Restore to (o) original path         |
|            ( ) [ alternate path  ]   |
+--------------------------------------+
```
Widgets: file browser (snapshot contents).

```text
+--------------------------------------+   3 PREVIEW
| Restore plex from 11-26 14:10        |
| Will:                                |
|  - stop plex on mimir                |
|  - replace config and database       |
|  - start plex                        |
| Current data is overwritten.         |
| [x] Back up current state first      |
|                                      |
| ( Back )             ( Restore )     |
+--------------------------------------+
```
Widgets: form (wizard steps), list (plan from orca). Restore -> STEP-UP (when the plugin marks it high-risk) -> JOB.

```text
+------------------------------------------------------------------------------------------+   DESKTOP
| ...  | Restore            1 Scope  >  2 Snapshot  >  [3 Preview]  >  4 Run               |
|      |-----------------------------------------------------------------------------------|
|      | Restore plex from 11-26 14:10            | Plan                                   |
|      | Scope: whole service                     |  - stop plex on mimir                  |
|      | [x] Back up current state first          |  - replace config and database         |
|      |                         (Back) (Restore) |  - start plex                          |
+------+-----------------------------------------------------------------------------------+
```

Error states: no snapshots ("Nothing to restore for plex"); target system offline (Restore disabled, offline banner); job failure shows the failed step with rollback status.

Frame sequence: Scope -> Snapshot (-> File pick) -> Preview -> Step-up -> JOB -> Done.
Intents: `backup.snapshot.list`, `backup.snapshot.browse`, `backup.restore.plan`, `backup.restore` (scope, snapshot, paths, pre-backup), `job.cancel`.

---

## data-05 Migrate

```text
+--------------------------------------+   1 SOURCE
| [=]  [ Search...               ]     |
| Migrate                              |
| What are you moving?                 |
| <sonarr (Docker on baldur) v>        |
|                        ( Next )      |
+--------------------------------------+
```

```text
+--------------------------------------+   2 TARGET
| < Source       Migrate sonarr        |
| Runtime                              |
| (o) Podman                           |
| ( ) LXC                              |
| ( ) VM                               |
| ~( ) Apple containers~  not supported|
|      by this plugin's deployment     |
| ( ) Docker (another system)          |
| Target system <freyr v>              |
|  freyr: Intel QuickSync, 64 GB free  |
|                        ( Next )      |
+--------------------------------------+
```
Widgets: form; unsupported runtimes disabled with the reason, as reported by the plugin. System capabilities shown from each system's report.

```text
+--------------------------------------+   3 PREVIEW
| Move sonarr: Docker@baldur ->        |
|              Podman@freyr            |
|  - back up sonarr                    |
|  - restore onto freyr (Podman)       |
|  - rebuild mounts: data/media/tv,    |
|    downloads                         |
|  - rewire connections                |
|  - stop old instance                 |
| ( Back )             ( Migrate )     |
+--------------------------------------+
```
Then STEP-UP if high-risk -> JOB (cancel rolls back to the original running on baldur).

Empty: "No target runtime supports this service" with all runtimes disabled.

Frame sequence: Source -> Target -> Preview -> Step-up -> JOB -> Done.
Intents: `migrate.targets` (source), `migrate.plan`, `migrate.run`, `job.cancel`.

---

## data-06 Secrets

```text
+--------------------------------------+   LIST (values hidden)
| [=]  [ Search...               ]     |
| Secrets                 ( + New )    |
| Filter [            ] <Any scope v>  |
|--------------------------------------|
| s3-offsite-key   mesh     rot 30d  > |
| plex-token       mimir    rot 2d   > |
| smb-media        willow   rot 90d  > |
+--------------------------------------+
```
Widgets: table with row actions. No value column ever.

```text
+--------------------------------------+   DETAIL
| < Secrets   s3-offsite-key           |
| Scope: mesh                          |
| Value: ••••••••••••  ( Reveal )      |
| Used by: offsite-s3 destination      |
| Last rotated: 11-02 by Scott         |
| ( Rotate )                           |
|--------------------------------------|
| No view-secrets grant:               |
| Value: ••••••••••••  (no Reveal)     |
+--------------------------------------+
```
Widgets: status tile, list (references), form (actions). Reveal shown only with the view-secrets grant.

```text
+--------------------------------------+   REVEAL
| Reveal -> STEP-UP (always) ->        |
| Value: AKIA...EXAMPLE    ( Copy )    |
| Hidden again in 30s                  |
+--------------------------------------+
```

```text
+--------------------------------------+   CREATE / ROTATE
| New secret                           |
| Name  [                      ]       |
| Scope <Mesh v | System | Resource>   |
| Value (o) Generate  ( ) Enter        |
|       [ **************** ]           |
| ( Cancel )           ( Create )      |
|--------------------------------------|
| Rotate plex-token                    |
| Consumers updated: plex, tautulli    |
| (o) Generate  ( ) Enter new value    |
| ( Cancel )           ( Rotate )      |
+--------------------------------------+
```
Widgets: form. Rotate -> STEP-UP if high-risk -> JOB (propagate to consumers; cancel rolls back to the prior value). The value is never shown back after create or rotate.

Frame sequence: List -> Detail -> (Reveal -> Step-up -> Revealed) | Rotate -> Job | New -> Create.
Intents: `secret.list`, `secret.show` (metadata), `secret.reveal` (after step-up), `secret.create`, `secret.rotate`, `job.cancel`.

---

## data-07 Config sources and git sync

```text
+--------------------------------------+   SOURCE LIST + STATUS
| [=]  [ Search...               ]     |
| Config sources          ( + Add )    |
|--------------------------------------|
| homelab-config  git  main            |
|  In sync · pushed 14:02 · pulled 13:5|
|  Conflicts: git wins                 |
|  Pending push: 2 changes (settling,  |
|  pushes in 0:42)                     |
+--------------------------------------+
```
Widgets: table, status tile (sync state).

```text
+--------------------------------------+   SOURCE SETUP
| Add config source                    |
| Type <Git v>                         |
| URL    [                      ]      |
| Branch [ main  ]                     |
| Credentials <secret: pick v>         |
| On conflict (o) Git wins (default)   |
|             ( ) I resolve them       |
| ( Test )                 ( Save )    |
+--------------------------------------+
```
Widgets: form.

```text
+--------------------------------------+   PULLING
| ! Pulling changes from homelab-config|
|   Writes are blocked until done.     |
|   ###########-----                   |
| (all edit controls disabled mesh-    |
|  wide; other screens show a banner)  |
+--------------------------------------+
```
Widgets: banner, job progress.

```text
+--------------------------------------+   CONFLICT RESOLVER (manual mode)
| Conflict: services/sonarr.toml       |
| orca  (Scott 14:01) | git (a1b2c3)   |
| - port = 8989       | + port = 8990  |
|                                      |
| (o) Keep orca  ( ) Keep git          |
| 1 of 3 conflicts     ( Next )        |
| ( Apply all )                        |
+--------------------------------------+
```

```text
+------------------------------------------------------------------------------------------+   DESKTOP RESOLVER
| ...  | Conflict 1 of 3: services/sonarr.toml                                             |
|      | orca (Scott, 14:01)                    | git (a1b2c3, main)                       |
|      | - port = 8989                          | + port = 8990                            |
|      | (Keep orca)                            | (Keep git)                               |
|      |                                                         (Prev) (Next) (Apply all) |
+------+-----------------------------------------------------------------------------------+
```
Widgets: diff, form.

Error: push rejected / auth failed ("Push failed: credentials rejected. Changes kept locally." with Retry).

Frame sequence: List -> Setup -> Test -> Save -> Status (settling -> pushed | pulling -> in sync | conflict -> resolver -> apply).
Intents: `config.source.list|create|update|test`, `config.source.diff`, `config.source.apply`, `config.source.push`, `config.conflict.resolve`.

---

## data-08 Metrics history

```text
+--------------------------------------+   CHART VIEW
| [=]  [ Search...               ]     |
| Metrics  <baldur v>                  |
| Range (1h)(24h)(7d)(30d)(custom)     |
|--------------------------------------|
| CPU %                                |
|  80|      /\                         |
|  40|_/\__/  \___/\__                 |
|     12:00     18:00     00:00        |
| Memory                               |
|  ...                                 |
| ( + Add chart to dashboard )         |
+--------------------------------------+
```
Widgets: chart (time series), form (range). Target can be any machine, service or container. Each chart can be added to any dashboard.

```text
+--------------------------------------+   STATES
| No data for this range.              |
| Retention is 30d; older data is gone.|
|--------------------------------------|
| ! freyr not reachable. Showing data  |
|   up to 13:40.                       |
+--------------------------------------+
```

```text
+--------------------------------------+   RETENTION SETTINGS
| Metrics storage                      |
| Store in (o) Central store <v>       |
|          ( ) Path on each machine    |
|              [ /var/lib/orca/metrics]|
| Retention [ 30 ] days                |
| ( Cancel )             ( Save )      |
+--------------------------------------+
```
Widgets: form. Takes the lock.

```text
+------------------------------------------------------------------------------------------+   DESKTOP
| ...  | Metrics  <baldur v>   (1h)(24h)(7d)(30d)(custom)                     (Settings)   |
|      | +------------------ CPU % ------------------+ +----------- Memory ----------+   |
|      | |                                           | |                             |   |
|      | +-------------------------------------------+ +-----------------------------+   |
|      | +------------------ Disk I/O ---------------+ +----------- Network ---------+   |
+------+-----------------------------------------------------------------------------------+
```

Frame sequence: Chart view (target pick, range) -> Settings -> Save.
Intents: `metrics.query` (target, range), `metrics.settings.show|update`.

---

## data-09 Logs

```text
+--------------------------------------+   LIVE STREAM
| [=]  [ Search...               ]     |
| Logs  <sonarr v>     (Live)(Past)    |
| Filter [ error            ]  <All v> |
|--------------------------------------|
| 14:10:02 INFO  Import complete       |
| 14:10:05 WARN  Indexer slow (3.2s)   |
| 14:10:09 ERROR Download client down  |
| ...                         (Pause)  |
+--------------------------------------+
```
Widgets: live log stream, form (filter, level).

```text
+--------------------------------------+   MESH SEARCH
| Search logs across the mesh          |
| [ "permission denied"        ]       |
| Range <24h v>  Systems <All v>       |
|--------------------------------------|
| baldur/sonarr  14:02  permission ... |
| frigg          13:40  permission ... |
| 2 of 37 systems did not answer       |
|  (freyr, loki)                       |
+--------------------------------------+
```
Widgets: form, table (results; tap opens the source stream at that time).

```text
+--------------------------------------+   RETENTION SETTINGS
| Logs storage                         |
| Store in (o) Central store <v>       |
|          ( ) Path on each machine    |
| Retention [ 14 ] days                |
| ( Cancel )             ( Save )      |
+--------------------------------------+
```

Empty: "No log lines in this range." Offline: stream stops, last lines kept, banner "Stream disconnected at 14:11".

Frame sequence: Live stream <-> Past (range) -> Mesh search -> result -> stream at time; Settings -> Save.
Intents: `logs.stream` (target), `logs.query` (target, range, filter), `logs.search` (mesh, query), `logs.settings.show|update`.

---

## data-10 Audit log

```text
+--------------------------------------+   LIST (audit grant)
| [=]  [ Search...               ]     |
| Audit log                            |
| <Any user v> <Any action v> <7d v>   |
|--------------------------------------|
| ! 03:12 alex  secret.reveal  ANOMALY>|
|   14:05 scott backup.restore plex  > |
|   13:50 scott grant.add  jo:plex   > |
+--------------------------------------+
```
Widgets: table with filters. Only elevated actions are listed.

```text
+--------------------------------------+   ANOMALY DETAIL
| < Audit log                          |
| ! Anomaly: elevated action outside   |
|   alex's known sessions              |
| Action  secret.reveal s3-offsite-key |
| When    11-26 03:12                  |
| From    new device, 100.64.x.x       |
| Known sessions: laptop, phone        |
| ( Kill session ) ( Revoke grant )    |
| ( Mark as expected )                 |
+--------------------------------------+
```
Widgets: status tile, list, form (actions, each grant-gated). The anomaly also raised a notification.

```text
+--------------------------------------+   MY ACTIVITY (every user)
| Account > My activity                |
| 14:05 restore plex       ok          |
| 13:50 requested "Dune"   ok          |
+--------------------------------------+
```
Widgets: table. Shown to every user for their own actions; without the audit grant, the Audit log entry is absent from the drawer and search.

Frame sequence: List (filter) -> Entry detail | Anomaly detail -> action; My activity.
Intents: `audit.list` (filters), `audit.show` (id), `audit.anomaly.ack`, `auth.session.kill`, `grant.revoke`, `user.activity.list`.

---

## data-11 Certificates

```text
+--------------------------------------+   LIST
| [=]  [ Search...               ]     |
| Certificates            ( Issue )    |
|--------------------------------------|
| ! mimir.mesh    expires in 4d      > |
| ~ caddy-int     expires in 21d     > |
|   frigg.mesh    expires in 320d    > |
| x old-host      expired 11-01      > |
+--------------------------------------+
```
Widgets: table with row actions, sorted by expiry. Expiring certificates raise notifications.

```text
+--------------------------------------+   ISSUE
| Issue certificate                    |
| For   <System v | Service | Custom>  |
| Names [ mimir.mesh             ]     |
|       ( + name )                     |
| Valid [ 365 ] days                   |
| ( Cancel )             ( Issue )     |
|--------------------------------------|
| Issued. Installed on mimir.          |
+--------------------------------------+
```
Widgets: form. Issue -> STEP-UP if high-risk.

```text
+--------------------------------------+   DETAIL
| mimir.mesh                           |
| Issuer   mesh CA                     |
| Expires  11-30 (4d)                  |
| Names    mimir.mesh, 10.x.x.x        |
| ( Reissue )                          |
+--------------------------------------+
```

Empty: "No certificates issued." Permission-limited: list shows only certificates within the PKI grant's scope.

Frame sequence: List -> Detail -> Reissue | Issue -> Step-up -> Issued.
Intents: `cert.list`, `cert.show`, `cert.issue`.

---

## Open questions

1. Backup coverage: what counts as "stale" (fixed age, missed schedule, failed verify)?
2. Backups: retention policy shape (count, age, tiered) is not settled.
3. Destinations: which destination types exist first (SMB, S3, local path)?
4. Restore of a whole machine: what happens to the orca system on that machine during restore, and how does peacock fail over?
5. Restore preview: is "back up current state first" offered, and on or off by default? (Deleting a service defaults to no backup; restore is unspecified.)
6. Which restore/migrate/rotate/issue actions are marked high-risk is per plugin; the default set is not defined.
7. Migrate: does the old instance get removed, kept stopped, or asked each time (like delete)?
8. Secrets: how long a revealed value stays visible; whether copy-to-clipboard is allowed.
9. Secrets: is rotation scheduling (automatic rotation) in scope?
10. Git sync: settle/timeout duration and whether it is configurable; what is in the git source (all config or chosen parts).
11. Git sync: in manual conflict mode, are writes blocked while conflicts are unresolved?
12. Metrics/logs: which central data store(s) are supported; can retention differ per machine or per target?
13. Logs: is mesh search behaviour when some systems don't answer (partial results) acceptable, or must it wait?
14. Audit: retention, export, and which actions count as "elevated" (plugin-declared or core-defined).
15. Audit anomaly: available responses (kill session, revoke grant, mark expected) are assumed; not settled.
16. Certificates: is there an external CA (e.g. ACME) or only the mesh CA? Automatic renewal and its threshold are not settled.
17. Grant names (backup, migration, secrets, view-secrets, config, metrics, logs, audit, PKI) are taken from INDEX.md; the grant catalog is not defined.
