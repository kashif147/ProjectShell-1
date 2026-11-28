import { MyTransfer, Card } from 'projectshell-crm';

// MyTransfer takes no props: it renders its built-in committee list
// (Accommodations, Allowance, Community Police, Garda Review, Legal Aid).
export const CommitteeAssignment = () => <MyTransfer />;

export const InMemberDetailsCard = () => (
  <Card title="Committees — Siobhán Murphy (GRA-104233)" size="small" style={{ width: 560 }}>
    <MyTransfer />
  </Card>
);
