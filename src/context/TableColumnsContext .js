import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { tableData } from "../Data";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegions } from "../features/RegionSlice";
import { getAllLookups } from "../features/LookupsSlice";
import { getContactTypes } from "../features/ContactTypeSlice";
import { convertToLocalTime } from "../utils/Utilities";

const TableColumnsContext = createContext();

// Static column configurations
const staticColumns = {
  Profile: [
    {
      dataIndex: "regNo",
      title: "Membership No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "fullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "email",
      title: "Email",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "mobileNo",
      title: "Mobile No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dob",
      title: "Date of Birth",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "gender",
      title: "Gender",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
    },
    {
      dataIndex: "address",
      title: "Address",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "notAtAddress",
      title: "Not at this Address",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
    {
      dataIndex: "membershipCategory",
      title: "Membership Category",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
    {
      dataIndex: "station",
      title: "Work Location",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "branch",
      title: "Branch",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "region",
      title: "Region",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "grade",
      title: "Grade",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "sectionPrimary",
      title: "Section (Primary)",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
    {
      dataIndex: "dateRetired",
      title: "Retired Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "pensionNo",
      title: "Pension Number",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "payrollNo",
      title: "Payroll No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "nmbiNo",
      title: "NMBI No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "speciality",
      title: "Speciality",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
    {
      dataIndex: "anotherUnionMember",
      title: "Another Union Member",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "consent",
      title: "Consent",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
    },
    {
      dataIndex: "incomeProtection",
      title: "Income Protection",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
    {
      dataIndex: "inmoRewards",
      title: "INMO Rewards",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
    {
      dataIndex: "partnerConsent",
      title: "Partner Consent",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
    },
  ],
  ChangCateSumm: [
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "Current Category",
      title: "Current Category",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "Change To",
      title: "Change To",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "fullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "rank",
      title: "Grade",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "station",
      title: "Work Location",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "distric",
      title: "Branch ",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "division",
      title: "Region",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "address",
      title: "Address",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "duty",
      title: "Duty",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "dob",
      title: "Date Of Birth",
      ellipsis: true,
      isGride: false,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateRetired",
      title: "Date Retired",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "dateAged65",
      title: "Date Aged 65",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateOfDeath",
      title: "Date Of Death",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "stationID",
      title: "Station ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "stationPhone",
      title: "Station Phone",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "pensionNo",
      title: "Pension No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "graMember",
      title: "GRA Member",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateJoined",
      title: "Date Joined",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateLeft",
      title: "Date Left",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "associateMember",
      title: "Associate Member",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "status",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "updated",
      title: "Updated",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
  ],
  Applications: [
    // 🔹 Top-Level Fields
    {
      dataIndex: "ApplicationId",
      title: "Application ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "applicationStatus",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
      editable: false,
    },
    {
      dataIndex: "createdAt",
      title: "Created At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 160,
      editable: false,
      render: (value) => (value ? convertToLocalTime(value) : "-"),
    },
    {
      dataIndex: "updatedAt",
      title: "Updated At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 160,
      editable: false,
      render: (value) => (value ? convertToLocalTime(value) : "-"),
    },

    // 🔹 Personal Info
    {
      dataIndex: ["personalDetails", "personalInfo", "title"],
      title: "Title",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "personalInfo", "forename"],
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "personalInfo", "surname"],
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "personalInfo", "gender"],
      title: "Gender",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "personalInfo", "dateOfBirth"],
      title: "Date of Birth",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 140,
      editable: true,
    },
    {
      dataIndex: [
        "personalDetails",
        "personalInfo",
        "countryPrimaryQualification",
      ],
      title: "Country of Qualification",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: true,
    },

    // 🔹 Contact Info
    {
      dataIndex: ["personalDetails", "contactInfo", "preferredAddress"],
      title: "Preferred Address",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 160,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "eircode"],
      title: "Eircode",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "buildingOrHouse"],
      title: "Building",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "streetOrRoad"],
      title: "Street",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "areaOrTown"],
      title: "Area/Town",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "countyCityOrPostCode"],
      title: "County/City/PostCode",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 180,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "country"],
      title: "Country",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "mobileNumber"],
      title: "Mobile",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "telephoneNumber"],
      title: "Telephone",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "personalEmail"],
      title: "Personal Email",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "workEmail"],
      title: "Work Email",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: true,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "consentSMS"],
      title: "Consent SMS",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
      editable: false,
    },
    {
      dataIndex: ["personalDetails", "contactInfo", "consentEmail"],
      title: "Consent Email",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
      editable: false,
    },

    // 🔹 Approval Info
    {
      dataIndex: ["personalDetails", "approvalDetails", "approvedBy"],
      title: "Approved By",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: false,
    },
    {
      dataIndex: ["personalDetails", "approvalDetails", "approvedAt"],
      title: "Approved At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 160,
      editable: false,
      render: (value) => (value ? convertToLocalTime(value) : "-"),
    },
  ],
  Cases: [
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "fullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "rank",
      title: "Grade",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "station",
      title: "Station",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "distric",
      title: "District",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "division",
      title: "Division",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "duty",
      title: "Duty",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Case Type",
      title: "Case Type",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Case ID",
      title: "Case ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Case Title",
      title: "Case Title",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Incident detail",
      title: "Incident detail",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 300,
    },
    {
      dataIndex: "Incident Date",
      title: "Incident Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "case Status",
      title: "case Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Assignee",
      title: "Assignee",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Assignee",
      title: "Assignee",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
  ],
  Claims: [
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "fullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "claimNo",
      title: "Claim No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "claimType",
      title: "ClaimType",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "startDate",
      title: "Start Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "endDate",
      title: "End Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "noOfDays_used",
      title: "No Of Days_used",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 120,
    },
    {
      dataIndex: "description",
      title: "Description",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
  ],
  Transfer: [
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
      editable: true,
    },
    {
      dataIndex: "currentStation",
      title: "Current Station",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "requestedStation",
      title: "Requested Station",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "transferReason",
      title: "Transfer Reason",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "transferDate",
      title: "Transfer Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "approvalStatus",
      title: "Approval Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "address",
      title: "Address",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
    {
      dataIndex: "duty",
      title: "Duty",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
  ],
  Correspondence: [
    {
      dataIndex: "correspondenceID",
      title: "Correspondence ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "methodOfContact",
      title: "Method of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateOfContact",
      title: "Date of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "duration",
      title: "Duration",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "details",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 400,
    },
    {
      dataIndex: "followUpNeeded",
      title: "Follow-up Needed",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "followUpDate",
      title: "Follow-up Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "status",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "nextStep",
      title: "Next Step",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
  ],
  Sms: [
    {
      dataIndex: "correspondenceID",
      title: "Correspondence ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "methodOfContact",
      title: "Method of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateOfContact",
      title: "Date of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "duration",
      title: "Duration",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "details",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 400,
    },
    {
      dataIndex: "followUpNeeded",
      title: "Follow-up Needed",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "followUpDate",
      title: "Follow-up Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "status",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "nextStep",
      title: "Next Step",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
  ],
  Emails: [
    {
      dataIndex: "correspondenceID",
      title: "Correspondence ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "methodOfContact",
      title: "Method of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateOfContact",
      title: "Date of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "duration",
      title: "Duration",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "details",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 400,
    },
    {
      dataIndex: "followUpNeeded",
      title: "Follow-up Needed",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "followUpDate",
      title: "Follow-up Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "status",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "nextStep",
      title: "Next Step",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
  ],
  Notes: [
    {
      dataIndex: "correspondenceID",
      title: "Correspondence ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "methodOfContact",
      title: "Method of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateOfContact",
      title: "Date of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "duration",
      title: "Duration",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "details",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 400,
    },
    {
      dataIndex: "followUpNeeded",
      title: "Follow-up Needed",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "followUpDate",
      title: "Follow-up Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "status",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "nextStep",
      title: "Next Step",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
  ],
  CorrespondencesSummary: [
    {
      dataIndex: "correspondenceID",
      title: "Correspondence ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "methodOfContact",
      title: "Method of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "dateOfContact",
      title: "Date of Contact",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "duration",
      title: "Duration",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "details",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 400,
    },
    {
      dataIndex: "followUpNeeded",
      title: "Follow-up Needed",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "followUpDate",
      title: "Follow-up Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "status",
      title: "Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "nextStep",
      title: "Next Step",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
    },
  ],
  Roster: [
    {
      dataIndex: "RosterID",
      title: "Roster ID",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "regNo",
      title: "Reg No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "fullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "forename",
      title: "Forename",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "surname",
      title: "Surname",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "StartDate",
      title: "StartDate",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "EndDate",
      title: "End Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Heading",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Heading",
      title: "Details",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 400,
    },
  ],
  Reminders: [
    {
      dataIndex: "batchName",
      title: "Batch Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchDate",
      title: "Batch Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchStatus",
      title: "Batch Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdAt",
      title: "Created At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdBy",
      title: "Created By",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Count",
      title: "Count",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
    },
    {
      title: "Action",
      dataIndex: "action",
      width: 120,
      render: (_, record) => (
        <div className="action-buttons">
          <button>Approve</button>
          <button>Reject</button>
        </div>
      ),
    },
  ],
  Cancallation: [
    {
      dataIndex: "batchName",
      title: "Batch Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchDate",
      title: "Batch Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchStatus",
      title: "Batch Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdAt",
      title: "Created At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdBy",
      title: "Created By",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Count",
      title: "Count",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
    },
  ],
  CornGrideSummary: [
    {
      dataIndex: "batchName",
      title: "Batch Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchDate",
      title: "Batch Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchStatus",
      title: "Batch Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdAt",
      title: "Created At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdBy",
      title: "Created By",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Count",
      title: "Count",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
    },
  ],
  Batches: [
    {
      dataIndex: "batchName",
      title: "Batch Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchDate",
      title: "Batch Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "batchStatus",
      title: "Batch Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "PaymentType",
      title: "Payment Type",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdAt",
      title: "Created At",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "createdBy",
      title: "Created By",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
  ],
  Popout: [
    {
      dataIndex: "code",
      title: "Code",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "lookupname",
      title: "Work Location",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "DisplayName",
      title: "Display Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Parentlookup",
      title: "Branch",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
  ],

  BatchMemberSummary: [
    {
      dataIndex: "fullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Member Name",
      title: "Member Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Bank Account",
      title: "Bank Account",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Payroll No",
      title: "Payroll No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Arrears",
      title: "Arrears",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Comments",
      title: "Comments",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 150,
    },
    {
      dataIndex: "Advance",
      title: "Advance",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
    },
    {
      dataIndex: "Total Amount",
      title: "Total Amount",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 100,
    },
    // { dataIndex: "createdBy", title: "Created By", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    // { dataIndex: "Count", title: "Count", ellipsis: true, isGride: true, isVisible: true, width: 100 },
  ],
  members: [
    {
      dataIndex: "MembershipNo",
      title: "Membership No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "FullName",
      title: "Full Name",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "Email",
      title: "Email",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "MobileNo",
      title: "Mobile No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "MembershipStatus",
      title: "Membership Status",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "MembershipCategory",
      title: "Membership Category",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "WorkLocation",
      title: "Work Location",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "Branch",
      title: "Branch",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "Region",
      title: "Region",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "Grade",
      title: "Grade",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "SectionPrimary",
      title: "Section (Primary)",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "JoiningDate",
      title: "Joining Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "ExpiryDate",
      title: "Expiry Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "LastPaymentAmount",
      title: "Last Payment Amount",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "LastPaymentDate",
      title: "Last Payment Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "MembershipFee",
      title: "Membership Fee",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "OutstandingBalance",
      title: "Outstanding Balance",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "ReminderNo",
      title: "Reminder No",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "ReminderDate",
      title: "Reminder Date",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
    {
      dataIndex: "CancellationFlag",
      title: "Cancellation Flag",
      ellipsis: true,
      isGride: true,
      isVisible: true,
      width: 200,
      editable: false,
    },
  ],
};

const staticSearchFilters = {
  Profile: [
    {
      titleColumn: "Membership No",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Full Name",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Email",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Mobile No",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Date of Birth",
      isSearch: false,
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "Gender",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: {} },
    {
      titleColumn: "NaTA",
      isSearch: false,
      isCheck: true,
      lookups: { "Not at this Adress": false },
    },
    {
      titleColumn: "Membership Category",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Work Location",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Branch",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Region",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Section (Primary)",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Retired Date",
      isSearch: false,
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "Pension Number",
      isSearch: false,
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "Payroll No",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "NMBI No",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Speciality",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Another Union Member",
      isSearch: false,
      isCheck: true,
      lookups: { "Another Union Member": false },
    },
    {
      titleColumn: "Consent",
      isSearch: false,
      isCheck: true,
      lookups: { Consent: false },
    },
    {
      titleColumn: "Income Protection",
      isSearch: false,
      isCheck: true,
      lookups: { "Income Protection": false },
    },
    {
      titleColumn: "INMO Rewards",
      isSearch: false,
      isCheck: true,
      lookups: { "INMO Rewards": false },
    },
    {
      titleColumn: "Partner Consent",
      isSearch: false,
      isCheck: true,
      lookups: { "Partner Consent": false },
    },
  ],
  Cases: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Region",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Claims: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Correspondence: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Emails: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Notes: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Sms: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  CorrespondencesSummary: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Transfer: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Roster: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      lookups: { "All Ranks": false, "0001": false, "0021": false },
      comp: "!=",
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: { "All Duties": false, Sargent: false, Garda: false },
    },
    {
      titleColumn: "Division",
      isSearch: true,
      isCheck: false,
      lookups: {
        "All Divisions": false,
        Northland: false,
        Southland: false,
        Eastland: false,
      },
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Applications: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Work Location",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "Region",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: true,
      isCheck: false,
      lookups: {
        submitted: false,
        approved: false,
        rejected: false,
        "in-progress": true,
      },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  ChangCateSumm: [
    {
      titleColumn: "Grade",
      isSearch: true,
      isCheck: false,
      comp: "!=",
      lookups: {},
    },
    {
      titleColumn: "Duty",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "Division",
      isSearch: true,
      comp: "!=",
      isCheck: false,
      lookups: {},
    },
    {
      titleColumn: "District",
      isSearch: true,
      isCheck: false,
      lookups: { "All District": false },
    },
    {
      titleColumn: "Station",
      isSearch: true,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station ID",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Pensioner",
      isSearch: false,
      isCheck: false,
      lookups: { Pensioner: false },
    },
    {
      titleColumn: "Date Of Birth",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Retired",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Aged 65",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Of Death",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Station Phone",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Distric Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Distric Rep": false },
    },
    {
      titleColumn: "Division Rep",
      isSearch: false,
      isCheck: false,
      lookups: { "Division Rep": false },
    },
    {
      titleColumn: "Pension No",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "GRA Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Joined",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Date Left",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Associate Member",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Address",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
    {
      titleColumn: "Status",
      isSearch: true,
      isCheck: false,
      lookups: { Inprogress: true, Pending: true, Rejected: true },
    },
    {
      titleColumn: "Updated",
      isSearch: false,
      isCheck: false,
      lookups: { Male: false, Female: false, Other: false },
    },
  ],
  Reminders: [
    { titleColumn: "Batch Name", isSearch: true, isCheck: true, lookups: {} },
    { titleColumn: "Batch Date", isSearch: true, isCheck: true, lookups: {} },
    {
      titleColumn: "Batch Status",
      isSearch: true,
      isCheck: true,
      lookups: {
        "In Progress": false,
        Pending: true,
        Approve: false,
        Reject: false,
      },
    },
    { titleColumn: "Created At", isSearch: true, isCheck: false, lookups: {} },
    { titleColumn: "Created By", isSearch: true, isCheck: false, lookups: {} },
    { titleColumn: "Count", isSearch: false, isCheck: false, lookups: {} },
    {
      titleColumn: "Action",
      isSearch: false,
      isCheck: false,
      lookups: {},
    },
  ],
  Cancallation: [
    { titleColumn: "Batch Name", isSearch: true, isCheck: true, lookups: {} },
    { titleColumn: "Batch Date", isSearch: true, isCheck: true, lookups: {} },
    {
      titleColumn: "Batch Status",
      isSearch: true,
      isCheck: true,
      lookups: {
        "In Progress": false,
        Pending: true,
        Approve: false,
        Reject: false,
      },
    },
    { titleColumn: "Created At", isSearch: true, isCheck: false, lookups: {} },
    { titleColumn: "Created By", isSearch: true, isCheck: false, lookups: {} },
    { titleColumn: "Count", isSearch: false, isCheck: false, lookups: {} },
    {
      titleColumn: "Action",
      isSearch: false,
      isCheck: false,
      lookups: {},
    },
  ],
  Batches: [
    { titleColumn: "Batch Name", isSearch: true, isCheck: true, lookups: {} },
    { titleColumn: "Batch Date", isSearch: true, isCheck: true, lookups: {} },
    {
      titleColumn: "Batch Status",
      isSearch: true,
      isCheck: true,
      lookups: {
        "In Progress": false,
        Pending: true,
        Approve: false,
        Reject: false,
      },
    },
    { titleColumn: "Created At", isSearch: true, isCheck: false, lookups: {} },
    { titleColumn: "Created By", isSearch: true, isCheck: false, lookups: {} },
    { titleColumn: "Count", isSearch: false, isCheck: false, lookups: {} },
    {
      titleColumn: "Action",
      isSearch: false,
      isCheck: false,
      lookups: {},
    },
  ],
  Popout: [
    {
      titleColumn: "Code",
      isSearch: true,
      isCheck: false,
      lookups: {},
      comp: "==",
    },
    {
      titleColumn: "Work Location",
      isSearch: true,
      isCheck: false,
      lookups: {},
      comp: "==",
    },
    {
      titleColumn: "Display Name",
      isSearch: true,
      isCheck: false,
      lookups: {},
      comp: "==",
    },
    {
      titleColumn: "Branch",
      isSearch: true,
      isCheck: false,
      lookups: {},
      comp: "==",
    },
  ],
};

export const TableColumnsProvider = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const screenName = location?.state?.search;
  const [claimsDrawer, setClaimsDrawer] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [lookupsData, setLookupsData] = useState({
    Duties: [],
    MaritalStatus: [],
    Ranks: [],
    Titles: [],
  });
  const [menuLbl, setmenuLbl] = useState({
    Subscriptions: false,
    Finance: false,
    Correspondence: false,
    Issues: false,
    Events: false,
    Courses: false,
    "Professional Development": false,
    Settings: false,
  });

  const updateMenuLbl = useCallback((key, value) => {
    setmenuLbl((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const [report, setReport] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [ProfileDetails, setProfileDetails] = useState([]);
  const [rowIndex, setRowIndex] = useState(0);
  const [topSearchData, setTopSearchData] = useState();
  const [ReportsTitle, setReportsTitle] = useState([]);

  // Redux selectors
  const { regions, loading } = useSelector((state) => state.regions);
  const { lookups, lookupsloading } = useSelector((state) => state.lookups);
  const { contactTypes, contactTypesloading, error } = useSelector(
    (state) => state.contactType
  );

  // Derived state
  const [columns, setColumns] = useState(staticColumns);
  const [gridData, setGridData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState(staticSearchFilters);
  const [lookupsForSelect, setLookupsForSelect] = useState({
    Duties: [],
    MaritalStatus: [],
    Ranks: [],
    Titles: [],
  });
  const [selectLokups, setSelectLokups] = useState({
    Provinces: [],
    Counteries: [],
    Divisions: [],
    Districts: [],
    Stations: [],
    contactTypes: [],
  });
  const [regionLookups, setRegionLookups] = useState({
    gender: [],
    SpokenLanguages: [],
    Provinces: [],
    county: [],
    Divisions: [],
    Districts: [],
    Cities: [],
    Titles: [],
    Stations: [],
  });
  const addColumnToSection = (sectionKey, newColumn) => {
    setColumns((prev) => {
      const updated = { ...prev };
      if (updated[sectionKey]) {
        updated[sectionKey] = [...updated[sectionKey], newColumn];
      }
      return updated;
    });
  };

  // const filteredSearchFilters = useMemo(() => [
  //   { titleColumn: "Grade", isCheck: true },
  //   { titleColumn: "Work Location", isCheck: true },
  //   { titleColumn: "Region", isCheck: true },
  //   // { titleColumn: "Status", isCheck: true },
  //   { titleColumn: "District222", isCheck: false },
  //   { titleColumn: "Station", isCheck: false },
  //   { titleColumn: "Station ID", isCheck: false },
  //   { titleColumn: "Pensioner", isCheck: false },
  //   { titleColumn: "Date Of Birth", isCheck: false },
  //   { titleColumn: "Date Retired", isCheck: false },
  //   { titleColumn: "Date Aged 65", isCheck: false },
  //   { titleColumn: "Date Of Death", isCheck: false },
  //   { titleColumn: "Station Phone", isCheck: false },
  //   { titleColumn: "Distric Rep", isCheck: false },
  //   { titleColumn: "Division Rep", isCheck: false },
  //   { titleColumn: "Pension No", isCheck: false },
  //   { titleColumn: "GRA Member", isCheck: false },
  //   { titleColumn: "Date Joined", isCheck: false },
  //   { titleColumn: "Date Left", isCheck: false },
  //   { titleColumn: "Associate Member", isCheck: false },
  //   { titleColumn: "Address", isCheck: false },
  //   // { titleColumn: "Status", isCheck: false },
  //   { titleColumn: "Updated", isCheck: false },
  // ], []);

  const filteredSearchFilters = useMemo(
    () => [
      { titleColumn: "Grade", isCheck: true },
      { titleColumn: "Work Location", isCheck: true },
      { titleColumn: "Region", isCheck: true },
      { titleColumn: "Branch", isCheck: true },
      { titleColumn: "Gender", isCheck: false },
      { titleColumn: "Date of Birth", isCheck: false },
      { titleColumn: "NaTA", isCheck: false },
      // { titleColumn: "Membership No", isCheck: true },
      // { titleColumn: "Full Name", isCheck: true },
      // { titleColumn: "Email", isCheck: true },
      // { titleColumn: "Mobile No", isCheck: true },
      // { titleColumn: "Address", isCheck: true },
      { titleColumn: "Membership Category", isCheck: false },
      { titleColumn: "Section (Primary)", isCheck: false },
      { titleColumn: "Retired Date", isCheck: false },
      { titleColumn: "Pension Number", isCheck: false },
      { titleColumn: "Payroll No", isCheck: false },
      { titleColumn: "NMBI No", isCheck: false },
      { titleColumn: "Speciality", isCheck: false },
      { titleColumn: "Another Union Member", isCheck: false },
      { titleColumn: "Consent", isCheck: false },
      { titleColumn: "Income Protection", isCheck: false },
      { titleColumn: "INMO Rewards", isCheck: false },
      { titleColumn: "Partner Consent", isCheck: false },
      { titleColumn: "Partner Consent", isCheck: false },
    ],
    []
  );

  const resetFtn = () => {
    setGlobleFilters(filteredSearchFilters);
  };
  const [globleFilters, setGlobleFilters] = useState(filteredSearchFilters);

  // Handlers and functions
  const handlClaimDrawerChng = useCallback(() => {
    setClaimsDrawer((prev) => !prev);
  }, []);

  const handleSaveAfterEdit = useCallback((row) => {
    setGridData((prevData) => {
      const index = prevData.findIndex((item) => row.key === item.key);
      if (index > -1) {
        const newData = [...prevData];
        newData[index] = { ...newData[index], ...row };
        return newData;
      }
      return prevData;
    });
  }, []);

  const disableFtn = useCallback((value) => {
    setIsDisable(value);
  }, []);

  const isSaveChng = useCallback((value) => {
    setIsSave(value);
  }, []);

  const handleSave = useCallback(
    (name) => {
      setReport((prevReport) => ({
        ...prevReport,
        [name]: searchFilters[screenName],
      }));

      setSearchFilters((prevFilters) => ({
        ...prevFilters,
        [name]: prevFilters[screenName].map((filter) => ({
          ...filter,
          reportData: prevFilters[name] ? prevFilters[name] : [],
        })),
      }));
    },
    [screenName, searchFilters]
  );

  const updateCompByTitleColumn = useCallback(
    (titleColumn, newComp) => {
      setSearchFilters((prevFilters) => {
        const filtersForScreen = Array.isArray(prevFilters[screenName])
          ? prevFilters[screenName]
          : [];
        const updatedFilters = filtersForScreen.map((filter) => {
          if (filter.titleColumn === titleColumn) {
            return { ...filter, comp: newComp };
          }
          return filter;
        });
        return {
          ...prevFilters,
          [screenName]: updatedFilters,
        };
      });
    },
    [screenName]
  );

  const handleCheckboxFilterChange = useCallback(
    (key, isChecked, screenName, width, e) => {
      e.stopPropagation();
      setColumns((prevColumns) => ({
        ...prevColumns,
        [screenName]: prevColumns[screenName].map((column) =>
          column.title === key
            ? { ...column, isGride: isChecked, width }
            : column
        ),
      }));
    },
    []
  );

  const updateSelectedTitles = useCallback((title, isChecked) => {
    setGlobleFilters((prevFilters) =>
      prevFilters.map((item) =>
        item.titleColumn === title ? { ...item, isCheck: isChecked } : item
      )
    );
  }, []);

  const updateLookupValue = useCallback(
    (titleColumn, gender, value) => {
      setSearchFilters((prevFilters) => {
        const filtersForScreen = Array.isArray(prevFilters[screenName])
          ? prevFilters[screenName]
          : [];
        const updatedFilters = filtersForScreen.map((filter) => {
          if (filter.titleColumn === titleColumn) {
            return {
              ...filter,
              lookups: {
                ...filter.lookups,
                [gender]: value,
              },
            };
          }
          return filter;
        });
        return {
          ...prevFilters,
          [screenName]: updatedFilters,
        };
      });
    },
    [screenName]
  );

  const filterGridDataFtn = useCallback((columnName, value, comp) => {
    if (value === "All Ranks" && comp === "=") {
      return setGridData(tableData);
    }
    if (value === "All Ranks" && comp === "!=") {
      return setGridData([]);
    }
    if (columnName && value && comp) {
      const filteredData = tableData.filter((row) => {
        const cellValue = row[columnName]?.toString().toLowerCase();
        switch (comp) {
          case "=":
            return cellValue === value.toLowerCase();
          case "!=":
            return cellValue !== value.toLowerCase();
          default:
            return false;
        }
      });
      setGridData(filteredData);
    } else {
      setGridData(tableData);
    }
  }, []);

  const handleCompChang = useCallback(
    (title, value) => {
      setSearchFilters((prevProfile) =>
        prevProfile.map((item) =>
          item?.titleColumn === title ? { ...item, comp: value } : item
        )
      );
      filterGridDataFtn();
    },
    [filterGridDataFtn]
  );

  const getProfile = useCallback((row, index) => {
    setProfileDetails(row);
    setRowIndex(index);
  }, []);

  const profilNextBtnFtn = () => {
    const newIndex = rowIndex + 1;
    const filteredData = gridData?.filter((_, index) => index === newIndex);
    setProfileDetails(filteredData);
    setRowIndex(newIndex);
  };

  const profilPrevBtnFtn = useCallback(() => {
    setRowIndex((prevIndex) => {
      const newIndex = prevIndex - 1;
      const filteredData = gridData?.filter((_, index) => index === newIndex);
      setProfileDetails(filteredData);
      return newIndex;
    });
  }, [gridData]);

  const filterByRegNo = useCallback(
    async (regNo) => {
      const data = gridData?.filter((item) => item.regNo === regNo);
      await getProfile(data);
    },
    [gridData, getProfile]
  );

  const resetFilters = useCallback(() => {
    setSearchFilters((prev) => {
      const filtersForScreen = prev[screenName];
      if (Array.isArray(filtersForScreen)) {
        const updatedFilters = filtersForScreen.map((filter) => ({
          ...filter,
          comp: "!=",
          lookups: Object.keys(filter.lookups).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {}),
        }));
        return {
          ...prev,
          [screenName]: updatedFilters,
        };
      }
      return prev;
    });
  }, []);

  const extractMainKeys = useCallback(() => {
    if (!report || typeof report !== "object") return [];
    return Object.keys(report);
  }, [report]);

  // Effects
  useEffect(() => {
    dispatch(getContactTypes());
    dispatch(fetchRegions());
    dispatch(getAllLookups());
  }, [dispatch]);

  useEffect(() => {
    if (report) {
      setReportsTitle(extractMainKeys());
    }
  }, [report, extractMainKeys]);

  // Region lookups processing
  const filterRegions = useCallback(
    (key, value, parentKey = null, parentValue = null) =>
      regions?.filter(
        (item) =>
          item[key] === value && (!parentKey || item[parentKey] === parentValue)
      ) || [],
    [regions]
  );

  const transformLookupData = useCallback(
    (data) =>
      data?.map((item) => ({
        key: item?._id,
        label: item?.RegionName,
      })) || [],
    []
  );

  useEffect(() => {
    if (!Array.isArray(regions)) return;

    setRegionLookups((prevState) => ({
      ...prevState,
      Provinces: filterRegions("lookuptypeId?._id", "67f5945517f0ecf3dbf79db4"),
      county: filterRegions(
        "lookuptypeId?._id",
        "67f5971f17f0ecf3dbf79df6",
        "ParentRegion",
        ""
      ),
      Divisions: filterRegions("lookuptypeId?._id", "67f5990b17f0ecf3dbf79e35"),
      Districts: filterRegions("lookuptypeId?._id", "67f626ed17f0ecf3dbf79ed1"),
      Cities: filterRegions("lookuptypeId?._id", "67f6282f17f0ecf3dbf79ef8"),
      Stations: filterRegions("lookuptypeId?._id", "67f6297617f0ecf3dbf79f12"),
    }));
  }, [regions, filterRegions]);

  useEffect(() => {
    setSelectLokups((prevState) => ({
      ...prevState,
      Provinces: transformLookupData(regionLookups?.Provinces),
      Counteries: transformLookupData(regionLookups?.county),
      Divisions: transformLookupData(regionLookups?.Divisions),
      Districts: transformLookupData(regionLookups?.Districts),
      Stations: transformLookupData(regionLookups?.Stations),
    }));
  }, [regionLookups, transformLookupData]);

  // General lookups processing
  useEffect(() => {
    if (lookups && Array.isArray(lookups)) {
      const lookupTypes = {
        gender: "68c85f21302e5600dc8477da",
        Duties: "68c85f22302e5600dc847805",
        MaritalStatus: "68c85f21302e5600dc8477e1",
        Titles: "68c85f21302e5600dc8477d6",
        Ranks: "68c85f22302e5600dc847809",
      };

      const updatedLookups = Object.keys(lookupTypes).reduce((acc, key) => {
        acc[key] = lookups.filter(
          (item) => item?.lookuptypeId?._id === lookupTypes[key]
        );
        return acc;
      }, {});

      setLookupsData((prevState) => ({ ...prevState, ...updatedLookups }));
    }
  }, [lookups]);

  useEffect(() => {
    if (lookupsData) {
      const transformedData = ["Duties", "Ranks", "Titles", "gender"].reduce(
        (acc, key) => {
          if (lookupsData[key]) {
            acc[key] = lookupsData[key].map((item) => ({
              key: item?._id,
              label: item?.lookupname,
            }));
          }
          return acc;
        },
        {}
      );
      setLookupsForSelect((prevState) => ({
        ...prevState,
        ...transformedData,
      }));
    }
  }, [lookupsData]);

  useEffect(() => {
    if (contactTypes) {
      const transformedData = contactTypes.map((item) => ({
        key: item?._id,
        label: item?.ContactType,
      }));

      setSelectLokups((prevState) => ({
        ...prevState,
        contactTypes: transformedData,
      }));
    }
  }, [contactTypes]);

  // Filter data effect
  const getFiltersWithTrueLookups = useCallback(
    (filters) => {
      const relevantFilters = filters[screenName] || [];
      return relevantFilters
        .filter((filter) =>
          Object.values(filter.lookups).some((value) => value === true)
        )
        .map((filter) => ({
          titleColumn: filter.titleColumn,
          isSearch: filter.isSearch,
          isCheck: filter.isCheck,
          lookups: filter.lookups,
          comp: filter.comp,
        }));
    },
    [screenName]
  );

  const filterData = useCallback(() => {
    const yy = getFiltersWithTrueLookups(searchFilters);
    return tableData?.filter((item) => {
      return yy?.every((filter) => {
        const { titleColumn, lookups, comp } = filter;
        const itemValue = item[titleColumn.toLowerCase()];
        if (comp === "=") {
          return lookups[itemValue] === true;
        } else if (comp === "!=") {
          return lookups[itemValue] !== true;
        }
        return false;
      });
    });
  }, [searchFilters, getFiltersWithTrueLookups]);

  useEffect(() => {
    if (searchFilters) {
      setGridData(filterData());
    }
  }, [searchFilters, location?.pathname, filterData]);

  // Update search filters when lookups change
  const updateSearchFilters = useCallback(
    (lookupKey, titleColumn) => {
      if (!lookupsForSelect?.[lookupKey]?.length) return;

      setSearchFilters((prevState) => ({
        ...prevState,
        Profile: prevState.Profile.map((item) =>
          item.titleColumn === titleColumn
            ? {
                ...item,
                lookups: lookupsForSelect[lookupKey].reduce((acc, entry) => {
                  acc[entry.label] = false;
                  return acc;
                }, {}),
              }
            : item
        ),
      }));
    },
    [lookupsForSelect]
  );

  useEffect(() => {
    updateSearchFilters("Ranks", "Grade");
    updateSearchFilters("Duties", "Work Location");
  }, [lookupsForSelect?.Ranks, lookupsForSelect?.Duties, updateSearchFilters]);

  useEffect(() => {
    if (!selectLokups?.Divisions?.length) return;

    setSearchFilters((prevState) => ({
      ...prevState,
      Profile: prevState.Profile.map((item) =>
        item.titleColumn === "Division"
          ? {
              ...item,
              lookups: selectLokups.Divisions.reduce((acc, division) => {
                acc[division.label] = false;
                return acc;
              }, {}),
            }
          : item
      ),
    }));
  }, [selectLokups?.Divisions]);

  // Context value
  const contextValue = useMemo(
    () => ({
      columns,
      updateColumns: () => {},
      state: { selectedOption: "!=", checkboxes: {} },
      setState: () => {},
      updateState: () => {},
      gridData,
      handleCheckboxFilterChange,
      addColumnToSection,
      searchFilters,
      updateSelectedTitles,
      updateLookupValue,
      filterGridDataFtn,
      handleCompChang,
      setGridData,
      updateCompByTitleColumn,
      ProfileDetails,
      getProfile,
      handlClaimDrawerChng,
      claimsDrawer,
      filterByRegNo,
      topSearchData,
      resetFilters,
      isSaveChng,
      handleSave,
      report,
      ReportsTitle,
      rowIndex,
      profilNextBtnFtn,
      profilPrevBtnFtn,
      globleFilters,
      regionLookups,
      selectLokups,
      lookupsData,
      lookupsForSelect,
      disableFtn,
      isDisable,
      handleSaveAfterEdit,
      resetFtn,
      menuLbl,
      updateMenuLbl,
    }),
    [
      columns,
      gridData,
      handleCheckboxFilterChange,
      searchFilters,
      updateSelectedTitles,
      updateLookupValue,
      filterGridDataFtn,
      handleCompChang,
      updateCompByTitleColumn,
      ProfileDetails,
      getProfile,
      handlClaimDrawerChng,
      claimsDrawer,
      filterByRegNo,
      topSearchData,
      resetFilters,
      isSaveChng,
      handleSave,
      report,
      ReportsTitle,
      rowIndex,
      profilNextBtnFtn,
      profilPrevBtnFtn,
      globleFilters,
      regionLookups,
      selectLokups,
      lookupsData,
      lookupsForSelect,
      disableFtn,
      isDisable,
      handleSaveAfterEdit,
      resetFtn,
      menuLbl,
      updateMenuLbl,
      addColumnToSection,
    ]
  );

  return (
    <TableColumnsContext.Provider value={contextValue}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
