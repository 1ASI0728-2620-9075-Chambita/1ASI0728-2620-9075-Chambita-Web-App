import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { catchError, filter, forkJoin, of, switchMap } from 'rxjs';
import { Certificate } from '../../../certification/model/certificate';
import { CertificatesService } from '../../../certification/services/certificates.service';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { Proposal } from '../../../projects/model/proposal';
import { ProjectsService } from '../../../projects/services/projects.service';
import { Review } from '../../../reputation/model/review';
import { ReviewsService } from '../../../reputation/services/reviews.service';
import { problemMessage } from '../../../shared/http/api';
import { initials } from '../../../shared/i18n/format';
import { LocalDatePipe, MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { StudentProfile } from '../../model/profiles';
import { ProfilesService } from '../../services/profiles.service';

/** D05 · Profile of a student with portfolio, ratings and certificates (US15). */
@Component({
  selector: 'app-student-profile-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, LocalDatePipe],
  templateUrl: './student-profile.page.html',
  styleUrl: './student-profile.page.css',
})
export class StudentProfilePage implements OnInit {
  readonly studentId = input.required<string>();
  /** Query parameters when the profile is opened from a proposal. */
  readonly project = input<string>();
  readonly proposal = input<string>();

  private readonly profiles = inject(ProfilesService);
  private readonly certificatesService = inject(CertificatesService);
  private readonly reviewsService = inject(ReviewsService);
  private readonly projects = inject(ProjectsService);
  private readonly engagements = inject(EngagementsService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly profile = signal<StudentProfile | null>(null);
  protected readonly certificates = signal<Certificate[]>([]);
  protected readonly reviews = signal<Review[]>([]);
  protected readonly proposalDetail = signal<Proposal | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly accepting = signal(false);
  protected readonly avatar = computed(() => initials(this.profile()?.fullName));
  protected readonly clientReviews = computed(() => this.reviews().filter((review) => review.reviewerRole === 'CLIENT'));

  ngOnInit(): void {
    const id = this.studentId();
    const projectId = this.project();
    forkJoin({
      profile: this.profiles.getStudent(id),
      certificates: this.certificatesService.getByStudent(id).pipe(catchError(() => of([] as Certificate[]))),
      reviews: this.reviewsService.getReceivedBy(id).pipe(catchError(() => of([] as Review[]))),
      proposals: projectId ? this.projects.getProposals(projectId).pipe(catchError(() => of([] as Proposal[]))) : of([] as Proposal[]),
    }).subscribe({
      next: ({ profile, certificates, reviews, proposals }) => {
        this.profile.set(profile);
        this.certificates.set(certificates.filter((certificate) => certificate.status === 'ISSUED'));
        this.reviews.set(reviews);
        this.proposalDetail.set(proposals.find((candidate) => candidate.id === this.proposal()) ?? null);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
        this.loading.set(false);
      },
    });
  }

  protected accept(): void {
    const proposal = this.proposalDetail();
    if (!proposal) return;
    this.notifier
      .confirm('proposals.confirm.title', 'proposals.confirm.message', 'proposals.accept', { name: this.profile()!.fullName })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.accepting.set(true);
          return this.projects.acceptProposal(proposal.projectId, proposal.id);
        }),
        switchMap(() => this.engagements.waitForProposal(proposal.id)),
      )
      .subscribe({
        next: (engagement) => void this.router.navigate(['/engagements', engagement.id, 'payment']),
        error: (error: unknown) => {
          this.accepting.set(false);
          this.notifier.show(problemMessage(error, (key) => this.i18n.translate(key)));
        },
      });
  }
}
