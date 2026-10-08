---
name: api-cleanup
description: Ensures Playwright tests clean up the data they create. Use whenever generating or reviewing tests that create persistent records in the app under test (BuddyTime availability, playdates, invites, or anything else), so test data does not accumulate in the shared test environment. Apply this to every test that creates data — even if cleanup isn't explicitly requested.
paths: "tests/**"
---

# API cleanup (self-cleaning tests)

Persistent data in the shared BuddyTime test env **must** be tracked and deleted. Global teardown reads `.test-artifacts/created-records.jsonl` and removes every tracked row using the owning family's auth (`support/global-teardown.ts` and `support/cleanup-reporter.ts` → `cleanupCreatedRecords()` in `support/cleanup-records.ts`).

If a spec creates data and does not track it, that is a defect — not an optional nice-to-have.

## Steps

1. Import `test` and `expect` from `fixtures/cleanup.fixture.ts`, not from `@playwright/test`.
2. Records created through the UI are tracked automatically from the create response.
   Records created through the API: call `trackRecord({ type, id, owner })` immediately after creation, with owner `"main"` or `"alt"`.
3. No manual `afterAll` cleanup blocks — the fixture and global teardown handle it.
4. Cleanup uses the delete helpers in `support/api-client.ts` with the record's `owner` (family `storageState` or register Bearer sidecar — see table). If a type has **no** delete helper in `api-client.ts`, use the P10 UI teardown — **never** leave the record behind.
5. Never hardcode a credential. Never delete data the test did not create.

## Fixture behavior (current `main`)

- The extended `page` listens for `POST` responses to `API_AUTH_REGISTER` (`/api/v1/auth/register`) with status `201`, reads `parent.id` from the JSON body, and calls `trackRecord` with type `parent`. Register token + password (from request body) are stored in the parent-auth sidecar when present (`support/parent-auth-store.ts`) so teardown can `DELETE /api/v1/me` as that user.
- **Owner today:** UI register tracking always sets `owner: 'main'`. For alt-family parents, track explicitly: `trackRecord({ type: 'parent', id, owner: 'alt' })` after you know the id (do not rely on the register hook for alt).
- IDs with prefix `mock-` are never tracked (`record-tracker.ts`; see `support/mock-api.ts` for mock flows).
- Re-exported `trackRecord` is for creates that bypass the register response hook (API-only or non-register UI).

## Tracked record types

Read `support/record-tracker.ts` and `support/api-client.ts` before adding rows — **do not invent** types or endpoints.

| type | create request | delete request | owner |
| ---- | -------------- | -------------- | ----- |
| `parent` (`TrackedRecordType.Parent`) | `POST /api/v1/auth/register` → `201` with `parent.id` in body (UI: auto-tracked by `cleanup.fixture.ts`; otherwise: `trackRecord` after create) | `DELETE /api/v1/me` via `deleteParentAccount` — Bearer + sidecar password when registered in-test; else family API context + `APP_USER_PASSWORD` / `APP_ALT_USER_PASSWORD` for `owner` (`204` success) | `main` or `alt` |

**No other `TrackedRecordType` values exist on `main` yet.** When you add children, availability, playdates, invites, etc., extend `record-tracker`, add delete helpers in `api-client`, update `cleanup-records.ts`, **and** this table in the same change.

Paths: `API_AUTH_REGISTER`, `API_ME` in `support/api.constants.ts`.

## P10 UI fallback

When a future type has no API delete helper, delete through the UI pattern from P10: `deleteSignedUpAccountViaProfile(page, password)` in `support/signup-account-teardown.ts`. Password comes from the test factory / register payload — never a literal in the spec. (`parent` always has `deleteParentAccount`; P10 applies to types without API delete.)

## Review checklist

- [ ] Spec imports from `fixtures/cleanup.fixture.ts`
- [ ] Every **persistent** create is tracked (register UI hook or explicit `trackRecord`)
- [ ] `owner` on each tracked row matches the family that owns the data (`alt` is never implied — set it explicitly when not main)
- [ ] No `afterAll` / duplicate manual delete logic
- [ ] No credentials in spec source; no deleting unrelated or pre-existing records
