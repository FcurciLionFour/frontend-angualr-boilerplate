import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogContext = Record<string, unknown>;
type LogLevel = 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class AppLoggerService {
  info(message: string, context: LogContext = {}) {
    this.log('info', message, context);
  }

  warn(message: string, context: LogContext = {}) {
    this.log('warn', message, context);
  }

  error(message: string, context: LogContext = {}) {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context: LogContext) {
    if (environment.production) {
      return;
    }

    const payload = {
      ts: new Date().toISOString(),
      level,
      message,
      ...context,
    };

    if (level === 'error') {
      console.error(payload);
      return;
    }

    if (level === 'warn') {
      console.warn(payload);
      return;
    }

    console.info(payload);
  }
}
