import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { Engagement } from '../../../engagements/model/engagement';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { AuthenticationService } from '../../../iam/services/authentication.service';
import { ProfilesService } from '../../../profiles/services/profiles.service';
import { problemMessage } from '../../../shared/http/api';
import { LocalDatePipe, MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { StatusChip } from '../../../shared/ui/status-chip';
import { Project } from '../../model/project';
import { ProjectsService } from '../../services/projects.service';
import { DashboardFilter, ProjectRow, buildRows, dashboardStats, filterRows } from './dashboard.view';

/** D02 · Dashboard of the client with the projects and their status. */
@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, LocalDatePipe, StatusChip],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css',
})
export class DashboardPage {
  private readonly projects = inject(ProjectsService);
  private readonly engagementsService = inject(EngagementsService);
  private readonly profiles = inject(ProfilesService);
  private readonly i18n = inject(TranslationService);
  protected readonly user = inject(AuthenticationService).currentUser;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly rows = signal<ProjectRow[]>([]);
  protected readonly engagements = signal<Engagement[]>([]);
  protected readonly studentNames = signal<Record<string, string>>({});
  protected readonly filter = signal<DashboardFilter>('ALL');
  protected readonly filters: DashboardFilter[] = ['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'];

  protected readonly visibleRows = computed(() => filterRows(this.rows(), this.filter()));
  protected readonly stats = computed(() => dashboardStats(this.rows(), this.engagements()));
  protected readonly firstName = computed(() => this.user()?.fullName.split(' ')[0] ?? '');

  constructor() {
    this.load();
  }

  protected load(): void {
    const clientId = this.user()!.id;
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ projects: this.projects.getByClient(clientId), engagements: this.engagementsService.getAll() })
      .pipe(switchMap((data) => this.withStudentNames(data.projects, data.engagements)))
      .subscribe({
        next: ({ projects, engagements, names }) => {
          this.engagements.set(engagements);
          this.rows.set(buildRows(projects, engagements));
          this.studentNames.set(names);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
          this.loading.set(false);
        },
      });
  }

  private withStudentNames(projects: Project[], engagements: Engagement[]) {
    const ids = [...new Set(engagements.map((engagement) => engagement.studentId))];
    if (!ids.length) return of({ projects, engagements, names: {} as Record<string, string> });
    const lookups = ids.map((id) =>
      this.profiles.getStudent(id).pipe(
        map((profile) => [id, profile.fullName] as const),
        catchError(() => of([id, '—'] as const)),
      ),
    );
    return forkJoin(lookups).pipe(map((pairs) => ({ projects, engagements, names: Object.fromEntries(pairs) })));
  }
}
