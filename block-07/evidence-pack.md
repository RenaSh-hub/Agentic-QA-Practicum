# Block 07 — API evidence pack

Captured **2026-10-19** against `APP_URL` from local `.env` (not committed). Auth uses gitignored `playwright/.auth/` storage state; examples below use `Authorization: Bearer <APP_TOKEN>` only. Emails, names, and full resource ids are omitted; status codes and error JSON are verbatim from the run.

---

## Evidence item 1 — catalog GET success

**Endpoint:** `GET /api/v1/me` (catalog row: executed, `api/CATALOG.md`)

**Basis:** executed

**Test performed:** One-off Playwright `APIRequestContext` probe via `createFamilyApiContext('main')`, immediately after `npx playwright test --project=api api/me.api.spec.ts` passed (same route).

**Command or request:**

```http
GET /api/v1/me HTTP/1.1
Host: <APP_URL host>
Authorization: Bearer <APP_TOKEN>
Accept: application/json
```

**Expected status:** `200` (per catalog)

**Actual status:** `200`

**Expected body:** JSON object with `parent` (object), `family` (object with `id`, `name`, `addressVisibility`, `tz`, `parents`, `children`), and `isAdmin` (boolean) — per `api/CATALOG.md` and `assertMeBody` in `api/helpers/catalog-response.ts`.

**Actual body:** Redacted snapshot from run (`Content-Type: application/json; charset=utf-8`, raw length 768 bytes). Scalar fields and structure match the live JSON; `family.parents` had **1** object and `family.children` had **2** objects (contents omitted here).

```json
{
  "parent": {
    "id": "<PARENT_ID>",
    "email": "[redacted]",
    "name": "[redacted]",
    "displayName": "[redacted]",
    "phone": null,
    "emailVerified": true
  },
  "family": {
    "id": "<FAMILY_ID>",
    "name": "[redacted]",
    "addressText": null,
    "addressVisibility": "circle",
    "tz": "America/Toronto"
  },
  "isAdmin": true
}
```

**What this proves:** Authenticated main-family context can read `/api/v1/me` with HTTP 200 and the documented top-level shape.

**What this does not prove:** Field-level correctness for every nested child object, alt-family parity, or behavior with an expired or revoked token.

**Open question:** Does `GET /api/v1/me` ever return partial data or 403 for a valid but non-admin parent on the same family?

---

## Evidence item 2 — intentional unauthenticated error

**Endpoint:** `GET /api/v1/me` without `Authorization` (paired error test in `api/me.api.spec.ts`)

**Basis:** executed

**Test performed:** Same probe session as item 1 — guest `APIRequestContext` with no Bearer header (`guestApi` pattern).

**Command or request:**

```http
GET /api/v1/me HTTP/1.1
Host: <APP_URL host>
Accept: application/json
```

**Expected status:** `401` (per `CATALOG_UNAUTHENTICATED_STATUS` / catalog GET probes)

**Actual status:** `401`

**Expected body:** Status known from prior probes; error JSON shape was listed under **Not yet tested** in `api/CATALOG.md` until observed.

**Actual body:**

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

**What this proves:** Missing Bearer on this catalog GET returns 401 with a small JSON body (`message`, `statusCode`).

**What this does not prove:** That all other routes use the same error shape; behavior for malformed `Authorization` values or expired JWTs.

**Open question:** Do write endpoints (e.g. `POST /api/v1/children`) return the same `{ message, statusCode }` shape on 401, or field-level validation arrays on 400?

---

## Evidence item 3 — not yet exercised

**Endpoint:** Playdate **ICS download** — `GET` on the absolute URL in a playdate’s `icsUrl` field (returned on `GET /api/v1/playdates` per catalog), **without** Bearer, and **without** following only the in-app “ICS” button.

**Basis:** not yet tested

**Test performed:** None in this session. Catalog lists `icsUrl` on playdate items (executed list GET) but does not record whether the ICS URL is public, signed, or session-bound.

**Command or request:** (planned probe — not run)

```http
GET <ICS_URL_FROM_PLAYDATE_ITEM> HTTP/1.1
Accept: text/calendar
```

Optional contrast probe (also not run):

```http
GET <ICS_URL_FROM_PLAYDATE_ITEM> HTTP/1.1
Authorization: Bearer <APP_TOKEN>
Accept: text/calendar
```

**Expected status:** Unknown — could be `200` (public calendar file), `401`/`403` (auth required), or `404` (opaque token).

**Actual status:** *(not run)*

**Expected body:** Unknown — likely `text/calendar` if allowed, or JSON error if rejected.

**Actual body:** *(not run)*

**What this proves:** *(nothing yet)*

**What this does not prove:** Cross-family isolation on other JSON routes (see item 4 for one community probe), rate limits, or RSVP-token routes.

**Open question:** Can an unauthenticated holder of `icsUrl` download the event, and does that URL remain valid after the playdate is cancelled?

---

## Evidence item 4 — cross-family community detail (executed)

**Endpoint:** `GET /api/v1/communities/{id}` — same `{id}` as main family’s sole list entry; **alt** family Bearer (alt’s `GET /api/v1/communities` returned an empty array in this environment).

**Basis:** executed

**Test performed:** Playwright API probe **2026-10-19** — listed communities as main and alt, then `GET /api/v1/communities/{id}` as main (control) and as alt on the same community id.

**Command or request:**

```http
GET /api/v1/communities/<MAIN_COMMUNITY_ID> HTTP/1.1
Host: <APP_URL host>
Authorization: Bearer <APP_TOKEN_ALT>
Accept: application/json
```

Control (same path, main token):

```http
GET /api/v1/communities/<MAIN_COMMUNITY_ID> HTTP/1.1
Host: <APP_URL host>
Authorization: Bearer <APP_TOKEN>
Accept: application/json
```

**Expected status:** Unknown before probe — plausible outcomes included `403 Forbidden`, `404 Not Found`, or `200` if membership is not enforced on detail.

**Actual status:** **404** (alt Bearer). Control with main Bearer on the same id: **200**.

**Expected body:** If denied, some JSON error object (shape not specified in catalog).

**Actual body (alt Bearer, 404):**

```json
{
  "message": "Community not found",
  "statusCode": 404,
  "error": "Not Found"
}
```

**Actual body (main Bearer, 200 — redacted):** JSON community detail with `type` `class`, `myRole` `admin`, `myStatus` `active`, and **4** entries in `members` (ids and member payloads omitted).

**What this proves:** In this environment, alt family cannot read main’s community by id via authenticated GET — the API responds **404** with `{ message, statusCode, error }`, not the detail payload. Main family still receives **200** for the same id.

**What this does not prove:** Behavior when alt is a pending member, when both families share a community, when the id is guessed/sequential, or whether **404** vs **403** is used consistently on other resources (playdates, connections, events).

**Open question:** Is “Community not found” returned for non-members to avoid leaking existence, and would a member alt family ever get **200** on that id after joining?

---

## API test readiness checklist

### Security

Could secrets or PII leak into committed artifacts, runner output, or HTML reports? Checked for this pack and the usual API paths:

- **Tokens:** Specs use `mainApi` / `altApi` / `guestApi` (`api/fixtures.ts`, `support/api-client.ts`) — no literal Bearer strings in `api/*.api.spec.ts` (searched); this pack uses `<APP_TOKEN>` placeholders only; live tokens stay in gitignored `playwright/.auth/` and `.env` — opened `.gitignore`; local probe JSON under `.test-artifacts/` is not committed.
- **Passwords:** Not embedded in API specs or `api/CATALOG.md` (field names only, e.g. `DELETE /api/v1/me`); credentials load from `process.env` / GitHub secrets in CI — reviewed `.env.example`, `.github/workflows/playwright.yml`, and terminal output from `npx playwright test --project=api` (no password lines observed).
- **Personal data:** `api/CATALOG.md` documents field names/types, not live values; this pack redacts emails/names and truncates ids; API project is HTTP-only (no UI screenshots on pass) — reviewed `block-07/evidence-pack.md`, probe exports, and Playwright config (`api` project has no `screenshot` override); did **not** open a fresh `playwright-report/` HTML trace for this checklist — on failure, reports under gitignored `playwright-report/` could still embed response bodies until redaction is verified.

### Operations

- **Local command:** `npx playwright test --project=api` (includes `setup` auth); also `npm run test:api` greps `@api` across projects — prefer `--project=api` for API-only.
- **CI:** Job **`api`** in `.github/workflows/playwright.yml` runs `npx playwright test --project=api` on `push`, `pull_request`, and `workflow_dispatch` (parallel to the UI slice job).
- **Report:** HTML under `playwright-report/` locally; CI uploads artifact **`playwright-report-api`** (`path: playwright-report/`, 30-day retention).

### Documentation

- **Per endpoint:** `api/CATALOG.md` table — method, path, auth, status seen, request body fields (writes), response shape, `safe for tests?`, evidence label (`executed` / `inspected only`); helpers in `api/helpers/catalog-response.ts` encode observed GET shapes.
- **Errors:** Catalog § **Not yet tested** still lists generic “error response shape” — this pack adds executed **401** (`/me`, no token) and **404** (alt on main community id); other codes/routes remain catalog gaps.
- **Still not yet tested (catalog):** Pagination/filter variants, calendar logged-out API, rate limits, expired/invalid JWT, sign-in route, most write flows (availability, connections, communities, playdates, events, profile PATCH), partial `POST /children`, idempotency — plus this pack’s **ICS URL** probe (item 3).

### What this whole pack does not prove

These probes characterize a single test environment on one day; they are not a security audit or a complete contract for BuddyTime. They do not show that every catalog route behaves the same on auth errors, cross-tenant access, or writes, nor that ICS links, RSVP tokens, or production data handling are safe without further executed evidence.
