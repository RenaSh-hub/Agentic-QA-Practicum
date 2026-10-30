---
name: api-test-design
description: "Designs API test cases as a table a human approves, from api/CATALOG.md only, before any test code exists. Use when the user asks what to test for an endpoint or an area of the API, asks for test cases, test ideas, a test plan or coverage. Writes api/test-design/<area>.md and stops for approval. Do NOT use to write test code — that is api-contract-tests."
paths: "api/**"
---

1. Read the endpoints of the area in api/CATALOG.md only.
2. Write api/test-design/<area>.md, one table per endpoint:
   ID | type (positive / negative / error) | what we send | expected status |
   expected body (rule, key values) | source (api/CATALOG.md row) | technique
3. Expected results come only from rows labeled executed (observed); these become
   characterization tests. Positive: the main success case, plus one row per executed
   option or default.
4. Negative, with the technique named in its column:
   - boundary values: 0, the smallest valid value, exactly at a limit, one over it
     (one unit more than ordered, one cent more than received);
   - equivalence classes: one row per kind of bad input (missing field, empty string,
     wrong type, negative number);
   - state: the step done in the wrong order or done twice.
5. Families — one technique, two rows: the same request as the other family on this
   family's data (apiAlt on an id apiMain created), and with no token (apiAnonymous).
   Expected status and expected body on these rows only when an executed catalog row
   records them.
6. Anything else is a row marked "assumed — ask" or "not yet tested", with no expected
   result.
7. Stop. Show the table and wait for the human to answer "approved" or ask for changes.
   Write no test code.
