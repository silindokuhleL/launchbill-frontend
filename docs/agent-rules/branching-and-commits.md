# Branching And Commits

## Branch Flow

1. Check current state with `git status --short --branch`.
2. Switch to `master`.
3. Pull latest changes with `git pull --ff-only`.
4. Create a task branch.
5. Make the smallest useful change.
6. Run checks.
7. Commit.
8. Push the branch.
9. Merge back to `master`.
10. Push `master`.

## Commit Style

Use short, useful commit messages:

- `docs: add launchbill backend api plan`
- `feat: add subscription plan endpoints`
- `test: cover payment webhook validation`
- `fix: handle expired subscription state`

## Branch Naming

Use one of these patterns:

- `task/launchbill-project-docs`
- `task/launchbill-auth-api`
- `task/launchbill-dashboard-ui`
- `task/launchbill-payment-webhooks`

## Small Commit Rule

A commit should usually cover one idea:

- One doc section.
- One API resource.
- One frontend page.
- One test group.
- One bug fix.

