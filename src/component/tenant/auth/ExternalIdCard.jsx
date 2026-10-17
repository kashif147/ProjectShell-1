import React from "react";
import { Card, Tag } from "antd";

/** Microsoft Entra External ID: not implemented yet - information only, no controls. */
const ExternalIdCard = () => (
  <Card className="tenant-auth-card" title="Microsoft Entra External ID" data-testid="external-id-card">
    <div className="text-muted mb-2">Future member identity provider</div>
    <div>
      Status: <Tag>Not configured</Tag>
    </div>
  </Card>
);

export default ExternalIdCard;
