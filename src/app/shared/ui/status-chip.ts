import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '../i18n/translate.pipe';

const TONES: Record<string, string> = {
  OPEN: 'orange',
  PENDING: 'orange',
  PENDING_PAYMENT: 'orange',
  IN_PROGRESS: 'blue',
  ACTIVE: 'blue',
  IN_REVIEW: 'blue',
  HELD: 'blue',
  COMPLETED: 'green',
  ACCEPTED: 'green',
  APPROVED: 'green',
  RELEASED: 'green',
  ISSUED: 'green',
  CANCELLED: 'red',
  DECLINED: 'grey',
  CLOSED: 'grey',
};

/** Coloured chip for the status of a project, proposal, engagement or payment. */
@Component({
  selector: 'app-status-chip',
  imports: [TranslatePipe],
  template: `<span class="chip" [class]="'chip chip--' + tone()">{{ 'status.' + status() | t }}{{ suffix() }}</span>`,
})
export class StatusChip {
  readonly status = input.required<string>();
  readonly suffix = input('');
  protected readonly tone = computed(() => TONES[this.status()] ?? 'grey');
}
