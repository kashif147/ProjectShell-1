import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { tableData } from "../Data";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRegions, deleteRegion } from "../features/RegionSlice";
import { getAllLookups } from '../features/LookupsSlice'
import { getContactTypes } from "../features/ContactTypeSlice";

const TableColumnsContext = createContext();

// Static column configurations
const staticColumns = {
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
    { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
    { dataIndex: "fullName", title: "Full Name", ellipsis: true, isGride: true, isVisible: true, width: 200 },
    { dataIndex: "rank", title: "Rank", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "station", title: "Station", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "distric", title: "District", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "division", title: "Division", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "duty", title: "Duty", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Case Type", title: "Case Type", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Case ID", title: "Case ID", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Case Title", title: "Case Title", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Incident detail", title: "Incident detail", ellipsis: true, isGride: true, isVisible: true, width: 300 },
    { dataIndex: "Incident Date", title: "Incident Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "case Status", title: "case Status", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Assignee", title: "Assignee", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Assignee", title: "Assignee", ellipsis: true, isGride: true, isVisible: true, width: 150 },
  ],
  Claims: [
    { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
    { dataIndex: "fullName", title: "Full Name", ellipsis: true, isGride: true, isVisible: true, width: 200 },
    { dataIndex: "claimNo", title: "Claim No", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "claimType", title: "ClaimType", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "startDate", title: "Start Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "endDate", title: "End Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "noOfDays_used", title: "No Of Days_used", ellipsis: true, isGride: true, isVisible: true, width: 120 },
    { dataIndex: "description", title: "Description", ellipsis: true, isGride: true, isVisible: true, width: 200 },
  ],
  Transfer: [
    { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
    { dataIndex: "forename", title: "Forename", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
    { dataIndex: "surname", title: "Surname", ellipsis: true, isGride: true, isVisible: true, width: 150, editable: true },
    { dataIndex: "currentStation", title: "Current Station", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "requestedStation", title: "Requested Station", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "transferReason", title: "Transfer Reason", ellipsis: true, isGride: true, isVisible: true, width: 200 },
    { dataIndex: "transferDate", title: "Transfer Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "approvalStatus", title: "Approval Status", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "address", title: "Address", ellipsis: true, isGride: true, isVisible: true, width: 200 },
    { dataIndex: "duty", title: "Duty", ellipsis: true, isGride: true, isVisible: true, width: 150 },
  ],
  Correspondence: [
    { dataIndex: "correspondenceID", title: "Correspondence ID", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "forename", title: "Forename", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "surname", title: "Surname", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "methodOfContact", title: "Method of Contact", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "dateOfContact", title: "Date of Contact", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "duration", title: "Duration", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "details", title: "Details", ellipsis: true, isGride: true, isVisible: true, width: 400 },
    { dataIndex: "followUpNeeded", title: "Follow-up Needed", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "followUpDate", title: "Follow-up Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "status", title: "Status", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "nextStep", title: "Next Step", ellipsis: true, isGride: true, isVisible: true, width: 200 },
  ],
  Roster: [
    { dataIndex: "RosterID", title: "Roster ID", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "regNo", title: "Reg No", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "fullName", title: "Full Name", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "forename", title: "Forename", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "surname", title: "Surname", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "StartDate", title: "StartDate", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "EndDate", title: "End Date", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Heading", title: "Details", ellipsis: true, isGride: true, isVisible: true, width: 150 },
    { dataIndex: "Heading", title: "Details", ellipsis: true, isGride: true, isVisible: true, width: 400 },
  ]
};

// Static search filters
const staticSearchFilters = {
  Profile: [
    { titleColumn: "Rank", isSearch: true, isCheck: false, comp: "!=", lookups: {} },
    { titleColumn: "Duty", isSearch: true, comp: "!=", isCheck: false, lookups: {} },
    { titleColumn: "Division", isSearch: true, comp: "!=", isCheck: false, lookups: {} },
    { titleColumn: "District", isSearch: true, isCheck: false, lookups: { "All District": false } },
    { titleColumn: "Station", isSearch: true, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station ID", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Pensioner", isSearch: false, isCheck: false, lookups: { Pensioner: false } },
    { titleColumn: "Date Of Birth", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Retired", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Aged 65", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Of Death", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station Phone", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Distric Rep", isSearch: false, isCheck: false, lookups: { "Distric Rep": false } },
    { titleColumn: "Division Rep", isSearch: false, isCheck: false, lookups: { "Division Rep": false } },
    { titleColumn: "Pension No", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "GRA Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Joined", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Left", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Associate Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Status", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Updated", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
  ],
  Cases: [
    { titleColumn: "Rank", isSearch: true, isCheck: false, lookups: { "All Ranks": false, "0001": false, "0021": false }, comp: "!=" },
    { titleColumn: "Duty", isSearch: true, comp: "!=", isCheck: false, lookups: { "All Duties": false, "Sargent": false, "Garda": false } },
    { titleColumn: "Division", isSearch: true, isCheck: false, lookups: { "All Divisions": false, "Northland": false, "Southland": false, "Eastland": false } },
    { titleColumn: "District", isSearch: true, isCheck: false, lookups: { "All District": false } },
    { titleColumn: "Station", isSearch: true, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station ID", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Pensioner", isSearch: false, isCheck: false, lookups: { Pensioner: false } },
    { titleColumn: "Date Of Birth", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Retired", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Aged 65", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Of Death", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station Phone", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Distric Rep", isSearch: false, isCheck: false, lookups: { "Distric Rep": false } },
    { titleColumn: "Division Rep", isSearch: false, isCheck: false, lookups: { "Division Rep": false } },
    { titleColumn: "Pension No", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "GRA Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Joined", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Left", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Associate Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Status", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Updated", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
  ],
  Claims: [
    { titleColumn: "Rank", isSearch: true, isCheck: false, lookups: { "All Ranks": false, "0001": false, "0021": false }, comp: "!=" },
    { titleColumn: "Duty", isSearch: true, comp: "!=", isCheck: false, lookups: { "All Duties": false, "Sargent": false, "Garda": false } },
    { titleColumn: "Division", isSearch: true, isCheck: false, lookups: { "All Divisions": false, "Northland": false, "Southland": false, "Eastland": false } },
    { titleColumn: "District", isSearch: true, isCheck: false, lookups: { "All District": false } },
    { titleColumn: "Station", isSearch: true, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station ID", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Pensioner", isSearch: false, isCheck: false, lookups: { Pensioner: false } },
    { titleColumn: "Date Of Birth", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Retired", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Aged 65", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Of Death", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station Phone", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Distric Rep", isSearch: false, isCheck: false, lookups: { "Distric Rep": false } },
    { titleColumn: "Division Rep", isSearch: false, isCheck: false, lookups: { "Division Rep": false } },
    { titleColumn: "Pension No", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "GRA Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Joined", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Left", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Associate Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Status", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Updated", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
  ],
  Correspondence: [
    { titleColumn: "Rank", isSearch: true, isCheck: false, lookups: { "All Ranks": false, "0001": false, "0021": false }, comp: "!=" },
    { titleColumn: "Duty", isSearch: true, comp: "!=", isCheck: false, lookups: { "All Duties": false, "Sargent": false, "Garda": false } },
    { titleColumn: "Division", isSearch: true, isCheck: false, lookups: { "All Divisions": false, "Northland": false, "Southland": false, "Eastland": false } },
    { titleColumn: "District", isSearch: true, isCheck: false, lookups: { "All District": false } },
    { titleColumn: "Station", isSearch: true, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station ID", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Pensioner", isSearch: false, isCheck: false, lookups: { Pensioner: false } },
    { titleColumn: "Date Of Birth", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Retired", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Aged 65", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Of Death", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station Phone", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Distric Rep", isSearch: false, isCheck: false, lookups: { "Distric Rep": false } },
    { titleColumn: "Division Rep", isSearch: false, isCheck: false, lookups: { "Division Rep": false } },
    { titleColumn: "Pension No", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "GRA Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Joined", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Left", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Associate Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Status", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Updated", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
  ],
  Transfer: [
    { titleColumn: "Rank", isSearch: true, isCheck: false, lookups: { "All Ranks": false, "0001": false, "0021": false }, comp: "!=" },
    { titleColumn: "Duty", isSearch: true, comp: "!=", isCheck: false, lookups: { "All Duties": false, "Sargent": false, "Garda": false } },
    { titleColumn: "Division", isSearch: true, isCheck: false, lookups: { "All Divisions": false, "Northland": false, "Southland": false, "Eastland": false } },
    { titleColumn: "District", isSearch: true, isCheck: false, lookups: { "All District": false } },
    { titleColumn: "Station", isSearch: true, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station ID", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Pensioner", isSearch: false, isCheck: false, lookups: { Pensioner: false } },
    { titleColumn: "Date Of Birth", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Retired", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Aged 65", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Of Death", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station Phone", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Distric Rep", isSearch: false, isCheck: false, lookups: { "Distric Rep": false } },
    { titleColumn: "Division Rep", isSearch: false, isCheck: false, lookups: { "Division Rep": false } },
    { titleColumn: "Pension No", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "GRA Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Joined", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Left", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Associate Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Status", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Updated", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
  ],
  Roster: [
    { titleColumn: "Rank", isSearch: true, isCheck: false, lookups: { "All Ranks": false, "0001": false, "0021": false }, comp: "!=" },
    { titleColumn: "Duty", isSearch: true, comp: "!=", isCheck: false, lookups: { "All Duties": false, "Sargent": false, "Garda": false } },
    { titleColumn: "Division", isSearch: true, isCheck: false, lookups: { "All Divisions": false, "Northland": false, "Southland": false, "Eastland": false } },
    { titleColumn: "District", isSearch: true, isCheck: false, lookups: { "All District": false } },
    { titleColumn: "Station", isSearch: true, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station ID", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Pensioner", isSearch: false, isCheck: false, lookups: { Pensioner: false } },
    { titleColumn: "Date Of Birth", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Retired", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Aged 65", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Of Death", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Station Phone", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Distric Rep", isSearch: false, isCheck: false, lookups: { "Distric Rep": false } },
    { titleColumn: "Division Rep", isSearch: false, isCheck: false, lookups: { "Division Rep": false } },
    { titleColumn: "Pension No", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "GRA Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Joined", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Date Left", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Associate Member", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Address", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Status", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
    { titleColumn: "Updated", isSearch: false, isCheck: false, lookups: { Male: false, Female: false, Other: false } },
  ]
};

export const TableColumnsProvider = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const screenName = location?.state?.search;

  // State declarations
  const [ascending, setAscending] = useState(true);

  const [claimsDrawer, setClaimsDrawer] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [lookupsData, setLookupsData] = useState({
    Duties: [],
    MaritalStatus: [],
    Ranks: [],
    Titles:[]
  })
  const [report, setReport] = useState(null);
  const [isSave, setIsSave] = useState(false);
  const [ProfileDetails, setProfileDetails] = useState([]);
  const [rowIndex, setRowIndex] = useState(0);
  const [topSearchData, setTopSearchData] = useState();
  const [ReportsTitle, setReportsTitle] = useState([]);

  // Redux selectors
  const { regions, loading } = useSelector((state) => state.regions);
  const { lookups, lookupsloading } = useSelector((state) => state.lookups);
  const { contactTypes, contactTypesloading, error } = useSelector((state) => state.contactType);

  // Derived state
  const [columns, setColumns] = useState(staticColumns);
  const [gridData, setGridData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState(staticSearchFilters);
  const [lookupsForSelect, setLookupsForSelect] = useState({
    Duties: [],
    MaritalStatus: [],
    Ranks: [],
    Titles: []
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

  // Memoized values
  const filteredSearchFilters = useMemo(() => [
    { titleColumn: "Rank", isCheck: true },
    { titleColumn: "Duty", isCheck: true },
    { titleColumn: "Division", isCheck: true },
    { titleColumn: "District", isCheck: false },
    { titleColumn: "Station", isCheck: false },
    { titleColumn: "Station ID", isCheck: false },
    { titleColumn: "Pensioner", isCheck: false },
    { titleColumn: "Date Of Birth", isCheck: false },
    { titleColumn: "Date Retired", isCheck: false },
    { titleColumn: "Date Aged 65", isCheck: false },
    { titleColumn: "Date Of Death", isCheck: false },
    { titleColumn: "Station Phone", isCheck: false },
    { titleColumn: "Distric Rep", isCheck: false },
    { titleColumn: "Division Rep", isCheck: false },
    { titleColumn: "Pension No", isCheck: false },
    { titleColumn: "GRA Member", isCheck: false },
    { titleColumn: "Date Joined", isCheck: false },
    { titleColumn: "Date Left", isCheck: false },
    { titleColumn: "Associate Member", isCheck: false },
    { titleColumn: "Address", isCheck: false },
    { titleColumn: "Status", isCheck: false },
    { titleColumn: "Updated", isCheck: false },
  ], []);

  const [globleFilters, setGlobleFilters] = useState(filteredSearchFilters);

  // Handlers and functions
  const handlClaimDrawerChng = useCallback(() => {
    setClaimsDrawer(prev => !prev);
  }, []);

  const handleSaveAfterEdit = useCallback((row) => {
    setGridData(prevData => {
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

  const handleSave = useCallback((name) => {
    setReport(prevReport => ({
      ...prevReport,
      [name]: searchFilters[screenName],
    }));

    setSearchFilters(prevFilters => ({
      ...prevFilters,
      [name]: prevFilters[screenName].map(filter => ({
        ...filter,
        reportData: prevFilters[name] ? prevFilters[name] : [],
      })),
    }));
  }, [screenName, searchFilters]);

  const updateCompByTitleColumn = useCallback((titleColumn, newComp) => {
    setSearchFilters(prevFilters => {
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
  }, [screenName]);

  const handleCheckboxFilterChange = useCallback((key, isChecked, screenName, width, e) => {
    e.stopPropagation();
    setColumns(prevColumns => ({
      ...prevColumns,
      [screenName]: prevColumns[screenName].map(column => 
        column.title === key ? { ...column, isGride: isChecked, width } : column
      )
    }));
  }, []);

  const updateSelectedTitles = useCallback((title, isChecked) => {
    setGlobleFilters(prevFilters => 
      prevFilters.map(item => 
        item.titleColumn === title ? { ...item, isCheck: isChecked } : item
      )
    );
  }, []);

  const updateLookupValue = useCallback((titleColumn, gender, value) => {
    setSearchFilters(prevFilters => {
      const filtersForScreen = Array.isArray(prevFilters[screenName]) ? prevFilters[screenName] : [];
      const updatedFilters = filtersForScreen.map(filter => {
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
  }, [screenName]);

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

  const handleCompChang = useCallback((title, value) => {
    setSearchFilters(prevProfile => 
      prevProfile.map(item => 
        item?.titleColumn === title ? { ...item, comp: value } : item
      )
    );
    filterGridDataFtn();
  }, [filterGridDataFtn]);

  const getProfile = useCallback((row, index) => {
    setProfileDetails(row);
    setRowIndex(index);
  }, []);

  const profilNextBtnFtn = useCallback(() => {
    setRowIndex(prevIndex => {
      const newIndex = prevIndex + 1;
      const filteredData = gridData?.filter((_, index) => index === newIndex);
      setProfileDetails(filteredData);
      return newIndex;
    });
  }, [gridData]);

  const profilPrevBtnFtn = useCallback(() => {
    setRowIndex(prevIndex => {
      const newIndex = prevIndex - 1;
      const filteredData = gridData?.filter((_, index) => index === newIndex);
      setProfileDetails(filteredData);
      return newIndex;
    });
  }, [gridData]);

  const filterByRegNo = useCallback(async (regNo) => {
    const data = gridData?.filter(item => item.regNo === regNo);
    await getProfile(data);
  }, [gridData, getProfile]);

  const resetFilters = useCallback(() => {
    setSearchFilters(prev => {
      const filtersForScreen = prev[screenName];
      if (Array.isArray(filtersForScreen)) {
        const updatedFilters = filtersForScreen.map(filter => ({
          ...filter,
          comp: '!=',
          lookups: Object.keys(filter.lookups).reduce((acc, key) => {
            acc[key] = false;
            return acc;
          }, {})
        }));
        return {
          ...prev,
          [screenName]: updatedFilters,
        };
      }
      return prev;
    });
  }, [screenName]);

  const extractMainKeys = useCallback(() => {
    if (!report || typeof report !== 'object') return [];
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
  const filterRegions = useCallback((key, value, parentKey = null, parentValue = null) => 
    regions?.filter(item => 
      item[key] === value && (!parentKey || item[parentKey] === parentValue)
    ) || [], [regions]);

  const transformLookupData = useCallback(data => 
    data?.map(item => ({
      key: item?._id,
      label: item?.RegionName,
    })) || [], []);

  useEffect(() => {
    if (!Array.isArray(regions)) return;

    setRegionLookups(prevState => ({
      ...prevState,
      Provinces: filterRegions("lookuptypeId?._id", "67bf243ce314eba2c2105098"),
      county: filterRegions("lookuptypeId?._id", "67bf3d63e314eba2c210517f", "ParentRegion", "67614e73479dfae6328a2641"),
      Divisions: filterRegions("lookuptypeId?._id", "67bf4317e314eba2c21051dc"),
      Districts: filterRegions("lookuptypeId?._id", ""),
      Cities: filterRegions("RegionTypeID", "6718228ca0072a28aab883e0"),
      Stations: filterRegions("RegionTypeID", "671822c6a0072a28aab883e9"),
    }));
  }, [regions, filterRegions]);

  useEffect(() => {
    setSelectLokups(prevState => ({
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
        gender: '674a1977cc0986f64ca36fc6',
        Duties: '674a219fcc0986f64ca3701b',
        MaritalStatus: '676a9ec44a1a6d0778731c29',
        Titles: '675fc362e9640143bfc38d28',
        Ranks: '67ac73c693e73711692bf859',
      };

      const updatedLookups = Object.keys(lookupTypes).reduce((acc, key) => {
        acc[key] = lookups.filter(item => item.lookuptypeId?._id === lookupTypes[key]);
        return acc;
      }, {});

      setLookupsData(prevState => ({ ...prevState, ...updatedLookups }));
    }
  }, [lookups]);

  useEffect(() => {
    if (lookupsData) {
      const transformedData = ['Duties', 'Ranks', 'Titles'].reduce((acc, key) => {
        if (lookupsData[key]) {
          acc[key] = lookupsData[key].map(item => ({
            key: item?._id,
            label: item?.lookupname,
          }));
        }
        return acc;
      }, {});

      setLookupsForSelect(prevState => ({ ...prevState, ...transformedData }));
    }
  }, [lookupsData]);

  useEffect(() => {
    if (contactTypes) {
      const transformedData = contactTypes.map(item => ({
        key: item?._id,
        label: item?.ContactType,
      }));

      setSelectLokups(prevState => ({
        ...prevState,
        contactTypes: transformedData,
      }));
    }
  }, [contactTypes]);

  // Filter data effect
  const getFiltersWithTrueLookups = useCallback((filters) => {
    const relevantFilters = filters[screenName] || [];
    return relevantFilters
      .filter(filter => Object.values(filter.lookups).some(value => value === true))
      .map(filter => ({
        titleColumn: filter.titleColumn,
        isSearch: filter.isSearch,
        isCheck: filter.isCheck,
        lookups: filter.lookups,
        comp: filter.comp,
      }));
  }, [screenName]);

  const filterData = useCallback(() => {
    const yy = getFiltersWithTrueLookups(searchFilters);
    return tableData?.filter(item => {
      return yy?.every(filter => {
        const { titleColumn, lookups, comp } = filter;
        const itemValue = item[titleColumn.toLowerCase()];
        if (comp === '=') {
          return lookups[itemValue] === true;
        } else if (comp === '!=') {
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
  const updateSearchFilters = useCallback((lookupKey, titleColumn) => {
    if (!lookupsForSelect?.[lookupKey]?.length) return;
    
    setSearchFilters(prevState => ({
      ...prevState,
      Profile: prevState.Profile.map(item =>
        item.titleColumn === titleColumn
          ? {
              ...item,
              lookups: lookupsForSelect[lookupKey].reduce((acc, entry) => {
                acc[entry.label] = false;
                return acc;
              }, {})
            }
          : item
      ),
    }));
  }, [lookupsForSelect]);

  useEffect(() => {
    updateSearchFilters("Ranks", "Rank");
    updateSearchFilters("Duties", "Duty");
  }, [lookupsForSelect?.Ranks, lookupsForSelect?.Duties, updateSearchFilters]);

  useEffect(() => {
    if (!selectLokups?.Divisions?.length) return;

    setSearchFilters(prevState => ({
      ...prevState,
      Profile: prevState.Profile.map(item =>
        item.titleColumn === "Division"
          ? {
              ...item,
              lookups: selectLokups.Divisions.reduce((acc, division) => {
                acc[division.label] = false;
                return acc;
              }, {})
            }
          : item
      ),
    }));
  }, [selectLokups?.Divisions]);

  // Context value
  const contextValue = useMemo(() => ({
    columns,
    updateColumns: () => {},
    state: { selectedOption: "!=", checkboxes: {} },
    setState: () => {},
    updateState: () => {},
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
    globleFilters,
    regionLookups,
    selectLokups,
    lookupsData,
    lookupsForSelect,
    disableFtn,
    isDisable,
    handleSaveAfterEdit
  }), [
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
    handleSaveAfterEdit
  ]);

  return (
    <TableColumnsContext.Provider value={contextValue}>
      {children}
    </TableColumnsContext.Provider>
  );
};

export const useTableColumns = () => {
  return useContext(TableColumnsContext);
};