# LaunchBill UI Pages Checklist

## Public And Auth

- [x] Login page.
- [ ] Register or invite page.
- [ ] Forgot password page if auth flow supports it.
- [x] Auth error state.

## Dashboard

- [x] Dashboard overview page.
- [ ] Revenue summary cards.
- [ ] Subscription status chart.
- [ ] Recent invoices table.
- [ ] Failed payment alert.

## Billing

- [x] Plans list page.
- [x] Create plan form.
- [x] Edit plan form.
- [x] Archive plan action.
- [x] Plans permission-denied state.
- [x] Customers list page.
- [ ] Customer detail page.
- [x] Subscriptions list page.
- [ ] Subscription detail page.
- [x] Invoices list page.
- [ ] Invoice detail page.
- [x] Payments list page.

## Admin

- [x] Team members page.
- [ ] Role management page.
- [x] Settings page.
- [x] Audit log page if included.
- [ ] Admin portal page.
- [ ] Theme customization page.

## Responsiveness

- [x] Works at 390px width.
- [ ] Works at tablet width.
- [x] Works at desktop width.
- [x] Plans page uses cards instead of a horizontal table on mobile.
- [x] Navigation is usable on phone.
- [x] No horizontal page overflow.

## Frontend Quality

- [x] Shared types live in `types/`.
- [x] Plan CRUD types are reused across page components.
- [x] API calls use the shared Axios client.
- [x] Lucide icons only.
- [x] Vitest covers core frontend logic.
- [x] Browser covers critical user flows.
- [ ] User-facing copy is ready for localization.
