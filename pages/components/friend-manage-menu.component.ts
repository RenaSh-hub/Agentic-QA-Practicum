import type { Locator, Page } from '@playwright/test';

/** Actions shown after manage is opened on a friend card. */
export class FriendManageMenu {
  readonly report: Locator;
  readonly block: Locator;
  readonly remove: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.report = page.getByRole('button', { name: 'report', exact: true });
    this.block = page.getByRole('button', { name: 'block', exact: true });
    this.remove = page.getByRole('button', { name: 'remove', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'cancel', exact: true });
  }

  /** Closes the manage actions. */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
