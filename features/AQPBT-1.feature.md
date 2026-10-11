Feature: [Vitaly] Log in: sign in with email and password to reach the signed-in app

# Happy paths

Scenario: AC8 — Log in from landing opens Welcome back
  Given I am on `/`
  When I click **Log in**
  Then the URL is `/login`
  And heading **Welcome back** is visible

Scenario: AC1 — Valid Family A credentials reach the dashboard
  Given I am logged out and on `/login`
  When I enter valid Family A **Email** and **Password** and click **Log in**
  Then the URL is `/app`
  And I am no longer on `/login`
  And banner **Dashboard** is visible
  And button **Log out** is visible

Scenario: AC2 — Valid credentials honor next=/friends
  Given I am logged out and on `/login?next=%2Ffriends`
  When I enter valid Family A **Email** and **Password** and click **Log in**
  Then the URL is `/friends`
  And banner **Friends** is visible
  And button **Log out** is visible

Scenario: AC6 — Logged-out /app redirects to the log-in form
  Given I am logged out
  When I open `/app`
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And textbox **Email** is visible
  And textbox **Password** is visible
  And button **Log in** is visible

Scenario: AC7 — Log out returns to the log-in form
  Given I am signed in as Family A
  When I click **Log out** in the app banner
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And textbox **Email** is visible
  And textbox **Password** is visible
  And button **Log in** is visible

Scenario: AC9 — Forgot password back-navigation does not send a reset
  Given I am on `/login`
  When I click **Forgot password?**
  Then the URL is `/forgot-password`
  And heading **Reset your password** is visible
  When I click **← Back to log in**
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And I have not clicked **Send reset link**

# Negative

Scenario: AC3 — Incorrect password stays on log-in with a shared error
  Given I am on `/login`
  When I enter a valid Family A **Email**, an incorrect **Password**, and click **Log in**
  Then the URL is `/login`
  And the text **Invalid email or password** is visible

Scenario: AC4 — Unregistered email stays on log-in with the same error
  Given I am on `/login`
  When I enter an **Email** that is not registered, any **Password**, and click **Log in**
  Then the URL is `/login`
  And the text **Invalid email or password** is visible

Scenario: AC5 — Empty submit does not show the auth error
  Given I am on `/login` and **Email** and **Password** are empty
  When I click **Log in**
  Then the URL is `/login`
  And the text **Invalid email or password** is not visible

# Edge cases

Scenario: Default log-in form shows required controls and no error
  Given I am logged out
  When I open `/login`
  Then heading **Welcome back** is visible
  And text **BuddyTime** is visible
  And text **New to BuddyTime?** is visible
  And textbox **Email** is visible
  And textbox **Password** is visible
  And button **Log in** is visible
  And link **Sign up** is visible
  And link **Forgot password?** is visible
  And the text **Invalid email or password** is not visible

Scenario: Already signed in still sees the log-in form
  Given I am signed in as Family A
  When I open `/login`
  Then heading **Welcome back** is visible
  And textbox **Email** is visible
  And textbox **Password** is visible
  And button **Log in** is visible

Scenario: Sign up from log-in defaults next to app
  Given I am on `/login`
  When I click **Sign up**
  Then the URL is `/signup?next=%2Fapp`

Scenario: Sign up from log-in preserves friends next
  Given I am on `/login?next=%2Ffriends`
  When I click **Sign up**
  Then the URL is `/signup?next=%2Ffriends`

Scenario: Logged-out /app Sign up preserves next=/app
  Given I am logged out and have opened `/app` and landed on `/login`
  When I click **Sign up**
  Then the URL is `/signup?next=%2Fapp`

<!--
Ambiguities and gaps:
- Exact HTML5 validation messages for empty or malformed **Email** / **Password** (Confluence open question). AC5 only asserts that **Invalid email or password** does not appear; no browser-validation wording is claimed.
- Empty **Email** only, empty **Password** only, whitespace-only fields, and malformed addresses (e.g. missing `@`) — not specified in Jira AC.
- Whether `/login` ever auto-redirects when a session already exists (Confluence open question; observed: form still shown — covered by the already-signed-in edge).
- Account lockout, rate limiting, distinct “email not confirmed” copy, loading/disabled **Log in** during submit (Confluence open questions).
- Jira marks Sign up out of scope; the three **Sign up** `next` scenarios come from Confluence business rules 3 and 6 on this screen. Drop them if this ticket must stay login-submit-only.
- Family B / `APP_ALT_USER_*`: Jira and Confluence say the UI is the same but second-family log-in was not validated in exploration. Reserved; not required here.
- Session persistence, “remember me,” SSO, multi-device concurrency, guest RSVP, Privacy/Terms, admin-only behavior, and **Send reset link** / email delivery are out of scope.
- Email letter-case at log-in is covered for a newly created account in AQPBT-4 AC23, not re-specified here.
- `tests/login.spec.ts` already has a `@smoke` heading check; the generated spec should replace or absorb it rather than duplicate the same assertion.
-->
