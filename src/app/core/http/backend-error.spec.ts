import { HttpErrorResponse } from '@angular/common/http';
import { normalizeBackendError } from './backend-error';

describe('normalizeBackendError', () => {
  it('prefers code when present', () => {
    const error = new HttpErrorResponse({
      status: 403,
      error: {
        statusCode: 403,
        code: 'ACCESS_DENIED',
        message: 'Forbidden',
      },
    });

    const normalized = normalizeBackendError(error);

    expect(normalized.code).toBe('ACCESS_DENIED');
    expect(normalized.statusCode).toBe(403);
  });

  it('supports alias error_code and retryAfterSeconds', () => {
    const error = new HttpErrorResponse({
      status: 429,
      error: {
        error_code: 'AUTH_LOGIN_LOCKED',
        message: 'Too many failed login attempts',
        retryAfterSeconds: 12.1,
      },
    });

    const normalized = normalizeBackendError(error);

    expect(normalized.code).toBe('AUTH_LOGIN_LOCKED');
    expect(normalized.retryAfterSeconds).toBe(13);
    expect(normalized.statusCode).toBe(429);
  });

  it('falls back to status-based codes', () => {
    const error = new HttpErrorResponse({
      status: 500,
      error: { message: 'Internal server error' },
    });

    const normalized = normalizeBackendError(error);

    expect(normalized.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
