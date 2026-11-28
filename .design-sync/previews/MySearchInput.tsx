import { MySearchInput } from 'projectshell-crm';

const Col = ({ children }) => <div style={{ width: 320 }}>{children}</div>;

export const Empty = () => (
  <Col>
    <MySearchInput placeholder="Search by name, email, or ID..." value="" onChange={() => {}} />
  </Col>
);

export const WithQuery = () => (
  <Col>
    <MySearchInput placeholder="Search by name, email, or ID..." value="GRA-104233" onChange={() => {}} />
  </Col>
);

export const CaseHistory = () => (
  <Col>
    <MySearchInput placeholder="Search by actor or change..." value="Status changed" onChange={() => {}} />
  </Col>
);

export const Disabled = () => (
  <Col>
    <MySearchInput placeholder="Search reminders..." value="" onChange={() => {}} disabled />
  </Col>
);
