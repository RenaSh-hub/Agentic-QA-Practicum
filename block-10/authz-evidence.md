# Block 10 — Authorization evidence

Two rows from `qa-run/authz-report.json`. The probe used family B (`alt`) and no token (`anonymous`). These entries are the catalog-backed write refusal and one cross-family read the catalog does not define. Requests below use placeholders only.

---

## Evidence item 1 — family B delete of family A's child (HELD)

**Endpoint:** `DELETE /api/v1/children/{id}` — family B (`who`: `alt`) on family A's child id. Report outcome: `HELD`.

**Basis:** executed

**Test performed:** Authorization probe recorded in `qa-run/authz-report.json`. This row is the family B delete. The same report says the owner follow-up still listed the child and the family B follow-up did not.

**Command or request:**

```http
DELETE /api/v1/children/<CHILD_ID> HTTP/1.1
Host: <APP_URL host>
Authorization: Bearer <APP_TOKEN>
Accept: application/json
```

**Expected status:** `404`. `api/CATALOG.md` (Authorization, two families) already records family B `DELETE /api/v1/children/{id}` on family A's child as **404**.

**Actual status:** `404`

**Expected body:** Catalog text for that refusal: `message` `"Child not found"`, `error` `"Not Found"`, `statusCode` `404`.

**Actual body:** The report does not store the raw JSON. It records status `404`, catalog message `Child not found`, and that the child id was absent. `qa-run/authz-attempts.json` labels that message `child-not-found`.

**What this proves:** In this run, family B's delete of family A's child returned 404 with the catalog message `Child not found`, the child id was absent from that response, family A's later `GET /api/v1/me` still listed the child, and family B's follow-up did not. The report marks that refusal `HELD`.

**What this does not prove:** That family A's own delete of an id that was never created returns this same 404. The catalog lists that comparison as not yet tested. This row also does not describe a wrong or expired token, a 403, or any route other than this delete.

**Open question:** Is `Child not found` the same body family A would get for a child id that was never created?

---

## Evidence item 2 — family B connections list (undocumented)

**Endpoint:** `GET /api/v1/connections` — family B (`who`: `alt`). Report outcome: `undocumented`.

**Basis:** executed

**Test performed:** Same report as item 1. This row is family B's connections list. The report says family A's child id was absent, family A's family id was absent, and the owner follow-up still listed the child. It does not record a separate family B follow-up on this row.

**Command or request:**

```http
GET /api/v1/connections HTTP/1.1
Host: <APP_URL host>
Authorization: Bearer <APP_TOKEN>
Accept: application/json
```

**Expected status:** Not defined for this cross-family read. The catalog row for `GET /api/v1/connections` is **200** for the authenticated caller's own list. The report states that the catalog does not define cross-family access.

**Actual status:** `200`

**Expected body:** Not defined for whether family A's child id or family id may appear. The catalog's own-session shape is an array of connection items (`id`, `family`, `children`, `communities`, `since`, `status`, `blockedByMe`).

**Actual body:** The report does not store the raw array. It records status `200`, child id absent, and family A's family id absent. `qa-run/authz-attempts.json` has `childIdPresent: false`, `familyIdPresent: false`, and `catalogMessage: null` for this attempt.

**What this proves:** In this run, family B's `GET /api/v1/connections` returned 200, and that response did not contain family A's new child id or family A's family id. The child was still listed for family A afterward. The report marks the row `undocumented` because the catalog does not define cross-family access. The same report gives `undocumented` and `200` to family B on `GET /api/v1/availability`, `GET /api/v1/events`, and `GET /api/v1/playdates`, with the same absence note.

**What this does not prove:** That family B's list was empty, that family B has no connection to family A, or that a connection between the two families would still omit family A's ids. It does not cover the anonymous `401` on this path (a separate report row, outcome `HELD`).

**Open question:** When two families are connected, should family B's `GET /api/v1/connections` include family A's family id and children, and which status should the catalog require when it should not?
