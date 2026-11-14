import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { problemMessage } from '../../../shared/http/api';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { ClientProfile } from '../../model/profiles';
import { ProfilesService } from '../../services/profiles.service';

/** Profile of the client shown to the students (name of the business and district). */
@Component({
  selector: 'app-client-profile-page',
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="stack-lg narrow">
      <h1>{{ 'clientProfile.title' | t }}</h1>
      @if (loading()) {
        <div class="loading muted">{{ 'common.loading' | t }}</div>
      } @else {
        <form class="card stack" [formGroup]="form" (ngSubmit)="save()" novalidate>
          <span class="muted small">{{ user()?.email }}</span>
          @if (profile(); as current) {
            @if (current.ratingCount) {
              <span class="chip chip--grey">{{ 'profile.ratingLong' | t: { rating: current.ratingAverage ?? 0, count: current.ratingCount } }}</span>
            }
          }
          @if (error()) { <p class="panel panel--red small" role="alert">{{ error() }}</p> }
          <label class="field">{{ 'clientProfile.displayName' | t }}
            <input type="text" formControlName="displayName" maxlength="120" [attr.aria-invalid]="form.controls.displayName.invalid && form.controls.displayName.touched">
            @if (form.controls.displayName.invalid && form.controls.displayName.touched) { <span class="error">{{ 'validation.required' | t }}</span> }
          </label>
          <label class="field">{{ 'clientProfile.businessName' | t }}
            <input type="text" formControlName="businessName" maxlength="120">
          </label>
          <label class="field">{{ 'clientProfile.district' | t }}
            <input type="text" formControlName="district" maxlength="80">
          </label>
          <div class="row end">
            <button type="submit" class="button button--primary" [disabled]="saving()">{{ (saving() ? 'common.wait' : 'common.save') | t }}</button>
          </div>
        </form>
      }
    </div>
  `,
  styles: `.narrow { max-width: 640px; } p.panel { margin: 0; } .chip { align-self: flex-start; }`,
})
export class ClientProfilePage {
  private readonly profiles = inject(ProfilesService);
  private readonly notifier = inject(Notifier);
  private readonly i18n = inject(TranslationService);
  protected readonly user = inject(AuthenticationService).currentUser;
  protected readonly profile = signal<ClientProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = inject(FormBuilder).nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(120)]],
    businessName: [''],
    district: [''],
  });

  constructor() {
    this.profiles.getClient(this.user()!.id).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.form.setValue({ displayName: profile.displayName, businessName: profile.businessName ?? '', district: profile.district ?? '' });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
        this.loading.set(false);
      },
    });
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.profiles
      .updateClient(this.user()!.id, {
        displayName: value.displayName.trim(),
        businessName: value.businessName.trim() || null,
        district: value.district.trim() || null,
      })
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.saving.set(false);
          this.notifier.show(this.i18n.translate('clientProfile.saved'));
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
        },
      });
  }
}
