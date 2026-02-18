import React from 'react'
import TableComponent from '../../component/common/TableComponent'
function Members() {
  const membershipData = [
    {
      key: 1,
      MembershipNo: "M-1001",
      FullName: "Ali Khan",
      Email: "ali.khan@example.com",
      MobileNo: "+92-300-1234567",
      MembershipStatus: "Active",
      MembershipCategory: "Gold",
      WorkLocation: "Karachi Head Office",
      Branch: "Clifton",
      Region: "South",
      Grade: "A1",
      SectionPrimary: "Finance",
      JoiningDate: "2020-01-15",
      ExpiryDate: "2025-01-15",
      LastPaymentAmount: "5000",
      LastPaymentDate: "2024-06-20",
      MembershipFee: "10000",
      OutstandingBalance: "5000",
      ReminderNo: "1",
      ReminderDate: "2024-07-01",
      CancellationFlag: "No",
    },
    {
      key: 2,
      MembershipNo: "M-1002",
      FullName: "Sara Ahmed",
      Email: "sara.ahmed@example.com",
      MobileNo: "+92-321-9876543",
      MembershipStatus: "Active",
      MembershipCategory: "Silver",
      WorkLocation: "Lahore Office",
      Branch: "Gulberg",
      Region: "Central",
      Grade: "B2",
      SectionPrimary: "HR",
      JoiningDate: "2021-03-10",
      ExpiryDate: "2026-03-10",
      LastPaymentAmount: "10000",
      LastPaymentDate: "2024-05-12",
      MembershipFee: "12000",
      OutstandingBalance: "2000",
      ReminderNo: "2",
      ReminderDate: "2024-07-15",
      CancellationFlag: "No",
    },
    {
      key: 3,
      MembershipNo: "M-1003",
      FullName: "Usman Raza",
      Email: "usman.raza@example.com",
      MobileNo: "+92-333-5556677",
      MembershipStatus: "Expired",
      MembershipCategory: "Platinum",
      WorkLocation: "Islamabad Office",
      Branch: "Blue Area",
      Region: "North",
      Grade: "C3",
      SectionPrimary: "IT",
      JoiningDate: "2019-07-22",
      ExpiryDate: "2024-07-22",
      LastPaymentAmount: "15000",
      LastPaymentDate: "2023-07-15",
      MembershipFee: "20000",
      OutstandingBalance: "5000",
      ReminderNo: "3",
      ReminderDate: "2024-08-01",
      CancellationFlag: "Yes",
    },
  ];


  return (
    <div>
      <TableComponent
        screenName="Members"
        data={membershipData}
      />
    </div>
  )
}

export default Members
