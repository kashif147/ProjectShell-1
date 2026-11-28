import { useEffect, useRef } from 'react';
import { MyAlert, Button } from 'projectshell-crm';

// MyAlert is a function, not a component: MyAlert(type, message, description) opens an antd
// notification at the top right. Each cell fires it once on mount; the button fires it again.
const Fire = ({ type, message, description }) => {
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      MyAlert(type, message, description);
    }
  }, []);
  return (
    <div style={{ height: 160 }}>
      <Button onClick={() => MyAlert(type, message, description)}>Show notification</Button>
    </div>
  );
};

export const Success = () => <Fire type="success" message="Tenant updated successfully" />;

export const ErrorNotice = () => <Fire type="error" message="Payment failed" description="The card ending 4242 was declined for member GRA-104233." />;

export const Warning = () => <Fire type="warning" message="Subscription overdue" description="Siobhán Murphy's 2025 subscription is 60 days in arrears." />;

export const Info = () => <Fire type="info" message="Batch queued" description="Payroll deduction batch PD-2025-06 will be submitted overnight." />;
