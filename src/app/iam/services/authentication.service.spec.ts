import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API } from '../../shared/http/api';
import { AuthenticatedUser, isExpired } from '../model/session';
import { AuthenticationService } from './authentication.service';

/** JWT with exp far in the future (header.payload.signature, signature not checked by the client). */
const FUTURE_TOKEN = `x.${btoa(JSON.stringify({ exp: 4102444800 }))}.y`;
const ROSA: AuthenticatedUser = {
  id: 'c1', email: 'rosa@gmail.com', fullName: 'Rosa Huamán', role: 'CLIENT', studentVerified: false, token: FUTURE_TOKEN,
};

describe('AuthenticationService (US10, US11)', () => {
  let service: AuthenticationService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('chambita.session');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthenticationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('signs in and keeps the session', () => {
    service.signIn(' rosa@gmail.com ', 'Chambita2026!').subscribe();
    const request = http.expectOne(`${API}/authentication/sign-in`);
    expect(request.request.body).toEqual({ email: 'rosa@gmail.com', password: 'Chambita2026!' });
    request.flush(ROSA);
    expect(service.isSignedIn()).toBeTrue();
    expect(JSON.parse(localStorage.getItem('chambita.session')!).id).toBe('c1');
  });

  it('registers a client account and then signs in', () => {
    service.signUpClient('Rosa Huamán', 'rosa@gmail.com', 'Chambita2026!').subscribe();
    const signUp = http.expectOne(`${API}/authentication/sign-up`);
    expect(signUp.request.body.role).toBe('CLIENT');
    signUp.flush({ id: 'c1' }, { status: 201, statusText: 'Created' });
    http.expectOne(`${API}/authentication/sign-in`).flush(ROSA);
    expect(service.currentUser()?.fullName).toBe('Rosa Huamán');
  });

  it('forgets the session on sign out', () => {
    service.signIn('rosa@gmail.com', 'x').subscribe();
    http.expectOne(`${API}/authentication/sign-in`).flush(ROSA);
    service.signOut();
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('chambita.session')).toBeNull();
  });

  it('treats unreadable or expired tokens as expired', () => {
    expect(isExpired(FUTURE_TOKEN)).toBeFalse();
    expect(isExpired(`x.${btoa(JSON.stringify({ exp: 1 }))}.y`)).toBeTrue();
    expect(isExpired('not-a-jwt')).toBeTrue();
  });
});
