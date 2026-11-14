import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, of, switchMap } from 'rxjs';
import { Engagement } from '../../../engagements/model/engagement';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { ProfilesService } from '../../../profiles/services/profiles.service';
import { problemMessage } from '../../../shared/http/api';
import { initials } from '../../../shared/i18n/format';
import { MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { ReviewsService } from '../../services/reviews.service';

/** D09 · The client rates the student; the rating issues the certificate (US31). */
@Component({
  selector: 'app-rate-student-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe],
  templateUrl: './rate-student.page.html',
  styleUrl: './rate-student.page.css',
})
export class RateStudentPage implements OnInit {
  readonly engagementId = input.required<string>();
  readonly approved = input<string>();

  private readonly engagements = inject(EngagementsService);
  private readonly profiles = inject(ProfilesService);
  private readonly reviews = inject(ReviewsService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly engagement = signal<Engagement | null>(null);
  protected readonly studentName = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly score = signal(0);
  protected readonly comment = signal('');
  protected readonly sending = signal(false);
  protected readonly attempted = signal(false);
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly avatar = computed(() => initials(this.studentName()));
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

  /** Radio group keyboard support: arrows change the score. */
  protected onKey(event: KeyboardEvent): void {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowUp' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowDown' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    this.score.update((score) => Math.min(5, Math.max(1, score + delta)));
  }

  protected send(): void {
    this.attempted.set(true);
    if (this.score() < 1) return;
    this.sending.set(true);
    const comment = this.comment().trim();
    this.reviews.rate(this.engagementId(), this.score(), comment || null).subscribe({
      next: () => {
        this.notifier.show(this.i18n.translate('rating.sent', { name: this.firstName() }));
        void this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.sending.set(false);
        const repeated = error instanceof HttpErrorResponse && error.status === 409;
        this.error.set(repeated ? this.i18n.translate('rating.already') : problemMessage(error, (key) => this.i18n.translate(key)));
      },
    });
  }
}
