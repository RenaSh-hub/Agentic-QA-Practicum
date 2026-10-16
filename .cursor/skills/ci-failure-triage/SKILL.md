---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error and trace, cross-reference the spec, POM, and documented behavior (AC/Confluence), classify real app bug vs test issue, and post a structured diagnosis to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI failure triage (Playwright)

Diagnose red CI or local Playwright runs without merging fixes. Name **where** and **why** — not only the assertion text.

## Steps

1. Pull the failed run's logs and the playwright-report artifact (GitHub MCP, or
   `gh run view <id> --log` and `gh run download <id>`). For a local red run, use the
   local report and `test-results/`.
2. Read the error: failing test, expected vs received, trace path. Inspect the trace
   from the command line with `npx playwright trace`. Quote the aria snapshot from the
   error context when Playwright includes one.
3. Cross-reference the spec, the page object, the story's acceptance criteria, and the
   Confluence page. BuddyTime's source isn't in this repo; compare against the
   documented behavior instead.
4. Collect evidence items that point at real artifacts (`artifact`, `line`,
   `excerpt`). Never put `score`, `confidence`, or `weight` in the evidence file.
   Write `.test-artifacts/evidence/<run>-<test>.json` (sanitize the test title for
   the filename) and copy it to `.test-artifacts/evidence/current.json`.
5. Re-run once with `--reporter=json`. The evidence file's decision id is the
   first 12 hex characters of its sha256. Save that JSON at
   `.test-artifacts/reruns/<decisionId>.json`. A re-run that **passes** is
   inconclusive (flaky), not drift — do not collect drift-side items for it.
6. Run the scorer and trust only its stdout (not a saved decision file, not a
   chat label):

   `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json`

7. Report: root cause, affected file and line, expected/actual, suggested fix,
   the scorer's `decision`, `side`, `score`, `rule`, and `allowedActions`, plus
   `missing` / `contradictions` — as a PR comment when a PR exists, otherwise
   to the parent agent.

## Classification guide

| Class | Signals |
| ----- | -------- |
| test issue (drift) | Locator/copy/route changed; expectation no longer matches AC; wrong test data; env/credentials in CI config |
| real app bug | App behavior contradicts Jira AC or Confluence; reproduces on re-run; POM/spec align with docs |
| inconclusive (not drift) | The same test **passes on re-run** with no product change (scorer rule 3 / flaky). Do not heal and do not file a bug. |
| ambiguous | Conflicting docs, cannot repro locally, or missing artifact — state what is needed to decide |

Routing after this skill uses the **scorer decision**, not the labels in this table. **act + bug** → [jira-bug-reporter](../jira-bug-reporter/SKILL.md) (draft only; do not file Jira without that workflow's gate). **act + drift** → [self-heal](../self-heal/SKILL.md).

## Report template

Post this (markdown) on the PR or return to the parent agent:

```markdown
## CI triage — <workflow or job name>

**Run:** `<github run id or "local">`  
**Scorer:** `decision` / `side` / `score` / `rule` / `allowedActions` (from live `score-evidence.ts`; never a saved decision file)

### Failing test
`<spec path>` — `<test title>`

### Root cause
<One paragraph: why it failed, not only what assertion said>

### Location
- **File:line:** `path/to/file.ts:123`
- **Expected:** …
- **Actual:** …

### Evidence
- Trace: …
- Screenshot: …
- Aria snapshot (if any): …

### Suggested fix
<Concrete next step for a human or follow-up agent — no auto-merge>

### Next step
- act + drift → self-heal (POM only)
- act + bug → jira-bug-reporter draft; file only after the Jira gate
- escalate → show the evidence table; wait for `.test-artifacts/approvals/<decisionId>.json`
- inconclusive → stop; list `missing` and `contradictions`

### AC / docs checked
- Story: AQPBT-N (if known)
- Confluence: … (if linked on story)
```

## Rules

- Never merge or apply a fix yourself; a real defect goes to jira-bug-reporter;
  the diagnosis names the location and the cause, not just the symptom.

## Repo context

- Story keys and AC: Atlassian MCP (`getJiraIssue`); Confluence in `CONFLUENCE_SPACE_KEY` from `.env.example`.
- Specs under `tests/`; locators and actions under `pages/` — no inline locators in specs.
- Do not invent run IDs, artifact names, or ticket keys; use CI output or ask the human.
