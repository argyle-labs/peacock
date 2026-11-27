# Push contract

Recorded from the 2026-11-26 interview.

## Connection
- A client opens WebSocket connections to the orca it is calling, the system it is connected to at that moment.
- Everything on the mesh reaches the client through that orca. The connected orca relays data and actions from other systems, so the client never talks to any other system directly.
- If that orca goes away, the client fails over to another one automatically (from the interview) and shows the last known state, with actions disabled, until it reconnects.
