import { test, expect } from '../fixtures/cleanup.fixture';
import { DashboardPage, ForgotPasswordPage, FriendsPage, LandingPage, LoginPage } from '../pages';
import { HeaderComponent } from '../pages/components/header.component';
import { signupAccount } from '../test-data/factories/signup-account.factory';
import { AppRoute } from '../test-data/routes';
import {
  appRouteUrlPattern,
  requireFamilyACredentials,
  signupEmptyStorageState,
  withLoggedOutSignupPage,
} from '../test-data/signup.helpers';

test.describe('AQPBT-1 log in — logged out', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('AC8 — Log in from landing opens Welcome back', { tag: '@smoke' }, async ({ page }) => {
    const landing = new LandingPage(page);
    const login = new LoginPage(page);

    await landing.goto();
    await landing.openLogIn();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(login.heading).toBeVisible();
  });

  test('AC1 — Valid Family A credentials reach the dashboard', { tag: '@e2e' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for valid log-in coverage');
      return;
    }
    const login = new LoginPage(page);
    const dashboard = new DashboardPage(page);

    await login.goto();
    await login.logIn(familyA.email, familyA.password);

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
    await expect(page).not.toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(dashboard.header.dashboardTitle).toBeVisible();
    await expect(dashboard.header.logOut).toBeVisible();
  });

  test('AC2 — Valid credentials honor next=/friends', { tag: '@e2e' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for next=/friends log-in coverage');
      return;
    }
    const login = new LoginPage(page);
    const friends = new FriendsPage(page);

    await login.gotoWithNext('%2Ffriends');
    await login.logIn(familyA.email, familyA.password);

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Friends));
    await expect(friends.header.friendsTitle).toBeVisible();
    await expect(friends.header.logOut).toBeVisible();
  });

  test('AC6 — Logged-out /app redirects to the log-in form', { tag: '@regression' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const login = new LoginPage(page);

    await dashboard.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect.soft(login.heading).toBeVisible();
    await expect.soft(login.email).toBeVisible();
    await expect.soft(login.password).toBeVisible();
    await expect.soft(login.logInButton).toBeVisible();
  });

  test('AC7 — Log out returns to the log-in form', { tag: '@e2e' }, async ({ browser }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for log-out coverage');
      return;
    }
    await withLoggedOutSignupPage(browser, async (page) => {
      const login = new LoginPage(page);
      const header = new HeaderComponent(page);

      await login.goto();
      await login.logIn(familyA.email, familyA.password);
      await expect(header.logOut).toBeVisible();
      await header.logOutOfApp();

      await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
      await expect.soft(login.heading).toBeVisible();
      await expect.soft(login.email).toBeVisible();
      await expect.soft(login.password).toBeVisible();
      await expect.soft(login.logInButton).toBeVisible();
    });
  });

  test('AC9 — Forgot password back-navigation does not send a reset', { tag: '@regression' }, async ({ page }) => {
    const login = new LoginPage(page);
    const forgotPassword = new ForgotPasswordPage(page);

    await login.goto();
    await login.openForgotPassword();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.ForgotPassword));
    await expect(forgotPassword.heading).toBeVisible();

    await forgotPassword.cancel();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(login.heading).toBeVisible();
  });

  test('AC3 — Incorrect password stays on log-in with a shared error', { tag: '@regression' }, async ({ page }) => {
    const familyA = requireFamilyACredentials();
    if (!familyA) {
      test.skip(true, 'APP_USER_EMAIL and APP_USER_PASSWORD must be set for incorrect-password coverage');
      return;
    }
    const login = new LoginPage(page);
    const incorrectPassword = `${familyA.password}-not-valid`;

    await login.goto();
    await login.logIn(familyA.email, incorrectPassword);

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(login.invalidCredentialsError).toBeVisible();
  });

  test('AC4 — Unregistered email stays on log-in with the same error', { tag: '@regression' }, async ({ page }) => {
    const login = new LoginPage(page);
    const unregistered = signupAccount();

    await login.goto();
    await login.logIn(unregistered.email, unregistered.password);

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(login.invalidCredentialsError).toBeVisible();
  });

  test('AC5 — Empty submit does not show the auth error', { tag: '@regression' }, async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.submit();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect(login.invalidCredentialsError).not.toBeVisible();
  });

  test('Default log-in form shows required controls and no error', { tag: '@sanity' }, async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();

    await expect.soft(login.heading).toBeVisible();
    await expect.soft(login.buddyTime).toBeVisible();
    await expect.soft(login.newToBuddyTime).toBeVisible();
    await expect.soft(login.email).toBeVisible();
    await expect.soft(login.password).toBeVisible();
    await expect.soft(login.logInButton).toBeVisible();
    await expect.soft(login.signUp).toBeVisible();
    await expect.soft(login.forgotPassword).toBeVisible();
    await expect(login.invalidCredentialsError).not.toBeVisible();
  });

  test('Sign up from log-in defaults next to app', { tag: '@regression' }, async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.openSignUp();

    await expect(page).toHaveURL(/\/signup\?next=%2Fapp/);
  });

  test('Sign up from log-in preserves friends next', { tag: '@regression' }, async ({ page }) => {
    const login = new LoginPage(page);

    await login.gotoWithNext('%2Ffriends');
    await login.openSignUp();

    await expect(page).toHaveURL(/\/signup\?next=%2Ffriends/);
  });

  test('Logged-out /app Sign up preserves next=/app', { tag: '@regression' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const login = new LoginPage(page);

    await dashboard.goto();
    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await login.openSignUp();

    await expect(page).toHaveURL(/\/signup\?next=%2Fapp/);
  });
});

test.describe('AQPBT-1 log in — signed in as Family A', () => {
  test('Already signed in still sees the log-in form', { tag: '@regression' }, async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();

    await expect.soft(login.heading).toBeVisible();
    await expect.soft(login.email).toBeVisible();
    await expect.soft(login.password).toBeVisible();
    await expect(login.logInButton).toBeVisible();
  });
});
