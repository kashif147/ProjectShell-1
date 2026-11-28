import { UnifiedPagination } from 'projectshell-crm';

export const MembersGrid = () => (
  <div style={{ width: 760 }}>
    <UnifiedPagination total={4318} current={1} pageSize={500} itemName="members" onChange={() => {}} />
  </div>
);

export const SmallDataset = () => (
  <div style={{ width: 760 }}>
    <UnifiedPagination total={86} current={1} itemName="batches" onChange={() => {}} />
  </div>
);

export const LargeDatasetMidPage = () => (
  <div style={{ width: 760 }}>
    <UnifiedPagination total={62450} current={4} pageSize={5000} itemName="ledger entries" showQuickJumper onChange={() => {}} />
  </div>
);

export const NoSizeChanger = () => (
  <div style={{ width: 760 }}>
    <UnifiedPagination total={240} current={2} pageSize={50} itemName="cases" showSizeChanger={false} onChange={() => {}} />
  </div>
);
