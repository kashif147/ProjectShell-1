import React from 'react'
import TableComponent from '../../component/common/TableComponent';

function RusterSummary() {
  const dataSource = [
    {
      key: "1", // Unique key for the row
      RosterID: "R001",
      regNo: "12345",
      forename: "John",
      surname: "Doe",
      fullName: "John Doe",
      StartDate: "2024-01-01",
      EndDate: "2024-01-07",
      Heading: "This is a detail heading",
      Detail: "Detailed information about the roster",
    },
    {
      key: "2",
      RosterID: "R002",
      regNo: "12346",
      forename: "Jane",
      surname: "Smith",
      fullName: "Jane Smith",
      StartDate: "2024-01-08",
      EndDate: "2024-01-14",
      Heading: "Another detail heading",
      Detail: "Further details about the roster",
    },
    {
      key: "3",
      RosterID: "R003",
      regNo: "12347",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
    {
      key: "4",
      RosterID: "R004",
      regNo: "12348",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
    {
      key: "5",
      RosterID: "R005",
      regNo: "12349",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
    {
      key: "6",
      RosterID: "R006",
      regNo: "12350",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
    {
      key: "7",
      RosterID: "R007",
      regNo: "12351",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
    {
      key: "8",
      RosterID: "R008",
      regNo: "12352",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
    {
      key: "9",
      RosterID: "R009",
      regNo: "12353",
      forename: "Alice",
      surname: "Brown",
      fullName: "Alice Brown",
      StartDate: "2024-01-15",
      EndDate: "2024-01-21",
      Heading: "Roster details heading",
      Detail: "Additional information regarding the roster",
    },
  ];
  return (
    <>
<TableComponent data={dataSource}  screenName="Roster" redirect="/Details" />
    </>
  )
}

export default RusterSummary