# Agent Rules

These rules guide all agent work for the portfolio projects.

## Working Priority

- Work on one project at a time.
- The active project is `01-launchbill-saas-subscription-billing-platform`.
- Do not start implementation on the next project until the active project passes its completion checklist.
- Future project folders may be updated for planning only.

## Repository Workflow

- Always start from `master`.
- Always run `git pull --ff-only` before creating a new task branch.
- Use a focused branch name such as `task/launchbill-auth-api`.
- Make small commits with clear messages.
- Merge the branch back into `master` only after checks pass.
- Push `master` after merging so Vercel or other deployment tools can pick up the update.

## Frontend And Backend Boundaries

- Frontend and backend must be documented separately.
- Backend owns business rules, payments, permissions, persistence, validation, and audit records.
- Frontend owns presentation, user flows, client-side form state, and API integration.
- The frontend must not fake backend business logic.
- The backend must expose REST APIs for the frontend.
- Backend implementation must follow `LARAVEL_BACKEND_RULES.md`.
- Frontend implementation must follow `NEXTJS_FRONTEND_RULES.md`.
- Testing, API clients, localization, and reusability must follow `TOOLING_AND_QUALITY_RULES.md`.

## Documentation Rules

- Update docs in the same branch as the feature.
- If an endpoint changes, update `backend/API_ENDPOINTS.md`.
- If a table or relationship changes, update `backend/DATABASE_SCHEMA.md`.
- If a page or flow changes, update the relevant frontend checklist.
- Every finished project needs screenshots, deployment notes, README, and portfolio case study content.

## Quality Rules

- Test the backend with automated tests where practical.
- Test the frontend in the browser for desktop and mobile.
- Validate loading, empty, success, and error states.
- Keep implementation aligned with the project checklist.
