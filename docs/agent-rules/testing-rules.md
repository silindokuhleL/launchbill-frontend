# Testing Rules

## Backend Testing

Backend tests should cover:

- Authentication.
- Authorization and RBAC.
- Validation errors.
- Happy path resource creation and updates.
- Payment webhook verification.
- Subscription state changes.
- Queue job behavior where practical.

## Frontend Testing

Frontend testing should cover:

- Page rendering.
- Form validation.
- API loading states.
- Empty states.
- Error states.
- Mobile layout.
- Critical user flows in the browser.

## Manual Browser Checks

Before a frontend task is considered done:

- Check desktop width.
- Check phone width.
- Confirm no horizontal overflow.
- Confirm primary buttons are visible.
- Confirm forms show useful feedback.
- Confirm navigation works.

## Documentation Check

Every task should ask:

- Did an API endpoint change?
- Did a database table change?
- Did a user flow change?
- Did the portfolio case study need an update?

