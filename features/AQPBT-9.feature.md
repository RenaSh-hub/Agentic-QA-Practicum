Feature: [Anna] Playdates: matched slots and manual propose form: propose a playdate to a circle family

# Happy paths

Scenario: AC1 — Signed-in Family A sees the propose shell
  Given I am signed in as Family A (Lev Test, `APP_USER_EMAIL`) with a completed dashboard and a circle
  When I open `/playdates`
  Then the URL is `/playdates`
  And banner **Playdates** is visible
  And heading **Find a playdate** is visible
  And the text **Pick a family, choose a matched slot or propose a manual time, then wait for the other parent to approve.** is visible
  And the text **Propose** is visible
  And button **Send request** is visible
  And **Send request** is not clicked

Scenario: AC2 — Family combobox lists only circle families
  Given I am signed in as Family A on `/playdates`
  When matched availability has loaded
  Then the family combobox options are only **The Nguyens** and **The Petrovs**

Scenario: AC3 — Selected circle family shows a matches badge and a matched slot
  Given I am signed in as Family A on `/playdates`
  And the family combobox has **The Nguyens** selected
  When matched availability has loaded
  Then a badge whose text matches `/^\d+ matches$/` is visible
  And at least one button is visible whose accessible name matches `/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d{1,2}:\d{2}(?:am|pm)-\d{1,2}:\d{2}(?:am|pm) out$/`
  And the observed **The Nguyens** shape on 2026-10-13 was `Sun, Oct 18 1:00pm-2:00pm out` (do not freeze that date)

Scenario: AC4 — Selecting a matched slot disables the place combobox
  Given I am on `/playdates` with **The Nguyens** selected
  And the place combobox is enabled before a slot is chosen
  When I select the first matched slot button for **The Nguyens**
  Then the place combobox is disabled
  And the URL is still `/playdates`

Scenario: AC5 — Place options when no matched slot is selected
  Given I am on `/playdates` and no matched slot has been selected
  And the place combobox is enabled
  When I view its options
  Then I see **Out / neutral place** and **My place**

Scenario: AC6 — Family A can change which children are checked
  Given I am on `/playdates` as Family A and matched availability has loaded
  Then checkbox **Mia** is checked
  And checkbox **Maria** is checked
  When I uncheck **Mia**
  Then checkbox **Mia** is unchecked
  And the URL is still `/playdates`
  And I check **Mia** again so the form returns to the default

Scenario: AC7 — No pending requests
  Given I am on `/playdates` as Family A
  And Family A has no pending playdates (observed count 0 on 2026-10-13)
  When I view Pending requests
  Then the pending card shows **0**
  And the text **No pending requests.** is visible

# Negative

Scenario: AC8 — Parent without a dashboard family sees the setup gate
  Given I am signed in as a newly registered parent who has not set up a family on the Dashboard
  When I open `/playdates`
  Then the text **Set up your family on the Dashboard before planning playdates.** is visible
  And the text **Propose** is not visible
  And button **Send request** is not visible
  And heading **Find a playdate** is not visible

Scenario: AC9 — No upcoming playdates
  Given I am on `/playdates` as Family A
  And Family A has no upcoming playdates (observed count 0 on 2026-10-13)
  When I view Upcoming
  Then the upcoming card shows **0**
  And the text **No upcoming playdates yet.** is visible

# Edge cases

Scenario: Changing the circle family refreshes matched slots
  Given I am on `/playdates` as Family A and **The Nguyens** slots have loaded
  When I select **The Petrovs** in the family combobox
  Then a badge whose text matches `/^\d+ matches$/` is visible
  And a matched slot button whose accessible name ends with **at The Petrovs** is visible
  And no matched slot button whose accessible name ends with **out** is visible

<!--
Ambiguities and gaps:
- Jira AC1–9 plus Confluence page "[Anna] Playdates: matched slots and manual propose form" (pageId 316080131, space AQPBT). Feature map is linked and was not used as the contract.
- Ticket example location "at The Gorfels" was not on the test site on 2026-10-13. The Nguyens slots ended with location token **out**. The Petrovs slots ended with **at The Petrovs** (example shape: `Sat, Oct 17 2:00pm-5:00pm at The Petrovs`). Assert the pattern, not a calendar date.
- Badge copy is `/^\d+ matches$/`. Both families showed **6 matches** on 2026-10-13 while only three slot buttons were visible. Do not assert 6 or that the badge count equals the button count (Confluence open question).
- Matches load asynchronously. A fast read can show **Loading matches...** and **No automatic matches yet for The Nguyens. Use a manual time below.** Wait with web-first expect for the badge or a slot button. Do not assert the loading or empty-match copy.
- **Propose**, **Pending requests**, and **Upcoming** are exact text nodes (`card-title` in the DOM). The count **0** is a sibling span. Scope the count with `getByText('<title>', { exact: true }).locator('..').getByText('0', { exact: true })`. Do not use CSS class or XPath locators. There are multiple **0** spans on the page.
- Banner **Playdates** is Confluence "Screens", same pattern as `calendarTitle`: add `playdatesTitle` on `HeaderComponent` (`banner.getByText('Playdates', { exact: true })`). Nav link **Playdates** already exists as `header.playdates`.
- Existing POM: `PlaydatesPage.heading`, `goto()`, `propose` (`ProposePlaydateForm`: `family`, `place`, `child(name)`, `chooseSlot`, `sendRequest`). Add only the locators and actions this plan names. No `expect()` in `pages/`.
- Place options are `<option>` elements **Out / neutral place** and **My place** (default **Out / neutral place**). They are in the accessibility tree without opening a popup. After `chooseSlot` on the first Nguyens button, `propose.place` is disabled (`aria-pressed` was null on the slot; do not assert pressed).
- Child checkboxes **Mia** and **Maria** belong to Family A and start checked. Uncheck then recheck **Mia** in the same test so the form is left as found. Do not click **Send request** (Jira out of scope). No playdate record is created; cleanup is still `fixtures/cleanup.fixture.ts`.
- AC8: named Family B "Anna Procopov" is not `APP_ALT_USER_*`. The alt account on 2026-10-13 showed **Invite a trusted family first. Matches appear once your circle has at least one connection.** and still had a dashboard. Do not use alt storage for AC8. Register a unique parent with `signupAccount()` on `SignupPage` under `signupEmptyStorageState` (register response is auto-tracked). Then open `/playdates`. Confirmed gate copy on a fresh account: **Set up your family on the Dashboard before planning playdates.**
- AC7 and AC9 depend on shared Family A list state. If pending or upcoming is no longer empty, stop and escalate — do not delete another parent's playdates and do not weaken the assertion.
- Manual date/time textboxes have no accessible name (`ProposePlaydateForm` uses `nth`). Confluence asks what they represent and whether they sync with a slot. Out of this plan.
- Out of scope: clicking **Send request**, Accept / Decline / cancel, Google / ICS, `/playdates/new`, email confirm, past **Cancelled** rows, empty-circle gate, Family B approval.
- Suggested spec: `tests/aqpbt-9-playdates-propose.spec.ts`. Tags: AC1 `@sanity`; AC2 and AC3 `@sanity`; all other scenarios `@regression`. One tag per `test()`, never on `describe()`.
- `playwright.config.ts` `app` project already uses `AUTH_FILE`. Logged-out AC8 overrides with `signupEmptyStorageState`.
-->
