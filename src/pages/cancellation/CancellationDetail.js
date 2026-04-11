import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Card,
  Row,
  Col,
  Tag,
  Modal,
  Table,
  message,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  PlayCircleOutlined,
  CreditCardOutlined,
  BellOutlined,
  TeamOutlined,
  MailOutlined,
  FileTextOutlined,
  MessageOutlined,
  MobileOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomSelect from "../../component/common/CustomSelect";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { formatDateDdMmYyyy } from "../../utils/Utilities";

const AMBER_BG = "#fff7e6";
const AMBER_BORDER = "#ffd591";
const AMBER_TEXT = "#d48806";
const INACTIVE_LABEL = "#8c8c8c";

const PAYMENT_METHOD_ROWS = [
  { label: "Deductions", dataKey: "deductions", color: "#215e97", pct: 42, amount: 18500 },
  { label: "Standing Orders", dataKey: "standingOrders", color: "#389e0d", pct: 28, amount: 12300 },
  { label: "Direct Debit", dataKey: "directDebit", color: "#722ed1", pct: 18, amount: 7900 },
  { label: "Credit Card", dataKey: "creditCard", color: "#d48806", pct: 8, amount: 3500 },
  { label: "Cheque", dataKey: "cheque", color: "#13c2c2", pct: 3, amount: 1300 },
  { label: "Cash", dataKey: "cash", color: "#8c8c8c", pct: 1, amount: 500 },
];

const DELIVERY_CHANNELS = [
  { key: "email", label: "Email", icon: MailOutlined, status: "Pending" },
  { key: "inapp", label: "In-app", icon: MobileOutlined, status: "Pending" },
  { key: "letters", label: "Letters", icon: FileTextOutlined, status: "Pending" },
  { key: "sms", label: "SMS", icon: MessageOutlined, status: "Pending" },
];

function scalePaymentAmounts(baseRows, targetTotal) {
  const baseSum = baseRows.reduce((a, r) => a + r.amount, 0);
  if (!baseSum || targetTotal <= 0) {
    return baseRows.map((r) => ({ ...r, amount: 0, pct: 0 }));
  }
  return baseRows.map((r) => ({
    ...r,
    amount: Math.round((r.amount / baseSum) * targetTotal),
  }));
}

function parseMoney(s) {
  if (s == null) return 0;
  const n = parseFloat(String(s).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function sumMemberFees(members) {
  if (!members?.length) return 0;
  return members.reduce(
    (acc, m) => acc + parseMoney(m.membershipFee ?? m.lastPaymentAmount),
    0,
  );
}

function formatCurrencyAmount(n) {
  return `€${Math.round(n).toLocaleString()}`;
}

function formatPercentDisplay(pct) {
  if (pct == null || Number.isNaN(Number(pct))) return "—";
  const n = Number(pct);
  const text = n % 1 === 0 ? String(Math.round(n)) : n.toFixed(1);
  return `${text}%`;
}

function isReminder3No(value) {
  return String(value ?? "").trim().toUpperCase() === "R3";
}

function CancellationDetail() {
  const location = useLocation();
  const { cancallationbyId, getCancellationById } = useReminders();
  const { isDisable } = useTableColumns();

  const pageTitle =
    location.state?.cancellationBatchTitle ||
    cancallationbyId?.title ||
    "Cancellation batch";

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const id = location.state?.cancellationBatchId;
    if (id != null) getCancellationById(id);
  }, [location.state?.cancellationBatchId, getCancellationById]);

  useEffect(() => {
    setSelectedRowKeys([]);
  }, [cancallationbyId?.id]);

  const tableMembers = useMemo(() => {
    const m = cancallationbyId?.members;
    if (!m?.length) return [];
    return m
      .filter((row) => row != null && typeof row === "object")
      .map((row, i) => ({ ...row, _rowKey: `c-${cancallationbyId.id}-${i}` }));
  }, [cancallationbyId]);

  const feeBatchTotal = sumMemberFees(tableMembers);
  const totalCount = tableMembers.length;

  const paymentRowsScaled = useMemo(
    () => scalePaymentAmounts(PAYMENT_METHOD_ROWS, feeBatchTotal),
    [feeBatchTotal],
  );

  const paymentStackChartData = useMemo(() => {
    const row = { name: "mix" };
    paymentRowsScaled.forEach((r) => {
      row[r.dataKey] = Number(r.pct) || 0;
    });
    return [row];
  }, [paymentRowsScaled]);

  const columns = useMemo(
    () => [
      {
        title: "Membership no",
        dataIndex: "membershipNo",
        key: "membershipNo",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Full name",
        dataIndex: "fullName",
        key: "fullName",
        ellipsis: true,
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        ellipsis: true,
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Mobile no",
        dataIndex: "mobileNo",
        key: "mobileNo",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Membership status",
        dataIndex: "membershipStatus",
        key: "membershipStatus",
        render: (v) => {
          const active = String(v).toLowerCase() === "active";
          const cancelled = String(v).toLowerCase() === "cancelled";
          return (
            <Tag
              color={
                active ? "success" : cancelled ? "error" : "default"
              }
            >
              {v ?? "—"}
            </Tag>
          );
        },
      },
      {
        title: "Membership category",
        dataIndex: "membershipCategory",
        key: "membershipCategory",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Work location",
        dataIndex: "workLocation",
        key: "workLocation",
        ellipsis: true,
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Branch",
        dataIndex: "branch",
        key: "branch",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Region",
        dataIndex: "region",
        key: "region",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Grade",
        dataIndex: "grade",
        key: "grade",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Section (primary)",
        dataIndex: "section",
        key: "section",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Joining date",
        dataIndex: "joiningDate",
        key: "joiningDate",
        render: (v) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {formatDateDdMmYyyy(v)}
          </span>
        ),
      },
      {
        title: "Expiry date",
        dataIndex: "expiryDate",
        key: "expiryDate",
        render: (v) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {formatDateDdMmYyyy(v)}
          </span>
        ),
      },
      {
        title: "Last payment amount",
        dataIndex: "lastPaymentAmount",
        key: "lastPaymentAmount",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Last payment date",
        dataIndex: "lastPaymentDate",
        key: "lastPaymentDate",
        render: (v) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {formatDateDdMmYyyy(v)}
          </span>
        ),
      },
      {
        title: "Membership fee",
        dataIndex: "membershipFee",
        key: "membershipFee",
        render: (t) => (
          <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
        ),
      },
      {
        title: "Outstanding balance",
        dataIndex: "outstandingBalance",
        key: "outstandingBalance",
        render: (v) => (
          <span className="membership-table-balance-cell" style={{ whiteSpace: "nowrap" }}>
            {v ?? "—"}
          </span>
        ),
      },
      {
        title: "Reminder no",
        dataIndex: "reminderNo",
        key: "reminderNo",
        render: (t) => {
          const raw = String(t ?? "").trim();
          const display = raw !== "" ? raw : "—";
          const highlightNonR3 = raw !== "" && !isReminder3No(t);
          return (
            <span
              style={{
                whiteSpace: "nowrap",
                ...(highlightNonR3
                  ? {
                      backgroundColor: "#fff1f0",
                      color: "#cf1322",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 4,
                      border: "1px solid #ffa39e",
                    }
                  : {}),
              }}
              title={
                highlightNonR3
                  ? "Reminder is not R3 — review for this cancellation batch."
                  : undefined
              }
            >
              {display}
            </span>
          );
        },
      },
      {
        title: "Reminder date",
        dataIndex: "reminderDate",
        key: "reminderDate",
        render: (v) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {formatDateDdMmYyyy(v)}
          </span>
        ),
      },
      {
        title: "Cancellation flag",
        dataIndex: "cancellationFlag",
        key: "cancellationFlag",
        render: (value) => (
          <span style={{ whiteSpace: "nowrap" }}>
            {value ? "Yes" : "No"}
          </span>
        ),
      },
    ],
    [],
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => {
      if (!isDisable) setSelectedRowKeys(keys);
    },
    getCheckboxProps: () => ({ disabled: isDisable }),
  };

  const handleDownloadCsv = () => {
    if (!tableMembers.length) {
      message.info("No rows to export.");
      return;
    }
    const header = [
      "Membership no",
      "Full name",
      "Email",
      "Mobile no",
      "Membership status",
      "Membership category",
      "Work location",
      "Branch",
      "Region",
      "Grade",
      "Section (primary)",
      "Joining date",
      "Expiry date",
      "Last payment amount",
      "Last payment date",
      "Membership fee",
      "Outstanding balance",
      "Reminder no",
      "Reminder date",
      "Cancellation flag",
    ];
    const lines = tableMembers.map((row) =>
      [
        row.membershipNo,
        row.fullName,
        row.email,
        row.mobileNo,
        row.membershipStatus,
        row.membershipCategory,
        row.workLocation,
        row.branch,
        row.region,
        row.grade,
        row.section,
        formatDateDdMmYyyy(row.joiningDate),
        formatDateDdMmYyyy(row.expiryDate),
        row.lastPaymentAmount,
        formatDateDdMmYyyy(row.lastPaymentDate),
        row.membershipFee,
        row.outstandingBalance,
        row.reminderNo,
        formatDateDdMmYyyy(row.reminderDate),
        row.cancellationFlag ? "Yes" : "No",
      ]
        .map((cell) => {
          const s = String(cell ?? "").replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cancellation-members-batch.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessBatch = () => {
    if (isDisable) return;
    message.success("Processed cancellation batch (demo).");
  };

  const handleExcludeMember = () => {
    if (isDisable) return;
    if (!selectedRowKeys.length) {
      message.warning("Select one or more members to exclude.");
      return;
    }
    message.success(`Excluded ${selectedRowKeys.length} member(s) (demo).`);
    setSelectedRowKeys([]);
  };

  return (
    <div>
      <style>{`
        .reminder-details-payment-stack { width: 100%; min-width: 0; }
        .reminder-details-payment-stack .recharts-responsive-container { width: 100% !important; }
        .reminder-details-analysis-row > .ant-col { display: flex; }
        .reminder-details-analysis-row .reminder-details-twin-card.ant-card {
          flex: 1; width: 100%; display: flex; flex-direction: column;
        }
        .reminder-details-analysis-row .reminder-details-twin-card .ant-card-head { flex-shrink: 0; }
        .reminder-details-analysis-row .reminder-details-twin-card .ant-card-body {
          flex: 1; display: flex; flex-direction: column; min-height: 0;
        }
      `}</style>
      <div className="p-3">
        <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: 20 }}>
          <Row gutter={[16, 16]} align="top">
            <Col xs={24} lg={14}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#262626",
                }}
              >
                {pageTitle}
              </h2>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "16px 24px",
                  color: "#595959",
                  fontSize: 14,
                }}
              >
                <span>
                  <UserOutlined style={{ marginRight: 8 }} />
                  {cancallationbyId?.user ?? "—"}
                </span>
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  {formatDateDdMmYyyy(cancallationbyId?.date)}
                </span>
              </div>
            </Col>
            <Col xs={24} lg={10}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: INACTIVE_LABEL,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Global status
                  </span>
                  <span
                    style={{
                      margin: 0,
                      padding: "2px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      background: AMBER_BG,
                      border: `1px solid ${AMBER_BORDER}`,
                      color: AMBER_TEXT,
                    }}
                  >
                    Pending
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    className="butn secoundry-btn"
                    icon={<ExportOutlined />}
                    disabled={isDisable}
                    onClick={() => message.info("Export batch (demo)")}
                  >
                    Export
                  </Button>
                  <Button
                    type="primary"
                    className="butn primary-btn"
                    icon={<PlayCircleOutlined />}
                    disabled={isDisable || totalCount === 0}
                    onClick={handleProcessBatch}
                  >
                    Process batch
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={8}>
            <div
              style={{
                position: "relative",
                borderRadius: 8,
                padding: "12px 32px 12px 12px",
                background: "#fff",
                border: "2px solid var(--mainBlue)",
                borderBottom: "4px solid var(--mainBlue)",
                boxShadow: "0 2px 10px rgba(33, 94, 151, 0.16)",
                height: "100%",
              }}
            >
              <ClockCircleOutlined
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "var(--mainBlue)",
                  fontSize: 15,
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  color: "var(--mainBlue)",
                  marginBottom: 6,
                  minHeight: 22,
                }}
              >
                Cancellation batch
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "4px 10px",
                  lineHeight: 1.25,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: "#262626",
                  }}
                >
                  {totalCount.toLocaleString()}{" "}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#8c8c8c",
                    }}
                  >
                    members
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--mainBlue)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatCurrencyAmount(feeBatchTotal)}
                </span>
              </div>
            </div>
          </Col>
        </Row>

        <Row
          gutter={[16, 16]}
          className="reminder-details-analysis-row"
          style={{ marginBottom: 16 }}
          align="stretch"
        >
          <Col xs={24} lg={12}>
            <Card
              className="reminder-details-twin-card"
              title={
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <CreditCardOutlined style={{ color: "var(--mainBlue)" }} />
                  Payment method analysis
                </span>
              }
              bodyStyle={{
                paddingTop: 12,
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                <div
                  className="reminder-details-payment-stack"
                  style={{ height: 52, width: "100%" }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={paymentStackChartData}
                      layout="vertical"
                      margin={{ top: 2, right: 4, left: 4, bottom: 2 }}
                      barCategoryGap={0}
                      barGap={0}
                    >
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis type="category" dataKey="name" width={0} hide />
                      <Tooltip
                        cursor={false}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const item = payload[0];
                          const row = paymentRowsScaled.find(
                            (x) => x.label === item.name,
                          );
                          const pct = item.value;
                          const m = tableMembers.length;
                          const cnt =
                            row && m > 0
                              ? Math.round((Number(pct) / 100) * m)
                              : null;
                          return (
                            <div
                              style={{
                                padding: "8px 10px",
                                background: "#fff",
                                border: "1px solid #f0f0f0",
                                borderRadius: 6,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  marginBottom: 4,
                                  color: "#262626",
                                }}
                              >
                                {item.name}
                              </div>
                              {cnt != null && (
                                <div
                                  style={{ fontSize: 12, color: "#595959" }}
                                >
                                  ~{cnt.toLocaleString()} members
                                </div>
                              )}
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "var(--mainBlue)",
                                }}
                              >
                                {formatPercentDisplay(pct)}
                              </div>
                              {row && (
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#8c8c8c",
                                    marginTop: 2,
                                  }}
                                >
                                  {formatCurrencyAmount(row.amount)}
                                </div>
                              )}
                            </div>
                          );
                        }}
                      />
                      {paymentRowsScaled.map((r) => (
                        <Bar
                          key={r.dataKey}
                          stackId="payment"
                          dataKey={r.dataKey}
                          fill={r.color}
                          name={r.label}
                          isAnimationActive={false}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px 10px",
                    marginTop: 14,
                  }}
                >
                  {paymentRowsScaled.map((r) => {
                    const m = tableMembers.length;
                    const cnt =
                      m > 0
                        ? Math.round((Number(r.pct) / 100) * m)
                        : null;
                    return (
                      <span
                        key={r.dataKey}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 12,
                          color: "#595959",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            backgroundColor: r.color,
                            flexShrink: 0,
                          }}
                          aria-hidden
                        />
                        <span
                          style={{ fontWeight: 600, color: "#262626" }}
                        >
                          {r.label}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            fontVariantNumeric: "tabular-nums",
                            color: "#595959",
                          }}
                        >
                          {cnt != null ? cnt.toLocaleString() : "—"}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 11,
                            fontVariantNumeric: "tabular-nums",
                            color: "var(--mainBlue)",
                          }}
                        >
                          {formatPercentDisplay(r.pct)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              className="reminder-details-twin-card"
              title={
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <BellOutlined style={{ color: "var(--mainBlue)" }} />
                  Delivery notifications
                </span>
              }
              bodyStyle={{
                paddingTop: 12,
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 6,
                    width: "100%",
                    flexWrap: "nowrap",
                  }}
                >
                  {DELIVERY_CHANNELS.map(
                    ({ key, label, icon: Icon, status }) => (
                      <div
                        key={key}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 6,
                          minWidth: 0,
                          textAlign: "center",
                        }}
                      >
                        <Icon
                          style={{
                            fontSize: 22,
                            color: "var(--mainBlue)",
                          }}
                          aria-hidden
                        />
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#595959",
                            lineHeight: 1.2,
                          }}
                        >
                          {label}
                        </span>
                        <Tag
                          color="gold"
                          style={{
                            margin: 0,
                            fontSize: 10,
                            padding: "0 6px",
                            lineHeight: 1.6,
                          }}
                        >
                          {status}
                        </Tag>
                      </div>
                    ),
                  )}
                </div>
                <div style={{ flex: 1, minHeight: 8 }} />
                <div
                  style={{
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: 16,
                    marginTop: "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: INACTIVE_LABEL,
                      letterSpacing: "0.05em",
                      marginBottom: 8,
                    }}
                  >
                    Last action
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#595959",
                    }}
                  >
                    <ClockCircleOutlined />
                    Awaiting batch processing
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          bodyStyle={{ paddingTop: 0 }}
          title={
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TeamOutlined style={{ color: "var(--mainBlue)" }} />
              Member listings
            </span>
          }
          extra={
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#595959",
                }}
              >
                Total: {tableMembers.length} members
              </span>
              <Button
                className="butn secoundry-btn"
                disabled={isDisable}
                onClick={() => setIsModalOpen(true)}
              >
                Add member
              </Button>
              <Button
                className="butn secoundry-btn"
                disabled={isDisable}
                onClick={handleExcludeMember}
              >
                Exclude member
              </Button>
              <Button
                type="link"
                disabled={isDisable}
                onClick={handleDownloadCsv}
                style={{
                  color: "var(--mainBlue)",
                  fontWeight: 600,
                  padding: "0 4px",
                }}
              >
                Download CSV
              </Button>
            </div>
          }
        >
          <div
            className="common-table reminder-cancellation-members-wrap"
            style={{
              width: "100%",
              overflowX: "auto",
              paddingBottom: "16px",
            }}
          >
            <Table
              rowKey="_rowKey"
              rowSelection={rowSelection}
              columns={columns}
              dataSource={tableMembers}
              pagination={false}
              bordered
              tableLayout="fixed"
              sticky
              scroll={{ x: "max-content", y: 590 }}
              size="middle"
              locale={{
                emptyText: cancallationbyId
                  ? "No members in this batch"
                  : "Open a batch from cancellations to view details",
              }}
            />
          </div>
        </Card>
      </div>
      <Modal
        className="right-modal"
        open={isModalOpen}
        title="Add member"
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
      >
        <CustomSelect placeholder="Select a memeber" />
      </Modal>
    </div>
  );
}

export default CancellationDetail;
