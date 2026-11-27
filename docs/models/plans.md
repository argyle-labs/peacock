# Plans and previews

Recorded from the 2026-11-26 interview.

- Endpoints (CLI, MCP, API) execute by default. A dry run is opt-in, and it needs the same grant as the action itself.
- The UI always requests a dry run first for high-risk actions and shows the preview, and the user confirms before it executes. Other actions in the UI execute directly.
- A dry run returns a plan object: what will change, on which resources (by UUID), and the risk. Confirming executes that plan.
- A plan is tied to the state it was computed from. If that state changes before the user confirms, orca refuses to execute and returns a fresh preview with the reason the old plan was rejected (e.g. "Plex was restarted by Alex 30s ago").
