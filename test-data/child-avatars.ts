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
