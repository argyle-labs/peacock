# enduser — End-user experience wireframes

Low-fidelity wireframes for the `enduser` flows in `INDEX.md`. Phone frame first (~40 cols), desktop (~90 cols) where the layout differs. Every screen is an orca JSON dashboard; frames name the generic widget kinds requested, and each UI decides how to render them. Every control is grant-gated: a control the viewer lacks the grant for is hidden or disabled per that widget's rule.

Shared chrome on every screen: `≡` opens the drawer menu, the search bar is the command palette, `◔` is the account menu. Offline banner, session-expired prompt and step-up prompt are shared frames, shown once in enduser-01 and enduser-02 and referenced after that.

---

## enduser-01 My apps

As any user I can see the apps granted to me and open them via SSO.

### Phone: populated

```text
+--------------------------------------+
| ≡  [ Search apps, media, home…  ] ◔  |
+--------------------------------------+
| My apps                              |
| +--------+ +--------+ +--------+     |
| | [icon] | | [icon] | | [icon] |     |
| | Media  | | Photos | | Home   |     |
| | player | |        | |        |     |
| |  SSO   | |  SSO   | |  SSO   |     |
| +--------+ +--------+ +--------+     |
| +--------+ +--------+                |
| | [icon] | | [icon] |                |
| | Pass-  | | Books  |                |
| | words  | |        |                |
| |  key ▸ | |  SSO   |                |
| +--------+ +--------+                |
|                                      |
| [ Request access to more apps ]      |
+--------------------------------------+
```

Widgets: app tile grid (status tiles, each with an open action and sign-in-method badge), form action button (request access). "key ▸" marks an app that uses a managed password (opens enduser-02).

### Phone: drawer open

```text
+--------------------------------------+
| ×  orca                         |░░░░|
|---------------------------------|░░░░|
| ⌕ Search                        |░░░░|
| ▣ My apps                       |░░░░|
| ▤ Media requests                |░░░░|
| ⚑ My problem reports            |░░░░|
| ⌂ Home                          |░░░░|
| ◫ My dashboards                 |░░░░|
|---------------------------------|░░░░|
| ◔ Account                       |░░░░|
+--------------------------------------+
```

Widgets: none; the drawer lists the dashboards the viewer's grants reach. A user with more grants sees more entries.

### Phone: SSO launch and app unavailable

```text
+--------------------------------------+     +--------------------------------------+
| ≡  [ Search…                    ] ◔  |     | ≡  [ Search…                    ] ◔  |
+--------------------------------------+     +--------------------------------------+
| My apps                              |     | My apps                              |
| +--------+                           |     | +--------+                           |
| | Media  |  Opening Media player…    |     | | Photos | ! Unavailable             |
| | player |  ( ◌ signing you in )     |     | |  ░░░░  |  Photos is not responding.|
| +--------+                           |     | +--------+  Last seen 14:02.         |
|                                      |     |            [ Report a problem ]      |
+--------------------------------------+     +--------------------------------------+
```

Widgets: status tile (unavailable state carries last-seen time), form action button (report a problem, opens enduser-07 prefilled with the app).

### Phone: loading, empty, error, offline

```text
+------------------------------+ +------------------------------+
| ≡ [ Search…           ] ◔    | | ≡ [ Search…           ] ◔    |
+------------------------------+ +------------------------------+
| My apps                      | | My apps                      |
| [░░░░] [░░░░] [░░░░]         | |  You have no apps yet.       |
| [░░░░] [░░░░]                | |  [ Request access ]          |
+------------------------------+ +------------------------------+
        loading                          empty

+------------------------------+ +------------------------------+
| ≡ [ Search…           ] ◔    | | ⚠ Offline. Showing state from|
+------------------------------+ |   14:02. Controls disabled.  |
| My apps                      | +------------------------------+
| ! Couldn't load your apps.   | | My apps                      |
|   [ Retry ]                  | | [Media ] [Photos] [Home  ]   |
+------------------------------+ | (open disabled)              |
        error                    +------------------------------+
                                         offline
```

### Session expired (shared)

```text
+--------------------------------------+
| Your session expired.                |
| Password  [______________]           |
| Code      [______]                   |
| [ Sign in ]   Your input is kept.    |
+--------------------------------------+
```

### Desktop: populated

```text
+------------------------------------------------------------------------------------------+
| ≡ orca   [ Search apps, media, home…                                  ⌘K ]            ◔  |
+-----------+------------------------------------------------------------------------------+
| ⌕ Search  | My apps                                         [ Request access to more ]   |
| ▣ My apps | +-----------+ +-----------+ +-----------+ +-----------+ +-----------+        |
| ▤ Media   | | [icon]    | | [icon]    | | [icon]    | | [icon]    | | [icon]    |        |
| ⚑ Reports | | Media     | | Photos    | | Home      | | Passwords | | Books     |        |
| ⌂ Home    | | player    | | ! unavail | |           | |           | |           |        |
| ◫ Boards  | | SSO       | | SSO       | | SSO       | | key ▸     | | SSO       |        |
|           | +-----------+ +-----------+ +-----------+ +-----------+ +-----------+        |
| « collapse|                                                                              |
+-----------+------------------------------------------------------------------------------+
```

Widgets: same as phone; drawer is pinned and collapsible.

**Frame sequence:** My apps (loading → populated | empty | error | offline) → tap tile → SSO launch → app opens in new tab/view; or tile unavailable → report a problem; or "Request access" → access-request form (owned by `access` area).

**Intents:** `apps.list` (mine), `apps.sso.launch {appId}`, `access.request {appId}`.

---

## enduser-02 App credentials

As any user I can view and rotate the managed password for apps that can't use SSO.

### Phone: credential list (Account > App credentials)

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| ‹ Account / App credentials          |
| Passwords   user: sam                |
|             ••••••••••   [ Show ]    |
|             rotated 2026-10-01       |
|             [ Rotate ]               |
|--------------------------------------|
| Books       user: sam                |
|             ••••••••••   [ Show ]    |
|             [ Rotate ]               |
+--------------------------------------+
```

Widgets: table with row actions (show, rotate). Apps signed in via SSO are not listed here.

### Phone: step-up re-auth (shared)

```text
+--------------------------------------+
| Confirm it's you                     |
| Showing a password needs your        |
| password or second factor again.     |
|                                      |
| Password  [______________]           |
|   or                                 |
| Code      [______]                   |
|                                      |
| [ Cancel ]              [ Confirm ]  |
| ! Incorrect code. Try again.         |
+--------------------------------------+
```

Widgets: form that runs an action (step-up). Shown whenever the plugin marks the action high-risk.

### Phone: revealed, rotate confirm, rotate job

```text
+------------------------------+ +------------------------------+ +------------------------------+
| Passwords   user: sam        | | Rotate Passwords password?   | | Rotating Passwords password  |
| k7#Qm2…vX9  [Copy] [Hide]    | | The app gets a new password; | | ✓ Generate new password      |
| hides in 0:30                | | signed-in sessions there may | | ◌ Set it in the app          |
|                              | | end.                         | | · Verify sign-in             |
|                              | | [ Cancel ]      [ Rotate ]   | | [ Cancel and roll back ]     |
+------------------------------+ +------------------------------+ +------------------------------+
   revealed                         confirm                         job progress

+------------------------------+ +------------------------------+
| ✓ Password rotated.          | | ! Rotation failed at "Set it |
| [ Show new password ]        | |   in the app". Rolled back;  |
|                              | |   old password still works.  |
|                              | |   [ Retry ] [ Report ]       |
+------------------------------+ +------------------------------+
   done                             failed / cancelled
```

Widgets: status tile (revealed value with copy, auto-hide), form that runs an action (rotate), job progress (steps, cancel with rollback).

States: empty ("All your apps use single sign-on."), offline (Show/Rotate disabled), error per row.

**Frame sequence:** credential list → Show → step-up → revealed; or Rotate → confirm → step-up (if marked high-risk) → job progress → done | failed/rolled back.

**Intents:** `apps.credentials.list` (mine), `apps.credentials.reveal {appId}` (step-up), `apps.credentials.rotate {appId}` → job, `jobs.cancel {jobId}`.

---

## enduser-03 Grant an app

As an app grant holder I can grant an app to a user so orca creates their account, optionally with app admin for that app.

### Phone: pick user and app

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| ‹ Grant an app                       |
| User   [ sam                     ▾ ] |
| App    [ Media player            ▾ ] |
|                                      |
| Sign-in     SSO (from app)           |
| [ ] App admin for Media player       |
|     All of this app's functions.     |
| Expires [ Never                  ▾ ] |
|                                      |
| [ Cancel ]               [ Grant ]   |
+--------------------------------------+
```

Widgets: form that runs an action (user picker, app picker, app-admin toggle, expiry). Pickers list only users and apps the viewer may grant (they must hold both the grant permission and the access). The app-admin toggle is hidden unless the viewer can grant app admin for that app.

### Phone: provisioning job, locked, permission-limited

```text
+------------------------------+ +------------------------------+ +------------------------------+
| Granting Media player to sam | | Grant an app                 | | Grant an app                 |
| ✓ Record grant               | | ⚿ sam's grants are being     | | App  [ Media player ▾ ]      |
| ✓ Create account in app      | |   edited by alex.            | |  Books is not listed: you    |
| ◌ Link SSO                   | |   You can't start a change.  | |  don't hold it.              |
| · Notify sam                 | |   [ Back ]                   | | [ ] App admin (disabled: you |
| [ Cancel and roll back ]     | |                              | |  can't grant app admin)      |
+------------------------------+ +------------------------------+ +------------------------------+
   job progress                     locked                           permission-limited
```

Widgets: job progress (cancel rolls back the created account and grant), status tile (lock).

### Desktop

```text
+------------------------------------------------------------------------------------------+
| ≡ orca   [ Search…                                                    ⌘K ]            ◔  |
+-----------+------------------------------------------------------------------------------+
| drawer    | Grant an app                                                                 |
|           | +---------------------------------+  +-------------------------------------+ |
|           | | User  [ sam               ▾ ]   |  | sam currently has                   | |
|           | | App   [ Media player      ▾ ]   |  |  Photos   SSO                       | |
|           | | [ ] App admin                   |  |  Books    managed password          | |
|           | | Expires [ Never ▾ ]             |  |                                     | |
|           | | [ Cancel ]          [ Grant ]   |  |                                     | |
|           | +---------------------------------+  +-------------------------------------+ |
+-----------+------------------------------------------------------------------------------+
```

Widgets: form that runs an action; table (the user's current app grants).

**Frame sequence:** form (or locked | permission-limited) → Grant → step-up if marked high-risk → job progress → done ("sam can now open Media player") | failed and rolled back.

**Intents:** `apps.grantable.list`, `users.list`, `apps.grant {userId, appId, appAdmin, expiresAt}` → job, `jobs.cancel {jobId}`, `lock.acquire/release {resource}`.

---

## enduser-04 Media search and request

As a media grant holder I can search, see what's already in the library and request what's missing.

### Phone: search results

```text
+--------------------------------------+
| ≡  [ dune                       ] ◔  |
+--------------------------------------+
| Filters: (All) (Movies) (TV) (Books) |
|--------------------------------------|
| [ ] Dune (2021)        Movie         |
|     ✓ In library        [ Open ]     |
| [ ] Dune: Part Two     Movie         |
|     ◌ Requested by you               |
| [ ] Dune (1984)        Movie         |
|     — Not in library   [ Request ]   |
| [ ] Dune: Prophecy     TV            |
|     ½ 4 of 6 episodes  [ Request ]   |
| [ ] Dune               Book          |
|     — Not in library   [ Request ]   |
+--------------------------------------+
```

Widgets: table with row actions (search results with in-library state, open, request). The search bar is the global palette; results only include what the viewer's grants make searchable. A media-only user sees only media.

### Phone: request form

```text
+--------------------------------------+
| ‹ Request Dune: Prophecy             |
| Seasons  [x] S1 (missing 2)          |
|          [ ] S2                      |
| Quality  [ Default              ▾ ]  |
| Note     [_____________________]     |
|                                      |
| Your requests need approval.         |
| [ Cancel ]            [ Request ]    |
+--------------------------------------+
```

Widgets: form that runs an action. The approval line reads "Your requests are approved automatically." when the user is set to auto-approve.

### Phone: submitted, empty, error, offline

```text
+------------------------------+ +------------------------------+
| ✓ Requested. Waiting for     | | No results for "dnue".       |
|   approval.                  | | Try another title.           |
|   [ View my requests ]       | |                              |
+------------------------------+ +------------------------------+
   submitted                        empty

+------------------------------+ +------------------------------+
| ! Search failed. [ Retry ]   | | ⚠ Offline. Results from      |
|                              | |   14:02; Request disabled.   |
+------------------------------+ +------------------------------+
```

### Desktop

```text
+------------------------------------------------------------------------------------------+
| ≡ orca   [ dune                                                       ⌘K ]            ◔  |
+-----------+------------------------------------------------------------------------------+
| drawer    | (All) (Movies) (TV) (Books)                                                  |
|           | +-----+ Dune (2021)          Movie  ✓ In library              [ Open ]       |
|           | +-----+ Dune: Part Two       Movie  ◌ Requested by you                       |
|           | +-----+ Dune (1984)          Movie  — Not in library          [ Request ]    |
|           | +-----+ Dune: Prophecy       TV     ½ 4 of 6 episodes         [ Request ]    |
|           |                                                                              |
|           |  Request panel opens on the right; results stay visible.                     |
+-----------+------------------------------------------------------------------------------+
```

**Frame sequence:** search → results (loading | empty | error | offline) → Request → request form → submitted → My requests (enduser-05). "Open" launches the media player app via SSO.

**Intents:** `search.query {text, filters}`, `media.request {itemId, scope, quality, note}`, `apps.sso.launch {appId, itemId}`.

---

## enduser-05 My requests

As a media grant holder I can follow my requests' status.

### Phone

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| My requests     (Open) (All)         |
|--------------------------------------|
| Dune (1984)            Movie         |
|   ● Waiting for approval   [Cancel]  |
| Dune: Prophecy S1      TV            |
|   ◌ Downloading  ▓▓▓▓░░░ 60%         |
| Foundation S3          TV            |
|   ✓ Available       [ Open ]         |
| Some Film              Movie         |
|   × Denied: "already have 4K"        |
| Other Film             Movie         |
|   ! Failed: not found                |
|     [ Report a problem ]             |
+--------------------------------------+
```

Widgets: table with row actions (status per request: waiting for approval, approved, downloading with progress, available, denied with reason, failed). Cancel is shown only while waiting for approval.

States: empty ("No requests yet. Search to request something."), loading, error, offline (last-known statuses, actions disabled). Status changes also arrive as notifications through the user's chosen channels.

**Frame sequence:** list → row → open in app | cancel | report a problem (enduser-07, prefilled).

**Intents:** `media.requests.list` (mine), `media.request.cancel {requestId}`.

---

## enduser-06 Approve media requests

As a request-approval grant holder I can approve or deny requests and set per-user auto-approve (manual by default).

### Phone: pending list

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| Requests to approve (3)              |
| (Pending) (Decided) (Users)          |
|--------------------------------------|
| Dune (1984)       Movie   sam        |
|   "for movie night"                  |
|   [ Deny ]            [ Approve ]    |
| Dune: Prophecy S1 TV      sam        |
|   [ Deny ]            [ Approve ]    |
| Big Show S1-S5    TV      kim        |
|   [ Deny ]            [ Approve ]    |
+--------------------------------------+
```

Widgets: table with row actions (approve, deny).

### Phone: deny reason, per-user setting

```text
+------------------------------+ +------------------------------+
| Deny Dune (1984)?            | | Users        Approval        |
| Reason (sent to sam)         | | sam   [ Manual        ▾ ]   |
| [____________________]       | | kim   [ Manual        ▾ ]   |
| [ Cancel ]       [ Deny ]    | | lee   [ Auto-approve  ▾ ]   |
+------------------------------+ | New users start on Manual.   |
                                 +------------------------------+
```

Widgets: form that runs an action (deny with reason); table with row actions (per-user approval mode select).

States: empty ("Nothing waiting."), already decided by another approver ("Approved by alex at 14:05", row read-only), locked ("sam's approval setting is being edited by alex"), offline (buttons disabled), permission-limited (no Users tab without the grant to change approval settings).

### Desktop

```text
+------------------------------------------------------------------------------------------+
| ≡ orca   [ Search…                                                    ⌘K ]            ◔  |
+-----------+------------------------------------------------------------------------------+
| drawer    | Requests to approve (3)                     (Pending) (Decided) (Users)      |
|           | [x] Dune (1984)        Movie  sam  "for movie night"    [Deny] [Approve]     |
|           | [x] Dune: Prophecy S1  TV     sam                       [Deny] [Approve]     |
|           | [ ] Big Show S1-S5     TV     kim                       [Deny] [Approve]     |
|           | 2 selected                          [ Deny selected ] [ Approve selected ]   |
+-----------+------------------------------------------------------------------------------+
```

Widgets: table with row actions and multi-select.

**Frame sequence:** pending list (or empty) → approve | deny → reason → row moves to Decided; Users tab → set mode per user.

**Intents:** `media.requests.list {status: pending}`, `media.request.approve {requestId}`, `media.request.deny {requestId, reason}`, `media.approval.set {userId, mode}`, `lock.acquire/release`.

---

## enduser-07 Report a problem

As any user I can report a problem and follow it (received, being fixed, fixed) until notified it is resolved.

### Phone: report form

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| ‹ Report a problem                   |
| What's wrong?                        |
|  ( ) An app won't open               |
|  (•) Something won't play            |
|  ( ) A request is stuck              |
|  ( ) Something else                  |
| About   [ Foundation S3          ▾ ] |
| Details [_______________________]    |
|         [_______________________]    |
| [ Cancel ]              [ Send ]     |
+--------------------------------------+
```

Widgets: form that runs an action. Problem types come from orca; "About" lists items the reporter can see.

### Phone: status tracker

```text
+--------------------------------------+
| My problem reports                   |
|--------------------------------------|
| Foundation S3 won't play             |
|  ●────────○────────○                 |
|  Received  Being    Fixed            |
|            fixed                     |
|  Sent 14:10                          |
|--------------------------------------|
| Photos won't open                    |
|  ●────────●────────●                 |
|  Fixed 09:32. You were notified.     |
+--------------------------------------+
```

Widgets: table of reports, each with a status tile (three-step tracker: received, being fixed, fixed).

States: sent confirmation ("Received. You'll be notified when it's fixed."), empty ("No reports."), error on send (input kept, Retry), offline (Send disabled, form kept).

**Frame sequence:** entry point (drawer, unavailable app tile, failed request) → form → sent → tracker → notification on fixed.

**Intents:** `problems.types.list`, `problems.report {type, subjectId, details}`, `problems.list` (mine).

---

## enduser-08 Problem-report handling

As a report-settings grant holder I can set per problem type: notify an admin, admin-approved auto-fix, or auto-fix.

### Phone

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| ‹ Problem report handling            |
|--------------------------------------|
| An app won't open                    |
|  [ Admin approves auto-fix      ▾ ]  |
| Something won't play                 |
|  [ Auto-fix                     ▾ ]  |
| A request is stuck                   |
|  [ Auto-fix                     ▾ ]  |
| Something else                       |
|  [ Notify an admin              ▾ ]  |
|   No known fix: notify only.         |
+--------------------------------------+
```

Picker options: Notify an admin · Admin approves auto-fix · Auto-fix. Types with no known fix offer only "Notify an admin".

Widgets: table with row actions (handling select per problem type).

States: locked ("Problem report handling is being edited by alex"), saved inline confirmation, error on save (value reverts, message), offline (selects disabled), permission-limited (read-only selects).

**Frame sequence:** list → change handling → saved. Lock taken when the screen is opened for editing; released on leave or inactivity timeout.

**Intents:** `problems.handling.list`, `problems.handling.set {type, mode}`, `lock.acquire/release`.

---

## enduser-09 Home control

As a home grant holder I can control Home Assistant entities from their dashboards or any dashboard.

### Phone: room dashboard

```text
+--------------------------------------+
| ≡  [ Search…                    ] ◔  |
+--------------------------------------+
| Living room                       ✎  |
| +-----------------+ +--------------+ |
| | ◉ Lamp     ON   | | ◯ Ceiling OFF| |
| | ▓▓▓▓▓░░ 70%     | |              | |
| +-----------------+ +--------------+ |
| +-----------------+ +--------------+ |
| | ▶ Apple TV      | | 21.5°  Heat  | |
| | Playing         | | [-]  22  [+] | |
| | [⏮] [⏸] [⏭]     | |              | |
| +-----------------+ +--------------+ |
| +----------------------------------+ |
| | Front door  ⚿ Locked  [Unlock]   | |
| +----------------------------------+ |
+--------------------------------------+
```

Widgets: status tiles with controls (toggle, level slider, media transport, setpoint stepper, lock). `✎` edits the dashboard; any entity widget can also be added to any other dashboard.

### Phone: actuating, unavailable, step-up, permission-limited, offline

```text
+------------------------------+ +------------------------------+ +------------------------------+
| ◉ Lamp   ◌ turning on…       | | ◯ Ceiling  ! Unavailable     | | Unlock Front door?           |
|  (control busy until HA      | |  Last seen 13:50.            | | Confirm it's you.            |
|   reports the new state)     | |  (controls disabled)         | | Code [______]                |
+------------------------------+ +------------------------------+ | [ Cancel ]   [ Confirm ]     |
   actuating                        entity unavailable             +------------------------------+
                                                                      step-up (plugin marks high-risk)

+------------------------------+ +------------------------------+
| ⚿ Front door  Locked         | | ⚠ Offline. State from 14:02. |
|  View only                   | |  ◉ Lamp ON (70%)  [disabled] |
+------------------------------+ +------------------------------+
   permission-limited               offline
```

States: actuation failed ("Lamp didn't respond. [Retry]", tile shows the real reported state).

### Desktop

```text
+------------------------------------------------------------------------------------------+
| ≡ orca   [ Search…                                                    ⌘K ]            ◔  |
+-----------+------------------------------------------------------------------------------+
| drawer    | Living room                                                          ✎ Edit  |
|           | +--------------+ +--------------+ +---------------------+ +--------------+   |
|           | | ◉ Lamp  ON   | | ◯ Ceiling OFF| | ▶ Apple TV  Playing | | 21.5° Heat   |   |
|           | | ▓▓▓▓▓░░ 70%  | |              | | [⏮] [⏸] [⏭]         | | [-] 22 [+]   |   |
|           | +--------------+ +--------------+ +---------------------+ +--------------+   |
|           | +----------------------------------+                                         |
|           | | Front door  ⚿ Locked  [Unlock]   |                                         |
|           | +----------------------------------+                                         |
+-----------+------------------------------------------------------------------------------+
```

**Frame sequence:** home dashboard (or search "lamp" → entity result with inline toggle) → act → actuating → new state | failed | step-up first for high-risk actions.

**Intents:** `dashboard.get {dashboardId}`, `entity.action {entityId, action, params}`, state updates pushed by the server.

---

## enduser-10 Kiosk device sign-in

As a device grant holder I can sign a wall tablet or TV in as a limited device account via short code, QR or notification approval.

### Device screen (tablet/TV)

```text
+------------------------------------------------------------------------------------------+
|                                                                                          |
|                              Sign this display in to orca                                |
|                                                                                          |
|        +-----------+                                                                     |
|        | ▓▓ ░░ ▓▓  |        Scan with your phone,                                        |
|        | ░▓ ▓░ ░▓  |        or enter this code in orca:                                  |
|        | ▓▓ ░▓ ▓▓  |                                                                     |
|        +-----------+                 K7Q-4MX                                             |
|                                                                                          |
|                              Code expires in 4:52   [ New code ]                         |
|                              Waiting for approval…                                       |
+------------------------------------------------------------------------------------------+
```

Widgets: status tile (code + QR, countdown). Expired state: "Code expired. [ New code ]".

### Phone: approver side

```text
+------------------------------+ +--------------------------------------+
| 🔔 A display wants to sign   | | ‹ Sign in a display                  |
|    in: K7Q-4MX               | | Code      [ K7Q-4MX ]                |
|    [ Review ]                | | Name      [ Kitchen tablet      ]    |
+------------------------------+ | Dashboard [ Kitchen             ▾ ]  |
   notification                  | Grants    [ Device: Kitchen     ▾ ]  |
                                 |  Only what this display needs.       |
                                 | [ Deny ]               [ Approve ]   |
                                 +--------------------------------------+
                                    approve (from QR, code entry or notification)
```

Widgets: form that runs an action. Grant choices are bounded by what the approver holds and may grant.

States: invalid code ("No display is waiting with that code."), expired, denied (device shows "Sign-in was denied"), step-up if the plugin marks device sign-in high-risk, signed in (device switches to enduser-11; approver sees "Kitchen tablet is signed in").

**Frame sequence:** device shows code/QR → approver scans QR | enters code | taps notification → approve form → (step-up) → device signed in → kiosk display.

**Intents:** `device.signin.start` (device), `device.signin.approve {code, name, dashboardId, grants}`, `device.signin.deny {code}`.

---

## enduser-11 Kiosk display

As a device account I show one dashboard full-screen and always on.

### Tablet/TV: full screen

```text
+------------------------------------------------------------------------------------------+
| Kitchen                                                                  14:32  Thu 26   |
| +--------------------+ +--------------------+ +--------------------+ +-----------------+ |
| | ◉ Kitchen lights   | | ◯ Hood fan         | | 21.5° Heat         | | ▶ Now playing   | |
| |    ON 80%          | |    OFF             | | [-]  22  [+]       | |  [⏸]            | |
| +--------------------+ +--------------------+ +--------------------+ +-----------------+ |
| +--------------------------------------------+ +---------------------------------------+ |
| | Media requests ready                       | | Front door  ⚿ Locked                  | |
| |  Foundation S3  ✓ Available                | |  (view only)                          | |
| +--------------------------------------------+ +---------------------------------------+ |
+------------------------------------------------------------------------------------------+
```

No drawer, no search, no account menu. Widgets: whatever the assigned dashboard contains (status tiles with controls, tables); controls follow each widget's rules for the device account.

### Offline: last-known state

```text
+------------------------------------------------------------------------------------------+
| Kitchen                         ⚠ Offline since 14:02 · reconnecting…    14:32  Thu 26   |
| +--------------------+ +--------------------+ +--------------------+                     |
| | ◉ Kitchen lights   | | ◯ Hood fan         | | 21.5° Heat         |   (controls         |
| |    ON 80%  ░       | |    OFF  ░          | | [-]  22  [+]  ░    |    disabled)        |
| +--------------------+ +--------------------+ +--------------------+                     |
+------------------------------------------------------------------------------------------+
```

States: reconnecting transparently to another orca system in the mesh (no visible change), device signed out or revoked (returns to the enduser-10 sign-in screen), dashboard removed ("No dashboard assigned. Ask an admin to assign one.").

**Frame sequence:** signed in → full-screen dashboard → offline (last-known) → back online; revoked → sign-in screen.

**Intents:** `dashboard.get {dashboardId}` (device session), server-pushed state updates, `entity.action` where the widget allows the device account to control it.

---

## Open questions

1. App tiles: does orca expose a category/generic for each app (e.g. "media player") on the tile, or the plugin's app name?
2. SSO launch: opens in a new browser tab, in-app webview on mobile, or both by platform?
3. Managed password reveal: auto-hide timeout value, and is copy-to-clipboard allowed without a reveal?
4. Rotating a managed password: does it end the user's sessions in the app, and does it need step-up by default?
5. Grant an app: which apps support "app admin", and does orca list that per app?
6. Media request form: which options exist (seasons, quality, language) and do they come from the plugin generic?
7. Can a requester cancel after approval? Can approvers edit a request (e.g. quality) before approving?
8. Approvals: bulk approve/deny, and is there an approval history view with who decided?
9. What happens when two approvers act at once beyond "already decided by X"?
10. Problem types: who defines the list (plugins via generics, admins, both), and is "Something else" always present?
11. Does the reporter see who is fixing the problem or any detail beyond received / being fixed / fixed?
12. Problem handling with "admin approves auto-fix": does this reuse the remediation approval flow in `ops`?
13. Home control: which entity actions does the Home Assistant plugin mark high-risk (locks, alarms, garage)?
14. Kiosk: code length/format and expiry; does the device account get a default device grant group?
15. Kiosk: can a device show more than one dashboard (rotation), and is there a way to exit kiosk on the device itself?
16. Kiosk: screen-dimming/always-on behavior is a device setting or a dashboard setting?
17. Does "Report a problem" exist on kiosk displays?
18. Intent names here are placeholders; the actual orca operation names need confirming against the API.
