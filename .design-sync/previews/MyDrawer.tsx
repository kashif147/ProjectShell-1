import { MyDrawer, MyInput, MySelect, MyDatePicker, Row, Col, Alert, Table } from 'projectshell-crm';

const RefundForm = () => (
  <div style={{ padding: 10 }}>
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Alert type="info" showIcon message="Receipt RC-2025-00418 · €240.00 paid by card on 02/05/2025" />
      </Col>
      <Col span={12}>
        <MyInput label="Membership number" name="membershipNo" value="GRA-104233" onChange={() => {}} disabled />
      </Col>
      <Col span={12}>
        <MyInput label="Member name" name="memberName" value="Siobhán Murphy" onChange={() => {}} disabled />
      </Col>
      <Col span={12}>
        <MyInput label="Refund amount (€)" name="amount" value="120.00" onChange={() => {}} required />
      </Col>
      <Col span={12}>
        <MyDatePicker label="Refund date" name="refundDate" value="2025-05-14" onChange={() => {}} required />
      </Col>
      <Col span={24}>
        <MySelect
          placeholder="Select refund method"
          isSimple
          defaultValue="Bank transfer"
          options={[{ value: 'bank', label: 'Bank transfer' }, { value: 'card', label: 'Card reversal' }]}
        />
      </Col>
      <Col span={24}>
        <MyInput label="Reason" name="reason" type="textarea" rows={3} value="Duplicate subscription payment for 2025." onChange={() => {}} />
      </Col>
    </Row>
  </div>
);

export const SubmitForm = () => (
  <MyDrawer title="Refund" open onClose={() => {}} width={640} isPagination={false} add={() => {}} isDisable={false}>
    <RefundForm />
  </MyDrawer>
);

export const EditMode = () => (
  <MyDrawer title="Career Break" open onClose={() => {}} width={578} isEdit update={() => {}} isDisable={false}>
    <div style={{ padding: 10 }}>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <MyDatePicker label="Start date" name="startDate" value="2025-09-01" onChange={() => {}} required />
        </Col>
        <Col span={12}>
          <MyDatePicker label="End date" name="endDate" value="2026-08-31" onChange={() => {}} required />
        </Col>
        <Col span={24}>
          <MyInput label="Comments" name="comments" type="textarea" rows={3} value="Career break approved by HR, Pearse Street station." onChange={() => {}} />
        </Col>
      </Row>
    </div>
  </MyDrawer>
);

const stationColumns = [
  { title: 'Code', dataIndex: 'code', key: 'code', width: 90 },
  { title: 'Station', dataIndex: 'name', key: 'name' },
  { title: 'Division', dataIndex: 'division', key: 'division' },
];
const stations = [
  { key: '1', code: 'DMR-01', name: 'Pearse Street', division: 'DMR South Central' },
  { key: '2', code: 'DMR-02', name: 'Store Street', division: 'DMR North Central' },
  { key: '3', code: 'COR-01', name: 'Anglesea Street', division: 'Cork City' },
  { key: '4', code: 'LIM-01', name: 'Henry Street', division: 'Limerick' },
];

export const LookupWithPagination = () => (
  <MyDrawer title="Stations" open onClose={() => {}} width={700} isPagination total={4} pageSize={10} add={() => {}} isDisable={false}>
    <div style={{ padding: 10 }}>
      <Table columns={stationColumns} dataSource={stations} pagination={false} size="small" />
    </div>
  </MyDrawer>
);

export const Submitting = () => (
  <MyDrawer title="Refund" open onClose={() => {}} width={640} isPagination={false} add={() => {}} isLoading isDisable={false}>
    <RefundForm />
  </MyDrawer>
);
