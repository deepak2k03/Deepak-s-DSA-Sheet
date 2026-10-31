---
description: API design rules, REST standards, pagination conventions, and response envelopes
globs: server/routes/**/*, client/src/utils/*Api.ts
---

# API Design & Contract Rules

These rules define the API contract between the client and server.

## 1. RESTful URL Structure
- Resource collections: `GET /api/topics`, `GET /api/visualizers`
- Specific resource: `GET /api/problems/:topic`, `GET /api/visualizers/:slug`
- Mutations: `POST /api/problems`, `PUT /api/problems/:id`, `DELETE /api/problems/:id`
- State toggle: `PATCH /api/admin/visualizers/:id/status`, `POST /api/admin/topics/:id/restore`

## 2. Pagination Standard
All paginated admin endpoints must implement `parsePaging(req.query)` and return the unified pagination envelope:

```json
{
  "items": [...],
  "total": 524,
  "page": 1,
  "limit": 20,
  "totalPages": 27,
  "pages": 27,
  "pagination": {
    "total": 524,
    "page": 1,
    "limit": 20,
    "pages": 27,
    "totalPages": 27
  }
}
```

- When `limit=all` or `limit=0` or `all=true` is passed, return up to `5000` items with `skip: 0`.
- The pagination bar on the client reads both `totalPages` and `pages` defensively.

## 3. Error Responses
- Always return JSON with a `msg` or `message` key:
  ```json
  { "msg": "Topic name is required" }
  ```
- Use accurate HTTP status codes:
  - `400 Bad Request`: Validation failure, duplicate key.
  - `401 Unauthorized`: Missing, invalid, or expired authentication token.
  - `403 Forbidden`: Insufficient role permissions or deactivated account.
  - `404 Not Found`: Entity does not exist.
  - `429 Too Many Requests`: Rate limit exceeded.
  - `500 Internal Server Error`: Unhandled server exception.

## 4. Header Authentication
- Support both:
  - `x-auth-token: <jwt>`
  - `Authorization: Bearer <jwt>`
- Client API helpers (`client/src/utils/auth.ts`, `client/src/utils/visualizerApi.ts`) must send both headers for maximum compatibility.

