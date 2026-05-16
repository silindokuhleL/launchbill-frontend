# LaunchBill Frontend Spec

## Goal

Build a client-facing Next.js dashboard that makes billing and subscription management feel clear, trustworthy, and business-ready.

## Frontend Responsibilities

- Render auth screens.
- Render protected dashboard screens.
- Call the Laravel REST API.
- Display loading, empty, success, and error states.
- Provide forms for plans, customers, subscriptions, and billing actions.
- Keep UI responsive on desktop and phone.
- Use reusable Coss UI/Base UI components where available.
- Use Lucide icons only.
- Use ECharts for dashboard charts.
- Use Axios through a shared API client.
- Keep shared domain and CRUD types in a `types/` folder, not inside page files.

## Main Pages

- Landing or login redirect.
- Login.
- Register or invite acceptance.
- Dashboard overview.
- Plans.
- Customers.
- Customer detail.
- Subscriptions.
- Invoices.
- Payments.
- Settings.
- Team and roles.
- Admin portal.
- Theme customization.

## UX Direction

The UI should feel like a practical SaaS admin product:

- Dense but readable.
- Clear page titles.
- Strong tables and filters.
- Useful status badges.
- Predictable forms.
- No oversized marketing sections inside the app.
- Mobile screens must stack cleanly and avoid horizontal scroll.

## API Integration Rules

- Use a central API client.
- Use Axios for HTTP requests.
- Store auth state carefully.
- Treat API validation errors as first-class UI states.
- Do not hardcode business data that should come from the backend.
- Use environment variables for API base URLs.
- Add caching deliberately where repeated API data benefits from reuse.
- Keep server data and client UI state separate.

## Required States

Every major page needs:

- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Permission-denied state where applicable.
- Disabled state for pending or unavailable actions.
- Skeletons or structured loading panels for page-level loading.
- Button-only spinners for submit actions.

## UI Component Standard

LaunchBill should include reusable:

- Modal.
- Table.
- Button.
- Tooltip.
- Dropdown.
- Alert with success, error, warning, and neutral states.
- Empty state.
- Error state.
- Skeleton.
- Input and textarea with optional AI assist where it helps the workflow.

## Theme Customization UI

LaunchBill should support account-level theme settings:

- Brand name preview.
- Primary color picker.
- Logo upload UI if backend media support is enabled.
- Save and reset actions.
- Clear disabled, loading, success, and error states.

## Testing Standard

- Use Vitest for core frontend logic.
- Use Playwright for critical browser flows.
- Test mobile responsiveness before marking UI tasks done.
- Confirm no horizontal overflow.
