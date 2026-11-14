import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '../../iam/services/authentication.service';
import { initials } from '../i18n/format';
import { TranslatePipe } from '../i18n/translate.pipe';
import { BrandLogo } from './brand-logo';
import { LanguageSwitch } from './language-switch';

/** Layout of the signed-in client: side navigation (6.2.5) and content. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, BrandLogo, LanguageSwitch],
  template: `
    <a class="skip" href="#content">{{ 'nav.skip' | t }}</a>
    <nav class="sidebar" [attr.aria-label]="'nav.label' | t">
      <app-brand-logo class="logo" />
      <a routerLink="/dashboard" routerLinkActive="active" ariaCurrentWhenActive="page">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
        {{ 'nav.dashboard' | t }}
      </a>
      <a routerLink="/projects/new" routerLinkActive="active" ariaCurrentWhenActive="page">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        {{ 'nav.publish' | t }}
      </a>
      <a routerLink="/engagements" routerLinkActive="active" ariaCurrentWhenActive="page">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        {{ 'nav.engagements' | t }}
      </a>
      <a routerLink="/profile" routerLinkActive="active" ariaCurrentWhenActive="page">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        {{ 'nav.profile' | t }}
      </a>
      <span class="spacer"></span>
      <app-language-switch class="language on-dark" />
      <div class="user">
        <span class="avatar avatar--blue" aria-hidden="true">{{ userInitials() }}</span>
        <span class="grow">
          <b>{{ user()?.fullName }}</b>
          <span class="role">{{ 'role.CLIENT' | t }}</span>
        </span>
        <button type="button" class="sign-out" (click)="signOut()" [attr.aria-label]="'nav.signOut' | t" [title]="'nav.signOut' | t">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
      </div>
    </nav>
    <main id="content" class="content" tabindex="-1">
      <router-outlet />
    </main>
  `,
  styles: `
    :host { min-height: 100vh; display: flex; flex-wrap: wrap; }
    .skip { position: absolute; left: 16px; top: -48px; z-index: 5; padding: 8px 16px; border-radius: 8px; background: #FFFFFF; }
    .skip:focus { top: 8px; }
    .sidebar { flex: 1 1 232px; max-width: 100%; padding: 24px 16px; background: var(--ink); color: #FFFFFF; display: flex; flex-direction: column; gap: 6px; }
    .logo { padding: 0 8px 20px; }
    .sidebar a { height: 48px; display: flex; align-items: center; gap: 12px; padding: 0 14px; border-radius: 999px; color: #FFFFFF; text-decoration: none; font-size: 15px; font-weight: 700; }
    .sidebar a:hover { background: rgba(255, 255, 255, 0.08); }
    .sidebar a.active { background: var(--orange-chip); color: var(--orange-ink); }
    .spacer { flex: 1; }
    .language { align-self: flex-start; margin: 12px 8px; }
    .user { display: flex; align-items: center; gap: 10px; padding: 12px 8px; border-top: 1px solid #344054; }
    .user .avatar { width: 36px; height: 36px; font-size: 13px; }
    .user b { display: block; font-size: 14px; }
    .role { font-size: 12px; color: #D0D5DD; }
    .sign-out { width: 40px; height: 40px; border: 0; border-radius: 999px; background: transparent; color: #FFFFFF; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .sign-out:hover { background: rgba(255, 255, 255, 0.08); }
    .content { flex: 999 1 560px; min-width: 0; padding: 32px 40px; outline: none; }
    @media (max-width: 800px) {
      .sidebar { flex-direction: row; flex-wrap: wrap; align-items: center; padding: 12px 16px; }
      .logo { padding: 0 8px 0 0; width: 100%; }
      .sidebar a { height: 40px; font-size: 14px; }
      .spacer { display: none; }
      .language { margin: 0; }
      .user { border-top: 0; padding: 0; margin-left: auto; }
      .content { padding: 24px 16px; }
    }
  `,
})
export class Shell {
  private readonly authentication = inject(AuthenticationService);
  private readonly router = inject(Router);
  protected readonly user = this.authentication.currentUser;
  protected readonly userInitials = computed(() => initials(this.user()?.fullName));

  protected signOut(): void {
    this.authentication.signOut();
    void this.router.navigate(['/sign-in']);
  }
}
