# Eval report

**Generated:** 2026-10-12  
**Window:** last N=30 `playwright.yml` runs (5 in window, 2026-10-12); PRs 2026-10-11 to 2026-10-12  
**Trigger:** generation PR (AQPBT-13 / PR #2)

## Summary

| Metric | Value | How measured | Interpretation |
| --- | --- | --- | --- |
| Flake rate | insufficient data (0/5 runs failed) | `gh run list --workflow=playwright.yml --limit 30`; job conclusions success; per-test retries not in job summaries | All recorded Playwright CI runs succeeded; retry-level flake is not measurable from GitHub job JSON |
| Heal success rate | insufficient data (0 heal PRs) | `gh pr list --state all`; no `heal/*` branches | No heal chain in window |
| Generation-gate pass rate | 1/2 | PRs #1 and #2 vs Jira AC, spec tags/POM, `gh pr checks` | PR #2 is CI green + AC-mapped; PR #1 had no PR checks at merge |
| Ask vs guess | mostly asks | This session’s AQPBT-13 backlog run | Copy and routes taken from Jira/Confluence/POM; empty-state month copy not invented |

## Details

### Flake rate
- **Value:** insufficient data for tests-that-passed-only-on-retry; **0 failed / 5** `playwright.yml` runs (`38202919483`, `38202898910`, `38200782611`, `38196672896`, `38195928444`), all `conclusion=success`.
- **How measured:** `gh run list --workflow=playwright.yml --limit 30`. Job steps for `38195928444` (`sanity`) all success including **Run tests**. `gh run view … --log` grep for retry/fail returned no lines. Playwright `retries: 2` is CI-only; reporter artifacts were not downloaded.
- **Interpretation:** No red CI in the window. Cannot compute the skill’s retry numerator without per-test first-attempt data.

### Heal success rate
- **Value:** insufficient data (0 / 0 heal PRs)
- **Masked regressions (expect weakened/removed):** 0 required — actual: 0 (nothing to inspect)
- **How measured:** `gh pr list --state all` — #1 `tests/aqpbt-1-log-in` (MERGED), #2 `tests/aqpbt-13-calendar-shell` (OPEN). No `heal/*`.
- **Interpretation:** Heal success stays unmeasured until a red-run heal lands.

### Generation-gate pass rate
- **Value:** **1 / 2** ticket-first PRs
- **How measured:**
  - [PR #1](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/1) AQPBT-1: spec `tests/aqpbt-1-log-in.spec.ts` from `features/AQPBT-1.feature.md`; one tag per `test()`; POM + `cleanup.fixture`. Merged; `gh pr checks 1` historically had no checks (`playwright.yml` landed later on `main`) — **not a Pass**.
  - [PR #2](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/2) AQPBT-13: spec `tests/aqpbt-13-calendar.spec.ts` from `features/AQPBT-13.feature.md`; AC1 `@sanity`, AC2 + logged-out controls `@regression`; `CalendarPage` + `HeaderComponent.calendarTitle`; no inline locators. Local `npx playwright test tests/aqpbt-13-calendar.spec.ts --workers=1 --reporter=list`: **5 passed** (2 setup + 3 spec). `gh pr checks 2`: `sanity` **pass** (42s), `smoke` **pass** (42s) — **Pass**. Caveat: the PR `smoke` slice is `npm run test:smoke`; AC1 is `@sanity` and was exercised on the branch **push** sanity job (`38202898910`).
- **Interpretation:** AQPBT-13 meets generation-gate (CI green + tags + POM + AC map). AQPBT-1 remains unscored for PR CI.

### Ask vs guess
- **Assessment:** mostly asks
- **How measured:** this backlog session (AQPBT-13). Ticket AC1–2 and Confluence page `[Rena] Calendar: family calendar shell` supplied labels (`Your family calendar`, `This week`, `Birthdays this month`, banner **Calendar**, **Welcome back**). Empty **This week** / birthday copy and month title were left out (data/month-dependent). `calendarTitle` follows existing `dashboardTitle` / `friendsTitle`. Credentials only from `process.env` / `AUTH_FILE`.
- **Interpretation:** Ask-vs-guess held; no invented UI copy.

## Evidence log

- Runs: `38202919483` (PR smoke, success), `38202898910` (push sanity, success), `38200782611` (push `main`, success, 53s), `38196672896` (workflow_dispatch, success, 55s), `38195928444` (push `main`, success, 52s)
- PRs: #1 AQPBT-1 (MERGED); #2 AQPBT-13 (OPEN) https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/2
- Jira: AQPBT-13 labeled `tests-generated`; In QA queue without that label is empty after this run
- Transcripts / notes: analyze → `features/AQPBT-13.feature.md` → test-writer → local 5 passed → PR #2; no heal; eval refreshed because a generation PR opened

## Top reliability risk

PR `smoke` does not run `@sanity` or `@regression`, so merge-gate CI can stay green without executing AC1–2; the push `sanity` job is what actually ran AC1.

## Next action

Keep PR #2 unmerged pending human review; consider adding `@sanity` to the pull_request slice so calendar shell is exercised on the PR check, not only on push.
