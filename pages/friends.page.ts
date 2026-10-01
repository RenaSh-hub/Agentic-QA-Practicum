import type { Locator, Page } from '@playwright/test';
import { FriendManageMenu } from './components/friend-manage-menu.component';
import { HeaderComponent } from './components/header.component';
import { InviteLinkPanel } from './components/invite-link-panel.component';
import { AppRoute } from '../test-data/routes';

/** Friends in the family's circle. */
export class FriendsPage {
  readonly header: HeaderComponent;
  readonly manageMenu: FriendManageMenu;
  readonly inviteLink: InviteLinkPanel;
  readonly inviteFamily: Locator;
  readonly schedulePlaydate: Locator;
  readonly manage: Locator;
  readonly exploreCommunities: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.manageMenu = new FriendManageMenu(page);
    this.inviteLink = new InviteLinkPanel(page);
    this.inviteFamily = page.getByRole('button', { name: '+ Invite a family', exact: true });
    this.schedulePlaydate = page.getByRole('button', { name: 'Schedule Playdate', exact: true });
    this.manage = page.getByRole('button', { name: 'manage', exact: true });
    this.exploreCommunities = page.getByRole('link', { name: 'Explore Communities', exact: true });
  }

  /** Opens the friends page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Friends);
  }

  /** Reveals the circle invite link. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamily.click();
  }

  /** Opens Schedule Playdate on the first friend card. */
  async openSchedulePlaydate(): Promise<void> {
    await this.schedulePlaydate.first().click();
  }

  /** Opens manage actions on the first friend card. */
  async openManage(): Promise<void> {
    await this.manage.first().click();
  }
}
