import React from 'react'
import TableComponent from '../../component/common/TableComponent'
function Members() {
  const membershipData = [
    {
      key: 1,
      personalDetails: {
        membershipNo: "M-1001",
        mobileNo: "+92-300-1234567",
      },
      user: {
        userFullName: "Ali Khan",
        userEmail: "ali.khan@example.com",
      },
      membershipStatus: "Active",
      membershipCategory: "Gold",
      professionalDetails: {
        workLocation: "Karachi Head Office",
        branch: "Clifton",
        region: "South",
        grade: "A1",
        primarySection: "Finance",
      },
      startDate: "2020-01-15",
      endDate: "2025-01-15",
      financialDetails: {
        lastPaymentAmount: "5000",
        lastPaymentDate: "2024-06-20",
        membershipFee: "10000",
        outstandingBalance: "5000",
      },
      reminderNo: "1",
      reminderDate: "2024-07-01",
      cancellationFlag: "No",
    },
    {
      key: 2,
      personalDetails: {
        membershipNo: "M-1002",
        mobileNo: "+92-321-9876543",
      },
      user: {
        userFullName: "Sara Ahmed",
        userEmail: "sara.ahmed@example.com",
      },
      membershipStatus: "Active",
      membershipCategory: "Silver",
      professionalDetails: {
        workLocation: "Lahore Office",
        branch: "Gulberg",
        region: "Central",
        grade: "B2",
        primarySection: "HR",
      },
      startDate: "2021-03-10",
      endDate: "2026-03-10",
      financialDetails: {
        lastPaymentAmount: "10000",
        lastPaymentDate: "2024-05-12",
        membershipFee: "12000",
        outstandingBalance: "2000",
      },
      reminderNo: "2",
      reminderDate: "2024-07-15",
      cancellationFlag: "No",
    },
    {
      key: 3,
      personalDetails: {
        membershipNo: "M-1003",
        mobileNo: "+92-333-5556677",
      },
      user: {
        userFullName: "Usman Raza",
        userEmail: "usman.raza@example.com",
      },
      membershipStatus: "Expired",
      membershipCategory: "Platinum",
      professionalDetails: {
        workLocation: "Islamabad Office",
        branch: "Blue Area",
        region: "North",
        grade: "C3",
        primarySection: "IT",
      },
      startDate: "2019-07-22",
      endDate: "2024-07-22",
      financialDetails: {
        lastPaymentAmount: "15000",
        lastPaymentDate: "2023-07-15",
        membershipFee: "20000",
        outstandingBalance: "5000",
      },
      reminderNo: "3",
      reminderDate: "2024-08-01",
      cancellationFlag: "Yes",
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
