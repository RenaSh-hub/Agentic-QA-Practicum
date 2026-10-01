import type { Locator, Page } from '@playwright/test';

/** Create-a-group-event form on a community's Events tab. */
export class CreateGroupEventForm {
  readonly title: Locator;
  readonly when: Locator;
  readonly venue: Locator;
  readonly details: Locator;
  readonly noCard: Locator;
  readonly balloons: Locator;
  readonly birthdayCake: Locator;
  readonly dinosaur: Locator;
  readonly space: Locator;
  readonly underTheSea: Locator;
  readonly rainbow: Locator;
  readonly createEventButton: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByRole('textbox', { name: 'Event title', exact: true });
    this.when = page.getByRole('textbox', { name: /^$/ });
    this.venue = page.getByRole('textbox', { name: 'Venue (optional)', exact: true });
    this.details = page.getByRole('textbox', {
      name: 'Details for families (optional)',
      exact: true,
    });
    this.noCard = page.getByRole('radio', { name: 'No card', exact: true });
    this.balloons = page.getByRole('radio', { name: 'Balloons', exact: true });
    this.birthdayCake = page.getByRole('radio', { name: 'Birthday cake', exact: true });
    this.dinosaur = page.getByRole('radio', { name: 'Dinosaur', exact: true });
    this.space = page.getByRole('radio', { name: 'Space', exact: true });
    this.underTheSea = page.getByRole('radio', { name: 'Under the sea', exact: true });
    this.rainbow = page.getByRole('radio', { name: 'Rainbow', exact: true });
    this.createEventButton = page.getByRole('button', { name: 'Create event', exact: true });
  }

  /** Fills the event title. */
  async fillTitle(title: string): Promise<void> {
    await this.title.fill(title);
  }

  /** Selects an invitation card by its accessible name. */
  async chooseCard(name: string): Promise<void> {
    await this.page.getByRole('radio', { name, exact: true }).click();
  }

  /** Submits the group event. */
  async submit(): Promise<void> {
    await this.createEventButton.click();
  }
}
