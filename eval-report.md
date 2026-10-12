# Eval report

**Generated:** 2026-10-12  
**Window:** last N=30 `playwright.yml` runs (5 in window, 2026-10-12); PRs 2026-10-11 to 2026-10-12  
**Trigger:** generation PR (AQPBT-7 / PR #3)

## Summary

| Metric | Value | How measured | Interpretation |
| --- | --- | --- | --- |
| Flake rate | insufficient data (0/5 runs failed) | `gh run list --workflow=playwright.yml --limit 30`; job conclusions success; per-test retries not in job summaries | All recorded Playwright CI runs succeeded; retry-level flake is not measurable from GitHub job JSON |
| Heal success rate | insufficient data (0 heal PRs) | `gh pr list --state all`; no `heal/*` branches | No heal chain in window |
| Generation-gate pass rate | 2/3 | PRs #1–#3 vs Jira AC, spec tags/POM, `gh pr checks` | PR #2 and #3 CI green + AC-mapped; PR #1 had no PR checks at merge |
| Ask vs guess | mostly asks | AQPBT-7 session (Jira AC + live intro apostrophe U+2019) | Reset copy and `nobody@example.com` from ticket; Confluence body not fully fetched |

## Details

### Flake rate
- **Value:** insufficient data for tests-that-passed-only-on-retry; **0 failed / 5** `playwright.yml` runs (`38202919483`, `38202898910`, `38200782611`, `38196672896`, `38195928444`), all `conclusion=success`.
- **How measured:** `gh run list --workflow=playwright.yml --limit 30`. Job steps for `38195928444` (`sanity`) all success including **Run tests**. `gh run view … --log` grep for retry/fail returned no lines. Playwright `retries: 2` is CI-only; reporter artifacts were not downloaded.
- **Interpretation:** No red CI in the window. Cannot compute the skill’s retry numerator without per-test first-attempt data.

### Heal success rate
- **Value:** insufficient data (0 / 0 heal PRs)
- **Masked regressions (expect weakened/removed):** 0 required — actual: 0 (nothing to inspect)
- **How measured:** `gh pr list --state all` — #1 `tests/aqpbt-1-log-in` (MERGED), #2 `tests/aqpbt-13-calendar-shell` (OPEN), #3 `tests/AQPBT-7-forgot-password` (OPEN). No `heal/*`.
- **Interpretation:** Heal success stays unmeasured until a red-run heal lands.

### Generation-gate pass rate
- **Value:** **2 / 3** ticket-first PRs
- **How measured:**
  - [PR #1](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/1) AQPBT-1: spec `tests/aqpbt-1-log-in.spec.ts` from `features/AQPBT-1.feature.md`; one tag per `test()`; POM + `cleanup.fixture`. Merged; `gh pr checks 1` historically had no checks (`playwright.yml` landed later on `main`) — **not a Pass**.
  - [PR #2](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/2) AQPBT-13: spec `tests/aqpbt-13-calendar.spec.ts` from `features/AQPBT-13.feature.md`; AC1 `@sanity`, AC2 + logged-out controls `@regression`; `CalendarPage` + `HeaderComponent.calendarTitle`; no inline locators. Local `npx playwright test tests/aqpbt-13-calendar.spec.ts --workers=1 --reporter=list`: **5 passed** (2 setup + 3 spec). `gh pr checks 2`: `sanity` **pass** (42s), `smoke` **pass** (42s) — **Pass**. Caveat: the PR `smoke` slice is `npm run test:smoke`; AC1 is `@sanity` and was exercised on the branch **push** sanity job (`38202898910`).
  - [PR #3](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/3) AQPBT-7: spec `tests/aqpbt-7-forgot-password.spec.ts` from `features/AQPBT-7.feature.md`; AC1 `@smoke`, AC4 `@e2e`, AC5–6 + parity `@regression`, direct nav `@sanity`; `ForgotPasswordPage` confirmation locators + `requestResetLink`. Local `npx playwright test tests/aqpbt-7-forgot-password.spec.ts --reporter=list`: **10 passed** (2 setup + 8 spec). `gh pr checks 3`: `sanity` **pass** (42s), `smoke` **pass** (46s) — **Pass**. AC1 `@smoke` runs on PR smoke; `@regression` / `@e2e` slices depend on workflow tags (same caveat as #2).
- **Interpretation:** AQPBT-7 and AQPBT-13 meet generation-gate (CI green + tags + POM + AC map). AQPBT-1 remains unscored for PR CI.

### Ask vs guess
- **Assessment:** mostly asks
- **How measured:** AQPBT-7 session. Jira AC1–6 supplied routes, labels, `nobody@example.com`, and confirmation fragments. Intro paragraph curly apostrophe (U+2019) confirmed on live app; Confluence page linked from Jira was not fully retrieved — gaps documented in `features/AQPBT-7.feature.md`. Family A email from `requireFamilyACredentials()` / `process.env`.
- **Interpretation:** Ask-vs-guess held; no invented reset copy.

## Evidence log

- Runs: `38202919483` (PR smoke, success), `38202898910` (push sanity, success), `38200782611` (push `main`, success, 53s), `38196672896` (workflow_dispatch, success, 55s), `38195928444` (push `main`, success, 52s)
- PRs: #1 AQPBT-1 (MERGED); #2 AQPBT-13 (OPEN); #3 AQPBT-7 (OPEN) https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/3
- Jira: AQPBT-7 labeled `tests-generated` with PR comment; AQPBT-13 previously labeled
- Transcripts / notes: analyze → `features/AQPBT-7.feature.md` → test-writer → local 10 passed → PR #3; CI smoke/sanity pass; no merge; eval refreshed (generation PR #3)

## Top reliability risk

PR `smoke` does not run `@sanity` or `@regression`, so merge-gate CI can stay green without executing AC1–2; the push `sanity` job is what actually ran AC1.

## Next action

Keep PR #2 and #3 unmerged pending human review; tag coverage on PR checks still skews toward `@smoke` / `@sanity` — full `@regression` / `@e2e` forgot-password paths may need manual or nightly runs.
