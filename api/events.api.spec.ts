import { test, expect } from './fixtures';
import { API_EVENTS } from '../support/api.constants';
import {
  assertEventItem,
  CATALOG_UNAUTHENTICATED_STATUS,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/events returns catalog status, JSON, and item shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_EVENTS));
  expect(Array.isArray(body)).toBeTruthy();
  if (Array.isArray(body) && body.length > 0) {
    assertEventItem(body[0]);
  }
});

test('GET /api/v1/events without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_EVENTS);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
