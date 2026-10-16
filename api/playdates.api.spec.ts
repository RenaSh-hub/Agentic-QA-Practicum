import { test, expect } from './fixtures';
import { API_PLAYDATES } from '../support/api.constants';
import {
  assertPlaydateItem,
  CATALOG_UNAUTHENTICATED_STATUS,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/playdates returns catalog status, JSON, and item shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_PLAYDATES));
  expect(Array.isArray(body)).toBeTruthy();
  if (Array.isArray(body) && body.length > 0) {
    assertPlaydateItem(body[0]);
  }
});

test('GET /api/v1/playdates without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_PLAYDATES);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
