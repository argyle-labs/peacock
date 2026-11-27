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
