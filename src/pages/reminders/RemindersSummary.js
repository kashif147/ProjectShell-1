import React from 'react'
import TableComponent from '../../component/common/TableComponent'
import { useView } from '../../context/ViewContext';
import RemindersCard from '../../RemindersCard';

function RemindersSummary() {
  const { viewMode } = useView();
       const tableData = [
            {
              "key": "1",
              "regNo": "45217A",
              "fullName": "Jack Smith",
              // ... (all existing fields remain unchanged) ...
              "stationPhone": "0946 744 188",
              // New reminder fields:
              "batchName": "Batch-2023-11",
              "batchDate": "15/11/2023",
              "batchStatus": "Pending",
              "createdAt": "10/11/2023 09:30",
              "createdBy": "admin1",
              "Count": 5
            },
            {
              "key": "2",
              "regNo": "93824B",
              "fullName": "Mary Johnson",
              // ... (all existing fields remain unchanged) ...
              "stationPhone": "1234 567 890",
              // New reminder fields:
              "batchName": "Batch-2023-11",
              "batchDate": "15/11/2023",
              "batchStatus": "Approved",
              "createdAt": "10/11/2023 10:15",
              "createdBy": "admin2",
              "Count": 3
            },
            // ... (all other records follow same pattern) ...
            {
              "key": "27",
              "regNo": "19463AA",
              "fullName": "Ethan Moore",
              // ... (all existing fields remain unchanged) ...
              "stationPhone": "0876 543 210",
              // New reminder fields:
              "batchName": "Batch-2023-12",
              "batchDate": "01/12/2023",
              "batchStatus": "Rejected",
              "createdAt": "28/11/2023 14:45",
              "createdBy": "admin3",
              "Count": 7
            }
          ];
  return (
    <div className='' >
      {
      viewMode?.reminder === "card" ?
    <TableComponent data={tableData}  screenName="Reminders" />
    :
     viewMode?.reminder === "grid"?
    <div className='me-4 ms-4 ps-1 pe-1 pb-4 mb-2 overflow-auto' style={{height:'80vh',backgroundColor:'rgba(253, 253, 253, 1)'}}>
      <RemindersCard />
      </div>
      :null
      }
    </div>
  )
}

export default RemindersSummary