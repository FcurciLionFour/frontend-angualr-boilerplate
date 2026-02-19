import { HttpErrorResponse } from '@angular/common/http';

export interface BackendError {
  statusCode: number;
  message: string;
  code: string;
  retryAfterSeconds?: number;
  requestId?: string;
}

interface CandidateErrorBody {
  statusCode?: unknown;
  message?: unknown;
  code?: unknown;
  errorCode?: unknown;
  error_code?: unknown;
  retryAfterSeconds?: unknown;
  requestId?: unknown;
}

export function normalizeBackendError(error: HttpErrorResponse): BackendError {
  const body = (error.error ?? {}) as CandidateErrorBody;
  const statusCode =
    typeof body.statusCode === 'number' ? body.statusCode : error.status;
  const code = pickCode(body) ?? fallbackCode(statusCode);
  const message =
    typeof body.message === 'string' && body.message.trim().length > 0
      ? body.message
      : error.message;
  const retryAfterSeconds =
    typeof body.retryAfterSeconds === 'number' && body.retryAfterSeconds > 0
      ? Math.ceil(body.retryAfterSeconds)
      : parseRetryAfterHeader(error);

  return {
    statusCode,
    code,
    message,
    retryAfterSeconds,
    requestId:
      typeof body.requestId === 'string' ? body.requestId : undefined,
  };
}

function parseRetryAfterHeader(error: HttpErrorResponse): number | undefined {
  const rawValue = error.headers?.get('Retry-After');
  if (!rawValue || rawValue.trim().length === 0) {
    return undefined;
  }

  const asSeconds = Number(rawValue);
  if (Number.isFinite(asSeconds) && asSeconds > 0) {
    return Math.ceil(asSeconds);
  }

  const asDate = Date.parse(rawValue);
  if (Number.isNaN(asDate)) {
    return undefined;
  }

  const seconds = Math.ceil((asDate - Date.now()) / 1000);
  return seconds > 0 ? seconds : 1;
}

function pickCode(body: CandidateErrorBody): string | null {
  if (typeof body.code === 'string' && body.code.trim().length > 0) {
    return body.code;
  }

  if (typeof body.errorCode === 'string' && body.errorCode.trim().length > 0) {
    return body.errorCode;
  }

  if (
    typeof body.error_code === 'string' &&
    body.error_code.trim().length > 0
  ) {
    return body.error_code;
  }

  return null;
}

function fallbackCode(statusCode: number): string {
  if (statusCode === 401) {
    return 'UNAUTHORIZED';
  }

  if (statusCode === 403) {
    return 'FORBIDDEN';
  }

  if (statusCode === 404) {
    return 'NOT_FOUND';
  }

  if (statusCode === 429) {
    return 'RATE_LIMIT_EXCEEDED';
  }

  if (statusCode >= 500) {
    return 'INTERNAL_SERVER_ERROR';
  }

  return 'HTTP_ERROR';
}
