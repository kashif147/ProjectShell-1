import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, Input, Modal, message, Space, Spin } from "antd";
import { useLocation, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { resolveCentsAmountEuro } from "../../utils/financeAmount";
import {
  clearWriteOffListActions,
  registerWriteOffListActions,
  subscribeWriteOffsReload,
} from "../../utils/writeOffsWorkspace";

function isWriteOffReversalEntry(item) {
  const memo = String(item?.memo || "").toLowerCase();
  return memo.startsWith("reverse write-off");
}

function buildReversedDocNos(items) {
  const reversed = new Set();
  for (const item of items || []) {
    if (!isWriteOffReversalEntry(item)) continue;
    const memo = String(item.memo || "");
    const m = /^Reverse write-off\s+(\S+)/i.exec(memo);
    if (m?.[1]) reversed.add(m[1]);
  }
  return reversed;
}

const WriteOffsSummary = () => {
  const location = useLocation();
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const filterMemberId = String(location.state?.memberId || "").trim();

  const { filtersState } = useFilters();
  const { columns } = useTableColumns();
  const writeOffColumns = columns.WriteOffs || [];

  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
  );

  const [filterSourceRows, setFilterSourceRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWriteOffs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = {
        docType: "WriteOff",
        skip: 0,
        limit: 500,
      };
      if (filterMemberId) params.memberId = filterMemberId;

      const response = await axios.get(
        `${getAccountServiceBaseUrl()}/journal`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params,
        },
      );

      const items = response?.data?.data?.items;
      const safeItems = Array.isArray(items) ? items : [];
      const reversedDocNos = buildReversedDocNos(safeItems);

      const mappedRows = safeItems
        .filter((item) => !isWriteOffReversalEntry(item))
        .map((item, index) => {
          const memberEntry = Array.isArray(item?.entries)
            ? item.entries.find((entry) => entry?.memberId)
            : null;
          const docNo = item?.docNo || "-";
          const memberId = memberEntry?.memberId || "";
          const amount = memberEntry?.amount ?? "-";

          return {
            key: item?._id || `writeoff-${index}`,
            _id: item?._id,
            writeOff: docNo,
            writeOffDate: item?.date || item?.createdAt || null,
            ref: item?._id || docNo,
            amount,
            amountEuro: resolveCentsAmountEuro({ amount }),
            type: item?.txType?.description || item?.docType || "-",
            memberId,
            status: reversedDocNos.has(docNo) ? "Reversed" : "Posted",
            createdBy: item?.createdBy || "System",
            createdAt: item?.createdAt || "-",
            updatedBy: item?.updatedBy || "System",
            updatedAt: item?.updatedAt || "-",
            highlight:
              Boolean(highlightDocNo) &&
              String(docNo).trim() === highlightDocNo,
            canReverse: !reversedDocNos.has(docNo),
          };
        });

      setFilterSourceRows(mappedRows);
    } catch (error) {
      console.error("Failed to fetch write-offs:", error);
      message.error("Failed to load write-offs");
      setFilterSourceRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterMemberId, highlightDocNo]);

  const rows = useMemo(
    () =>
      applyClientSideRowFilters(
        filterSourceRows,
        filtersState,
        writeOffColumns,
      ),
    [filterSourceRows, filtersState, writeOffColumns],
  );

  const reverseWriteOff = useCallback(
    (row) => {
      const docNo = String(row?.writeOff || "").trim();
      const memberId = String(row?.memberId || "").trim();
      if (!docNo || docNo === "-") return;

      let recoveryNoteText = "";
      Modal.confirm({
        title: "Reverse write-off?",
        content: (
          <>
            <p style={{ marginBottom: 12 }}>
              Post a reversing journal for write-off {docNo}.
            </p>
            <Input.TextArea
              rows={3}
              placeholder="Recovery note (optional)"
              onChange={(e) => {
                recoveryNoteText = e.target.value;
              }}
            />
          </>
        ),
        okText: "Reverse",
        okButtonProps: { danger: true },
        onOk: async () => {
          try {
            const token = localStorage.getItem("token");
            const revNo = `WOR-${docNo}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
            await axios.post(
              `${getAccountServiceBaseUrl()}/journal/reverse-writeoff`,
              {
                writeOffDocNo: docNo,
                reversalDocNo: revNo,
                memberId,
                recoveryNote: String(recoveryNoteText || "").trim(),
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              },
            );
            message.success(`Write-off ${docNo} reversed`);
            await fetchWriteOffs();
          } catch (error) {
            message.error(
              error?.response?.data?.message ||
                error?.message ||
                "Could not reverse write-off",
            );
          }
        },
      });
    },
    [fetchWriteOffs],
  );

  useEffect(() => {
    registerWriteOffListActions({ onReverse: reverseWriteOff });
    return () => clearWriteOffListActions();
  }, [reverseWriteOff]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    fetchWriteOffs();
  }, [activeTemplateId, fetchWriteOffs, isInitialized, templatesLoading]);

  useEffect(() => subscribeWriteOffsReload(fetchWriteOffs), [fetchWriteOffs]);

  useRegisterGridFilterRows("WriteOffs", filterSourceRows, writeOffColumns);

  const memberBanner = useMemo(() => {
    if (!filterMemberId) return null;
    return (
      <Alert
        type="info"
        showIcon
        banner
        style={{ marginBottom: 8 }}
        message={
          <Space wrap>
            <span>
              Showing write-offs for member <strong>{filterMemberId}</strong>
            </span>
            <Link
              to="/Details"
              state={{ memberId: filterMemberId, activeTab: "2" }}
            >
              Open member finance
            </Link>
          </Space>
        }
      />
    );
  }, [filterMemberId]);

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
      {memberBanner}
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="WriteOffs"
        enableRowSelection={false}
      />
    </div>
  );
};

export default WriteOffsSummary;
