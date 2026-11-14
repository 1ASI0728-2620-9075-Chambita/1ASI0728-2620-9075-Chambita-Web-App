export type PaymentStatus = 'PENDING' | 'HELD' | 'RELEASED' | 'CANCELLED';

export interface Payment {
  id: string;
  engagementId: string;
  clientId: string;
  studentId: string;
  amount: number;
  serviceFee: number;
  totalCharged: number;
  studentPayout: number;
  currency: string;
  status: PaymentStatus;
  heldAt: string | null;
  releasedAt: string | null;
}

/** Fee as a percentage of the agreed price, e.g. 10. */
export function feePercentage(payment: Payment): number {
  return payment.amount > 0 ? Math.round((payment.serviceFee / payment.amount) * 1000) / 10 : 0;
}
