# Next.js Frontend Rules

These rules apply to Next.js frontend projects in this portfolio system.

## Required Stack

- Next.js.
- TypeScript.
- Tailwind CSS.
- Coss UI components as the project UI standard.
- Base UI primitives only when they are wrapped into reusable project components and do not break the Coss design direction.
- Lucide icons only.
- ECharts for charts and reporting dashboards.
- Axios for API calls.
- Vitest for frontend unit and integration tests.
- Playwright for end-to-end browser testing.

## Component Rules

- Build reusable overlay UI elements:
  - Modal.
  - Table.
  - Button.
  - Tooltip.
  - Dropdown.
  - Alert.
  - Drawer or sheet if needed for mobile.
- Alerts must support success, error, warning, and neutral/info states.
- Use Coss UI components for user-facing controls unless a documented exception is needed.
- Loading, empty, and error states must be reusable.
- Spinners are only allowed inside buttons.
- Page-level loading should use skeletons or structured loading panels.
- Disabled states must be explicit on buttons, inputs, and destructive actions.

## State And Data Rules

- Use a clear state-management approach before building complex workflows.
- Keep server data and client UI state separate.
- Use caching deliberately for API data that benefits from reuse.
- Do not hide API problems behind fake frontend data.
- All API calls should go through a shared Axios client.

## TypeScript Rules

- Page files should not own shared domain types.
- Shared CRUD types must live in a `types/` folder.
- API request and response types should be reusable across pages and components.
- Avoid `any` for core domain objects.

## AI Input Rule

- Inputs or textareas may include AI assist where it helps the workflow.
- AI assist must be optional and should not block normal manual input.
- AI-generated text should be editable before saving.

## Responsive Rules

- Every screen must be 100% mobile responsive.
- Test at phone, tablet, and desktop widths.
- No horizontal overflow.
- Tables need a mobile strategy, such as stacked cards or responsive columns.

## Localization Rules

- User-facing labels should be easy to move into localization files.
- Avoid scattering repeated hardcoded copy across many components.
- Date, currency, and number formatting should be locale-aware where relevant.
