---
name: exploratory-charter
description: Turns a feature name and a risk into a session charter and a blank findings template. Use when the user asks for an exploratory charter, session charter, exploratory testing plan, or wants to structure a time-boxed exploration before or after clicking through the app. The tester supplies the thinking; this skill only enforces the format.
---

# Exploratory session charter

**Format only** — never invent risks, oracles, or findings.

## Required inputs

- **Feature** and **risk** (ask if missing).
- **Optional:** time box, scope in/out, ticket key (e.g. `AQPBT-N`), Confluence page (title or link from ticket/MCP — do not invent URLs), page URL (path under `APP_URL` when known).

Do not proceed without feature + risk from the human. Optional fields stay blank or `(not provided)` — do not fill them with guesses.

**Feature slug:** lowercase, hyphenated from the feature name (e.g. `Family calendar` → `family-calendar`).

## Workflow

1. Collect required and optional inputs (stop and ask if feature or risk is missing).
2. Write the charter + findings sections below into one file (human fills **Oracles**, **Areas to probe**, **Notes before start**, **Mission**, and all finding rows during/after the session). Populate table cells only from user-supplied text for **Feature** and **Risk**; optional fields from user input or `(not provided)`.
3. Save as `charters/<feature-slug>.md` (create `charters/` if needed).

## Output template

Copy into the output file verbatim structure; do not pre-populate observations or judgment sections.

```markdown
# Session charter: <Feature>

| Field | Value |
| ----- | ----- |
| **Feature** | |
| **Risk** | |
| **Time box** | |
| **In scope** | |
| **Out of scope** | |
| **Ticket** | |
| **Confluence** | |
| **Page URL** | |

## Mission

<!-- One paragraph: what this session must learn or disprove. Human writes. -->

## Oracles (human)

<!-- How you will judge pass/fail: AC, product rules, comparable flows, heuristics. Human writes. -->

## Areas to probe (human)

<!-- Bulleted list of flows, states, or data combinations to touch. Human writes. -->

## Notes before start

<!-- Environment, account role/family, starting URL, data preconditions. Human writes. -->

---

## Findings

| # | Type (bug / question / note) | Area | Observation | Severity | Follow-up |
| --- | --- | --- | --- | --- | --- |
| 1 | | | | | |

<!-- Add rows during the session. Do not pre-populate observations. -->

## Coverage

- **Tried:**
- **Not tried:**
- **Charter done?** (yes / no / partial — human)
```

## Do / Don't

| Do | Don't |
| --- | --- |
| Ask for feature + risk before writing | Invent risks, missions, oracles, or findings |
| Use blank or `(not provided)` for unknown optional fields | Guess Confluence URLs, ticket keys, or UI behavior |
| Save under `charters/<feature-slug>.md` | Write `tests/`, `features/*.feature.md`, or Jira bugs here |
| Leave comment placeholders and empty finding cells for the tester | Run Playwright or browser exploration as part of this skill |

## Gate

- Do **not** write specs, file bugs, or run tests here.
- After save, stop. Follow-up: [jira-bug-reporter](../jira-bug-reporter/SKILL.md) for confirmed defects; [explore-and-generate](../explore-and-generate/SKILL.md) for automation gap discovery; [jira-ticket-analyzer](../jira-ticket-analyzer/SKILL.md) when a ticket already defines AC.
