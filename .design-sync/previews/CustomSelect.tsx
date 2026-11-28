import { CustomSelect } from 'projectshell-crm';

const Col = ({ children }) => <div style={{ width: 320 }}>{children}</div>;

const workLocations = [
  { key: 'wl-01', label: 'Pearse Street' },
  { key: 'wl-02', label: 'Anglesea Street' },
  { key: 'wl-03', label: 'Mill Street' },
  { key: 'wl-04', label: 'Henry Street' },
  { key: 'wl-05', label: 'Store Street' },
];

const regions = [
  { key: 'dmr', label: 'Dublin Metropolitan' },
  { key: 'south', label: 'Southern' },
  { key: 'east', label: 'Eastern' },
  { key: 'nw', label: 'North Western' },
];

const batchTypes = [
  { key: 'dd', label: 'Direct Debit' },
  { key: 'so', label: 'Standing Order' },
  { key: 'deduction', label: 'Payroll Deduction' },
];

export const Searchable = () => (
  <Col>
    <CustomSelect label="Work Location" name="workLocation" placeholder="Select work location" options={workLocations} value="" onChange={() => {}} required isIDs showSearch />
  </Col>
);

export const WithValue = () => (
  <Col>
    <CustomSelect label="Region" name="region" placeholder="Select region" options={regions} value="Dublin Metropolitan" onChange={() => {}} />
  </Col>
);

export const ErrorState = () => (
  <Col>
    <CustomSelect label="Batch Type" name="batchType" placeholder="Select batch type" options={batchTypes} value="" onChange={() => {}} required hasError errorMessage="Please select a batch type" />
  </Col>
);

export const Disabled = () => (
  <Col>
    <CustomSelect label="Branch" name="currentBranch" options={workLocations} value="Anglesea Street" onChange={() => {}} disabled />
  </Col>
);

export const NativeNoClear = () => (
  <Col>
    <CustomSelect label="Payment Type" name="paymentType" placeholder="Select payment type" options={batchTypes} value="Standing Order" onChange={() => {}} allowClear={false} />
  </Col>
);
