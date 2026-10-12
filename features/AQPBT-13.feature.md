Feature: [Rena] Calendar: family calendar shell for signed-in parents

# Happy paths

Scenario: AC1 — Signed-in Family A sees the family calendar shell
  Given I am signed in as Family A
  When I open `/calendar`
  Then the URL is `/calendar`
  And banner **Calendar** is visible
  And **Your family calendar** is visible
  And **This week** is visible
  And **Birthdays this month** is visible
  And button **Log out** is visible

# Negative

Scenario: AC2 — Logged-out visitor cannot see the family calendar
  Given I have no signed-in session
  When I open `/calendar`
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And **Your family calendar** is not visible
  And **This week** is not visible
  And **Birthdays this month** is not visible
  And button **Log out** is not visible

# Edge cases

Scenario: Logged-out calendar gate still shows the log-in controls
  Given I have no signed-in session
  When I open `/calendar`
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And textbox **Email** is visible
  And textbox **Password** is visible
  And button **Log in** is visible

<!--
Ambiguities and gaps:
- Jira AC1–2 and Confluence business rules 1–2 are the in-scope contract. Source explore plan: `features/explore-calendar-family-calendar-shell.feature.md`.
- Confluence business rule 3: **This week** *may* show **No plans in the next 7 days.** when nothing is scheduled. Not asserted here — Family A may already have plans; populated rows are out of scope.
- Confluence business rule 4: **Birthdays this month** *may* show month-specific empty copy (e.g. **No birthdays in October.**). Not asserted — wording depends on the current month and Family A children; populated birthday rows are out of scope.
- Month title line (e.g. **October 2026**), weekday headers, and date cells (plain text, no `gridcell` roles) were observed on the test site and are not Jira AC. Do not invent locators for them.
- Banner **Calendar** is the top-bar title (`HeaderComponent` pattern: `dashboardTitle` / `friendsTitle`). Nav link **Calendar** already exists as `header.calendar`. If `calendarTitle` is missing, add it on `HeaderComponent` the same way as `dashboardTitle` (`banner.getByText('Calendar', { exact: true })`) — do not use inline locators in the spec.
- POM already has `CalendarPage.familyCalendar`, `thisWeek`, `birthdaysThisMonth` (`getByText('Birthdays this month')` — 🎂 is adjacent in live UI), `CalendarPage.goto()` → `AppRoute.Calendar`, `LoginPage.heading`, `header.logOut`. Ticket says no new CalendarPage locators for AC1–2.
- Suggested spec: `tests/aqpbt-13-calendar.spec.ts`. Tag `@sanity` on AC1; `@regression` on AC2 and the logged-out controls edge (logged-out `/app` in AQPBT-1 uses `@regression`). Use `signupEmptyStorageState` for logged-out describes; signed-in AC1 uses the default `app` project `AUTH_FILE`.
- Cleanup: none — read-only; import `test`/`expect` from `fixtures/cleanup.fixture.ts` anyway.
- Out of scope per Jira/Confluence: sidebar open from Dashboard, month prev/next, date-cell clicks, create/edit events, populated This week or birthday rows, Notifications, Discover, Go Premium, Family B.
- Confluence open questions left unanswered: grid vs side-section labels when data exists; accessible name of the month line; whether logged-out `/calendar` could keep the URL with an overlay (Playwright observed redirect to `/login`).
-->
