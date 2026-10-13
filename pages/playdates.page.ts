import type { Locator, Page } from '@playwright/test';
import { HeaderComponent } from './components/header.component';
import { ProposePlaydateForm } from './components/propose-playdate-form.component';
import { AppRoute } from '../test-data/routes';

/** Find a playdate, pending requests, and past playdates. */
export class PlaydatesPage {
  readonly header: HeaderComponent;
  readonly propose: ProposePlaydateForm;
  readonly heading: Locator;
  readonly intro: Locator;
  readonly proposeTitle: Locator;
  readonly matchesBadge: Locator;
  readonly pendingRequestsTitle: Locator;
  readonly pendingRequestsCount: Locator;
  readonly noPendingRequests: Locator;
  readonly upcomingTitle: Locator;
  readonly upcomingCount: Locator;
  readonly noUpcomingPlaydates: Locator;
  readonly setupGate: Locator;
  readonly accept: Locator;
  readonly decline: Locator;
  readonly cancel: Locator;
  readonly googleCalendar: Locator;
  readonly ics: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.propose = new ProposePlaydateForm(page);
    this.heading = page.getByRole('heading', { name: 'Find a playdate', exact: true });
    this.intro = page.getByText(
      'Pick a family, choose a matched slot or propose a manual time, then wait for the other parent to approve.',
      { exact: true },
    );
    this.proposeTitle = page.getByText('Propose', { exact: true });
    this.matchesBadge = page.getByText(/^\d+ matches$/);
    this.pendingRequestsTitle = page.getByText('Pending requests', { exact: true });
    this.pendingRequestsCount = this.pendingRequestsTitle.locator('..').getByText('0', { exact: true });
    this.noPendingRequests = page.getByText('No pending requests.', { exact: true });
    this.upcomingTitle = page.getByText('Upcoming', { exact: true });
    this.upcomingCount = this.upcomingTitle.locator('..').getByText('0', { exact: true });
    this.noUpcomingPlaydates = page.getByText('No upcoming playdates yet.', { exact: true });
    this.setupGate = page.getByText('Set up your family on the Dashboard before planning playdates.');
    this.accept = page.getByRole('button', { name: 'Accept', exact: true });
    this.decline = page.getByRole('button', { name: 'Decline', exact: true });
    this.cancel = page.getByRole('button', { name: 'cancel', exact: true });
    this.googleCalendar = page.getByRole('link', { name: 'Google', exact: true });
    this.ics = page.getByRole('button', { name: 'ICS', exact: true });
  }

  /** Opens the playdates page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Playdates);
  }
}
