export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CLOSED';

export interface StudentSummary {
  id: string;
  fullName: string;
  career: string | null;
  cycle: number | null;
  ratingAverage: number | null;
  ratingCount: number;
  newInPlatform: boolean;
  certificateCount: number;
}

export interface Proposal {
  id: string;
  projectId: string;
  studentId: string;
  price: number;
  currency: string;
  deliveryDays: number;
  message: string;
  status: ProposalStatus;
  createdAt: string;
  student: StudentSummary;
}
