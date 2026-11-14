import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, filter, map, take, timer, switchMap, timeout } from 'rxjs';
import { API } from '../../shared/http/api';
import { Engagement, EngagementStatus } from '../model/engagement';

/** Engagements bounded context: life cycle and deliverables (US27, US28). */
@Injectable({ providedIn: 'root' })
export class EngagementsService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Engagement[]> {
    return this.http.get<Engagement[]>(`${API}/engagements`);
  }

  getById(engagementId: string): Observable<Engagement> {
    return this.http.get<Engagement>(`${API}/engagements/${engagementId}`);
  }

  approveDeliverable(engagementId: string): Observable<unknown> {
    return this.http.post(`${API}/engagements/${engagementId}/approval`, null);
  }

  cancel(engagementId: string): Observable<Engagement> {
    return this.http.post<Engagement>(`${API}/engagements/${engagementId}/cancellation`, null);
  }

  /** The engagement is created by an event after the acceptance, so it appears a moment later. */
  waitForProposal(proposalId: string, intervalMs = 1000, timeoutMs = 15000): Observable<Engagement> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getAll()),
      map((engagements) => engagements.find((engagement) => engagement.proposalId === proposalId)),
      filter((engagement): engagement is Engagement => engagement !== undefined),
      take(1),
      timeout(timeoutMs),
    );
  }

  /** Waits until the engagement reaches the status (payment events are processed asynchronously). */
  waitForStatus(engagementId: string, status: EngagementStatus, intervalMs = 1000, timeoutMs = 15000): Observable<Engagement> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getById(engagementId)),
      filter((engagement) => engagement.status === status),
      take(1),
      timeout(timeoutMs),
    );
  }
}
