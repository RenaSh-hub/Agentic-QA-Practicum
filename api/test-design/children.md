# Children API — test design

Source: `api/CATALOG.md` only. Endpoints: `POST /api/v1/children`, `DELETE /api/v1/children/{id}`.

Related read (not separate catalog rows): after create, child should appear on `GET /api/v1/me` → `family.children` (observed during add/remove on Dashboard).

---

## POST `/api/v1/children`

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
| --- | --- | --- | --- | --- | --- | --- |
| CH-POST-01 | positive | Valid payload: `firstName` (string), `birthYear` (number), `avatarKey` `"fox"`, `interests` `[]` | 201 | Created child object: `id`, `firstName`, `birthYear`, `birthMonth` null\|number, `age`, `gender` null\|string, `interests` array, `avatarKey` | CATALOG row POST `/api/v1/children` | characterization |
| CH-POST-02 | positive | Same as CH-POST-01; then `GET /api/v1/me` | 200 (GET) | `family.children` contains entry matching created `id` and `firstName` | CATALOG (Dashboard add-child flow) | state / integration |
| CH-POST-03 | positive | Payload with optional fields omitted (`avatarKey`, `interests` not sent) if client allows | — | — | CATALOG § Not yet tested (UI always sent avatar + empty interests) | not yet tested |
| CH-POST-04 | positive | `birthMonth`, `gender`, non-empty `interests` | — | — | CATALOG § Not yet tested (partial POST) | not yet tested |
| CH-POST-05 | error | Same body as CH-POST-01, no `Authorization` (`guestApi`) | 401 | — | CATALOG § Not yet tested (401 on GET probes only); same pattern assumed for writes | family / no token — **assumed — ask** |
| CH-POST-06 | error | `altApi` POST with valid body (creates on alt family only if allowed) | — | — | CATALOG (no cross-family write probe) | family / alt token — **not yet tested** |
| CH-POST-07 | negative | Omit `firstName` | — | — | CATALOG § Not yet tested (error JSON shape) | equivalence class — **assumed — ask** |
| CH-POST-08 | negative | Omit `birthYear` | — | — | same | equivalence class — **assumed — ask** |
| CH-POST-09 | negative | `firstName` empty string `""` | — | — | same | equivalence class — **assumed — ask** |
| CH-POST-10 | negative | `birthYear` wrong type (string) or negative number | — | — | same | equivalence class — **assumed — ask** |
| CH-POST-11 | negative | `birthYear` boundary: current year + 1 (future infant) | — | — | same | boundary — **assumed — ask** |
| CH-POST-12 | negative | `birthYear` boundary: very small / implausible year | — | — | same | boundary — **assumed — ask** |
| CH-POST-13 | negative | Invalid or unknown `avatarKey` | — | — | same | equivalence class — **assumed — ask** |
| CH-POST-14 | negative | `interests` not an array (e.g. string) | — | — | same | equivalence class — **assumed — ask** |

**Teardown:** every successful create → `trackRecord` + `DELETE /api/v1/children/{id}` (catalog documents safe undo).

---

## DELETE `/api/v1/children/{id}`

| ID | type | what we send | expected status | expected body (rule, key values) | source | technique |
| --- | --- | --- | --- | --- | --- | --- |
| CH-DEL-01 | positive | `DELETE` id returned from `POST /api/v1/children` (`mainApi`) | 204 | empty body | CATALOG row DELETE `/api/v1/children/{id}` | characterization |
| CH-DEL-02 | positive | After CH-DEL-01, `GET /api/v1/me` | 200 | `family.children` no longer contains that `id` | CATALOG (remove-child on Dashboard) | state / integration |
| CH-DEL-03 | error | `DELETE` valid id, no `Authorization` (`guestApi`) | 401 | — | CATALOG § Not yet tested (401 on GET probes); assumed for DELETE | family / no token — **assumed — ask** |
| CH-DEL-04 | error | `altApi` `DELETE` id created by `mainApi` | — | — | CATALOG (no cross-family probe) | family / alt on main data — **not yet tested** |
| CH-DEL-05 | negative | `DELETE` random or non-existent `{id}` | — | — | CATALOG § Not yet tested | equivalence class — **assumed — ask** |
| CH-DEL-06 | negative | `DELETE` same `{id}` twice (after successful first delete) | — | — | CATALOG § Not yet tested (idempotency) | state — **not yet tested** |

---

## Already implemented (`api/children.api.spec.ts`)

| Catalog intent | Spec coverage |
| --- | --- |
| CH-POST-01 + CH-POST-02 + CH-DEL-01 (single flow) | `POST … create appears on GET /api/v1/me then DELETE removes child` |

## Gaps vs `api-conventions.mdc` (two tests per endpoint)

| Endpoint | Missing today |
| --- | --- |
| POST | Dedicated error test changing **one** thing (e.g. CH-POST-05 no token) |
| DELETE | Standalone success/error pair (today DELETE is only asserted inside the POST flow) |

---

**Approval:** Reply **approved** or request changes to this table before implementing specs.
