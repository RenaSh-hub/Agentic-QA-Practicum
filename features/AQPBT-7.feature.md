Feature: [Julia] Forgot password (request reset link): request a one-time reset link by email

# Happy paths

Scenario: AC1 — Forgot password? opens the reset request form
  Given I am logged out and on `/login`
  When I click **Forgot password?**
  Then the URL is `/forgot-password`
  And heading **Reset your password** is visible
  And text **Enter your email and we’ll send you a reset link.** is visible
  And textbox **Email** is visible
  And button **Send reset link** is visible
  And link **← Back to log in** is visible

Scenario: AC2 — Back to log in returns to Welcome back without sending a reset
  Given I am on `/forgot-password`
  When I click **← Back to log in** without clicking **Send reset link**
  Then the URL is `/login`
  And heading **Welcome back** is visible
  And textbox **Email** is visible
  And textbox **Password** is visible
  And button **Log in** is visible

Scenario: AC3 — Unregistered email shows the same confirmation pattern
  Given I am on `/forgot-password`
  When I enter `nobody@example.com` in **Email** and click **Send reset link**
  Then button **Send reset link** is not visible
  And text matching **If an account exists for** is visible
  And text `nobody@example.com` is visible
  And text **a reset link is on its way** is visible
  And text **The link works once and expires in 1 hour** is visible
  And text **check your spam folder too** is visible
  And link **← Back to log in** is visible

Scenario: AC4 — Family A registered email shows the same confirmation with that email
  Given I am on `/forgot-password`
  When I enter Family A’s registered **Email** and click **Send reset link**
  Then button **Send reset link** is not visible
  And text matching **If an account exists for** is visible
  And Family A’s **Email** is visible in the confirmation
  And text **a reset link is on its way** is visible
  And text **The link works once and expires in 1 hour** is visible
  And text **check your spam folder too** is visible
  And link **← Back to log in** is visible

# Negative

Scenario: AC5 — Empty email stays on the request view
  Given I am on `/forgot-password` with an empty **Email** field
  When I click **Send reset link**
  Then heading **Reset your password** is visible
  And text matching **If an account exists for** is not visible

Scenario: AC6 — Malformed email does not show confirmation
  Given I am on `/forgot-password`
  When I enter `notanemail` in **Email** and click **Send reset link**
  Then text matching **If an account exists for** is not visible
  And heading **Reset your password** is visible
  And button **Send reset link** is visible

# Edge cases

Scenario: Direct navigation to forgot-password shows the request form
  Given I am logged out
  When I open `/forgot-password`
  Then heading **Reset your password** is visible
  And button **Send reset link** is visible

Scenario: Registered vs unregistered emails must not reveal account existence differently on screen
  Given I submitted **Send reset link** for `nobody@example.com` and for Family A’s **Email**
  Then both outcomes show the same confirmation pattern (no “unknown email” vs “email sent” split)

<!--
Ambiguities and gaps:
- Exact HTML5 validation for empty vs malformed **Email** (browser constraint validation vs custom copy) — AC5–6 assert outcomes only, not validation message wording.
- Whether whitespace-only **Email** is treated as empty or invalid — not in Jira AC.
- Case normalization of Family A **Email** in the confirmation message — not specified.
- Rate limits, lockout, and server/network error UI — Jira out of scope.
- Following the reset link, setting a new password, and logging in — out of scope.
- Email delivery, inbox content, and spam-folder verification — out of scope.
- **Log in**, **Sign up**, guest RSVP, Privacy/Terms — out of scope.
- Confluence page linked from Jira was not fully retrieved in this session; plan relies on Jira AC text.
-->
