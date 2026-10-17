import type { Locator, Page } from '@playwright/test';
import { AddChildForm } from './components/add-child-form.component';
import { AvatarPickerComponent } from './components/avatar-picker.component';
import { HeaderComponent } from './components/header.component';
import { InviteLinkPanel } from './components/invite-link-panel.component';
import { AppRoute } from '../test-data/routes';

/** Signed-in home at /app. */
export class DashboardPage {
  readonly header: HeaderComponent;
  readonly addChildForm: AddChildForm;
  readonly avatarPicker: AvatarPickerComponent;
  readonly inviteLink: InviteLinkPanel;
  readonly heading: Locator;
  readonly findPlaydate: Locator;
  readonly changeAvatar: Locator;
  readonly removeChild: Locator;
  readonly myKids: Locator;
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
    this.avatarPicker = new AvatarPickerComponent(page);
    this.inviteLink = new InviteLinkPanel(page);
    this.heading = page.getByRole('heading', { level: 2 });
    this.findPlaydate = page.getByRole('link', { name: 'Find a Playdate', exact: true });
    this.changeAvatar = page.getByRole('button', { name: 'Change avatar', exact: true });
    this.removeChild = page.getByRole('button', { name: 'remove', exact: true });
    this.myKids = page.getByText('My Kids', { exact: true });
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

  /** Family name shown in the kids block (live GET /api/v1/me value). */
  familyName(name: string): Locator {
    return this.page.getByText(name, { exact: true });
  }

  /** Parent display name. `.first()` because the sidebar also shows the same name. */
  parentDisplayName(name: string): Locator {
    return this.page.getByText(name, { exact: true }).first();
  }

  /** My Kids stat whose numeric count matches `count` (e.g. `2My Kids`). */
  myKidsCount(count: number): Locator {
    return this.page.getByText(new RegExp(`^${count}\\s*My Kids$`));
  }

  /** Child summary line `{name}, {age} · {Boy|Girl}`. */
  childSummary(summary: string): Locator {
    return this.page.getByText(summary, { exact: true });
  }

  /** Interest tag on a saved child row (e.g. `lego`). */
  childTag(tag: string): Locator {
    return this.page.getByText(tag, { exact: true });
  }

  /**
   * Opens the inline avatar editor for the child at `index` (listed order).
   * @param index - 0-based child row index
   */
  async openAvatarEditor(index = 0): Promise<void> {
    await this.changeAvatar.nth(index).click();
  }

  /**
   * Activates **remove** for the child at `index` (listed order).
   * @param index - 0-based child row index
   */
  async removeListedChild(index: number): Promise<void> {
    await this.removeChild.nth(index).click();
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
