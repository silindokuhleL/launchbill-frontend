# LaunchBill Frontend AI Features

LaunchBill should feel like an AI-assisted SaaS billing dashboard, not a plain admin CRUD app.

## Planned AI Features

### Billing Summary Assistant

Shows a plain-language summary of billing health on the dashboard.

Frontend responsibilities:

- Display summary card.
- Show loading, error, and empty states.
- Allow refresh.
- Link to relevant invoices, payments, and subscriptions.

### Payment Failure Draft Assistant

Helps draft customer follow-up messages for failed payments.

Frontend responsibilities:

- Add AI assist button to the message textarea.
- Preview generated draft.
- Let user edit before sending or saving.
- Show disabled/loading/error states.

### Admin Activity Insight Assistant

Helps admins understand key account and tenant activity.

Frontend responsibilities:

- Show generated insight panel.
- Keep tenant and permission state clear.
- Never show data the backend does not return.

## AI UI Rules

- AI assist must be optional.
- Generated text must be editable.
- AI actions need clear loading states.
- AI errors should be understandable.
- AI should never hide the normal manual workflow.

