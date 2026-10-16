---
name: jira-bug-reporter
description: Analyzes Playwright test failures, identifies root cause, and creates detailed Jira bug tickets. Use when a test fails and needs investigation and bug reporting.
---

# Jira Bug Reporter (Playwright failures)

Turn a failing Playwright run into a reviewed Jira Bug linked to the originating story. BuddyTime application source is not available — describe observable UI/API behavior precisely from the test, trace, and live reproduction.

## Prerequisite

Re-run `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json`. Trust that stdout only — not a saved decision file, not a triage label in chat.

| Live scorer | Action |
| --- | --- |
| `act` and `side` `bug` | Draft, then file with `createJiraIssue` (`issueType`: `Bug`) after the human reviews the draft |
| `escalate` and `.test-artifacts/approvals/<decisionId>.json` exists (human-created) | Same |
| `act` and `side` `drift` | **Stop** — [self-heal](../self-heal/SKILL.md); do not file |
| `inconclusive` or `escalate` without an approval file | **Stop** — do not file |

The Atlassian create-issue field for type is `issueType`. In project AQPBT the bug type name is `Bug`.

## Workflow

1. **Read the failure:** assertion message, stack trace, screenshot and trace paths under `test-results/`.
2. **Confirm it reproduces:** re-run the failing test once (e.g. `npx playwright test <path-to-spec> -g "<test title>"`).
3. **Identify the root cause** from the spec, the page object, and the app's behavior (BuddyTime's source is not available to us — describe the behavior precisely).
4. **Search Jira** project `JIRA_PROJECT_KEY` (from `.env.example` or the user's environment, e.g. `AQPBT`) for a similar open bug before drafting a new one. Use Atlassian MCP `searchJiraIssuesUsingJql` — e.g. open bugs in the project whose summary or description matches the failure symptom, component, or Playwright locator text.
5. **Draft** the ticket with:
   - **Title** (specific)
   - **Type:** Bug
   - **Severity**, **Priority**
   - **Steps to reproduce** (numbered, from login, naming which family does what — e.g. Family A / Family B from auth setup, not credentials)
   - **Expected** (from the AC or the Confluence page linked on the story)
   - **Actual**
   - **Environment** (the `APP_URL` host, browser, account role — never an email or password)
   - **Evidence** (screenshot and trace paths)
   - The exact **Playwright error**
   - **Linked story** (`AQPBT-N`)
6. **Show the draft to the human.** File it with the Atlassian MCP only after approval, and link it to the originating story (`createJiraIssue` / issue link or parent as the project uses).

## Triage before filing

| Live scorer | Action |
| -------- | ------ |
| act + bug (or escalate + approval file) | Draft bug per workflow |
| act + drift | Heal the test — do **not** file a Jira bug |
| inconclusive because the re-run passed | Flake — do **not** file as a product bug |

Constitution: triage first; never heal a real bug by weakening assertions.

## Draft template

Present this block to the human for approval:

```markdown
## [Bug title]

**Type:** Bug  
**Severity:** …  
**Priority:** …  
**Linked story:** AQPBT-N

### Steps to reproduce
1. …

### Expected
…

### Actual
…

### Environment
- Host: … (from APP_URL)
- Browser: …
- Role / family: … (no emails or passwords)

### Evidence
- Screenshot: test-results/…
- Trace: test-results/…

### Playwright error
```
(paste exact assertion / error)
```

### Duplicate check
- Searched: …
- Result: none / link to AQPBT-…
```

## Rules

- Never file for a test issue or a green run; never include credentials.
- Read the originating story (and linked Confluence page in `CONFLUENCE_SPACE_KEY` when present) via Atlassian MCP before writing Expected.
- Do not invent ticket keys, custom field values, or UI copy — use repo specs, POMs, failure output, and MCP ticket/Confluence content.
- If a duplicate open bug exists, summarize findings and offer to comment on that issue instead of creating a new one.

## Gate

Stop after presenting the draft unless the live scorer allows filing (`act` + `bug`, or `escalate` plus a human approval file) **and** the human explicitly approves the draft text. Only then call `createJiraIssue` with `issueType` `Bug` and confirm the key + link to the story. The hook re-runs the scorer on that MCP call; do not file via a saved decision file.

## Repo context

- Resolve Atlassian `cloudId` once via `getAccessibleAtlassianResources` when the MCP session has no site context. If issue link type (parent vs link) is unclear, infer from existing AQPBT tickets before creating.
- **Family A** = main auth family (`auth.setup`, default `storageState`). **Family B** = alt family for two-parent flows — match the failing spec’s project/fixture, not env email values.
- Keys: `JIRA_PROJECT_KEY`, `APP_URL`, `CONFLUENCE_SPACE_KEY` from `.env.example` or the user’s environment.
