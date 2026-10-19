---
name: api-contract-tests
description: Writes Playwright API tests in api/ from a documented specification (OpenAPI or approved docs) or, when there is none, from observed rows in api/CATALOG.md. Use when the user asks for API tests, contract tests, endpoint tests, or to cover an endpoint, a request, or a response — even if they don't say "contract". Do NOT use to discover endpoints — that is api-discovery.
paths: "api/**"
---

# API contract tests

**Deliverable:** new or updated `api/*.api.spec.ts` and shared helpers/constants as needed. Conventions: [.cursor/rules/api-conventions.mdc](../../.cursor/rules/api-conventions.mdc). Do not update [api/CATALOG.md](../../api/CATALOG.md) — use [api-discovery](../api-discovery/SKILL.md).

## Procedure

1. Find the source: a spec file or URL the user names (documented), otherwise rows in
   `api/CATALOG.md` (observed). Say which one you're using, and never mix them silently.
2. List the documented facts and the assumptions separately. Ask before asserting any
   assumption.
3. For each endpoint, follow the api-conventions rule: a success test and an
   intentional error test. Contract tests also check required fields and their types
   against the spec.
4. Reuse `api/fixtures.ts`. Writes only with a documented or observed undo, tracked with
   `trackRecord`.
5. Run `npx playwright test --project=api`, then write one evidence note per endpoint:
   basis (executed / inspected only / not yet tested), request, expected, actual, what
   it proves, what it doesn't prove.

## Guardrails

### Scope

- **In scope:** `api/*.api.spec.ts`, `api/helpers/*`, path constants in `support/api.constants.ts` when needed.
- **Out of scope:** editing `api/CATALOG.md`, browsing the app to find endpoints, weakening or deleting assertions to go green, healing a product bug as a test change.
- **Non-trivial work:** audit existing specs/helpers first; emit the repo **Proposal** block (constitution) before editing.

### Sources of truth

| Basis | Use for |
| --- | --- |
| **Documented** (OpenAPI, approved doc, user-named spec URL) | Contract tests — required fields and types from the spec |
| **Observed** (`api/CATALOG.md` row with **executed** evidence) | Characterization tests — pin that row via `readCatalogGetJson` / `assert*` in `api/helpers/catalog-response.ts` |
| **Inspected only** / **Not yet tested** | Do not add write tests; do not assert response/error JSON shape from guesses |

- Observed rows are not a formal contract unless the user pointed at a spec — say **characterization** vs **contract** in the evidence note.
- Do not fill gaps in **Not yet tested** (error JSON shape, expired JWT, sign-in path) from prediction or PDF/chat.
- Catalog says **safe for tests?** **no** or **no undo** → no POST/DELETE write specs until discovery updates the row.

### Requests and fixtures

- Import `test`, `expect`, and `trackRecord` from `./fixtures` (extends cleanup + `mainApi` / `altApi` / `guestApi`) — not from `@playwright/test`.
- Use **`mainApi`**, **`altApi`**, **`guestApi`** only; `baseURL` comes from config (`APP_URL` via `support/api-client.ts`).
- Paths: constants from `support/api.constants.ts` (e.g. `API_ME`); dynamic segments via helpers like `apiCommunityPath(id)` — never Bearer tokens, origin URLs, or hardcoded resource ids in specs.
- Do not paste catalog capture mechanics (localStorage `bt_token`, auth file paths) into specs.

### Two tests per endpoint

- **Success:** catalog/spec status, JSON, top-level fields via shared helpers — not unbounded dumps of sensitive data.
- **Intentional error:** change exactly one thing (drop auth → `guestApi`, omit required field, empty body). Assert status; assert error body shape only when observed/documented.
- Missing-token pattern: `CATALOG_UNAUTHENTICATED_STATUS` where catalog probes support it — not invented 403/404.

### Writes and cleanup

- Writes only when undo is **documented** or **executed** in the catalog (e.g. `DELETE /api/v1/children/{id}`).
- Call **`trackRecord({ type, id, owner: 'main' \| 'alt' })`** immediately after create (`TrackedRecordType` from `support/record-tracker.ts`).
- Payloads: factories such as `catalogChildPayload()` — no inline magic strings; unique data per test (`Date.now()` / Faker where the repo already does).
- No manual `afterAll` cleanup — global teardown + [api-cleanup](../api-cleanup/SKILL.md).
- Never hardcode credentials; never delete data the test did not create.

### Tags and TypeScript

- Exactly one tag per `test()`: **`@api`** — never on `describe()`; no `@smoke` / `@e2e` on API specs.
- No `any` in fixtures or spec code.

### Assertions and evidence

- Do not soften, comment out, or remove `expect()` to pass.
- Never invent routes, env var names, enum values, or field lists — ask or read the repo/catalog/spec.
- Step 5 evidence note template (per endpoint):

```markdown
- **Basis:** executed | inspected only | not yet tested
- **Request:** method + path (+ one-line body if write)
- **Expected:** status + shape under test
- **Actual:** from last `npx playwright test --project=api` run
- **Proves:** …
- **Does not prove:** …
```

### Reuse before adding

| Piece | Location |
| --- | --- |
| Fixtures | `api/fixtures.ts` |
| Response readers / asserts | `api/helpers/catalog-response.ts` |
| Paths | `support/api.constants.ts` |
| API context / delete helpers | `support/api-client.ts` |
| Example pairing | `api/me.api.spec.ts`, `api/availability.api.spec.ts` |
