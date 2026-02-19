# Go-Live Front Checklist

## 1. Contract Alignment
- [ ] `docs/FRONTEND_BACKEND_ALIGNMENT.md` reviewed and up to date
- [ ] `docs/AUTH_CONTRACT.md` reviewed and up to date
- [ ] `withCredentials: true` enabled for backend calls
- [ ] CSRF flow validated (`/auth/csrf` + `x-csrf-token`)
- [ ] Refresh flow validated (401 -> refresh once -> retry)

## 2. Security Flows
- [ ] Login works with real backend user
- [ ] Register works (if backend enables `/auth/register`)
- [ ] Logout returns 204 and clears local session
- [ ] Protected routes block unauthenticated users
- [ ] Permission routes block unauthorized users (403 flow)

## 3. Users Feature
- [ ] List users works with RBAC constraints
- [ ] Create user works for `users.write`
- [ ] Edit user works for `users.write`
- [ ] Delete user uses `DELETE /users/:id`
- [ ] Self/admin access checks in user detail are correct

## 4. Error and Rate Limit UX
- [ ] 429 shows cooldown/retry messaging
- [ ] 403 shows correct message by backend `code`
- [ ] 401 auth failures redirect to login after refresh fail
- [ ] `requestId` appears in logs when backend sends it

## 5. Build Quality
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] `npm test -- --watch=false --browsers=ChromeHeadless` passes
- [ ] Smoke test script passes (`docs/SMOKE_TEST_CONTRACT.md`)

## 6. Environment and Deployment
- [ ] `environment.ts` points to local backend
- [ ] `environment.prod.ts` points to production backend
- [ ] Production CORS origin includes frontend URL
- [ ] Cookie policy (`sameSite`, `secure`) matches deployment setup

## 7. Boilerplate Readiness
- [ ] `AGENTS.md` updated with project-specific constraints
- [ ] `docs/AI_BOILERPLATE_CONTEXT.md` updated
- [ ] New feature modules follow `core/features/shared` boundaries
