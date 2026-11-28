import { CreateLifecycleBatchForm } from 'projectshell-crm';

// Rendered in the app inside the "Create Batch" drawer on /RemindersSummary and /Cancallation.
export const ReminderBatch = () => (
  <div style={{ width: 640 }}>
    <CreateLifecycleBatchForm variant="reminder" />
  </div>
);

export const CancellationBatch = () => (
  <div style={{ width: 640 }}>
    <CreateLifecycleBatchForm variant="cancellation" />
  </div>
);

export const Narrow = () => (
  <div style={{ width: 360 }}>
    <CreateLifecycleBatchForm variant="reminder" />
  </div>
);
