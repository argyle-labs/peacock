# Grants model (decisions)

- Grant names: `area.thing:action` (e.g. `inventory.service:restart`, `secrets:view`, `media:request`). `*` is a wildcard in any segment. `super` matches everything.
- Scope: whole mesh, one system, or one resource (from interview).
- Optional expiry; default indefinite.
- People get grants through groups. Orca ships default groups, and anyone holding the grant can create more.
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
- Every action fits a standard verb on a core category. Plugins never add actions or grants of their own.
- A grant targets a specific plugin by scope: `media.tv.player:restart @plugin:<uuid>`.
- The set of grantable targets is dynamic: when a plugin is installed, the categories it implements become grantable for it, and they are removed when it is uninstalled.
- The grant model, matching and enforcement stay in orca core; plugins only declare their actions.

## Collections
- Scopes: mesh ⊇ system ⊇ plugin ⊇ resource, plus **collections**.
- A collection is a named set of resources (e.g. "4K" = the 4K Sonarr + 4K Radarr; "Regular" = the standard pair). Several instances of the same plugin can sit in different collections.
- A grant can be scoped to a collection: `media.tv.downloader:* @collection:<uuid>`.

## Collections are shared
- Collections are one orca object, used for grant scope, Systems filtering, dashboards, bulk actions and routing (e.g. 4K requests go to the 4K collection).
- One grant can cover several collections: `@collection:<uuid>,<uuid>`.

## Area-level grants
- `media:viewer`: watch and listen across media.
- `media:admin`: everything in `media:viewer`, plus managing media services.
- Area-level grants expand to sets of `area.thing:action` grants, and they also accept scopes (`media:viewer @collection:<4k>`).
- Orca core defines what each area-level grant contains. It is the same on every install and not editable per mesh.
- Area-level grants are rules over verbs, not fixed lists, so they automatically cover categories added later in their area. For example, a new `media.photos.player` is covered by `media:viewer` as soon as it is installed.

## Plugin uninstall
- Orca removes only grants scoped to that plugin (`@plugin:<uuid>`) or to its resources.
- Generic, area-level and collection-scoped grants stay as they are.

## Widget-only widening
- A widget instance is a principal, like a token, and holds its own grants (e.g. `media.player:restart @resource:<plex>`).
- A user acting through that widget gets the union of their own grants and the widget's grants, for that widget's actions only.
- Only a holder of the grant (grant-and-hold rule) can attach it to a widget. Every action through a widget is audited with both the user and the widget.

## Groups vs collections
- **Groups** are sets of people (and tokens) that hold grants.
- **Collections** are sets of resources used as a scope and everywhere else (filtering, dashboards, bulk actions, routing).

## Evaluation
- Grants are allow-only and add together. There is no deny grant.
- `*` matches within a path, and `area.kind:*` covers everything beneath it.
- `super` always means everything and is never scoped.
- `super` is meant for a dedicated super-admin account that isn't used day to day. Daily accounts get the specific grants they need, and peacock prompts a `super` holder to create that separate day-to-day account.
