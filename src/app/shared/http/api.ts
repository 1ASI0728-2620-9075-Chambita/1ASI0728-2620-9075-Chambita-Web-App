import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const API = environment.apiBaseUrl;

/** RFC 9457 problem detail returned by the API, already translated with Accept-Language. */
export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  fields?: Record<string, string>;
}

/** Message to show for a failed request: the API detail, or a generic text. */
export function problemMessage(error: unknown, translate: (key: string) => string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return translate('error.network');
    const problem = error.error as ProblemDetail | null;
    if (problem?.detail) return problem.detail;
  }
  return translate('error.unexpected');
}

export function problemFields(error: unknown): Record<string, string> {
  return error instanceof HttpErrorResponse ? ((error.error as ProblemDetail | null)?.fields ?? {}) : {};
}
