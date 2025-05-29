import React from 'react';
import TableComponent from '../../component/common/TableComponent';

function Emails() {
  const emailData = [
    {
      key: "2",
      correspondenceID: "C002",
      regNo: "45218B",
      forename: "John",
      surname: "Doe",
      methodOfContact: "Email",
      dateOfContact: "2024-10-05",
      duration: "N/A",
      details: "Sent the report for review.",
      followUpNeeded: "No",
      followUpDate: "N/A",
      status: "Pending",
      nextStep: "Wait for feedback.",
    },
    {
      key: "4",
      correspondenceID: "C004",
      regNo: "45220D",
      forename: "Charlie",
      surname: "Johnson",
      methodOfContact: "Email",
      dateOfContact: "2024-10-12",
      duration: "15 mins",
      details: "Discussed case updates and future action.",
      followUpNeeded: "Yes",
      followUpDate: "2024-10-22",
      status: "Completed",
      nextStep: "Schedule follow-up meeting.",
    },
    {
      key: "7",
      correspondenceID: "C007",
      regNo: "45223G",
      forename: "Olivia",
      surname: "Taylor",
      methodOfContact: "Email",
      dateOfContact: "2024-10-18",
      duration: "5 mins",
      details: "Follow-up email for status update on investigation.",
      followUpNeeded: "No",
      followUpDate: "N/A",
      status: "Completed",
      nextStep: "None.",
    },
    {
      key: "10",
      correspondenceID: "C010",
      regNo: "45226J",
      forename: "James",
      surname: "Moore",
      methodOfContact: "Email",
      dateOfContact: "2024-10-25",
      duration: "10 mins",
      details: "Urgent email regarding case closure and action plan.",
      followUpNeeded: "Yes",
      followUpDate: "2024-10-30",
      status: "Completed",
      nextStep: "Finalize case closure.",
    },
  ];

  return (
    <TableComponent
      screenName="Emails"
      data={emailData}
      redirect="/Details"
    />
  );
}

export default Emails;
