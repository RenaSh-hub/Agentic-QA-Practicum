# Eval report

**Generated:** 2026-10-14  
**Window:** last N=30 `playwright.yml` runs (20 in window, 2026-10-12 to 2026-10-13); PRs in same span  
**Trigger:** manual refresh (README / eval-report task)

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | insufficient data | 20 run job conclusions via `gh run list --workflow=playwright.yml --limit 30`; no per-test first-attempt/retry export | One intentional failed run (demo drift PR); retry-level flake numerator not available from GitHub job summaries |
| Heal success rate | insufficient data (0 heal PRs) | `gh pr list --state all`; no `heal/*` branches or self-heal PR bodies | No heal chain in window |
| Generation-gate pass rate | insufficient data | 4 ticket-linked PRs (#1–#3 merged/closed, #5 open); spot checks only | Window too small for a stable pass rate; merged PR #2 and #3 had green Playwright checks; #1 predates PR checks; #5 not complete |
| Ask vs guess | insufficient data | No structured transcript sample in this refresh | Qualitative tier needs deliberate session review |

## Details

### Flake rate
- **Value:** insufficient data for tests-that-passed-only-on-retry; **1 failed / 20** `playwright.yml` runs at job level (`38462690696` action_required; `38317914402` failure on demo drift PR #4; remaining runs success).
- **How measured:** `gh run list --workflow=playwright.yml --limit 30`. Failure `38317914402` matches PR #4 (`refactor/forgot-password-button-pom`) — intentional POM/spec mismatch, not retried flake. `retries: 2` applies in CI ([`playwright.config.ts`](playwright.config.ts)); artifact logs were not downloaded for per-test retry counts.
- **Interpretation:** Job-level success/failure does not measure flake rate per skill definition.

### Heal success rate
- **Value:** insufficient data (0 / 0 heal PRs)
- **Masked regressions (expect weakened/removed):** 0 required — actual: 0 (nothing to inspect)
- **How measured:** PRs #1–#5; none named `heal/*` or citing self-heal with locator-only patches. PR #4 was a closed drift demo, not a heal PR.
- **Interpretation:** Heal success stays unmeasured until a triaged drift heal lands.

### Generation-gate pass rate
- **Value:** insufficient data (aggregate)
- **How measured:**
  - [PR #1](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/1) AQPBT-1: merged before `playwright.yml` PR checks — **cannot score Pass/Fail for CI gate**.
  - [PR #2](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/2) AQPBT-13: merged; smoke/sanity checks green on branch — **Pass** (spot-check).
  - [PR #3](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/3) AQPBT-7: merged; `gh pr checks 3` smoke + sanity **pass** — **Pass** (spot-check).
  - [PR #5](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/5) AQPBT-9: **OPEN**; latest run `38462690696` action_required; `gh pr checks 5` reports no checks — **incomplete**.
- **Interpretation:** Only three merged generation PRs with partial CI history; reporting a single percentage would overfit the window.

### Ask vs guess
- **Assessment:** insufficient data
- **How measured:** This refresh did not review agent transcripts or PR bodies for ask-vs-guess moments (prior note: mostly asks on AQPBT-13 session, 2026-10-12).
- **Interpretation:** Re-sample after more backlog or heal sessions.

## Evidence log

- Runs (20): includes `38462690696`, `38462377794`, `38317914402`, `38317895551`, `38315285738`, `38314830053`, `38314822518`, `38313898886`, `38313840732`, `38287468322`, `38281720638`, `38269365923`, `38203517603`, `38203097348`, `38203094588`, `38202919483`, `38202898910`, `38200782611`, `38196672896`, `38195928444`
- PRs: #1 MERGED (AQPBT-1); #2 MERGED (AQPBT-13); #3 MERGED (AQPBT-7); #4 CLOSED (drift demo); #5 OPEN (AQPBT-9)
- Transcripts / notes: manual refresh only; no new generation/heal session reviewed

## Top reliability risk

PR **`pull_request`** runs **`@smoke` only**, while many AC scenarios are tagged **`@sanity`** or **`@regression`**, so merge-gate CI can stay green without executing all ticket scenarios (push sanity partially compensates).

## Next action

After PR #5 stabilizes, re-run this report with downloaded Playwright HTML artifacts for retry-level flake data and a reviewed ask-vs-guess sample.
