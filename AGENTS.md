# AGENTS.md

## Purpose
This repository is a frontend boilerplate meant to be reused for freelance client projects.
Primary goal: keep frontend-backend contract alignment strict and production-safe.

## Mandatory Context Before Any Change
Read these files first:
- `docs/FRONTEND_BACKEND_ALIGNMENT.md`
- `docs/AUTH_CONTRACT.md`
- `docs/PROJECT_OVERVIEW.md`

If two docs conflict, treat `docs/FRONTEND_BACKEND_ALIGNMENT.md` as the source of truth and leave a note in your PR/changeset.

## Non-Negotiable Contract Rules
- Always use backend base URL from environment via `API_CONFIG`.
- Keep `withCredentials: true` for backend requests.
- Keep CSRF double-submit behavior:
  - cookie: `csrf_token`
  - header: `x-csrf-token`
- Access token must only be sent as `Authorization: Bearer <token>`.
- Never persist refresh token in local storage/session storage.
- Keep centralized 401 refresh flow and single retry behavior.
- On refresh failure, clear local session and navigate to login.
- Handle backend error code aliases: `code`, `errorCode`, `error_code`.

## Backend Error Handling Standards
- Normalize backend errors through `src/app/core/http/backend-error.ts`.
- Respect `retryAfterSeconds` for lockout/rate-limit UX.
- Preserve `requestId` in logs when provided.
- Prefer error-code based UX messages over status-only messages for 403.

## Auth and Session Flow Standards
- Session init must run at app bootstrap.
- Login flow must be: CSRF init -> login -> me.
- Logout must include CSRF and support 204/no-body responses.
- Public auth endpoints must not trigger refresh loops.

## Routing and Security Standards
- Protect private area with auth guard.
- Protect feature actions with permission guard(s).
- Keep self/admin restrictions explicit in route guards.
- Do not expose UI actions the current user cannot execute.

## Feature Development Standards
- New domain goes under `src/app/features/<domain>/`.
- Each feature must own:
  - routes
  - api service
  - UI components
- Avoid putting business logic in shared layouts.
- Reuse `core/` only for truly cross-cutting concerns.

## Testing and Quality Gates
- For HTTP contract changes, update/add tests in:
  - `src/app/core/http/*.spec.ts`
  - `src/app/core/auth/*.spec.ts`
- Keep strict typing; do not use `any` unless unavoidable and documented.
- Before finishing: run lint/build/tests when requested or when behavior changed.

## Boilerplate Reuse Rule
When adapting this boilerplate for a new client:
- Keep auth/session/security core untouched first.
- Add client-specific modules as new features.
- Change branding/theme/config, not security semantics.
- Keep this file and `docs/AI_BOILERPLATE_CONTEXT.md` updated so future AI sessions start with complete context.

