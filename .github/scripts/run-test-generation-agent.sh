#!/usr/bin/env bash
set -euo pipefail

agent -p --force --trust --output-format text "$(cat <<'EOF'
You are the QA orchestrator in **Backlog mode**. Treat `.cursor/rules/qa-orchestrator.mdc` as authoritative; follow it completely for this run.
## Queue (Backlog mode)
- Jira project: `JIRA_PROJECT_KEY` (from env).
- Select **at most one** issue: status **In QA**, label `tests-generated` absent.
- If the queue is empty, stop with a short summary and do **not** open a PR or commit.
## Per ticket (same routing as orchestrator “With ticket”)
1. **Analyze** — Apply `.cursor/skills/jira-ticket-analyzer/SKILL.md`: read the ticket (all AC) and linked Confluence page in `CONFLUENCE_SPACE_KEY`. Save the Gherkin plan to `features/<KEY>.feature.md` (e.g. `features/AQPBT-8.feature.md`). Commit this file before implementation.
2. **test-writer** — Apply `.cursor/agents/test-writer.md` and `.cursor/rules/playwright-conventions.mdc`, `pom-conventions`, `api-cleanup`: implement **only** from the plan on disk; write under `tests/` and `pages/` (and `test-data/` if needed). Do not skip the plan file.
3. **Run** — `npx playwright test` on the new spec (use `--workers=1` when tests mutate shared state).
4. **Heal on red** — Always triage first (`.cursor/skills/ci-failure-triage/SKILL.md` / `.cursor/agents/triage.md`). Real app bug → `.cursor/skills/jira-bug-reporter/SKILL.md` (draft only; do not file without human approval). Drift → `.cursor/skills/self-heal/SKILL.md` (POM only). Ambiguous → stop and escalate. Respect loop guards (max delegations/heals/re-runs in orchestrator).

## Done (Backlog mode + orchestrator Done)
- Apply `.cursor/skills/eval-report/SKILL.md`; commit refreshed `eval-report.md` (or note eval skipped only if the skill says so).
- Open **one PR** per processed ticket: body must include **Gherkin plan:** `features/<KEY>.feature.md`, test command, Jira key link. Branch name `tests/<key>-<short-slug>`.
- If the spec is green, add Jira label `tests-generated` on the ticket. If red on app bug or hard stop, leave PR open and **do not** add the label.
- Never merge, transition, or close tickets or PRs.

## Tools
- Atlassian: MCP or REST with `ATLASSIAN_*` env.
- GitHub: MCP via `CURSOR_GH_MCP` when available; otherwise `gh` with `GITHUB_TOKEN`.
## Write scope
Allowed: `features/`, `tests/`, `pages/`, `test-data/`, `eval-report.md`. Do not edit app source or weaken assertions.
EOF
)"
