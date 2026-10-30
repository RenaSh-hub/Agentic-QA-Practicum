import { test, expect, trackRecord } from '../../fixtures/cleanup.fixture';
import { DashboardPage, SignupPage } from '../../pages';
import { createApiContextForOwner, createChild, fetchMe } from '../../support/api-client';
import { API_ME } from '../../support/api.constants';
import { TrackedRecordType } from '../../support/record-tracker';
import { catalogChildPayload } from '../../test-data/factories/child.factory';
import { signupAccount } from '../../test-data/factories/signup-account.factory';
import { AppRoute } from '../../test-data/routes';
import { appRouteUrlPattern, signupEmptyStorageState } from '../../test-data/signup.helpers';

test.use({ storageState: signupEmptyStorageState });

test('API-arranged child stays on Family A GET /api/v1/me after UI sign-up', { tag: '@destructive' }, async ({
  page,
}) => {
  const payload = catalogChildPayload();
  const account = signupAccount();
  const api = await createApiContextForOwner('main');
  let createdId = '';

  try {
    await test.step('API: arrange', async () => {
      const created = await createChild(api, payload);
      createdId = created.id;
      trackRecord({ type: TrackedRecordType.Child, id: createdId, owner: 'main' });
      const me = await fetchMe(api);
      if (!me.family.children.some((child) => child.id === createdId)) {
        throw new Error(`Disposable child ${createdId} was not in GET ${API_ME} after create`);
      }
    });

    const signup = new SignupPage(page);
    const dashboard = new DashboardPage(page);

    await test.step('UI: check', async () => {
      await signup.goto();
      await expect(signup.heading).toBeVisible();
      await expect(signup.name).toBeVisible();
      await expect(signup.email).toBeVisible();
      await expect(signup.password).toBeVisible();
      await expect(signup.signUpButton).toBeVisible();
    });

    await test.step('UI: act', async () => {
      await signup.fill(account.name, account.email, account.password);
      await signup.submit();
      await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
      await expect(dashboard.header.logOut).toBeVisible();
    });

    await test.step('API: prove', async () => {
      await expect
        .poll(async () => {
          const me = await fetchMe(api);
          return me.family.children.some((child) => child.id === createdId);
        })
        .toBe(true);
    });
  } finally {
    await api.dispose();
  }
});
