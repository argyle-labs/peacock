# Grants model (decisions)

- Grant names: `area.thing:action` (e.g. `inventory.service:restart`, `secrets:view`, `media:request`). `*` is a wildcard in any segment. `super` matches everything.
- Scope: whole mesh, one system, or one resource (from interview).
- Optional expiry; default indefinite.
- Grants bundle into groups; default groups exist that plugins can reference; users with permission can create groups.
- Granting requires both the permission to grant and holding the access being granted.
- API tokens are principals and receive grants like users.
- A widget can widen access for its viewers, applying only through that widget.
- Fixed roles and namespaces are removed.
- Source of grants: ALL grants come from orca generics (core). Plugins never define grants; they map their actions onto the generic grants, the same as everything else in orca.

## Grants are derived from the category catalog
- Each orca generic category (e.g. `media.player`, `media.tv-downloader`, `secrets.password-manager`) declares its actions.
- The grant set IS category × action: `media.player:restart`, `media.player:*`, `super`.
- Defining the generic catalog defines every grant; there is no separate grant registry.
- Plugins declare which category they implement and map their actions onto that category's actions.

## Plugin-specific grants (dynamic)
- Grants can target a specific plugin: generic grants scoped to a plugin (`media.player:restart @plugin:<uuid>`), plus actions only that plugin has (`plugin.<name>:<action>`).
- The grant set is dynamic: orca core registers a plugin's grants at runtime when the plugin is installed and declares them, and removes them when it is uninstalled. Nothing is compiled in per plugin.
- The grant model, matching and enforcement stay in orca core; plugins only declare their actions.

## Resource groups
- Scopes: mesh ⊇ system ⊇ plugin ⊇ resource, plus **resource groups**.
- A resource group is a named set of instances (e.g. "4K" = the 4K Sonarr + 4K Radarr; "Regular" = the standard pair). Several instances of the same plugin can sit in different groups.
- A grant can be scoped to a group: `media.tv-downloader:* @group:<uuid>`.

## Groups are shared
- Resource groups are one orca object, used for grant scope, Inventory filtering, dashboards, bulk actions and routing (e.g. 4K requests go to the 4K group).
- One grant can cover several groups: `@group:<uuid>,<uuid>`.

## Area-level grants
- `media:viewer`: watch and listen across media.
- `media:admin`: everything in `media:viewer`, plus managing media services.
- Area-level grants expand to sets of `area.thing:action` grants, and they also accept scopes (`media:viewer @group:<4k>`).
- Orca core defines what each area-level grant contains. It is the same on every install and not editable per mesh.
