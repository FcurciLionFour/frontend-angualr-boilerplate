# Smoke Test Contract

Quick contract validation for frontend-backend auth alignment.

## Prerequisites
- Backend running and reachable (default `http://localhost:3000`)
- Existing user credentials in backend
- PowerShell available

## Environment Variables
- `SMOKE_AUTH_EMAIL`
- `SMOKE_AUTH_PASSWORD`
- Optional: `API_BASE_URL` (defaults to `http://localhost:3000`)

## Run
```powershell
$env:SMOKE_AUTH_EMAIL = "user@example.com"
$env:SMOKE_AUTH_PASSWORD = "Password123"
$env:API_BASE_URL = "http://localhost:3000"
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-auth-contract.ps1
```

## What It Verifies
1. `GET /health` returns `status=ok`
2. `GET /auth/csrf` returns 200 and sets `csrf_token` cookie
3. `POST /auth/login` returns `accessToken`
4. `GET /auth/me` works with bearer token
5. `POST /auth/logout` returns 204 using csrf header

## Expected Output
`[DONE] Auth contract smoke test passed.`

## Failure Policy
If any step fails:
1. Check backend logs and CORS/cookie settings.
2. Re-run and capture the exact failing step.
3. Compare response with `docs/FRONTEND_BACKEND_ALIGNMENT.md`.
