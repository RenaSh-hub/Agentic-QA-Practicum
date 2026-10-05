import type { Page, Route } from '@playwright/test';
import { API_ME } from './api.constants';

const ME_ROUTE = `**${API_ME}`;

type MePayload = {
  parent: null;
  family: null;
  isAdmin: boolean;
};

const EMPTY_ME: MePayload = {
  parent: null,
  family: null,
  isAdmin: false,
};

/**
 * Forces GET /api/v1/me to return an empty profile (no parent / family).
 * Use for deterministic empty-state UI tests; mock ids in creates should use the "mock-" prefix.
 */
export async function mockMeEmpty(page: Page): Promise<void> {
  await page.route(ME_ROUTE, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(EMPTY_ME),
    });
  });
}

/** Forces GET /api/v1/me to fail with HTTP 500. */
export async function mockMeServerError(page: Page): Promise<void> {
  await page.route(ME_ROUTE, async (route: Route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  });
}

/** Stops mocking GET /api/v1/me. */
export async function unmockMe(page: Page): Promise<void> {
  await page.unroute(ME_ROUTE);
}
