# API Contract Rules

These rules apply to REST API work across all projects.

## REST API Shape

- Use resource-based routes.
- Use JSON request and response bodies.
- Use consistent pagination for list endpoints.
- Use consistent error responses.
- Use clear HTTP status codes.

## Response Pattern

Successful single-resource response:

```json
{
  "data": {}
}
```

Successful list response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 0
  }
}
```

Error response:

```json
{
  "message": "Validation failed.",
  "errors": {}
}
```

## Ownership Rules

- Backend validates all input.
- Backend checks permissions for every protected action.
- Backend owns payment state and subscription state.
- Frontend treats API responses as the source of truth.

## Versioning

Use `/api/v1` for project APIs unless a project has a reason to do otherwise.

