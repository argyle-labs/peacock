# 03 Tool actions and instance scope — wireframes

Low-fidelity frames for [story 03](../user-stories/03-tool-actions-instance-scope.md).
Desktop frames are about 100 columns wide; F12 is phone width.
Acceptance criteria are referenced as AC1–AC11, in the order the story lists them:

- AC1 list shows tools by name, opens detail by id
- AC2 actions with a schema-generated form
- AC3 cardinality comes from the action schema
- AC4 a single-instance action needs exactly one instance
- AC5 the server's rejection of a bad `add` is shown, with no default instance chosen
- AC6 a fan-out action defaults to all instances and can be narrowed
- AC7 per-instance results after a fan-out run
- AC8 a failing instance does not hide the other results
- AC9 high-risk actions show a badge and route to the approval gate
- AC10 invalid params are flagged before submit
- AC11 unreachable instances are disabled in the scope picker

## F1 Tool list — loading

```text
+--------------------------------------------------------------------------------------------------+
| Tools                                                                         [ Search tools  ] |
+--------------------------------------------------------------------------------------------------+
| Name                     | Instances | Actions | Status                                          |
|--------------------------+-----------+---------+-------------------------------------------------|
| ░░░░░░░░░░░░░░           | ░░        | ░░      | ░░░░░░                                          |
| ░░░░░░░░░░               | ░░        | ░░      | ░░░░░░                                          |
| ░░░░░░░░░░░░░░░░         | ░░        | ░░      | ░░░░░░                                          |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead (title "Tools"), TextInput (new, search), DataTable with Skeleton (new) rows.
- Region map: table placeholder holds layout for AC1.

## F2 Tool list — empty

```text
+--------------------------------------------------------------------------------------------------+
| Tools                                                                                            |
+--------------------------------------------------------------------------------------------------+
|                                                                                                  |
|                                    [ no-tools glyph ]                                            |
|                                   No tools registered                                            |
|                      Tools appear here when a plugin registers them.                             |
|                                                                                                  |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, EmptyState (new).
- Region map: empty state is the "empty" screen state; it renders no actions.

## F3 Tool list — populated

```text
+--------------------------------------------------------------------------------------------------+
| Tools                                                                         [ Search tools  ] |
+--------------------------------------------------------------------------------------------------+
| Name                     | Instances | Actions | Status                                          |
|--------------------------+-----------+---------+-------------------------------------------------|
| > radarr                 | 2         | 6       | (o) 2/2 reachable                               |
|   sonarr                 | 1         | 5       | (o) 1/1 reachable                               |
|   lazylibrarian          | 1         | 4       | (!) 0/1 reachable                               |
+--------------------------------------------------------------------------------------------------+
  row click -> open detail by toolId
```

- SectionHead, TextInput (new), DataTable, Cell, StatusDot, Badge.
- Region map: Name column + row click -> AC1 (navigates by `toolId`, not by name).

## F4 Tool list — error

```text
+--------------------------------------------------------------------------------------------------+
| Tools                                                                                            |
+--------------------------------------------------------------------------------------------------+
|  (x) Could not load tools.  <server error message>                               [ Retry ]       |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, Badge (error tone), Button (Retry).
- Region map: list "error" screen state.

## F5 Tool detail — loading

```text
+--------------------------------------------------------------------------------------------------+
| < Tools / ░░░░░░░░                                                                               |
+--------------------------------------------------------------------------------------------------+
| [ ░░░░ ] [ ░░░░ ] [ ░░░░ ]                               | Instances                             |
|----------------------------------------------------------|  ░░░░░░░░░░░░                         |
|  ░░░░░░░░░░░░░░░░░░░░░░                                  |  ░░░░░░░░░░░░                         |
|  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                         |                                       |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, Tabs (new), Skeleton (new).
- Region map: detail "loading" screen state.

## F6 Tool detail — populated, fan-out action (`search`)

```text
+--------------------------------------------------------------------------------------------------+
| < Tools / radarr                                                         id 0192f0c4-...-7a1e    |
+--------------------------------------------------------------------------------------------------+
| [ search ] [ add ] [ refresh ] [ delete  !high ]          | Instances                             |
|-----------------------------------------------------------|  (o) radarr      reachable            |
|  search                               [ fan-out ]         |  (o) radarr4k    reachable            |
|                                                           |                                       |
|  Scope   ( All instances | One instance )                 |                                       |
|          [x] radarr   [x] radarr4k                        |                                       |
|                                                           |                                       |
|  Query *     [ dune                              ]        |                                       |
|  Year        [ 2021        ]                              |                                       |
|  Monitored   [x]                                          |                                       |
|                                                           |                                       |
|                                          [ Run search ]   |                                       |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, Tabs (new, one per action), ActionRunner (new), Badge (cardinality label),
  InstanceScopePicker (new) built from SegmentedControl + Checkbox (new), SchemaForm (new)
  from TextInput / Select / Checkbox, Button, StatusDot.
- Region map:
  - action tabs + form fields -> AC2
  - "fan-out" badge and the scope picker mode come from the schema -> AC3
  - scope starts on "All instances" with both boxes checked; "One instance" narrows -> AC6
  - Instances panel -> reachability shown for AC11

## F7 Tool detail — single-instance action (`add`), no instance chosen

```text
+--------------------------------------------------------------------------------------------------+
| < Tools / radarr                                                                                 |
+--------------------------------------------------------------------------------------------------+
| [ search ] [*add*] [ refresh ] [ delete  !high ]          | Instances                             |
|-----------------------------------------------------------|  (o) radarr      reachable            |
|  add                                  [ single ]          |  (o) radarr4k    reachable            |
|                                                           |                                       |
|  Instance *  [ Choose one instance            v ]         |                                       |
|              Choose exactly one instance to run add.      |                                       |
|                                                           |                                       |
|  TMDB id *   [ 438631        ]                            |                                       |
|  Quality     [ HD-1080p     v ]                           |                                       |
|                                                           |                                       |
|                                        [ Run add ] (disabled)                                     |
+--------------------------------------------------------------------------------------------------+
```

- ActionRunner, Badge ("single"), InstanceScopePicker in single mode (Select, new), SchemaForm, Button.
- Region map:
  - "single" badge and the picker mode come from the schema -> AC3
  - Select has no preselected value, and Run stays disabled until one instance is chosen -> AC4, AC5 (no default)

## F8 Single-instance action — server rejection

```text
+--------------------------------------------------------------------------------------------------+
|  add                                  [ single ]                                                 |
|  Instance *  [ radarr                          v ]                                               |
|  TMDB id *   [ 438631        ]                                                                   |
|                                                                                                  |
|  +--------------------------------------------------------------------------------------------+  |
|  | (x) Rejected by server: add requires exactly one instance.                                 |  |
|  |     <server error code / message verbatim>                                                 |  |
|  +--------------------------------------------------------------------------------------------+  |
|                                                         [ Run add ]                              |
+--------------------------------------------------------------------------------------------------+
```

- ActionRunner, Badge (error tone), Toast (new) mirrored inline, Button.
- Region map: the error banner shows the server's rejection verbatim and leaves the selection as the user set it -> AC5.

## F9 Invalid parameters before submit

```text
+--------------------------------------------------------------------------------------------------+
|  search                               [ fan-out ]                                                |
|  Scope   ( All instances | One instance )   [x] radarr  [x] radarr4k                             |
|                                                                                                  |
|  Query *     [                                  ]   ! Required                                   |
|  Year        [ 20x1        ]                        ! Must be an integer 1900–2100               |
|                                                                                                  |
|                                       [ Run search ] (disabled)                                  |
+--------------------------------------------------------------------------------------------------+
```

- SchemaForm with field-level messages from SDK schema validation, TextInput, Button.
- Region map: inline field errors + disabled Run -> AC10.

## F10 High-risk action (`delete`)

```text
+--------------------------------------------------------------------------------------------------+
| [ search ] [ add ] [ refresh ] [*delete  !high*]                                                 |
|--------------------------------------------------------------------------------------------------|
|  delete                     [ single ]  [ ! HIGH RISK ]                                          |
|  Instance *  [ radarr4k                        v ]                                               |
|  Movie id *  [ 812        ]                                                                      |
|                                                                                                  |
|                                       [ Request approval ]                                       |
+--------------------------------------------------------------------------------------------------+
            |
            v  opens the approval gate (story 02) in a Modal
+-------------------------------------------+
| Approve: radarr / delete on radarr4k      |
| Risk: high   Params: { movieId: 812 }     |
|              [ Cancel ]  [ Approve ]      |
+-------------------------------------------+
```

- RiskBadge (new) on the tab and the header, ActionRunner, Button, Modal (approval gate from story 02).
- Region map: badge + "Request approval" routes through the gate instead of running directly -> AC9.

## F11 Degraded — unreachable instance and mixed fan-out results

```text
+--------------------------------------------------------------------------------------------------+
| < Tools / radarr                                              (!) 1 of 2 instances unreachable   |
+--------------------------------------------------------------------------------------------------+
|  search                               [ fan-out ]         | Instances                             |
|  Scope   ( All instances | One instance )                 |  (o) radarr      reachable            |
|          [x] radarr   [ ] radarr4k  (unreachable)         |  (x) radarr4k    unreachable          |
|  Query *     [ dune                              ]        |                                       |
|                                          [ Run search ]   |                                       |
|-----------------------------------------------------------+---------------------------------------|
|  Results  search "dune"                         1 ok · 1 error                                  |
|  +----------------------------------------------------------------------------------------------+ |
|  | (o) radarr     ok      3 matches                                              [ expand v ]  | |
|  |       Dune (2021) · Dune (1984) · Dune: Part Two (2024)                                     | |
|  | (x) radarr4k   error   connection refused                                     [ expand v ]  | |
|  +----------------------------------------------------------------------------------------------+ |
+--------------------------------------------------------------------------------------------------+
```

- InstanceScopePicker with a disabled Checkbox, StatusDot, Badge, PerInstanceResult (new) rows,
  Spinner while each row is pending, Button.
- Region map:
  - radarr4k checkbox disabled with an "unreachable" label -> AC11
  - one result row per instance, each with ok/error -> AC7
  - the radarr4k error row sits beside the radarr ok row; neither collapses the other -> AC8

Pending variant: each PerInstanceResult row shows a Spinner and "running" until its own result event arrives.

## F12 Phone width — tool detail, fan-out with results

```text
+------------------------------+
| < radarr               [=]   |
+------------------------------+
| [search][add][refresh][del!] |
|------------------------------|
| search          [fan-out]    |
| Scope                        |
| (All | One)                  |
| [x] radarr                   |
| [ ] radarr4k  unreachable    |
| Query *                      |
| [ dune                    ]  |
| [       Run search        ]  |
|------------------------------|
| Results   1 ok · 1 error     |
| (o) radarr    ok   3    [v]  |
| (x) radarr4k  error     [v]  |
+------------------------------+
  Instances panel moves into a Drawer via [=]
```

- Tabs (scrolling), InstanceScopePicker, SchemaForm, Button, PerInstanceResult, Drawer (instances).
- Region map: same as F6 + F11 -> AC2, AC3, AC6, AC7, AC8, AC11.

## F13 Detail — error

```text
+--------------------------------------------------------------------------------------------------+
| < Tools / radarr                                                                                 |
+--------------------------------------------------------------------------------------------------+
|  (x) Could not load tool 0192f0c4-...-7a1e.  <server error message>              [ Retry ]       |
+--------------------------------------------------------------------------------------------------+
```

- SectionHead, Badge (error), Button.
- Region map: detail "error" screen state. A run request that fails outright appears as in F8 (inline banner + Toast).

## Flow

1. F1 -> F3: the list loads (or F2 if there are no tools, F4 if loading fails).
2. F3 row click -> F5 -> F6: opens detail by `toolId` (F13 on failure).
3. F6: the user picks an action tab, and the form and scope mode render from that action's schema.
4. Fan-out path: F6 (All by default, or narrowed to One) -> Run sends
   `run(toolId, "search", params, scope: all | [instanceId])` -> F11, with results streaming in per instance.
5. Single path: F7 (no instance, Run disabled) -> choose instance -> Run sends
   `run(toolId, "add", params, scope: [instanceId])` -> success Toast, or F8 if the server rejects it.
6. Invalid input at any point -> F9. Run stays disabled until the SDK validation passes.
7. High-risk path: F10 -> "Request approval" sends `run(...)`, the server routes it to the approval gate (story 02), and the result appears as in F11 after approval.
