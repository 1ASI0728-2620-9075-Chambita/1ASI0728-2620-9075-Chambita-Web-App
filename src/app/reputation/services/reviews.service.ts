import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../../shared/http/api';
import { Review } from '../model/review';

/** Reputation bounded context: the client rates the student (US31). */
@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly http = inject(HttpClient);

  rate(engagementId: string, score: number, comment: string | null): Observable<Review> {
    return this.http.post<Review>(`${API}/engagements/${engagementId}/reviews`, { score, comment });
  }

  getReceivedBy(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${API}/users/${userId}/reviews`);
  }
}
