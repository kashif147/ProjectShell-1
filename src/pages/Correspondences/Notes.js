import React from 'react';
import TableComponent from '../../component/common/TableComponent';

function Notes() {
  const notesData = [
    {
      key: "3",
      correspondenceID: "C003",
      regNo: "45219C",
      forename: "Emma",
      surname: "Wilson",
      methodOfContact: "Note",
      dateOfContact: "2024-10-08",
      duration: "N/A",
      details: "Internal note added about client concerns.",
      followUpNeeded: "Yes",
      followUpDate: "2024-10-15",
      status: "In Progress",
      nextStep: "Contact client for clarification.",
    },
    {
      key: "8",
      correspondenceID: "C008",
      regNo: "45224H",
      forename: "Liam",
      surname: "Anderson",
      methodOfContact: "Note",
      dateOfContact: "2024-10-20",
      duration: "N/A",
      details: "Supervisor note about case reassignment.",
      followUpNeeded: "No",
      followUpDate: "N/A",
      status: "Completed",
      nextStep: "Update case handler.",
    },
  ];

  return (
    <TableComponent
      screenName="Notes"
      data={notesData}
      redirect="/Details"
    />
  );
}

export default Notes;
