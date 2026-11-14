import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, map } from 'rxjs';
import { TranslationService } from '../i18n/translation.service';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

/** Short messages (snack bar) and confirmations (dialog) with translated texts. */
@Injectable({ providedIn: 'root' })
export class Notifier {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly i18n = inject(TranslationService);

  show(message: string): void {
    this.snackBar.open(message, this.i18n.translate('common.close'), { duration: 5000 });
  }

  confirm(titleKey: string, messageKey: string, confirmKey: string, params: Record<string, string> = {}): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: this.i18n.translate(titleKey, params),
      message: this.i18n.translate(messageKey, params),
      confirm: this.i18n.translate(confirmKey, params),
      cancel: this.i18n.translate('common.cancel'),
    };
    return this.dialog
      .open(ConfirmDialog, { data, width: '440px', maxWidth: '92vw' })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
