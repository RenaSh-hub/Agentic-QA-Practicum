import { mkdir } from 'fs/promises';
import path from 'path';
import { test as setup, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages';
import { AUTH_FILE, ALT_AUTH_FILE } from '../support/auth.constants';
import { AppRoute } from '../test-data/routes';

/** Matches a route at the end of the URL, or before a slash or query string. */
function routeUrl(route: AppRoute): RegExp {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?:/|$|\\?)`);
}

/**
 * Signs in and writes the browser storage state for one family.
 * @param page - Browser page used for the login flow
 * @param email - Account email from the environment
 * @param password - Account password from the environment
 * @param storagePath - File that receives the saved storage state
 */
async function authenticate(
  page: Page,
  email: string,
  password: string,
  storagePath: string,
): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.logIn(email, password);
  await page.waitForURL(routeUrl(AppRoute.Dashboard));
  await expect(page).not.toHaveURL(routeUrl(AppRoute.Login));
  await mkdir(path.dirname(storagePath), { recursive: true });
  await page.context().storageState({ path: storagePath });
}

setup('authenticate main family', async ({ page }) => {
  const email = process.env.APP_USER_EMAIL;
  const password = process.env.APP_USER_PASSWORD;
  if (!email || !password) {
    throw new Error('APP_USER_EMAIL and APP_USER_PASSWORD must both be set');
  }
  await authenticate(page, email, password, AUTH_FILE);
});

setup('authenticate second family', async ({ page }) => {
  const email = process.env.APP_ALT_USER_EMAIL;
  const password = process.env.APP_ALT_USER_PASSWORD;
  if (!email || !password) {
    setup.skip(true, 'APP_ALT_USER_EMAIL or APP_ALT_USER_PASSWORD is unset');
    return;
  }
  await authenticate(page, email, password, ALT_AUTH_FILE);
});
