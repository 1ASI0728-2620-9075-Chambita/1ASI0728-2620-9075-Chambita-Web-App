import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { problemMessage } from '../../../shared/http/api';
import { LocalDatePipe, MoneyPipe } from '../../../shared/i18n/localized.pipes';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { StatusChip } from '../../../shared/ui/status-chip';
import { Engagement } from '../../model/engagement';
import { EngagementsService } from '../../services/engagements.service';

/** Engagements of the client, newest first. */
@Component({
  selector: 'app-engagements-list-page',
  imports: [RouterLink, TranslatePipe, MoneyPipe, LocalDatePipe, StatusChip],
  template: `
    <div class="stack-lg">
      <h1>{{ 'nav.engagements' | t }}</h1>
      <section class="card card--flush">
        @if (loading()) {
          <div class="loading muted">{{ 'common.loading' | t }}</div>
        } @else if (error()) {
          <div class="empty" role="alert">{{ error() }}</div>
        } @else if (!engagements().length) {
          <div class="empty">{{ 'engagements.empty' | t }}</div>
        } @else {
          <div class="table-wrap">
            <table class="data">
              <thead>
                <tr>
                  <th scope="col">{{ 'dashboard.column.project' | t }}</th>
                  <th scope="col">{{ 'dashboard.column.status' | t }}</th>
                  <th scope="col">{{ 'engagements.price' | t }}</th>
                  <th scope="col">{{ 'dashboard.column.deadline' | t }}</th>
                  <th scope="col"><span class="sr-only">{{ 'dashboard.column.action' | t }}</span></th>
                </tr>
              </thead>
              <tbody>
                @for (engagement of engagements(); track engagement.id) {
                  <tr>
                    <td><b>{{ engagement.projectTitle }}</b><br><span class="muted">{{ 'category.' + engagement.category | t }}</span></td>
                    <td><app-status-chip [status]="engagement.status" /></td>
                    <td>{{ engagement.agreedPrice | money }}</td>
                    <td class="muted">{{ engagement.deadline | localDate }}</td>
                    <td class="action"><a [routerLink]="['/engagements', engagement.id]">{{ 'dashboard.viewEngagement' | t }}</a></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </div>
  `,
  styles: `.action { text-align: right; }`,
})
export class EngagementsListPage {
  private readonly engagementsService = inject(EngagementsService);
  private readonly i18n = inject(TranslationService);
  protected readonly engagements = signal<Engagement[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.engagementsService.getAll().subscribe({
      next: (engagements) => {
        this.engagements.set([...engagements].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
        this.loading.set(false);
      },
    });
  }
}
