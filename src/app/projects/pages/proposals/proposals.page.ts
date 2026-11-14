import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { filter, forkJoin, switchMap } from 'rxjs';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { problemMessage } from '../../../shared/http/api';
import { initials } from '../../../shared/i18n/format';
import { LocalDatePipe, MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { StatusChip } from '../../../shared/ui/status-chip';
import { Project } from '../../model/project';
import { Proposal } from '../../model/proposal';
import { ProjectsService } from '../../services/projects.service';

/** D04 · Proposals of a project and acceptance (US21). Sorting and AI fit arrive in Sprint 2. */
@Component({
  selector: 'app-proposals-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, LocalDatePipe, StatusChip],
  templateUrl: './proposals.page.html',
  styleUrl: './proposals.page.css',
})
export class ProposalsPage implements OnInit {
  readonly projectId = input.required<string>();

  private readonly projects = inject(ProjectsService);
  private readonly engagements = inject(EngagementsService);
  private readonly notifier = inject(Notifier);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected readonly project = signal<Project | null>(null);
  protected readonly proposals = signal<Proposal[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly accepting = signal<string | null>(null);
  protected readonly isOpen = computed(() => this.project()?.status === 'OPEN');
  protected readonly initials = initials;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ project: this.projects.getById(this.projectId()), proposals: this.projects.getProposals(this.projectId()) }).subscribe({
      next: ({ project, proposals }) => {
        this.project.set(project);
        this.proposals.set(proposals);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
        this.loading.set(false);
      },
    });
  }

  /** Accepting creates the engagement pending payment and closes the other proposals. */
  protected accept(proposal: Proposal): void {
    this.notifier
      .confirm('proposals.confirm.title', 'proposals.confirm.message', 'proposals.accept', { name: proposal.student.fullName })
      .pipe(
        filter(Boolean),
        switchMap(() => {
          this.accepting.set(proposal.id);
          return this.projects.acceptProposal(this.projectId(), proposal.id);
        }),
        switchMap(() => this.engagements.waitForProposal(proposal.id)),
      )
      .subscribe({
        next: (engagement) => void this.router.navigate(['/engagements', engagement.id, 'payment']),
        error: (error: unknown) => {
          this.accepting.set(null);
          this.notifier.show(problemMessage(error, (key) => this.i18n.translate(key)));
          this.load();
        },
      });
  }
}
