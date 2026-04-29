import React from "react";
import TableComponent from "../../component/common/TableComponent";

function EventsSummary() {
  const events = [
    { key: "1", eventId: "EVT-001", eventName: "Annual Conference 2024", eventType: "Internal", createdBy: "John Doe", createdAt: "2024-01-15", status: "Active" },
    { key: "2", eventId: "EVT-002", eventName: "Technical Workshop", eventType: "Workshop", createdBy: "Jane Smith", createdAt: "2024-01-20", status: "Planning" },
    { key: "3", eventId: "EVT-003", eventName: "Team Building Event", eventType: "Internal", createdBy: "Alice Brown", createdAt: "2024-02-01", status: "Active" },
    { key: "4", eventId: "EVT-004", eventName: "Product Launch", eventType: "External", createdBy: "Bob Wilson", createdAt: "2024-02-05", status: "Review" },
    { key: "5", eventId: "EVT-005", eventName: "Training Session", eventType: "Workshop", createdBy: "Carol Davis", createdAt: "2024-02-10", status: "Canceled" },
    { key: "6", eventId: "EVT-006", eventName: "Quarterly Review", eventType: "Internal", createdBy: "David Lee", createdAt: "2024-02-15", status: "Planning" },
    { key: "7", eventId: "EVT-007", eventName: "Customer Appreciation Day", eventType: "External", createdBy: "Emma White", createdAt: "2024-02-20", status: "Active" },
    { key: "8", eventId: "EVT-008", eventName: "Leadership Workshop", eventType: "Workshop", createdBy: "Frank Miller", createdAt: "2024-02-25", status: "Active" },
  ];

  return (
    <div style={{ padding: "20px 0" }}>
      <TableComponent
        data={events}
        screenName="Events"
        isGrideLoading={false}
        selectionType="checkbox"
        enableRowSelection={true}
      />
    </div>
  );
}

export default EventsSummary;
