import { CreateBatchPayment } from 'projectshell-crm';

// Edit variants omit batchDate/paymentDate: the component reformats them to MM/YYYY and
// DD/MM/YYYY strings that MyDatePicker re-parses with plain dayjs(), which shows "Invalid Date".

const Frame = ({ children }) => <div style={{ width: '100%', maxWidth: 1100 }}>{children}</div>;

export const NewBatch = () => (
  <Frame>
    <CreateBatchPayment />
  </Frame>
);

export const EditChequeBatch = () => (
  <Frame>
    <CreateBatchPayment
      editBatchId="6745a1c2e8b9f3a1d4c70011"
      editSource={{
        _id: '6745a1c2e8b9f3a1d4c70011',
        type: 'Cheque',
        referenceNumber: 'CHQ-2025-11-031',
        description: 'November cheque lodgements - Dublin Metropolitan',
        comments: 'Lodged at AIB Pearse Street, 14 Nov.',
        batchStatus: 'Draft',
        batchPayments: new Array(18).fill({}),
      }}
    />
  </Frame>
);

export const EditStandingOrderBatch = () => (
  <Frame>
    <CreateBatchPayment
      editBatchId="6745a1c2e8b9f3a1d4c70042"
      editSource={{
        _id: '6745a1c2e8b9f3a1d4c70042',
        type: 'Standing Order',
        referenceNumber: 'SO-2025-10-BOI',
        description: 'October standing orders - Bank of Ireland',
        bankName: 'Bank of Ireland',
        batchStatus: 'Draft',
        batchPayments: new Array(212).fill({}),
      }}
    />
  </Frame>
);
