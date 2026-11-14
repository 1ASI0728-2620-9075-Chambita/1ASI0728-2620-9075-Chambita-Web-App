import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirm: string;
  cancel: string;
}

/** Confirmation before actions that cannot be undone (accept a proposal, cancel an engagement). */
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content><p class="muted">{{ data.message }}</p></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" class="button button--ghost" [mat-dialog-close]="false">{{ data.cancel }}</button>
      <button type="button" class="button button--primary" [mat-dialog-close]="true" cdkFocusInitial>{{ data.confirm }}</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}
