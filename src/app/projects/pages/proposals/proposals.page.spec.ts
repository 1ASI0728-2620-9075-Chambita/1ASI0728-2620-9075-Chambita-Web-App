import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Engagement } from '../../../engagements/model/engagement';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { Project } from '../../model/project';
import { Proposal } from '../../model/proposal';
import { ProjectsService } from '../../services/projects.service';
import { ProposalsPage } from './proposals.page';

const PROPOSAL: Proposal = {
  id: 'pr1', projectId: 'p1', studentId: 's1', price: 450, currency: 'PEN', deliveryDays: 10, message: 'Tres bocetos',
  status: 'PENDING', createdAt: '2026-11-10T10:00:00Z',
  student: { id: 's1', fullName: 'Valeria Rojas', career: 'Diseño Gráfico', cycle: 7, ratingAverage: null, ratingCount: 0, newInPlatform: true, certificateCount: 0 },
};

describe('ProposalsPage (D04 · US21)', () => {
  let projects: jasmine.SpyObj<ProjectsService>;
  let engagements: jasmine.SpyObj<EngagementsService>;
  let notifier: jasmine.SpyObj<Notifier>;

  beforeEach(() => {
    projects = jasmine.createSpyObj<ProjectsService>('ProjectsService', ['getById', 'getProposals', 'acceptProposal']);
    engagements = jasmine.createSpyObj<EngagementsService>('EngagementsService', ['waitForProposal']);
    notifier = jasmine.createSpyObj<Notifier>('Notifier', ['show', 'confirm']);
    projects.getById.and.returnValue(of({ id: 'p1', title: 'Identidad visual', status: 'OPEN', budget: 450, category: 'GRAPHIC_DESIGN', deadline: '2026-12-01' } as Project));
    projects.getProposals.and.returnValue(of([PROPOSAL]));
    TestBed.configureTestingModule({
      imports: [ProposalsPage],
      providers: [
        provideRouter([]),
        { provide: ProjectsService, useValue: projects },
        { provide: EngagementsService, useValue: engagements },
        { provide: Notifier, useValue: notifier },
      ],
    });
    TestBed.inject(TranslationService).setLanguage('es');
  });

  async function render() {
    const fixture = TestBed.createComponent(ProposalsPage);
    fixture.componentRef.setInput('projectId', 'p1');
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('shows the proposals with a new-student badge', async () => {
    const fixture = await render();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Propuestas (1)');
    expect(text).toContain('Valeria Rojas');
    expect(text).toContain('Nuevo');
    expect(text).toContain('S/ 450.00');
  });

  it('accepts after confirming and opens the payment of the new engagement', async () => {
    notifier.confirm.and.returnValue(of(true));
    projects.acceptProposal.and.returnValue(of({ ...PROPOSAL, status: 'ACCEPTED' }));
    engagements.waitForProposal.and.returnValue(of({ id: 'e1' } as Engagement));
    const fixture = await render();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const accept = [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLButtonElement) => button.textContent!.includes('Aceptar propuesta'));
    accept.click();
    await fixture.whenStable();
    expect(projects.acceptProposal).toHaveBeenCalledWith('p1', 'pr1');
    expect(navigate).toHaveBeenCalledWith(['/engagements', 'e1', 'payment']);
  });

  it('does nothing when the client cancels the confirmation', async () => {
    notifier.confirm.and.returnValue(of(false));
    const fixture = await render();
    const accept = [...fixture.nativeElement.querySelectorAll('button')].find((button: HTMLButtonElement) => button.textContent!.includes('Aceptar propuesta'));
    accept.click();
    await fixture.whenStable();
    expect(projects.acceptProposal).not.toHaveBeenCalled();
  });
});
