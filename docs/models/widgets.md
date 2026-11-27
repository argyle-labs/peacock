# Widget and dashboard model

Recorded from the 2026-11-26 interview.

## One standard contract
- A widget's JSON carries everything: what to show (kind, data binding by UUID), actions (each mapped to a grant), layout (size, position, responsive hints), and presentation (theme tokens, emphasis, density).
- It is one versioned orca core schema, used by every client (web, TUI, iOS, Android). A client renders what it can and ignores hints it cannot use, never anything else.
