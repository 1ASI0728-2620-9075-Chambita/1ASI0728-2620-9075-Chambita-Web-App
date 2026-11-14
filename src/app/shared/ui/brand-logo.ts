import { Component, input } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="28" fill="#FF6B2C" />
      <polygon points="60,24 91.2,42 91.2,78 60,96 28.8,78 28.8,42" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round" />
      <polyline points="44,61 55.5,72.5 77,50" fill="none" stroke="#FFFFFF" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <span class="name">chambita</span>
  `,
  styles: `
    :host { display: inline-flex; align-items: center; gap: 10px; }
    .name { font-size: 20px; font-weight: 700; }
  `,
})
export class BrandLogo {
  readonly size = input(32);
}
