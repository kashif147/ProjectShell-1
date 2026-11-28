import { MyDatePicker } from 'projectshell-crm';

const Col = ({ children }) => <div style={{ width: 320 }}>{children}</div>;

export const WithValue = () => (
  <Col>
    <MyDatePicker label="Date of birth" name="dateOfBirth" value="1988-03-14" onChange={() => {}} required />
  </Col>
);

export const Empty = () => (
  <Col>
    <MyDatePicker label="Date joined" name="dateJoined" onChange={() => {}} />
  </Col>
);

export const ErrorState = () => (
  <Col>
    <MyDatePicker label="Retirement date" name="retirementDate" onChange={() => {}} required hasError errorMessage="Retirement date is required" />
  </Col>
);

export const MonthPicker = () => (
  <Col>
    <MyDatePicker label="Collection month" name="collectionMonth" picker="month" format="MM/YYYY" value="2025-06-01" onChange={() => {}} />
  </Col>
);

export const Disabled = () => (
  <Col>
    <MyDatePicker label="Subscription start" name="subscriptionStart" value="2025-01-01" onChange={() => {}} disabled />
  </Col>
);
