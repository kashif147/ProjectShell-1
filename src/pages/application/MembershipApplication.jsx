import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
// import TableComponent from "../../component/common/TableComponent";
import TableComponent from "../../component/common/TableComponent";
import { getApplicationsWithFilter } from "../../features/applicationwithfilterslice";
import { getPaymentFormsWithFilter } from "../../features/paymentFormsWithFilterSlice";
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
  const location = useLocation();
  const isPaymentFormsPage =
    (location?.pathname || "").toLowerCase() === "/paymentforms";
  const {
    applications,
    loading: applicationsLoading,
    isInitialized,
    currentTemplateId,
  } = useSelector((state) => state.applicationWithFilter);
  const {
    paymentForms,
    loading: paymentFormsLoading,
    isInitialized: isPaymentFormsInitialized,
    currentTemplateId: paymentFormsTemplateId,
  } = useSelector((state) => state.paymentFormsWithFilter || {});
  const { selectedIds, setSelectedIds } = useSelectedIds();
  const { columns } = useTableColumns();
  const { loading: templatesLoading } = useSelector((state) => state.templetefiltrsclumnapi);
  const [formattedApplications, setFormattedApplications] = useState([]);
  const [selectedRows, setSelectedRows] = useState(null)
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  console.log(activeTemplateId, "activeTemplateId activeTemplateId");

  useEffect(() => {
    const pageInitialized = isPaymentFormsPage
      ? isPaymentFormsInitialized
      : isInitialized;
    if (!pageInitialized) return;
    const templateId = isPaymentFormsPage
      ? activeTemplateId || paymentFormsTemplateId || ""
      : activeTemplateId || currentTemplateId || "";
    if (isPaymentFormsPage) {
      dispatch(
        getPaymentFormsWithFilter({
          templateId,
          page: 1,
          limit: 500,
        }),
      );
      return;
    }
    dispatch(
      getApplicationsWithFilter({
        templateId,
        page: 1,
        limit: 500,
      }),
    );
  }, [
    activeTemplateId,
    currentTemplateId,
    paymentFormsTemplateId,
    isInitialized,
    isPaymentFormsInitialized,
    isPaymentFormsPage,
    dispatch,
  ]);

  useEffect(() => {
    const sourceData = isPaymentFormsPage ? paymentForms : applications;
    if (sourceData && sourceData.length > 0) {
      setFormattedApplications(sourceData);
    } else {
      setFormattedApplications([]);
    }
  }, [applications, paymentForms, isPaymentFormsPage]);

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

  const pageLoading = isPaymentFormsPage ? paymentFormsLoading : applicationsLoading;
  const pageInitialized = isPaymentFormsPage
    ? isPaymentFormsInitialized
    : isInitialized;

  if (!pageInitialized || templatesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "50px" }}>
        <Spin tip="Initializing Template...">
          <div style={{ minHeight: 200, width: "100%" }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent
        data={formattedApplications}
        screenName={isPaymentFormsPage ? "Payment Forms" : "Applications"}
        isGrideLoading={pageLoading}
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