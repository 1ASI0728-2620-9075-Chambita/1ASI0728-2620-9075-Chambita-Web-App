import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, filter, forkJoin, of, switchMap } from 'rxjs';
import { Engagement } from '../../../engagements/model/engagement';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { ProfilesService } from '../../../profiles/services/profiles.service';
import { problemMessage } from '../../../shared/http/api';
import { initials } from '../../../shared/i18n/format';
import { MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { StatusChip } from '../../../shared/ui/status-chip';
import { Payment, feePercentage } from '../../model/payment';
import { PaymentsService } from '../../services/payments.service';

/** D06 · Simulated protected payment and cancellation before payment (US27). */
@Component({
  selector: 'app-payment-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, StatusChip],
  templateUrl: './payment.page.html',
  styleUrl: './payment.page.css',
})
export class PaymentPage implements OnInit {
  readonly engagementId = input.required<string>();

  private readonly engagements = inject(EngagementsService);
  private readonly payments = inject(PaymentsService);
  private readonly profiles = inject(ProfilesService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly engagement = signal<Engagement | null>(null);
  protected readonly payment = signal<Payment | null>(null);
  protected readonly studentName = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly fee = computed(() => (this.payment() ? feePercentage(this.payment()!) : 0));
  protected readonly firstName = computed(() => this.studentName().split(' ')[0] ?? '');
  protected readonly avatar = computed(() => initials(this.studentName()));

  ngOnInit(): void {
    this.engagements
      .getById(this.engagementId())
      .pipe(
        switchMap((engagement) =>
          forkJoin({
            engagement: of(engagement),
            payment: this.payments.getByEngagement(engagement.id),
            student: this.profiles.getStudent(engagement.studentId).pipe(catchError(() => of(null))),
          }),
        ),
      )
      .subscribe({
        next: ({ engagement, payment, student }) => {
          if (engagement.status !== 'PENDING_PAYMENT') {
            void this.router.navigate(['/engagements', engagement.id], { replaceUrl: true });
            return;
          }
          this.engagement.set(engagement);
          this.payment.set(payment);
          this.studentName.set(student?.fullName ?? '');
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
          this.loading.set(false);
        },
      });
  }

  protected confirm(): void {
    this.busy.set(true);
    this.payments.confirm(this.engagementId()).subscribe({
      next: () => {
        this.notifier.show(this.i18n.translate('payment.held'));
        void this.router.navigate(['/engagements', this.engagementId()]);
      },
      error: (error: unknown) => this.fail(error),
    });
  }

  protected cancel(): void {
    this.notifier
      .confirm('payment.cancel.title', 'payment.cancel.message', 'payment.cancel.confirm')
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.busy.set(true);
          return this.engagements.cancel(this.engagementId());
        }),
      )
      .subscribe({
        next: () => {
          this.notifier.show(this.i18n.translate('payment.cancelled'));
          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => this.fail(error),
      });
  }

  private fail(error: unknown): void {
    this.busy.set(false);
    this.notifier.show(problemMessage(error, (key) => this.i18n.translate(key)));
  }
}
