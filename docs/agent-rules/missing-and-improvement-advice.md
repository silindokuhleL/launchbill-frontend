# Missing And Improvement Advice

The requested Laravel, Next.js, and tooling standards are strong. These additions would make the projects more production-ready and stronger as portfolio proof.

## Strongly Recommended Additions

- API testing collection with Bruno or Postman.
- OpenAPI documentation for REST endpoints.
- GitHub Actions for automated checks.
- Docker Compose for local MySQL, Redis, mail, and queues.
- Sentry or similar production error tracking.
- Rate limiting on auth and sensitive endpoints.
- Backup and restore notes for database-backed projects.
- Mail testing tool for local email previews.
- Policies and gates documented alongside RBAC.
- Factories in addition to seeders for cleaner PHPUnit tests.

## Laravel Improvements

- Add a standard folder convention for services, actions, traits, resources, policies, jobs, and notifications.
- Add reusable request logging middleware.
- Add reusable audit logging service.
- Add tenant context resolver for tenant-aware projects.
- Add model scopes for tenant-owned data.
- Add permission seeder that creates global roles and tenant roles separately.

## Next.js Improvements

- Pick one clear state strategy before implementation starts.
- Decide whether API data caching will use TanStack Query, SWR, or framework-level caching.
- Add a form strategy for validation and server error mapping.
- Add accessibility checks for modals, dropdowns, tooltips, and alerts.
- Add a shared design token/theme layer so tenant theme customization is easy to apply.

## LaunchBill Recommendation

For LaunchBill, build in this order:

1. Laravel backend foundation: auth, tenants, roles, services, resources, seeders, logging.
2. Next.js frontend foundation: app shell, API client, types, reusable UI, states.
3. Billing domain: plans, customers, subscriptions, invoices, PayFast webhooks.
4. Admin portal and theme customization.
5. Tests, deployment, screenshots, and portfolio case study.

This keeps the project impressive without becoming chaotic.

