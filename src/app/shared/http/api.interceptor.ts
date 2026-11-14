import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { TranslationService } from '../i18n/translation.service';
import { API } from './api';

/** Adds the bearer token and the language to API calls; an expired session goes back to sign-in. */
export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API)) return next(request);
  const authentication = inject(AuthenticationService);
  const i18n = inject(TranslationService);
  const router = inject(Router);
  const token = authentication.token();
  const headers: Record<string, string> = { 'Accept-Language': i18n.locale() };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return next(request.clone({ setHeaders: headers })).pipe(
    catchError((error: unknown) => {
      const isAuthenticationCall = request.url.includes('/authentication/');
      if (error instanceof HttpErrorResponse && error.status === 401 && token && !isAuthenticationCall) {
        authentication.signOut();
        void router.navigate(['/sign-in'], { queryParams: { expired: true } });
      }
      return throwError(() => error);
    }),
  );
};
