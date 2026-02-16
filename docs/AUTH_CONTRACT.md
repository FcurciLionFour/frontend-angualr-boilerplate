# Auth Contract (Frontend <-> Backend)

Este documento define el contrato de integracion que el frontend debe respetar con el backend NestJS.

## Endpoints de auth

- `GET /auth/csrf`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/change-password`

## Sesion y tokens

- `login` y `refresh` devuelven `accessToken` en el body.
- El frontend envia access token en `Authorization: Bearer <token>`.
- El refresh token vive en cookie HttpOnly `refresh_token` y rota en cada refresh.
- El frontend nunca lee ni persiste el refresh token.

## CSRF

- El frontend inicializa CSRF con `GET /auth/csrf`.
- Endpoints sensibles por cookie (`/auth/refresh`, `/auth/logout`) requieren header `x-csrf-token`.
- El valor del header debe coincidir con la cookie `csrf_token`.
- El frontend envia `x-csrf-token` en requests mutantes para mantener compatibilidad futura.

## Formato de errores

El backend puede responder el codigo estable en cualquiera de estas claves:

- `code`
- `errorCode`
- `error_code`

Adicionalmente puede incluir:

- `statusCode`
- `message`
- `retryAfterSeconds` (especialmente para `429`)

El frontend normaliza este contrato en `src/app/core/http/backend-error.ts`.

## Manejo de 401/403/429

- `401`: si no es endpoint auth excluido, el frontend intenta `refresh` una vez y reintenta la request.
- Si refresh falla, se limpia sesion y se navega a login.
- `403`: se trata como acceso denegado o CSRF invalido.
- `429`: se respeta `retryAfterSeconds` para lockout/rate-limit.

## Endpoints operativos

Estos endpoints no deben gatillar flujo de refresh automatico:

- `/health`
- `/ready`
- `/metrics`

## Credenciales y CORS

- Todas las requests al backend usan `withCredentials: true`.
- El backend define `sameSite`, `secure` y `CORS origins` por ambiente.
- El frontend solo adapta `baseUrl` por ambiente, sin cambiar semantica del contrato.
