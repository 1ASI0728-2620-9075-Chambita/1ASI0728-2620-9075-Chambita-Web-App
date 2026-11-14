import { Engagement } from '../../../engagements/model/engagement';
import { Project } from '../../model/project';
import { buildRows, dashboardStats, filterRows } from './dashboard.view';

function project(id: string, status: Project['status'], proposalsCount = 0, createdAt = '2026-11-01T10:00:00Z'): Project {
  return {
    id, clientId: 'c1', clientName: 'Rosa', title: `Project ${id}`, description: 'd', category: 'GRAPHIC_DESIGN',
    requiredSkills: [], deliverables: [], budget: 450, currency: 'PEN', deadline: '2026-12-01', assisted: false,
    status, proposalsCount, createdAt,
  };
}

function engagement(id: string, projectId: string, status: Engagement['status']): Engagement {
  return {
    id, projectId, proposalId: `p-${id}`, clientId: 'c1', studentId: 's1', projectTitle: 't', category: 'GRAPHIC_DESIGN',
    agreedPrice: 450, currency: 'PEN', deliveryDays: 10, deadline: '2026-12-01', status, createdAt: '2026-11-02T10:00:00Z',
    activatedAt: null, completedAt: null, deliverables: [],
  };
}

describe('dashboard view (D02)', () => {
  const projects = [project('a', 'OPEN', 5), project('b', 'IN_PROGRESS'), project('c', 'IN_PROGRESS'), project('d', 'OPEN', 2)];
  const engagements = [engagement('e1', 'b', 'ACTIVE'), engagement('e2', 'c', 'COMPLETED')];

  it('shows a completed engagement as a completed project', () => {
    const rows = buildRows(projects, engagements);
    expect(rows.find((row) => row.project.id === 'c')!.status).toBe('COMPLETED');
    expect(rows.find((row) => row.project.id === 'b')!.status).toBe('IN_PROGRESS');
    expect(rows.find((row) => row.project.id === 'a')!.engagement).toBeNull();
  });

  it('filters by status', () => {
    const rows = buildRows(projects, engagements);
    expect(filterRows(rows, 'ALL').length).toBe(4);
    expect(filterRows(rows, 'OPEN').map((row) => row.project.id).sort()).toEqual(['a', 'd']);
    expect(filterRows(rows, 'COMPLETED').map((row) => row.project.id)).toEqual(['c']);
  });

  it('counts open projects, active engagements and proposals of open projects', () => {
    const rows = buildRows(projects, engagements);
    expect(dashboardStats(rows, engagements)).toEqual({ openProjects: 2, activeEngagements: 1, proposalsReceived: 7 });
  });

  it('ignores cancelled engagements', () => {
    const rows = buildRows([project('x', 'OPEN')], [engagement('e9', 'x', 'CANCELLED')]);
    expect(rows[0]!.status).toBe('OPEN');
  });
});
