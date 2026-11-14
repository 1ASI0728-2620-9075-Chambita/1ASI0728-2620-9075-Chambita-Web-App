import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { ProfilesService } from '../../../profiles/services/profiles.service';
import { problemMessage } from '../../../shared/http/api';
import { LocalDatePipe, MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { Engagement, automaticApprovalDate, latestDeliverable } from '../../model/engagement';
import { EngagementsService } from '../../services/engagements.service';

/** D08 · Review the delivery and release the payment (US28). Change requests arrive in Sprint 2. */
@Component({
  selector: 'app-review-delivery-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, LocalDatePipe],
  templateUrl: './review-delivery.page.html',
  styleUrl: './review-delivery.page.css',
})
export class ReviewDeliveryPage implements OnInit {
  readonly engagementId = input.required<string>();

  private readonly engagements = inject(EngagementsService);
  private readonly profiles = inject(ProfilesService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly engagement = signal<Engagement | null>(null);
  protected readonly studentName = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly approving = signal(false);
  protected readonly deliverable = computed(() => (this.engagement() ? latestDeliverable(this.engagement()!) : null));
  protected readonly autoApproval = computed(() => (this.deliverable() ? automaticApprovalDate(this.deliverable()!) : null));
  protected readonly firstName = computed(() => this.studentName().split(' ')[0] ?? '');

  ngOnInit(): void {
    this.engagements
      .getById(this.engagementId())
      .pipe(
        switchMap((engagement) =>
          forkJoin({ engagement: of(engagement), student: this.profiles.getStudent(engagement.studentId).pipe(catchError(() => of(null))) }),
        ),
      )
      .subscribe({
        next: ({ engagement, student }) => {
          if (engagement.status !== 'IN_REVIEW') {
            void this.router.navigate(['/engagements', engagement.id], { replaceUrl: true });
            return;
          }
          this.engagement.set(engagement);
          this.studentName.set(student?.fullName ?? '');
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
          this.loading.set(false);
        },
      });
  }

  /** Approval releases the payment; the engagement is completed when the PaymentReleased event arrives. */
  protected approve(): void {
    this.approving.set(true);
    this.engagements
      .approveDeliverable(this.engagementId())
      .pipe(switchMap(() => this.engagements.waitForStatus(this.engagementId(), 'COMPLETED')))
      .subscribe({
        next: () => void this.router.navigate(['/engagements', this.engagementId(), 'rating'], { queryParams: { approved: true } }),
        error: (error: unknown) => {
          this.approving.set(false);
          this.notifier.show(problemMessage(error, (key) => this.i18n.translate(key)));
        },
      });
  }
}
