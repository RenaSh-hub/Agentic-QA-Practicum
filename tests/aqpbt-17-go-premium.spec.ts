import { test, expect } from '../fixtures/cleanup.fixture';
import { DashboardPage, LoginPage } from '../pages';
import { AppRoute } from '../test-data/routes';
import { appRouteUrlPattern, signupEmptyStorageState } from '../test-data/signup.helpers';

test.describe('AQPBT-17 Go Premium — signed in as Family A', () => {
  test('AC1 — Signed-in parent sees coming-soon feedback after Go Premium', { tag: '@sanity' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();

    await expect.soft(dashboard.header.goPremium).toBeVisible();
    await dashboard.header.openGoPremium();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
    await expect.soft(dashboard.header.premiumComingSoonStatus).toBeVisible();
  });
});

test.describe('AQPBT-17 Go Premium — logged out', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('AC2 — Logged-out visitor does not see Go Premium on the dashboard route', { tag: '@regression' }, async ({
    page,
  }) => {
    const dashboard = new DashboardPage(page);
    const login = new LoginPage(page);

    await dashboard.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Login));
    await expect.soft(login.heading).toBeVisible();
    await expect.soft(dashboard.header.goPremium).not.toBeVisible();
  });
});
