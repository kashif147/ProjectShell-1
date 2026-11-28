import { useEffect, useRef } from 'react';
import { MyDatePicker1, dayjs } from 'projectshell-crm';

const Col = ({ children }) => <div style={{ width: 320 }}>{children}</div>;

export const Empty = () => (
  <Col>
    <MyDatePicker1 label="Refund date" name="refundDate" onChange={() => {}} required />
  </Col>
);

export const WithValue = () => (
  <Col>
    <MyDatePicker1 label="Payment date" name="paymentDate" value={dayjs('2025-03-14')} onChange={() => {}} required />
  </Col>
);

export const ErrorState = () => (
  <Col>
    <MyDatePicker1 label="Credit note date" name="creditNoteDate" onChange={() => {}} required hasError errorMessage="Required" />
  </Col>
);

export const Disabled = () => (
  <Col>
    <MyDatePicker1 label="Adjustment date" name="adjustmentDate" onChange={() => {}} disabled />
  </Col>
);

// Clicks the real calendar icon after mount so the component's own calendar popup is shown.
export const CalendarOpen = () => {
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => ref.current?.querySelector('[aria-label="Open calendar"]')?.click(), 50);
    return () => clearTimeout(t);
  }, []);
  return (
    <div ref={ref} style={{ width: 320, height: 400 }}>
      <MyDatePicker1 label="Payment date" name="paymentDate" onChange={() => {}} required />
    </div>
  );
};
