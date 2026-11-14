import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthenticatedUser } from '../model/session';
import { AuthenticationService } from '../services/authentication.service';
import { clientGuard, guestGuard } from './client.guard';

describe('route guards', () => {
  const user = signal<AuthenticatedUser | null>(null);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthenticationService, useValue: { currentUser: user } }],
    });
  });

  const run = (guard: typeof clientGuard) =>
    TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
  const asUrl = (result: unknown) => TestBed.inject(Router).serializeUrl(result as UrlTree);

  it('lets clients in and sends everyone else to sign-in', () => {
    user.set(null);
    expect(asUrl(run(clientGuard))).toBe('/sign-in');
    user.set({ role: 'STUDENT' } as AuthenticatedUser);
    expect(asUrl(run(clientGuard))).toBe('/sign-in');
    user.set({ role: 'CLIENT' } as AuthenticatedUser);
    expect(run(clientGuard)).toBeTrue();
  });

  it('sends signed-in clients from sign-in to the dashboard', () => {
    user.set({ role: 'CLIENT' } as AuthenticatedUser);
    expect(asUrl(run(guestGuard))).toBe('/dashboard');
    user.set(null);
    expect(run(guestGuard)).toBeTrue();
  });
});
