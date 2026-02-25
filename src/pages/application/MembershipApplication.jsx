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

  useEffect(() => {
    // Only fetch if initial view determination is complete and templates are NOT currently loading
    if (!isInitialized || templatesLoading) return;

    dispatch(getApplicationsWithFilter({
      templateId: currentTemplateId || "",
      page: 1,
      limit: 10
    }));
  }, [dispatch, currentTemplateId, isInitialized, templatesLoading]);

  useEffect(() => {
    if (applications && applications.length > 0) {
      setFormattedApplications(applications);
    } else {
      setFormattedApplications([]);
    }
  }, [applications]);

  const shouldDisableRow = useCallback((record) => {
    const status = record?.applicationStatus;
    // Return true to DISABLE if status is NOT "submitted"
    return status !== "submitted";
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

  // Synchronize local selection with global context (to handle clear selection)
  useEffect(() => {
    if (selectedIds.length === 0) {
      setSelectedKeys([]);
    }
  }, [selectedIds]);

  if (!isInitialized || templatesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "50px" }}>
        <Spin tip="Initializing Template..." />
      </div>
    );
  }

  return (
    <div className="" style={{ width: "100%" }}>
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