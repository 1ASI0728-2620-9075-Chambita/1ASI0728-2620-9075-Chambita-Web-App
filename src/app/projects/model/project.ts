export type ServiceCategory = 'GRAPHIC_DESIGN' | 'SOFTWARE_DEVELOPMENT' | 'DIGITAL_MARKETING' | 'COPYWRITING';
export const SERVICE_CATEGORIES: ServiceCategory[] = ['GRAPHIC_DESIGN', 'SOFTWARE_DEVELOPMENT', 'DIGITAL_MARKETING', 'COPYWRITING'];

export type ProjectStatus = 'OPEN' | 'IN_PROGRESS' | 'CANCELLED' | 'CLOSED';

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  category: ServiceCategory;
  requiredSkills: string[];
  deliverables: string[];
  budget: number;
  currency: string;
  deadline: string;
  assisted: boolean;
  status: ProjectStatus;
  proposalsCount: number;
  createdAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  category: ServiceCategory;
  requiredSkills: string[];
  deliverables: string[];
  budget: number;
  deadline: string;
}
