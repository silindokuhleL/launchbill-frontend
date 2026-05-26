# AGENTS.md

These instructions apply to the LaunchBill frontend repository.

## Project Identity

LaunchBill frontend is a Next.js dashboard for an AI-assisted SaaS billing platform. It must be responsive, reusable, testable, and API-driven.

## Required Reading

Before frontend work, read:

- `docs/agent-rules/agent-rules.md`
- `docs/agent-rules/branching-and-commits.md`
- `docs/agent-rules/api-contract-rules.md`
- `docs/agent-rules/nextjs-frontend-rules.md`
- `docs/agent-rules/testing-rules.md`
- `docs/ai/ai-system-rules.md`
- `docs/frontend/FRONTEND_SPEC.md`

## Frontend Rules

- Use TypeScript.
- Use Tailwind CSS.
- Use Coss UI components as the project UI standard.
- Use Lucide icons only.
- Use ECharts for reporting and dashboard charts.
- Use Axios through a shared API client.
- Keep shared domain and CRUD types in `types/`, not page files.
- Build reusable modal, table, button, tooltip, dropdown, alert, loading, empty, and error components.
- Spinners are only allowed inside buttons.
- Page-level loading must use skeletons or structured loading panels.
- Every page must support mobile layouts without horizontal overflow.

## AI Rules

- AI features must be useful and visible, not decorative.
- AI output must be editable before saving.
- AI assist must show loading, disabled, error, and success states.
- AI must not bypass backend permissions or business rules.
- AI workflows must call backend endpoints that enforce tenant and RBAC scope.

## Workflow

- Start from `master`.
- Pull before branching.
- Use focused task branches.
- Make small commits.
- Use the Codex in-app Browser plugin for frontend verification.
- Do not use standalone Playwright for this project unless the user explicitly requests it.
- Run relevant checks before merging.
