export type EngagementStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED' | 'CANCELLED';

export interface Deliverable {
  id: string;
  fileUrl: string | null;
  linkUrl: string | null;
  note: string | null;
  status: 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED';
  submittedAt: string;
  reviewedAt: string | null;
}

export interface Engagement {
  id: string;
  projectId: string;
  proposalId: string;
  clientId: string;
  studentId: string;
  projectTitle: string;
  category: string;
  agreedPrice: number;
  currency: string;
  deliveryDays: number;
  deadline: string;
  status: EngagementStatus;
  createdAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  deliverables: Deliverable[];
}

export const REVIEW_PERIOD_DAYS = 7;

/** Step of the progress bar (D07, D08): paid, in progress, in review, completed. */
export function engagementStep(status: EngagementStatus): number {
  switch (status) {
    case 'PENDING_PAYMENT':
    case 'CANCELLED':
      return -1;
    case 'ACTIVE':
      return 1;
    case 'IN_REVIEW':
      return 2;
    case 'COMPLETED':
      return 4;
  }
}

export function latestDeliverable(engagement: Engagement): Deliverable | null {
  return engagement.deliverables.length ? engagement.deliverables[engagement.deliverables.length - 1]! : null;
}

/** Date when an unanswered delivery is approved automatically (US28). */
export function automaticApprovalDate(deliverable: Deliverable): string {
  const date = new Date(deliverable.submittedAt);
  date.setDate(date.getDate() + REVIEW_PERIOD_DAYS);
  return date.toISOString();
}
