# Explore: Calendar — family calendar shell

## Coverage snapshot

| Page / area | Flow (short) | Spec / POM reference | Status |
| --- | --- | --- | --- |
| `/calendar` | Open route while signed in (main family) | `CalendarPage.goto()` — no spec | **Gap** |
| `/calendar` | Sidebar **Calendar** from another signed-in page | `HeaderComponent.openCalendar()` — no spec | **Gap** |
| `/calendar` | See **Your family calendar** month grid | `CalendarPage.familyCalendar` — no spec | **Gap** |
| `/calendar` | **This week** list (plans or empty copy) | `CalendarPage.thisWeek` — no spec | **Gap** |
| `/calendar` | **Birthdays this month** list (entries or empty copy) | `CalendarPage.birthdaysThisMonth` — no spec | **Gap** |
| `/calendar` | Top bar **Notifications** (empty inbox) | `HeaderComponent.notifications` — no spec | **Gap** |
| `/calendar` | **Log out** from calendar | `HeaderComponent.logOut` — no spec | **Gap** |
| `/calendar` | Logged-out visit → login gate (no calendar chrome) | — | **Gap** |
| `/login` | Heading smoke only | `tests/login.spec.ts` | **Partial** (not calendar) |
| `/app` | Post sign-up dashboard | `tests/aqpbt-4-sign-up.spec.ts` AC14 | **Partial** (does not open calendar) |

Live UI notes (read-only crawl, main family `playwright/.auth/user.json`, `https://test.buddytime.ca/calendar`): signed-in page shows banner label **Calendar**, month line (e.g. **October 2026**), **Your family calendar** with weekday row, **This week** with **No plans in the next 7 days.**, **🎂 Birthdays this month** with empty copy when none (e.g. **No birthdays in October.**). No prev/next month controls observed. Date cells are plain text (no `gridcell` roles). **Discover** / **Go Premium** present in sidebar but not calendar-specific.

## Selected gap

**Flow:** Signed-in main family opens `/calendar` and sees the family calendar planning shell (grid + **This week** + **Birthdays this month**).

**Why this run:** The route and POM exist but no Playwright spec touches `/calendar`; this is the smallest high-signal slice before navigation-from-dashboard or data-dependent birthday/plan rows.

## Gherkin test plan

Feature: Family calendar shell for signed-in parents

# Happy path

## Scenario: Signed-in parent sees the calendar planning sections
- **Given** I am signed in as the main test family (project `app` storage state)
- **When** I open `/calendar`
- **Then** the URL path is `/calendar`
- **And** the top bar shows **Calendar**
- **And** **Your family calendar** is visible
- **And** **This week** is visible
- **And** **Birthdays this month** is visible
- **And** **Log out** is visible

# Edge case

## Scenario: Logged-out visitor cannot see the family calendar
- **Given** I have no signed-in session (empty storage state)
- **When** I open `/calendar`
- **Then** the URL path is `/login`
- **And** heading **Welcome back** is visible
- **And** **Your family calendar** is not visible

## Locator hints

- `CalendarPage.familyCalendar` → `getByText('Your family calendar', { exact: true })`
- `CalendarPage.thisWeek` → `getByText('This week', { exact: true })`
- `CalendarPage.birthdaysThisMonth` → `getByText('Birthdays this month')` (emoji prefix **🎂** is adjacent text in the live UI; prefer the POM string unless snapshot shows a heading role)
- Empty copy (optional soft asserts): `getByText('No plans in the next 7 days.')`; birthdays empty message is month-specific — use `getByText(/^No birthdays in /)` only if AC requires empty state
- Top bar title: `getByRole('banner').getByText('Calendar', { exact: true })` or reuse `HeaderComponent.logOut`
- Logged-out gate: `LoginPage.heading` → `getByRole('heading', { name: 'Welcome back', exact: true })`

## For test-writer

- **Suggested spec:** `tests/calendar.spec.ts` (or `tests/explore-calendar.spec.ts`)
- **POM updates:** None required for shell scenario; optional locators later for empty-state paragraphs or month title if product stabilizes accessible names
- **Tag:** `@sanity` for signed-in shell; logged-out redirect can share the same file with empty `storageState` helper (mirror `signupEmptyStorageState` pattern)
- **Cleanup:** None — read-only; no `trackRecord` for this flow

## Suggested Jira story

- **Title:** Family calendar page shows planning shell for signed-in parents
- **Description:** Parents use Calendar to see the month grid, upcoming week, and birthdays. Automated tests should guard the signed-in shell and ensure logged-out users are sent to login instead of seeing family data.
- **Acceptance criteria:**
  - Signed-in main family on `/calendar` sees **Your family calendar**, **This week**, and **Birthdays this month**, plus **Log out**
  - Logged-out user navigating to `/calendar` lands on `/login` with **Welcome back** and no family calendar copy
