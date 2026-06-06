import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Row,
    Col,
    Tag,
    Modal,
    Table,
    message,
    Empty,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    ExportOutlined,
    PlayCircleOutlined,
    CreditCardOutlined,
    TeamOutlined,
    MailOutlined,
    FileTextOutlined,
    MessageOutlined,
    MobileOutlined,
    PlusOutlined,
    DeleteOutlined,
    DownloadOutlined,
    LinkOutlined,
    AppstoreOutlined,
    BankOutlined,
    MoneyCollectOutlined,
    AccountBookOutlined,
    SyncOutlined,
    BarChartOutlined,
} from "@ant-design/icons";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
} from "recharts";
import CustomSelect from "../../component/common/CustomSelect";
import { useReminders } from "../../context/CampaignDetailsProvider";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { formatDateDdMmYyyy } from "../../utils/Utilities";
import "../../styles/RemindersDetails.css";

const PAYMENT_METHOD_ROWS = [
    {
        label: "Deductions",
        dataKey: "deductions",
        color: "#215e97",
        icon: AccountBookOutlined,
        pct: 14,
        amount: 110,
    },
    {
        label: "Standing Orders",
        dataKey: "standingOrders",
        color: "#1677ff",
        icon: SyncOutlined,
        pct: 31,
        amount: 240,
    },
    {
        label: "Direct Debit",
        dataKey: "directDebit",
        color: "#597ef7",
        icon: BankOutlined,
        pct: 19,
        amount: 149,
    },
    {
        label: "Credit Card",
        dataKey: "creditCard",
        color: "#fa8c16",
        icon: CreditCardOutlined,
        pct: 30,
        amount: 235,
    },
    {
        label: "Cheque",
        dataKey: "cheque",
        color: "#13c2c2",
        icon: FileTextOutlined,
        pct: 0,
        amount: 0,
    },
    {
        label: "Cash",
        dataKey: "cash",
        color: "#8c8c8c",
        icon: MoneyCollectOutlined,
        pct: 6,
        amount: 45,
    },
];

const TEMPLATE_PREVIEWS = {
    email: {
        label: "Email",
        subject: "Membership Cancellation Notice",
        body: `Dear {{Name}},

This notice confirms that your {{Category}} membership is included in the current cancellation batch due to an outstanding balance of {{Balance}}.

Please contact us if you believe this is incorrect before the batch is processed.

Kind regards,
Membership Team`,
    },
    inapp: {
        label: "In-app",
        subject: "Cancellation notice",
        body: `Hi {{Name}}, your membership is scheduled for cancellation due to an outstanding balance of {{Balance}}. Tap to review or contact us.`,
    },
    letters: {
        label: "Letters",
        subject: "Membership cancellation notice",
        body: `Dear {{Name}},

We write to inform you that your {{Category}} membership is scheduled for cancellation following an outstanding balance of {{Balance}}.

Please contact us within 14 days if you wish to discuss this matter.`,
    },
    sms: {
        label: "SMS",
        subject: "SMS preview",
        body: `Hi {{Name}}, your membership may be cancelled due to balance {{Balance}}. Contact us or pay online. Reply STOP to opt out.`,
    },
};

const DELIVERY_CHANNELS = [
    {
        key: "email",
        label: "Email",
        icon: MailOutlined,
        iconClass: "email",
    },
    {
        key: "inapp",
        label: "In-app",
        icon: MobileOutlined,
        iconClass: "inapp",
    },
    {
        key: "letters",
        label: "Letters",
        icon: FileTextOutlined,
        iconClass: "letters",
    },
    {
        key: "sms",
        label: "SMS",
        icon: MessageOutlined,
        iconClass: "sms",
    },
];

function paymentAnalysisBaseTotal() {
    return PAYMENT_METHOD_ROWS.reduce((a, r) => a + r.amount, 0);
}

function scalePaymentAmounts(baseRows, targetTotal) {
    const baseSum = baseRows.reduce((a, r) => a + r.amount, 0);
    if (!baseSum || targetTotal <= 0) {
        return baseRows.map((r) => ({ ...r, amount: 0, pct: 0 }));
    }
    const scaled = baseRows.map((r) => ({
        ...r,
        amount: Math.round((r.amount / baseSum) * targetTotal),
    }));
    const scaledSum = scaled.reduce((a, r) => a + r.amount, 0);
    return scaled.map((r) => ({
        ...r,
        pct: scaledSum ? Math.round((r.amount / scaledSum) * 100) : 0,
    }));
}

function findDominantPaymentRow(rows) {
    if (!rows?.length) return null;
    return rows.reduce(
        (best, row) =>
            row.amount > (best?.amount ?? -1) ? row : best,
        null,
    );
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

function formatOutstandingBalanceLikeHeader(value) {
    const amount = parseMoney(value);
    const amountText = `€${Math.abs(amount).toLocaleString("en-IE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
    const indicator = amount > 0 ? "Dr" : amount < 0 ? "Cr" : "";
    return {
        text: indicator ? `${amountText} (${indicator})` : amountText,
        color: amount > 0 ? "#cf1322" : "#389e0d",
    };
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
    const navigate = useNavigate();
    const { cancallationbyId, getCancellationById } = useReminders();
    const { isDisable } = useTableColumns();

    const pageTitle =
        location.state?.cancellationBatchTitle ||
        cancallationbyId?.title ||
        "Cancellation batch";

    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeChannel, setActiveChannel] = useState("email");

    const PreviewChannelIcon =
        {
            email: MailOutlined,
            inapp: MobileOutlined,
            letters: FileTextOutlined,
            sms: MessageOutlined,
        }[activeChannel] || MailOutlined;

    useEffect(() => {
        const id = location.state?.cancellationBatchId;
        if (id != null) getCancellationById(id);
    }, [location.state?.cancellationBatchId, getCancellationById]);

    useEffect(() => {
        setSelectedRowKeys([]);
        setActiveChannel("email");
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

    const paymentAnalysisTotal =
        feeBatchTotal > 0 ? feeBatchTotal : paymentAnalysisBaseTotal();

    const paymentRowsScaled = useMemo(
        () => scalePaymentAmounts(PAYMENT_METHOD_ROWS, paymentAnalysisTotal),
        [paymentAnalysisTotal],
    );

    const dominantPaymentRow = useMemo(
        () => findDominantPaymentRow(paymentRowsScaled),
        [paymentRowsScaled],
    );

    const donutChartData = useMemo(
        () => paymentRowsScaled.filter((r) => r.amount > 0),
        [paymentRowsScaled],
    );

    const activeTemplate = TEMPLATE_PREVIEWS[activeChannel] || TEMPLATE_PREVIEWS.email;

    const columns = useMemo(
        () => [
            {
                title: "Membership no",
                dataIndex: "membershipNo",
                key: "membershipNo",
                width: 140,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Full name",
                dataIndex: "fullName",
                key: "fullName",
                width: 160,
                ellipsis: { showTitle: true },
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Email",
                dataIndex: "email",
                key: "email",
                width: 200,
                ellipsis: { showTitle: true },
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Mobile no",
                dataIndex: "mobileNo",
                key: "mobileNo",
                width: 130,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Membership status",
                dataIndex: "membershipStatus",
                key: "membershipStatus",
                width: 150,
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
                width: 150,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Work location",
                dataIndex: "workLocation",
                key: "workLocation",
                width: 160,
                ellipsis: { showTitle: true },
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Branch",
                dataIndex: "branch",
                key: "branch",
                width: 120,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Region",
                dataIndex: "region",
                key: "region",
                width: 120,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Grade",
                dataIndex: "grade",
                key: "grade",
                width: 100,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Section (primary)",
                dataIndex: "section",
                key: "section",
                width: 140,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Joining date",
                dataIndex: "joiningDate",
                key: "joiningDate",
                width: 120,
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
                width: 120,
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
                width: 150,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Last payment date",
                dataIndex: "lastPaymentDate",
                key: "lastPaymentDate",
                width: 140,
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
                width: 130,
                render: (t) => (
                    <span style={{ whiteSpace: "nowrap" }}>{t ?? "—"}</span>
                ),
            },
            {
                title: "Outstanding balance",
                dataIndex: "outstandingBalance",
                key: "outstandingBalance",
                width: 160,
                render: (v) => {
                    const { text, color } = formatOutstandingBalanceLikeHeader(v);
                    return (
                        <span style={{ whiteSpace: "nowrap", color, fontWeight: 600 }}>
                            {v == null ? "—" : text}
                        </span>
                    );
                },
            },
            {
                title: "Reminder no",
                dataIndex: "reminderNo",
                key: "reminderNo",
                width: 120,
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
                width: 120,
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
                width: 130,
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
        a.download = "cancellation-members-batch.csv";
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

    const renderChannelTab = ({ key, label, icon: Icon, iconClass }) => {
        const active = activeChannel === key;
        return (
            <button
                key={key}
                type="button"
                className={[
                    "reminder-details-channel-tab",
                    active ? "reminder-details-channel-tab--active" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                onClick={() => setActiveChannel(key)}
            >
                <Icon
                    className={[
                        "reminder-details-channel-tab-icon",
                        `reminder-details-channel-tab-icon--${iconClass}`,
                    ].join(" ")}
                />
                {label} ({totalCount})
            </button>
        );
    };

    return (
        <div className="reminder-details-page">
            <Card
                className="reminder-details-header-card"
                style={{ marginBottom: 16 }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} lg={14}>
                        <div className="reminder-details-header-main">
                            <h2 className="reminder-details-title">{pageTitle}</h2>
                            <div className="reminder-details-meta">
                                <span className="reminder-details-meta-item">
                                    <UserOutlined />
                                    {cancallationbyId?.user ?? "—"}
                                </span>
                                <span className="reminder-details-meta-item">
                                    <CalendarOutlined />
                                    {formatDateDdMmYyyy(cancallationbyId?.date)}
                                </span>
                                <span className="reminder-status-badge reminder-status-badge--pending">
                                    <span className="reminder-status-dot" />
                                    Pending
                                </span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} lg={10}>
                        <div className="reminder-details-header-actions">
                            <div className="reminder-details-header-buttons">
                                <Button
                                    className="butn secoundry-btn"
                                    icon={<ExportOutlined />}
                                    disabled={isDisable}
                                    onClick={() =>
                                        message.info("Export batch (demo)")
                                    }
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

            <Row
                gutter={[12, 8]}
                className="reminder-details-summary-row"
                align="stretch"
            >
                <Col xs={24} lg={12}>
                    <div className="reminder-details-kpi-row reminder-details-kpi-row--single">
                        <div className="reminder-details-kpi-card reminder-details-kpi-card--focused">
                            <div className="reminder-details-kpi-icon reminder-details-kpi-icon--batch">
                                <AppstoreOutlined />
                            </div>
                            <div className="reminder-details-kpi-body">
                                <div className="reminder-details-kpi-label-row reminder-details-kpi-label-row--batch">
                                    <span className="reminder-details-kpi-label">
                                        Cancellation batch
                                    </span>
                                    <span className="reminder-details-kpi-count">
                                        {totalCount.toLocaleString()} members
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={12}>
                    <div className="reminder-details-channel-panel">
                        <div className="reminder-details-channel-tabs">
                            {DELIVERY_CHANNELS.map((channel) =>
                                renderChannelTab(channel),
                            )}
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
                        className="reminder-details-twin-card reminder-details-payment-card"
                        title={
                            <span className="reminder-details-card-title">
                                <BarChartOutlined
                                    style={{ color: "var(--mainBlue)" }}
                                />
                                Payment method analysis
                            </span>
                        }
                        extra={
                            <span className="reminder-details-total-amount">
                                Total amount{" "}
                                {formatCurrencyAmount(paymentAnalysisTotal)}
                            </span>
                        }
                        styles={{
                            body: {
                                padding: "12px 16px",
                            },
                        }}
                    >
                        <div className="reminder-details-payment-layout">
                            <div className="reminder-details-donut-wrap">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                        <Pie
                                            data={donutChartData}
                                            dataKey="amount"
                                            nameKey="label"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={62}
                                            outerRadius={88}
                                            paddingAngle={2}
                                            stroke="none"
                                            isAnimationActive={false}
                                        >
                                            {paymentRowsScaled.map((entry) => (
                                                <Cell
                                                    key={entry.dataKey}
                                                    fill={entry.color}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="reminder-details-donut-center">
                                    <div className="reminder-details-donut-center-label">
                                        MAIN METHOD
                                    </div>
                                    <div className="reminder-details-donut-center-amount">
                                        {dominantPaymentRow
                                            ? formatCurrencyAmount(
                                                  dominantPaymentRow.amount,
                                              )
                                            : "—"}
                                    </div>
                                    <div className="reminder-details-donut-center-sub">
                                        Dominant
                                    </div>
                                </div>
                            </div>
                            <div className="reminder-details-payment-legend">
                                {paymentRowsScaled.map((r) => {
                                    const Icon = r.icon;
                                    const m = tableMembers.length;
                                    const cnt =
                                        m > 0
                                            ? Math.round(
                                                  (Number(r.pct) / 100) * m,
                                              )
                                            : 0;
                                    return (
                                        <div
                                            key={r.dataKey}
                                            className="reminder-details-payment-stat"
                                        >
                                            <span
                                                className="reminder-details-payment-legend-icon"
                                                style={{
                                                    background: `${r.color}18`,
                                                    color: r.color,
                                                }}
                                            >
                                                <Icon />
                                            </span>
                                            <div className="reminder-details-payment-stat-body">
                                                <span className="reminder-details-payment-legend-label">
                                                    {r.label}
                                                </span>
                                                <span className="reminder-details-payment-stat-meta">
                                                    <span className="reminder-details-payment-legend-amount">
                                                        {formatCurrencyAmount(
                                                            r.amount,
                                                        )}
                                                    </span>
                                                    <span className="reminder-details-payment-legend-pct">
                                                        {formatPercentDisplay(
                                                            r.pct,
                                                        )}
                                                        {m > 0 ? ` · ${cnt}` : ""}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        className="reminder-details-twin-card reminder-details-template-card"
                        title={
                            <span className="reminder-details-card-title">
                                <PreviewChannelIcon
                                    style={{ color: "var(--mainBlue)" }}
                                />
                                Template preview ({activeTemplate.label})
                            </span>
                        }
                        extra={
                            <button
                                type="button"
                                className="reminder-details-preview-link"
                                disabled={isDisable}
                                onClick={() =>
                                    message.info(
                                        `Preview full ${activeTemplate.label.toLowerCase()} (demo)`,
                                    )
                                }
                            >
                                Preview full{" "}
                                {activeTemplate.label.toLowerCase()}
                                <LinkOutlined />
                            </button>
                        }
                        styles={{
                            body: {
                                padding: "12px 16px",
                            },
                        }}
                    >
                        <div className="reminder-details-template-subject">
                            Subject: {activeTemplate.subject}
                        </div>
                        <div className="reminder-details-template-body">
                            {activeTemplate.body}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card
                className="reminder-details-members-card"
                title={
                    <span className="reminder-details-card-title">
                        <TeamOutlined style={{ color: "var(--mainBlue)" }} />
                        Member listings (batch)
                    </span>
                }
                extra={
                    <div className="reminder-details-members-actions">
                        <span className="reminder-details-members-total">
                            Total: {tableMembers.length} members
                        </span>
                        <Button
                            className="reminder-details-action-add"
                            icon={<PlusOutlined />}
                            disabled={isDisable}
                            onClick={() => setIsModalOpen(true)}
                        >
                            Add member
                        </Button>
                        <Button
                            className="reminder-details-action-exclude"
                            icon={<DeleteOutlined />}
                            disabled={isDisable}
                            onClick={handleExcludeMember}
                        >
                            Exclude member
                        </Button>
                        <Button
                            className="reminder-details-action-download"
                            icon={<DownloadOutlined />}
                            disabled={isDisable}
                            onClick={handleDownloadCsv}
                        >
                            Download CSV
                        </Button>
                    </div>
                }
            >
                <div className="common-table reminder-cancellation-members-wrap">
                    <Table
                        rowKey="_rowKey"
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={tableMembers}
                        pagination={false}
                        bordered
                        sticky
                        scroll={{ x: "max-content", y: 590 }}
                        size="middle"
                        locale={{
                            emptyText: (
                                <div className="reminder-details-empty-wrap">
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div>
                                                <div>
                                                    No members in this batch
                                                </div>
                                                <div className="reminder-details-empty-sub">
                                                    Open a batch from
                                                    cancellations to view details.
                                                </div>
                                            </div>
                                        }
                                    >
                                        <Button
                                            className="butn secoundry-btn"
                                            onClick={() => navigate("/Cancallation")}
                                        >
                                            Go to Cancellations
                                        </Button>
                                    </Empty>
                                </div>
                            ),
                        }}
                    />
                </div>
            </Card>

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
