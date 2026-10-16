# Explore: App shell — Go Premium upsell

## Coverage snapshot

| Page / area | Flow (short) | Spec / POM reference | Status |
| --- | --- | --- | --- |
| Signed-in sidebar | **Go Premium** visible | `HeaderComponent.goPremium` — no spec | **Gap** |
| Signed-in sidebar | Click **Go Premium** → coming-soon feedback | `HeaderComponent.openGoPremium()` — no spec | **Gap** |
| `/app` | Logged-out gate for dashboard | `tests/aqpbt-4-sign-up.spec.ts` (partial) | **Partial** (not Go Premium) |
| `/calendar` | Sidebar **Go Premium** noted in explore only | `features/explore-calendar-family-calendar-shell.feature.md` | **Partial** |

Live UI notes (read-only crawl + Playwright probe, main family `playwright/.auth/user.json`, `https://test.buddytime.ca/app`): **Go Premium** is a button in the sidebar (`complementary` region). Click leaves URL at `/app`; feedback is a `role=status` node with text **Premium — coming soon! ✨** (not `role=alert`). A second click keeps the same status visible. Logged-out `/app` redirects to `/login` with **Welcome back**; **Go Premium** is not present.

## Selected gap

**Flow:** Signed-in parent activates **Go Premium** and sees coming-soon status feedback without leaving the dashboard.

**Why this run:** POM already exposes the control but no spec asserts the only user-visible outcome on the live app (coming-soon status, not a purchase screen).

## Gherkin test plan

Feature: Sidebar Go Premium upsell for signed-in parents

# Happy path

## Scenario: Signed-in parent sees coming-soon feedback after Go Premium
- **Given** I am signed in as the main test family
- **When** I open `/app`
- **Then** button **Go Premium** is visible
- **When** I activate **Go Premium**
- **Then** the URL path is `/app`
- **And** status feedback **Premium — coming soon! ✨** is visible

# Edge case

## Scenario: Logged-out visitor does not see Go Premium on the dashboard route
- **Given** I have no signed-in session
- **When** I open `/app`
- **Then** the URL path is `/login`
- **And** heading **Welcome back** is visible
- **And** button **Go Premium** is not visible

## Locator hints

- `HeaderComponent.goPremium` → `page.getByRole('complementary').getByRole('button', { name: 'Go Premium' })`
- Coming-soon feedback → `page.getByRole('status').filter({ hasText: 'Premium — coming soon! ✨' })` (status has no accessible name in the live app)
- Logged-out gate → `LoginPage.heading` (`Welcome back`)

## For test-writer

- **Suggested spec:** `tests/aqpbt-17-go-premium.spec.ts`
- **POM updates:** Add `premiumComingSoonStatus` on `HeaderComponent`; reuse `openGoPremium()`
- **Tag:** `@sanity` on signed-in scenario; `@regression` on logged-out scenario
- **Cleanup:** None — read-only

## Suggested Jira story

- **Title:** [Rena] Sidebar: Go Premium upsell shows coming-soon feedback
- **Description:** Parents may try **Go Premium** from the sidebar before purchase exists. Tests should guard visible upsell control and coming-soon feedback, and ensure logged-out users never see the upsell.
- **Acceptance criteria:**
  - Signed-in main family on `/app` sees **Go Premium**; activating it keeps `/app` and shows **Premium — coming soon! ✨**
  - Logged-out user on `/app` lands on `/login` with **Welcome back** and no **Go Premium** button
