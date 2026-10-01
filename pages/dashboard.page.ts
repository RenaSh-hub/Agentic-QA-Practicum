import type { Locator, Page } from '@playwright/test';
import { AddChildForm } from './components/add-child-form.component';
import { HeaderComponent } from './components/header.component';
import { InviteLinkPanel } from './components/invite-link-panel.component';
import { AppRoute } from '../test-data/routes';

/** Signed-in home at /app. */
export class DashboardPage {
  readonly header: HeaderComponent;
  readonly addChildForm: AddChildForm;
  readonly inviteLink: InviteLinkPanel;
  readonly heading: Locator;
  readonly findPlaydate: Locator;
  readonly changeAvatar: Locator;
  readonly removeChild: Locator;
  readonly viewAllPlaydates: Locator;
  readonly inviteFamily: Locator;
  readonly inviteCoParent: Locator;
  readonly setUpAvailability: Locator;
  readonly seeAllFriends: Locator;
  readonly enablePushReminders: Locator;
  readonly installApp: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.addChildForm = new AddChildForm(page);
    this.inviteLink = new InviteLinkPanel(page);
    this.heading = page.getByRole('heading', { level: 2 });
    this.findPlaydate = page.getByRole('link', { name: 'Find a Playdate', exact: true });
    this.changeAvatar = page.getByRole('button', { name: 'Change avatar', exact: true });
    this.removeChild = page.getByRole('button', { name: 'remove', exact: true });
    this.viewAllPlaydates = page.getByRole('link', { name: 'View all', exact: true });
    this.inviteFamily = page.getByRole('button', { name: '+ Invite a family', exact: true });
    this.inviteCoParent = page.getByRole('button', { name: 'Invite co-parent', exact: true });
    this.setUpAvailability = page.getByRole('link', { name: 'Set up', exact: true });
    this.seeAllFriends = page.getByRole('link', { name: 'See all →', exact: true });
    this.enablePushReminders = page.getByRole('button', { name: 'Enable push reminders', exact: true });
    this.installApp = page.getByRole('button', { name: 'Install app', exact: true });
  }

  /** Opens the dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }

  /** Reveals the circle invite link. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamily.click();
  }

  /** Reveals the co-parent invite link. */
  async openInviteCoParent(): Promise<void> {
    await this.inviteCoParent.click();
  }
}
