import { Component, inject } from '@angular/core';
import { Language, TranslationService } from '../i18n/translation.service';
import { TranslatePipe } from '../i18n/translate.pipe';

@Component({
  selector: 'app-language-switch',
  imports: [TranslatePipe],
  template: `
    <div class="switch" role="group" [attr.aria-label]="'language.label' | t">
      @for (option of options; track option) {
        <button type="button" [attr.aria-pressed]="i18n.language() === option" (click)="i18n.setLanguage(option)">
          {{ option.toUpperCase() }}
        </button>
      }
    </div>
  `,
  styles: `
    .switch { display: flex; border: 1px solid var(--input-line); border-radius: 999px; overflow: hidden; font-size: 13px; font-weight: 700; }
    button { height: 40px; min-width: 48px; border: 0; background: #FFFFFF; color: var(--muted); font: inherit; cursor: pointer; }
    button[aria-pressed='true'] { background: var(--ink); color: #FFFFFF; }
    :host(.on-dark) .switch { border-color: #475467; }
    :host(.on-dark) button { background: transparent; color: #D0D5DD; }
    :host(.on-dark) button[aria-pressed='true'] { background: var(--orange-chip); color: var(--orange-ink); }
  `,
})
export class LanguageSwitch {
  protected readonly i18n = inject(TranslationService);
  protected readonly options: Language[] = ['es', 'en'];
}
