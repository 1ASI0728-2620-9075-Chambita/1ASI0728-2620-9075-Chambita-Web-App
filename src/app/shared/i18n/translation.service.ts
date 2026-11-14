import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { MESSAGES_EN } from './messages.en';
import { MESSAGES_ES } from './messages.es';

export type Language = 'es' | 'en';
type Params = Record<string, string | number>;

const STORAGE_KEY = 'chambita.language';
const DICTIONARIES: Record<Language, Record<string, string>> = { es: MESSAGES_ES, en: MESSAGES_EN };

/** Chooses the language: ?lang= from the landing page, then the saved choice, then the browser. */
export function resolveLanguage(queryLanguage: string | null, saved: string | null, browser: string | undefined): Language {
  for (const candidate of [queryLanguage, saved]) {
    if (candidate === 'es' || candidate === 'en') return candidate;
  }
  return browser?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

/** Runtime translation in es_419 and en_US, switchable without reloading the application. */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<Language>(
    resolveLanguage(
      new URLSearchParams(this.document.location?.search ?? '').get('lang'),
      readSaved(),
      this.document.defaultView?.navigator.language,
    ),
  );

  constructor() {
    // A language chosen on the landing page (?lang=) is kept for the next visits.
    const fromQuery = new URLSearchParams(this.document.location?.search ?? '').get('lang');
    if (fromQuery === 'es' || fromQuery === 'en') this.setLanguage(fromQuery);
    this.applyToDocument();
  }

  setLanguage(language: Language): void {
    this.language.set(language);
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* the choice still applies to this visit */
    }
    this.applyToDocument();
  }

  /** Uses the `key.one` variant when params.count is 1 (singular). */
  translate(key: string, params: Params = {}): string {
    const dictionary = DICTIONARIES[this.language()];
    const singular = Number(params['count']) === 1 ? dictionary[`${key}.one`] : undefined;
    const text = singular ?? dictionary[key] ?? MESSAGES_ES[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? ''));
  }

  /** BCP 47 tag for the API (Accept-Language) and for number and date formats. */
  locale(): string {
    return this.language() === 'es' ? 'es-419' : 'en-US';
  }

  private applyToDocument(): void {
    this.document.documentElement.lang = this.locale();
  }
}

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
