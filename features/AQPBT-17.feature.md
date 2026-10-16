Feature: [Rena] Sidebar: Go Premium upsell shows coming-soon feedback

# Happy paths

Scenario: AC1 — Signed-in parent sees coming-soon feedback after Go Premium
  Given I am signed in as Family A
  When I open `/app`
  Then button **Go Premium** is visible
  When I activate **Go Premium**
  Then the URL is `/app`
  And status feedback **Premium — coming soon! ✨** is visible

# Negative

Scenario: AC2 — Logged-out visitor does not see Go Premium on the dashboard route
  Given I have no signed-in session
  When I open `/app`
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And button **Go Premium** is not visible

<!--
Ambiguities and gaps:
- Jira AC1–2 and discovery notes in `features/explore-app-go-premium-upsell.feature.md` are the contract.
- Feedback is `role=status` with visible text **Premium — coming soon! ✨**; not `role=alert`. Use `HeaderComponent.premiumComingSoonStatus` → `getByRole('status').filter({ hasText: 'Premium — coming soon! ✨' })`.
- POM: `HeaderComponent.goPremium`, `openGoPremium()` already exist; add `premiumComingSoonStatus` only.
- Suggested spec: `tests/aqpbt-17-go-premium.spec.ts`. Tag `@sanity` on AC1; `@regression` on AC2. Use `signupEmptyStorageState` for logged-out describe.
- Cleanup: none — read-only; import from `fixtures/cleanup.fixture.ts`.
- Out of scope: purchase/pricing screen, Discover toast, repeating click behavior, other routes besides `/app` entry for AC1.
-->
