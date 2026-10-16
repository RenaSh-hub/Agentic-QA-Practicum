import { test, expect } from './fixtures';
import { API_CONNECTIONS } from '../support/api.constants';
import {
  assertConnectionItem,
  CATALOG_UNAUTHENTICATED_STATUS,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/connections returns catalog status, JSON, and item shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_CONNECTIONS));
  expect(Array.isArray(body)).toBeTruthy();
  if (Array.isArray(body) && body.length > 0) {
    assertConnectionItem(body[0]);
  }
});

test('GET /api/v1/connections without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_CONNECTIONS);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
