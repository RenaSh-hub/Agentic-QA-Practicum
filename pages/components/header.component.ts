import type { Locator, Page } from '@playwright/test';

/** Shared sidebar navigation and top bar on every signed-in page. */
export class HeaderComponent {
  readonly navigation: Locator;
  readonly banner: Locator;
  readonly dashboard: Locator;
  readonly calendar: Locator;
  readonly friends: Locator;
  readonly communities: Locator;
  readonly availability: Locator;
  readonly playdates: Locator;
  readonly birthdays: Locator;
  readonly discover: Locator;
  readonly profile: Locator;
  readonly admin: Locator;
  readonly goPremium: Locator;
  readonly menu: Locator;
  readonly notifications: Locator;
  readonly logOut: Locator;
  readonly dashboardTitle: Locator;
  readonly friendsTitle: Locator;

  constructor(page: Page) {
    this.navigation = page.getByRole('navigation');
    this.banner = page.getByRole('banner');
    this.dashboardTitle = this.banner.getByText('Dashboard', { exact: true });
    this.friendsTitle = this.banner.getByText('Friends', { exact: true });
    this.dashboard = this.navigation.getByRole('link', { name: 'Dashboard', exact: true });
    this.calendar = this.navigation.getByRole('link', { name: 'Calendar', exact: true });
    this.friends = this.navigation.getByRole('link', { name: 'Friends', exact: true });
    this.communities = this.navigation.getByRole('link', { name: 'Communities', exact: true });
    this.availability = this.navigation.getByRole('link', { name: 'Availability', exact: true });
    this.playdates = this.navigation.getByRole('link', { name: 'Playdates', exact: true });
    this.birthdays = this.navigation.getByRole('link', { name: 'Birthdays', exact: true });
    this.discover = this.navigation.getByRole('button', { name: 'Discover', exact: true });
    this.profile = this.navigation.getByRole('link', { name: 'My Profile', exact: true });
    this.admin = this.navigation.getByRole('link', { name: 'Admin', exact: true });
    this.goPremium = page.getByRole('complementary').getByRole('button', { name: 'Go Premium' });
    this.menu = this.banner.getByRole('button', { name: 'Menu', exact: true });
    this.notifications = this.banner.getByRole('button', { name: 'Notifications', exact: true });
    this.logOut = this.banner.getByRole('button', { name: 'Log out', exact: true });
  }

  /** Opens Dashboard from the main navigation. */
  async openDashboard(): Promise<void> {
    await this.dashboard.click();
  }

  /** Opens Calendar from the main navigation. */
  async openCalendar(): Promise<void> {
    await this.calendar.click();
  }

  /** Opens Friends from the main navigation. */
  async openFriends(): Promise<void> {
    await this.friends.click();
  }

  /** Opens Communities from the main navigation. */
  async openCommunities(): Promise<void> {
    await this.communities.click();
  }

  /** Opens Availability from the main navigation. */
  async openAvailability(): Promise<void> {
    await this.availability.click();
  }

  /** Opens Playdates from the main navigation. */
  async openPlaydates(): Promise<void> {
    await this.playdates.click();
  }

  /** Opens Birthdays from the main navigation. */
  async openBirthdays(): Promise<void> {
    await this.birthdays.click();
  }

  /** Activates Discover in the main navigation. */
  async openDiscover(): Promise<void> {
    await this.discover.click();
  }

  /** Opens My Profile from the main navigation. */
  async openProfile(): Promise<void> {
    await this.profile.click();
  }

  /** Opens Admin from the main navigation. */
  async openAdmin(): Promise<void> {
    await this.admin.click();
  }

  /** Toggles the mobile navigation menu. */
  async openMenu(): Promise<void> {
    await this.menu.click();
  }

  /** Opens notifications from the top bar. */
  async openNotifications(): Promise<void> {
    await this.notifications.click();
  }

  /** Activates Go Premium in the sidebar. */
  async openGoPremium(): Promise<void> {
    await this.goPremium.click();
  }

  /** Logs out from the top bar. */
  async logOutOfApp(): Promise<void> {
    await this.logOut.click();
  }
}
