import type { Locator, Page } from '@playwright/test';
import { CreateGroupEventForm } from './components/create-group-event-form.component';
import { HeaderComponent } from './components/header.component';
import { PostAnnouncementForm } from './components/post-announcement-form.component';

/** One community: members, events, and announcements. */
export class CommunityDetailPage {
  readonly header: HeaderComponent;
  readonly createEvent: CreateGroupEventForm;
  readonly postAnnouncement: PostAnnouncementForm;
  readonly back: Locator;
  readonly heading: Locator;
  readonly inviteFamilies: Locator;
  readonly copyInviteLink: Locator;
  readonly members: Locator;
  readonly events: Locator;
  readonly announcements: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.createEvent = new CreateGroupEventForm(page);
    this.postAnnouncement = new PostAnnouncementForm(page);
    this.back = page.getByRole('link', { name: '← All communities', exact: true });
    this.heading = page.getByRole('heading', { level: 2 });
    this.inviteFamilies = page.getByRole('button', { name: 'Invite families', exact: true });
    this.copyInviteLink = page.getByRole('button', { name: 'Copy invite link', exact: true });
    this.members = page.getByRole('tab', { name: 'Members', exact: true });
    this.events = page.getByRole('tab', { name: 'Events', exact: true });
    this.announcements = page.getByRole('tab', { name: 'Announcements', exact: true });
  }

  /** Opens a community by its id. */
  async goto(communityId: string): Promise<void> {
    await this.page.goto(`/communities/${communityId}`);
  }

  /** Opens the Events tab. */
  async openEvents(): Promise<void> {
    await this.events.click();
  }

  /** Opens the Announcements tab. */
  async openAnnouncements(): Promise<void> {
    await this.announcements.click();
  }
}
