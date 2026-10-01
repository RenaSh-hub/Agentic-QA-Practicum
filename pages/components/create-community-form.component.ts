import type { Locator, Page } from '@playwright/test';

/** Create-a-community form at /communities/new. */
export class CreateCommunityForm {
  readonly groupName: Locator;
  readonly type: Locator;
  readonly description: Locator;
  readonly createGroupButton: Locator;
  readonly cancel: Locator;

  constructor(private readonly page: Page) {
    this.groupName = page.getByRole('textbox', { name: 'Group name', exact: true });
    this.type = page.getByRole('combobox', { name: 'Type', exact: true });
    this.description = page.getByRole('textbox', { name: 'Description (optional)', exact: true });
    this.createGroupButton = page.getByRole('button', { name: 'Create group', exact: true });
    this.cancel = page.getByRole('link', { name: 'Cancel', exact: true });
  }

  /** Returns a child checkbox by its accessible name, such as "Mia". */
  child(name: string): Locator {
    return this.page.getByRole('checkbox', { name, exact: true });
  }

  /** Fills the group name. */
  async fillName(name: string): Promise<void> {
    await this.groupName.fill(name);
  }

  /** Submits the create-group form. */
  async submit(): Promise<void> {
    await this.createGroupButton.click();
  }

  /** Returns to communities without creating a group. */
  async cancelForm(): Promise<void> {
    await this.cancel.click();
  }
}
