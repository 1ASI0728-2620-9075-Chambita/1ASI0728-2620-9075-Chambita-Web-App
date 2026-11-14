import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { Payment } from '../../../payments/model/payment';
import { PaymentsService } from '../../../payments/services/payments.service';
import { ProfilesService } from '../../../profiles/services/profiles.service';
import { Review } from '../../../reputation/model/review';
import { ReviewsService } from '../../../reputation/services/reviews.service';
import { problemMessage } from '../../../shared/http/api';
import { daysUntil } from '../../../shared/i18n/format';
import { LocalDatePipe, MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { StatusChip } from '../../../shared/ui/status-chip';
import { Engagement, engagementStep } from '../../model/engagement';
import { EngagementsService } from '../../services/engagements.service';

/** D07 · Engagement: status, protected payment and deliveries. Messages and progress reports arrive in Sprint 2. */
@Component({
  selector: 'app-engagement-detail-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, LocalDatePipe, StatusChip],
  templateUrl: './engagement-detail.page.html',
  styleUrl: './engagement-detail.page.css',
})
export class EngagementDetailPage implements OnInit {
  readonly engagementId = input.required<string>();

  private readonly engagements = inject(EngagementsService);
  private readonly payments = inject(PaymentsService);
  private readonly profiles = inject(ProfilesService);
  private readonly reviews = inject(ReviewsService);
  private readonly i18n = inject(TranslationService);
  private readonly user = inject(AuthenticationService).currentUser;

  protected readonly engagement = signal<Engagement | null>(null);
  protected readonly payment = signal<Payment | null>(null);
  protected readonly studentName = signal('');
  protected readonly rated = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly steps = ['paid', 'inProgress', 'inReview', 'completed'];
  protected readonly step = computed(() => (this.engagement() ? engagementStep(this.engagement()!.status) : -1));
  protected readonly daysLeft = computed(() => (this.engagement() ? daysUntil(this.engagement()!.deadline) : 0));
  protected readonly deliverables = computed(() => [...(this.engagement()?.deliverables ?? [])].reverse());
  protected readonly firstName = computed(() => this.studentName().split(' ')[0] ?? '');

  ngOnInit(): void {
    this.engagements
      .getById(this.engagementId())
      .pipe(
        switchMap((engagement) =>
          forkJoin({
            engagement: of(engagement),
            payment: this.payments.getByEngagement(engagement.id).pipe(catchError(() => of(null))),
            student: this.profiles.getStudent(engagement.studentId).pipe(catchError(() => of(null))),
            reviews: this.reviews.getReceivedBy(engagement.studentId).pipe(catchError(() => of([] as Review[]))),
          }),
        ),
      )
      .subscribe({
        next: ({ engagement, payment, student, reviews }) => {
          this.engagement.set(engagement);
          this.payment.set(payment);
          this.studentName.set(student?.fullName ?? '');
          this.rated.set(reviews.some((review) => review.engagementId === engagement.id && review.reviewerId === this.user()?.id));
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
          this.loading.set(false);
        },
      });
  }

  /** done: completed step; current: step in progress (aria-current). */
  protected stepState(index: number): 'done' | 'current' | 'pending' {
    const step = this.step();
    if (step === 4 || index < step) return 'done';
    return index === step ? 'current' : 'pending';
  }
}
