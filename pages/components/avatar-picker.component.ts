import type { Locator, Page } from '@playwright/test';

/**
 * Avatar picker opened from Change avatar.
 * Choices seen: Fox, Dino, Robot, Cat, Penguin, Unicorn, Bear, Bunny, Frog, Owl, Lion, Panda, Whale, Ladybug, Rocket, Ball.
 */
export class AvatarPickerComponent {
  readonly gender: Locator;
  readonly done: Locator;

  constructor(private readonly page: Page) {
    this.done = page.getByRole('button', { name: 'done', exact: true });
    this.gender = page.getByRole('combobox').filter({
      has: page.getByRole('option', { name: 'Prefer not to say', exact: true }),
    });
  }

  /** Returns an avatar button by its accessible name, such as "Fox". */
  avatar(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
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
