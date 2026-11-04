import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, message, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  fetchPaymentAttempts,
  resetPaymentAttempts,
} from "../../features/AccountSlice";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import RefundDrawer from "../../component/finanace/RefundDrawer";
import AssociateMemberModal from "../../component/finanace/AssociateMemberModal";
import TableComponent from "../../component/common/TableComponent";
import { useFilters } from "../../context/FilterContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { applyClientSideRowFilters } from "../../utils/filterUtils";
import { useRegisterGridFilterRows } from "../../hooks/useRegisterGridFilterRows";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import { buildApplicationMgtSearch } from "../../utils/applicationMgtRoute";
import {
  ATTEMPTS_PAGE_SIZE,
  canRefundAttempt,
  hasReceipt,
  isEmptyStatusSelection,
  normalizeAttemptRow,
  refundablePrefillEuro,
  serverFiltersFromFiltersState,
  withoutServerSideFilters,
} from "../../utils/onlinePaymentAttempts";
import {
  registerOnlinePaymentHandlers,
  clearOnlinePaymentHandlers,
  subscribeOnlinePaymentsReload,
} from "../../utils/onlinePaymentsWorkspace";

function isUnapprovedMemberRow(row) {
  return String(row?.memberId || "").trim() === "";
}

function resolvePaymentIntentId(row) {
  return String(row?.paymentIntentId || "").trim();
}

function refundInitialModeFromRecord(row) {
  if (resolvePaymentIntentId(row)) return "stripe";
  const provider = String(row?.receipt?.settlementProvider || "")
    .trim()
    .toLowerCase();
  return provider === "stripe" ? "stripe" : "external";
}

const OnlinePayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { filtersState } = useFilters();
  const { columns, setGridData, getProfile } = useTableColumns();
  const onlineColumns = columns.OnlinePayment || [];
  const {
    paymentAttempts,
    paymentAttemptsNextCursor,
    paymentAttemptsTotal,
    paymentAttemptsLoading: loading,
  } = useSelector((state) => state.account);
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching: templatesLoading } = useSelector(
    (state) => state.templateFiltersColumnApi,
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [refundDrawerOpen, setRefundDrawerOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [prefillRefundAmountEuro, setPrefillRefundAmountEuro] = useState(null);
  const [refundInitialMode, setRefundInitialMode] = useState("stripe");
  const [refundMemberSummary, setRefundMemberSummary] = useState(null);
  const [associateRecord, setAssociateRecord] = useState(null);
  const rowsRef = React.useRef([]);

  const highlightDocNo = String(location.state?.highlightDocNo || "")
    .trim()
    .toLowerCase();
  const highlightPaymentIntentId = String(location.state?.paymentIntentId || "")
    .trim()
    .toLowerCase();

  // Payment Status (lifecycle) and Payment Date go to the server; the key re-fetches page 1
  // whenever they change. The ref lets the toolbar's reload event use the latest filters.
  const serverFilters = useMemo(
    () => serverFiltersFromFiltersState(filtersState),
    [filtersState],
  );
  const serverFiltersKey = JSON.stringify(serverFilters);
  const serverFiltersRef = useRef(serverFilters);
  serverFiltersRef.current = serverFilters;

  const load = useCallback(() => {
    const filters = serverFiltersRef.current;
    if (isEmptyStatusSelection(filters)) {
      dispatch(resetPaymentAttempts());
      return;
    }
    dispatch(fetchPaymentAttempts({ ...filters, limit: ATTEMPTS_PAGE_SIZE }));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!paymentAttemptsNextCursor) return;
    dispatch(
      fetchPaymentAttempts({
        ...serverFiltersRef.current,
        limit: ATTEMPTS_PAGE_SIZE,
        cursor: paymentAttemptsNextCursor,
        append: true,
      }),
    );
  }, [dispatch, paymentAttemptsNextCursor]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    load();
  }, [activeTemplateId, isInitialized, load, templatesLoading, serverFiltersKey]);

  useEffect(() => subscribeOnlinePaymentsReload(load), [load]);

  const handleRefund = useCallback((record) => {
    if (!canRefundAttempt(record)) {
      message.warning("Refund is not available for this payment.");
      return;
    }
    const applicationId = String(record?.applicationId || "").trim();
    if (!applicationId) {
      message.warning("Application ID is missing for this transaction.");
      return;
    }
    setSelectedRecord(record);
    setPrefillRefundAmountEuro(refundablePrefillEuro(record));
    setRefundInitialMode(refundInitialModeFromRecord(record));
    setRefundMemberSummary({
      fullName: String(record?.fullName || "").trim() || "-",
      membershipCategory:
        String(record?.membershipCategory || record?.category || "").trim() ||
        "-",
    });
    setRefundDrawerOpen(true);
  }, []);

  const handleOpenMemberFinance = useCallback(
    async (record) => {
      const approved = !!record?.isApproved;
      const memberOrApplicationNo = String(record?.memberNo || "").trim();
      if (!memberOrApplicationNo || memberOrApplicationNo === "-") {
        message.warning(
          approved
            ? "Membership No is not available for this row."
            : "Application ID is not available for this row.",
        );
        return;
      }

      const applicationId = String(
        record?.applicationId || record?.ApplicationId || record?.appId || "",
      ).trim();
      if (!approved) {
        if (!applicationId) {
          message.warning("Application ID is not available for this row.");
          return;
        }
        navigate(
          `/applicationMgt${buildApplicationMgtSearch({
            applicationId,
            edit: true,
          })}`,
        );
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const baseUrl = process.env.REACT_APP_PROFILE_SERVICE_URL;
        const response = await axios.get(
          `${baseUrl}/profile/search?q=${encodeURIComponent(memberOrApplicationNo)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const results = response?.data?.data?.results || [];
        const matchedProfile =
          results.find(
            (item) =>
              String(item?.membershipNumber || "")
                .trim()
                .toLowerCase() === memberOrApplicationNo.toLowerCase(),
          ) || results[0];

        if (!matchedProfile?._id) {
          message.warning(`No member file found for ${memberOrApplicationNo}.`);
          return;
        }

        const rowList = rowsRef.current || [];
        const selectedIndex = rowList.findIndex(
          (item) => item.key === record.key,
        );
        setGridData(rowList);
        getProfile([record], selectedIndex >= 0 ? selectedIndex : 0);

        const detailsParams = new URLSearchParams(
          buildDetailsSearch(matchedProfile._id).replace("?", ""),
        );
        detailsParams.set("activeTab", "2");
        detailsParams.set(
          "memberId",
          matchedProfile.membershipNumber || memberOrApplicationNo,
        );
        // Receipt link only when this attempt has a GL Receipt (FinanceByID matches its docNo).
        const receiptRef = hasReceipt(record) ? String(record?.transactionId || "") : "";
        if (receiptRef) {
          detailsParams.set("transactionId", receiptRef);
        }
        navigate(
          {
            pathname: "/Details",
            search: `?${detailsParams.toString()}`,
          },
          {
            state: {
              ...location.state,
              search: location.state?.search || "Finance",
              activeTab: "2",
              memberId:
                matchedProfile.membershipNumber || memberOrApplicationNo || "",
              name: record?.fullName || "",
              code:
                matchedProfile.membershipNumber || memberOrApplicationNo || "",
              transactionId: receiptRef,
            },
          },
        );
      } catch (error) {
        console.error("Failed to open member finance tab:", error);
        message.error("Unable to open member file. Please try again.");
      }
    },
    [getProfile, location.state, navigate, setGridData],
  );

  useEffect(() => {
    registerOnlinePaymentHandlers({
      onRefund: handleRefund,
      onOpenFinance: handleOpenMemberFinance,
    });
    return () => clearOnlinePaymentHandlers();
  }, [handleOpenMemberFinance, handleRefund]);

  const filterSourceRows = useMemo(() => {
    if (!Array.isArray(paymentAttempts)) return [];
    return paymentAttempts.map(normalizeAttemptRow);
  }, [paymentAttempts]);

  // Server-side filters (Payment Status) are not re-applied client-side: the label match there is
  // a substring match ("Refunded" would also keep "Partially refunded").
  const clientFiltersState = useMemo(
    () => withoutServerSideFilters(filtersState),
    [filtersState],
  );

  const rows = useMemo(() => {
    if (!filterSourceRows.length) {
      rowsRef.current = [];
      return [];
    }

    const filtered = applyClientSideRowFilters(
      filterSourceRows,
      clientFiltersState,
      onlineColumns,
    );

    const withHighlights = filtered.map((row) => {
      const doc = String(row.docNo || row.transactionId || row.id || "")
        .trim()
        .toLowerCase();
      const pi = resolvePaymentIntentId(row).toLowerCase();
      const highlight =
        (highlightDocNo && doc && doc.includes(highlightDocNo)) ||
        (highlightPaymentIntentId && pi === highlightPaymentIntentId);
      return highlight ? { ...row, highlight: true } : row;
    });

    if (highlightDocNo || highlightPaymentIntentId) {
      const matched = withHighlights.filter((row) => row.highlight);
      rowsRef.current = matched.length ? matched : withHighlights;
      return rowsRef.current;
    }

    rowsRef.current = withHighlights;
    return withHighlights;
  }, [
    filterSourceRows,
    clientFiltersState,
    onlineColumns,
    highlightDocNo,
    highlightPaymentIntentId,
  ]);

  useRegisterGridFilterRows("OnlinePayment", filterSourceRows, onlineColumns);

  const buildRefundPayload = (refundData, record) => {
    const amountEuros = Number(refundData?.refund);
    const amount = Number.isFinite(amountEuros)
      ? Math.round(amountEuros * 100)
      : NaN;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Refund amount must be greater than 0.");
    }

    if (!isUnapprovedMemberRow(record)) {
      throw new Error("Refund is only allowed for unapproved members.");
    }
    const applicationId = String(record?.applicationId || "").trim();
    if (!applicationId) {
      throw new Error("Application ID is missing for this transaction.");
    }
    const mode = refundData?.mode === "external" ? "external" : "stripe";
    const refNo = String(refundData?.refNo || "").trim();
    const memo = String(refundData?.memo || "").trim();
    const refundDate = refundData?.refundDate || null;

    if (mode === "external") {
      const payoutMethod =
        refundData?.type === "Cheque" ? "cheque" : "bank_transfer";
      return {
        mode: "external",
        applicationId,
        payoutMethod,
        amount,
        currency: "eur",
        refNo,
        memo,
        refundDate,
      };
    }

    const paymentIntentId = resolvePaymentIntentId(record);
    if (!paymentIntentId) {
      throw new Error("Online refunds require a payment intent.");
    }

    return {
      paymentIntentId,
      mode: "stripe",
      applicationId,
      payoutMethod: "credit_card",
      amount,
      refNo,
      memo,
      refundDate,
    };
  };

  const handleRefundSubmit = async (refundData) => {
    if (!selectedRecord || refundSubmitting) return false;
    try {
      setRefundSubmitting(true);
      const payload = buildRefundPayload(refundData, selectedRecord);
      const token = localStorage.getItem("token");
      await axios.post(
        `${getAccountServiceBaseUrl()}/payments/refunds`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      message.success(
        `Refund of ${refundData.refund} processed successfully for ${selectedRecord?.fullName || selectedRecord?.memberNo}`,
      );
      setRefundDrawerOpen(false);
      setSelectedRecord(null);
      setPrefillRefundAmountEuro(null);
      setRefundInitialMode("stripe");
      setRefundMemberSummary(null);
      setSelectedRowKeys([]);
      load();
      return true;
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;
      message.error(backendMessage || "Unable to process refund.");
      return false;
    } finally {
      setRefundSubmitting(false);
    }
  };

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
    <div style={{ width: "100%", padding: 0 }}>
      {selectedRowKeys.length > 0 && (
        <div style={{ marginBottom: 16, padding: "8px 34px" }}>
          <span
            style={{
              padding: "8px 12px",
              background: "#f0f0f0",
              borderRadius: 4,
            }}
          >
            Selected {selectedRowKeys.length} item(s)
          </span>
        </div>
      )}
      {(highlightDocNo || highlightPaymentIntentId) && (
        <div style={{ marginBottom: 8, padding: "0 34px", fontSize: 13 }}>
          Showing match for ledger link
          {highlightDocNo ? ` · ${location.state.highlightDocNo}` : ""}
        </div>
      )}
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="OnlinePayment"
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={(keys) => setSelectedRowKeys(keys)}
        disableRowFn={(record) => !canRefundAttempt(record)}
      />
      {paymentAttemptsNextCursor && (
        <div style={{ padding: "8px 34px", display: "flex", alignItems: "center", gap: 12 }}>
          <Button onClick={loadMore} loading={loading} disabled={loading}>
            Load more
          </Button>
          <span style={{ fontSize: 13 }}>
            Loaded {Array.isArray(paymentAttempts) ? paymentAttempts.length : 0} of{" "}
            {paymentAttemptsTotal} payment attempts
          </span>
        </div>
      )}
      <RefundDrawer
        open={refundDrawerOpen}
        onClose={() => {
          setRefundDrawerOpen(false);
          setSelectedRecord(null);
          setPrefillRefundAmountEuro(null);
          setRefundInitialMode("stripe");
          setRefundMemberSummary(null);
        }}
        onSubmit={handleRefundSubmit}
        submitLoading={refundSubmitting}
        prefillRefundAmountEuro={prefillRefundAmountEuro}
        initialRefundMode={refundInitialMode}
        hideMemberSearch={true}
        memberSummary={refundMemberSummary}
      />
      <AssociateMemberModal
        open={associateRecord != null}
        onClose={() => setAssociateRecord(null)}
        onSuccess={() => load()}
        selectedRows={associateRecord ? [associateRecord] : []}
        variant="receipts"
      />
    </div>
  );
};

export default OnlinePayment;
