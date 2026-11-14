import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { problemFields, problemMessage } from '../../../shared/http/api';
import { dateAfterDays } from '../../../shared/i18n/format';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { TagInput } from '../../../shared/ui/tag-input';
import { SERVICE_CATEGORIES, ServiceCategory } from '../../model/project';
import { ProjectsService } from '../../services/projects.service';

/** D03 · Publish a project (US16). The AI assistant of the mock-up arrives in Sprint 2. */
@Component({
  selector: 'app-publish-project-page',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, TagInput],
  templateUrl: './publish-project.page.html',
  styleUrl: './publish-project.page.css',
})
export class PublishProjectPage {
  private readonly projects = inject(ProjectsService);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly i18n = inject(TranslationService);

  protected readonly categories = SERVICE_CATEGORIES;
  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly serverFields = signal<Record<string, string>>({});
  protected readonly deliverables = signal<string[]>([]);
  protected readonly skills = signal<string[]>([]);

  protected readonly form = inject(FormBuilder).group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    category: ['' as ServiceCategory | '', Validators.required],
    budget: [null as number | null, [Validators.required, Validators.min(1), Validators.max(99999.99)]],
    deliveryDays: [null as number | null, [Validators.required, Validators.min(1), Validators.max(180)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected invalid(control: string): boolean {
    const field = this.form.get(control)!;
    return (field.invalid && (field.touched || this.submitted())) || !!this.serverFields()[control];
  }

  /** US16 · Escenario 2: lists the missing data instead of publishing. */
  protected missingFields(): string[] {
    return Object.keys(this.form.controls).filter((name) => this.form.get(name)!.invalid);
  }

  protected missingLabels(): string {
    return this.missingFields().map((field) => this.i18n.translate(`publish.field.${field}`)).join(', ');
  }

  protected publish(): void {
    this.submitted.set(true);
    this.serverFields.set({});
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.projects
      .publish({
        title: value.title!.trim(),
        description: value.description!.trim(),
        category: value.category as ServiceCategory,
        requiredSkills: this.skills(),
        deliverables: this.deliverables(),
        budget: Number(value.budget),
        deadline: dateAfterDays(Number(value.deliveryDays)),
      })
      .subscribe({
        next: (project) => {
          this.notifier.show(this.i18n.translate('publish.published', { title: project.title }));
          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.serverFields.set(problemFields(error));
          this.error.set(problemMessage(error, (key) => this.i18n.translate(key)));
        },
      });
  }
}
