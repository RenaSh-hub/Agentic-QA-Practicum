import { expect, type Page } from '@playwright/test';
import { ProfilePage } from '../pages';
import { AppRoute } from '../test-data/routes';

/**
 * Deletes the signed-in account via profile settings (self-cleaning after AC14-style sign-up).
 * @param page - Browser page authenticated as the account to remove
 * @param password - Password for the delete-account confirmation field
 */
export async function deleteSignedUpAccountViaProfile(page: Page, password: string): Promise<void> {
  const profile = new ProfilePage(page);
  await profile.goto();
  await profile.openDeleteAccount();
  await profile.deleteAccount.fillPassword(password);
  await profile.deleteAccount.submit();
  await expect(page).toHaveURL(new RegExp(`${AppRoute.Landing.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|$|\\?)`));
}
