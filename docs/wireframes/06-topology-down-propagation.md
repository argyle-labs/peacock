# 06 Topology and down propagation — wireframes

Low-fidelity frames for [story 06](../user-stories/06-topology-down-propagation.md).
Desktop frames are 100 columns wide; the phone frame is 40 columns.

Legend: `●` up, `○` down (unexpected), `◌` down-by-dependency (expected),
`◐` stale, `[ ]` button, `▓` skeleton block, `>` keyboard focus.

AC references:

- AC1 node state shown (up / down / down-by-dependency)
- AC2 expected-down names root cause
- AC3 unexpected-down when all dependencies are up
- AC4 selection shows dependencies and dependents
- AC5 selecting root cause highlights its blast radius
- AC6 text/list alternative, keyboard navigable
- AC7 pushed state changes, no refresh
- AC8 stale source shown as stale

## F1 Loading

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                                        [ Graph | List ]                 |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|     ▓▓▓▓▓▓▓▓            ▓▓▓▓▓▓▓▓            ▓▓▓▓▓▓▓▓                                             |
|        |                   |                   |                                                 |
|     ▓▓▓▓▓▓▓▓  ------   ▓▓▓▓▓▓▓▓  ------   ▓▓▓▓▓▓▓▓                                             |
|                                                                                                  |
|     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                                         |
|                                                                   Loading topology  (Spinner)    |
+--------------------------------------------------------------------------------------------------+
```

- Header: SectionHead (exists), SegmentedControl (exists) for Graph/List.
- Body: Skeleton (new) node placeholders, Spinner (exists).

## F2 Empty

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                                        [ Graph | List ]                 |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|                                   No topology known                                              |
|                  No hosts, services or dependencies are reported by any source.                  |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

- EmptyState (new) inside TopologyView (new).

## F3 Error

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                                        [ Graph | List ]                 |
+--------------------------------------------------------------------------------------------------+
| ! Topology request failed: <server message>                                        [ Retry ]     |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|                                   Topology unavailable                                           |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

- Banner (new, tone danger) with Button (exists) Retry; EmptyState (new) body.

## F4 Populated (all up)

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                     12 up  0 down  0 stale     [ Graph | List ]         |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   ● willow ----------+---------- ● plex                                                          |
|   (host)             |           (service)                                                       |
|                      +---------- ● sonarr ---------- ● sonarr-import                             |
|   ● loki ----------- ● caddy                                                                     |
|   (host)             (service)                                                                   |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

- Header counts: Badge (exists) x3. Graph (new) nodes carry StatusDot (exists).
- Regions: every node dot = AC1.

## F5 Degraded (main state)

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                  8 up  1 down  3 expected  1 stale   [ Graph | List ]   |
+--------------------------------------------------------------------------------------------------+
| ! 1 unexpected fault: maple-smb.  3 nodes down by dependency on willow.                          |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|   ○ willow  [ROOT CAUSE]-+------ ◌ plex        [expected · willow]                               |
|   (host, down)           |                                                                       |
|                          +------ ◌ sonarr      [expected · willow] --- ◌ sonarr-import           |
|                                                                        [expected · willow]       |
|   ● maple --------------- ○ maple-smb  [UNEXPECTED]                                              |
|                                                                                                  |
|   ● loki ---------------- ● caddy          ◐ freyr  [stale · last seen 4m]                       |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

- Banner (new, tone warning) summary; header Badge (exists) counts.
- Graph (new) inside TopologyView (new); StatusDot (exists) per node; Badge (exists) per class.
- willow `○ ROOT CAUSE` = AC1. `◌ … [expected · willow]` = AC1, AC2.
- maple-smb `[UNEXPECTED]` with up dependency maple = AC3.
- freyr `◐ stale · last seen` = AC8 (never rendered as `●`).
- Counts, banner and node classes update in place from the pushed topology/health event = AC7.

## F6 Degraded, phone width

```text
+--------------------------------------+
| Topology           [ Graph | List ]  |
| 8 up 1 down 3 exp 1 stale            |
+--------------------------------------+
| ! 1 unexpected: maple-smb            |
+--------------------------------------+
| Root causes                          |
|  ○ willow       takes down 3      >  |
|  ○ maple-smb    UNEXPECTED        >  |
| Expected down                        |
|  ◌ plex         via willow        >  |
|  ◌ sonarr       via willow        >  |
|  ◌ sonarr-import via willow       >  |
| Stale                                |
|  ◐ freyr        last seen 4m      >  |
| Up (8)                            v  |
+--------------------------------------+
```

- Defaults to List on phone; Graph remains selectable.
- SectionHead (exists) groups; DataTable (exists) rows with StatusDot, Badge.
- Rows = AC1, AC2, AC3, AC8; list form = AC6.

## F7 List view (keyboard alternative), desktop

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                  8 up  1 down  3 expected  1 stale   [ Graph | List ]   |
+--------------------------------------------------------------------------------------------------+
| State          Node            Kind      Cause            Depends on       Dependents            |
|--------------------------------------------------------------------------------------------------|
|>○ down         willow          host      root cause       -                plex, sonarr (+1)     |
| ○ unexpected   maple-smb       service   all deps up      maple            -                     |
| ◌ expected     plex            service   willow           willow           -                     |
| ◌ expected     sonarr          service   willow           willow           sonarr-import         |
| ◌ expected     sonarr-import   service   willow           sonarr           -                     |
| ◐ stale        freyr           host      last seen 4m     -                -                     |
| ● up           maple           host      -                -                maple-smb             |
+--------------------------------------------------------------------------------------------------+
```

- DataTable (exists) with Cell (exists), StatusDot, Badge.
- Arrow keys move focus row to row; Enter sends `select(nodeId)` = AC6.
- State/Cause columns = AC1, AC2, AC3, AC8.

## F8 Node selected — expected-down node (Drawer)

```text
+------------------------------------------------------------+-------------------------------------+
| Topology                                                   | sonarr                         [x]  |
+------------------------------------------------------------+-------------------------------------+
|                                                            | ◌ down · expected                   |
|   ○ willow ---------+------ ◌ plex                         | Root cause: willow            [>]   |
|                     |                                      |                                     |
|                     +======>◌ sonarr ===> ◌ sonarr-import  | Depends on                          |
|                             (selected)                     |  ○ willow       down · root cause   |
|   ● maple --------- ○ maple-smb                            |                                     |
|                                                            | Dependents                          |
|                                                            |  ◌ sonarr-import  expected          |
+------------------------------------------------------------+-------------------------------------+
```

- Drawer (exists) with SectionHead (exists) "Depends on" / "Dependents", StatusDot, Badge.
- Selected edges emphasised in Graph (new).
- Dependencies/dependents lists = AC4. "Root cause: willow" = AC2; its link selects willow (F9).

## F9 Root cause selected — blast radius highlighted

```text
+------------------------------------------------------------+-------------------------------------+
| Topology                                                   | willow                         [x]  |
+------------------------------------------------------------+-------------------------------------+
|                                                            | ○ down · root cause                 |
|  #○ willow#=========+=====>#◌ plex#                        | Takes down 3 nodes                  |
|                     |                                      |                                     |
|                     +=====>#◌ sonarr#===>#◌ sonarr-import# | Depends on                          |
|                                                            |  -                                  |
|   · maple · · · · · · ○ maple-smb   (dimmed)               | Dependents (affected)               |
|   · loki  · · · · · · ● caddy       (dimmed)               |  ◌ plex           expected          |
|                                                            |  ◌ sonarr         expected          |
|                                                            |  ◌ sonarr-import  expected          |
+------------------------------------------------------------+-------------------------------------+
```

- `#…#` = highlighted nodes; unaffected nodes dimmed. Graph (new), Drawer (exists).
- Highlight set and "Takes down 3" come from the view-model = AC5; lists = AC4.
- In List view the same affected rows are highlighted in the DataTable = AC5, AC6.

## F10 Unexpected-down node selected

```text
+------------------------------------------------------------+-------------------------------------+
| Topology                                                   | maple-smb                      [x]  |
+------------------------------------------------------------+-------------------------------------+
|                                                            | ○ down · UNEXPECTED                 |
|   ● maple ==========> ○ maple-smb (selected)               | All dependencies are up             |
|                                                            |                                     |
|                                                            | Depends on                          |
|                                                            |  ● maple        up                  |
|                                                            | Dependents                          |
|                                                            |  -                                  |
+------------------------------------------------------------+-------------------------------------+
```

- Drawer (exists), Badge (exists, tone danger) "UNEXPECTED" = AC3; lists = AC4.

## F11 Stale node selected

```text
+------------------------------------------------------------+-------------------------------------+
| Topology                                                   | freyr                          [x]  |
+------------------------------------------------------------+-------------------------------------+
|                                                            | ◐ stale · last seen 4m ago          |
|   ◐ freyr (selected)                                       | Source: system.health               |
|                                                            | State unknown until source reports. |
|                                                            | Depends on   -                      |
|                                                            | Dependents   -                      |
+------------------------------------------------------------+-------------------------------------+
```

- Drawer (exists), StatusDot (stale tone), Badge; relTime (exists) for "last seen" = AC8; lists = AC4.

## F12 Pushed change (live update)

```text
+--------------------------------------------------------------------------------------------------+
| Topology                                  12 up  0 down  0 expected  0 stale  [ Graph | List ]   |
+--------------------------------------------------------------------------------------------------+
|   ● willow ---------+------ ● plex                                                               |
|                     +------ ● sonarr ------ ● sonarr-import                                      |
|   ● maple --------- ● maple-smb            ● freyr                                               |
+--------------------------------------------------------------------------------------------------+
```

- Same TopologyView re-rendered from the pushed topology/health event; no reload control exists = AC7.
- The degraded Banner (F5) is removed when no node is down; an open Drawer keeps its selection and updates in place.

## Flow

1. Open Topology → F1 Loading (SDK subscribes; no intent).
2. Response arrives → F2 Empty, F3 Error, F4 Populated, or F5 Degraded (F6 on phone).
   - F3 Retry → re-fetch via SDK → back to F1.
3. Toggle Graph/List → F7 (view-local; no server intent).
4. Click or Enter on a node → `select(nodeId)` → F8 / F10 / F11 depending on node class.
5. Click a root cause (node or "Root cause" link in F8) → `select(rootId)` → F9 blast radius.
6. Close Drawer `[x]` / Esc → back to F5 or F7.
7. topology/health event pushed → F12 (or back to F5 on new faults), selection retained.
