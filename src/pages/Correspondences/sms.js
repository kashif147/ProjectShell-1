import React from 'react';
import TableComponent from '../../component/common/TableComponent';

function Sms() {
  const smsData = [
    {
      key: "1",
      correspondenceID: "C001",
      regNo: "45217A",
      forename: "Alice",
      surname: "Smith",
      methodOfContact: "SMS",
      dateOfContact: "2024-10-01",
      duration: "2 mins",
      details: "Sent reminder for upcoming appointment.",
      followUpNeeded: "No",
      followUpDate: "N/A",
      status: "Completed",
      nextStep: "None.",
    },
    {
      key: "5",
      correspondenceID: "C005",
      regNo: "45221E",
      forename: "David",
      surname: "Brown",
      methodOfContact: "SMS",
      dateOfContact: "2024-10-14",
      duration: "1 min",
      details: "Confirmation of received documents.",
      followUpNeeded: "No",
      followUpDate: "N/A",
      status: "Completed",
      nextStep: "File the documents.",
    },
    {
      key: "9",
      correspondenceID: "C009",
      regNo: "45225I",
      forename: "Sophia",
      surname: "Williams",
      methodOfContact: "SMS",
      dateOfContact: "2024-10-23",
      duration: "3 mins",
      details: "Notification about appointment reschedule.",
      followUpNeeded: "Yes",
      followUpDate: "2024-10-28",
      status: "Pending",
      nextStep: "Confirm new appointment.",
    },
  ];

  return (
    <TableComponent
      screenName="Sms"
      data={smsData}
      redirect="/Details"
    />
  );
}

export default Sms;
