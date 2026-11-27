# Grants model (decisions)

- Grant names: `area.thing:action` (e.g. `inventory.service:restart`, `secrets:view`, `media:request`). `*` is a wildcard in any segment. `super` matches everything.
- Scope: whole mesh, one system, or one resource (from interview).
- Optional expiry; default indefinite.
- Grants bundle into groups; default groups exist that plugins can reference; users with permission can create groups.
- Granting requires both the permission to grant and holding the access being granted.
- API tokens are principals and receive grants like users.
- A widget can widen access for its viewers, applying only through that widget.
- Fixed roles and namespaces are removed.
