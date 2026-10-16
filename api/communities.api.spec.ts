import { test, expect } from './fixtures';
import { API_COMMUNITIES, apiCommunityPath } from '../support/api.constants';
import {
  assertCommunityDetailBody,
  assertCommunityListItem,
  CATALOG_UNAUTHENTICATED_STATUS,
  isRecord,
  readCatalogGetJson,
} from './helpers/catalog-response';

test('GET /api/v1/communities returns catalog status, JSON, and item shape', { tag: '@api' }, async ({
  mainApi,
}) => {
  const body = await readCatalogGetJson(await mainApi.get(API_COMMUNITIES));
  expect(Array.isArray(body)).toBeTruthy();
  if (!Array.isArray(body) || body.length === 0) {
    return;
  }
  assertCommunityListItem(body[0]);
  const firstId = isRecord(body[0]) && typeof body[0].id === 'string' ? body[0].id : undefined;
  expect(firstId).toBeDefined();
  if (!firstId) {
    return;
  }
  const detail = await readCatalogGetJson(await mainApi.get(apiCommunityPath(firstId)));
  assertCommunityDetailBody(detail);
});

test('GET /api/v1/communities without token returns 401', { tag: '@api' }, async ({ guestApi }) => {
  const response = await guestApi.get(API_COMMUNITIES);
  expect(response.status()).toBe(CATALOG_UNAUTHENTICATED_STATUS);
});
