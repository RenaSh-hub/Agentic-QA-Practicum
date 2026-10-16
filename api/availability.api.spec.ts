import { test, expect } from './fixtures';
import { API_AVAILABILITY } from '../support/api.constants';
import {
  assertAvailabilityBody,
  CATALOG_UNAUTHENTICATED_STATUS,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/availability returns catalog status, JSON, and top-level shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_AVAILABILITY));
  assertAvailabilityBody(body);
});

test('GET /api/v1/availability without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_AVAILABILITY);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
