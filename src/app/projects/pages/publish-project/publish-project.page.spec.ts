import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { dateAfterDays } from '../../../shared/i18n/format';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { Project } from '../../model/project';
import { ProjectsService } from '../../services/projects.service';
import { PublishProjectPage } from './publish-project.page';

describe('PublishProjectPage (D03 · US16)', () => {
  let projects: jasmine.SpyObj<ProjectsService>;

  beforeEach(() => {
    projects = jasmine.createSpyObj<ProjectsService>('ProjectsService', ['publish']);
    TestBed.configureTestingModule({
      imports: [PublishProjectPage],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: projects },
        { provide: Notifier, useValue: jasmine.createSpyObj('Notifier', ['show']) },
      ],
    });
    TestBed.inject(TranslationService).setLanguage('es');
  });

  function fill(element: HTMLElement, name: string, value: string) {
    const field = element.querySelector<HTMLInputElement | HTMLSelectElement>(`[formcontrolname=${name}]`)!;
    field.value = value;
    field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input'));
  }

  it('does not publish and lists the missing budget and deadline', async () => {
    const fixture = TestBed.createComponent(PublishProjectPage);
    fixture.detectChanges();
    fill(fixture.nativeElement, 'title', 'Identidad visual');
    fill(fixture.nativeElement, 'category', 'GRAPHIC_DESIGN');
    fill(fixture.nativeElement, 'description', 'Logo y plantillas');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(projects.publish).not.toHaveBeenCalled();
    const alert = fixture.nativeElement.querySelector('[role=alert]').textContent;
    expect(alert).toContain('Presupuesto (S/)');
    expect(alert).toContain('Plazo (días)');
  });

  it('publishes with the deadline calculated from the days', async () => {
    projects.publish.and.returnValue(of({ id: 'p1', title: 'Identidad visual' } as Project));
    const fixture = TestBed.createComponent(PublishProjectPage);
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    fill(fixture.nativeElement, 'title', ' Identidad visual ');
    fill(fixture.nativeElement, 'category', 'GRAPHIC_DESIGN');
    fill(fixture.nativeElement, 'budget', '450');
    fill(fixture.nativeElement, 'deliveryDays', '10');
    fill(fixture.nativeElement, 'description', 'Logo y plantillas');
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(projects.publish).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Identidad visual', category: 'GRAPHIC_DESIGN', budget: 450, deadline: dateAfterDays(10),
    }));
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
