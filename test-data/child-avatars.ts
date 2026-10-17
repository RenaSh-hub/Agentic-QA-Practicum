/** Avatar icon accessible names on the add-child form and Change avatar editor. */
export const CHILD_AVATAR_NAMES = [
  'Fox',
  'Dino',
  'Robot',
  'Cat',
  'Penguin',
  'Unicorn',
  'Bear',
  'Bunny',
  'Frog',
  'Owl',
  'Lion',
  'Panda',
  'Whale',
  'Ladybug',
  'Rocket',
  'Ball',
] as const;

/** Interest chip accessible names on the add-child form. */
export const CHILD_INTEREST_CHIPS = [
  '+ LEGO',
  '+ Minecraft',
  '+ Soccer',
  '+ Art',
  '+ Reading',
  '+ Dance',
  '+ Hockey',
  '+ Crafts',
] as const;

export const LEGO_INTEREST_CHIP = '+ LEGO';
export const LEGO_INTEREST_VALUE = 'LEGO';

/**
 * Dashboard kid-row summary from a live GET /api/v1/me child.
 * Uses the API `age` field; does not compute age from birth year.
 */
export function childRowSummary(child: {
  firstName: string;
  age: number;
  gender: string | null;
}): string {
  if (!child.gender) {
    return `${child.firstName}, ${child.age}`;
  }
  const genderLabel = `${child.gender.charAt(0).toUpperCase()}${child.gender.slice(1)}`;
  return `${child.firstName}, ${child.age} · ${genderLabel}`;
}
