import { feePercentage, Payment } from '../../payments/model/payment';
import { Deliverable, automaticApprovalDate, engagementStep } from './engagement';

describe('engagement and payment rules', () => {
  it('maps the status to the step of the progress bar', () => {
    expect(engagementStep('PENDING_PAYMENT')).toBe(-1);
    expect(engagementStep('ACTIVE')).toBe(1);
    expect(engagementStep('IN_REVIEW')).toBe(2);
    expect(engagementStep('COMPLETED')).toBe(4);
  });

  it('approves automatically 7 days after the delivery (US28)', () => {
    const deliverable: Deliverable = {
      id: 'd1', fileUrl: null, linkUrl: 'https://drive.google.com/x', note: null, status: 'SUBMITTED',
      submittedAt: '2026-11-10T15:00:00.000Z', reviewedAt: null,
    };
    expect(automaticApprovalDate(deliverable)).toBe('2026-11-17T15:00:00.000Z');
  });

  it('shows the service fee as a percentage of the agreed price (US27)', () => {
    const payment = { amount: 450, serviceFee: 45 } as Payment;
    expect(feePercentage(payment)).toBe(10);
    expect(feePercentage({ amount: 0, serviceFee: 0 } as Payment)).toBe(0);
  });
});
