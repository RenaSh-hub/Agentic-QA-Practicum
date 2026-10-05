/** Returns the same address with the first alphabetic character toggled in case (AC22, AC23). */
export function signupEmailWithDifferentCase(email: string): string {
  const index = email.search(/[a-zA-Z]/);
  if (index === -1) {
    return email;
  }
  const character = email[index];
  const toggled =
    character === character.toLowerCase() ? character.toUpperCase() : character.toLowerCase();
  return `${email.slice(0, index)}${toggled}${email.slice(index + 1)}`;
}
