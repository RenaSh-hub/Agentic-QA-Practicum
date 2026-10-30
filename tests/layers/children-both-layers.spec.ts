import { test, expect, trackRecord } from '../../fixtures/cleanup.fixture';
import { DashboardPage } from '../../pages';
import { createApiContextForOwner, createChild, fetchMe } from '../../support/api-client';
import { API_ME } from '../../support/api.constants';
import { TrackedRecordType } from '../../support/record-tracker';
import { childRowSummary } from '../../test-data/child-avatars';
import { catalogChildPayload } from '../../test-data/factories/child.factory';

test('API-created child shows on Dashboard then UI remove drops it from GET /api/v1/me', { tag: '@destructive' }, async ({
  page,
}) => {
  const payload = catalogChildPayload();
  const api = await createApiContextForOwner('main');
  let createdId = '';
  let childIndex = -1;
  let summary = '';
  let kidsBefore = 0;

  try {
    await test.step('API: arrange', async () => {
      const before = await fetchMe(api);
      kidsBefore = before.family.children.length;
      const created = await createChild(api, payload);
      createdId = created.id;
      trackRecord({ type: TrackedRecordType.Child, id: createdId, owner: 'main' });
      const me = await fetchMe(api);
      childIndex = me.family.children.findIndex((child) => child.id === createdId);
      const listed = childIndex >= 0 ? me.family.children[childIndex] : undefined;
      if (!listed) {
        throw new Error(`Disposable child ${createdId} was not in GET ${API_ME} after create`);
      }
      summary = childRowSummary(listed);
    });

    const dashboard = new DashboardPage(page);

    await test.step('UI: check', async () => {
      await dashboard.goto();
      await expect(dashboard.childSummary(summary)).toBeVisible();
      await expect(dashboard.myKidsCount(kidsBefore + 1)).toBeVisible();
    });

    await test.step('UI: act', async () => {
      await dashboard.removeChild(childIndex);
    });

    await test.step('API: prove', async () => {
      await expect
        .poll(async () => {
          const me = await fetchMe(api);
          return me.family.children.some((child) => child.id === createdId);
        })
        .toBe(false);
    });
  } finally {
    await api.dispose();
  }
});
