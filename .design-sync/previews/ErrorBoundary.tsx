import { ErrorBoundary, Card, Descriptions } from 'projectshell-crm';

const MemberSummary = () => (
  <Card title="Member summary" style={{ width: 420 }}>
    <Descriptions column={1} size="small">
      <Descriptions.Item label="Membership No">GRA-104233</Descriptions.Item>
      <Descriptions.Item label="Name">Siobhán Murphy</Descriptions.Item>
      <Descriptions.Item label="Station">Pearse Street</Descriptions.Item>
      <Descriptions.Item label="Category">General</Descriptions.Item>
    </Descriptions>
  </Card>
);

// The fallback the boundary shows once a child has thrown. To keep the page free of a real
// uncaught error, this cell starts the boundary in its caught state instead of throwing.
class CaughtErrorBoundary extends ErrorBoundary {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      hasError: true,
      isChunkError: false,
      error: new Error('Cannot read properties of undefined (reading "subscription")'),
    };
  }
}

// Healthy children pass straight through.
export const Healthy = () => (
  <ErrorBoundary>
    <MemberSummary />
  </ErrorBoundary>
);

// A render error in a child shows the 500 result with a Reload button
// (the fallback is height: 100vh, so it fills the card's viewport).
export const RenderError = () => (
  <div style={{ width: 640 }}>
    <CaughtErrorBoundary>
      <MemberSummary />
    </CaughtErrorBoundary>
  </div>
);
