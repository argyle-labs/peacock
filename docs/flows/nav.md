# nav — Search, navigation & dashboards

Low-fidelity wireframes for every flow in the `nav` area of [INDEX.md](INDEX.md). Phone frame first (about 40 columns), then desktop (about 90 columns) where the layout differs. Each screen is an orca JSON dashboard or widget. Plugins declare what a widget shows and does; each UI decides how to render it. Widget kinds named under frames are generic kinds, not peacock components.

Legend: `[ ]` button, `( )` toggle/radio, `[x]` checked, `___` text input, `░` disabled control, `▓` skeleton/loading, `≡` drawer, `⌕` search bar (also the command palette), `⋯` per-item actions, `⚠` warning, `🔒` lock (drawn as `[L]`).

Shared chrome on every screen:

```text
Phone                                   
┌──────────────────────────────────────┐
│ ≡  ⌕ Search or run a command…    (o) │  ≡ drawer, (o) account
├──────────────────────────────────────┤
│                                      │
│              content                 │
│                                      │
└──────────────────────────────────────┘
```

```text
Desktop
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca  mesh▾│ ⌕ Search or run a command…                                  ⌘K      (o) │
├──────────────┼───────────────────────────────────────────────────────────────────────────┤
│ drawer       │                                                                           │
│ (collapsible)│                          content                                          │
│              │                                                                           │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

The `mesh▾` switcher appears only when peacock is connected to more than one mesh.

---

## nav-01 Landing search

Every user lands here. Results, filters and per-result actions are limited by the user's grants.

### 1a. Landing, empty query

```text
┌──────────────────────────────────────┐
│ ≡                                (o) │
├──────────────────────────────────────┤
│                                      │
│   ┌──────────────────────────────┐   │
│   │ ⌕ Search everything…         │   │
│   └──────────────────────────────┘   │
│   Filters: [All▾] [Machine▾] [+]     │
│                                      │
│   Recent                             │
│   · plex  (media player)             │
│   · living room lights               │
│   · baldur  (system)                 │
│                                      │
└──────────────────────────────────────┘
```

Widgets: search input, filter chips, list (recent items).

### 1b. Loading

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ plex                     ✕  (o) │
├──────────────────────────────────────┤
│ [All▾] [Media players▾] [Machine▾]   │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓               │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                 │
└──────────────────────────────────────┘
```

### 1c. Results grouped by generic

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ plex                     ✕  (o) │
├──────────────────────────────────────┤
│ [All▾] [Generic▾] [Machine▾] [Mesh▾] │
│                                      │
│ MEDIA PLAYERS                    2   │
│ ┌──────────────────────────────────┐ │
│ │ ● plex · mimir     running    ⋯ │ │
│ │ ● plex · njord     running    ⋯ │ │
│ └──────────────────────────────────┘ │
│ CONTAINERS & VMS                 1   │
│ ┌──────────────────────────────────┐ │
│ │ ● plex  docker · baldur       ⋯ │ │
│ └──────────────────────────────────┘ │
│ MEDIA LIBRARY                   12   │
│ ┌──────────────────────────────────┐ │
│ │ The Plex Files (movie) ✓ owned  │ │
│ │ …show 11 more                    │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Per-result `⋯` opens the actions that result's plugin exposes and the user's grants allow:

```text
│ ┌──────────────────────────────────┐ │
│ │ plex · mimir                     │ │
│ │ [Open]  [Restart]  [Logs]        │ │
│ │ [Open dashboard]                 │ │
│ └──────────────────────────────────┘ │
```

Desktop: results left, preview of the selected result right.

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ ⌕ plex                                                         ✕      (o) │
│              ├───────────────────────────────────────────────────────────────────────────┤
│ drawer       │ [All▾] [Generic▾] [Machine▾] [Mesh▾] [Status▾]                            │
│              ├──────────────────────────────────────┬────────────────────────────────────┤
│              │ MEDIA PLAYERS                     2  │ plex · mimir                       │
│              │ > ● plex · mimir    running       ⋯  │ media player · running · v1.41     │
│              │   ● plex · njord    running       ⋯  │ ┌────────┐ ┌────────┐ ┌────────┐   │
│              │ CONTAINERS & VMS                  1  │ │CPU 12% │ │MEM 2.1G│ │streams2│   │
│              │   ● plex  docker · baldur         ⋯  │ └────────┘ └────────┘ └────────┘   │
│              │ MEDIA LIBRARY                    12  │ [Open] [Restart] [Logs]            │
│              │   The Plex Files (movie) ✓ owned     │ [Open dashboard]                   │
│              │   …show 11 more                      │                                    │
└──────────────┴──────────────────────────────────────┴────────────────────────────────────┘
```

Widgets: search input, filter chips, grouped list with row actions, status tiles (preview).

### 1d. No results

```text
├──────────────────────────────────────┤
│ [All▾] [Generic▾]                    │
│                                      │
│   No results for "plexx".            │
│   [Clear filters]                    │
└──────────────────────────────────────┘
```

### 1e. Limited by grants (media-only user)

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ plex                     ✕  (o) │
├──────────────────────────────────────┤
│ [All▾] [Media▾]                      │
│                                      │
│ MEDIA LIBRARY                   12   │
│ │ The Plex Files (movie) ✓ owned   │ │
│ │ [Request]  [Report a problem]    │ │
│ APPS                             1   │
│ │ Plex           [Open]            │ │
└──────────────────────────────────────┘
```

Only generics the user holds grants for appear as groups and filters. Nothing indicates hidden groups.

### 1f. Error / offline

```text
├──────────────────────────────────────┤
│ ⚠ Search failed. [Retry]             │
└──────────────────────────────────────┘

├──────────────────────────────────────┤
│ ⚠ Offline · last known 14:02         │
│ MEDIA PLAYERS (last known)           │
│ │ ● plex · mimir   running   ░⋯     │ │
│ Actions are disabled until the mesh  │
│ is reachable.                        │
└──────────────────────────────────────┘
```

Sequence: 1a → 1b → 1c / 1d / 1e → result action (may route to nav-02 argument entry or step-up) or open item.
Intents: `search.query {text, filters}`, `search.actions {resultId}`, `action.run {actionId, args}`, `dashboard.open {id}`.

---

## nav-02 Command palette

The search bar is the palette. Keyboard-first on desktop (`⌘K` / `/`); on phone, tapping `⌕` opens it full-screen.

### 2a. Palette open, mixed results

```text
┌──────────────────────────────────────┐
│ ← ⌕ restart pl_                      │
├──────────────────────────────────────┤
│ ACTIONS                              │
│ ▶ Restart service…                   │
│ ▶ Restart container…                 │
│ GO TO                                │
│ → plex · mimir                       │
│ → Media players (dashboard)          │
└──────────────────────────────────────┘
```

Desktop overlay:

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │        ┌──────────────────────────────────────────────────────┐           │
│              │        │ ⌕ restart pl_                                        │           │
│              │        ├──────────────────────────────────────────────────────┤           │
│              │        │ ACTIONS                                              │           │
│              │        │ > ▶ Restart service…                         ↵       │           │
│              │        │   ▶ Restart container…                               │           │
│              │        │ GO TO                                                │           │
│              │        │   → plex · mimir                                     │           │
│              │        │   → Media players                                    │           │
│              │        ├──────────────────────────────────────────────────────┤           │
│              │        │ ↑↓ move   ↵ run   tab args   esc close               │           │
│              │        └──────────────────────────────────────────────────────┘           │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

### 2b. Argument entry

```text
┌──────────────────────────────────────┐
│ ← Restart service                    │
├──────────────────────────────────────┤
│ Service   [plex · mimir        ▾]    │
│ Machine   [mimir               ▾]    │
│                                      │
│ [Cancel]                    [Run]    │
└──────────────────────────────────────┘
```

Widgets: action form (fields declared by the action).

### 2c. Confirmation

```text
├──────────────────────────────────────┤
│ Restart plex on mimir?               │
│ 2 active streams will drop.          │
│ [Cancel]                [Restart]    │
└──────────────────────────────────────┘
```

### 2d. Step-up re-auth (action marked high-risk by its plugin)

```text
├──────────────────────────────────────┤
│ Confirm it's you                     │
│ "Delete VM baldur" needs re-entry.   │
│ Authenticator code ______            │
│ [Cancel]                [Verify]     │
└──────────────────────────────────────┘
```

### 2e. Running → job progress

```text
├──────────────────────────────────────┤
│ Restart service · plex · mimir       │
│ ✓ stop container                     │
│ ● start container…                   │
│ ○ health check                       │
│ [Cancel and roll back]               │
└──────────────────────────────────────┘
```

### 2f. States

```text
│ Locked:     [L] plex is being edited by alice. Restart unavailable.
│ No grant:   action not listed.
│ Offline:    ⚠ Offline · actions unavailable; GO TO shows last known items.
│ Error:      ⚠ Restart failed: <orca error>. [View job] [Retry]
│ Expired:    Session expired. Sign in again; arguments are kept.
```

Sequence: 2a → 2b → 2c → (2d) → 2e → done/error.
Intents: `search.query {text, mode:"palette"}`, `action.describe {actionId}`, `action.run {actionId, args}`, `auth.stepUp {method, code}`, `job.watch {jobId}`, `job.cancel {jobId}`.

---

## nav-03 Drawer navigation

Lists the dashboards the user's grants allow: default dashboards, personal, shared, plugin dashboards.

### 3a. Phone, drawer as overlay

```text
┌───────────────────────────┬──────────┐
│ orca            mesh: home│░░░░░░░░░░│
├───────────────────────────┤░░░░░░░░░░│
│ ⌕ Search                  │░░░░░░░░░░│
│                           │░░░░░░░░░░│
│ DEFAULT                   │░░░░░░░░░░│
│  Topology                 │░░░░░░░░░░│
│  Containers & VMs         │░░░░░░░░░░│
│  Services                 │░░░░░░░░░░│
│  Media players            │░░░░░░░░░░│
│  Plugins                  │░░░░░░░░░░│
│  Jobs                     │░░░░░░░░░░│
│ MY DASHBOARDS          [+]│░░░░░░░░░░│
│  Home                     │░░░░░░░░░░│
│ SHARED                    │░░░░░░░░░░│
│  Living room              │░░░░░░░░░░│
│ PLUGINS                   │░░░░░░░░░░│
│  Proxmox ▸                │░░░░░░░░░░│
│ ─────────────             │░░░░░░░░░░│
│  My history  · Account    │░░░░░░░░░░│
└───────────────────────────┴──────────┘
```

Tap the scrim or swipe left to close.

### 3b. Desktop expanded / collapsed

```text
┌──────────────────┬───────────────────────────┐   ┌────┬──────────────────────────────────┐
│ ≡ orca     mesh▾ │ ⌕ …                       │   │ ≡  │ ⌕ …                              │
│ DEFAULT          │                           │   │ ◎  │                                  │
│ > Topology       │                           │   │ ▦  │                                  │
│   Containers&VMs │                           │   │ ⚙  │                                  │
│   Services       │      content              │   │ ▶  │        content                   │
│ MY DASHBOARDS [+]│                           │   │ ★  │                                  │
│   Home           │                           │   │    │                                  │
│ SHARED           │                           │   │    │                                  │
│ PLUGINS          │                           │   │    │                                  │
│   Proxmox ▸      │                           │   │    │                                  │
└──────────────────┴───────────────────────────┘   └────┴──────────────────────────────────┘
```

### 3c. Minimal grants (media-only user)

```text
┌───────────────────────────┬──────────┐
│ orca                      │░░░░░░░░░░│
│ ⌕ Search                  │░░░░░░░░░░│
│ DEFAULT                   │░░░░░░░░░░│
│  My apps                  │░░░░░░░░░░│
│  Requests                 │░░░░░░░░░░│
│ MY DASHBOARDS          [+]│░░░░░░░░░░│
│ SHARED                    │░░░░░░░░░░│
│  Living room              │░░░░░░░░░░│
│ ─────────────             │░░░░░░░░░░│
│  My history  · Account    │░░░░░░░░░░│
└───────────────────────────┴──────────┘
```

Sections with nothing granted are not drawn.

Loading: section rows as `▓▓▓▓`. Offline: drawer shows last known list with `⚠ Offline` header; navigation to cached dashboards still works, read-only.

Widgets: nav list (grouped), mesh switcher.
Sequence: 3a/3b → select dashboard → nav-04/05/06/07.
Intents: `nav.list {}` (dashboards the user can see), `nav.setCollapsed {bool}` (user preference), `mesh.select {meshId}`.

---

## nav-04 View default dashboards

orca default dashboards cover generic categories. Each widget is hidden or read-only per its rule.

### 4a. Loading → populated (Media players)

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ Media players                        │
│ ┌──────────┐ ┌──────────┐            │
│ │▓▓▓▓▓▓▓▓▓▓│ │▓▓▓▓▓▓▓▓▓▓│            │
│ └──────────┘ └──────────┘            │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ Media players                        │
│ ┌────────────────┐┌────────────────┐ │
│ │ plex · mimir   ││ jellyfin·freyr │ │
│ │ ● running      ││ ● running      │ │
│ │ 2 streams      ││ 0 streams      │ │
│ └────────────────┘└────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Streams (24h)          ▁▃▅▇▅▃▁▂▄ │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Instance   Machine  Status    ⋯ │ │
│ │ plex       mimir    running   ⋯ │ │
│ │ plex       njord    running   ⋯ │ │
│ │ jellyfin   freyr    running   ⋯ │ │
│ │ navidrome  freyr    stopped   ⋯ │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

Desktop: same widgets on a grid.

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ ⌕ Search…                                                             (o) │
│ > Media      ├───────────────────────────────────────────────────────────────────────────┤
│   players    │ Media players                                                             │
│              │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│              │ │plex · mimir  │ │plex · njord  │ │jellyfin·freyr│ │navidrome     │       │
│              │ │● running  2▶ │ │● running  0▶ │ │● running  0▶ │ │○ stopped     │       │
│              │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│              │ ┌─────────────────────────────────┐ ┌───────────────────────────────────┐ │
│              │ │ Streams (24h)  ▁▃▅▇▅▃▁▂▄▆▇▅▃    │ │ Instance  Machine  Status       ⋯ │ │
│              │ │                                 │ │ plex      mimir    running      ⋯ │ │
│              │ └─────────────────────────────────┘ │ …                                 │ │
│              │                                     └───────────────────────────────────┘ │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

Widgets: status tiles, chart, table with row actions.

### 4b. Permission-limited

```text
│ ┌──────────────────────────────────┐ │
│ │ Instance   Machine  Status       │ │  view-only per widget rule:
│ │ plex       mimir    running   ░⋯ │ │  row actions disabled
│ └──────────────────────────────────┘ │
```

Widgets whose rule hides them from users without the grant are not drawn; the grid reflows.

### 4c. Empty

```text
├──────────────────────────────────────┤
│ Media players                        │
│ No media players yet.                │
│ [Browse plugins]                     │  shown only with plugin-install grant
└──────────────────────────────────────┘
```

### 4d. Per-widget error / stale / offline

```text
│ ┌────────────────┐┌────────────────┐ │
│ │ plex · mimir   ││ ⚠ jellyfin     │ │
│ │ ● running      ││ couldn't load  │ │
│ │                ││ [Retry]        │ │
│ └────────────────┘└────────────────┘ │

│ ⚠ Offline · last known 14:02         │
│ ┌────────────────┐                   │
│ │ plex · mimir   │  controls ░       │
│ │ ● running ·14:02│                  │
│ └────────────────┘                   │
```

Sequence: 4a (loading → populated) / 4b / 4c / 4d → widget interaction (nav-09).
Intents: `dashboard.get {id}`, `widget.data {widgetId}` / `widget.subscribe {widgetId}`, `action.run` from row actions.

---

## nav-05 Personal dashboards

Every user owns one or many dashboards.

### 5a. Dashboard list

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ My dashboards                  [+]   │
│ ┌──────────────────────────────────┐ │
│ │ Home              6 widgets   ⋯ │ │
│ │ Homelab           9 widgets   ⋯ │ │
│ └──────────────────────────────────┘ │
│  ⋯ → Open · Rename · Delete · Share  │  Share only with shared-dashboard grant
└──────────────────────────────────────┘
```

Empty: `No dashboards yet. [Create dashboard]`.

### 5b. Create / rename

```text
├──────────────────────────────────────┤
│ New dashboard                        │
│ Name  ___________________            │
│ [Cancel]                  [Create]   │
└──────────────────────────────────────┘
```

### 5c. Edit mode canvas (phone: single column, reorder)

```text
┌──────────────────────────────────────┐
│ ✕ Editing "Home"             [Save]  │
├──────────────────────────────────────┤
│ ┌──────────────────────────────────┐ │
│ │ ⠿ Living room lights     ↔ ✕    │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ⠿ Apple TV               ↔ ✕    │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ⠿ plex · mimir           ↔ ✕    │ │
│ └──────────────────────────────────┘ │
│           [+ Add widget]             │
└──────────────────────────────────────┘
```

`⠿` drag handle, `↔` size (S/M/L), `✕` remove.

Desktop: free grid canvas, drag and resize.

```text
┌──────────────┬───────────────────────────────────────────────────────────────────────────┐
│ ≡ orca       │ ✕ Editing "Home"                         [+ Add widget]  [Cancel] [Save]  │
│              ├───────────────────────────────────────────────────────────────────────────┤
│              │ ┌·····················┐┌·····················┐┌·····················┐      │
│              │ : ⠿ Living room    ✕  :: ⠿ Apple TV      ✕  ::                     :      │
│              │ :  lights             ::                    ::      drop here      :      │
│              │ :                  ◢  ::                 ◢  ::                     :      │
│              │ └·····················┘└·····················┘└·····················┘      │
│              │ ┌···········································┐                            │
│              │ : ⠿ plex · mimir · streams chart       ✕  :                            │
│              │ :                                      ◢  :   ◢ resize handle          │
│              │ └···········································┘                            │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

### 5d. Widget add picker

```text
├──────────────────────────────────────┤
│ Add widget                           │
│ ⌕ Filter widgets…                    │
│ [Generic▾] [Kind▾]                   │
│ HOME                                 │
│  ▢ Light (status tile)        [Add]  │
│  ▢ Media remote (form)        [Add]  │
│ MEDIA PLAYERS                        │
│  ▢ Streams (chart)            [Add]  │
│  ▢ Instances (table)          [Add]  │
│ CONTAINERS & VMS                     │
│  ▢ Console (terminal)         [Add]  │
└──────────────────────────────────────┘
```

Picker lists only widgets the user can see per widget rule. Picking a widget that needs a target asks for it (e.g. which light, which instance).

### 5e. Save / delete / lock

```text
│ Saved.                                │

│ Delete "Homelab"?                     │
│ [Cancel]                    [Delete]  │

│ [L] "Home" is open for editing on     │
│ your other session. [Take over]? —    │  see Open questions
```

Save error keeps the unsaved layout: `⚠ Couldn't save. [Retry]`. Offline: `[Edit]` disabled.

Sequence: 5a → 5b → 5c ↔ 5d → save; or 5a → delete.
Intents: `dashboard.list {owner:"me"}`, `dashboard.create {name}`, `dashboard.rename {id, name}`, `dashboard.lock {id}`, `widget.catalog {filters}`, `dashboard.save {id, layout}`, `dashboard.unlock {id}`, `dashboard.delete {id}`.

---

## nav-06 Shared dashboards

A shared-dashboard grant holder publishes a dashboard; others view it read-only.

### 6a. Share settings

```text
├──────────────────────────────────────┤
│ Share "Living room"                  │
│ (●) Shared                           │
│ Audience                             │
│  [x] Group: household                │
│  [ ] Group: media-users              │
│  [ ] User:  ____________   [+]       │
│ [Cancel]                    [Save]   │
└──────────────────────────────────────┘
```

Audience choices are limited to principals the holder can grant to (grant-and-hold rule).

### 6b. Read-only view (viewer)

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ Living room          shared · read-only│
│ ┌────────────────┐┌────────────────┐ │
│ │ Lights   ● on  ││ Apple TV  idle │ │
│ └────────────────┘└────────────────┘ │
│ [Copy to my dashboards]              │  see Open questions
└──────────────────────────────────────┘
```

Layout is read-only. Each widget's own control rule still applies: a viewer allowed to control lights can toggle them.

### 6c. Being edited

```text
│ [L] Being edited by alice.            │
│ You'll see changes when saved.        │
```

Sequence: owner 5a → `⋯ Share` → 6a → save; viewer drawer SHARED → 6b.
Intents: `dashboard.share {id, audience[]}`, `dashboard.unshare {id}`, `dashboard.get {id}`.

---

## nav-07 Plugin dashboards

A plugin-defined dashboard renders exactly like nav-04. Grouped plugin dashboards appear nested in the drawer.

### 7a. Drawer group + dashboard

```text
┌───────────────────────────┬──────────┐
│ PLUGINS                   │░░░░░░░░░░│
│  Proxmox ▾                │░░░░░░░░░░│
│    Cluster                │░░░░░░░░░░│
│    Storage                │░░░░░░░░░░│
│  Home Assistant ▸         │░░░░░░░░░░│
└───────────────────────────┴──────────┘

┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ Proxmox › Cluster                    │
│ ┌────────────────┐┌────────────────┐ │
│ │ frigg ● online ││ guests 14      │ │
│ └────────────────┘└────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ Guest     Type  Status        ⋯ │ │
│ │ baldur    lxc   running       ⋯ │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

States as nav-04 (loading, empty, permission-limited, error, offline).
Widgets: whatever the plugin declares, from the same generic kinds.
Sequence: drawer → 7a → nav-09.
Intents: `nav.list {}`, `dashboard.get {id}`, `widget.subscribe {widgetId}`.

---

## nav-08 Widget permission overrides

A widget-rule grant holder sees a widget's default visibility/control rules and overrides them.

### 8a. Entry

Widget `⋯` → `Permissions` (shown only with the widget-rule grant).

### 8b. Rule editor

```text
┌──────────────────────────────────────┐
│ ← Permissions · Living room lights   │
├──────────────────────────────────────┤
│ VISIBILITY                           │
│ Default: shown to holders of         │
│          home.lights.view            │
│ Override: (●) default  ( ) custom    │
│                                      │
│ CONTROL                              │
│ Default: home.lights.control         │
│ Override: ( ) default  (●) custom    │
│   [x] Group: household               │
│   [ ] User:  ____________   [+]      │
│                                      │
│ ⚠ Widens access. household members   │
│   without home.lights.control can    │
│   control these lights through this  │
│   widget only.                       │
│                                      │
│ [Reset to default]  [Cancel] [Save]  │
└──────────────────────────────────────┘
```

Desktop: two columns, default rule left, override right, warning spanning below.

```text
│ ┌───────────────────────────────┬───────────────────────────────────────────┐            │
│ │ DEFAULT (from plugin)         │ OVERRIDE                                  │            │
│ │ Visible: home.lights.view     │ Visible: (●) default ( ) custom           │            │
│ │ Control: home.lights.control  │ Control: ( ) default (●) custom           │            │
│ │                               │   [x] household  [+ add principal]        │            │
│ └───────────────────────────────┴───────────────────────────────────────────┘            │
│ ⚠ Widens access through this widget only.             [Reset] [Cancel] [Save]           │
```

### 8c. States

```text
│ [L] Rules being edited by alice. Editing unavailable.
│ Save requires step-up if the plugin marks it high-risk → step-up dialog (see 2d).
│ Grant-and-hold: principals/grants the editor doesn't hold are not offered.
│ Offline: editor read-only, [Save] ░.
│ Error: ⚠ Couldn't save rule: <orca error>. Edits kept.
```

Widgets: action form, warning banner.
Sequence: 8a → 8b (lock) → (step-up) → save → unlock.
Intents: `widget.rules.get {widgetId}`, `widget.rules.lock {widgetId}`, `widget.rules.set {widgetId, visibility, control}`, `widget.rules.reset {widgetId}`, `auth.stepUp`.

---

## nav-09 Widget interaction

One frame per generic widget kind, phone size. Desktop is the same widget at a larger size.

### 9a. Status tile

```text
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ Living room    │  │ plex · mimir   │  │ Lights         │
│ lights   ● on  │  │ ● running      │  │ ● on   ░toggle │  no control grant
│ [Toggle]       │  │ CPU 12%        │  │                │
└────────────────┘  └────────────────┘  └────────────────┘
```

### 9b. Chart

```text
┌──────────────────────────────────────┐
│ CPU · baldur        [1h|24h|7d|30d]  │
│ 100┤          ╭╮                     │
│  50┤   ╭──╮╭──╯╰─╮    ╭─             │
│   0┼───╯  ╰╯     ╰────╯              │
│    12:00        13:00         14:00  │
└──────────────────────────────────────┘
```

Range limited by the metrics retention setting. Empty: `No data in this range.`

### 9c. Table with row actions

```text
┌──────────────────────────────────────┐
│ Containers & VMs     ⌕ filter   [⇅]  │
│ Name      Machine   Status        ⋯  │
│ plex      baldur    ● running     ⋯  │
│ sonarr    baldur    ● running     ⋯  │
│ ─ ⋯ → [Restart] [Stop] [Logs] [Console]
│ < 1 2 3 >                            │
└──────────────────────────────────────┘
```

Phone: rows collapse to cards when columns don't fit (UI decision).

### 9d. Action form

```text
┌──────────────────────────────────────┐
│ Scan library                         │
│ Library  [TV              ▾]         │
│ ( ) full  (●) changed only           │
│ [Run]                                │
└──────────────────────────────────────┘
→ job progress (2e) when the action is long-running
```

### 9e. Live log stream

```text
┌──────────────────────────────────────┐
│ Logs · sonarr  ⌕ ____  [⏸] [▼ follow]│
│ 14:02:01 INFO  Import complete       │
│ 14:02:05 WARN  Indexer slow          │
│ 14:02:09 INFO  RSS sync              │
│ ● live                               │
└──────────────────────────────────────┘
Disconnected: ⚠ Stream paused · reconnecting…
```

### 9f. Terminal / VM console

```text
┌──────────────────────────────────────┐
│ Console · baldur        [⤢] [✕]      │
│ root@baldur:~# _                     │
│                                      │
│ [Esc][Tab][Ctrl][↑][↓]               │  phone key bar
└──────────────────────────────────────┘
Opening a console may require step-up (plugin-marked) → 2d.
Offline: ⚠ Console closed: connection lost.
```

### 9g. Topology graph

```text
┌──────────────────────────────────────┐
│ Topology               [Tree|Graph]  │
│ frigg (proxmox)                      │
│ ├─ baldur (lxc)                      │
│ │  ├─ plex (docker)                  │
│ │  └─ sonarr (docker) ──╳── plex     │  broken link
│ willow (storage)                     │
│ └─ share: media ──▶ baldur           │
│ tap node → detail sheet with actions │
└──────────────────────────────────────┘
```

Phone defaults to tree; desktop defaults to graph (UI decision).

### 9h. Unknown-kind fallback

```text
┌──────────────────────────────────────┐
│ "Plex sessions"                      │
│ This widget kind isn't supported on  │
│ this client.                         │
│ [Open in search]                     │
└──────────────────────────────────────┘
```

### 9i. Disabled control / locked / stale

```text
│ [Restart] ░  You don't have control of this widget.
│ [Restart] ░  [L] Being edited by alice.
│ ● running · last known 14:02  (all controls ░ while offline)
```

Sequence: any dashboard → widget → control → (confirm) → (step-up) → result / job.
Intents: `widget.subscribe {widgetId}`, `widget.data {widgetId, range}`, `action.run {actionId, args}`, `logs.stream {target, query}`, `console.open {target}`, `topology.get {scope}`, `job.watch`, `job.cancel`.

---

## nav-10 Themes

Custom themes; one default theme applies across web, TUI and mobile.

### 10a. Theme list

```text
┌──────────────────────────────────────┐
│ ← Themes                       [+]   │
├──────────────────────────────────────┤
│ (●) Orca dark          default       │
│ ( ) Orca light                       │
│ ( ) Midnight (mine)              ⋯   │
│  ⋯ → Edit · Duplicate · Delete       │
└──────────────────────────────────────┘
```

### 10b. Editor with live preview

```text
┌──────────────────────────────────────┐
│ ← Edit "Midnight"            [Save]  │
├──────────────────────────────────────┤
│ Background   [■ #0b0f17]             │
│ Surface      [■ #121826]             │
│ Text         [■ #e6e9ef]             │
│ Accent       [■ #7aa2f7]             │
│ Success/Warn/Error [■][■][■]         │
├──────────────────────────────────────┤
│ PREVIEW                              │
│ ┌──────────────┐ [Button] ⚠ warning  │
│ │ plex ● run   │ ▁▃▅▇▅▃              │
│ └──────────────┘                     │
│ [Set as default]                     │
└──────────────────────────────────────┘
```

Desktop: tokens left, full preview dashboard right.

```text
│ ┌──────────────────────────────┬───────────────────────────────────────────────────────┐ │
│ │ Background  [■ #0b0f17]      │ PREVIEW                                               │ │
│ │ Surface     [■ #121826]      │ ┌────────┐ ┌────────┐ ┌──────────────────────────┐    │ │
│ │ Text        [■ #e6e9ef]      │ │tile    │ │tile    │ │ chart ▁▃▅▇▅▃▁▂▄          │    │ │
│ │ Accent      [■ #7aa2f7]      │ └────────┘ └────────┘ └──────────────────────────┘    │ │
│ │ States      [■][■][■]        │ table · log stream · drawer · palette                 │ │
│ └──────────────────────────────┴───────────────────────────────────────────────────────┘ │
```

States: save error keeps edits; offline editor works locally but `[Save]` ░.

Widgets: action form (color fields), preview dashboard.
Sequence: 10a → 10b → save → set default.
Intents: `theme.list {}`, `theme.create {name, tokens}`, `theme.update {id, tokens}`, `theme.delete {id}`, `theme.setDefault {id}`.

---

## nav-11 Connection failover

Peacock switches to another mesh machine when its current one goes down.

### 11a. Reconnecting

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ ⟳ Reconnecting to the mesh…          │
│ (controls ░ until reconnected)       │
│ … dashboard shows last known state … │
└──────────────────────────────────────┘
```

### 11b. Reconnected

```text
│ ✓ Reconnected.                       │  dismisses itself
```

### 11c. All machines unreachable

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ Search… (cached)            (o) │
├──────────────────────────────────────┤
│ ⚠ Offline · last known 14:02         │
│ No mesh machine is reachable.        │
│ Actions are disabled. [Retry now]    │
├──────────────────────────────────────┤
│ ┌────────────────┐┌────────────────┐ │
│ │ plex · mimir   ││ baldur         │ │
│ │ ● running ░    ││ ● online  ░    │ │
│ └────────────────┘└────────────────┘ │
└──────────────────────────────────────┘
```

Extended outage raises an alert through notifications.

Desktop: same banner across the top of content; drawer stays usable for cached dashboards.

Widgets: banner, all widgets in stale mode.
Sequence: populated → 11a → 11b, or 11a → 11c → (retry) → 11b.
Intents: none from the user beyond `connection.retry {}`; reconnect is automatic. Subscriptions are re-sent on reconnect.

---

## nav-12 My action history

Every user sees their own actions.

### 12a. List

```text
┌──────────────────────────────────────┐
│ ≡  ⌕ Search…                     (o) │
├──────────────────────────────────────┤
│ My history                           │
│ [Date▾] [Action▾] [Result▾] [Mach.▾] │
│ ┌──────────────────────────────────┐ │
│ │ 14:02 Restart plex · mimir   ✓  │ │
│ │ 13:40 Toggle living room     ✓  │ │
│ │ 11:15 Delete VM test-01      ✕  │ │
│ │ Yesterday                        │ │
│ │ 22:01 Request "Dune" movie   ✓  │ │
│ └──────────────────────────────────┘ │
│ [Load more]                          │
└──────────────────────────────────────┘
```

Desktop: list left, detail right.

### 12b. Detail

```text
├──────────────────────────────────────┤
│ ← Restart plex · mimir               │
│ When     2026-11-26 14:02            │
│ From     web · session "MacBook"     │
│ Via      command palette             │
│ Result   ✓ succeeded · job #…        │
│ Args     service=plex machine=mimir  │
│ [View job]                           │
└──────────────────────────────────────┘
```

States: empty `No actions yet.`; loading skeleton rows; error `⚠ Couldn't load history. [Retry]`; offline shows cached page with filters ░.

Widgets: table with filters, detail panel.
Sequence: drawer "My history" → 12a → 12b.
Intents: `history.list {principal:"me", filters, cursor}`, `history.get {id}`.

---

## Open questions

1. What is the full set of orca default dashboards (the interview says it must be defined)? The drawer entries drawn here are placeholders.
2. Recent items on the empty search landing: shown at all, and are they per user, per device or synced across clients?
3. Search scope across multiple meshes: does the unified view search all connected meshes at once, with a mesh filter?
4. Phone palette: same full-screen surface as landing search, or a separate overlay?
5. Desktop palette shortcut keys (`⌘K`, `/`) and whether they're configurable.
6. Which actions get a confirmation step apart from step-up: declared per action by the plugin, or a UI rule?
7. Lock behavior for personal dashboards edited from two of the same user's sessions: block, or allow taking over?
8. Can viewers copy a shared dashboard into their own dashboards?
9. Does a shared dashboard's owner see its audience edits by other shared-dashboard grant holders, and who can edit a shared dashboard besides its creator?
10. Is saving a widget-permission override, especially a widening one, itself an elevated action that goes to the audit log, and does it require step-up?
11. Is a widening override scoped to one widget instance on one dashboard, or to that widget definition everywhere it is placed?
12. Personal dashboards on a TUI: is edit mode supported there, or view-only?
13. Default theme: per user across all their clients (as drawn), or also a mesh-wide default for new users? Theme token set (which colors are user-editable) is not defined.
14. Failover reconnect: does the user see which machine they're connected to anywhere, and how long before "Reconnecting" becomes "Offline"? What counts as an "extended period" for the outage alert?
15. Offline cache: how much last-known state is kept on each client, and does search work against it?
16. My action history: retention period, whether it includes read actions or only changes, and whether it includes actions taken by the user's API tokens.
17. Unknown-kind fallback action: what should it offer (open in search, open on another client, nothing)?
