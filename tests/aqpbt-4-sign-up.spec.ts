import { test, expect } from '../fixtures/cleanup.fixture';
import { DashboardPage, LandingPage, LoginPage, SignupPage } from '../pages';
import { HeaderComponent } from '../pages/components/header.component';
import { signupAccount, signupNameOverMaxLength } from '../test-data/factories/signup-account.factory';
import {
  invalidSignupEmailDotWrongPositionMessage,
  invalidSignupEmailIncompleteAfterAtMessage,
  invalidSignupEmailMissingAtDomainMessage,
  invalidSignupEmailMissingLocalPartMessage,
  invalidSignupEmailSpaceInLocalPartMessage,
  invalidSignupEmailValidationMessage,
  invalidSignupFieldSets,
  invalidSignupPasswordValidationMessage,
  invalidSignupRequiredFieldMessage,
  invalidSignupSpacesOnlyName,
  invalidSignupValidFiller,
} from '../test-data/invalid-signup';
import { AppRoute } from '../test-data/routes';
import {
  appRouteUrlPattern,
  requireFamilyACredentials,
  signupEmailWithDifferentCase,
  signupEmptyStorageState,
  withLoggedOutSignupPage,
} from '../test-data/signup.helpers';

test.describe('AQPBT-4 sign up — logged out', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('AC1 — Get started opens sign-up', { tag: '@smoke' }, async ({ page }) => {
    const landing = new LandingPage(page);
    await landing.goto();
    await landing.openGetStarted();
    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Signup));
  });

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

  test('AC3 — Empty sign-up focuses Your name', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.submit();
    await expect(signup.name).toBeFocused();
  });

  test('AC21 — Empty sign-up shows required message on Your name', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.submit();
    await expect(signup.name).toHaveJSProperty('validationMessage', invalidSignupRequiredFieldMessage);
  });

  test('AC4 — Invalid email without @ focuses Email', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailMissingAt;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toBeFocused();
  });

  test('AC6 — Invalid email not-an-email shows browser validation message', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailMissingAt;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailValidationMessage);
  });

  test('AC5 — Short password focuses Password (8+ characters)', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.passwordTooShort;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.password).toBeFocused();
  });

  test('AC7 — Short password shows browser validation message', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.passwordTooShort;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.password).toHaveJSProperty(
      'validationMessage',
      invalidSignupPasswordValidationMessage,
    );
  });

  test('AC8 — Your name truncates at 100 characters', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const longName = signupNameOverMaxLength();
    await signup.goto();
    await signup.name.fill(longName);
    await expect(signup.name).toHaveValue(longName.slice(0, 100));
  });

  test('AC9 — Duplicate email shows inline error', { tag: '@regression' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for duplicate-email coverage');
      return;
    }
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.fill(invalidSignupValidFiller.name, familyA.email, familyA.password);
    await signup.submit();
    await expect(signup.duplicateAccountError).toBeVisible();
  });

  test('AC22 — Duplicate email is case-insensitive', { tag: '@regression' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for case-insensitive duplicate coverage');
      return;
    }
    const mixedCaseEmail = signupEmailWithDifferentCase(familyA.email);
    test.skip(
      mixedCaseEmail === familyA.email,
      'APP_USER_EMAIL has no alphabetic characters to toggle for case-insensitive coverage',
    );
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.fill(invalidSignupValidFiller.name, mixedCaseEmail, invalidSignupValidFiller.password);
    await signup.submit();
    await expect(signup.duplicateAccountError).toBeVisible();
    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Signup));
  });

  test('AC10 — Log in from sign-up defaults next to app', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.logIn.click();
    await expect(page).toHaveURL(/\/login\?next=%2Fapp/);
  });

  test('AC11 — Log in from sign-up preserves friends next', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.gotoWithNext('%2Ffriends');
    await signup.logIn.click();
    await expect(page).toHaveURL(/\/login\?next=%2Ffriends/);
  });

  test('AC16 — Email missing-at.com validation', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailMissingAtInDomain;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toBeFocused();
    await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailMissingAtDomainMessage);
  });

  test('AC17 — Email user@ validation', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailIncompleteAfterAt;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toBeFocused();
    await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailIncompleteAfterAtMessage);
  });

  test('AC18 — Email @example.com validation', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailMissingLocalPart;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toBeFocused();
    await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailMissingLocalPartMessage);
  });

  test('AC19 — Email spaces @example.com validation', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailSpaceInLocalPart;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toBeFocused();
    await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailSpaceInLocalPartMessage);
  });

  test('AC20 — Email user@.com validation', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const payload = invalidSignupFieldSets.emailDotWrongPosition;
    await signup.goto();
    await signup.fill(payload.name, payload.email, payload.password);
    await signup.submit();
    await expect(signup.email).toBeFocused();
    await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailDotWrongPositionMessage);
  });

  test('Spaces-only Your name with duplicate email still shows duplicate error', { tag: '@regression' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for spaces-only name edge case');
      return;
    }
    const signup = new SignupPage(page);
    await signup.goto();
    await signup.fill(invalidSignupSpacesOnlyName, familyA.email, invalidSignupValidFiller.password);
    await signup.submit();
    await expect(signup.name).not.toHaveJSProperty('validationMessage', invalidSignupRequiredFieldMessage);
    await expect(signup.duplicateAccountError).toBeVisible();
  });

  test('Duplicate-email message persists until Sign up is clicked again', { tag: '@regression' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for duplicate-message persistence edge case');
      return;
    }
    const signup = new SignupPage(page);
    const replacementEmail = signupAccount().email;
    await signup.goto();
    await signup.fill(invalidSignupValidFiller.name, familyA.email, invalidSignupValidFiller.password);
    await signup.submit();
    await expect(signup.duplicateAccountError).toBeVisible();
    await signup.email.fill(replacementEmail);
    await expect(signup.duplicateAccountError).toBeVisible();
  });

  test('AC14 — Valid sign-up reaches dashboard', { tag: '@e2e' }, async ({ page }) => {
    const account = signupAccount();
    const signup = new SignupPage(page);
    const header = new HeaderComponent(page);
    await signup.goto();
    await signup.fill(account.name, account.email, account.password);
    await signup.submit();
    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
    await expect(header.logOut).toBeVisible();
  });

  test('AC15 — New account can log in after sign-out', { tag: '@e2e' }, async ({ browser }) => {
    await withLoggedOutSignupPage(browser, async (page) => {
      const account = signupAccount();
      const signup = new SignupPage(page);
      const login = new LoginPage(page);
      const header = new HeaderComponent(page);
      await signup.goto();
      await signup.fill(account.name, account.email, account.password);
      await signup.submit();
      await expect(header.logOut).toBeVisible();
      await header.logOutOfApp();
      await login.goto();
      await login.logIn(account.email, account.password);
      await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
      await expect(header.logOut).toBeVisible();
    });
  });

  test('AC23 — Login accepts email in different letter case', { tag: '@e2e' }, async ({ browser }) => {
    const account = signupAccount();
    const mixedCaseEmail = signupEmailWithDifferentCase(account.email);
    test.skip(
      mixedCaseEmail === account.email,
      'Generated signup email has no alphabetic characters to toggle for case-insensitive login',
    );
    await withLoggedOutSignupPage(browser, async (page) => {
      const signup = new SignupPage(page);
      const login = new LoginPage(page);
      const header = new HeaderComponent(page);
      await signup.goto();
      await signup.fill(account.name, account.email, account.password);
      await signup.submit();
      await expect(header.logOut).toBeVisible();
      await header.logOutOfApp();
      await login.goto();
      await login.logIn(mixedCaseEmail, account.password);
      await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
      await expect(header.logOut).toBeVisible();
    });
  });
});

test.describe('AQPBT-4 sign up — signed in as Family A', () => {
  test('AC12 — Signed-in Family A still sees Create your account', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    await signup.goto();
    await expect(signup.heading).toBeVisible();
  });

  test('AC13 — Signed-in session persists after visiting sign-up', { tag: '@regression' }, async ({ page }) => {
    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);
    await signup.goto();
    await dashboard.goto();
    await expect(dashboard.header.logOut).toBeVisible();
  });
});
