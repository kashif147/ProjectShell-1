import React, { useMemo, useState, useEffect, useCallback } from "react";
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
    Checkbox,
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
import htmlDocx from "html-docx-js/dist/html-docx";

const AMBER_BG = "#fff7e6";
const AMBER_BORDER = "#ffd591";
const AMBER_TEXT = "#d48806";
const INACTIVE_BORDER = "#d9d9d9";
const INACTIVE_LABEL = "#8c8c8c";

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
        pct: 42,
        amount: 18500,
    },
    {
        label: "Standing Orders",
        dataKey: "standingOrders",
        color: "#389e0d",
        pct: 28,
        amount: 12300,
    },
    {
        label: "Direct Debit",
        dataKey: "directDebit",
        color: "#722ed1",
        pct: 18,
        amount: 7900,
    },
    {
        label: "Credit Card",
        dataKey: "creditCard",
        color: "#d48806",
        pct: 8,
        amount: 3500,
    },
    {
        label: "Cheque",
        dataKey: "cheque",
        color: "#13c2c2",
        pct: 3,
        amount: 1300,
    },
    {
        label: "Cash",
        dataKey: "cash",
        color: "#8c8c8c",
        pct: 1,
        amount: 500,
    },
];

const DELIVERY_CHANNELS = [
    {
        key: "email",
        label: "Email",
        icon: MailOutlined,
        status: "Pending",
    },
    {
        key: "inapp",
        label: "In-app",
        icon: MobileOutlined,
        status: "Pending",
    },
    {
        key: "letters",
        label: "Letters",
        icon: FileTextOutlined,
        status: "Pending",
    },
    {
        key: "sms",
        label: "SMS",
        icon: MessageOutlined,
        status: "Pending",
    },
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
    const { selectedId } = useReminders();
    const { isDisable } = useTableColumns();

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

    const paymentRowsScaled = useMemo(
        () => scalePaymentAmounts(PAYMENT_METHOD_ROWS, selectedFeeTotal),
        [selectedFeeTotal],
    );

    const paymentStackChartData = useMemo(() => {
        const row = { name: "mix" };
        paymentRowsScaled.forEach((r) => {
            row[r.dataKey] = Number(r.pct) || 0;
        });
        return [row];
    }, [paymentRowsScaled]);

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
            ellipsis: true,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            ellipsis: true,
        },
        {
            title: "Address",
            key: "address",
            ellipsis: true,
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
        },
        {
            title: "Category",
            dataIndex: "membershipCategory",
            key: "membershipCategory",
        },
        {
            title: "Status",
            dataIndex: "membershipStatus",
            key: "membershipStatus",
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
            render: (v) => formatDateDdMmYyyy(v),
        },
        {
            title: "Balance",
            dataIndex: "outstandingBalance",
            key: "outstandingBalance",
            render: (v) => (
                <span style={{ color: "#cf1322", fontWeight: 600 }}>{v}</span>
            ),
        },
        {
            title: "Last payment",
            dataIndex: "lastPaymentDate",
            key: "lastPaymentDate",
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

    const renderReminderTile = (wave, label, count, feeAmount) => {
        const included = !excludedWaves.includes(wave);
        const focused = activeView === wave;
        const navHighlight = focused;
        return (
            <div
                onClick={() => setActiveView(wave)}
                title={`View ${label} members`}
                style={{
                    position: "relative",
                    borderRadius: 8,
                    padding: "12px 32px 12px 12px",
                    background: "#fff",
                    border: navHighlight
                        ? "2px solid var(--mainBlue)"
                        : included
                          ? `1px solid #bfbfbf`
                          : `1px solid ${INACTIVE_BORDER}`,
                    borderBottom: navHighlight
                        ? "4px solid var(--mainBlue)"
                        : included
                          ? "2px solid var(--mainBlue)"
                          : `1px solid ${INACTIVE_BORDER}`,
                    boxShadow: navHighlight
                        ? "0 2px 10px rgba(33, 94, 151, 0.16)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    height: "100%",
                    cursor: "pointer",
                    outline: "none",
                }}
            >
                <ClockCircleOutlined
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        color: navHighlight
                            ? "var(--mainBlue)"
                            : included
                              ? "var(--mainBlue)"
                              : "#bfbfbf",
                        fontSize: 15,
                        opacity: included ? 1 : 0.65,
                    }}
                />
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                        minHeight: 22,
                    }}
                >
                    <span
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <Checkbox
                            checked={included}
                            disabled={isDisable}
                            onChange={() => toggleWaveExcluded(wave)}
                        />
                    </span>
                    <div
                        style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            color: included
                                ? "var(--mainBlue)"
                                : INACTIVE_LABEL,
                            flex: 1,
                        }}
                    >
                        {label}
                    </div>
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
                            color: included ? "#262626" : "#8c8c8c",
                        }}
                    >
                        {count.toLocaleString()}{" "}
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: included ? "#8c8c8c" : "#bfbfbf",
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
                            color: included ? "var(--mainBlue)" : "#8c8c8c",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {formatCurrencyAmount(feeAmount)}
                    </span>
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
                style={{
                    position: "relative",
                    borderRadius: 8,
                    padding: "12px 32px 12px 12px",
                    background: "#fff",
                    border: focused
                        ? "2px solid var(--mainBlue)"
                        : allIn
                          ? `1px solid #bfbfbf`
                          : `1px solid ${INACTIVE_BORDER}`,
                    borderBottom: focused
                        ? "4px solid var(--mainBlue)"
                        : allIn
                          ? "2px solid var(--mainBlue)"
                          : `1px solid ${INACTIVE_BORDER}`,
                    boxShadow: focused
                        ? "0 2px 10px rgba(33, 94, 151, 0.16)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    height: "100%",
                    cursor: "pointer",
                    outline: "none",
                }}
            >
                <ClockCircleOutlined
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        color: focused
                            ? "var(--mainBlue)"
                            : allIn
                              ? "var(--mainBlue)"
                              : "#bfbfbf",
                        fontSize: 15,
                        opacity: allIn ? 1 : 0.65,
                    }}
                />
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        color: focused
                            ? "var(--mainBlue)"
                            : allIn
                              ? "var(--mainBlue)"
                              : INACTIVE_LABEL,
                        marginBottom: 6,
                        minHeight: 22,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    Total batch
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
                            color: allIn ? "#262626" : "#8c8c8c",
                        }}
                    >
                        {totalBatchCount.toLocaleString()}{" "}
                        <span
                            style={{
                                fontSize: 11,
                                fontWeight: 500,
                                color: allIn ? "#8c8c8c" : "#bfbfbf",
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
                            color: allIn ? "var(--mainBlue)" : "#8c8c8c",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {formatCurrencyAmount(feeBatchTotal)}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div>
            <style>{`
        .ant-table-cell {
          white-space: nowrap !important;
        }
        .reminder-details-payment-stack {
          width: 100%;
          min-width: 0;
        }
        .reminder-details-payment-stack .recharts-responsive-container {
          width: 100% !important;
        }
        .reminder-details-analysis-row > .ant-col {
          display: flex;
        }
        .reminder-details-analysis-row .reminder-details-twin-card.ant-card {
          flex: 1;
          width: 100%;
          display: flex;
          flex-direction: column;
        }
        .reminder-details-analysis-row .reminder-details-twin-card .ant-card-head {
          flex-shrink: 0;
        }
        .reminder-details-analysis-row .reminder-details-twin-card .ant-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .reminder-details-members-table {
          margin-top: 0 !important;
        }
        .reminder-details-members-table .ant-table-tbody > tr.ant-table-measure-row,
        .reminder-details-members-table .ant-table-tbody > tr.ant-table-measure-row > td {
          height: 0 !important;
          min-height: 0 !important;
          line-height: 0 !important;
          padding: 0 !important;
          border-top: 0 !important;
          border-bottom: 0 !important;
          font-size: 0 !important;
          overflow: hidden !important;
          visibility: hidden !important;
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
                                    {selectedId?.user ?? "—"}
                                </span>
                                <span>
                                    <CalendarOutlined
                                        style={{ marginRight: 8 }}
                                    />
                                    {formatDateDdMmYyyy(selectedId?.date)}
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
                                            isDisable ||
                                            includedWaves.length === 0
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

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} xl={6}>
                        {renderReminderTile("R1", "Reminder 1", totalR1, feeR1)}
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        {renderReminderTile("R2", "Reminder 2", totalR2, feeR2)}
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        {renderReminderTile("R3", "Reminder 3", totalR3, feeR3)}
                    </Col>
                    <Col xs={24} sm={12} xl={6}>
                        {renderTotalTile()}
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
                                    <CreditCardOutlined
                                        style={{ color: "var(--mainBlue)" }}
                                    />
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
                            <div
                                style={{
                                    flex: 1,
                                    width: "100%",
                                    minWidth: 0,
                                }}
                            >
                                <div
                                    className="reminder-details-payment-stack"
                                    style={{ height: 52, width: "100%" }}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={paymentStackChartData}
                                            layout="vertical"
                                            margin={{
                                                top: 2,
                                                right: 4,
                                                left: 4,
                                                bottom: 2,
                                            }}
                                            barCategoryGap={0}
                                            barGap={0}
                                        >
                                            <XAxis
                                                type="number"
                                                domain={[0, 100]}
                                                hide
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                width={0}
                                                hide
                                            />
                                            <Tooltip
                                                cursor={false}
                                                content={({
                                                    active,
                                                    payload,
                                                }) => {
                                                    if (
                                                        !active ||
                                                        !payload?.length
                                                    ) {
                                                        return null;
                                                    }
                                                    const item = payload[0];
                                                    const label = item.name;
                                                    const row =
                                                        paymentRowsScaled.find(
                                                            (x) =>
                                                                x.label ===
                                                                label,
                                                        );
                                                    const pct = item.value;
                                                    const m =
                                                        tableMembers.length;
                                                    const cnt =
                                                        row && m > 0
                                                            ? Math.round(
                                                                  (Number(
                                                                      pct,
                                                                  ) /
                                                                      100) *
                                                                      m,
                                                              )
                                                            : null;
                                                    return (
                                                        <div
                                                            style={{
                                                                padding:
                                                                    "8px 10px",
                                                                background:
                                                                    "#fff",
                                                                border: "1px solid #f0f0f0",
                                                                borderRadius: 6,
                                                                boxShadow:
                                                                    "0 2px 8px rgba(0,0,0,0.08)",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                    marginBottom: 4,
                                                                    color: "#262626",
                                                                }}
                                                            >
                                                                {label}
                                                            </div>
                                                            {cnt != null && (
                                                                <div
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: "#595959",
                                                                    }}
                                                                >
                                                                    ~
                                                                    {cnt.toLocaleString()}{" "}
                                                                    members
                                                                </div>
                                                            )}
                                                            <div
                                                                style={{
                                                                    fontSize: 12,
                                                                    fontWeight: 600,
                                                                    color: "var(--mainBlue)",
                                                                }}
                                                            >
                                                                {formatPercentDisplay(
                                                                    pct,
                                                                )}
                                                            </div>
                                                            {row && (
                                                                <div
                                                                    style={{
                                                                        fontSize: 12,
                                                                        color: "#8c8c8c",
                                                                        marginTop: 2,
                                                                    }}
                                                                >
                                                                    {formatCurrencyAmount(
                                                                        row.amount,
                                                                    )}
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
                                                ? Math.round(
                                                      (Number(r.pct) / 100) *
                                                          m,
                                                  )
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
                                                        backgroundColor:
                                                            r.color,
                                                        flexShrink: 0,
                                                    }}
                                                    aria-hidden
                                                />
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        color: "#262626",
                                                    }}
                                                >
                                                    {r.label}
                                                </span>
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        fontVariantNumeric:
                                                            "tabular-nums",
                                                        color: "#595959",
                                                    }}
                                                >
                                                    {cnt != null
                                                        ? cnt.toLocaleString()
                                                        : "—"}
                                                </span>
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 11,
                                                        fontVariantNumeric:
                                                            "tabular-nums",
                                                        color: "var(--mainBlue)",
                                                    }}
                                                >
                                                    {formatPercentDisplay(
                                                        r.pct,
                                                    )}
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
                                    <BellOutlined
                                        style={{ color: "var(--mainBlue)" }}
                                    />
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
                                        ({
                                            key,
                                            label,
                                            icon: Icon,
                                            status,
                                        }) => (
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
                                        Awaiting manual trigger
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
                            {memberListTitle}
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
                            {activeView === "R3" && (
                                <Button
                                    type="link"
                                    disabled={isDisable}
                                    icon={<FileTextOutlined />}
                                    onClick={handleDownloadReminder3Word}
                                    style={{
                                        color: "var(--mainBlue)",
                                        fontWeight: 600,
                                        padding: "0 4px",
                                    }}
                                >
                                    Download Word
                                </Button>
                            )}
                        </div>
                    }
                >
                    <div style={{ overflowX: "auto" }}>
                        <Table
                            className="claims-table reminder-details-members-table"
                            rowKey="_rowKey"
                            rowSelection={rowSelection}
                            columns={columns}
                            dataSource={tableMembers}
                            pagination={false}
                            bordered
                            locale={{
                                emptyText: selectedId
                                    ? "No members for this selection"
                                    : "Open a batch from reminders to view details",
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

export default RemindersDetails;
