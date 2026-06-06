import React, { useMemo, useState, useEffect, useCallback } from "react";
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
    Checkbox,
    Empty,
} from "antd";
import {
    CalendarOutlined,
    UserOutlined,
    ExportOutlined,
    PlayCircleOutlined,
    CreditCardOutlined,
    BellOutlined,
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
import htmlDocx from "html-docx-js/dist/html-docx";
import "../../styles/RemindersDetails.css";

function paymentAnalysisBaseTotal() {
    return PAYMENT_METHOD_ROWS.reduce((a, r) => a + r.amount, 0);
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

/** Deduplicated members across R1–R3 (first occurrence wins). */
function buildComprehensiveMembers(members) {
    if (!members) return [];
    const seen = new Set();
    const list = [];
    let idx = 0;
    for (const wave of ["R1", "R2", "R3"]) {
        for (const row of members[wave] || []) {
            if (row == null || typeof row !== "object") continue;
            const k = `${row.membershipNo}|${row.fullName}`;
            if (seen.has(k)) continue;
            seen.add(k);
            list.push({ ...row, _rowKey: `m-${idx++}` });
        }
    }
    return list;
}

/** All rows for one reminder wave (table needs stable keys). */
function buildWaveMembers(members, wave) {
    const arr = members?.[wave] || [];
    return arr
        .filter((row) => row != null && typeof row === "object")
        .map((row, i) => ({ ...row, _rowKey: `${wave}-${i}` }));
}

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
        subject: "Outstanding Account Balance Reminder",
        body: `Dear {{Name}},

This is a friendly reminder that your account currently has an outstanding balance of {{Balance}} for your {{Category}} package.

Please arrange payment at your earliest convenience to avoid any interruption to your membership benefits.

Kind regards,
Membership Team`,
    },
    inapp: {
        label: "In-app",
        subject: "Payment reminder",
        body: `Hi {{Name}}, your membership account has an outstanding balance of {{Balance}}. Tap to view details and pay online.`,
    },
    letters: {
        label: "Letters",
        subject: "Outstanding balance notice",
        body: `Dear {{Name}},

We write to inform you that your account shows an outstanding balance of {{Balance}} relating to your {{Category}} membership.

Please contact us or submit payment within 14 days.`,
    },
    sms: {
        label: "SMS",
        subject: "SMS preview",
        body: `Hi {{Name}}, reminder: outstanding balance {{Balance}} on your {{Category}} membership. Pay online or call us. Reply STOP to opt out.`,
    },
};

const DELIVERY_CHANNELS = [
    {
        key: "email",
        label: "Email",
        icon: MailOutlined,
        iconClass: "email",
        status: "Pending",
    },
    {
        key: "inapp",
        label: "In-app",
        icon: MobileOutlined,
        iconClass: "inapp",
        status: "Pending",
    },
    {
        key: "letters",
        label: "Letters",
        icon: FileTextOutlined,
        iconClass: "letters",
        status: "Pending",
    },
    {
        key: "sms",
        label: "SMS",
        icon: MessageOutlined,
        iconClass: "sms",
        status: "Pending",
    },
];

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

const WAVE_ORDER = ["R1", "R2", "R3"];

function sortWaves(waves) {
    return [...new Set(waves)].sort(
        (a, b) => WAVE_ORDER.indexOf(a) - WAVE_ORDER.indexOf(b),
    );
}

function buildMultiWaveMembers(members, waves) {
    if (!members || !waves?.length) return [];
    const sorted = sortWaves(waves);
    const out = [];
    for (const wave of sorted) {
        out.push(...buildWaveMembers(members, wave));
    }
    return out;
}

function reminderWaveNums(waves) {
    return sortWaves(waves)
        .map((w) => parseInt(String(w).replace(/^R/i, ""), 10))
        .filter((n) => !Number.isNaN(n));
}

/** includedWaves = R1–R3 not excluded from batch trigger. */
function formatTriggerButtonLabel(includedWaves) {
    if (includedWaves.length === WAVE_ORDER.length) {
        return "Trigger all reminders";
    }
    const nums = reminderWaveNums(includedWaves);
    if (nums.length === 0) return "Select reminders to trigger";
    if (nums.length === 1) return `Trigger reminder ${nums[0]}`;
    if (nums.length === 2) return `Trigger reminder ${nums[0]} & ${nums[1]}`;
    return `Trigger reminder ${nums[0]}, ${nums[1]} & ${nums[2]}`;
}

function formatMemberListTitle(includedWaves) {
    if (includedWaves.length === WAVE_ORDER.length) {
        return "Member listings (batch)";
    }
    if (includedWaves.length === 0) return "Member listings";
    const sorted = sortWaves(includedWaves);
    if (sorted.length === 1) return `Member listings (${sorted[0]})`;
    return `Member listings (${sorted.join(", ")})`;
}

function memberListHeading(activeView, includedWaves) {
    if (activeView !== "batch") {
        return `Member listings (${activeView})`;
    }
    return formatMemberListTitle(includedWaves);
}

function escapeHtmlDocx(s) {
    return String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function sanitizeDocxFileBase(name) {
    const base = String(name || "batch").replace(/[^a-zA-Z0-9-_]+/g, "-");
    return base.slice(0, 80) || "batch";
}

function RemindersDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedId, getRemindersById } = useReminders();
    const { isDisable } = useTableColumns();

    useEffect(() => {
        const id = location.state?.reminderBatchId;
        if (id != null) getRemindersById(id);
    }, [location.state?.reminderBatchId, getRemindersById]);

    const pageTitle =
        location.state?.reminderBatchTitle ||
        selectedId?.title ||
        "Reminders batch";

    /** Waves excluded from trigger (unchecked). Default none = all included. */
    const [excludedWaves, setExcludedWaves] = useState([]);
    /** Which reminder the list & chart below follow: whole batch vs one wave. */
    const [activeView, setActiveView] = useState("batch");
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

    const includedWaves = useMemo(
        () => WAVE_ORDER.filter((w) => !excludedWaves.includes(w)),
        [excludedWaves],
    );
    const allWavesIncluded = includedWaves.length === WAVE_ORDER.length;

    const toggleWaveExcluded = useCallback((wave) => {
        setExcludedWaves((prev) =>
            prev.includes(wave)
                ? prev.filter((w) => w !== wave)
                : [...prev, wave],
        );
    }, []);

    const clearWaveExclusions = useCallback(() => {
        setExcludedWaves([]);
    }, []);

    useEffect(() => {
        setExcludedWaves([]);
        setActiveView("batch");
        setSelectedRowKeys([]);
        setActiveChannel("email");
    }, [selectedId?.id]);

    const selectionKey = `${[...excludedWaves].sort().join(",")}|${activeView}`;

    useEffect(() => {
        setSelectedRowKeys([]);
    }, [selectionKey]);

    const totalR1 = selectedId?.members?.R1?.length ?? 0;
    const totalR2 = selectedId?.members?.R2?.length ?? 0;
    const totalR3 = selectedId?.members?.R3?.length ?? 0;

    const feeR1 = sumMemberFees(selectedId?.members?.R1);
    const feeR2 = sumMemberFees(selectedId?.members?.R2);
    const feeR3 = sumMemberFees(selectedId?.members?.R3);

    const comprehensiveMembers = useMemo(
        () => buildComprehensiveMembers(selectedId?.members),
        [selectedId],
    );
    const totalBatchCount = comprehensiveMembers.length;
    const feeBatchTotal = sumMemberFees(comprehensiveMembers);

    const tableMembers = useMemo(() => {
        if (!selectedId?.members) return [];
        if (activeView !== "batch") {
            return buildWaveMembers(selectedId.members, activeView);
        }
        if (allWavesIncluded) {
            return comprehensiveMembers;
        }
        return buildMultiWaveMembers(selectedId.members, includedWaves);
    }, [
        selectedId,
        activeView,
        allWavesIncluded,
        includedWaves,
        comprehensiveMembers,
    ]);

    const selectedFeeTotal = useMemo(() => {
        if (activeView === "R1") return feeR1;
        if (activeView === "R2") return feeR2;
        if (activeView === "R3") return feeR3;
        if (allWavesIncluded) return feeBatchTotal;
        let sum = 0;
        if (includedWaves.includes("R1")) sum += feeR1;
        if (includedWaves.includes("R2")) sum += feeR2;
        if (includedWaves.includes("R3")) sum += feeR3;
        return sum;
    }, [
        activeView,
        allWavesIncluded,
        includedWaves,
        feeR1,
        feeR2,
        feeR3,
        feeBatchTotal,
    ]);

    const paymentAnalysisTotal =
        selectedFeeTotal > 0 ? selectedFeeTotal : paymentAnalysisBaseTotal();

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

    const memberListTitle = memberListHeading(activeView, includedWaves);

    const triggerButtonLabel = formatTriggerButtonLabel(includedWaves);

    const handleTriggerSelected = () => {
        if (isDisable) return;
        if (includedWaves.length === 0) return;
        if (allWavesIncluded) {
            message.success("Triggered all reminders in batch (demo).");
            return;
        }
        const labels = sortWaves(includedWaves).join(", ");
        message.success(`Triggered ${labels} (demo).`);
    };

    const addressText = (row) => {
        const parts = [row.workLocation, row.branch].filter(Boolean);
        return parts.length ? parts.join(", ") : "—";
    };

    const columns = [
        {
            title: "Full name",
            dataIndex: "fullName",
            key: "fullName",
            width: 160,
            ellipsis: { showTitle: true },
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
            ellipsis: { showTitle: true },
        },
        {
            title: "Address",
            key: "address",
            width: 220,
            ellipsis: { showTitle: true },
            render: (_, row) => {
                const full = addressText(row);
                const max = 42;
                const short =
                    full.length > max ? `${full.slice(0, max)}…` : full;
                return <span title={full}>{short}</span>;
            },
        },
        {
            title: "Membership no",
            dataIndex: "membershipNo",
            key: "membershipNo",
            width: 140,
        },
        {
            title: "Category",
            dataIndex: "membershipCategory",
            key: "membershipCategory",
            width: 120,
        },
        {
            title: "Status",
            dataIndex: "membershipStatus",
            key: "membershipStatus",
            width: 110,
            render: (v) => {
                const active = String(v).toLowerCase() === "active";
                return (
                    <Tag color={active ? "success" : "default"}>{v}</Tag>
                );
            },
        },
        {
            title: "Start date",
            dataIndex: "joiningDate",
            key: "joiningDate",
            width: 120,
            render: (v) => formatDateDdMmYyyy(v),
        },
        {
            title: "Balance",
            dataIndex: "outstandingBalance",
            key: "outstandingBalance",
            width: 140,
            render: (v) => {
                const { text, color } = formatOutstandingBalanceLikeHeader(v);
                return <span style={{ color, fontWeight: 600 }}>{text}</span>;
            },
        },
        {
            title: "Last payment",
            dataIndex: "lastPaymentDate",
            key: "lastPaymentDate",
            width: 130,
            render: (v) => formatDateDdMmYyyy(v),
        },
    ];

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
            "Full name",
            "Email",
            "Address",
            "Membership no",
            "Category",
            "Status",
            "Start date",
            "Balance",
            "Last payment",
        ];
        const lines = tableMembers.map((row) =>
            [
                row.fullName,
                row.email,
                addressText(row),
                row.membershipNo,
                row.membershipCategory,
                row.membershipStatus,
                formatDateDdMmYyyy(row.joiningDate),
                row.outstandingBalance,
                formatDateDdMmYyyy(row.lastPaymentDate),
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
        a.download = `reminder-members-${
            activeView !== "batch"
                ? activeView
                : allWavesIncluded
                  ? "batch"
                  : sortWaves(includedWaves).join("-") || "none"
        }.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadReminder3Word = () => {
        if (isDisable) return;
        if (activeView !== "R3") return;
        if (!tableMembers.length) {
            message.info("No members to export.");
            return;
        }
        try {
            const headerCells = [
                "Full name",
                "Email",
                "Address",
                "Membership no",
                "Category",
                "Status",
                "Start date",
                "Balance",
                "Last payment",
            ]
                .map(
                    (h) =>
                        `<th style="border:1px solid #ccc;padding:6px;text-align:left;font-size:10pt;">${escapeHtmlDocx(
                            h,
                        )}</th>`,
                )
                .join("");
            const bodyRows = tableMembers
                .map((row) => {
                    const cells = [
                        row.fullName,
                        row.email,
                        addressText(row),
                        row.membershipNo,
                        row.membershipCategory,
                        row.membershipStatus,
                        formatDateDdMmYyyy(row.joiningDate),
                        row.outstandingBalance,
                        formatDateDdMmYyyy(row.lastPaymentDate),
                    ]
                        .map(
                            (c) =>
                                `<td style="border:1px solid #ccc;padding:6px;font-size:9pt;">${escapeHtmlDocx(
                                    c,
                                )}</td>`,
                        )
                        .join("");
                    return `<tr>${cells}</tr>`;
                })
                .join("");
            const completeHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<style>
body { font-family: Calibri, Arial, sans-serif; color: #000; margin: 12pt; }
h1 { font-size: 18pt; margin: 0 0 8pt 0; }
.meta { font-size: 11pt; color: #333; margin-bottom: 14pt; }
table { border-collapse: collapse; width: 100%; }
</style>
</head>
<body>
<h1>Reminder 3 — ${escapeHtmlDocx(pageTitle)}</h1>
<p class="meta">Members: ${tableMembers.length.toLocaleString()} · Total fees (R3): ${escapeHtmlDocx(
                formatCurrencyAmount(feeR3),
            )}</p>
<table>
<thead><tr>${headerCells}</tr></thead>
<tbody>${bodyRows}</tbody>
</table>
</body>
</html>`;
            const docxBlob = htmlDocx.asBlob(completeHtml, {
                orientation: "portrait",
                margins: {
                    top: 1440,
                    right: 1440,
                    bottom: 1440,
                    left: 1440,
                },
            });
            const url = URL.createObjectURL(docxBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reminder-3-${sanitizeDocxFileBase(
                pageTitle,
            )}.docx`;
            a.click();
            URL.revokeObjectURL(url);
            message.success("Word document downloaded.");
        } catch (err) {
            console.error(err);
            message.error("Could not create Word document.");
        }
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

    const renderReminderTile = (wave, label, count, iconClass) => {
        const included = !excludedWaves.includes(wave);
        const focused = activeView === wave;
        return (
            <div
                className={[
                    "reminder-details-kpi-card",
                    focused ? "reminder-details-kpi-card--focused" : "",
                    !included ? "reminder-details-kpi-card--excluded" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                onClick={(e) => {
                    if (e.target.closest(".reminder-details-kpi-check")) return;
                    setActiveView(wave);
                }}
                title={`View ${label} members`}
            >
                <div
                    className={`reminder-details-kpi-icon reminder-details-kpi-icon--${iconClass}`}
                >
                    <BellOutlined />
                </div>
                <div className="reminder-details-kpi-body">
                    <div className="reminder-details-kpi-label-row">
                        <span className="reminder-details-kpi-check">
                            <Checkbox
                                checked={included}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    toggleWaveExcluded(wave);
                                }}
                            />
                        </span>
                        <span className="reminder-details-kpi-label">
                            {label}
                        </span>
                        <span className="reminder-details-kpi-count">
                            {count.toLocaleString()} members
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderTotalTile = () => {
        const focused = activeView === "batch";
        const allIn = allWavesIncluded;
        return (
            <div
                role="button"
                tabIndex={0}
                className={[
                    "reminder-details-kpi-card",
                    focused ? "reminder-details-kpi-card--focused" : "",
                    !allIn ? "reminder-details-kpi-card--excluded" : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                onClick={() => {
                    setActiveView("batch");
                    clearWaveExclusions();
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveView("batch");
                        clearWaveExclusions();
                    }
                }}
                title="View full batch and include all reminders again"
            >
                <div className="reminder-details-kpi-icon reminder-details-kpi-icon--batch">
                    <AppstoreOutlined />
                </div>
                <div className="reminder-details-kpi-body">
                    <div className="reminder-details-kpi-label-row reminder-details-kpi-label-row--batch">
                        <span className="reminder-details-kpi-label">
                            Total batch
                        </span>
                        <span className="reminder-details-kpi-count">
                            {totalBatchCount.toLocaleString()} members
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const channelMemberCount = tableMembers.length;

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
                {label} ({channelMemberCount})
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
                            <h2 className="reminder-details-title">
                                {pageTitle}
                            </h2>
                            <div className="reminder-details-meta">
                                <span className="reminder-details-meta-item">
                                    <UserOutlined />
                                    {selectedId?.user ?? "—"}
                                </span>
                                <span className="reminder-details-meta-item">
                                    <CalendarOutlined />
                                    {formatDateDdMmYyyy(selectedId?.date)}
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
                                    disabled={
                                        isDisable || includedWaves.length === 0
                                    }
                                    onClick={handleTriggerSelected}
                                >
                                    {triggerButtonLabel}
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
                    <div className="reminder-details-kpi-row">
                        {renderReminderTile("R1", "Reminder 1", totalR1, "r1")}
                        {renderReminderTile("R2", "Reminder 2", totalR2, "r2")}
                        {renderReminderTile("R3", "Reminder 3", totalR3, "r3")}
                        {renderTotalTile()}
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
                                                        {m > 0
                                                            ? ` · ${cnt}`
                                                            : ""}
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
                        {memberListTitle}
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
                        {activeView === "R3" && (
                            <Button
                                className="reminder-details-action-download"
                                icon={<FileTextOutlined />}
                                disabled={isDisable}
                                onClick={handleDownloadReminder3Word}
                            >
                                Download Word
                            </Button>
                        )}
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
                                                    {selectedId
                                                        ? "No members in this batch"
                                                        : "No members in this batch"}
                                                </div>
                                                <div className="reminder-details-empty-sub">
                                                    Open a batch from reminders
                                                    to view details.
                                                </div>
                                            </div>
                                        }
                                    >
                                        <Button
                                            className="butn secoundry-btn"
                                            onClick={() =>
                                                navigate("/RemindersSummary")
                                            }
                                        >
                                            Go to Reminders
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

export default RemindersDetails;
