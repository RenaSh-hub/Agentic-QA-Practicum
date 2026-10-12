import { test, expect } from '../fixtures/cleanup.fixture';
import { CalendarPage, LoginPage } from '../pages';
import { AppRoute } from '../test-data/routes';
import { appRouteUrlPattern, signupEmptyStorageState } from '../test-data/signup.helpers';

test.describe('AQPBT-13 calendar — signed in as Family A', () => {
  test('AC1 — Signed-in Family A sees the family calendar shell', { tag: '@sanity' }, async ({ page }) => {
    const calendar = new CalendarPage(page);

    await calendar.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Calendar));
    await expect.soft(calendar.header.calendarTitle).toBeVisible();
    await expect.soft(calendar.familyCalendar).toBeVisible();
    await expect.soft(calendar.thisWeek).toBeVisible();
    await expect.soft(calendar.birthdaysThisMonth).toBeVisible();
    await expect.soft(calendar.header.logOut).toBeVisible();
  });
});

test.describe('AQPBT-13 calendar — logged out', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('AC2 — Logged-out visitor cannot see the family calendar', { tag: '@regression' }, async ({ page }) => {
    const calendar = new CalendarPage(page);
    const login = new LoginPage(page);

    await calendar.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect.soft(login.heading).toBeVisible();
    await expect.soft(calendar.familyCalendar).not.toBeVisible();
    await expect.soft(calendar.thisWeek).not.toBeVisible();
    await expect.soft(calendar.birthdaysThisMonth).not.toBeVisible();
    await expect.soft(calendar.header.logOut).not.toBeVisible();
  });

  test('Logged-out calendar gate still shows the log-in controls', { tag: '@regression' }, async ({ page }) => {
    const calendar = new CalendarPage(page);
    const login = new LoginPage(page);

    await calendar.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect.soft(login.heading).toBeVisible();
    await expect.soft(login.email).toBeVisible();
    await expect.soft(login.password).toBeVisible();
    await expect.soft(login.logInButton).toBeVisible();
  });
});
