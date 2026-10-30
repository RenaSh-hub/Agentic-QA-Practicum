# Authorization probe plan

Family A is `mainApi`. Family B is `altApi`. No token is `guestApi`. Ids come from this run only. No paths beyond `api/CATALOG.md` and `support/api.constants.ts`.

## Proposal

- Scope: this plan, `api/authz-probe.api.spec.ts`, one `npx playwright test api/authz-probe.api.spec.ts --project=api` run, then `qa-run/authz-report.json`. No product fix, no catalog edit, no bug, no pull request.
- Self-assessment (1–10, not a gate): 7
- Rationale: the catalog and `api/authorization.api.spec.ts` already record family B and anonymous `DELETE /api/v1/children/{id}`. This run repeats those deletes on a new child and probes the other rows that take an id or return one family's data.
- Unknowns: family A may have no community in `GET /api/v1/communities`. If so, the two community-id requests are replaced by `GET /api/v1/matches`. Upcoming playdates and the communities list are not called, so the run stays within 20 requests.

## Skipped

| Row | Why |
| --- | --- |
| `POST /api/v1/auth/register` | Catalog: unsafe, no observed undo |
| `DELETE /api/v1/me` | Catalog: unsafe, destructive |

## Attempts

| Catalog row | Who | What this run does |
| --- | --- | --- |
| `GET /api/v1/me` | alt, anonymous | Read. Oracle: family A's new child id, and on this route family A's family id |
| `GET /api/v1/connections` | alt, anonymous | Read. Oracle: family A's new child id |
| `GET /api/v1/availability` | alt, anonymous | Read. Oracle: family A's new child id |
| `GET /api/v1/communities` | — | Family A only, to obtain a community id. Not a cross-family attempt |
| `GET /api/v1/communities/{id}` | alt, anonymous | Only when family A's list returned an id |
| `GET /api/v1/events` | alt, anonymous | Read. Oracle: family A's new child id |
| `GET /api/v1/matches` | alt, anonymous | Only when family A has no community id (replaces the two community calls) |
| `GET /api/v1/playdates` | alt, anonymous | Read. Oracle: family A's new child id |
| `GET /api/v1/playdates?filter=upcoming` | alt, anonymous | Not this run. Same playdate resource; request cap |
| `POST /api/v1/children` | main only | Create, then `trackRecord` with owner `main` |
| `DELETE /api/v1/children/{id}` | alt, anonymous | The only cross-family writes. Catalog already observed 404 and 401 |

## Request ledger (20)

1. `POST /api/v1/children` as family A
2. `GET /api/v1/me` as family A (child is listed; capture family id)
3. `GET /api/v1/communities` as family A (capture first id, if any)
4. `GET /api/v1/me` as family B
5. `GET /api/v1/me` with no token
6. `GET /api/v1/communities/{id}` as family B, or `GET /api/v1/matches` as family B
7. `GET /api/v1/communities/{id}` with no token, or `GET /api/v1/matches` with no token
8. `GET /api/v1/connections` as family B
9. `GET /api/v1/connections` with no token
10. `GET /api/v1/availability` as family B
11. `GET /api/v1/availability` with no token
12. `GET /api/v1/events` as family B
13. `GET /api/v1/events` with no token
14. `GET /api/v1/playdates` as family B
15. `GET /api/v1/playdates` with no token
16. `DELETE /api/v1/children/{id}` as family B
17. `DELETE /api/v1/children/{id}` with no token
18. `GET /api/v1/me` as family A (owner follow-up)
19. `GET /api/v1/me` as family B (absence follow-up)
20. Owner `DELETE /api/v1/children/{id}` from the cleanup reporter after `trackRecord`

Stop on any 5xx. Do not send request 21.

## How outcomes will be decided

- **HELD** only when a refusal the catalog already describes is backed by the follow-up: the child is still on family A's `GET /api/v1/me`, and absent for family B when that check fits the route. A status code alone is not HELD.
- **BREACHED** when family B or the anonymous client returns family A's new child id, when `GET /api/v1/me` returns family A's family id, or when the owner follow-up no longer lists the child.
- **undocumented** when the catalog does not say what cross-family access should do, and the child was not read or changed. That is a question, not a bug.
