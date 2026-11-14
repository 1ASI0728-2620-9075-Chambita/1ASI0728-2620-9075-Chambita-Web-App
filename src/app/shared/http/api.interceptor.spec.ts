import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { TranslationService } from '../i18n/translation.service';
import { API } from './api';
import { apiInterceptor } from './api.interceptor';

const TOKEN = `x.${btoa(JSON.stringify({ exp: 4102444800 }))}.y`;

describe('apiInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let authentication: AuthenticationService;

  beforeEach(() => {
    localStorage.setItem('chambita.session', JSON.stringify({ id: 'c1', email: 'r@gmail.com', fullName: 'Rosa', role: 'CLIENT', studentVerified: false, token: TOKEN }));
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([apiInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    authentication = TestBed.inject(AuthenticationService);
    TestBed.inject(TranslationService).setLanguage('es');
  });

  afterEach(() => {
    backend.verify();
    localStorage.removeItem('chambita.session');
  });

  it('adds the bearer token and the language to API calls', () => {
    http.get(`${API}/projects`).subscribe();
    const request = backend.expectOne(`${API}/projects`);
    expect(request.request.headers.get('Authorization')).toBe(`Bearer ${TOKEN}`);
    expect(request.request.headers.get('Accept-Language')).toBe('es-419');
  });

  it('does not send the token to other hosts', () => {
    http.get('https://example.com/data').subscribe();
    expect(backend.expectOne('https://example.com/data').request.headers.has('Authorization')).toBeFalse();
  });

  it('signs out and goes to sign-in when the API answers 401', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    http.get(`${API}/engagements`).subscribe({ error: () => undefined });
    backend.expectOne(`${API}/engagements`).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(authentication.currentUser()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/sign-in'], { queryParams: { expired: true } });
  });
});
