import { SubscriptionHistoryDetail } from 'projectshell-crm';

const resignedSubscription = {
  _id: '6721f0c4a9e1b2d3c4f50a17',
  membershipNumber: 'GRA-104233',
  personalDetails: { fullName: 'Siobhán Murphy', membershipNo: 'GRA-104233' },
  professionalDetails: { workLocation: 'Pearse Street', grade: 'Sergeant', primarySection: 'Dublin Metropolitan Region' },
  subscriptionYear: 2025,
  startDate: '2025-01-01T00:00:00.000Z',
  endDate: '2025-12-31T00:00:00.000Z',
  subscriptionStatus: 'Resigned',
  membershipCategory: 'General',
  paymentType: 'Payroll Deduction',
  paymentFrequency: 'Monthly',
  payrollNo: 'PR-558120',
  resignation: { dateResigned: '2025-09-30T00:00:00.000Z', reason: 'Retired from service' },
  cancellation: { reinstated: false },
  reminders: { reminder1At: '2025-02-14T00:00:00.000Z', reminder2At: '2025-03-14T00:00:00.000Z' },
  lastModifiedAt: '2025-10-02T09:41:00.000Z',
};

export const ResignedSubscription = () => (
  <SubscriptionHistoryDetail open subscription={resignedSubscription} onClose={() => {}} />
);

export const ActiveSubscription = () => (
  <SubscriptionHistoryDetail
    open
    onClose={() => {}}
    subscription={{
      ...resignedSubscription,
      _id: '6734a2b1c0d9e8f7a6b5c4d3',
      membershipNumber: 'GRA-104871',
      personalDetails: { fullName: 'Ciarán O’Brien', membershipNo: 'GRA-104871' },
      professionalDetails: { workLocation: 'Anglesea Street', grade: 'Garda', primarySection: 'Southern Region' },
      subscriptionYear: 2026,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T00:00:00.000Z',
      subscriptionStatus: 'Active',
      paymentType: 'Direct Debit',
      payrollNo: '',
      resignation: {},
      reminders: {},
    }}
  />
);

export const NoSubscriptionSelected = () => <SubscriptionHistoryDetail open subscription={null} onClose={() => {}} />;
