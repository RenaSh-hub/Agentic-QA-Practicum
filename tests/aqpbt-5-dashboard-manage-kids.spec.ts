import { test, expect, trackRecord } from '../fixtures/cleanup.fixture';
import { DashboardPage } from '../pages';
import {
  createChild,
  createFamilyApiContext,
  fetchMe,
  type MeResponse,
} from '../support/api-client';
import { TrackedRecordType } from '../support/record-tracker';
import {
  CHILD_AVATAR_NAMES,
  CHILD_INTEREST_CHIPS,
  childRowSummary,
  LEGO_INTEREST_CHIP,
  LEGO_INTEREST_VALUE,
} from '../test-data/child-avatars';
import { AppRoute } from '../test-data/routes';
import { appRouteUrlPattern } from '../test-data/signup.helpers';

async function loadFamilyAMe(): Promise<MeResponse> {
  const api = await createFamilyApiContext('main');
  try {
    return await fetchMe(api);
  } finally {
    await api.dispose();
  }
}

test.describe('AQPBT-5 dashboard manage kids — signed in as Family A', () => {
  test('AC1 — Signed-in Family A sees children, add-child form, and matching My Kids count', { tag: '@sanity' }, async ({
    page,
  }) => {
    const me = await loadFamilyAMe();
    const dashboard = new DashboardPage(page);
    const children = me.family.children;

    await dashboard.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
    await expect(dashboard.header.dashboardTitle).toBeVisible();
    await expect.soft(dashboard.familyName(me.family.name)).toBeVisible();
    await expect.soft(dashboard.parentDisplayName(me.parent.displayName)).toBeVisible();

    for (const [index, child] of children.entries()) {
      const summary = childRowSummary(child);
      await expect.soft(dashboard.childSummary(summary)).toBeVisible();
      for (const tag of child.interests) {
        await expect.soft(dashboard.childTag(tag)).toBeVisible();
      }
      await expect.soft(dashboard.changeAvatar.nth(index)).toBeVisible();
      await expect.soft(dashboard.removeChild.nth(index)).toBeVisible();
    }

    await expect.soft(dashboard.addChildForm.name).toBeVisible();
    await expect.soft(dashboard.addChildForm.birthYear).toBeVisible();
    await expect.soft(dashboard.addChildForm.birthMonth).toBeVisible();
    await expect.soft(dashboard.addChildForm.interests).toBeVisible();
    await expect.soft(dashboard.addChildForm.gender).toBeVisible();
    for (const avatar of CHILD_AVATAR_NAMES) {
      await expect.soft(dashboard.addChildForm.avatar(avatar)).toBeVisible();
    }
    for (const chip of CHILD_INTEREST_CHIPS) {
      await expect.soft(dashboard.addChildForm.interest(chip)).toBeVisible();
    }
    await expect.soft(dashboard.addChildForm.addChildButton).toBeVisible();
    await expect.soft(dashboard.myKids).toBeVisible();
    await expect(dashboard.myKidsCount(children.length)).toBeVisible();
    await expect(dashboard.removeChild).toHaveCount(children.length);
  });

  test('AC2 — Change avatar opens the inline editor', { tag: '@regression' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.openAvatarEditor();

    for (const avatar of CHILD_AVATAR_NAMES) {
      await expect.soft(dashboard.avatarPicker.avatar(avatar)).toBeVisible();
    }
    await expect.soft(dashboard.avatarPicker.gender).toBeVisible();
    await expect.soft(dashboard.avatarPicker.preferNotToSay).toBeAttached();
    await expect.soft(dashboard.avatarPicker.boy).toBeAttached();
    await expect.soft(dashboard.avatarPicker.girl).toBeAttached();
    await expect(dashboard.avatarPicker.done).toBeVisible();
  });

  test('AC3 — Done without changing the icon closes the editor and keeps the row', { tag: '@regression' }, async ({
    page,
  }) => {
    const me = await loadFamilyAMe();
    const child = me.family.children[0];
    if (!child) {
      throw new Error('Family A GET /api/v1/me has no children for AC3');
    }
    const summary = childRowSummary(child);
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await expect(dashboard.childSummary(summary)).toBeVisible();
    await dashboard.openAvatarEditor();
    await expect(dashboard.avatarPicker.done).toBeVisible();
    await dashboard.avatarPicker.close();

    await expect(dashboard.avatarPicker.done).not.toBeVisible();
    await expect(dashboard.childSummary(summary)).toBeVisible();
    for (const tag of child.interests) {
      await expect.soft(dashboard.childTag(tag)).toBeVisible();
    }
  });

  test('AC4 — + LEGO appends LEGO to Interests', { tag: '@regression' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.addChildForm.addInterest(LEGO_INTEREST_CHIP);

    await expect(dashboard.addChildForm.interests).toHaveValue(LEGO_INTEREST_VALUE);
  });

  test('AC5 — Empty Add child focuses Birth year and does not add a row', { tag: '@regression' }, async ({ page }) => {
    const me = await loadFamilyAMe();
    const countBefore = me.family.children.length;
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.addChildForm.submit();

    await expect(dashboard.addChildForm.birthYear).toBeFocused();
    await expect(dashboard.removeChild).toHaveCount(countBefore);
    await expect(dashboard.myKidsCount(countBefore)).toBeVisible();
  });

  test('Partial add-child fill without a valid submit does not create a child', { tag: '@regression' }, async ({
    page,
  }) => {
    const me = await loadFamilyAMe();
    const countBefore = me.family.children.length;
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.addChildForm.name.fill(`Kid${Date.now()}`);
    await dashboard.addChildForm.addInterest(LEGO_INTEREST_CHIP);

    await expect(dashboard.addChildForm.interests).toHaveValue(LEGO_INTEREST_VALUE);
    await expect(dashboard.removeChild).toHaveCount(countBefore);
    await expect(dashboard.myKidsCount(countBefore)).toBeVisible();
  });

  test('AC6 — Remove drops that child row and decrements My Kids', { tag: '@destructive' }, async ({ page }) => {
    const firstName = `Kid${Date.now()}`;
    const api = await createFamilyApiContext('main');
    let createdId: string;
    let index: number;
    let summary: string;
    let countAfterCreate: number;
    try {
      const created = await createChild(api, { firstName, birthYear: 2018 });
      createdId = created.id;
      trackRecord({ type: TrackedRecordType.Child, id: createdId, owner: 'main' });
      const me = await fetchMe(api);
      index = me.family.children.findIndex((child) => child.id === createdId);
      countAfterCreate = me.family.children.length;
      const listed = me.family.children[index];
      if (index < 0 || !listed) {
        throw new Error(`Disposable child ${createdId} was not in GET /api/v1/me after create`);
      }
      summary = childRowSummary(listed);
    } finally {
      await api.dispose();
    }

    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(dashboard.childSummary(summary)).toBeVisible();
    await expect(dashboard.myKidsCount(countAfterCreate)).toBeVisible();

    await dashboard.removeListedChild(index);

    await expect(dashboard.childSummary(summary)).not.toBeVisible();
    await expect(dashboard.myKidsCount(countAfterCreate - 1)).toBeVisible();
    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
  });

  test('Avatar editor closes when Change avatar is activated again', { tag: '@regression' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await dashboard.goto();
    await dashboard.openAvatarEditor();
    await expect(dashboard.avatarPicker.done).toBeVisible();
    await dashboard.openAvatarEditor();

    await expect(dashboard.avatarPicker.done).not.toBeVisible();
  });
});
