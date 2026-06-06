import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, Col, Row, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import axios from "axios";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearchOptionLabel from "../profile/MemberSearchOptionLabel";
import { centsToEuro } from "../../utils/Utilities";
import {
  getProfileServiceApiBase,
  searchProfilesByQuery,
} from "../../services/profileSearchApi";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";
import {
  allocateTotalMoveAcrossPayments,
  buildZeroMovePreview,
} from "./reassignPaymentAllocation";
import "../../styles/ReassignPaymentDrawer.css";

const CURRENT_YEAR = dayjs().year();
const TOTAL_MOVE_INPUT_ID = "reassign-total-move-euro";
const ALLOCATION_PREVIEW_MAX_ROWS = 5;
/** Matches drawer-tbl row height in Utilites.css */
const ALLOCATION_TABLE_ROW_HEIGHT = 40;
function formatPaymentDate(value) {
  if (!value || !dayjs(value).isValid()) return "—";
  return dayjs(value).format("DD/MM/YYYY");
}

function pickDocNo(row) {
  const v =
    row?.docNo ?? row?.reference ?? row?.transactionId ?? row?.doc_no ?? "";
  return String(v || "").trim();
}

function rowPaymentYear(row) {
  if (!row?.date || !dayjs(row.date).isValid()) return null;
  return dayjs(row.date).year();
}

function rowAmountCents(row) {
  const credit = Number(row?.credit) || 0;
  if (credit > 0) return credit;
  const debit = Number(row?.debit) || 0;
  if (debit > 0) return debit;
  return 0;
}

function rowAmountEuro(row) {
  const cents = rowAmountCents(row);
  return cents > 0 ? centsToEuro(cents) : 0;
}

function formatEuro(euros) {
  return euros.toLocaleString("en-IE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseMoneyDisplayToCents(value) {
  const raw = String(value ?? "")
    .trim()
    .replace(/,/g, "");
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.round(n * 100)) : 0;
}

/** Allow digits and one decimal while typing (no thousands separators). */
function normalizeMoneyTyping(value) {
  let v = String(value ?? "")
    .replace(/,/g, "")
    .trim();
  if (!v) return "";
  v = v.replace(/[^\d.]/g, "");
  const dot = v.indexOf(".");
  if (dot === -1) {
    return v.replace(/^0+(?=\d)/, "") || (v === "0" ? "0" : "");
  }
  let intPart = v.slice(0, dot).replace(/^0+(?=\d)/, "");
  if (!intPart) intPart = "0";
  const frac = v
    .slice(dot + 1)
    .replace(/\./g, "")
    .slice(0, 2);
  return frac.length > 0 ? `${intPart}.${frac}` : `${intPart}.`;
}

/** User typed into "0.00" without select-all (e.g. "50.00" when meaning "5"). */
function coerceTypingOverZeroDisplay(prevDisplay, nextDisplay) {
  const prev = String(prevDisplay ?? "");
  const next = String(nextDisplay ?? "");
  if (prev !== formatEuro(0) && parseMoneyDisplayToCents(prev) !== 0) {
    return normalizeMoneyTyping(next);
  }
  const leadingDigit = next.match(/^(\d)0\.00$/);
  if (leadingDigit) return leadingDigit[1];
  if (next.startsWith("0.00")) {
    const tail = next.slice(4).replace(/[^\d.]/g, "");
    return normalizeMoneyTyping(tail || next.replace(/^0\.00/, ""));
  }
  return normalizeMoneyTyping(next.replace(/^0\.00/, ""));
}

function actionTag(action) {
  const tagStyle = { margin: 0 };
  if (action === "full")
    return (
      <Tag color="green" style={tagStyle}>
        Full
      </Tag>
    );
  if (action === "partial")
    return (
      <Tag color="orange" style={tagStyle}>
        Partial
      </Tag>
    );
  if (action === "skip") return <Tag style={tagStyle}>Skip</Tag>;
  return <Tag style={tagStyle}>{action}</Tag>;
}

export default function ReassignPaymentDrawer({
  open,
  onClose,
  onSuccess,
  fromMemberId,
  sourceRows = [],
}) {
  const [targetMemberId, setTargetMemberId] = useState("");
  const [reason, setReason] = useState("");
  const [correctionDate, setCorrectionDate] = useState(() => dayjs());
  /** Total euros to move across selection; empty = move all */
  const [totalMoveEuro, setTotalMoveEuro] = useState("");
  const [loading, setLoading] = useState(false);
  const [memberResults, setMemberResults] = useState(null);
  const [memberSearchLoading, setMemberSearchLoading] = useState(false);
  const memberSearchTimerRef = useRef(null);
  const memberSearchGenRef = useRef(0);
  /** Next keystroke replaces zero/empty instead of inserting before "0.00". */
  const totalMoveReplaceOnInputRef = useRef(false);

  const rowMeta = useMemo(
    () =>
      sourceRows
        .map((r, idx) => {
          const docNo = pickDocNo(r) || "";
          const totalCents = rowAmountCents(r);
          return {
            row: r,
            docNo,
            totalCents,
            idx,
            date: r?.date,
          };
        })
        .filter((m) => m.docNo && m.totalCents > 0),
    [sourceRows],
  );

  const selectedTotalCents = useMemo(
    () => rowMeta.reduce((s, m) => s + m.totalCents, 0),
    [rowMeta],
  );

  const priorYearRows = useMemo(() => {
    const correctionYear = correctionDate?.year?.() ?? CURRENT_YEAR;
    return sourceRows.filter((r) => {
      const y = rowPaymentYear(r);
      return y != null && y < correctionYear;
    });
  }, [sourceRows, correctionDate]);

  const paymentLines = useMemo(
    () =>
      rowMeta.map((m) => ({
        receiptDocNo: m.docNo,
        totalCents: m.totalCents,
        date: m.date,
      })),
    [rowMeta],
  );

  const allocation = useMemo(() => {
    if (!paymentLines.length) return null;
    const moveCents = parseMoneyDisplayToCents(totalMoveEuro);
    if (moveCents <= 0) {
      return buildZeroMovePreview(paymentLines);
    }
    return allocateTotalMoveAcrossPayments(paymentLines, moveCents);
  }, [paymentLines, totalMoveEuro]);

  const resetForm = useCallback(() => {
    setTargetMemberId("");
    setReason("");
    setCorrectionDate(dayjs());
    setTotalMoveEuro("");
    setMemberResults(null);
  }, []);

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  useEffect(() => {
    if (!open || selectedTotalCents <= 0) return;
    setTotalMoveEuro(formatEuro(centsToEuro(selectedTotalCents)));
    // Default total only when the drawer opens, not when the user clears the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectTotalMoveInput = useCallback(() => {
    requestAnimationFrame(() => {
      const el = document.getElementById(TOTAL_MOVE_INPUT_ID);
      if (!el || typeof el.select !== "function") return;
      el.focus();
      el.select();
    });
  }, []);

  const handleTotalMoveFocus = () => {
    if (parseMoneyDisplayToCents(totalMoveEuro) === 0) {
      totalMoveReplaceOnInputRef.current = true;
      selectTotalMoveInput();
    }
  };

  const handleTotalMoveChange = (e) => {
    const next = e.target.value;
    if (next === "" || next == null) {
      setTotalMoveEuro("");
      totalMoveReplaceOnInputRef.current = true;
      return;
    }

    let normalized;
    if (totalMoveReplaceOnInputRef.current) {
      totalMoveReplaceOnInputRef.current = false;
      normalized = coerceTypingOverZeroDisplay(totalMoveEuro, next);
    } else if (
      parseMoneyDisplayToCents(totalMoveEuro) === 0 &&
      next !== formatEuro(0)
    ) {
      normalized = coerceTypingOverZeroDisplay(totalMoveEuro, next);
    } else {
      normalized = normalizeMoneyTyping(next);
    }
    setTotalMoveEuro(normalized);
  };

  const handleTotalMoveBlur = () => {
    const raw = String(totalMoveEuro ?? "").trim();
    if (!raw) {
      setTotalMoveEuro(formatEuro(0));
      totalMoveReplaceOnInputRef.current = false;
      return;
    }
    const n = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(n)) {
      setTotalMoveEuro(formatEuro(0));
      totalMoveReplaceOnInputRef.current = false;
      return;
    }
    setTotalMoveEuro(formatEuro(Math.max(0, n)));
    totalMoveReplaceOnInputRef.current = false;
  };

  const handleMemberSearch = (q) => {
    const query = String(q || "").trim();
    if (memberSearchTimerRef.current) {
      clearTimeout(memberSearchTimerRef.current);
    }
    if (query.length < 2) {
      setMemberResults(null);
      return;
    }
    memberSearchTimerRef.current = setTimeout(async () => {
      const gen = ++memberSearchGenRef.current;
      setMemberSearchLoading(true);
      try {
        const base = getProfileServiceApiBase();
        if (!base) {
          setMemberResults([]);
          return;
        }
        const hits = await searchProfilesByQuery(query);
        if (gen !== memberSearchGenRef.current) return;
        setMemberResults(Array.isArray(hits) ? hits : []);
      } catch {
        if (gen === memberSearchGenRef.current) setMemberResults([]);
      } finally {
        if (gen === memberSearchGenRef.current) setMemberSearchLoading(false);
      }
    }, 300);
  };

  const disableCorrectionDate = (current) => {
    if (!current) return false;
    return current.year() < CURRENT_YEAR;
  };

  const handleSubmit = async () => {
    const base = getAccountServiceBaseUrl();
    if (!base) {
      message.error("Account service URL is not configured.");
      return;
    }
    const toMid = String(targetMemberId || "").trim();
    const fromMid = String(fromMemberId || "").trim();
    const memo = String(reason || "").trim();
    const correctionIso = correctionDate?.format?.("YYYY-MM-DD");

    if (!rowMeta.length) {
      message.error("No payment rows with amounts selected.");
      return;
    }
    if (!toMid) {
      message.error("Select Assign To member.");
      return;
    }
    if (toMid === fromMid) {
      message.error("Target member must be different from the current member.");
      return;
    }
    if (!memo) {
      message.error("Enter a reason for the audit trail.");
      return;
    }
    if (!correctionIso || !dayjs(correctionIso).isValid()) {
      message.error("Select a valid correction date.");
      return;
    }
    if (dayjs(correctionIso).year() < CURRENT_YEAR) {
      message.error(
        `Correction date must be in ${CURRENT_YEAR} or later. Prior-year accounts are not restated.`,
      );
      return;
    }

    const moveCents = parseMoneyDisplayToCents(totalMoveEuro);
    if (moveCents <= 0) {
      message.error("Enter a positive total to move");
      return;
    }
    if (!allocation?.ok) {
      message.error(allocation?.reason || "Invalid total amount to move");
      return;
    }
    const receiptDocNos = rowMeta.map((m) => m.docNo);
    const isFullPool = moveCents >= selectedTotalCents;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const body = {
        fromMemberId: fromMid,
        toMemberId: toMid,
        receiptDocNos,
        memo,
        correctionDate: correctionIso,
      };
      if (!isFullPool) {
        body.totalMoveAmountCents = moveCents;
      }

      const res = await axios.post(`${base}/journal/reassign-payments`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = res?.data?.data ?? res?.data;
      const ok = data?.reassigned ?? 0;
      const failed = data?.failed ?? 0;
      const untouched = data?.allocationUntouched ?? 0;
      if (failed > 0) {
        message.warning(
          `${ok} payment(s) processed, ${failed} failed, ${untouched} left unchanged.`,
        );
      } else {
        message.success(
          isFullPool
            ? `${ok} payment(s) reassigned.`
            : `${ok} payment(s) updated; €${formatEuro(centsToEuro(moveCents))} moved; ${untouched} not changed.`,
        );
      }
      onSuccess?.(data);
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error?.message ||
        e?.message ||
        "Reassign Payment failed";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const correctionYear = correctionDate?.year?.() ?? CURRENT_YEAR;
  const selectedTotalEuro = centsToEuro(selectedTotalCents);

  const tableData = useMemo(() => {
    if (!allocation?.ok) return [];
    return allocation.plan.map((p) => {
      const meta = rowMeta.find((m) => m.docNo === p.receiptDocNo);
      return {
        key: p.receiptDocNo,
        docNo: p.receiptDocNo,
        date: formatPaymentDate(meta?.date),
        totalEuro: centsToEuro(p.totalCents),
        moveEuro: centsToEuro(p.moveCents),
        retainEuro: centsToEuro(p.retainCents),
        action: p.action,
      };
    });
  }, [allocation, rowMeta]);

  const allocationBodyScrollY = useMemo(() => {
    const rows = Math.max(tableData.length, 1);
    const visible = Math.min(rows, ALLOCATION_PREVIEW_MAX_ROWS);
    return visible * ALLOCATION_TABLE_ROW_HEIGHT;
  }, [tableData.length]);

  const columns = [
    {
      title: "Reference",
      dataIndex: "docNo",
      width: 170,
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      width: 76,
    },
    {
      title: "Total",
      dataIndex: "totalEuro",
      width: 80,
      align: "right",
      render: (v) => `€${formatEuro(v)}`,
    },
    {
      title: "Move",
      dataIndex: "moveEuro",
      width: 80,
      align: "right",
      render: (v) => `€${formatEuro(v)}`,
    },
    {
      title: "Keep",
      dataIndex: "retainEuro",
      width: 80,
      align: "right",
      render: (v) => `€${formatEuro(v)}`,
    },
    {
      title: "",
      dataIndex: "action",
      width: 88,
      render: (a) => actionTag(a),
    },
  ];

  return (
    <MyDrawer
      title="Reassign Payment"
      open={open}
      onClose={onClose}
      width={720}
      isPagination={false}
      add={handleSubmit}
      isLoading={loading}
    >
      <div className="reassign-payment-drawer" style={{ padding: 10 }}>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Alert
              type="info"
              showIcon
              message="Total amount to move"
              description={
                <>
                  Enter how much to move to the correct member in total. The
                  system applies it to the{" "}
                  <strong>oldest payments first</strong>
                  (full moves), then one partial if needed. Unselected remainder
                  stays on {fromMemberId || "this member"} and is not reversed.
                  Correction posts in {correctionYear}.
                </>
              }
            />
          </Col>
          {priorYearRows.length > 0 ? (
            <Col span={24}>
              <Alert
                type="warning"
                showIcon
                message="Prior-year payments"
                description={`${priorYearRows.length} payment(s) were posted before ${correctionYear}. Original-year ledgers stay unchanged.`}
              />
            </Col>
          ) : null}
          <Col span={24}>
            <MyDatePicker1
              label="Correction date *"
              value={correctionDate}
              onChange={(d) => setCorrectionDate(d || dayjs())}
              disabledDate={disableCorrectionDate}
            />
          </Col>
          <Col span={24}>
            <label className="my-input-label">Assign To *</label>
            <MyInput
              placeholder="Search membership number or name"
              value={targetMemberId}
              onChange={(e) => {
                setTargetMemberId(e.target.value);
                handleMemberSearch(e.target.value);
              }}
            />
            {memberSearchLoading ? (
              <p style={{ fontSize: 12, color: "#8c8c8c" }}>Searching…</p>
            ) : null}
            {Array.isArray(memberResults) && memberResults.length > 0 ? (
              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 4,
                  maxHeight: 160,
                  overflow: "auto",
                  marginTop: 8,
                }}
              >
                {memberResults.map((m) => (
                  <div
                    key={m._id || m.membershipNumber || m.memberId}
                    role="button"
                    tabIndex={0}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                    onClick={() => {
                      const mid =
                        m.membershipNumber ||
                        m.memberId ||
                        m.membershipNo ||
                        "";
                      setTargetMemberId(String(mid));
                      setMemberResults(null);
                    }}
                  >
                    <MemberSearchOptionLabel member={m} />
                  </div>
                ))}
              </div>
            ) : null}
          </Col>
          <Col span={24}>
            <MyInput
              label="Reason (required for audit) *"
              name="reason"
              type="textarea"
              rows={3}
              placeholder="e.g. €100 of payroll batch belongs to another member; split per oldest receipts"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Col>
          <Col span={24}>
            <MyInput
              id={TOTAL_MOVE_INPUT_ID}
              name="totalMoveEuro"
              label={`Total amount to move (€) — max €${formatEuro(selectedTotalEuro)}`}
              value={totalMoveEuro}
              onChange={handleTotalMoveChange}
              onFocus={handleTotalMoveFocus}
              onBlur={handleTotalMoveBlur}
              placeholder={`Max €${formatEuro(selectedTotalEuro)}`}
            />
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#8c8c8c" }}>
              {rowMeta.length} payment(s) selected · €
              {formatEuro(selectedTotalEuro)} combined. Clear to type a new
              amount (shows 0.00 when you leave the field empty).
            </p>
          </Col>
          <Col span={24}>
            {allocation && !allocation.ok ? (
              <Alert type="error" showIcon message={allocation.reason} />
            ) : null}
            {allocation?.ok ? (
              <>
                <p className="inpt-lbl" style={{ margin: "0 0 8px" }}>
                  Allocation preview (oldest first)
                </p>
                <div className="reassign-allocation-table-wrap">
                  <Table
                    className="drawer-tbl reassign-allocation-table"
                    bordered
                    pagination={false}
                    scroll={{ y: allocationBodyScrollY }}
                    columns={columns}
                    dataSource={tableData}
                    rowClassName={(_record, index) =>
                      index % 2 !== 0 ? "odd-row" : "even-row"
                    }
                  />
                </div>
                {allocation.totalMoveCents === 0 ? (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12,
                      color: "#8c8c8c",
                    }}
                  >
                    Enter an amount above 0.00 to allocate payments.
                  </p>
                ) : allocation.untouchedCount > 0 ? (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12,
                      color: "#8c8c8c",
                    }}
                  >
                    {allocation.untouchedCount} payment(s) will not be changed
                    (total to move is less than selected combined amount).
                  </p>
                ) : null}
              </>
            ) : null}
          </Col>
        </Row>
      </div>
    </MyDrawer>
  );
}
