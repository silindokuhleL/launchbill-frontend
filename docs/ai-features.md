# LaunchBill Frontend AI Features

LaunchBill should feel like an AI-assisted SaaS billing dashboard, not a plain admin CRUD app.

## Planned AI Features

### Billing Summary Assistant

Status: implemented in the frontend as a deterministic assistant workflow using tenant dashboard, invoice, and payment data. The UI is ready to connect to a backend AI service later.

Shows a plain-language summary of billing health on the AI Assist page.

Frontend responsibilities:

- Display billing context cards.
- Show loading, error, and empty states.
- Generate an editable summary draft.
- Link to relevant invoices, payments, and subscriptions.

### Payment Failure Draft Assistant

Status: implemented in the frontend as an editable draft modal on failed payment cards. The assistant uses the selected payment, invoice, customer, amount, and failure reason.

Helps draft customer follow-up messages for failed payments.

Frontend responsibilities:

- Add AI assist button to failed payment cards.
- Preview generated draft in a modal.
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
