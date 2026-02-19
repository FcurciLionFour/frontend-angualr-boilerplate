# AI Boilerplate Context

Last updated: 2026-02-18

## What This Project Is
This repo is an Angular standalone frontend boilerplate for client projects.
It is not a demo. It is the reusable base for production-style apps.

Main goals:
- security first
- strict backend contract alignment
- clean feature modularity
- reusable UI and guards
- predictable auth/session behavior

## Stack and Architecture
- Angular standalone + signals
- Tailwind CSS
- Feature-first structure under `src/app/features`
- Cross-cutting concerns under `src/app/core`
- Shared UI under `src/app/shared`

Key folders:
- `src/app/core/auth` -> auth api/store/session orchestration
- `src/app/core/http` -> interceptors + backend error normalization
- `src/app/core/security` -> guards + csrf api
- `src/app/features/auth` -> login/forgot/reset flows
- `src/app/features/users` -> users CRUD screens and api

## Backend Contract to Respect
Source docs:
- `docs/FRONTEND_BACKEND_ALIGNMENT.md`
- `docs/AUTH_CONTRACT.md`

Critical contract points:
- Access token in `Authorization` header.
- Refresh token only in HttpOnly cookie `refresh_token`.
- CSRF double-submit with cookie `csrf_token` + header `x-csrf-token`.
- Frontend sends requests with `withCredentials: true`.
- 401 handling: refresh once (except excluded endpoints), then retry original request.
- If refresh fails: clear session and redirect to `/auth/login`.
- Error codes may come as `code`, `errorCode`, or `error_code`.
- 429 can include `retryAfterSeconds`.

## Current Session/Auth Flow (Expected)
1. App bootstrap calls session init through APP_INITIALIZER.
2. Init flow:
   - `GET /auth/csrf`
   - `POST /auth/refresh`
   - `GET /auth/me`
3. Login flow:
   - `GET /auth/csrf`
   - `POST /auth/login`
   - `GET /auth/me`
4. Register flow:
   - `GET /auth/csrf`
   - `POST /auth/register`
   - `GET /auth/me`
5. Logout flow:
   - `GET /auth/csrf`
   - `POST /auth/logout`
   - clear local auth state
   - navigate to login

## Security and Guarding Model
- Global private layout guarded by auth guard.
- Public auth area guarded by public guard.
- Permission checks via `permissionGuard(['resource.action'])`.
- Self/admin checks via `selfOrAdminGuard`.

## Rules for AI When Modifying This Repo
- Do not break auth, refresh, csrf, or guard semantics.
- Keep backend calls centralized in feature/core api services.
- Keep typed DTOs aligned with backend responses.
- If backend contract changes, update:
  - service methods
  - interceptors/error mapping
  - UI error handling
  - tests
  - docs
- Prefer smallest safe change; avoid unnecessary framework churn.

## Rules for AI When Starting a New Client Project From This Boilerplate
1. Keep `core/auth`, `core/http`, `core/security` intact first.
2. Set new environment `apiBaseUrl` and CORS-compatible domain setup.
3. Add client domains as new feature modules.
4. Extend menu/permissions from backend RBAC.
5. Preserve centralized error handling and refresh logic.
6. Add contract tests for new backend endpoints.
7. Update this file and `AGENTS.md` with client-specific constraints.

## High-Value Enhancements Recommended
- Add explicit route and UI for `change-password`.
- Keep logout behavior centralized in `SessionService` only.
- Align users delete UI with backend `DELETE /users/:id` contract.
- Parse `Retry-After` header as fallback when `retryAfterSeconds` is absent.
- Improve 403 UX by backend error code (csrf invalid vs access denied).
- Add smoke tests for init/login/refresh/logout flows.

## Operational Validation
- Auth contract smoke script: `scripts/smoke-auth-contract.ps1`
- How to run: `docs/SMOKE_TEST_CONTRACT.md`
- Go-live checklist: `docs/GO_LIVE_FRONT_CHECKLIST.md`
