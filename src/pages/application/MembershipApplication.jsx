import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
// import TableComponent from "../../component/common/TableComponent";
import TableComponent from "../../component/common/TableComponent";
import { getApplicationsWithFilter } from "../../features/applicationwithfilterslice";
import MultiFilterDropdown from "../../component/common/MultiFilterDropdown";
import { Spin } from "antd";
import { useFilters } from "../../context/FilterContext";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useSelectedIds } from "../../context/SelectedIdsContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { transformFiltersForApi } from "../../utils/filterUtils";
import { useLocation } from "react-router-dom";

function MembershipApplication() {
  const dispatch = useDispatch();
  const { filtersState } = useFilters();
  const { applications, loading: applicationsLoading, isInitialized } = useSelector(
    (state) => state.applicationWithFilter
  );
  const { selectedIds, setSelectedIds } = useSelectedIds();
  const location = useLocation();
  const { currentTemplateId } = useSelector((state) => state.applicationWithFilter);
  const { columns } = useTableColumns();
  const { loading: templatesLoading } = useSelector((state) => state.templetefiltrsclumnapi);
  const [formattedApplications, setFormattedApplications] = useState([]);
  const [selectedRows, setSelectedRows] = useState(null)
  console.log(selectedRows, "selected rows data");

  // Function to format dates in the application data
  const formatApplicationDates = (applicationData) => {
    if (!applicationData) return applicationData;

    dayjs.extend(utc);

    const formatDate = (dateString) => {
      if (!dateString) return null;
      return dayjs.utc(dateString).format("DD/MM/YYYY HH:mm"); // stays in UTC
    };

    const formatDateOnly = (dateString) => {
      if (!dateString) return null;
      return dayjs.utc(dateString).format("DD/MM/YYYY"); // DD/MM/YYYY only for dates without time
    };

    return {
      ...applicationData,
      // Format dates in personalDetails
      personalDetails: applicationData.personalDetails ? {
        ...applicationData.personalDetails,
        personalInfo: applicationData.personalDetails.personalInfo ? {
          ...applicationData.personalDetails.personalInfo,
          dateOfBirth: formatDateOnly(applicationData.personalDetails.personalInfo.dateOfBirth),
          deceasedDate: formatDateOnly(applicationData.personalDetails.personalInfo.deceasedDate)
        } : null,
        contactInfo: applicationData.personalDetails.contactInfo,
        approvalDetails: applicationData.personalDetails.approvalDetails ? {
          ...applicationData.personalDetails.approvalDetails,
          approvedAt: formatDate(applicationData.personalDetails.approvalDetails.approvedAt)
        } : null,
        createdAt: formatDate(applicationData.personalDetails.createdAt),
        updatedAt: formatDate(applicationData.personalDetails.updatedAt)
      } : null,

      // Format dates in professionalDetails
      professionalDetails: applicationData.professionalDetails ? {
        ...applicationData.professionalDetails,
        retiredDate: formatDate(applicationData.professionalDetails.retiredDate),
        graduationDate: formatDate(applicationData.professionalDetails.graduationDate)
      } : null,

      // Format dates in subscriptionDetails
      subscriptionDetails: applicationData.subscriptionDetails ? {
        ...applicationData.subscriptionDetails,
        dateJoined: formatDate(applicationData.subscriptionDetails.dateJoined),
        submissionDate: formatDate(applicationData.subscriptionDetails.submissionDate)
      } : null,

      // Format top-level dates
      createdAt: formatDate(applicationData.createdAt),
      updatedAt: formatDate(applicationData.updatedAt),


      // Format approvalDetails dates
      approvalDetails: applicationData.approvalDetails ? {
        ...applicationData.approvalDetails,
        approvedAt: formatDate(applicationData.approvalDetails.approvedAt)
      } : null
    };
  };

  useEffect(() => {
    // Only fetch if initial view determination is complete
    if (!isInitialized) return;

    dispatch(getApplicationsWithFilter({
      templateId: currentTemplateId || "",
      page: 1,
      limit: 10
    }));
  }, [dispatch, currentTemplateId, isInitialized]);

  useEffect(() => {
    if (applications && applications.length > 0) {
      const formatted = applications.map(app => formatApplicationDates(app));
      setFormattedApplications(formatted);
    } else {
      setFormattedApplications([]);
    }
  }, [applications]);

  const shouldDisableRow = useCallback((record) => {
    debugger;

    // Get the status from the record
    const status = record?.applicationStatus ||
      // record?.status ||
      // record?.approvalDetails?.applicationStatus;

      console.log("Checking row status:", status, "for record:", record);

    // Only enable for "Rejected" or "Submitted"
    // Disable for: "In-Progress", "Approved", "Draft"
    const enabledStatuses = ["rejected", "submitted"];
    const disabledStatuses = ["in-Progress", "approved", "Draft"];

    // Check if status exists and is in disabled statuses
    if (!status) return false; // If no status, don't disable

    // Return true to DISABLE if status is NOT in enabled statuses
    // OR if status IS in disabled statuses
    return !enabledStatuses.includes(status) ||
      disabledStatuses.includes(status);
  }, []);

  const [selectedKeys, setSelectedKeys] = useState([]);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState([]);
  console.log(selectedApplicationIds, "selected keys");

  const handleSelectionChange = useCallback((selectedKeys, selectedRows) => {
    setSelectedKeys(selectedKeys)
    // Map selectedRows to get application IDs
    const ids = selectedRows.map(row => row.applicationId || row._id);
    setSelectedIds(ids);
  }, []);

  const handleRowClick = useCallback((record, index) => {
    console.log("Row clicked12:", record?.applicationId,);
  }, []);
  return (
    <div className="" style={{ width: "100%" }}>
      {/* <TableComponent
      data={formattedApplications}
      screenName="Applications"
      isGrideLoading={applicationsLoading}
      selectedRowKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      selectionType="checkbox"
      enableRowSelection={true}
      disableDefaultRowClick={true}
      disableRowFn={shouldDisableRow} // Pass the disable function
    /> */}

      <TableComponent
        data={formattedApplications}
        screenName="Applications"
        isGrideLoading={applicationsLoading}
        selectedRowKeys={selectedKeys}
        onSelectionChange={handleSelectionChange}
        selectionType="checkbox"
        enableRowSelection={true}
        disableDefaultRowClick={true}
        disableRowFn={shouldDisableRow} // Pass the disable function
      />

      <div style={{ display: "flex", gap: 12 }}>
      </div>
    </div>
  );
}

export default MembershipApplication;