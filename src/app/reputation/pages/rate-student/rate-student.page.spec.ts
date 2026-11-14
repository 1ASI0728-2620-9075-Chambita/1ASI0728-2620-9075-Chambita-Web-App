import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Engagement } from '../../../engagements/model/engagement';
import { EngagementsService } from '../../../engagements/services/engagements.service';
import { StudentProfile } from '../../../profiles/model/profiles';
import { ProfilesService } from '../../../profiles/services/profiles.service';
import { TranslationService } from '../../../shared/i18n/translation.service';
import { Notifier } from '../../../shared/ui/notifier';
import { Review } from '../../model/review';
import { ReviewsService } from '../../services/reviews.service';
import { RateStudentPage } from './rate-student.page';

describe('RateStudentPage (D09 · US31)', () => {
  let reviews: jasmine.SpyObj<ReviewsService>;
  let status: Engagement['status'];

  beforeEach(() => {
    status = 'COMPLETED';
    reviews = jasmine.createSpyObj<ReviewsService>('ReviewsService', ['rate']);
    const engagements = jasmine.createSpyObj<EngagementsService>('EngagementsService', ['getById']);
    engagements.getById.and.callFake(() => of({ id: 'e1', studentId: 's1', projectTitle: 'Identidad visual', agreedPrice: 450, status } as Engagement));
    const profiles = jasmine.createSpyObj<ProfilesService>('ProfilesService', ['getStudent']);
    profiles.getStudent.and.returnValue(of({ fullName: 'Valeria Rojas' } as StudentProfile));
    TestBed.configureTestingModule({
      imports: [RateStudentPage],
      providers: [
        provideRouter([]),
        { provide: EngagementsService, useValue: engagements },
        { provide: ProfilesService, useValue: profiles },
        { provide: ReviewsService, useValue: reviews },
        { provide: Notifier, useValue: jasmine.createSpyObj('Notifier', ['show']) },
      ],
    });
    TestBed.inject(TranslationService).setLanguage('es');
  });

  async function render() {
    const fixture = TestBed.createComponent(RateStudentPage);
    fixture.componentRef.setInput('engagementId', 'e1');
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  const sendButton = (element: HTMLElement) =>
    [...element.querySelectorAll('button')].find((button) => button.textContent!.includes('Enviar calificación'))!;

  it('requires choosing stars before sending', async () => {
    const fixture = await render();
    sendButton(fixture.nativeElement).click();
    await fixture.whenStable();
    expect(reviews.rate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Elige de 1 a 5 estrellas.');
  });

  it('sends the score and the comment', async () => {
    reviews.rate.and.returnValue(of({} as Review));
    const fixture = await render();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture.nativeElement.querySelectorAll('[role=radio]')[4].click();
    const comment = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    comment.value = 'Muy puntual';
    comment.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('5 de 5');
    sendButton(fixture.nativeElement).click();
    await fixture.whenStable();
    expect(reviews.rate).toHaveBeenCalledWith('e1', 5, 'Muy puntual');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('explains when the engagement was already rated', async () => {
    reviews.rate.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    const fixture = await render();
    fixture.nativeElement.querySelectorAll('[role=radio]')[3].click();
    await fixture.whenStable();
    sendButton(fixture.nativeElement).click();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Ya calificaste esta contratación.');
  });

  it('does not allow rating an engagement that is not completed', async () => {
    status = 'IN_REVIEW';
    const fixture = await render();
    expect(fixture.nativeElement.querySelectorAll('[role=radio]').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('Podrás calificar cuando la contratación esté completada.');
  });
});
