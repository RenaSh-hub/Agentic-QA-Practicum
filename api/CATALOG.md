# BuddyTime API catalog (live discovery)

Captured **2026-10-16** with Playwright Chromium, main-family `storageState` (`playwright/.auth/user.json`) and `Authorization: Bearer` from localStorage `bt_token` (same as `createFamilyApiContext` in `support/api-client.ts`). Routes visited: `AppRoute` Dashboard (`/app`), Friends, Communities, Availability, Playdates, Birthdays, Profile. Read-only browsing except **one add-child + remove-child** on Dashboard. **2026-10-18** add-on pass: Calendar (`/calendar`) only — read-only. Static assets, fonts, images, analytics, and Next.js payloads (`/_next/*`, `?_rsc=`) were ignored.

| method | path (ids → `{id}`) | page that called it | how it's authenticated | status seen | request body fields (writes) | response top-level fields and types | safe for tests? | evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/v1/me` | Dashboard, Friends, Communities, Availability, Playdates, Birthdays, Profile, Calendar (and during add/remove child) | Authorization: Bearer (`bt_token`) | 200 | — | `parent`: object (`id`, `email`, `name`, `displayName`, `phone` null\|string, `emailVerified` boolean); `family`: object (`id`, `name`, `addressText` null\|string, `addressVisibility` string, `tz` string, `parents` array, `children` array of child objects); `isAdmin` boolean. Child: `id`, `firstName`, `birthYear`, `birthMonth`, `age`, `gender`, `interests` array, `avatarKey` | yes | executed |
| GET | `/api/v1/connections` | Same pages as `/api/v1/me` | Authorization: Bearer (`bt_token`) | 200 | — | array; item: `id` string, `family` object (`id`, `name`), `children` array, `communities` array, `since` string, `status` string, `blockedByMe` boolean | yes | executed |
| GET | `/api/v1/availability` | Availability; also observed on initial Dashboard load | Authorization: Bearer (`bt_token`) | 200 | — | `rules` array (item: `id`, `childId` null\|string, `weekday` number, `startMin`, `endMin`, `hosting` string, `noticeHours` number); `exceptions` array (item: `id`, `date` string, `kind` string, `startMin`, `endMin`, `note` string) | yes | executed |
| GET | `/api/v1/communities` | Communities; Dashboard; Birthdays | Authorization: Bearer (`bt_token`) | 200 | — | array; item: `id`, `name`, `type`, `description`, `myRole`, `myStatus`, `familiesCount`, `pendingCount`, `createdAt` | yes | executed |
| GET | `/api/v1/communities/{id}` | Birthdays | Authorization: Bearer (`bt_token`) | 200 | — | community fields as list item plus `members` array (item: `id`, `family` object, `role`, `status`, `children` array, `connection` null\|object, `since` string) | yes | executed |
| GET | `/api/v1/events` | Birthdays; Calendar | Authorization: Bearer (`bt_token`) | 200 | — | array; item: `id`, `kind`, `title`, `childId`/`childName`/`endsAt`/`communityId`/`communityName` nullable, `startsAt`, `venueText`, `details`, `cardKey`, `status`, `rsvpToken`, `counts` object (`yes`, `no`, `maybe`, `guestsComing` numbers), `createdAt`, `canManage` boolean | yes | executed |
| GET | `/api/v1/matches` | Playdates | Authorization: Bearer (`bt_token`) | 200 | — | array; item: `date`, `startMin`, `endMin`, `startsAt`, `endsAt`, `family` object (`id`, `name`), `suggestedHost` null\|object, `locationKind` string | yes | executed |
| GET | `/api/v1/playdates` | Playdates; Dashboard | Authorization: Bearer (`bt_token`) | 200 | — | array; item: `id`, `status`, `startsAt`, `endsAt`, `locationKind`, `locationText` null\|string, `notes`, `proposerFamily`/`inviteeFamily`/`otherFamily`/`hostFamily` objects, `children` array, `proposedBy` object, `respondedAt`, `cancelledAt`, `googleCalendarUrl`, `icsUrl`, `canRespond`, `canCancel` booleans | yes | executed |
| GET | `/api/v1/playdates?filter=upcoming` | Calendar | Authorization: Bearer (`bt_token`) | 200 | — | array; same item shape as unfiltered `GET /api/v1/playdates` | yes | executed |
| POST | `/api/v1/children` | Dashboard (add child) | Authorization: Bearer (`bt_token`) | 201 | `firstName` (string), `birthYear` (number), `avatarKey` (string, e.g. `"fox"`), `interests` (array of strings; UI sent `[]`) | created child: `id`, `firstName`, `birthYear`, `birthMonth` null\|number, `age`, `gender` null\|string, `interests` array, `avatarKey` | yes (undo via `DELETE /api/v1/children/{id}`) | executed |
| DELETE | `/api/v1/children/{id}` | Dashboard (remove child) | Authorization: Bearer (`bt_token`) | 204 | — (no body) | empty body (204 No Content) | yes (cleanup for created children) | executed |
| POST | `/api/v1/auth/register` | — (not invoked this session) | Bearer after register (per test harness); exact login/register client headers not captured here | — | `password` and other register fields referenced in `support/api-client.ts` / cleanup skill | `parent`, `token` (per `parseRegisterResponse`) | no (no undo observed in this catalog pass) | inspected only |
| DELETE | `/api/v1/me` | — (not invoked this session) | Authorization: Bearer + JSON body | — | `password` (string confirmation) | not captured | no (destructive; only used in controlled teardown) | inspected only |

## Not yet tested

- **Pagination / filtering** — `GET /api/v1/events` returned a large single array (~275 items) with no `page`, `cursor`, or `limit` query params observed on Calendar or other page loads; `GET /api/v1/playdates?filter=upcoming` observed on Calendar only (other `filter` values not exercised).
- **Calendar logged-out** — `/calendar` without a session redirects to login in UI tests; API calls on that path were not captured in the 2026-10-18 pass.
- **Error response shape** — validation errors and other 4xx/5xx bodies are still unknown. The two refused `DELETE /api/v1/children/{id}` calls below are the exception; see **Authorization (two families)**.
- **Rate limits** — not exercised.
- **Expired or invalid JWT** — not probed; without `Authorization`, catalog GETs return **401** (API contract tests, 2026-10-16) and `DELETE /api/v1/children/{id}` returns **401** (authorization spec, 2026-10-30).
- **Sign-in API** — login route/path not seen (auth reused from storage state).
- **Write APIs not hit on these pages** — availability rule/exception create/update/delete; connection invite/accept/block; community create/join/approve; playdate propose/respond/cancel; event create/RSVP; profile or family PATCH; child update (avatar editor opens UI only — no save clicked); push/install endpoints tied to dashboard buttons.
- **Partial POST `/api/v1/children`** — optional fields (`birthMonth`, `gender`, non-empty `interests`) not captured in the UI submit used for cataloging.
- **Idempotency / concurrency** — duplicate DELETE or double POST not tried.

## Authorization (two families)

Executed **2026-10-30** by `api/authorization.api.spec.ts`. Family A (`mainApi`) created a disposable child and called `trackRecord` immediately. Statuses below are from that run, before they were written into the spec. No child ids are stored here.

- **executed** — Family B (`altApi`, Bearer token for the alt family) `DELETE /api/v1/children/{id}` on Family A's child returned **404**. Body: `message` `"Child not found"`, `error` `"Not Found"`, `statusCode` `404`. After that, `GET /api/v1/me` as Family A still listed the child, and `GET /api/v1/me` as Family B did not (both GETs **200**, same shape as the catalog row).
- **executed** — The same DELETE with no token (`guestApi`) returned **401**. Body: `message` `"Unauthorized"`, `statusCode` `401` (`error` was absent). The child was still listed on Family A's `GET /api/v1/me` (**200**).

Still **not yet tested**:

- Owning-family DELETE of an id that was never created, so this **404** is not compared with a genuinely missing child.
- A wrong or expired JWT on this DELETE (only a missing token was sent).
- **403** on this route — this run did not return one.
- Family B creating, updating, or reading Family A's child by any route other than this DELETE, and the same cross-family check on other resources.
- Error JSON for validation failures and for endpoints other than these two DELETEs.

Raw capture (paths, statuses, samples): `.test-artifacts/api-catalog-raw.json` (local only; not for CI).
