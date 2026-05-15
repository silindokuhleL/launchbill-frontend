# Tooling And Quality Rules

These rules apply across frontend, backend, and documentation.

## Required Tooling

- PHPUnit for Laravel backend tests.
- Vitest for Next.js frontend tests.
- Playwright for end-to-end browser tests.
- Axios for frontend HTTP requests.
- Localization support for user-facing copy.

## Recommended Tooling To Add

- Bruno or another API client collection for manual API testing.
- GitHub Actions for CI checks.
- Docker Compose for local MySQL, Redis, mail, and queue support.
- Sentry or equivalent error tracking for production-quality proof.
- OpenAPI documentation for backend endpoints.

## Definition Of Done

A feature is not done until:

- Backend services are covered by tests where they own business logic.
- API Resources return data to the frontend.
- Seeders or factories support local testing.
- Frontend has loading, empty, success, and error states.
- Browser testing confirms mobile layout.
- Documentation is updated.

## Reusability Standard

- Extract repeated backend logic into services, traits, jobs, actions, policies, resources, or support classes.
- Extract repeated frontend UI into reusable components.
- Extract shared frontend types into `types/`.
- Extract shared API behavior into one client.
- Avoid copy-pasting tenant, role, logging, modal, table, and alert logic.

