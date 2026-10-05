import { test, expect } from '../fixtures/cleanup.fixture';
import { LandingPage, LoginPage, SignupPage } from '../pages';
import { HeaderComponent } from '../pages/components/header.component';
import { signupAccount, signupNameOverMaxLength } from '../test-data/factories/signup-account.factory';
import {
  duplicateSignupAccountError,
  invalidSignupEmailDotWrongPositionMessage,
  invalidSignupEmailIncompleteAfterAtMessage,
  invalidSignupEmailMissingAtDomainMessage,
  invalidSignupEmailMissingLocalPartMessage,
  invalidSignupEmailSpaceInLocalPartMessage,
  invalidSignupEmailValidationMessage,
  invalidSignupFieldSets,
  invalidSignupPasswordValidationMessage,
  invalidSignupRequiredFieldMessage,
  invalidSignupValidFiller,
} from '../test-data/invalid-signup';
import { signupEmailWithDifferentCase } from '../test-data/signup.helpers';
import { AppRoute } from '../test-data/routes';

test.use({ storageState: { cookies: [], origins: [] } });

test('Get started opens sign-up', { tag: '@smoke' }, async ({ page }) => {
  const landing = new LandingPage(page);
  await landing.goto();
  await landing.openGetStarted();
  await expect(page).toHaveURL(new RegExp(`${AppRoute.Signup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$|\\?)`));
});

test('sign-up form shows required controls', { tag: '@sanity' }, async ({ page }) => {
  const signup = new SignupPage(page);
  await signup.goto();
  await expect(page.getByRole('main')).toBeVisible();
  await expect.soft(signup.heading).toBeVisible();
  await expect.soft(signup.name).toBeVisible();
  await expect.soft(signup.email).toBeVisible();
  await expect.soft(signup.password).toBeVisible();
  await expect.soft(signup.signUpButton).toBeVisible();
  await expect.soft(signup.logIn).toBeVisible();
  await expect.soft(signup.terms).toBeVisible();
  await expect.soft(signup.privacy).toBeVisible();
  await expect
    .soft(page.getByText(/BuddyTime is for parents and guardians \(18\+\)/))
    .toBeVisible();
});

test('empty sign-up focuses Your name', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  await signup.goto();
  await signup.submit();
  await expect(signup.name).toBeFocused();
});

test('empty sign-up shows required message on Your name', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  await signup.goto();
  await signup.submit();
  await expect(signup.name).toHaveJSProperty('validationMessage', invalidSignupRequiredFieldMessage);
});

test('invalid email without @ focuses Email', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailMissingAt;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toBeFocused();
});

test('invalid email without @ shows browser validation message', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailMissingAt;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailValidationMessage);
});

test('short password focuses Password (8+ characters)', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.passwordTooShort;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.password).toBeFocused();
});

test('short password shows browser validation message', { tag: '@regression' }, async ({ page }) => {
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

test('Your name truncates at 100 characters', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const longName = signupNameOverMaxLength();
  await signup.goto();
  await signup.name.fill(longName);
  await expect(signup.name).toHaveValue(longName.slice(0, 100));
});

test('duplicate email shows inline error', { tag: '@regression' }, async ({ page }) => {
  const registeredEmail = process.env.APP_USER_EMAIL;
  const fillerPassword = process.env.APP_USER_PASSWORD;
  if (!registeredEmail || !fillerPassword) {
    test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for duplicate-email coverage');
    return;
  }
  const signup = new SignupPage(page);
  await signup.goto();
  await signup.fill(invalidSignupValidFiller.name, registeredEmail, fillerPassword);
  await signup.submit();
  await expect(page.getByText(duplicateSignupAccountError, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${AppRoute.Signup.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$|\\?)`));
});

test('duplicate email with different letter case shows inline error', { tag: '@regression' }, async ({ page }) => {
  const registeredEmail = process.env.APP_USER_EMAIL;
  const fillerPassword = process.env.APP_USER_PASSWORD;
  if (!registeredEmail || !fillerPassword) {
    test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for case-insensitive duplicate coverage');
    return;
  }
  const signup = new SignupPage(page);
  const mixedCaseEmail = signupEmailWithDifferentCase(registeredEmail);
  test.skip(
    mixedCaseEmail === registeredEmail,
    'APP_USER_EMAIL has no alphabetic characters to toggle for case-insensitive coverage',
  );
  await signup.goto();
  await signup.fill(invalidSignupValidFiller.name, mixedCaseEmail, fillerPassword);
  await signup.submit();
  await expect(page.getByText(duplicateSignupAccountError, { exact: true })).toBeVisible();
});

test('Log in from sign-up goes to login with next app', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  await signup.goto();
  await signup.logIn.click();
  await expect(page).toHaveURL(/\/login\?next=%2Fapp/);
});

test('Log in from sign-up preserves friends next param', { tag: '@regression' }, async ({ page }) => {
  await page.goto(`${AppRoute.Signup}?next=%2Ffriends`);
  const signup = new SignupPage(page);
  await signup.logIn.click();
  await expect(page).toHaveURL(/\/login\?next=%2Ffriends/);
});

test('email missing-at.com shows validation message', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailMissingAtInDomain;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toBeFocused();
  await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailMissingAtDomainMessage);
});

test('email user@ shows validation message', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailIncompleteAfterAt;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toBeFocused();
  await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailIncompleteAfterAtMessage);
});

test('email @example.com shows validation message', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailMissingLocalPart;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toBeFocused();
  await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailMissingLocalPartMessage);
});

test('email with space in local part shows validation message', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailSpaceInLocalPart;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toBeFocused();
  await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailSpaceInLocalPartMessage);
});

test('email user@.com shows validation message', { tag: '@regression' }, async ({ page }) => {
  const signup = new SignupPage(page);
  const payload = invalidSignupFieldSets.emailDotWrongPosition;
  await signup.goto();
  await signup.fill(payload.name, payload.email, payload.password);
  await signup.submit();
  await expect(signup.email).toBeFocused();
  await expect(signup.email).toHaveJSProperty('validationMessage', invalidSignupEmailDotWrongPositionMessage);
});

test('valid sign-up reaches dashboard', { tag: '@e2e' }, async ({ page }) => {
  const account = signupAccount();
  const signup = new SignupPage(page);
  const header = new HeaderComponent(page);
  await signup.goto();
  await signup.fill(account.name, account.email, account.password);
  await signup.submit();
  await expect(page).toHaveURL(new RegExp(`${AppRoute.Dashboard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$|\\?)`));
  await expect(header.logOut).toBeVisible();
});

test('new account can log in with same credentials', { tag: '@e2e' }, async ({ page }) => {
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
  await expect(page).toHaveURL(new RegExp(`${AppRoute.Dashboard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$|\\?)`));
  await expect(header.logOut).toBeVisible();
});

test('new account can log in with different email letter case', { tag: '@e2e' }, async ({ page }) => {
  const account = signupAccount();
  const mixedCaseEmail = signupEmailWithDifferentCase(account.email);
  test.skip(
    mixedCaseEmail === account.email,
    'Generated signup email has no alphabetic characters to toggle for case-insensitive login',
  );
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
  await expect(page).toHaveURL(new RegExp(`${AppRoute.Dashboard.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$|\\?)`));
  await expect(header.logOut).toBeVisible();
});
