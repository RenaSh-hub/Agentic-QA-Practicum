# Eval report

**Generated:** 2026-10-16  
**Window:** last N=30 `playwright.yml` runs (2026-10-12 to 2026-10-16); PRs #1–#8 in the same span  
**Trigger:** triage (AQPBT-5 AC5 local red) and generation PR (AQPBT-5)

## Summary

| Metric | Value | How measured | Interpretation |
| --- | --- | --- | --- |
| Flake rate | insufficient data | 30 job conclusions via `gh run list --workflow=playwright.yml --limit 30`; no per-test first-attempt/retry export | Job failures in window are intentional drift demos or a hung generation PR, not retry-flakes |
| Heal success rate | 0 / 1 | `gh pr list --state all`; `heal/*` + first CI + `gh pr diff --name-only` | PR #7 first CI is green but the diff is not locator-only under `pages/` |
| Generation-gate pass rate | 2 / 5 | Ticket-first PRs that add `tests/` and cite `AQPBT-*`; CI via `gh run list` / merge state | #2 and #8 Pass; #1 insufficient at merge; #3 and #5 closed without merge |
| Ask vs guess | mostly asks | This AQPBT-5 session plus prior AQPBT-13 note | Gherkin gated before Playwright; children API confirmed live; AC5 assertion kept |

## Details

### Flake rate
- **Value:** insufficient data for tests-that-passed-only-on-retry. Job-level: **4 failed / 30** runs (`38837980813`, `38837965701` simulate login POM drift; `38462690696` AQPBT-9 hung ~30h; `38317914402` forgot-password drift demo). Remaining 26 completed success.
- **How measured:** `gh run list --workflow=playwright.yml --limit 30`. `retries: 2` in CI ([`playwright.config.ts`](playwright.config.ts)); HTML artifacts were not downloaded for retry counts. Cleanup **404**s not counted.
- **Interpretation:** Job-level red in this window is demo drift or a stuck generation PR, not evidence of flake.

### Heal success rate
- **Value:** 0 / 1
- **Masked regressions (expect weakened/removed):** 0 required — actual: 0 (PR #7 restores `LoginPage` **Log in**; no `expect` removal in that locator patch)
- **How measured:** [PR #7](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/7) `heal/login-log-in-button` — first Playwright jobs green (`38838814388`, `38843320014`). `gh pr diff --name-only` also includes `evals/`, `.cursor/skills/`, `eval-report.md`, and constitution — not `pages/` only. PR #4 and #6 are drift *simulations*, not heals.
- **Interpretation:** Locator restore looks successful, but the heal metric requires a pages-only diff; #7 cannot count as a Pass until the harness files are split out.

### Generation-gate pass rate
- **Value:** 2 Pass / 5 generation PRs
- **How measured:**
  - [PR #1](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/1) AQPBT-1: merged 2026-10-11 — **insufficient data** for CI-at-merge (predates the current 30-run window).
  - [PR #2](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/2) AQPBT-13: merged; Playwright green — **Pass**.
  - [PR #3](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/3) AQPBT-7: **CLOSED**, `mergedAt` null — **non-pass** (did not land).
  - [PR #5](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/5) AQPBT-9: **CLOSED** after run `38462690696` failed (~30h) — **non-pass**.
  - [PR #8](https://github.com/RenaSh-hub/Agentic-QA-Practicum/pull/8) AQPBT-17: merged; Playwright green on PR and main (`38900684853`, `38901067784`) — **Pass**.
- **Interpretation:** Landed ticket PRs with verifiable green CI in-window are #2 and #8. AQPBT-5 local run is 7/8; AC5 fails as AQPBT-16 (act/bug). PR `@smoke` will not execute that `@regression` test.

### Ask vs guess
- **Assessment:** mostly asks
- **How measured:** AQPBT-5 session (2026-10-16): Gherkin written to `features/AQPBT-5.feature.md` and approved before Playwright; `POST /api/v1/children` confirmed from a live authenticated call (not invented); Family A names/children from `GET /api/v1/me`; AC5 Birth year focus kept after live scorer `act` / `bug` / `60` / rule 6. Prior eval note: mostly asks on AQPBT-13 (2026-10-12).
- **Interpretation:** Session did not invent routes or weaken the failing AC.

## Evidence log

- Runs (30): includes `38901067784`, `38900684853`, `38900553975`, `38843854442`, `38843320014`, `38843314021`, `38838814388`, `38838716955`, `38837980813`, `38837965701`, `38837299734`, `38835141907`, `38672072496`, `38462690696`, `38462377794`, `38317914402`, `38317895551`, `38315285738`, `38314830053`, `38314822518`, `38313898886`, `38313840732`, `38287468322`, `38281720638`, `38269365923`, `38203517603`, `38203097348`, `38203094588`, `38202919483`, `38202898910`
- PRs: #1 MERGED (AQPBT-1); #2 MERGED (AQPBT-13); #3 CLOSED (AQPBT-7); #4 CLOSED (drift demo); #5 CLOSED (AQPBT-9); #6 OPEN (drift simulation); #7 OPEN (heal); #8 MERGED (AQPBT-17)
- Transcripts / notes: AQPBT-5 orchestrator session; live scorer on AC5: `act` / `bug` / `60` / rule 6 / `allowedActions: ["bug-reporter"]`; AQPBT-16 already filed — no new bug

## Top reliability risk

PR **`pull_request`** runs **`@smoke` only**, so AQPBT-5 AC5 (`@regression`, product bug AQPBT-16) will not fail merge-gate CI even though the local full spec is red. That hides documented AC mismatches until a full-suite dispatch.

## Next action

Keep AC5 asserting Birth year focus until AQPBT-16 is fixed; do not weaken it. Split heal PR #7 so locator restore is pages-only.
