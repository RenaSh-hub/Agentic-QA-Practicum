# Eval report

**Generated:** 2026-10-13  
**Window:** last N=30 `playwright.yml` runs (19 in window, 2026-10-12 to 2026-10-13); PRs 2026-10-11 to 2026-10-13  
**Trigger:** generation PR (AQPBT-9 / PR #5) and local red run triaged before that PR

## Summary

| Metric | Value | How measured | Interpretation |
| --- | --- | --- | --- |
| Flake rate | insufficient data (retry numerator); 1/19 jobs failed | `gh run list --workflow=playwright.yml --limit 30` | The only red job is an intentional POM-drift demo, not a retry flake |
| Heal success rate | insufficient data (0 heal PRs) | `gh pr list --state all`; no `heal/*` | No heal PR in the window |
| Generation-gate pass rate | 2/4 | PRs #1, #2, #3, #5 vs checks, tags, and AC mapping | #2 and #3 pass; #1 had no PR checks; #5 smoke is green but does not run the new spec |
| Ask vs guess | mostly asks | This session’s AQPBT-9 backlog run | Copy, families, and the setup gate came from Jira, Confluence, and the live app |

## Details

### Flake rate
- **Value:** insufficient data for tests-that-passed-only-on-retry. Job conclusions: **18 success / 19** `playwright.yml` runs; **1 failure** (`38317914402`, PR smoke on `refactor/forgot-password-button-pom`).
- **How measured:** `gh run list --workflow=playwright.yml --limit 30`. Check-run annotations on `38317914402` are only “Process completed with exit code 1” (plus an Ubuntu image notice). Per-test retry lines were not in those annotations; the Playwright report artifact was not downloaded.
- **Interpretation:** The red smoke job matches PR #4’s title (expect smoke red after a POM rename). That is a deliberate break, not a flake. Retry-level flake stays unmeasured.

### Heal success rate
- **Value:** insufficient data (0 / 0 heal PRs)
- **Masked regressions (expect weakened/removed):** 0 required — actual: 0 (no `heal/*` diff to inspect). AQPBT-9 local fixes did not remove or soften `expect()` calls.
- **How measured:** `gh pr list --state all` — branches `tests/aqpbt-1-log-in`, `tests/aqpbt-13-calendar-shell`, `tests/AQPBT-7-forgot-password`, `refactor/forgot-password-button-pom`, `tests/aqpbt-9-propose-playdate`. No `heal/*`.
- **Interpretation:** Heal success stays unmeasured. PR #4 demonstrates drift; it is not a heal.

### Generation-gate pass rate
- **Value:** **2 / 4** ticket-first PRs
- **How measured:**
  - [PR #1](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/1) AQPBT-1: merged; historically no PR checks — **not a Pass**.
  - [PR #2](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/2) AQPBT-13: merged; prior smoke and push sanity green — **Pass**.
  - [PR #3](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/3) AQPBT-7: closed, not merged. Files `features/AQPBT-7.feature.md`, `tests/aqpbt-7-forgot-password.spec.ts`, `pages/forgot-password.page.ts`. `gh pr checks 3`: smoke pass (`38314830053`), sanity pass (`38314822518`). Body maps AC1–AC6 — **Pass**.
  - [PR #5](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/5) AQPBT-9: open. Spec tags are `@sanity` and `@regression` only. PR check `38462377794` is smoke (`npm run test:smoke`, `@smoke`) and **passed in 44s**, so it did not execute `tests/aqpbt-9-playdates-propose.spec.ts`. No push `sanity` run was listed for `tests/aqpbt-9-propose-playdate`. Local `npx playwright test tests/aqpbt-9-playdates-propose.spec.ts --workers=1 --reporter=list`: **12 passed**. Gate requires CI to exercise the new spec — **not a Pass**.
- **Interpretation:** Two of four generation PRs meet CI-plus-AC. AQPBT-9 is locally green and smoke-clean, but the pull_request slice cannot see it.

### Ask vs guess
- **Assessment:** mostly asks
- **How measured:** this backlog session (AQPBT-9). Jira AC and Confluence page `[Anna] Playdates: matched slots and manual propose form` (pageId 316080131) supplied labels. Live `/playdates` confirmed Family A is Lev Test (`APP_USER_EMAIL`), circle names **The Nguyens** / **The Petrovs**, slot name shapes, and the setup-gate sentence. The alt account was not used for AC8 because it shows an empty-circle message, not the dashboard gate. Match counts and calendar dates were not frozen.
- **Interpretation:** Ask-vs-guess held. The ticket’s “at The Gorfels” example was not on the site; the plan records the live location token **out** instead of inventing that host.

## Evidence log

- Runs: `38462377794` (PR #5 smoke, success, 44s); `38317914402` (PR #4 smoke, failure); `38317895551` (push sanity on the drift branch, success); 18 success and 1 failure in the 19-run window (2026-10-12T02:28:36Z through 2026-10-13T20:23:04Z)
- PRs: #1 AQPBT-1 (MERGED); #2 AQPBT-13 (MERGED); #3 AQPBT-7 (CLOSED); #4 drift demo (CLOSED); #5 AQPBT-9 (OPEN) https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/5
- Jira: AQPBT-9 labeled `tests-generated` after the local spec passed. AQPBT-4 and AQPBT-12 stay In QA without that label. AQPBT-4 already has `features/AQPBT-4.feature.md` and `tests/aqpbt-4-sign-up.spec.ts` on `main`, so this run took AQPBT-9.
- Local spec: 12 passed after two test-issue fixes (Log out matched `/ out$/`; setup-gate text shares a node with aria-hidden **BT**). No app-bug filing.
- Transcripts / notes: analyze → `features/AQPBT-9.feature.md` → test-writer → triage → POM/spec fixes → local 12 passed → PR #5

## Top reliability risk

Pull-request CI runs only `@smoke`, and the AQPBT-9 spec has no `@smoke` test, so PR #5 can stay green without running AC1–AC9.

## Next action

Keep PR #5 unmerged for human review; add one `@smoke` test for the propose shell, or include `@sanity` in the pull_request slice, so the new spec runs on the PR check.
