# Access & identity — wireframes

Low-fidelity wireframes for every `access` flow in `docs/flows/INDEX.md`. Each flow shows the phone frame (about 40 columns) first, then desktop (about 90 columns) where the layout differs. Every screen is an orca JSON dashboard or widget. Plugins and orca declare what is shown; each UI decides how to render it. Widget kinds named under each frame are the generic kinds from the interview: status tile, chart, table (with row actions), form (runs an action), log stream, console, topology graph. Where a frame needs a building block the interview does not list (for example a QR image or a one-time secret reveal), it appears in Open questions and is not treated as a settled widget kind.

Intent names that already exist in the orca API (`docs/analysis/story-gaps.md`) are written as-is. Intents with no API today are marked `(no API)`.

Shared chrome (signed-in screens):

```text
Phone                                    Desktop
+--------------------------------------+ +----------------------------------------------------------------------------------------+
| [=]  [ Search orca...           ] (o)| | [<] orca        [ Search orca... (Ctrl K)                              ]  mesh: home (o)|
+--------------------------------------+ +-------------+--------------------------------------------------------------------------+
|                                      | | Search      |                                                                          |
|  (screen body)                       | | Dashboards  |  (screen body)                                                           |
|                                      | | ...         |                                                                          |
+--------------------------------------+ | Account     |                                                                          |
                                         +-------------+--------------------------------------------------------------------------+
[=] opens the drawer. (o) is the account avatar. The drawer lists only what the user's grants allow.
On desktop the drawer is collapsible ([<]). The search bar is also the command palette.
```

Drawer (phone, open):

```text
+--------------------------------------+
| orca                  mesh: home  [v]|
|--------------------------------------|
| Search                               |
| My dashboards                        |
| Shared dashboards                    |
| Requests                             |
| -- shown only with matching grants --|
| Users & access                       |
|   Users                              |
|   Groups                             |
|   Sign-up approvals             (2)  |
|   Access requests               (1)  |
|   Who has what                       |
|   API tokens                         |
|--------------------------------------|
| Account                              |
| Sign out                             |
+--------------------------------------+
```

Shared state frames used across flows (referenced by name below):

```text
[LOADING]                         [ERROR]                           [OFFLINE]
+--------------------------------+ +--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | [=] [ Search...           ] (o)| | [=] [ Search...           ] (o)|
|--------------------------------| |--------------------------------| | ! Disconnected. Last known     |
| ░░░░░░░░░░░░░░░░               | | Could not load users.          | |   state from 14:02. Controls   |
| ░░░░░░░░░░                     | | orca: <error message>          | |   disabled.                    |
| ░░░░░░░░░░░░░░░░░░░            | |               [ Retry ]        | |--------------------------------|
+--------------------------------+ +--------------------------------+ | (last known content)           |
                                                                      | [ Approve ] (disabled)         |
                                                                      +--------------------------------+
[SESSION EXPIRED]                 [PERMISSION-LIMITED]               [LOCKED]
+--------------------------------+ +--------------------------------+ +--------------------------------+
| Your session ended.            | | You don't hold the grant for   | | Being edited by Dana.          |
| Sign in again to continue.     | | this. [ Request access ]       | | You can view; changes are off  |
| Your input is kept.            | | (or control hidden, per the    | | until the lock is released or  |
| Password [            ]        | |  widget's visibility rule)     | | times out.                     |
| [ Sign in ]                    | +--------------------------------+ +--------------------------------+
+--------------------------------+
[STEP-UP]  see access-04.           [JOB]
                                  +--------------------------------+
                                  | Provisioning Ana       2 / 4   |
                                  | [x] Create orca account        |
                                  | [x] Create app accounts        |
                                  | [>] Create VPN invite          |
                                  | [ ] Apply grants               |
                                  | [ Cancel and roll back ]       |
                                  +--------------------------------+
```

---

## access-01 First-run setup

The first person enters the one-time code printed in the setup logs, creates the first account and receives the super grant.

Phone:

```text
01a Setup code                     01a' Invalid / expired code
+--------------------------------+ +--------------------------------+
|            orca                |  |            orca                |
|                                |  |                                |
| Set up this mesh               |  | Set up this mesh               |
| Enter the one-time code from   |  | Enter the one-time code from   |
| the setup logs.                |  | the setup logs.                |
|                                |  |                                |
| Code [ _ _ _ _ _ _ ]           |  | Code [ A 7 Q 2 9 X ]           |
|                                |  | ! Code is invalid or expired.  |
| [ Continue ]                   |  |   Check the latest setup logs. |
+--------------------------------+  | [ Continue ]                   |
                                    +--------------------------------+
01b Create account                 01c Enroll TOTP
+--------------------------------+ +--------------------------------+
| Create the first account       | | Add an authenticator           |
| This account holds the super   | | Scan with an authenticator app |
| grant.                         | |   +-----------+                |
| Name     [                 ]   | |   |  [QR]     |                |
| Username [                 ]   | |   +-----------+                |
| Email    [                 ]   | | Or enter: JBSW Y3DP EHPK 3PXP  |
| Password [                 ]   | | Code [ _ _ _ _ _ _ ]           |
| Confirm  [                 ]   | | ! Code does not match (error)  |
| ! Passwords don't match        | | [ Verify ]                     |
| [ Create account ]             | +--------------------------------+
+--------------------------------+
01d Done
+--------------------------------+
| Setup complete                 |
| You hold the super grant.      |
| [ Go to search ]               |
+--------------------------------+
```

Desktop: same forms in a centered card (about 40 columns wide) on an empty page; no drawer or search bar until setup completes.

Widgets: form (code), form (create account), form (TOTP verify; QR image, see Open questions), status tile (done).

Frame sequence: 01a -> (01a' on failure) -> 01b -> 01c -> 01d -> search (nav).
Intents: `auth/web/signup_status` (decides whether setup is shown), `auth/web/signup` with setup code, TOTP enroll + verify `(no API)`.

---

## access-02 Sign in

Phone:

```text
02a Sign in                        02a' Wrong credentials
+--------------------------------+ +--------------------------------+
|            orca                | |            orca                |
| Mesh: home              [v]    | | Mesh: home              [v]    |
| Username [                 ]   | | Username [ scott           ]   |
| Password [                 ]   | | Password [                 ]   |
| [ Sign in ]                    | | ! Username or password is      |
|                                | |   incorrect.                   |
| Invited? Open your invite link.| | [ Sign in ]                    |
| [ Sign up ]  (if enabled)      | +--------------------------------+
+--------------------------------+
02b Second factor                  02c Locked out
+--------------------------------+ +--------------------------------+
| Authenticator code             | | Sign-in is locked              |
| [ _ _ _ _ _ _ ]                | | Too many failed attempts.      |
| [ Verify ]                     | | Try again in 14:32.            |
| Use another factor        [v]  | | [ Sign in ] (disabled)         |
+--------------------------------+ +--------------------------------+
02d Mesh picker (several meshes connected)
+--------------------------------+
| Choose a mesh                  |
| ( ) home       signed out      |
| ( ) parents    signed in       |
| [ Continue ]                   |
+--------------------------------+
```

Desktop: same card centered. The mesh selector is a dropdown above the form.

Widgets: form (sign in), form (second factor), status tile (lockout countdown), form (mesh picker).

Frame sequence: (02d if several meshes) -> 02a -> (02a' | 02c) -> 02b -> search.
Intents: `auth/web/signin`, second-factor verify `(no API)`, lockout state from `auth/web/signin` response.

---

## access-03 Sign out

```text
03a Confirm (from drawer)          03b Signed out
+--------------------------------+ +--------------------------------+
| Sign out of this device?       | |            orca                |
| Other sessions stay signed in. | | You are signed out.            |
| [ Cancel ]   [ Sign out ]      | | [ Sign in ]                    |
+--------------------------------+ +--------------------------------+
```

Desktop: 03a is a small modal over the current screen.

Widgets: form (confirm), status tile.

Frame sequence: drawer -> 03a -> 03b.
Intents: `auth/web/signout`.

---

## access-04 Step-up re-auth

Shown whenever a plugin marks the action high-risk. The original action is held, not sent, until re-auth succeeds.

```text
04a Prompt                         04b Failure
+--------------------------------+ +--------------------------------+
| Confirm it's you               | | Confirm it's you               |
| "Delete user Ana" needs your   | | "Delete user Ana" needs your   |
| password or second factor.     | | password or second factor.     |
| Password [                 ]   | | Password [                 ]   |
|   or                           | | ! Incorrect. 2 attempts left.  |
| Code     [ _ _ _ _ _ _ ]       | | [ Cancel ]   [ Confirm ]       |
| [ Cancel ]   [ Confirm ]       | +--------------------------------+
+--------------------------------+
04c Cancelled: modal closes, action not sent, original screen unchanged.
```

Phone: full-height sheet from the bottom. Desktop: centered modal.

Widgets: form (re-auth).

Frame sequence: action -> 04a -> (04b) -> action proceeds | 04c.
Intents: step-up verify `(no API)`, then the original action intent.

---

## access-05 Second-factor enrollment

```text
05a Factor list                    05b Add TOTP
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Second factors               |
| < Account                      | | Scan with an authenticator app |
| Second factors                 | |   +-----------+                |
|--------------------------------| |   |  [QR]     |                |
| Authenticator app    Added 3/2 | |   +-----------+                |
|                    [ Remove ]  | | Or enter: JBSW Y3DP EHPK 3PXP  |
|--------------------------------| | Name [ Phone           ]       |
| [ + Add authenticator ]        | | Code [ _ _ _ _ _ _ ]           |
| Passkeys, push and email codes | | [ Verify ]                     |
| are listed as orca adds them.  | +--------------------------------+
+--------------------------------+
05c Remove factor -> step-up (access-04) -> list without it.
05d Empty: "No second factor. Add one to protect your account." [ + Add authenticator ]
05e Removing the last factor: see Open questions.
```

Desktop: list on the left half, add form on the right half of the account page section.

Widgets: table (factors, row action Remove), form (enroll + verify).

Frame sequence: 05a -> 05b -> 05a; 05a -> Remove -> 04a -> 05a.
Intents: factor list / enroll / verify / remove `(no API)`.

---

## access-06 Change password

```text
06a Form                           06b Success
+--------------------------------+ +--------------------------------+
| < Account                      | | < Account                      |
| Change password                | | Password changed.              |
| Current  [                 ]   | | Other sessions: see Sessions.  |
| New      [                 ]   | +--------------------------------+
| Confirm  [                 ]   |
| ! Current password incorrect   |
| ! New passwords don't match    |
| [ Change password ]            |
+--------------------------------+
```

Desktop: section on the account page (access-20).

Widgets: form.

Frame sequence: 06a -> 06b.
Intents: `auth/web/change_password`.

---

## access-07 Sessions and devices

```text
07a List                           07b End session
+--------------------------------+ +--------------------------------+
| < Account                      | | End session on "iPad, Safari"? |
| Sessions and devices           | | [ Cancel ]   [ End session ]   |
|--------------------------------| +--------------------------------+
| * This device                  |
|   Mac, Firefox   active now    |
|--------------------------------|
|   iPad, Safari   2h ago        |
|              [ End session ]   |
|   CLI token login  3d ago      |
|              [ End session ]   |
|--------------------------------|
| [ End all other sessions ]     |
+--------------------------------+
```

Desktop:

```text
+------------------------------------------------------------------------------------------+
| Sessions and devices                                      [ End all other sessions ]     |
| Device              Client      Last active   Location/addr                              |
| * This device Mac   Firefox     now           (as orca reports)                          |
|   iPad              Safari      2h ago                                  [ End session ]  |
|   CLI               orca cli    3d ago                                  [ End session ]  |
+------------------------------------------------------------------------------------------+
```

Empty: only "This device" row. Offline: list last known, End buttons disabled.

Widgets: table (row action End session), form (confirm).

Frame sequence: 07a -> 07b -> 07a.
Intents: `auth.session.list`, `auth.session.*` revoke (one / all others).

---

## access-08 Invite a user

Invite-grant holder only. Attached groups/grants are limited to what the inviter holds and may grant.

```text
08a Invite form                    08b Delivery
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Invite                       |
| < Users                        | | Send through                   |
| Invite a person                | | (*) Copy invite (default)      |
| Name     [                 ]   | | ( ) orca cloud                 |
| Contact  [                 ]   | | ( ) <other channel plugins>    |
| Groups   [ Media users  x ][+] | | [ Send invite ]                |
| Grants   [ + Add grant     ]   | +--------------------------------+
| Remote access                  |
| [x] VPN access (via VPN plugin)|
| Expires  [ 7 days        v]    |
| Nothing attached = assign later|
| [ Next ]                       |
+--------------------------------+
08c Copy (default channel)         08d Sent (other channel)
+--------------------------------+ +--------------------------------+
| Invite ready                   | | Invite sent to Ana through     |
| Send this to Ana:              | | orca cloud.                    |
| +----------------------------+ | | Expires in 7 days.             |
| | <invite content from orca> | | | [ Done ]                       |
| +----------------------------+ | +--------------------------------+
| [ Copy ]                       |
+--------------------------------+
08e Group/grant the inviter cannot grant: shown disabled with "You don't hold this grant."
08f No VPN plugin installed: VPN row disabled, "No VPN service on this mesh."
```

Desktop: form and delivery on one page, two columns (details left, groups/grants/VPN right), delivery below.

Widgets: form (invite), form (channel pick), status tile (result / copyable content).

Frame sequence: 08a -> 08b -> 08c | 08d.
Intents: invite create `(no API)`, delivered via the notification channel chosen.

---

## access-09 Accept an invite

```text
09a Invite landing                 09a' Invalid / expired
+--------------------------------+ +--------------------------------+
|            orca                | |            orca                |
| Scott invited you to "home".   | | This invite is invalid or has  |
| You'll get: Media users        | | expired. Ask the person who    |
|             VPN access         | | invited you for a new one.     |
| [ Accept ]                     | +--------------------------------+
+--------------------------------+
09b Create account                 09c Provisioning (job)
+--------------------------------+ +--------------------------------+
| Create your account            | | Setting up your access  2 / 4  |
| Username [                 ]   | | [x] Account created            |
| Password [                 ]   | | [x] App accounts               |
| Confirm  [                 ]   | | [>] VPN access                 |
| [ Create account ]             | | [ ] Grants                     |
+--------------------------------+ | ! Step failed: <error>  (err)  |
                                   +--------------------------------+
09d Done
+--------------------------------+
| You're in.                     |
| VPN: <next step from plugin>   |
| [ Add authenticator ] [ Skip ] |
| [ Go to search ]               |
+--------------------------------+
```

Desktop: centered card, same steps.

Widgets: status tile (invite summary), form (create account), job progress, status tile (done).

Frame sequence: 09a -> (09a') -> 09b -> 09c -> 09d -> (access-05) -> search.
Intents: invite accept + signup `(no API)`, job progress subscription.

---

## access-10 Self sign-up

```text
10a Sign-up form                   10b Pending approval
+--------------------------------+ +--------------------------------+
|            orca                | |            orca                |
| Request an account on "home"   | | Waiting for approval           |
| Name     [                 ]   | | Someone with the approval      |
| Username [                 ]   | | grant will review it. You'll   |
| Email    [                 ]   | | be notified.                   |
| Password [                 ]   | | [ Sign out ]                   |
| Why?     [                 ]   | +--------------------------------+
| [ Request account ]            |
+--------------------------------+
10c Approved -> sign in -> search (shows what the assigned grants allow).
10d Denied: "Your request was declined." [ Back ]
10e Sign-up disabled: sign-up link hidden on 02a.
```

Widgets: form, status tile.

Frame sequence: 02a -> 10a -> 10b -> 10c | 10d.
Intents: `auth/web/signup`, `auth/web/signup_status`.

---

## access-11 Approve sign-ups

```text
11a Pending list                   11b Detail / approve
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Sign-ups                     |
| Sign-up approvals (2)          | | Ana Lee   ana@...   2h ago     |
|--------------------------------| | "Friend of Scott, wants Plex"  |
| Ana Lee        2h ago        > | | Groups [ Media users  x ][+]   |
| Bo Park        1d ago        > | | Grants [ + Add grant     ]     |
|                                | | Expiry [ none          v]      |
+--------------------------------+ | [ Deny ]   [ Approve ]         |
                                   +--------------------------------+
11c Empty: "No pending sign-ups."
11d Deny: confirm with optional reason -> list.
```

Desktop:

```text
+-------------+------------------------------+---------------------------------------------+
| (drawer)    | Sign-up approvals (2)        | Ana Lee   ana@...   2h ago                  |
|             | > Ana Lee        2h ago      | "Friend of Scott, wants Plex"               |
|             |   Bo Park        1d ago      | Groups [ Media users x ][+]  Expiry [none v]|
|             |                              | [ Deny ]                     [ Approve ]    |
+-------------+------------------------------+---------------------------------------------+
```

Widgets: table (row actions Approve/Deny), form (approve with groups/grants/expiry).

Frame sequence: 11a -> 11b -> 11a.
Intents: sign-up list / approve / deny `(no API)`.

---

## access-12 Users list and detail

```text
12a List                           12b Detail
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Users                        |
| Users                [Invite]  | | Ana Lee          active        |
| [ Filter: group / grant / st v]| |--------------------------------|
|--------------------------------| | Groups   Media users           |
| Ana Lee     Media users      > | | Grants   plex.use (mesh)       |
| Bo Park     pending          > | |          ha.lights (machine)   |
| Scott Key   super            > | |          exp. 12/26            |
| Dana        disabled (29d)   > | | App accounts                   |
+--------------------------------+ |   Plex      SSO                |
                                   |   Komga     managed password   |
                                   | Sessions  2 active             |
                                   | [ Edit access ] [ Remove user ]|
                                   +--------------------------------+
```

Desktop:

```text
+-------------+----------------------------------------+-----------------------------------+
| (drawer)    | Users  [ Filter v ]           [Invite] | Ana Lee   active                  |
|             | Name        Groups        Status       | Groups / Grants / App accounts    |
|             | > Ana Lee   Media users   active       | Sessions (2)                      |
|             |   Bo Park   -             pending      | [ Edit access ] [ Remove user ]   |
|             |   Scott     super         active       |                                   |
+-------------+----------------------------------------+-----------------------------------+
```

States: empty filter result "No users match"; LOCKED on detail when another holder is editing; buttons hidden/disabled per grants.

Widgets: table (filters, row navigation), status tiles (detail sections), table (grants, app accounts).

Frame sequence: 12a -> 12b -> access-13 | access-18.
Intents: user list / get `(no API beyond auth/web/me)`.

---

## access-13 Grant and revoke access

```text
13a Grants on a user               13b Add grant
+--------------------------------+ +--------------------------------+
| < Ana Lee                      | | < Ana Lee                      |
| Access                         | | Add grant                      |
|--------------------------------| | Grant  [ Search grants... ]    |
| plex.use      mesh   [Revoke]  | |   plex.use                     |
| ha.lights     loki   [Revoke]  | |   plex.admin   (you don't hold)|
|               exp. 12/26       | | Scope  (*) Whole mesh          |
| Media users   group  [Remove]  | |        ( ) Machine [ loki v]   |
|--------------------------------| |        ( ) Resource [      v]  |
| [ + Add grant ] [ + Add group ]| | Expiry ( ) None (*) On [date]  |
+--------------------------------+ | [ Grant ]                      |
                                   +--------------------------------+
13c Blocked: selecting a grant you hold but may not grant, or don't hold:
| ! You need both the permission to grant and plex.admin itself. |
[ Grant ] disabled. [ Request access ] (access-16).
13d Revoke: confirm -> list. Step-up if the grant is marked high-risk.
```

Desktop: grants table full width; add-grant opens a side panel.

Widgets: table (row actions Revoke/Remove), form (grant picker, scope picker, expiry).

Frame sequence: 12b -> 13a -> 13b -> (13c) -> 13a; 13a -> Revoke -> (04a) -> 13a.
Intents: `access.grant`, `access.revoke` (API exists per story-gaps; exact names in Open questions).

---

## access-14 Groups

```text
14a Group list                     14b Editor
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Groups                       |
| Groups              [+ New]    | | Name [ Media users      ]      |
|--------------------------------| | Grants                         |
| Media users   4 grants  9 ppl >| |  plex.use       [x]            |
| Home control  3 grants  2 ppl >| |  requests.media [x]            |
| -- Default (from plugins) --   | |  [ + Add grant ]               |
| media.viewer  plex   read-only>| | Members  Ana, Bo  [ + Add ]    |
+--------------------------------+ | [ Delete ]   [ Save ]          |
                                   +--------------------------------+
14c Default group: fields read-only, "Defined by the plex plugin." no Delete/Save.
14d LOCKED: "Being edited by Dana."
14e Delete: confirm lists members who lose access -> step-up if marked high-risk.
14f Empty: "No groups. Default groups appear when plugins define them."
```

Widgets: table, form (group editor).

Frame sequence: 14a -> 14b -> 14a.
Intents: group list / create / update / delete `(no API)`.

---

## access-15 Who has what

```text
15a Pick resource                  15b Breakdown
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Who has what                 |
| Who has what                   | | Plex on mimir                  |
| Resource [ Search...      ]    | |--------------------------------|
|  Plex on mimir                 | | Ana    plex.use  via Media usrs|
|  loki (machine)                | | Bo     plex.use  direct, exp.  |
|  whole mesh                    | | Scott  super                   |
+--------------------------------+ | token ci-bot  plex.use         |
                                   +--------------------------------+
15c Empty: "Nobody but super-grant holders has access."
```

Desktop: resource picker left, breakdown table right with columns Principal, Grant, Via, Scope, Expiry.

Widgets: form (resource picker), table (principals; row action opens access-13 for that principal).

Frame sequence: 15a -> 15b -> (access-13).
Intents: who-has-what query `(no API)`.

---

## access-16 Request more access

```text
16a Request form                   16b My requests
+--------------------------------+ +--------------------------------+
| < Account                      | | < Account                      |
| Request access                 | | My requests                    |
| What [ Search apps/grants... ] | |--------------------------------|
|   Home Assistant               | | Home Assistant   pending       |
| Why  [                   ]     | | Komga            approved      |
| [ Send request ]               | | Plex admin       denied        |
+--------------------------------+ +--------------------------------+
16c Empty: "No requests yet."
16d Duplicate: "You already have a pending request for this."
```

Widgets: form, table.

Frame sequence: 20 (account) -> 16a -> 16b; also entered from any PERMISSION-LIMITED frame.
Intents: access request create / list `(no API)`.

---

## access-17 Decide access requests

```text
17a Inbox                          17b Detail
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < Access requests              |
| Access requests (1)            | | Bo Park wants Home Assistant   |
|--------------------------------| | "To turn on the porch light"   |
| Bo   Home Assistant  1h      > | | Grant  [ ha.use         v]     |
+--------------------------------+ | Scope  [ Resource: HA     v]   |
                                   | Expiry [ none           v]     |
                                   | [ Deny ]   [ Approve ]         |
                                   +--------------------------------+
17c Approver lacks the grant: Approve disabled, "You don't hold ha.use."
17d Empty: "No access requests."
```

Desktop: list/detail split as in access-11.

Widgets: table, form.

Frame sequence: 17a -> 17b -> 17a.
Intents: access request list / approve / deny `(no API)`.

---

## access-18 Offboard a user

```text
18a Removal preview                18b Disabled, pending deletion
+--------------------------------+ +--------------------------------+
| < Ana Lee                      | | < Users                        |
| Remove Ana Lee                 | | Ana Lee   disabled             |
| These are disabled now and     | | Deleted in 29 days.            |
| deleted after the retention    | | [ Restore ]                    |
| period:                        | +--------------------------------+
|  App accounts   Plex, Komga    |
|  VPN access     tailscale node |
|  Sessions       2              |
|  Tokens         1              |
| [ Cancel ]   [ Remove ]        |
+--------------------------------+
18a -> Remove -> step-up (04a) -> job (disable each item, Cancel and roll back) -> 18b.
18c Restore: confirm -> job re-enabling items -> user active.
```

Widgets: table (preview items), form (confirm), job progress, status tile.

Frame sequence: 12b -> 18a -> 04a -> JOB -> 18b -> (18c).
Intents: offboard preview / execute / restore `(no API)`.

---

## access-19 API tokens

```text
19a Token list                     19b Create
+--------------------------------+ +--------------------------------+
| [=] [ Search...           ] (o)| | < API tokens                   |
| API tokens          [+ New]    | | Name   [ ci-bot           ]    |
|--------------------------------| | Grants [ + Add grant ]         |
| ci-bot   plex.use   3d ago  [R]| |   (limited to what you hold    |
| backup   backup.run never   [R]| |    and may grant)              |
+--------------------------------+ | Expiry [ 90 days        v]     |
                                   | [ Create token ]               |
                                   +--------------------------------+
19c One-time secret                19d Revoke
+--------------------------------+ +--------------------------------+
| Token created                  | | Revoke "ci-bot"? Anything using|
| Copy it now. It won't be shown | | it stops working.              |
| again.                         | | [ Cancel ] [ Revoke ]          |
| [ orca_xxxxxxxxxxxxxxxxxxx ]   | +--------------------------------+
| [ Copy ]   [ Done ]            |
+--------------------------------+
19e Empty: "No tokens."   [R] = Revoke row action.
```

Desktop: table columns Name, Grants, Created by, Last used, Expiry, Revoke.

Widgets: table (row action Revoke), form (create), one-time secret reveal (see Open questions).

Frame sequence: 19a -> 19b -> 19c -> 19a; 19a -> 19d -> 19a.
Intents: `auth.token.list`, `auth.token.create`, `auth.token.revoke`.

---

## access-20 Account page

Phone (sections stacked; each opens its flow):

```text
+--------------------------------+
| [=] [ Search...           ] (o)|
| Account   Scott Key            |
|--------------------------------|
| Password               Change >|  access-06
| Second factors      1 active  >|  access-05
| Sessions and devices  3       >|  access-07
| App credentials                |
|   Plex         SSO             |
|   Komga  managed  [Show][Rotate]|
| Notifications                 >|  (ops area)
| Theme          Dark default   >|  (nav area)
| Request access                >|  access-16
| My requests                   >|  access-16
| My action history             >|  (data area)
+--------------------------------+
Show on a managed password -> step-up (04a) -> value shown.
Rotate -> step-up if marked high-risk -> job -> new value shown once.
```

Desktop:

```text
+-------------+--------------------------+-------------------------------------------------+
| (drawer)    | Account                  | Second factors                                  |
|             | > Password               |  Authenticator app  Added 3/2     [ Remove ]    |
|             |   Second factors         |  [ + Add authenticator ]                        |
|             |   Sessions and devices   |                                                 |
|             |   App credentials        |                                                 |
|             |   Notifications          |                                                 |
|             |   Theme                  |                                                 |
|             |   Requests               |                                                 |
+-------------+--------------------------+-------------------------------------------------+
```

API tokens appear here only for holders of the token grant (access-19); regular users do not see them.

Widgets: status tiles (section summaries), table (app credentials, row actions Show/Rotate), forms (per section).

Frame sequence: drawer/avatar -> account -> section flows.
Intents: `auth/web/me`, per-app credential view / rotate `(no API)`, plus each section's intents.

---

## access-21 Connect another mesh

```text
21a Mesh switcher (avatar menu)    21b Add mesh
+--------------------------------+ +--------------------------------+
| Meshes                         | | < Meshes                       |
| * home        Scott   current  | | Add a mesh                     |
|   parents     scott   signed in| | Address [ orca.example...  ]   |
|   lab         signed out       | | [ Connect ]                    |
| [ + Add mesh ]                 | | ! Can't reach this address.    |
| [x] Unified view               | +--------------------------------+
+--------------------------------+
21c Sign in to it -> access-02 (separate account on that mesh).
21d Unified view on: search and dashboards show results from every signed-in mesh, each item
    labelled with its mesh; actions run with that mesh's account.
21e One mesh offline: its items show last known state with controls disabled; others normal.
```

Desktop: switcher is a dropdown on the "mesh:" control in the top bar.

Widgets: table (meshes), form (add mesh), form (unified-view toggle).

Frame sequence: 21a -> 21b -> 21c -> 21a.
Intents: add mesh (client-side connection list, see Open questions), `auth/web/signin` against the new mesh.

---

## Open questions

1. QR image and one-time secret reveal are used (access-01, 05, 19) but are not in the interview's widget-kind list. Are they part of the form kind, or new kinds?
2. Lockout: how many attempts, how long, and is it per account or per address?
3. Can a user remove their last second factor? Is a second factor required for everyone, or only for some grants?
4. Second-factor recovery (lost phone): recovery codes, admin reset, or something else?
5. Does changing the password end other sessions?
6. Is self sign-up enabled by default, and who can turn it on or off?
7. Invite expiry default and range; can an invite be revoked or resent?
8. Exact intent names for grant/revoke, user list, groups, invites, sign-up approvals, access requests, offboarding, and second factors (most have no API today).
9. Offboarding retention period default and whether it is a setting; does restore re-create app accounts or re-enable them?
10. Do tokens have a default expiry, and can a token's grants be edited after creation?
11. Who sees the sign-up approvals and access requests inbox when several people hold the receive-requests grant: everyone, or routed?
12. Where does the list of connected meshes live (per browser, per device, or synced via an account)?
13. In unified view, how are name collisions between meshes shown in search?
14. Which access actions are marked high-risk by default (revoke, offboard, group delete, credential view)? The interview says plugins mark their own; orca core's own access actions are not settled.
15. Does the first-run flow require TOTP enrollment, or can it be skipped?
