# Widget and dashboard model

Recorded from the 2026-11-26 interview.

## One standard contract
- A widget's JSON carries everything: what to show (kind, data binding by UUID), actions (each mapped to a grant), layout (size, position, responsive hints), and presentation (theme tokens, emphasis, density).
- It is one versioned orca core schema, used by every client (web, TUI, iOS, Android). A client renders what it can and ignores hints it cannot use, never anything else.

## Schema origin
- The schema is orca's own and does not depend on any outside format.
- It is modelled on Home Assistant's dashboard config: a dashboard holds views, a view holds sections or a grid, and sections hold cards.
- Each card has a `type`, entity-style bindings (orca UUIDs), and tap/hold actions (orca actions, each grant-checked).

## Card types
- Orca core ships the built-in card types.
- Plugins can also register custom card types, as Home Assistant does. A custom card is registered with orca under its own `type`, and its bindings and actions still go through orca's grants.
- A custom card may declare a fallback built from built-in card types. Clients that cannot run custom cards (TUI, native mobile) render the fallback.
- A custom card without a fallback is not offered on those clients.

## Storage
- Dashboards are stored in orca's database and mirrored to git through the holistic two-way git sync (git wins by default).
- Only shared dashboards mirror to git. Per-user dashboards stay in the database only.
