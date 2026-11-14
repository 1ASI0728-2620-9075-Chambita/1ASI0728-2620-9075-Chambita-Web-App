import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API } from '../../shared/http/api';
import { CreateProjectRequest, Project } from '../model/project';
import { Proposal } from '../model/proposal';

/** Projects bounded context: publication and proposals (US16, US21). */
@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  publish(request: CreateProjectRequest): Observable<Project> {
    return this.http.post<Project>(`${API}/projects`, request);
  }

  getById(projectId: string): Observable<Project> {
    return this.http.get<Project>(`${API}/projects/${projectId}`);
  }

  getByClient(clientId: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${API}/clients/${clientId}/projects`);
  }

  getProposals(projectId: string): Observable<Proposal[]> {
    return this.http.get<Proposal[]>(`${API}/projects/${projectId}/proposals`);
  }

  acceptProposal(projectId: string, proposalId: string): Observable<Proposal> {
    return this.http.post<Proposal>(`${API}/projects/${projectId}/proposals/${proposalId}/acceptance`, null);
  }
}
