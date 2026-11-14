import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { API } from '../../shared/http/api';
import { AuthenticatedUser, SignUpRequest, isExpired } from '../model/session';

const STORAGE_KEY = 'chambita.session';

/** Sign-up, sign-in and the session of the client (US10, US11). */
@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly session = signal<AuthenticatedUser | null>(restore());

  readonly currentUser = this.session.asReadonly();
  readonly isSignedIn = computed(() => this.session() !== null);
  readonly token = computed(() => this.session()?.token ?? null);

  signIn(email: string, password: string): Observable<AuthenticatedUser> {
    return this.http
      .post<AuthenticatedUser>(`${API}/authentication/sign-in`, { email: email.trim(), password })
      .pipe(tap((user) => this.store(user)));
  }

  /** Creates a client account and signs in with it. */
  signUpClient(fullName: string, email: string, password: string): Observable<AuthenticatedUser> {
    const request: SignUpRequest = { fullName: fullName.trim(), email: email.trim(), password, role: 'CLIENT' };
    return this.http
      .post(`${API}/authentication/sign-up`, request)
      .pipe(switchMap(() => this.signIn(request.email, password)));
  }

  signOut(): void {
    this.session.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing stored */
    }
  }

  private store(user: AuthenticatedUser): void {
    this.session.set(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* the session lasts until the tab is closed */
    }
  }
}

function restore(): AuthenticatedUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const user = saved ? (JSON.parse(saved) as AuthenticatedUser) : null;
    return user && !isExpired(user.token) ? user : null;
  } catch {
    return null;
  }
}
