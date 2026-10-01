import type { Locator, Page } from '@playwright/test';

/** Password confirmation shown after Delete account… is opened. */
export class DeleteAccountForm {
  readonly password: Locator;
  readonly deleteForever: Locator;
  readonly keepMyAccount: Locator;

  constructor(page: Page) {
    this.password = page.getByRole('textbox', { name: 'Your password', exact: true });
    this.deleteForever = page.getByRole('button', { name: 'Delete forever', exact: true });
    this.keepMyAccount = page.getByRole('button', { name: 'Keep my account', exact: true });
  }

  /** Fills the password confirmation. */
  async fillPassword(password: string): Promise<void> {
    await this.password.fill(password);
  }

  /** Confirms permanent deletion. */
  async submit(): Promise<void> {
    await this.deleteForever.click();
  }

  /** Closes the confirmation and keeps the account. */
  async cancel(): Promise<void> {
    await this.keepMyAccount.click();
  }
}
