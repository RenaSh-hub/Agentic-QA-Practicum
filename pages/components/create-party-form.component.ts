import type { Locator, Page } from '@playwright/test';

/** Birthday party form on the Birthdays page. */
export class CreatePartyForm {
  readonly whoseBirthday: Locator;
  readonly partyTitle: Locator;
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
  readonly createPartyButton: Locator;

  constructor(private readonly page: Page) {
    this.whoseBirthday = page.getByRole('combobox').filter({
      has: page.getByRole('option', { name: 'Whose birthday? (optional)', exact: true }),
    });
    this.partyTitle = page.getByRole('textbox', { name: 'Party title', exact: true });
    this.when = page.getByRole('textbox', { name: /^$/ });
    this.venue = page.getByRole('textbox', {
      name: 'Venue (e.g. our backyard, Chuck E. Cheese…)',
      exact: true,
    });
    this.details = page.getByRole('textbox', { name: 'Details for guests (optional)', exact: true });
    this.noCard = page.getByRole('radio', { name: 'No card', exact: true });
    this.balloons = page.getByRole('radio', { name: 'Balloons', exact: true });
    this.birthdayCake = page.getByRole('radio', { name: 'Birthday cake', exact: true });
    this.dinosaur = page.getByRole('radio', { name: 'Dinosaur', exact: true });
    this.space = page.getByRole('radio', { name: 'Space', exact: true });
    this.underTheSea = page.getByRole('radio', { name: 'Under the sea', exact: true });
    this.rainbow = page.getByRole('radio', { name: 'Rainbow', exact: true });
    this.createPartyButton = page.getByRole('button', { name: 'Create party', exact: true });
  }

  /** Returns an invitee checkbox by its accessible name, such as "Ethan The Nguyens". */
  guest(name: string): Locator {
    return this.page.getByRole('checkbox', { name, exact: true });
  }

  /** Fills the party title. */
  async fillTitle(title: string): Promise<void> {
    await this.partyTitle.fill(title);
  }

  /** Selects an invitation card by its accessible name. */
  async chooseCard(name: string): Promise<void> {
    await this.page.getByRole('radio', { name, exact: true }).click();
  }

  /** Submits the party invitation. */
  async submit(): Promise<void> {
    await this.createPartyButton.click();
  }
}
