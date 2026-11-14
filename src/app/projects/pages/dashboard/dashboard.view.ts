import { Engagement, EngagementStatus } from '../../../engagements/model/engagement';
import { Project } from '../../model/project';

export type DashboardFilter = 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
export type DisplayStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';

export interface ProjectRow {
  project: Project;
  engagement: Engagement | null;
  status: DisplayStatus;
}

const ACTIVE_ENGAGEMENT: EngagementStatus[] = ['PENDING_PAYMENT', 'ACTIVE', 'IN_REVIEW'];

/** Joins each project with its engagement: a project stays IN_PROGRESS in the API after completion. */
export function buildRows(projects: Project[], engagements: Engagement[]): ProjectRow[] {
  return projects
    .map((project) => {
      const engagement =
        engagements
          .filter((candidate) => candidate.projectId === project.id && candidate.status !== 'CANCELLED')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
      return { project, engagement, status: displayStatus(project, engagement) };
    })
    .sort((a, b) => b.project.createdAt.localeCompare(a.project.createdAt));
}

export function displayStatus(project: Project, engagement: Engagement | null): DisplayStatus {
  if (engagement?.status === 'COMPLETED') return 'COMPLETED';
  if (engagement && ACTIVE_ENGAGEMENT.includes(engagement.status)) return 'IN_PROGRESS';
  if (project.status === 'OPEN') return 'OPEN';
  return project.status === 'CANCELLED' ? 'CANCELLED' : project.status === 'CLOSED' ? 'CLOSED' : 'IN_PROGRESS';
}

export function filterRows(rows: ProjectRow[], filter: DashboardFilter): ProjectRow[] {
  return filter === 'ALL' ? rows : rows.filter((row) => row.status === filter);
}

export interface DashboardStats {
  openProjects: number;
  activeEngagements: number;
  proposalsReceived: number;
}

export function dashboardStats(rows: ProjectRow[], engagements: Engagement[]): DashboardStats {
  const open = rows.filter((row) => row.status === 'OPEN');
  return {
    openProjects: open.length,
    activeEngagements: engagements.filter((engagement) => ACTIVE_ENGAGEMENT.includes(engagement.status)).length,
    proposalsReceived: open.reduce((total, row) => total + row.project.proposalsCount, 0),
  };
}
