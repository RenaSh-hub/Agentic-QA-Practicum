import { test, expect } from './fixtures';
import { API_MATCHES } from '../support/api.constants';
import {
  assertMatchItem,
  CATALOG_UNAUTHENTICATED_STATUS,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/matches returns catalog status, JSON, and item shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_MATCHES));
  expect(Array.isArray(body)).toBeTruthy();
  if (Array.isArray(body) && body.length > 0) {
    assertMatchItem(body[0]);
  }
});

test('GET /api/v1/matches without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_MATCHES);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
