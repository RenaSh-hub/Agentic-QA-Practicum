import { test, expect } from '../fixtures/cleanup.fixture';
import { LoginPage } from '../pages';
import { signupEmptyStorageState } from '../test-data/signup.helpers';

test.describe('Login page', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('shows the page heading', { tag: '@smoke' }, async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();

    await expect(login.heading).toBeVisible();
  });
});
