# Agentic QA Practicum

**BuddyTime** is a web app for parents and guardians to coordinate family calendars, availability, and playdates. Application source is not in this repo; Playwright targets the deployed test site via `APP_URL`.

**Stories** live in Jira project **AQPBT**. **Feature pages** (acceptance context) live in Confluence space **AQPBT**. Ticket-derived Gherkin plans are saved under [`features/`](features/) as `<ticket-key>.feature.md`.

## Prerequisites

- **Node.js 20+** (matches CI)

## Install

```bash
npm ci
npx playwright install --with-deps chromium
```

## Environment

Copy the example file and fill in values for what you are doing:

```bash
cp .env.example .env
```

| Variables | Needed for | Purpose |
| --- | --- | --- |
| `APP_URL` | Running tests | Playwright `baseURL` for the BuddyTime test site |
| `APP_USER_EMAIL`, `APP_USER_PASSWORD` | Running tests | Main family account; `tests/auth.setup.ts` writes `playwright/.auth/user.json` |
| `APP_ALT_USER_EMAIL`, `APP_ALT_USER_PASSWORD` | Two-family flows only | Second parent account; setup writes `playwright/.auth/alt-user.json` or **skips** if unset |
| `CURSOR_API_KEY` | CI test-generation workflow only | Headless Cursor agent in [`.github/workflows/test-generation.yml`](.github/workflows/test-generation.yml) |
| `ATLASSIAN_*`, `JIRA_PROJECT_KEY`, `CONFLUENCE_SPACE_KEY` | CI backlog orchestrator | Jira queue and Confluence lookups in scheduled generation — not required for local `npx playwright test` |

**Why two family accounts?** The suite logs in once per family in the setup project and reuses `storageState`. The main account covers most specs; a second account is required for flows where two distinct parents interact (for example proposing or accepting playdates across families). Tests that need Family B skip when alt credentials are missing.

Auth JSON under `playwright/.auth/` is git-ignored; never commit real passwords.

## Run tests

| Goal | Command |
| --- | --- |
| Full suite (local default) | `npm test` or `npx playwright test` |
| App specs only (after setup) | `npx playwright test --project=app` |
| Smoke slice | `npm run test:smoke` |
| Sanity slice | `npm run test:sanity` |
| Regression slice | `npm run test:regression` |
| API slice | `npm run test:api` |
| E2E slice | `npm run test:e2e` |
| Destructive slice (serial) | `npm run test:destructive` |
| Single file | `npx playwright test tests/<file>.spec.ts` |
| HTML report | `npx playwright show-report` |

Projects: **`setup`** runs auth once; **`app`** runs `*.spec.ts` with stored auth ([`playwright.config.ts`](playwright.config.ts)).

## CI triggers ([`playwright.yml`](.github/workflows/playwright.yml))

| GitHub event | Test slice | Command |
| --- | --- | --- |
| `push` | Sanity | `npm run test:sanity` |
| `pull_request` | Smoke | `npm run test:smoke` |
| `workflow_dispatch` | Full suite | `npx playwright test` |

A separate [**Test generation**](.github/workflows/test-generation.yml) workflow runs on a schedule and `workflow_dispatch` to pull backlog tickets and open generation PRs (requires repo secrets).

## Agent tooling in this repo

| Path | Role |
| --- | --- |
| [`.cursor/rules/`](.cursor/rules/) | Always-on constitution, Playwright conventions, and QA orchestrator routing |
| [`.cursor/skills/`](.cursor/skills/) | Step-by-step playbooks (Jira analysis, self-heal, CI triage, eval report, POM, cleanup, etc.) |
| [`.cursor/agents/`](.cursor/agents/) | Delegates: **test-writer**, **triage**, **bug-reporter** |
| [`.cursor/hooks/`](.cursor/hooks/) | Post-edit guards that block weakened `expect()` calls and constitution violations in `tests/` and `pages/` |

## MCP setup (Cursor IDE)

Connect **Atlassian** and **GitHub** MCP in **Cursor Settings → MCP** for Jira, Confluence, and PR/CI work during agent sessions. Use OAuth or tokens configured in the IDE — **do not** put MCP credentials in `.env` for local IDE use. Repository Actions secrets (and the Atlassian block in `.env.example`) are for **CI** workflows such as test generation, not for replacing IDE MCP configuration.

## Typical flow

An orchestrator reads a Jira story and its Confluence feature page, then runs the **jira-ticket-analyzer** skill to produce Gherkin in `features/<key>.feature.md`. The **test-writer** agent turns that plan into Playwright specs and page objects, runs the suite, and opens a PR linked to the ticket. If CI or local runs fail, **triage** classifies drift versus product bug; drift goes through **self-heal**, confirmed defects go to **bug-reporter**.

Reliability metrics are tracked in [`eval-report.md`](eval-report.md).
