import { TestBed } from '@angular/core/testing';
import { MESSAGES_EN } from './messages.en';
import { MESSAGES_ES } from './messages.es';
import { TranslationService, resolveLanguage } from './translation.service';
import { dateAfterDays, daysUntil, formatMoney, initials } from './format';

describe('TranslationService', () => {
  beforeEach(() => localStorage.removeItem('chambita.language'));

  it('has the same keys in Spanish and English', () => {
    expect(Object.keys(MESSAGES_EN).sort()).toEqual(Object.keys(MESSAGES_ES).sort());
  });

  it('prefers ?lang=, then the saved choice, then the browser', () => {
    expect(resolveLanguage('en', 'es', 'es-PE')).toBe('en');
    expect(resolveLanguage(null, 'en', 'es-PE')).toBe('en');
    expect(resolveLanguage(null, null, 'en-US')).toBe('en');
    expect(resolveLanguage(null, null, 'es-PE')).toBe('es');
    expect(resolveLanguage('fr', null, undefined)).toBe('es');
  });

  it('switches language at runtime, fills parameters and updates the document', () => {
    const i18n = TestBed.inject(TranslationService);
    i18n.setLanguage('es');
    expect(i18n.translate('dashboard.greeting', { name: 'Rosa' })).toBe('Hola, Rosa');
    i18n.setLanguage('en');
    expect(i18n.translate('dashboard.greeting', { name: 'Rosa' })).toBe('Hi, Rosa');
    expect(document.documentElement.lang).toBe('en-US');
    expect(i18n.locale()).toBe('en-US');
  });

  it('uses the singular text when the count is 1', () => {
    const i18n = TestBed.inject(TranslationService);
    i18n.setLanguage('es');
    expect(i18n.translate('dashboard.proposals', { count: 1 })).toBe('1 propuesta');
    expect(i18n.translate('dashboard.proposals', { count: 3 })).toBe('3 propuestas');
  });
});

describe('formatters', () => {
  it('formats soles with two decimals', () => {
    expect(formatMoney(450, 'en-US')).toBe('S/ 450.00');
    expect(formatMoney(null, 'en-US')).toBe('—');
  });

  it('builds initials and dates', () => {
    expect(initials('Valeria Rojas Quispe')).toBe('VR');
    expect(dateAfterDays(10, new Date(2026, 10, 25))).toBe('2026-12-05');
    expect(daysUntil('2026-11-20', new Date(2026, 10, 14, 18, 0))).toBe(6);
  });
});
