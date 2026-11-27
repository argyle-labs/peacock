# Generic category catalog

Recorded from the 2026-11-26 interview. Orca core defines the catalog. Plugins declare which category they implement, and grants are category × action (see grants.md).

## Structure
- Categories always allow nesting, to any depth: `media` → `media.downloader` → `media.downloader` with type `tv` (written `media.downloader.tv`).
- A grant on a parent category covers its children: `media.downloader:*` covers TV, movie and book downloaders.
- A child inherits its parent's actions and can add its own.
