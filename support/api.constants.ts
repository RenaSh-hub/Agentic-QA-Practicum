/** REST paths observed for sign-up create / account delete (AQPBT-4 discovery). */
export const API_AUTH_REGISTER = '/api/v1/auth/register';
export const API_ME = '/api/v1/me';
/** Children create/delete observed on the live dashboard client and confirmed over HTTP (AQPBT-5). */
export const API_CHILDREN = '/api/v1/children';
/** GET paths from api/CATALOG.md (2026-10-16 live discovery). */
export const API_CONNECTIONS = '/api/v1/connections';
export const API_AVAILABILITY = '/api/v1/availability';
export const API_COMMUNITIES = '/api/v1/communities';
export const API_EVENTS = '/api/v1/events';
export const API_MATCHES = '/api/v1/matches';
export const API_PLAYDATES = '/api/v1/playdates';

/** Community detail: `/api/v1/communities/{id}`. */
export function apiCommunityPath(id: string): string {
  return `${API_COMMUNITIES}/${id}`;
}
