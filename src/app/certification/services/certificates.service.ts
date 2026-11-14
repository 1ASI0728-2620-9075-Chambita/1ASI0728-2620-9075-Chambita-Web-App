import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../../shared/http/api';
import { Certificate } from '../model/certificate';

/** Certification bounded context: issued certificates of a student (US15). */
@Injectable({ providedIn: 'root' })
export class CertificatesService {
  private readonly http = inject(HttpClient);

  getByStudent(studentId: string): Observable<Certificate[]> {
    return this.http.get<Certificate[]>(`${API}/students/${studentId}/certificates`);
  }
}
