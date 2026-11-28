import { MyInput } from 'projectshell-crm';

const Col = ({ children }) => <div style={{ width: 320 }}>{children}</div>;

export const Text = () => (
  <Col>
    <MyInput label="Forename" name="forename" placeholder="Enter forename" value="Siobhán" onChange={() => {}} required />
  </Col>
);

export const Email = () => (
  <Col>
    <MyInput label="Personal email" name="email" type="email" placeholder="name@example.ie" value="s.murphy@example.ie" onChange={() => {}} />
  </Col>
);

export const ErrorState = () => (
  <Col>
    <MyInput label="Surname" name="surname" placeholder="Enter surname" value="" onChange={() => {}} required hasError errorMessage="Surname is required" />
  </Col>
);

export const Textarea = () => (
  <Col>
    <MyInput label="Comments" name="comments" type="textarea" rows={3} placeholder="Add a note for this member" value="Transferred from Cork division, March 2025." onChange={() => {}} />
  </Col>
);

export const Iban = () => (
  <Col>
    <MyInput label="IBAN" name="iban" type="iban" value="IE29AIBK93115212345678" onChange={() => {}} />
  </Col>
);

export const Disabled = () => (
  <Col>
    <MyInput label="Membership number" name="membershipNo" value="GRA-104233" onChange={() => {}} disabled />
  </Col>
);
