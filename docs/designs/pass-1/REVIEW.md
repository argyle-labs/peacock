# Design pass 1 — adversarial review

## Critical
- C1 Request: "needs admin approval" box hardcoded; must follow the user's per-user approval policy and appear only after tapping Request.
- C2 Rotate/Copy app password and Approve fix have no confirm, step-up or undo; approve should link to job progress (cancel + rollback).
- C3 No offline/failover state anywhere (banner, last-known stamp, disabled controls).
- C4 Only happy paths drawn; add one shared-states artboard.

## Major
- M1 Notifications in 3-4 places; bell is the only entry (numeric badge); "Needs attention" becomes a widget on the same feed.
- M2 Drawer "Search" item duplicates the search bar; remove.
- M3 Request is a second search UI; make it Search with the Media filter; MyApps tile links to My requests.
- M4 "Home" means the HA app and a dashboard; rename one.
- M5 Desktop and phone nav differ (groups, mesh switcher, Jobs, collapse); one nav model.
- M6 Headers inconsistent; one AppHeader: root (menu, search, avatar) / detail (back, title, overflow).
- M7 Filter chips differ and clip at 390px; one list, horizontal scroll with fade.
- M8 App names lead where generics should (Open Plex dashboard, Sonarr title, wiring list, topology link).
- M9 Grant wording shown to users ("limited to your grants", "grant holders", "view-secrets grant", "admin setting").
- M10 Hostnames, paths, IPs shown ungated; summarize, details behind grant-gated "Show details".
- M11 Topology broken link has no Repair; rows/twisties not tappable.
- M12 Search rows do nothing; group instances.
- M13 Request lacks Report a problem and play-from-library.
- M14 Sheets/drawer/wizard lack close/cancel.
- M15 Approval: title, deny reason, snooze, lock "being reviewed by X", deny as secondary.
- M16 Color-only status; semantic status tokens + icon + text, valid under any theme.
- M17 Planned action styled as warning.
- M18 Plugin install lacks update policy, publisher/key detail; checkbox mock bug; small targets.

## Minor
Touch targets < 44px (chips, bell, Request, Tree/Graph, Switch mesh, checkboxes); SignIn "Signed in as" before TOTP, no back, two OTP styles; FirstRun prefilled, no show/confirm/strength, unlabeled progress, no bad-code state; Search empty landing never drawn; Drawer "SHARED +" and "ORCA" labels; MyApps jargon tile labels, single-app credential header; Approval impact vs safety; CreateService no create-share path, ambiguous "6 GB free"; Main one-tap Renew, RECENT has no actions.

## Missing states
Every screen lacks loading/empty/error/offline/limited views; per-screen list in the review transcript summary.

## Shared components to extract
AppHeader, NavModel/Drawer, SearchPalette, StatusBadge, ListRow, NotificationItem + NeedsAttention, StepUpSheet/ActionConfirm, OtpInput, ConnectionBanner + disabled controls, StateFrame, PrimaryActionBar, CredentialCard, WizardStepper, DetailsDisclosure (grant-gated), FilterChip, theme tokens.

## Open decisions
1. RESOLVED: yes; TOTP when set, else password. 2FA optional unless admin requires it.
2. RESOLVED: yes, cached results marked stale, actions disabled.
