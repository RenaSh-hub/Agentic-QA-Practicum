import type { Locator, Page } from '@playwright/test';

/**
 * Avatar picker opened from Change avatar.
 * Choices seen: Fox, Dino, Robot, Cat, Penguin, Unicorn, Bear, Bunny, Frog, Owl, Lion, Panda, Whale, Ladybug, Rocket, Ball.
 */
export class AvatarPickerComponent {
  readonly gender: Locator;
  readonly done: Locator;
  readonly preferNotToSay: Locator;
  readonly boy: Locator;
  readonly girl: Locator;
  /** Editor shell: contains **done**, not the add-child form (same Fox…Ball names appear in both). */
  private readonly editor: Locator;

  constructor(private readonly page: Page) {
    this.done = page.getByRole('button', { name: 'done', exact: true });
    this.gender = page.getByRole('combobox').filter({
      has: page.getByRole('option', { name: 'Prefer not to say', exact: true }),
    });
    this.preferNotToSay = this.gender.getByRole('option', { name: 'Prefer not to say', exact: true });
    this.boy = this.gender.getByRole('option', { name: 'Boy', exact: true });
    this.girl = this.gender.getByRole('option', { name: 'Girl', exact: true });
    this.editor = page
      .locator('div')
      .filter({ has: this.done })
      .filter({ hasNot: page.getByRole('button', { name: 'Add child', exact: true }) })
      .first();
  }

  /** Returns an avatar button by its accessible name, such as "Fox", scoped to the open editor. */
  avatar(name: string): Locator {
    return this.editor.getByRole('button', { name, exact: true });
  }

  /** Selects the named avatar. */
  async choose(name: string): Promise<void> {
    await this.avatar(name).click();
  }

  /** Confirms the picker with done. */
  async close(): Promise<void> {
    await this.done.click();
  }
}
