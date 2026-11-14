export interface Certificate {
  id: string;
  engagementId: string;
  studentId: string;
  projectTitle: string;
  category: string;
  score: number;
  issuedAt: string;
  certificateHash: string;
  status: 'PENDING' | 'ISSUED' | 'FAILED' | 'REVOKED';
  tokenId: number | null;
  transactionHash: string | null;
  revokedAt: string | null;
  verificationUrl: string;
  contractAddress: string | null;
}
