# Block 04 evidence

## P15 — Tracked record types

From `.cursor/skills/api-cleanup/SKILL.md`:

```
## Tracked record types

Read `support/record-tracker.ts` and `support/api-client.ts` before adding rows — **do not invent** types or endpoints.

| type | create request | delete request | owner |
| ---- | -------------- | -------------- | ----- |
| `parent` (`TrackedRecordType.Parent`) | `POST /api/v1/auth/register` → `201` with `parent.id` in body (UI: auto-tracked by `cleanup.fixture.ts`; otherwise: `trackRecord` after create) | `DELETE /api/v1/me` via `deleteParentAccount` — Bearer + sidecar password when registered in-test; else family API context + `APP_USER_PASSWORD` / `APP_ALT_USER_PASSWORD` for `owner` (`204` success) | `main` or `alt` |

**No other `TrackedRecordType` values exist on `main` yet.**
```

Chat, after “please Verify: the "Tracked record types" table…”:

```
The table matches those two files: **one tracked type, one delete helper, no extra types.**

**Verdict:** the table does not invent types or delete endpoints. It lists only what `record-tracker.ts` tracks and what `api-client.ts` deletes.
```

## P16 — Probe spec (page object import)

`tests/login.spec.ts`:

```
import { test, expect } from '../fixtures/cleanup.fixture';
import { LoginPage } from '../pages';
import { signupEmptyStorageState } from '../test-data/signup.helpers';

test.describe('Login page', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('shows the page heading', { tag: '@smoke' }, async ({ page }) => {
    const login = new LoginPage(page);
```

## P18 — Explore plan

Path: `features/explore-calendar-family-calendar-shell.feature.md`

```
## Selected gap

**Flow:** Signed-in main family opens `/calendar` and sees the family calendar planning shell (grid + **This week** + **Birthdays this month**).

**Why this run:** The route and POM exist but no Playwright spec touches `/calendar`; this is the smallest high-signal slice before navigation-from-dashboard or data-dependent birthday/plan rows.
```

## P20 — Exploratory charter

Path: `charters/sign-up.md`

Chat, after “write an exploratory charter for Sign up” with no risk:

```
Feature is **Sign up**. I still need a **risk** before writing the charter — the skill does not invent one.

Send the risk in one sentence (what could go wrong, or what this session must try to disprove). Optional if you have them: time box, in/out of scope, ticket, Confluence page, page URL.
```

## P22 — Test data reset

Chat, after “please confirm that Asking "clean up the test data" in plain words is not triggering any test data reset skill”:

```
**Bottom line:** Plain “clean up the test data” is **not** set up to automatically invoke **`test-data-reset`**. For a guaranteed reset workflow, use explicit wording (“reset test data”, “run test-data-reset”) or attach the skill. **`api-cleanup`** is separate (test authoring), not a chat trigger for wiping tracker rows.
```

Chat, after `/test-data-reset` with `--dry-run`:

```
**Confirmed.** Ran:
npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts --dry-run

### Your machine (tracker was empty)
## Result
- **Scope:** all tracked (dry-run)
- **Found:** 0
- **Deleted:** 0
- **Failed:** 0

### With one demo row (to verify listing)
Would delete parent dry-run-demo-id (owner: main)
## Result
- **Scope:** type=parent (dry-run)
- **Found:** 1
- **Deleted:** 0
- **Failed:** 0

**Bottom line:** `--dry-run` lists tracked records as `Would delete …` lines, reports **Deleted: 0**, and performs no deletes.
```
