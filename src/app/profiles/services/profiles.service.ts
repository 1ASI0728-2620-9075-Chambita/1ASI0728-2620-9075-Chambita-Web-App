import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../../shared/http/api';
import { ClientProfile, StudentProfile, UpdateClientProfileRequest } from '../model/profiles';

/** Profiles bounded context (US15). */
@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly http = inject(HttpClient);

  getStudent(studentId: string): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${API}/students/${studentId}`);
  }

  getClient(clientId: string): Observable<ClientProfile> {
    return this.http.get<ClientProfile>(`${API}/clients/${clientId}`);
  }

  updateClient(clientId: string, request: UpdateClientProfileRequest): Observable<ClientProfile> {
    return this.http.put<ClientProfile>(`${API}/clients/${clientId}/profile`, request);
  }
}
