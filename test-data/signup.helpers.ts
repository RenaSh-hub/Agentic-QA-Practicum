import type { Browser, Page } from '@playwright/test';
import { attachRegisterResponseTracking } from '../fixtures/cleanup.fixture';
import { AppRoute } from './routes';

/** Clears saved auth for logged-out sign-up scenarios. */
export const signupEmptyStorageState = { cookies: [] as const, origins: [] as const };

/** Family A credentials from env (duplicate-email and signed-in flows). */
export function requireFamilyACredentials(): { email: string; password: string } | null {
  const email = process.env.APP_USER_EMAIL;
  const password = process.env.APP_USER_PASSWORD;
  if (!email || !password) {
    return null;
  }
  return { email, password };
}

/**
 * Runs a test body in an isolated logged-out browser context with register tracking for teardown.
 * Use for flows that sign out so they never mutate the shared `AUTH_FILE` session.
 */
export async function withLoggedOutSignupPage(
  browser: Browser,
  run: (page: Page) => Promise<void>,
): Promise<void> {
  const context = await browser.newContext({ storageState: signupEmptyStorageState });
  const page = await context.newPage();
  const flush = attachRegisterResponseTracking(page);
  try {
    await run(page);
  } finally {
    await flush();
    await context.close();
  }
}

/** Playwright URL matcher for a route under baseURL (optional trailing slash or query). */
export function appRouteUrlPattern(route: AppRoute): RegExp {
  const escaped = route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?:/|$|\\?)`);
}

/** Returns the same address with the first alphabetic character toggled in case (AC22, AC23). */
export function signupEmailWithDifferentCase(email: string): string {
  const index = email.search(/[a-zA-Z]/);
  if (index === -1) {
    return email;
  }
  const character = email[index];
  const toggled =
    character === character.toLowerCase() ? character.toUpperCase() : character.toLowerCase();
  return `${email.slice(0, index)}${toggled}${email.slice(index + 1)}`;
}
