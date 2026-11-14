import { Component, input, model, signal } from '@angular/core';
import { TranslatePipe } from '../i18n/translate.pipe';

/** List of short texts (skills, deliverables) that the user adds with Enter or the + button. */
@Component({
  selector: 'app-tag-input',
  imports: [TranslatePipe],
  template: `
    <div class="tags">
      @for (tag of tags(); track tag; let index = $index) {
        <span class="tag">
          {{ tag }}
          <button type="button" class="remove" (click)="remove(index)" [attr.aria-label]="'tags.remove' | t: { value: tag }">×</button>
        </span>
      }
    </div>
    @if (tags().length < max()) {
      <div class="add">
        <input type="text" [id]="inputId()" [value]="draft()" (input)="draft.set($any($event.target).value)"
               (keydown.enter)="$event.preventDefault(); add()" [attr.maxlength]="maxLength()" [placeholder]="placeholder()">
        <button type="button" class="button button--outline button--small" (click)="add()">+ {{ 'tags.add' | t }}</button>
      </div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 8px; }
    .tag { display: inline-flex; align-items: center; gap: 4px; }
    .remove { border: 0; background: transparent; font-size: 16px; line-height: 1; cursor: pointer; color: var(--muted); padding: 0 2px; }
    .add { display: flex; gap: 8px; }
    .add input { flex: 1; min-width: 0; min-height: 40px; padding: 0 12px; border: 1px solid var(--input-line); border-radius: 8px; font: inherit; font-size: 14px; }
  `,
})
export class TagInput {
  readonly tags = model<string[]>([]);
  readonly inputId = input.required<string>();
  readonly placeholder = input('');
  readonly max = input(15);
  readonly maxLength = input(40);
  protected readonly draft = signal('');

  protected add(): void {
    const value = this.draft().trim();
    if (value && !this.tags().some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      this.tags.update((tags) => [...tags, value]);
    }
    this.draft.set('');
  }

  protected remove(index: number): void {
    this.tags.update((tags) => tags.filter((_, position) => position !== index));
  }
}
