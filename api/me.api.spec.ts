import { test, expect } from './fixtures';
import { API_ME } from '../support/api.constants';
import {
  assertMeBody,
  CATALOG_UNAUTHENTICATED_STATUS,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/me returns catalog status, JSON, and top-level shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_ME));
  assertMeBody(body);
});

test('GET /api/v1/me without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_ME);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
