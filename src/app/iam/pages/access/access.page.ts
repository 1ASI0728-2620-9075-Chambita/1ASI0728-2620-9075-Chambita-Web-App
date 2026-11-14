import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { problemMessage } from '../../../shared/http/api';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { BrandLogo } from '../../../shared/ui/brand-logo';
import { LanguageSwitch } from '../../../shared/ui/language-switch';
import { AuthenticationService } from '../../services/authentication.service';

/** D01 · Sign in and client sign-up (US10, US11). */
@Component({
  selector: 'app-access-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, BrandLogo, LanguageSwitch],
  templateUrl: './access.page.html',
  styleUrl: './access.page.css',
})
export class AccessPage {
  private readonly authentication = inject(AuthenticationService);
  private readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly mode = toSignal(this.route.data.pipe(map((data) => (data['mode'] as 'sign-in' | 'sign-up') ?? 'sign-in')), {
    initialValue: 'sign-in' as const,
  });
  protected readonly expired = toSignal(this.route.queryParamMap.pipe(map((params) => params.has('expired'))), { initialValue: false });
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly portalUrl = environment.verificationPortalUrl;
  protected readonly termsUrl = computed(() => `${environment.landingUrl}/terms.html?lang=${this.i18n.language()}`);

  protected readonly signInForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly signUpForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    acceptTerms: [false, Validators.requiredTrue],
  });

  protected signIn(): void {
    this.submitted.set(true);
    if (this.signInForm.invalid) return;
    const { email, password } = this.signInForm.getRawValue();
    this.run(this.authentication.signIn(email, password));
  }

  protected signUp(): void {
    this.submitted.set(true);
    if (this.signUpForm.invalid) return;
    const { fullName, email, password } = this.signUpForm.getRawValue();
    this.run(this.authentication.signUpClient(fullName, email, password));
  }

  protected invalid(form: 'signIn' | 'signUp', control: string): boolean {
    const field = form === 'signIn' ? this.signInForm.get(control)! : this.signUpForm.get(control)!;
    return field.invalid && (field.touched || this.submitted());
  }

  private run(request: ReturnType<AuthenticationService['signIn']>): void {
    this.submitting.set(true);
    this.error.set(null);
    request.subscribe({
      next: (user) => {
        this.submitting.set(false);
        if (user.role !== 'CLIENT') {
          // Students and admins use the mobile application (US11: access to the functions of the role).
          this.authentication.signOut();
          this.error.set(this.i18n.translate('access.studentsUseApp'));
          return;
        }
        void this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        // US11: invalid credentials never say which field was wrong.
        const isCredentials = error instanceof HttpErrorResponse && error.status === 401;
        this.error.set(isCredentials ? this.i18n.translate('access.invalidCredentials') : problemMessage(error, (key) => this.i18n.translate(key)));
      },
    });
  }
}
