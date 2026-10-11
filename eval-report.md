# Eval report

**Generated:** 2026-10-10  
**Window:** last N=30 `playwright.yml` runs; PRs 2026-10-10  
**Trigger:** generation PR; `eval-report.md` missing

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | insufficient data | `gh run list --limit 10` empty; no `.github/workflows/` | No CI runs to score retries |
| Heal success rate | insufficient data | No `heal/*` PRs (`gh pr list --state all`) | No heal chain in window |
| Generation-gate pass rate | insufficient data | PR #1 is ticket-first; `gh pr checks 1` reports no checks | Cannot score CI-green |
| Ask vs guess | mostly asks | This session’s AQPBT-1 orchestrator run | Gherkin gate held; no invented copy |

## Details

### Flake rate
- **Value:** insufficient data
- **How measured:** `gh run list --limit 10` returned no runs. Repo has no `.github/workflows/*.yml`. No Playwright reporter artifacts in CI.
- **Interpretation:** Local `npx playwright test tests/aqpbt-1-log-in.spec.ts` was 16/16 on a single pass; that is not a flake-rate sample.

### Heal success rate
- **Value:** insufficient data (0 heal PRs)
- **Masked regressions (expect weakened/removed):** 0 required — actual: 0 (nothing to inspect)
- **How measured:** `gh pr list --state all` shows only PR #1 (`tests/aqpbt-1-log-in`), not a heal branch.
- **Interpretation:** Heal success is unmeasured until a red-run heal lands.

### Generation-gate pass rate
- **Value:** insufficient data (1 generation PR, CI not scorable)
- **How measured:** PR [#1](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/1) references AQPBT-1 and adds `tests/aqpbt-1-log-in.spec.ts` from `features/AQPBT-1.feature.md`. AC mapping checked against Jira AQPBT-1 (9 AC) and the Confluence Log in page. Spec uses one tag per `test()`, POM locators, `cleanup.fixture`. `gh pr checks 1`: no checks; no `playwright.yml`.
- **Interpretation:** Locally green and AC-mapped; generation-gate **Pass** still requires CI green, which this repo cannot show yet.

### Ask vs guess
- **Assessment:** mostly asks
- **How measured:** this session (AQPBT-1). Human approved Gherkin before test-writer. HTML5 empty/malformed messages were left as Confluence open questions, not invented. Credentials from `APP_USER_EMAIL` / `APP_USER_PASSWORD`. Sign up `next` scenarios kept only after approval.
- **Interpretation:** Ask-vs-guess held for this ticket; no other transcripts sampled.

## Evidence log

- Runs: none (`gh run list` empty)
- PRs: #1 AQPBT-1 log-in coverage (OPEN)
- Transcripts / notes: this session — jira-ticket-analyzer → Gherkin gate → test-writer → local 16 passed (14 spec + 2 setup) in 4.7s

## Top reliability risk

No Playwright CI workflow, so flake rate and generation-gate cannot be measured on GitHub.

## Next action

Add `playwright.yml` (or equivalent) so the next ticket-first PR can be scored on first-run CI.
