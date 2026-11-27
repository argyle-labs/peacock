# Generic category catalog

Recorded from the 2026-11-26 interview. Orca core defines the catalog. Plugins declare which category they implement, and grants are category × action (see grants.md).

## Structure
- Path order is area, then the kind of thing, then its role: `media.tv.downloader`, `media.movies.downloader`, `media.audiobooks.downloader`, `media.tv.library`.
- Categories always allow nesting, to any depth.
- A grant on a parent covers its children: `media.tv:*` covers everything for TV.
- `*` works at any level: `media.*.downloader:*` covers every media downloader.
- A child inherits its parent's actions and can add its own.

## Plugins implement many categories
- A plugin declares every category it implements. Plex, for example, is `media.tv.player`, `media.movies.player`, `media.music.player`, and so on.
- Grants on any of those categories apply to that plugin's matching actions.

## Top-level areas
- Names are plural where that reads naturally.
- `media`, `home`, `network`, `storage`, `compute`, `backups`, `secrets`, `identity`, `notifications`, `security`, `dev`, `models`.

## Actions
- Orca core defines one standard set of verbs shared by every category: `view`, `create`, `update`, `delete`, `start`, `stop`, `restart`, `backup`, `restore`, `upgrade`, `logs`, `exec`.
- A category or plugin implements only the verbs it needs. A verb that isn't implemented is not offered, and nothing shows it.
- Categories add their own verbs only when no standard verb fits (e.g. `request`, `play`).
- `exec` is a last resort. An operation uses one of the other verbs unless none fits, and `exec` is used only when it is necessary.

## Risk
- The plugin declares each action's risk when that action is performed, so risk can depend on context (e.g. restarting an idle service vs one that is streaming).
- Orca core enforces whatever the plugin declares: a high-risk action needs step-up and is audited.
- Orca core sets a high-risk minimum that no plugin can lower, for: all of `secrets`; `identity` changes (grants, users, 2FA); `exec`; `restore`; and `delete` of data. Everything else uses the risk the plugin declares.
