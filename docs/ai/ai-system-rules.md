# AI System Rules

These rules apply to all AI-powered portfolio projects.

## AI Positioning

AI should make the product smarter and easier to use. It should not be sprinkled on top as decoration.

Every project should define:

- What user problem AI solves.
- Which screens use AI.
- Which backend services support AI.
- What data AI can access.
- What users can edit before saving.
- What gets logged or audited.

## Required AI Patterns

Each project should include at least two meaningful AI features, such as:

- AI-assisted input or textarea writing.
- Summaries of records, tickets, documents, risks, incidents, or billing events.
- Suggestions for next actions.
- Classification, scoring, or prioritization.
- Natural-language search or filtering.
- Drafting email or notification text.
- Explaining dashboard metrics in plain language.

## Safety Rules

- AI output must be editable before saving.
- AI must not decide payment status.
- AI must not bypass permissions.
- AI must not expose another tenant's data.
- AI must not store secrets, passwords, tokens, or payment data in prompts.
- AI features must fail gracefully when unavailable.

## Backend AI Responsibilities

Backend owns:

- Permission checks before AI data access.
- Prompt input preparation.
- Redaction of sensitive data.
- Audit records for important AI actions.
- Queue jobs for expensive AI work.
- Persisted AI results only when useful.

## Frontend AI Responsibilities

Frontend owns:

- Clear AI assist buttons.
- Loading and disabled states.
- Preview/edit-before-save flow.
- Error feedback when AI is unavailable.
- User control over whether AI output is accepted.

## Documentation Rule

Each project must include `docs/ai-features.md` explaining:

- AI features included.
- User value.
- Screens involved.
- Backend services involved.
- Safety and audit decisions.

