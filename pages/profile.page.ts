import type { Locator, Page } from '@playwright/test';
import { AvatarPickerComponent } from './components/avatar-picker.component';
import { DeleteAccountForm } from './components/delete-account-form.component';
import { HeaderComponent } from './components/header.component';
import { AppRoute } from '../test-data/routes';

/** My Profile, family details, and account settings. */
export class ProfilePage {
  readonly header: HeaderComponent;
  readonly avatarPicker: AvatarPickerComponent;
  readonly deleteAccount: DeleteAccountForm;
  readonly changeAvatar: Locator;
  readonly displayName: Locator;
  readonly phone: Locator;
  readonly saveMyDetailsButton: Locator;
  readonly familyName: Locator;
  readonly hostAddress: Locator;
  readonly addressVisibility: Locator;
  readonly saveFamilyDetailsButton: Locator;
  readonly myAvailability: Locator;
  readonly privacyAndSafety: Locator;
  readonly notificationSettings: Locator;
  readonly calendarSync: Locator;
  readonly logOut: Locator;
  readonly deleteAccountButton: Locator;
  readonly privacyPolicy: Locator;
  readonly termsOfService: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.avatarPicker = new AvatarPickerComponent(page);
    this.deleteAccount = new DeleteAccountForm(page);
    this.changeAvatar = page.getByRole('button', { name: 'Change avatar', exact: true });
    this.displayName = page.getByRole('textbox', {
      name: 'Display name (how your circle sees you)',
      exact: true,
    });
    this.phone = page.getByRole('textbox', { name: 'Phone (optional)', exact: true });
    this.saveMyDetailsButton = page.getByRole('button', { name: 'Save my details', exact: true });
    this.familyName = page.getByRole('textbox', { name: 'Family name', exact: true });
    this.hostAddress = page.getByRole('textbox', {
      name: 'Host address or meeting note',
      exact: true,
    });
    this.addressVisibility = page.getByRole('combobox').filter({
      has: page.getByRole('option', { name: 'Keep hidden', exact: true }),
    });
    this.saveFamilyDetailsButton = page.getByRole('button', {
      name: 'Save family details',
      exact: true,
    });
    this.myAvailability = page.getByRole('button', {
      name: 'My Availability Weekly slots',
      exact: true,
    });
    this.privacyAndSafety = page.getByRole('button', {
      name: 'Privacy & Safety Private mode · circle only',
      exact: true,
    });
    this.notificationSettings = page.getByRole('button', {
      name: 'Notifications Push + email',
      exact: true,
    });
    this.calendarSync = page.getByRole('button', {
      name: 'Calendar Sync Add-to-calendar links soon',
      exact: true,
    });
    this.logOut = page.getByRole('button', { name: 'Log out', exact: true }).nth(1);
    this.deleteAccountButton = page.getByRole('button', { name: 'Delete account…', exact: true });
    this.privacyPolicy = page.getByRole('link', { name: 'Privacy Policy', exact: true });
    this.termsOfService = page.getByRole('link', { name: 'Terms of Service', exact: true });
  }

  /** Opens My Profile. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Profile);
  }

  /** Opens the avatar picker for the first child. */
  async openAvatarPicker(): Promise<void> {
    await this.changeAvatar.first().click();
  }

  /** Fills the display name. */
  async fillDisplayName(name: string): Promise<void> {
    await this.displayName.fill(name);
  }

  /** Saves the parent details. */
  async saveMyDetails(): Promise<void> {
    await this.saveMyDetailsButton.click();
  }

  /** Fills the family name. */
  async fillFamilyName(name: string): Promise<void> {
    await this.familyName.fill(name);
  }

  /** Saves the family details. */
  async saveFamilyDetails(): Promise<void> {
    await this.saveFamilyDetailsButton.click();
  }

  /** Opens weekly availability from settings. */
  async openMyAvailability(): Promise<void> {
    await this.myAvailability.click();
  }

  /** Opens the delete-account confirmation. */
  async openDeleteAccount(): Promise<void> {
    await this.deleteAccountButton.click();
  }

  /** Logs out from the settings list. */
  async logOutOfAccount(): Promise<void> {
    await this.logOut.click();
  }
}
