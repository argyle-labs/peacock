# 06 Topology and down propagation

As an operator I can see the topology and tell expected from unexpected down
propagation so that I react only to real faults.

## Preconditions

- Topology data exists for hosts, services and their dependencies.
- Some node may be down, with dependents derived as down.

## Screen states

- empty: no topology known.
- loading: topology being fetched.
- populated: all nodes up.
- error: topology request fails.
- degraded: some nodes down; downstream nodes marked expected-down or unexpected-down.

## Acceptance criteria

- [ ] Each node shows its state: up, down, or down-by-dependency.
- [ ] A node down because a dependency is down is marked "expected" and names the root cause.
- [ ] A node down with all dependencies up is marked "unexpected".
- [ ] Selecting a node shows its dependencies and dependents.
- [ ] Selecting a root cause highlights everything it takes down.
- [ ] The graph has a text/list alternative that is keyboard navigable.
- [ ] State changes arrive via pushed events without refresh.
- [ ] A stale source is shown as stale, not as up.

## Primitives and patterns

- exists: StatusDot, Badge, Drawer, DataTable, SectionHead
- new: Graph, Banner, EmptyState, Skeleton, TopologyView

## Orca tools and events

- topology tool: TBD
- system.health (named in brief)
- topology/health event: TBD

## Logic placement

- Server: dependency graph, expected vs unexpected classification, root-cause attribution.
- SDK: cache and subscription only.
- UI: renders node classes provided by the view-model; forwards `select(nodeId)`.
