export interface Review {
  id: string;
  engagementId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: 'CLIENT' | 'STUDENT';
  score: number;
  comment: string | null;
  createdAt: string;
}
