import React, { useCallback, useEffect, useMemo, useState } from "react";
import { message, Spin } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { fetchStripePayments } from "../../features/AccountSlice";
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
import { resolvePaidAmountEuro } from "../../utils/onlinePaymentAmount";
import {
  registerOnlinePaymentHandlers,
  clearOnlinePaymentHandlers,
  subscribeOnlinePaymentsReload,
} from "../../utils/onlinePaymentsWorkspace";

const APPROVED_MEMBERSHIP_STATUSES = new Set([
  "active",
  "resigned",
  "cancelled",
  "suspended",
  "archived",
]);

function isApprovedRow(row) {
  const status = String(row?.membershipStatus || "").trim().toLowerCase();
  const hasMembershipNo = String(
    row?.membershipNumber || row?.memberId || "",
  ).trim() !== "";
  return hasMembershipNo || APPROVED_MEMBERSHIP_STATUSES.has(status);
}

function normalizePaymentStatus(row) {
  return String(
    row?.paymentStatus || row?.settlement?.status || row?.status || "",
  )
    .trim()
    .toLowerCase();
}

function isRefundablePayment(row) {
  return normalizePaymentStatus(row) === "pending";
}

function isUnapprovedMemberRow(row) {
  return String(row?.memberId || "").trim() === "";
}

function isRefundableUnapprovedRow(row) {
  return isRefundablePayment(row) && isUnapprovedMemberRow(row);
}

function resolvePaymentIntentId(row) {
  const candidates = [
    row?.paymentIntentId,
    row?.paymentIntent,
    row?.settlement?.paymentIntentId,
    row?.settlement?.paymentIntent,
  ];
  for (const value of candidates) {
    const normalized = String(value || "").trim();
    if (normalized) return normalized;
  }
  return "";
}

function refundInitialModeFromRecord(row) {
  if (resolvePaymentIntentId(row)) return "stripe";
  const provider = String(row?.settlement?.provider || "").trim().toLowerCase();
  return provider === "stripe" ? "stripe" : "external";
}

function resolvePrefillRefundAmountEuro(row) {
  const entries = Array.isArray(row?.entries) ? row.entries : [];
  if (!entries.length) return null;
  const recordApplicationId = String(row?.applicationId || "").trim();
  const matchById = recordApplicationId
    ? entries.find(
        (entry) =>
          String(entry?.applicationId || "").trim() === recordApplicationId,
      )
    : null;
  const withApplicationId =
    matchById ||
    entries.find((entry) => String(entry?.applicationId || "").trim() !== "");
  const cents = Number(withApplicationId?.amount);
  if (!Number.isFinite(cents) || cents <= 0) return null;
  return Math.round(cents) / 100;
}

function normalizeOnlinePaymentRow(row, index) {
    const paymentStatus = row?.settlement?.status || row?.paymentStatus || "-";
  const paymentMethod =
    row?.paymentMethod ||
    row?.paymentType ||
    row?.settlement?.provider ||
    "-";
  const transactionId =
    row?.transactionId || row?.docNo || row?.id || row?._id || "";
  return {
    isApproved: isApprovedRow(row),
    ...row,
    key: transactionId || `online-payment-${index}`,
    applicationId:
      row?.applicationId || row?.ApplicationId || row?.appId || null,
    memberNo: isApprovedRow(row)
      ? row?.membershipNumber || row?.memberId || row?.["Member No"] || "-"
      : row?.applicationId || row?.ApplicationId || row?.appId || "-",
    category: row?.category || row?.membershipCategory || "-",
    membershipCategory: row?.category || row?.membershipCategory || "-",
    membershipStatus: row?.membershipStatus || row?.memberhsipStatus || "-",
    renewalDate: row?.renewalDate || row?.RenewalDate || null,
    billingCycle: row?.billingCycle || "-",
    email: row?.email || row?.normalizedEmail || "-",
    phone: row?.phone || row?.mobileNumber || null,
    joinDate: row?.joinDate || row?.JoinDate || null,
    paymentStatus,
    paymentMethod,
    transactionId,
    fullName: row?.fullName || "-",
    paidAmount: resolvePaidAmountEuro(row),
  };
}

const OnlinePayment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { filtersState } = useFilters();
  const { columns, setGridData, getProfile } = useTableColumns();
  const onlineColumns = columns.OnlinePayment || [];
  const { stripePayments, loading } = useSelector((state) => state.account);
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector(
    (state) => state.templetefiltrsclumnapi,
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
  const highlightPaymentIntentId = String(
    location.state?.paymentIntentId || "",
  )
    .trim()
    .toLowerCase();

  const load = useCallback(() => {
    dispatch(fetchStripePayments());
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    load();
  }, [activeTemplateId, isInitialized, load, templatesLoading]);

  useEffect(() => subscribeOnlinePaymentsReload(load), [load]);

  const handleRefund = useCallback((record) => {
    if (!isRefundablePayment(record)) {
      message.warning("Refund is only available for pending transactions.");
      return;
    }
    if (!isUnapprovedMemberRow(record)) {
      message.warning("Refund is only available for unapproved members.");
      return;
    }
    const applicationId = String(record?.applicationId || "").trim();
    if (!applicationId) {
      message.warning("Application ID is missing for this transaction.");
      return;
    }
    setSelectedRecord(record);
    setPrefillRefundAmountEuro(resolvePrefillRefundAmountEuro(record));
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
              String(item?.membershipNumber || "").trim().toLowerCase() ===
              memberOrApplicationNo.toLowerCase(),
          ) || results[0];

        if (!matchedProfile?._id) {
          message.warning(`No member file found for ${memberOrApplicationNo}.`);
          return;
        }

        const rowList = rowsRef.current || [];
        const selectedIndex = rowList.findIndex((item) => item.key === record.key);
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
        if (record?.transactionId) {
          detailsParams.set("transactionId", String(record.transactionId));
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
              transactionId: record?.transactionId || "",
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
      isRefundableUnapprovedRow,
    });
    return () => clearOnlinePaymentHandlers();
  }, [handleOpenMemberFinance, handleRefund]);

  const filterSourceRows = useMemo(() => {
    if (!Array.isArray(stripePayments)) return [];
    return stripePayments.map(normalizeOnlinePaymentRow);
  }, [stripePayments]);

  const rows = useMemo(() => {
    if (!filterSourceRows.length) {
      rowsRef.current = [];
      return [];
    }

    const filtered = applyClientSideRowFilters(
      filterSourceRows,
      filtersState,
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
    filtersState,
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
      dispatch(fetchStripePayments());
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
        disableRowFn={(record) => !isRefundableUnapprovedRow(record)}
      />
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
        onSuccess={() => dispatch(fetchStripePayments())}
        selectedRows={associateRecord ? [associateRecord] : []}
        variant="receipts"
      />
    </div>
  );
};

export default OnlinePayment;
