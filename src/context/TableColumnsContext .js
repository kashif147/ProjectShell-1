import React, { createContext, useContext, useEffect, useState } from "react";
import { tableData } from "../Data";
import { useLocation } from "react-router-dom";

const TableColumnsContext = createContext();

export const TableColumnsProvider = ({ children }) => {
  const location = useLocation()
  const [ascending, setAscending] = useState(true);
  const [claimsDrawer, setclaimsDrawer] = useState(false)
  const handlClaimDrawerChng = () => {
    setclaimsDrawer(!claimsDrawer)
  }
  const handleSaveAfterEdit = (row) => {
    const newData = [...gridData];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      setGridData(newData);
    }
  };

  const [columns, setColumns] = useState({
    Profile: [
      { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true, },
      { dataIndex: "fullName", title: "Full Name", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "rank", title: "Rank", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "station", title: "Station", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "distric", title: "District", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "division", title: "Division", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "address", title: "Address", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "duty", title: "Duty", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "forename", title: "Forename", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true, },
      { dataIndex: "surname", title: "Surname", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
      { dataIndex: "dob", title: "Date Of Birth", ellipsis: true, isGride: false, isVisible: true, width: 150 },
      { dataIndex: "dateRetired", title: "Date Retired", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "dateAged65", title: "Date Aged 65", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "dateOfDeath", title: "Date Of Death", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "stationID", title: "Station ID", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "stationPhone", title: "Station Phone", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "pensionNo", title: "Pension No", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "graMember", title: "GRA Member", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "dateJoined", title: "Date Joined", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "dateLeft", title: "Date Left", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "associateMember", title: "Associate Member", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "status", title: "Status", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "updated", title: "Updated", ellipsis: true, isGride: true, isVisible: true, width: 150 },
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
        title: "Rank",
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
    Claims: [
      { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true, },
      { dataIndex: "fullName", title: "Full Name", ellipsis: true, isGride: true, isVisible: true, width: 200 },
      { dataIndex: "claimNo", title: "Claim No", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "claimType", title: "ClaimType", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "startDate", title: "Start Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "endDate", title: "End Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
      { dataIndex: "noOfDays_used", title: "No Of Days_used", ellipsis: true, isGride: true, isVisible: true, width: 120 },
      { dataIndex: "description", title: "Description", ellipsis: true, isGride: true, isVisible: true, width: 200 },
    ],
    Transfer : [
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
    Correspondence:[
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
    ]
  });

  const [searchFilters, setsearchFilters] = useState({
    Profile: [
      {
        titleColumn: "Rank",
        isSearch: true,
        isCheck: false,
        lookups: { "All Ranks": false, "0001": false, "0021": false },
        comp: "!="
      },
      {
        titleColumn: "Duty",
        isSearch: true,
        comp: "!=",
        isCheck: false,
        lookups: { "All Duties": false, "Sargent": false, "Garda": false },
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
        titleColumn: "Pensioner ",
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
    Cases: [
      {
        titleColumn: "Rank",
        isSearch: true,
        isCheck: false,
        lookups: { "All Ranks": false, "0001": false, "0021": false },
        comp: "!="
      },
      {
        titleColumn: "Duty",
        isSearch: true,
        comp: "!=",
        isCheck: false,
        lookups: { "All Duties": false, "Sargent": false, "Garda": false },
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
        titleColumn: "Pensioner ",
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
        titleColumn: "Rank",
        isSearch: true,
        isCheck: false,
        lookups: { "All Ranks": false, "0001": false, "0021": false },
        comp: "!="
      },
      {
        titleColumn: "Duty",
        isSearch: true,
        comp: "!=",
        isCheck: false,
        lookups: { "All Duties": false, "Sargent": false, "Garda": false },
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
        titleColumn: "Pensioner ",
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
        titleColumn: "Rank",
        isSearch: true,
        isCheck: false,
        lookups: { "All Ranks": false, "0001": false, "0021": false },
        comp: "!="
      },
      {
        titleColumn: "Duty",
        isSearch: true,
        comp: "!=",
        isCheck: false,
        lookups: { "All Duties": false, "Sargent": false, "Garda": false },
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
        titleColumn: "Pensioner ",
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
        titleColumn: "Rank",
        isSearch: true,
        isCheck: false,
        lookups: { "All Ranks": false, "0001": false, "0021": false },
        comp: "!="
      },
      {
        titleColumn: "Duty",
        isSearch: true,
        comp: "!=",
        isCheck: false,
        lookups: { "All Duties": false, "Sargent": false, "Garda": false },
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
        titleColumn: "Pensioner ",
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
  });

  const filteredSearchFilters = [
    {
      titleColumn: "Rank",
      isCheck: true,
    },
    {
      titleColumn: "Duty",
      isCheck: true,
    },
    {
      titleColumn: "Division",
      isCheck: true,
    },
    {
      titleColumn: "District",
      isCheck: false,
    },
    {
      titleColumn: "Station",
      isCheck: false,
    },
    {
      titleColumn: "Station ID",
      isCheck: false,
    },
    {
      titleColumn: "Pensioner ",
      isCheck: false,
    },
    {
      titleColumn: "Date Of Birth",
      isCheck: false,
    },
    {
      titleColumn: "Date Retired",
      isCheck: false,
    },
    {
      titleColumn: "Date Aged 65",
      isCheck: false,
    },
    {
      titleColumn: "Date Of Death",
      isCheck: false,
    },
    {
      titleColumn: "Station Phone",
      isCheck: false,
    },
    {
      titleColumn: "Distric Rep",
      isCheck: false,
    },
    {
      titleColumn: "Division Rep",
      isCheck: false,
    },
    {
      titleColumn: "Pension No",
      isCheck: false,
    },
    {
      titleColumn: "GRA Member",
      isCheck: false,
    },
    {
      titleColumn: "Date Joined",
      isCheck: false,
    },
    {
      titleColumn: "Date Left",
      isCheck: false,
    },
    {
      titleColumn: "Associate Member",
      isCheck: false,
    },
    {
      titleColumn: "Address",
      isCheck: false,
    },
    {
      titleColumn: "Status",
      isCheck: false,
    },
    {
      titleColumn: "Updated",
      isCheck: false,
    },
  ]

  const [globleFilters, setglobleFilters] = useState(filteredSearchFilters)
  const [report, setreport] = useState(null)
  const [isSave, setisSave] = useState(false)

  const isSaveChng = (value) => {
    setisSave(value)
  }
  const screenName = location?.state?.search
  const handleSave = (name) => {
    // Save the current searchFilters to the report under the given name
    setreport((prevReport) => ({
      ...prevReport,
      [name]: searchFilters[screenName], // Save searchFilters for the specific screen
    }));

    // Update the searchFilters to include the report data under the name key
    setsearchFilters((prevFilters) => ({
      ...prevFilters,
      [name]: prevFilters[screenName].map(filter => ({
        ...filter,
        // Include any other properties you want to keep
        reportData: prevFilters[name] ? prevFilters[name] : [], // Set reportData if it exists
      })),
    }));
  };


  console.log(report, "reportt")
  const updateCompByTitleColumn = (titleColumn, newComp) => {
    setsearchFilters((prevFilters) => {
      // Ensure prevFilters exists and is an object
      if (!prevFilters || typeof prevFilters !== 'object') {
        prevFilters = {};
      }
      const filtersForScreen = Array.isArray(prevFilters[screenName]) ? prevFilters[screenName] : [];
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
  };

  const handleCheckboxFilterChange = (key, isChecked, screenName, width, e) => {
    e.stopPropagation()
    setColumns((prevColumns) => {
      const updatedColumns = prevColumns?.[screenName].map((column) => {
        if (column.title === key) {
          return { ...column, isGride: isChecked, width: width };
        }
        return column;
      });

      return { ...prevColumns, [screenName]: updatedColumns };
    });
  };
  const updateSelectedTitles = (title, isChecked) => {
    setglobleFilters((prevFilters) => {
      const updatedFilters = prevFilters.map((item) => {
        if (item.titleColumn === title) {
          return { ...item, isCheck: isChecked }; // Update the `isCheck` property instead of `isSearch`
        }
        return item;
      });
      return updatedFilters; // Return the updated filters
    });

  };


  const updateLookupValue = (titleColumn, gender, value) => {
    setsearchFilters((prevFilters) => {
      // Ensure prevFilters is defined and is an object
      if (!prevFilters || typeof prevFilters !== 'object') {
        prevFilters = {};
      }

      // Ensure filters for the current screen exist and are an array
      const filtersForScreen = Array.isArray(prevFilters[screenName]) ? prevFilters[screenName] : [];

      // Update the filter with the matching titleColumn
      const updatedFilters = filtersForScreen.map((filter) => {
        if (filter.titleColumn === titleColumn) {
          return {
            ...filter,
            // Update the lookups for the specified gender
            lookups: {
              ...filter.lookups,
              [gender]: value,
            },
          };
        }
        // Return unchanged filter if no match
        return filter;
      });

      // Return the updated filters for the current screen
      return {
        ...prevFilters,
        [screenName]: updatedFilters,
      };
    });
  };


  const [gridData, setGridData] = useState(tableData);
  const filterGridDataFtn = (columnName, value, comp) => {

    if (value == "All Ranks" && comp == "=") {
      return setGridData(tableData)
    }
    if (value == "All Ranks" && comp == "!=") {
      return setGridData([])
    }
    if (columnName !== "" && value !== "" && comp) {
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
  };
  const handleCompChang = (title, value) => {
    setsearchFilters((prevProfile) => {
      return prevProfile.map((item) => {
        if (item?.titleColumn === title) {
          return { ...item, comp: value }; // Update isSearch based on isChecked
        }
        return item;
      });
    });
    filterGridDataFtn()
  };
  const [state, setState] = useState({
    selectedOption: "!=",
    checkboxes: {},
  });

  const updateState = (key, newState) => {
    setState((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        ...newState,
      },
    }));
  };

  const updateColumns = (newColumns) => {

  };


  const getFiltersWithTrueLookups = (filters) => {
    const relevantFilters = filters[screenName] || []; // Access filters based on screenName

    return relevantFilters
      .filter((filter) => {
        return Object.values(filter.lookups).some((value) => value === true);
      })
      .map((filter) => ({
        titleColumn: filter.titleColumn,
        isSearch: filter.isSearch,
        isCheck: filter.isCheck,
        lookups: filter.lookups,
        comp: filter.comp,
      }));
  };
  const yy = getFiltersWithTrueLookups(searchFilters)


  const filterData = () => {
    return tableData?.filter(item => {
      return yy?.every(filter => {
        const { titleColumn, lookups, comp } = filter;
        const itemValue = item[titleColumn.toLowerCase()]; // Adjust case to match your data
        if (comp === '=') {
          return lookups[itemValue] === true;
        } else if (comp === '!=') {
          // Return true if the itemValue is not in lookups
          return lookups[itemValue] !== true;
        }

        // Fallback case if comp is neither '=' nor '!='
        return false;
      });
    });
  };


  useEffect(() => {
    const result = filterData();
    setGridData(result);
  }, [searchFilters, location?.pathname]); // Re-run when gridData or filters change

  const [ProfileDetails, setProfileDetails] = useState([])
  const [rowIndex, setrowIndex] = useState(0)

  const getProfile = (row, index) => {
    setProfileDetails(row)
    setrowIndex(index) 
  }

  const profilNextBtnFtn = () => {

    setrowIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      const filteredData = gridData?.filter((_, index) => index === newIndex);
      setProfileDetails(filteredData);
      return newIndex;
  });
};

  const profilPrevBtnFtn = () => {
    setrowIndex(prev=>{
      const newIndex= prev-1;
      const filteredData = gridData?.filter((_,index)=>index==newIndex);
      setProfileDetails(filteredData)
      
      return newIndex
    })


  };

  const [topSearchData, settopSearchData] = useState()
  const [ReportsTitle, setReportsTitle] = useState([]);

  async function filterByRegNo(regNo) {
    let data;
    data = gridData?.filter(item => item.regNo === regNo);
    await getProfile(data)
  }

  const resetFilters = () => {
    const filtersForScreen = searchFilters[screenName];

    if (Array.isArray(filtersForScreen)) {
      const updatedFilters = filtersForScreen.map(filter => ({
        ...filter,
        comp: '!=',
        lookups: Object.keys(filter.lookups).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {})
      }));

      // Update the filters for the current screen
      setsearchFilters(prev => ({
        ...prev,
        [screenName]: updatedFilters, // Update the specific screen's filters
      }));
    } else {
      console.error(`Expected searchFilters[${screenName}] to be an array, got ${typeof filtersForScreen}`);
    }
  };

  function extractMainKeys() {
    if (report == null || typeof report !== 'object') {
      return [];
    }

    return Object.keys(report);
  }
  useEffect(() => {
    setReportsTitle(extractMainKeys());
  }, [report]);

  return (
    <TableColumnsContext.Provider
      value={{
        columns,
        updateColumns,
        state,
        setState,
        updateState,
        gridData,
        handleCheckboxFilterChange,
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
        globleFilters
      }}
    >
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};
