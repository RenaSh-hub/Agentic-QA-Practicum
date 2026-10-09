---
name: eval-report
description: Refreshes eval-report.md — flake rate, heal success, generation-gate pass rate, ask-vs-guess — from CI logs, PR history, and session review. Use when the orchestrator closes a session, after a heal chain, at the end of backlog mode, when the user asks for suite reliability, or when eval-report.md is stale (>14 days). Cursor has no built-in telemetry; this skill defines how to measure each metric manually.
---

# Eval report (suite reliability)

Refresh **`eval-report.md`** at the repo root from observable CI/PR/session evidence. **Report only** — no tickets, no test changes.

Cursor has no built-in telemetry; every metric is measured explicitly below.

## When it is mandatory

- A heal PR was opened or a red run triaged (see [ci-failure-triage](../ci-failure-triage/SKILL.md))
- A generation PR was opened (ticket-first test/spec work in a PR)
- `eval-report.md` is missing or older than 14 days (use **`Generated`** / **`Last refreshed`** in the file, or file mtime if absent)

Otherwise note **`eval: skipped — no trigger`** in chat or a one-line log; **do not rewrite** the report.

If file age is ≤ 14 days and no mandatory trigger applies → skip refresh.

## Inputs

Collect before computing metrics:

| Source | Command / action |
| --- | --- |
| CI runs | `gh run list --workflow=playwright.yml --limit 30` (if the workflow file differs, read `.github/workflows/` and adjust `--workflow`) |
| Run logs | `gh run view <id> --log` |
| PRs | `gh pr list --state all` (filter by date/window as needed) |
| PR CI | `gh pr checks <number>` |
| PR diff | `gh pr diff <number>` |
| Agent behavior | Manual review of recent agent transcripts and PR bodies |

**Default window:** **N = 30** runs (same limit as `gh run list`). State the window and date range in the report.

Also read existing `eval-report.md` for prior baseline when present.

If `playwright.yml`, **`gh`**, or run logs are unavailable, document that under each affected metric as **insufficient data**.

## Workflow

1. Decide **mandatory vs skip** (above).
2. Collect inputs for the last **N** runs and relevant PRs in the same time span.
3. Compute each metric below. Missing evidence → **`insufficient data`** for that metric — never guess a number.
4. Write or replace **`eval-report.md`** at repo root using the template below.
5. End with **Top reliability risk** and **Next action** (one line each).

Emit the repo **Proposal** block (constitution) before editing when the refresh will change committed files and confidence is below 8.

## Metrics

For each metric, record: **value** (numerator/denominator), **how measured**, **one-line interpretation**.

### 1. Flake rate

**Definition:** tests that passed only on retry / tests in passing runs.

**How to measure:** From run logs and Playwright reporter output in the N-run window, count tests that failed on first attempt then passed on retry (or job-level retry) vs total tests executed in runs that ultimately passed. State which denominator convention you used (total executions vs unique tests in passing runs). Exclude global teardown **cleanup 404** lines — noise, not flakes (see Rules).

### 2. Heal success rate

**Definition:** heal PRs green on first CI with assertions unchanged / all heal PRs.

**How to measure:** PRs whose branch name matches `heal/*` and/or PR body cites [self-heal](../self-heal/SKILL.md) (`assertions unchanged`, locator patch). **Numerator:** first CI on that PR green **and** `gh pr diff` shows changes only under `pages/` (no net weakening in `tests/`). **Denominator:** all heal PRs in window. **Masked regressions:** count PRs where `expect` was removed, weakened, commented out, or replaced with snapshot booleans — must report **0**; any > 0 is called out in interpretation.

### 3. Generation-gate pass rate

**Definition:** ticket-first PRs that are CI green + conforming + mapped to AC / all ticket-first generation PRs.

**How to measure:** PRs that reference a Jira key (`AQPBT-*`) and add/change specs under `tests/`, and/or implement scenarios from `features/<ticket-key>.feature.md`. **Pass** = CI green + one tag per test + POM/fixture conventions per constitution ([pom-conventions](../pom-conventions/SKILL.md), [api-cleanup](../api-cleanup/SKILL.md) when data is created) + PR description or linked ticket shows AC coverage (spot-check diff vs Jira `getJiraIssue` when Atlassian MCP is available). **Denominator:** all such generation PRs in window. If AC mapping cannot be verified → **insufficient data** for that PR’s pass/fail slice, or count as non-pass only when evidence shows mismatch.

### 4. Ask vs guess

**Definition:** explicit asks vs invented values.

**How to measure:** Qualitative is fine — sample recent agent transcripts and PRs for moments the agent asked the human vs assumed env vars, copy, routes, or ticket fields not in repo/ticket/MCP. Summarize as ratio or tier (e.g. mostly asks / mixed / frequent guesses) and **say how measured** (which sessions, how many reviewed).

## Rules

- Missing data → **`insufficient data`**, never a guess
- Cleanup **404**s are noise, not flakes
- End with the **top reliability risk** and the **next action**
- Report only — no tickets, no test changes; update **`eval-report.md`** only

## Output: `eval-report.md`

Write or replace at repo root using this structure:

```markdown
# Eval report

**Generated:** <ISO date>  
**Window:** last N=<30> `playwright.yml` runs; PRs <date range>  
**Trigger:** <heal PR | generation PR | triage | stale | manual>

## Summary

| Metric | Value | How measured | Interpretation |
| ------ | ----- | ------------ | -------------- |
| Flake rate | | | |
| Heal success rate | | | |
| Generation-gate pass rate | | | |
| Ask vs guess | | | |

## Details

### Flake rate
- **Value:** … / …
- **How measured:** run ids …
- **Interpretation:** …

### Heal success rate
- **Value:** … / …
- **Masked regressions (expect weakened/removed):** 0 required — actual: …
- **How measured:** PRs …
- **Interpretation:** …

### Generation-gate pass rate
- **Value:** … / …
- **How measured:** PRs …; AC sources (Jira MCP / PR body) …
- **Interpretation:** …

### Ask vs guess
- **Assessment:** …
- **How measured:** … sessions/PRs reviewed
- **Interpretation:** …

## Evidence log

- Runs: …
- PRs: …
- Transcripts / notes: …

## Top reliability risk

…

## Next action

…
```

## Gate

After `eval-report.md` is written (or skip noted), **stop**. Do not open Jira from this skill.

## Related skills

- Red run diagnosis: [ci-failure-triage](../ci-failure-triage/SKILL.md)
- Heal PRs: [self-heal](../self-heal/SKILL.md)
- Product failures: [jira-bug-reporter](../jira-bug-reporter/SKILL.md)
