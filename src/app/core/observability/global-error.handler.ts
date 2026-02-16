import { ErrorHandler, Injectable } from '@angular/core';
import { AppLoggerService } from './app-logger.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private readonly logger: AppLoggerService) {}

  handleError(error: unknown): void {
    const asError = error instanceof Error ? error : new Error(String(error));
    this.logger.error('Unhandled application error', {
      name: asError.name,
      message: asError.message,
      stack: asError.stack,
    });
  }
}
