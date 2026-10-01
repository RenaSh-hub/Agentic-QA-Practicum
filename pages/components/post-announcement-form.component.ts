import type { Locator, Page } from '@playwright/test';

/** New-announcement form on a community's Announcements tab. */
export class PostAnnouncementForm {
  readonly message: Locator;
  readonly postButton: Locator;

  constructor(page: Page) {
    this.message = page.getByRole('textbox', {
      name: 'Share an update with every family in the group…',
      exact: true,
    });
    this.postButton = page.getByRole('button', { name: 'Post announcement', exact: true });
  }

  /** Fills the announcement. */
  async fill(message: string): Promise<void> {
    await this.message.fill(message);
  }

  /** Posts the announcement. */
  async submit(): Promise<void> {
    await this.postButton.click();
  }
}
