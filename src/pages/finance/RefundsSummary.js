import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { message, Spin } from "antd";
import { useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import AssociateMemberModal from "../../component/finanace/AssociateMemberModal";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { resolveRefundAmountEuro } from "../../utils/financeAmount";
import {
  registerRefundsListActions,
  clearRefundsListActions,
  subscribeRefundsReload,
} from "../../utils/refundsWorkspace";

const REFUNDS_ENDPOINT = "/reports/refunds";

const buildRefundsUrl = () => {
  const accountServiceBase = getAccountServiceBaseUrl();
  if (!accountServiceBase) return REFUNDS_ENDPOINT;
  return `${accountServiceBase}${REFUNDS_ENDPOINT}`;
};

const RefundsSummary = () => {
  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const refundColumns = columns.Refunds || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [filterSourceRows, setFilterSourceRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [associateRecord, setAssociateRecord] = useState(null);

  const fetchRefunds = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(buildRefundsUrl(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const payload = response?.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.data?.refunds ||
          payload?.data ||
          payload?.items ||
          payload?.results ||
          [];

      const mappedRows = rows.map((item, index) => {
        const refundAmount =
          item?.refundAmount ??
          (typeof item?.amount === "number" ? item.amount / 100 : 0);
        return {
          ...item,
          key:
            item?.key ||
            item?.id ||
            item?._id ||
            `${item?.refundId || "refund"}-${index}`,
          refundType: item?.refundType ?? item?.payoutMethod ?? "—",
          refundSource: item?.refundSource ?? item?.mode ?? "—",
          refundAmount,
          refundAmountEuro: resolveRefundAmountEuro({ refundAmount }),
          memberNo:
            item?.memberNo ??
            item?.membershipNo ??
            item?.applicationNo ??
            item?.applicationNumber ??
            item?.memberId ??
            "—",
        };
      });

      setFilterSourceRows(mappedRows);
    } catch (error) {
      console.error("Error fetching refunds report:", error);
      message.error("Failed to load refunds report");
      setFilterSourceRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const rows = useMemo(
    () =>
      applyClientSideRowFilters(
        filterSourceRows,
        filtersState,
        refundColumns,
      ),
    [filterSourceRows, filtersState, refundColumns],
  );

  useEffect(() => {
    registerRefundsListActions({
      onAssociate: (record) => setAssociateRecord(record),
    });
    return () => clearRefundsListActions();
  }, []);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    fetchRefunds();
  }, [activeTemplateId, fetchRefunds, isInitialized, templatesLoading]);

  useEffect(() => subscribeRefundsReload(fetchRefunds), [fetchRefunds]);

  useRegisterGridFilterRows("Refunds", filterSourceRows, refundColumns);

  if (!isInitialized || templatesLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "50px",
        }}
      >
        <Spin tip="Initializing Template...">
          <div style={{ minHeight: 200, width: "100%" }} />
        </Spin>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="Refunds"
        enableRowSelection={false}
      />
      <AssociateMemberModal
        open={associateRecord != null}
        onClose={() => setAssociateRecord(null)}
        onSuccess={() => fetchRefunds()}
        selectedRows={associateRecord ? [associateRecord] : []}
        variant="refunds"
      />
    </div>
  );
};

export default RefundsSummary;
