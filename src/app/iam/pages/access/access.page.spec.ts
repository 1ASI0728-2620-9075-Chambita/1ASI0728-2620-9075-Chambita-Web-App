import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { AuthenticatedUser } from '../../model/session';
import { AuthenticationService } from '../../services/authentication.service';
import { AccessPage } from './access.page';

describe('AccessPage (D01 · US10, US11)', () => {
  let authentication: jasmine.SpyObj<AuthenticationService>;

  function create(mode: 'sign-in' | 'sign-up') {
    TestBed.configureTestingModule({
      imports: [AccessPage],
      providers: [
        provideRouter([]),
        { provide: AuthenticationService, useValue: authentication },
        { provide: ActivatedRoute, useValue: { data: of({ mode }), queryParamMap: of(new Map()) } },
      ],
    });
    TestBed.inject(TranslationService).setLanguage('es');
    const fixture = TestBed.createComponent(AccessPage);
    fixture.detectChanges();
    return fixture;
  }

  function type(element: HTMLElement, selector: string, value: string) {
    const input = element.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  beforeEach(() => {
    authentication = jasmine.createSpyObj<AuthenticationService>('AuthenticationService', ['signIn', 'signUpClient', 'signOut']);
  });

  it('opens the dashboard after a valid sign-in', async () => {
    authentication.signIn.and.returnValue(of({ role: 'CLIENT' } as AuthenticatedUser));
    const fixture = create('sign-in');
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    type(fixture.nativeElement, 'input[type=email]', 'rosa@gmail.com');
    type(fixture.nativeElement, 'input[type=password]', 'Chambita2026!');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(authentication.signIn).toHaveBeenCalledWith('rosa@gmail.com', 'Chambita2026!');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('rejects invalid credentials without saying which field is wrong', async () => {
    authentication.signIn.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    const fixture = create('sign-in');
    type(fixture.nativeElement, 'input[type=email]', 'rosa@gmail.com');
    type(fixture.nativeElement, 'input[type=password]', 'wrong');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('El correo o la contraseña no son correctos.');
  });

  it('sends students to the mobile app', async () => {
    authentication.signIn.and.returnValue(of({ role: 'STUDENT' } as AuthenticatedUser));
    const fixture = create('sign-in');
    type(fixture.nativeElement, 'input[type=email]', 'valeria@upc.edu.pe');
    type(fixture.nativeElement, 'input[type=password]', 'Chambita2026!');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(authentication.signOut).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('app móvil');
  });

  it('does not register a client without accepting the terms', async () => {
    const fixture = create('sign-up');
    type(fixture.nativeElement, 'input[autocomplete=name]', 'Rosa Huamán');
    type(fixture.nativeElement, 'input[type=email]', 'rosa@gmail.com');
    type(fixture.nativeElement, 'input[type=password]', 'Chambita2026!');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(authentication.signUpClient).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Debes aceptar los términos y condiciones.');
  });

  it('shows the API message when the email is already registered (US10)', async () => {
    authentication.signUpClient.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { detail: 'El correo ya está registrado.' } })),
    );
    const fixture = create('sign-up');
    type(fixture.nativeElement, 'input[autocomplete=name]', 'Rosa Huamán');
    type(fixture.nativeElement, 'input[type=email]', 'rosa@gmail.com');
    type(fixture.nativeElement, 'input[type=password]', 'Chambita2026!');
    const terms = fixture.nativeElement.querySelector('input[type=checkbox]') as HTMLInputElement;
    terms.click();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(authentication.signUpClient).toHaveBeenCalledWith('Rosa Huamán', 'rosa@gmail.com', 'Chambita2026!');
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('El correo ya está registrado.');
  });
});
