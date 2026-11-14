import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, retry, timer } from 'rxjs';
import { API } from '../../shared/http/api';
import { Payment } from '../model/payment';

/** Payments bounded context: simulated protected payment (US27). */
@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);

  /** The pending payment is created by an event right after the engagement, so 404 is retried. */
  getByEngagement(engagementId: string): Observable<Payment> {
    return this.http
      .get<Payment>(`${API}/engagements/${engagementId}/payments`)
      .pipe(
        retry({
          count: 8,
          delay: (error: unknown) => {
            if (error instanceof HttpErrorResponse && error.status === 404) return timer(1000);
            throw error;
          },
        }),
      );
  }

  confirm(engagementId: string): Observable<Payment> {
    return this.http.post<Payment>(`${API}/engagements/${engagementId}/payments`, null);
  }
}
