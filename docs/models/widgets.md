# Widget and dashboard model

Recorded from the 2026-11-26 interview.

## One standard contract
- A widget's JSON carries everything: what to show (kind, data binding by UUID), actions (each mapped to a grant), layout (size, position, responsive hints), and presentation (theme tokens, emphasis, density).
- It is one versioned orca core schema, used by every client (web, TUI, iOS, Android). A client renders what it can and ignores hints it cannot use, never anything else.

## Schema origin
- The schema is orca's own and does not depend on any outside format.
- It is modelled on Home Assistant's dashboard config: a dashboard holds views, a view holds sections or a grid, and sections hold cards.
- Each card has a `type`, entity-style bindings (orca UUIDs), and tap/hold actions (orca actions, each grant-checked).
