Feature: [Irina] Dashboard: manage kids (Change avatar, remove, add-child form)

# Happy paths

Scenario: AC1 — Signed-in Family A sees children, add-child form, and matching My Kids count
  Given I am signed in as Family A
  When I open `/app`
  Then the URL is `/app`
  And banner **Dashboard** is visible
  And Family A's family name and parent display name are visible
  And each existing child row shows `{name}, {age} · {Boy|Girl}`, interest tags where set, button **Change avatar**, and button **remove**
  And the add-child form shows textbox **Child's first name**, spinbutton **Birth year**, spinbutton **Month**, textbox **Interests (comma-separated)**, combobox **Gender**, avatar buttons **Fox**, **Dino**, **Robot**, **Cat**, **Penguin**, **Unicorn**, **Bear**, **Bunny**, **Frog**, **Owl**, **Lion**, **Panda**, **Whale**, **Ladybug**, **Rocket**, and **Ball**, interest chips **+ LEGO**, **+ Minecraft**, **+ Soccer**, **+ Art**, **+ Reading**, **+ Dance**, **+ Hockey**, and **+ Crafts**, and button **Add child**
  And **My Kids** shows the same numeric count as listed child rows

Scenario: AC2 — Change avatar opens the inline editor
  Given I am signed in as Family A on `/app` with at least one child row
  When I activate **Change avatar** on that child
  Then buttons **Fox**, **Dino**, **Robot**, **Cat**, **Penguin**, **Unicorn**, **Bear**, **Bunny**, **Frog**, **Owl**, **Lion**, **Panda**, **Whale**, **Ladybug**, **Rocket**, and **Ball** are visible
  And combobox **Gender** shows **Prefer not to say**, **Boy**, and **Girl**
  And button **done** is visible

Scenario: AC3 — Done without changing the icon closes the editor and keeps the row
  Given I am signed in as Family A on `/app` and the avatar editor is open for a child
  When I activate **done** without selecting a different icon
  Then button **done** is not visible
  And that child row still shows the same summary line and interest tags as before the editor opened

Scenario: AC4 — + LEGO appends LEGO to Interests
  Given I am signed in as Family A on `/app` at the add-child form
  When I activate **+ LEGO**
  Then textbox **Interests (comma-separated)** contains **LEGO**

# Negative

Scenario: AC5 — Empty Add child focuses Birth year and does not add a row
  Given I am signed in as Family A on `/app`
  And **Child's first name**, **Birth year**, **Month**, and **Gender** are empty / default
  When I activate **Add child**
  Then spinbutton **Birth year** is focused
  And no new child row appears
  And **My Kids** is unchanged

Scenario: Partial add-child fill without a valid submit does not create a child
  Given I am signed in as Family A on `/app`
  When I fill **Child's first name** only, activate **+ LEGO**, and do not complete **Birth year**
  Then textbox **Interests (comma-separated)** contains **LEGO**
  And no new child row appears
  And **My Kids** is unchanged

# Edge cases

Scenario: AC6 — Remove drops that child row and decrements My Kids
  Given I am signed in as Family A on `/app` with a disposable child row created for this test
  When I activate **remove** on that child
  Then that child's row is no longer shown
  And **My Kids** decreases by one on the same page view
  And the URL is `/app`

Scenario: Avatar editor closes when Change avatar is activated again
  Given I am signed in as Family A on `/app` and the avatar editor is open for a child
  When I activate **Change avatar** on the same child again
  Then button **done** is not visible

<!--
Ambiguities and gaps:
- Jira AC1–6 and Confluence business rules 1–6 (page "[Irina] Dashboard: manage kids") are the in-scope contract. Product kids rules in Confluence 3.2 (name 1–60, Birth year required 2000–2100, Month optional 1–12, interests optional max 10×30, Gender optional, 16 avatars, remove has no confirm) inform edges; they do not add extra ACs.
- Family A's family name, parent display name, and baseline child rows come from live Family A data (`APP_USER_*` / `GET /api/v1/me`), not fixed literals. Confluence examples **The Gorfels** / **Lev Test** / `Mia, 7 · Girl` are exploration samples, not this family's contract.
- AC5 expected focus is **Birth year** (Jira + Confluence rule 6). Product currently focuses **Child's first name** instead — filed as AQPBT-16. Keep the Birth year assertion; do not weaken it. `test.fail` only if the instructor adds AQPBT-16 to the Known app issues table in pom-conventions.
- Successful **Add child** submit is out of scope (Jira). Do not create a child through the UI form.
- AC6 needs a disposable child. This repo's tracker only has `parent` today (`support/record-tracker.ts`); there is no children create/delete helper in `support/api-client.ts`. Confirm the children API path from a live network trace or docs before adding a `child` tracked type — do not invent the route. Do not **remove** Family A's baseline children.
- No confirm/undo on **remove** (Confluence: intended for now).
- How **Birth year** + **Month** become displayed age, and how **prefer not to say** appears in `{Boy|Girl}`, are unanswered Confluence questions — assert the live summary line, do not invent age math.
- `/profile` kids list, circle/guest, Family B concurrent edit, playdate/availability widgets: out of scope.
- Logged-out `/app` gate is already AQPBT-1 AC6; not repeated here.
- Suggested spec: `tests/aqpbt-5-dashboard-manage-kids.spec.ts`. Tag `@sanity` on AC1; `@regression` on AC2–AC5, partial fill, and editor toggle; `@destructive` on AC6 (`--workers=1`). One tag per `test()`.
- POM: `DashboardPage` already has `header` (`dashboardTitle`), `addChildForm` (`AddChildForm`: **Child's first name**, **Birth year**, **Month**, **Interests (comma-separated)**, **Gender**, **Add child**, `avatar()`, `interest()`), `changeAvatar`, `removeChild`. `AvatarPickerComponent` has `avatar()`, `gender`, `done`, `close()`. Add **My Kids**, family-name / parent-name, and per-child row helpers on `DashboardPage`; compose `AvatarPickerComponent` from the page. Put repeated avatar / chip names in `test-data/` if used in 2+ places. No inline locators in the spec.
- Cleanup: import `test`/`expect` from `fixtures/cleanup.fixture.ts`. Read-only scenarios create nothing. AC6 must track any API-created child; UI **remove** already deletes that row.
-->
