import moment from "moment"
export const tableData = [
  {
    id: 1,
    batchName: "Batch-2023-11",
    batchDate: moment("15/11/2023", "DD/MM/YYYY"), // ✅ Moment object
    batchStatus: "Pending",
    createdAt: moment("10/11/2023 09:30", "DD/MM/YYYY HH:mm"), // ✅ Moment object
    createdBy: "admin1",
    Count: 5,
    batchRef: "REF12345",
    Comments: "Monthly payments",
    PaymentType: "Demand Draft",

    members: [
      {
        id: 1,
        "Membership No": "M-1001",
        "Last name": "Last1",
        "First name": "First1",
        "Full name": "First1 Last1",
        "Value for Periods Selected": 5100,
      },
      {
        id: 2,
        "Membership No": "M-1002",
        "Last name": "Last2",
        "First name": "First2",
        "Full name": "First2 Last2",
        "Value for Periods Selected": 7200,
      },
    ],
  },
  {
    id: 2,
    batchName: "Batch-2023-11",
    batchDate: moment("15/11/2023", "DD/MM/YYYY"),
    batchStatus: "Approved",
    createdAt: moment("10/11/2023 10:15", "DD/MM/YYYY HH:mm"),
    createdBy: "admin2",
    Count: 3,
    PaymentType: "Bank Transfer",
    batchRef: "REF12345",
    Comments: "Monthly payments",

    members: [
      {
        id: 1,
        "Membership No": "M-2001",
        "Last name": "Last3",
        "First name": "First3",
        "Full name": "First3 Last3",
        "Value for Periods Selected": 6000,
      },
      {
        id: 2,
        "Membership No": "M-2002",
        "Last name": "Last4",
        "First name": "First4",
        "Full name": "First4 Last4",
        "Value for Periods Selected": 5400,
      },
    ],
  },
  {
    id: 3,
    batchName: "Batch-2023-12",
    batchDate: moment("01/12/2023", "DD/MM/YYYY"),
    batchStatus: "Rejected",
    createdAt: moment("28/11/2023 14:45", "DD/MM/YYYY HH:mm"),
    createdBy: "admin3",
    Count: 7,
    PaymentType: "Cheque",
    batchRef: "REF12345",
    Comments: "Monthly payments",

    members: [
      {
        id: 1,
        "Membership No": "M-3001",
        "Last name": "Last5",
        "First name": "First5",
        "Full name": "First5 Last5",
        "Value for Periods Selected": 8000,
      },
    ],
  },
];
