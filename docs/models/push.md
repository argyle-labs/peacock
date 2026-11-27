# Push contract

Recorded from the 2026-11-26 interview.

## Connection
- A client opens WebSocket connections to the orca it is calling, the system it is connected to at that moment.
- Everything on the mesh reaches the client through that orca. The connected orca relays data and actions from other systems, so the client never talks to any other system directly.
- If that orca goes away, the client fails over to another one automatically (from the interview) and shows the last known state, with actions disabled, until it reconnects.

## Internal transport
- WebSocket is only for clients. Real-time data between orca components uses an internal Rust transport, which does not have to be WebSocket: a Unix socket on the same machine, or the existing mesh channel between machines. The internal design is still open.

## Subscriptions
- The client subscribes only to what the open view shows. Changing views changes the subscriptions, and orca sends updates only for current subscriptions, filtered by the viewer's grants.
- Every signed-in client also keeps an always-on subscription to its user's notifications and jobs, whatever view is open.
