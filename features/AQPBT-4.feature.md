Feature: [Rena] Sign up: create an account with name, email, and password

# Happy paths

Scenario: AC1 — Get started opens sign-up
  Given I am on `/`
  When I click **Get started**
  Then the URL is `/signup`

Scenario: AC2 — Sign-up form shows required controls
  Given I am on `/signup`
  Then the `main` region contains heading **Create your account**
  And textboxes **Your name**, **Email**, **Password (8+ characters)**
  And button **Sign up**
  And links **Log in**, **Terms of Service**, **Privacy Policy**
  And the text **BuddyTime is for parents and guardians (18+).**

Scenario: AC10 — Log in from sign-up defaults next to app
  Given I am on `/signup`
  When I click **Log in**
  Then the URL is `/login?next=%2Fapp`

Scenario: AC11 — Log in from sign-up preserves friends next
  Given I am on `/signup?next=%2Ffriends`
  When I click **Log in**
  Then the URL is `/login?next=%2Ffriends`

Scenario: AC12 — Signed-in Family A still sees Create your account
  Given I am signed in as Family A
  When I open `/signup`
  Then heading **Create your account** is visible

Scenario: AC13 — Signed-in session persists after visiting sign-up
  Given I am signed in as Family A and have opened `/signup`
  When I open `/app`
  Then button **Log out** is visible

Scenario: AC14 — Valid sign-up reaches dashboard
  Given I am on `/signup` and **Email** is not already registered
  When I fill **Your name**, **Email**, and **Password (8+ characters)** (8+ characters) and click **Sign up**
  Then the URL is `/app`
  And button **Log out** is visible

Scenario: AC15 — New account can log in after sign-out
  Given the account created in AC14
  When I am signed out, open `/login`, and **Log in** with the same **Email** and **Password** used at sign-up
  Then the URL is `/app`
  And button **Log out** is visible

Scenario: AC23 — Login accepts email in different letter case
  Given the account created in AC14 with a specific **Email**
  When I am signed out, open `/login`, and **Log in** with that **Email** in different letter case and the same **Password**
  Then the URL is `/app`
  And button **Log out** is visible

# Negative

Scenario: AC3 — Empty sign-up focuses Your name
  Given all three fields are empty on `/signup`
  When I click **Sign up**
  Then **Your name** has focus

Scenario: AC21 — Empty sign-up shows required message on Your name
  Given all three fields are empty on `/signup`
  When I click **Sign up**
  Then **Your name** shows the validation message `Please fill out this field.`

Scenario: AC4 — Invalid email without @ focuses Email
  Given **Your name** is filled and **Email** is `not-an-email`
  When I click **Sign up**
  Then **Email** has focus

Scenario: AC6 — Invalid email not-an-email shows browser validation message
  Given **Email** contains `not-an-email`
  When I attempt sign-up validation on **Email**
  Then its validation message is `Please include an '@' in the email address. 'not-an-email' is missing an '@'.`

Scenario: AC5 — Short password focuses Password (8+ characters)
  Given **Your name** and **Email** are filled with a well-formed address and **Password (8+ characters)** has 7 characters
  When I click **Sign up**
  Then **Password (8+ characters)** has focus

Scenario: AC7 — Short password shows browser validation message
  Given **Password (8+ characters)** contains 7 characters
  When I attempt sign-up validation on **Password (8+ characters)**
  Then its validation message is `Please lengthen this text to 8 characters or more (you are currently using 7 characters).`

Scenario: AC9 — Duplicate email shows inline error
  Given I enter a name, a password of 8 or more characters, and an email that already has an account
  When I click **Sign up**
  Then the text **An account with this email already exists** is visible

Scenario: AC22 — Duplicate email is case-insensitive
  Given an account already exists for Family A’s **Email**
  When I enter that **Email** on `/signup` with different letter case, a valid **Your name**, and **Password (8+ characters)** of 8 or more characters, and I click **Sign up**
  Then the text **An account with this email already exists** is visible
  And I remain on `/signup`

Scenario: AC16 — Email missing-at.com validation
  Given **Your name** is filled and **Password (8+ characters)** has 8 or more characters
  When **Email** is `missing-at.com` and I click **Sign up**
  Then **Email** has focus
  And its validation message is `Please include an '@' in the email address. 'missing-at.com' is missing an '@'.`

Scenario: AC17 — Email user@ validation
  Given **Your name** is filled and **Password (8+ characters)** has 8 or more characters
  When **Email** is `user@` and I click **Sign up**
  Then **Email** has focus
  And its validation message is `Please enter a part following '@'. 'user@' is incomplete.`

Scenario: AC18 — Email @example.com validation
  Given **Your name** is filled and **Password (8+ characters)** has 8 or more characters
  When **Email** is `@example.com` and I click **Sign up**
  Then **Email** has focus
  And its validation message is `Please enter a part followed by '@'. '@example.com' is incomplete.`

Scenario: AC19 — Email spaces @example.com validation
  Given **Your name** is filled and **Password (8+ characters)** has 8 or more characters
  When **Email** is `spaces @example.com` and I click **Sign up**
  Then **Email** has focus
  And its validation message is `A part followed by '@' should not contain the symbol ' '.`

Scenario: AC20 — Email user@.com validation
  Given **Your name** is filled and **Password (8+ characters)** has 8 or more characters
  When **Email** is `user@.com` and I click **Sign up**
  Then **Email** has focus
  And its validation message is `'.' is used at a wrong position in '.com'.`

# Edge cases

Scenario: AC8 — Your name truncates at 100 characters
  Given I am on `/signup`
  When I fill **Your name** with more than 100 characters
  Then the field holds exactly 100 characters

Scenario: Spaces-only Your name with duplicate email still shows duplicate error
  Given **Your name** contains only spaces
  And **Email** is Family A’s registered address
  When I fill **Password (8+ characters)** with 8 or more characters and click **Sign up**
  Then **Your name** does not show `Please fill out this field.`
  And the text **An account with this email already exists** is visible

Scenario: Duplicate-email message persists until Sign up is clicked again
  Given I submitted sign-up with Family A’s **Email** and saw **An account with this email already exists**
  When I change **Email** without clicking **Sign up**
  Then the text **An account with this email already exists** remains visible

<!--
Ambiguities and gaps:
- Account teardown after AC14-style creation in the shared environment (Jira open question; tests rely on register tracking + global teardown).
- Whether `next` on successful Sign up is honored (out of scope; AC14–15 assume landing on `/app`).
- Validation message wording under pinned locale en-CA vs Chromium (AC6–7, AC16–21).
- Spaces-only Your name with a new unused email — rejected or accepted (Confluence open question).
- Whether duplicate-email message persistence after editing Email is intentional product behavior.
- Email a@nodot, password rules beyond 8 characters, email verification, forgot password, guest RSVP, Family B, admin sign-ups (Jira out of scope).
- Family B / ALT_AUTH not required on this screen per story; second-family context reserved for future multi-family flows.
-->
