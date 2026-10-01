import type { Locator, Page } from '@playwright/test';

/** Invite link revealed by Invite a family or Invite co-parent. */
export class InviteLinkPanel {
  readonly circleInvite: Locator;
  readonly coParentInvite: Locator;
  readonly link: Locator;
  readonly copy: Locator;

  constructor(page: Page) {
    this.circleInvite = page.getByText('Circle invite:', { exact: true });
    this.coParentInvite = page.getByText('Co-parent invite:', { exact: true });
    this.link = page.getByText(/\/join\//);
    this.copy = page.getByRole('button', { name: 'copy', exact: true });
  }

  /** Copies the revealed invite link. */
  async copyLink(): Promise<void> {
    await this.copy.click();
  }
}
