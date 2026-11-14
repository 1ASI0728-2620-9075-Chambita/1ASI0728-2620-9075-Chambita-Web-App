import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

/** The web application is for clients; students use the mobile application. */
export const clientGuard: CanActivateFn = () => {
  const authentication = inject(AuthenticationService);
  const user = authentication.currentUser();
  if (user?.role === 'CLIENT') return true;
  return inject(Router).createUrlTree(['/sign-in']);
};

/** Signed-in clients skip the sign-in page. */
export const guestGuard: CanActivateFn = () => {
  const user = inject(AuthenticationService).currentUser();
  return user?.role === 'CLIENT' ? inject(Router).createUrlTree(['/dashboard']) : true;
};
