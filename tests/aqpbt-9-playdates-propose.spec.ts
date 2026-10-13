import { test, expect } from '../fixtures/cleanup.fixture';
import { PlaydatesPage, SignupPage } from '../pages';
import { signupAccount } from '../test-data/factories/signup-account.factory';
import { AppRoute } from '../test-data/routes';
import { appRouteUrlPattern, signupEmptyStorageState } from '../test-data/signup.helpers';

const matchedSlotOut =
  /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat), (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2} \d{1,2}:\d{2}(?:am|pm)-\d{1,2}:\d{2}(?:am|pm) out$/;
const matchedSlotAtThePetrovs = /at The Petrovs$/;
const matchedSlotEndsWithOut = / out$/;

test.describe('AQPBT-9 playdates propose — signed in as Family A', () => {
  test('AC1 — Signed-in Family A sees the propose shell', { tag: '@sanity' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Playdates));
    await expect.soft(playdates.header.playdatesTitle).toBeVisible();
    await expect.soft(playdates.heading).toBeVisible();
    await expect.soft(playdates.intro).toBeVisible();
    await expect.soft(playdates.proposeTitle).toBeVisible();
    await expect.soft(playdates.propose.sendRequest).toBeVisible();
  });

  test('AC2 — Family combobox lists only circle families', { tag: '@sanity' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();

    await expect.soft(playdates.matchesBadge).toBeVisible();
    await expect(playdates.propose.familyOptions).toHaveText(['The Nguyens', 'The Petrovs']);
  });

  test('AC3 — Selected circle family shows a matches badge and a matched slot', { tag: '@sanity' }, async ({
    page,
  }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();
    await playdates.propose.selectFamily('The Nguyens');

    await expect.soft(playdates.matchesBadge).toBeVisible();
    await expect(playdates.propose.matchedSlots(matchedSlotOut).first()).toBeVisible();
  });

  test('AC4 — Selecting a matched slot disables the place combobox', { tag: '@regression' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();
    await playdates.propose.selectFamily('The Nguyens');
    await expect.soft(playdates.propose.place).toBeEnabled();
    await playdates.propose.chooseFirstMatchingSlot(matchedSlotOut);

    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Playdates));
    await expect.soft(playdates.propose.place).toBeDisabled();
  });

  test('AC5 — Place options when no matched slot is selected', { tag: '@regression' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();

    await expect(playdates.propose.place).toBeEnabled();
    await expect.soft(playdates.propose.placeOptions).toHaveText(['Out / neutral place', 'My place']);
  });

  test('AC6 — Family A can change which children are checked', { tag: '@regression' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);
    const mia = playdates.propose.child('Mia');
    const maria = playdates.propose.child('Maria');

    await playdates.goto();
    await expect.soft(playdates.matchesBadge).toBeVisible();
    await expect.soft(mia).toBeChecked();
    await expect.soft(maria).toBeChecked();

    await mia.uncheck();
    try {
      await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Playdates));
      await expect.soft(mia).not.toBeChecked();
    } finally {
      await mia.check();
    }
  });

  test('AC7 — No pending requests', { tag: '@regression' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();

    await expect(playdates.noPendingRequests).toBeVisible();
    await expect.soft(playdates.pendingRequestsCount).toBeVisible();
  });

  test('AC9 — No upcoming playdates', { tag: '@regression' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();

    await expect(playdates.noUpcomingPlaydates).toBeVisible();
    await expect.soft(playdates.upcomingCount).toBeVisible();
  });

  test('Changing the circle family refreshes matched slots', { tag: '@regression' }, async ({ page }) => {
    const playdates = new PlaydatesPage(page);

    await playdates.goto();
    await playdates.propose.selectFamily('The Nguyens');
    await expect.soft(playdates.propose.matchedSlots(matchedSlotOut).first()).toBeVisible();
    await playdates.propose.selectFamily('The Petrovs');

    await expect.soft(playdates.matchesBadge).toBeVisible();
    await expect(playdates.propose.matchedSlots(matchedSlotAtThePetrovs).first()).toBeVisible();
    await expect.soft(playdates.propose.matchedSlots(matchedSlotEndsWithOut)).toHaveCount(0);
  });
});

test.describe('AQPBT-9 playdates propose — parent without a dashboard family', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('AC8 — Parent without a dashboard family sees the setup gate', { tag: '@regression' }, async ({ page }) => {
    const account = signupAccount();
    const signup = new SignupPage(page);
    const playdates = new PlaydatesPage(page);

    await signup.goto();
    await signup.fill(account.name, account.email, account.password);
    await signup.submit();
    await expect(page).toHaveURL(appRouteUrlPattern(AppRoute.Dashboard));
    await expect(playdates.header.logOut).toBeVisible();
    await playdates.goto();

    await expect(page).toHaveURL(/\/playdates\/?$/);
    await expect.soft(playdates.setupGate).toBeVisible();
    await expect.soft(playdates.proposeTitle).not.toBeVisible();
    await expect.soft(playdates.propose.sendRequest).not.toBeVisible();
    await expect.soft(playdates.heading).not.toBeVisible();
  });
});
