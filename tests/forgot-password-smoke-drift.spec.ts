import { test, expect } from '../fixtures/cleanup.fixture';
import { ForgotPasswordPage } from '../pages';
import { signupEmptyStorageState } from '../test-data/signup.helpers';

/** Intentionally uses pre-rename POM API to exercise smoke slice on PR. */
test.describe('Forgot password — smoke drift check', () => {
  test.use({ storageState: signupEmptyStorageState });

  test('Reset request shows Send reset link button', { tag: '@smoke' }, async ({ page }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.goto();
    await expect(forgotPasswordPage.sendResetLink).toBeVisible();
  });
});
