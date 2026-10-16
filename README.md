# Agentic QA Practicum

**BuddyTime** is a web app for parents and guardians to coordinate children’s playdates, availability, and family scheduling. Application source is not in this repo; Playwright targets the deployed test site via `APP_URL`.

**Stories** live in Jira project **[AQPBT](https://legionqaschool.atlassian.net/browse/AQPBT)**. **Feature pages** and specs live in Confluence space **AQPBT**. Generated test plans in this repo are saved under [`features/`](features/) (for example [`features/AQPBT-13.feature.md`](features/AQPBT-13.feature.md)).

## Prerequisites

- **Node.js 20+** (matches CI)

## Install

```bash
npm ci
npx playwright install --with-deps chromium
```

## Environment

Copy the template and fill in real values:

```bash
cp .env.example .env
```

| Section / variables | Needed for | Purpose |
| ------------------- | ---------- | ------- |
| `APP_URL`, `APP_USER_EMAIL`, `APP_USER_PASSWORD` | Local Playwright (`npx playwright test`) | Base URL and **Family A** credentials; project **`setup`** runs [`tests/auth.setup.ts`](tests/auth.setup.ts) once and writes `storageState` (`playwright/.auth/user.json`) for project **`app`**. |
| `APP_ALT_USER_EMAIL`, `APP_ALT_USER_PASSWORD` | Two-family / invite flows only | **Family B** second account; setup writes `playwright/.auth/alt-user.json` or **skips** alt auth if unset or still placeholder. Many specs run fine with Family A only. |
| `CURSOR_API_KEY` | [`.github/workflows/test-generation.yml`](.github/workflows/test-generation.yml) only | Headless Cursor agent for backlog test generation—not required to run tests locally. |
| `ATLASSIAN_*`, `JIRA_PROJECT_KEY`, `CONFLUENCE_SPACE_KEY` | Test-generation workflow / scripts | Atlassian REST from CI; **not** how the IDE should talk to Jira/Confluence (see MCP below). |

**Why two family accounts?** BuddyTime models separate households (invites, matching, two-parent scenarios). Family A is the default signed-in user; Family B is optional and used when a scenario needs a second real login without reusing Family A’s data. The suite logs in once per family in **`setup`** and reuses `storageState`; tests that need Family B skip when alt credentials are missing.

Never commit `.env` or `playwright/.auth/` (git-ignored).

## Run tests

| Goal | Command |
| ---- | ------- |
| Full suite (local) | `npm test` or `npx playwright test` |
| App tests only (after setup auth) | `npx playwright test --project=app` |
| By tag | `npm run test:smoke`, `test:sanity`, `test:regression`, `test:api`, `test:e2e`, `test:destructive` (`@destructive` runs with `--workers=1`) |
| Single file | `npx playwright test tests/aqpbt-13-calendar.spec.ts` |
| HTML report | `npx playwright show-report` |

Project **`setup`** runs auth before **`app`** ([`playwright.config.ts`](playwright.config.ts)).

## CI triggers

Workflow: [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)

| GitHub event | Playwright slice | Command |
| ------------ | ---------------- | ------- |
| `push` | `@sanity` | `npm run test:sanity` |
| `pull_request` | `@smoke` | `npm run test:smoke` |
| `workflow_dispatch` | Full suite | `npx playwright test` |

GitHub Actions secrets mirror the **Run tests** env vars (`APP_URL`, `APP_USER_*`, `APP_ALT_*`). Failed runs upload `playwright-report-*` artifacts.

A separate [**Test generation**](.github/workflows/test-generation.yml) workflow runs on a schedule and `workflow_dispatch` to pull backlog tickets and open generation PRs (requires repo secrets including Atlassian and `CURSOR_API_KEY`).

## Agent tooling (`.cursor/`)

| Part | Role |
| ---- | ---- |
| [`.cursor/rules/`](.cursor/rules/) | Always-on **constitution** (non-negotiables), **playwright-conventions**, and **qa-orchestrator** (ticket/CI workflow). |
| [`.cursor/skills/`](.cursor/skills/) | Step-by-step playbooks: Jira ticket analysis, explore-and-generate, POM conventions, api-cleanup, self-heal, CI triage, Jira bugs, eval report, test-data reset, exploratory charter. |
| [`.cursor/agents/`](.cursor/agents/) | Delegates: **test-writer** (plan → spec), **triage** (classify red runs), **bug-reporter** (Jira bug from confirmed defects). |
| [`.cursor/hooks/`](.cursor/hooks/) | Guards on `Write`: block weakening `expect()` in tests and constitution violations; evidence gates for heal PRs, approvals, and Jira bug creates. |

## MCP setup (Cursor IDE)

Configure **Atlassian** and **GitHub** MCP servers in **Cursor Settings → MCP**, not in `.env`. The IDE uses MCP for Jira/Confluence issues and PR/checks; `.env` Atlassian fields are for CI/automation workflows. Use OAuth or tokens configured in the IDE—do not put MCP credentials in `.env` for local agent sessions.

## Typical flow

Pick a Jira story (or a failing CI run), analyze acceptance criteria into `features/<key>.feature.md` (often via **jira-ticket-analyzer**), and delegate implementation to **test-writer**. Run the suite locally or on CI; if red, **triage** first—real bugs go to **bug-reporter**, locator drift goes through **self-heal** (POM only, assertions unchanged). Human review and merge stay outside the agent loop.

Reliability metrics are tracked in [`eval-report.md`](eval-report.md).
