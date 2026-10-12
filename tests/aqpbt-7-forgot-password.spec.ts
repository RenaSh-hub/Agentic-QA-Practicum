import { test, expect } from '../fixtures/cleanup.fixture';
import { ForgotPasswordPage, LoginPage } from '../pages';
import { AppRoute } from '../test-data/routes';
import {
  appRouteUrlPattern,
  requireFamilyACredentials,
  signupEmptyStorageState,
} from '../test-data/signup.helpers';

const UNREGISTERED_RESET_EMAIL = 'nobody@example.com';
const INVALID_RESET_EMAIL = 'notanemail';

async function expectResetLinkConfirmation(forgotPassword: ForgotPasswordPage, email: string): Promise<void> {
  await expect(forgotPassword.sendResetLink).not.toBeVisible();
  await expect(forgotPassword.accountExistsMessage).toBeVisible();
  await expect(forgotPassword.confirmationEmailAddress(email)).toBeVisible();
  await expect(forgotPassword.resetLinkOnTheWay).toBeVisible();
  await expect(forgotPassword.linkExpiresOneHour).toBeVisible();
  await expect(forgotPassword.checkSpamFolder).toBeVisible();
  await expect(forgotPassword.backToLogIn).toBeVisible();
}

test.describe('AQPBT-7 forgot password — request reset link', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('AC1 — Forgot password? opens the reset request form', { tag: '@smoke' }, async ({ page }) => {
    const login = new LoginPage(page);
    const forgotPassword = new ForgotPasswordPage(page);

    await login.goto();
    await login.openForgotPassword();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.ForgotPassword));
    await expect(forgotPassword.heading).toBeVisible();
    await expect(forgotPassword.introInstructions).toBeVisible();
    await expect(forgotPassword.email).toBeVisible();
    await expect(forgotPassword.sendResetLink).toBeVisible();
    await expect(forgotPassword.backToLogIn).toBeVisible();
  });

  test('AC2 — Back to log in returns to Welcome back without sending a reset', { tag: '@regression' }, async ({
    page,
  }) => {
    const login = new LoginPage(page);
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();
    await forgotPassword.cancel();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(login.heading).toBeVisible();
    await expect(login.email).toBeVisible();
    await expect(login.password).toBeVisible();
    await expect(login.logInButton).toBeVisible();
  });

  test('AC3 — Unregistered email shows the same confirmation pattern', { tag: '@regression' }, async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();
    await forgotPassword.requestResetLink(UNREGISTERED_RESET_EMAIL);

    await expectResetLinkConfirmation(forgotPassword, UNREGISTERED_RESET_EMAIL);
  });

  test('AC4 — Family A registered email shows the same confirmation with that email', { tag: '@e2e' }, async ({
    page,
  }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for registered reset-link coverage');
      return;
    }
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();
    await forgotPassword.requestResetLink(familyA.email);

    await expectResetLinkConfirmation(forgotPassword, familyA.email);
  });

  test('AC5 — Empty email stays on the request view', { tag: '@regression' }, async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();
    await forgotPassword.submit();

    await expect(forgotPassword.heading).toBeVisible();
    await expect(forgotPassword.accountExistsMessage).not.toBeVisible();
  });

  test('AC6 — Malformed email does not show confirmation', { tag: '@regression' }, async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();
    await forgotPassword.requestResetLink(INVALID_RESET_EMAIL);

    await expect(forgotPassword.accountExistsMessage).not.toBeVisible();
    await expect(forgotPassword.heading).toBeVisible();
    await expect(forgotPassword.sendResetLink).toBeVisible();
  });

  test('Direct navigation to forgot-password shows the request form', { tag: '@sanity' }, async ({ page }) => {
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();

    await expect(forgotPassword.heading).toBeVisible();
    await expect(forgotPassword.sendResetLink).toBeVisible();
  });

  test('Registered and unregistered emails show the same confirmation pattern on screen', { tag: '@regression' }, async ({
    page,
  }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for reset-link parity coverage');
      return;
    }
    const forgotPassword = new ForgotPasswordPage(page);

    await forgotPassword.goto();
    await forgotPassword.requestResetLink(UNREGISTERED_RESET_EMAIL);
    await expectResetLinkConfirmation(forgotPassword, UNREGISTERED_RESET_EMAIL);

    await forgotPassword.goto();
    await forgotPassword.requestResetLink(familyA.email);
    await expectResetLinkConfirmation(forgotPassword, familyA.email);
  });
});
