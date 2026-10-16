---
name: self-heal
description: Repairs drifted Playwright locators after a UI change — patch the POM, re-run unchanged assertions, open a PR. Use when the live evidence scorer returns act on side drift (or escalate plus a human approval file). NEVER heal a product bug.
---

# Self-heal (locator drift)

Fix **one** broken locator in `pages/` when the live scorer allows heal. Follow [pom-conventions](../pom-conventions/SKILL.md); specs stay read-only.

## Prerequisite

Re-run `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json`. Trust that stdout only — not a saved decision file, not a triage label in chat.

| Live scorer | Action |
| --- | --- |
| `act` and `side` `drift` | Continue this skill |
| `escalate` and `.test-artifacts/approvals/<decisionId>.json` exists (human-created) | Continue this skill |
| `act` and `side` `bug` | **Stop** → [jira-bug-reporter](../jira-bug-reporter/SKILL.md) |
| `inconclusive` or `escalate` without an approval file | **Stop** → complete [ci-failure-triage](../ci-failure-triage/SKILL.md) or wait for the human; do not patch |

If the scorer does not allow drift heal → do not heal.

## Steps

1. From the error and trace, find the failing test, the assertion line (read-only),
   the POM property that supplied the locator, and the old locator exactly as written.
2. Re-discover the element with `browser_navigate` + `browser_snapshot` against
   `APP_URL`: same role, current accessible name. Never guess from screenshots.
   Use `browser_lock` during live re-discovery; unlock when done.
3. Patch **only** that locator in the POM (minimal diff; keep role-based; never CSS or
   XPath; never broaden it to make it pass). **One locator per run.**
4. Re-run the failing spec and prove it green with **zero changes under `tests/`.**
5. Open a PR on branch `heal/<short-description>` with the run id, the triage
   classification, the old → new locator diff, the re-run result, and the line
   **"assertions unchanged"**. Do not merge.

**Re-run example:** `npx playwright test <spec-path> -g "<test title>"`

**Auth for re-discovery:** Prefer `playwright/.auth/user.json` (main family). If missing or expired, sign in once via the live app using env credentials (same pattern as [explore-and-generate](../explore-and-generate/SKILL.md)). Use `playwright/.auth/alt-user.json` only when the failing spec uses Family B. Match the failing spec’s `storageState` / setup project. Never put credentials in the PR body.

Emit the repo **Proposal** block (constitution) before editing. The self-assessment is not a gate; `scripts/score-evidence.ts` is.

## Stop and escalate

Stop and escalate if green needs an assertion change, if the same locator error
persists after re-discovery, or if a new failure looks like a product regression.

| Situation | Action |
| --- | --- |
| Need to change `expect()` in `tests/` | Stop — not drift-only; re-triage or bug-reporter |
| Locator still not found after snapshot-backed fix | Stop — report findings; do not stack speculative POM edits |
| Test passes but behavior contradicts Jira AC / Confluence | Stop — [jira-bug-reporter](../jira-bug-reporter/SKILL.md) |
| Scorer is inconclusive or escalate without an approval file | Stop — complete [ci-failure-triage](../ci-failure-triage/SKILL.md) first |

## Report template

Use in the PR description (and optionally as a PR comment):

```markdown
## Self-heal — locator drift

**Scorer:** `decision` / `side` / `score` / `rule` (live `score-evidence.ts`)  
**CI run:** `<run id or local>`  
**Branch:** `heal/<short-description>`  
**Failing test:** `<spec>` — `<title>`

### Locator patch
- **POM:** `pages/<file>.ts` — `<property or constructor line>`
- **Before:** `<old getByRole/getByLabel/...>`
- **After:** `<new locator>`
- **Re-discovery:** `<APP_URL host + route>` — role / name from snapshot: …
- **Evidence:** aria snapshot / trace path: …

### Verification
- **Command:** `npx playwright test …`
- **Result:** pass (N/N)
- **assertions unchanged**

### Scope
- Files changed: `pages/` only
- Locators touched: 1
- `tests/`: no edits
```

## Do / Don't

| Do | Don't |
| --- | --- |
| Fix one role/label/text locator in `pages/` per heal run | Change assertions, timeouts, or tags in `tests/` to go green |
| Use live `browser_snapshot` on `APP_URL` for the new name/role | Invent labels/names from screenshots or memory |
| Keep the same user intent (same control, updated accessible name) | Broaden locators (`.*`, drop `{ exact: true }`, extra `.or()`) to mask wrong elements |
| Triage first; heal only when the live scorer is act+drift (or escalate + approval file) | Heal when the app is wrong vs AC — file via bug-reporter |
| Branch `heal/<short-description>`, PR with triage + diff + re-run proof | Merge the PR or skip the re-run |
| Hand off product wrongness to jira-bug-reporter | Weaken, delete, or comment out `expect()` calls |
| Use CSS/XPath/`getByTestId` only when no user-facing alternative exists | Default to test ids when role/label/text fits |

## Gate

One locator, one POM diff, green re-run, PR opened — then **stop**. Further failures start a new triage + heal cycle.

## Repo context

- **Family A** = main auth (`playwright/.auth/user.json`, default `storageState`). **Family B** = `playwright/.auth/alt-user.json` for two-parent flows — match the failing spec’s project.
- `APP_URL` and credentials from `process.env` / `.env.example`; auth files are git-ignored.
