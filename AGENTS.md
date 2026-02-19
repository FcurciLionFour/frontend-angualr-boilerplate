# AGENTS.md

## Objetivo
Este repo es la base frontend para proyectos cliente.
Prioridad absoluta: mantener alineacion estricta con el backend y no romper seguridad de sesion.

## Lectura obligatoria antes de tocar codigo
Lee en este orden:
1. `docs/FRONTEND_BACKEND_ALIGNMENT.md`
2. `docs/AUTH_CONTRACT.md`
3. `docs/AI_BOILERPLATE_CONTEXT.md`
4. `docs/GO_LIVE_FRONT_CHECKLIST.md`

Si hay conflicto entre documentos, manda `docs/FRONTEND_BACKEND_ALIGNMENT.md`.

## Reglas innegociables de contrato FE/BE
- Base URL siempre desde `API_CONFIG` (`environment` por ambiente).
- Requests al backend con `withCredentials: true`.
- CSRF double submit: cookie `csrf_token` + header `x-csrf-token`.
- Access token solo en `Authorization: Bearer <token>`.
- Nunca persistir refresh token en local/session storage.
- 401: refresh una sola vez y retry una sola vez.
- Si refresh falla: limpiar sesion local y navegar a `/auth/login`.
- Normalizar error codes por alias: `code`, `errorCode`, `error_code`.

## Flujos obligatorios
- Init app: `csrf -> refresh -> me`.
- Login: `csrf -> login -> me`.
- Register (si backend lo habilita): `csrf -> register -> me`.
- Logout: `csrf -> logout`, esperar `204` sin body.
- Endpoints auth publicos no deben disparar refresh loop.

## Endpoints criticos a respetar
- `GET /auth/csrf` -> 200 y cookie CSRF.
- `POST /auth/login` -> accessToken.
- `POST /auth/register` -> accessToken (si existe).
- `POST /auth/refresh` -> accessToken, requiere CSRF + cookie refresh.
- `POST /auth/logout` -> 204.
- `GET /auth/me` -> requiere Bearer.
- `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` -> RBAC estricto.

## Arquitectura obligatoria
- No meter logica de negocio en layouts.
- Core transversal en `src/app/core`.
- Features por dominio en `src/app/features/<domain>`.
- UI compartida en `src/app/shared`.
- No duplicar llamadas backend fuera de `*.api.ts`.

## Seguridad y errores
- No inyectar `Authorization` ni `x-csrf-token` fuera del backend propio.
- 403 se maneja por `code` (permisos vs csrf vs sesion revocada).
- 429 debe usar `retryAfterSeconds`; si falta, fallback a header `Retry-After`.
- Loggear `requestId` si backend lo envia.

## Antipatrones prohibidos
- Llamar `AuthApi.logout()` directo desde componentes de feature.
- Cambiar semantica de auth por ambiente (solo cambia `baseUrl` y config de despliegue).
- Usar `any` en DTOs de contrato sin justificacion.
- Agregar hacks locales que omitan guards/interceptors de seguridad.
- Convertir deletes en patch soft-delete si el contrato backend define `DELETE`.

## Workflow obligatorio para cambios
1. Identificar impacto de contrato (endpoint, headers, estados, codigos de error).
2. Implementar en este orden:
   - servicio API
   - session/interceptor/guard (si aplica)
   - UI/feature
   - tests
   - docs
3. Validar local:
   - `npm run lint`
   - `npm run build`
   - `npm test -- --watch=false --browsers=ChromeHeadless`
4. Validar contrato con backend:
   - `npm run smoke:auth`
   - checklist `docs/GO_LIVE_FRONT_CHECKLIST.md`

## Definition of Done (DoD)
Un cambio se considera terminado solo si:
- Compila y pasa tests.
- Respeta contrato FE/BE documentado.
- No degrada seguridad de auth/csrf/refresh.
- Actualiza docs si cambia comportamiento.
- Mantiene compatibilidad para reutilizar el boilerplate en nuevo cliente.

## Regla para nuevos proyectos cliente
Al clonar este boilerplate:
1. Mantener intacto `core/auth`, `core/http`, `core/security` en el arranque.
2. Configurar `apiBaseUrl` por ambiente y revisar CORS/cookies del backend.
3. Crear features nuevas por dominio de negocio, no en core.
4. Correr smoke y checklist antes de arrancar desarrollo funcional.
5. Actualizar este archivo y `docs/AI_BOILERPLATE_CONTEXT.md` con reglas del cliente.
