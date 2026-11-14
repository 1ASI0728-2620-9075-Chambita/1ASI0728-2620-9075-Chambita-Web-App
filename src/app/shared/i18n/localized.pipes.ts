import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { formatDate, formatMoney } from './format';

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(amount: number | null | undefined, currency = 'PEN'): string {
    return formatMoney(amount, this.i18n.locale(), currency);
  }
}

@Pipe({ name: 'localDate', pure: false })
export class LocalDatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(value: string | null | undefined): string {
    return formatDate(value, this.i18n.locale());
  }
}
