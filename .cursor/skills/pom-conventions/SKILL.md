---
name: pom-conventions
description: Page Object Model conventions for Playwright tests in this project. Apply whenever generating, refactoring, or reviewing any Playwright test that interacts with the app under test (BuddyTime) — even if the user doesn't say "POM". Tests should never contain inline locators.
paths: "tests/**, pages/**"
---

# Page Object Model conventions

Specs orchestrate and assert; `pages/` holds locators and user actions only. **No inline locators in `tests/`.**

## Steps

1. One class per page or distinct component (`pages/*.page.ts`, or `pages/components/*.component.ts` / `*.form.component.ts`).
2. Locators are `readonly` properties in the constructor — `getByRole`, `getByLabel`, `getByText` (never CSS/XPath).
3. Methods are user actions only; **no `expect()` in `pages/`**.
4. Compose shared UI as components inside pages (e.g. `this.header = new HeaderComponent(page)`); never extend a `BasePage`.
5. Specs import POMs from `pages/` or `pages/components/…` and use `new XxxPage(page)`; all assertions stay in the spec.

## BuddyTime page inventory

Routes from `test-data/routes.ts` (`AppRoute`) and matching `*.page.ts` under `pages/`. Read files before adding rows — do not invent routes or helpers.

| Route | Page object | Notes |
| ----- | ----------- | ----- |
| `/` | `LandingPage` | Public marketing landing; `openGetStarted()` → sign-up |
| `/login` | `LoginPage` | Returning parents; `logIn(email, password)` |
| `/signup` | `SignupPage` | Account sign-up; `gotoWithNext(encodedNext)` for `?next=` (e.g. `%2Ffriends`) |
| `/forgot-password` | `ForgotPasswordPage` | Password reset request |
| `/app` | `DashboardPage` | Signed-in home; `header`, `addChildForm`, `inviteLink` |
| `/calendar` | `CalendarPage` | Family calendar; `header` |
| `/friends` | `FriendsPage` | Trusted circle; `header`, `inviteLink`, `manageMenu` (`FriendManageMenu`) |
| `/communities` | `CommunitiesPage` | Communities list; `header` |
| `/communities/new` | `CommunitiesNewPage` | Create community; `header`, `form` (`CreateCommunityForm`) |
| `/communities/:communityId` | `CommunityDetailPage` | One community hub; `goto(communityId)`; tabs; `createEvent`, `postAnnouncement` |
| `/availability` | `AvailabilityPage` | Weekly availability editor; `header` |
| `/playdates` | `PlaydatesPage` | Matching, requests, history; `header`, `propose` (`ProposePlaydateForm`) |
| `/playdates/new` | `PlaydatesNewPage` | Find-a-playdate entry; same propose form as `/playdates`; `header`, `propose` |
| `/birthdays` | `BirthdaysPage` | Birthday party invitations; `header`, `party` (`CreatePartyForm`) |
| `/profile` | `ProfilePage` | Account, family, settings; `header`, `deleteAccount`, `avatarPicker` |
| `/admin` | `AdminPage` | Internal admin metrics; `header` |

**Components** (`pages/components/`): shared UI fragments (`HeaderComponent`, forms, menus) — no route; pages hold them as properties, not via inheritance.

**Barrel:** `pages/index.ts` re-exports every page class above. Import components from their file path (not the barrel).

## Locator rules

1. Scope dialog locators to the dialog — e.g. `page.getByRole('dialog', { name: '…' }).getByRole('button', …)` when the same label appears on the page and in a modal.
2. Use `{ exact: true }` where BuddyTime labels share a prefix (match existing pages).
3. Act on rows and cards by accessible name (`getByRole('row', { name: … })`, links and buttons by name).
4. Never hardcode `APP_URL`; pages use `AppRoute` or relative paths; Playwright `baseURL` comes from env.
5. Shared chrome (header, forms) lives in components a page **holds** — never a base class it extends.
6. Two-family flows: one page object instance per browser context (main `page` and `altPage` from `browser.newContext({ storageState: ALT_AUTH_FILE })`).

More detail: `.cursor/rules/playwright-conventions.mdc`.

## Known app issues

Add a row only when the instructor confirms a defect; mark the test with `test.fail(true, '<AQPBT bug key>: <reason>')`.

| AQPBT key | Defect / reason |
| --------- | --------------- |

## Output

Page objects in `pages/`, specs in `tests/` that import them.

## Examples from this repo

Assertions stay in the spec; the POM only navigates and acts.

### Example POM (`pages/signup.page.ts`)

Locators and copy live in the POM; repeated strings come from `test-data/` where the real file does.

```typescript
import type { Locator, Page } from '@playwright/test';
import { duplicateSignupAccountError, signupGuardiansNoticeCopy } from '../test-data/invalid-signup';
import { AppRoute } from '../test-data/routes';

export class SignupPage {
  readonly heading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly signUpButton: Locator;
  readonly main: Locator;
  readonly guardiansNotice: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Create your account', exact: true });
    this.name = page.getByRole('textbox', { name: 'Your name', exact: true });
    this.email = page.getByRole('textbox', { name: 'Email', exact: true });
    this.password = page.getByRole('textbox', { name: 'Password (8+ characters)', exact: true });
    this.signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });
    this.main = page.getByRole('main');
    this.guardiansNotice = this.main.getByText(signupGuardiansNoticeCopy);
    // duplicateAccountError, logIn, terms, privacy — see full file
  }

  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Signup);
  }

  async fill(name: string, email: string, password: string): Promise<void> {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.password.fill(password);
  }

  async submit(): Promise<void> {
    await this.signUpButton.click();
  }
}
```

### Example spec (`tests/aqpbt-4-sign-up.spec.ts`)

Use `cleanup.fixture` when the flow creates accounts; one hard `expect` on the shell, `expect.soft` for independent control checks.

```typescript
import { test, expect } from '../fixtures/cleanup.fixture';
import { SignupPage } from '../pages';

test('AC2 — Sign-up form shows required controls', { tag: '@sanity' }, async ({ page }) => {
  const signup = new SignupPage(page);

  await signup.goto();

  await expect(signup.main).toBeVisible();
  await expect.soft(signup.heading).toBeVisible();
  await expect.soft(signup.name).toBeVisible();
  await expect.soft(signup.email).toBeVisible();
  await expect.soft(signup.password).toBeVisible();
  await expect.soft(signup.signUpButton).toBeVisible();
  await expect.soft(signup.logIn).toBeVisible();
  await expect.soft(signup.terms).toBeVisible();
  await expect.soft(signup.privacy).toBeVisible();
  await expect.soft(signup.guardiansNotice).toBeVisible();
});
```
