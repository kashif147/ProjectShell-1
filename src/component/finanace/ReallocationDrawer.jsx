import React, { useState, useCallback, useEffect } from "react";
import { Row, Col, message, Alert } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MemberSearch from "../profile/MemberSearch";
import { centsToEuro, convertToLocalTime } from "../../utils/Utilities";

const PAYMENT_TYPE_OPTIONS = [
  { label: "Credit Card", key: "Credit Card" },
  { label: "Bank Transfer", key: "Bank Transfer" },
  { label: "Cheque", key: "Cheque" },
  { label: "Standing Order", key: "Standing Order" },
  { label: "Deductions", key: "Deductions" },
  { label: "Cash", key: "Cash" },
];

const ReallocationDrawer = ({
  open,
  onClose,
  onSubmit,
  hideMemberSearch = false,
  /** Single ledger row being reclassified */
  sourceRow = null,
  /** Shown payment type for source row (e.g. from ledger display rules) */
  currentPaymentTypeLabel = null,
}) => {
  const [targetPaymentType, setTargetPaymentType] = useState("");
  const [memo, setMemo] = useState("");
  const [errors, setErrors] = useState({});

  const resetForm = useCallback(() => {
    setTargetPaymentType("");
    setMemo("");
    setErrors({});
  }, []);

  useEffect(() => {
    if (!open) resetForm();
  }, [open, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = () => {
    const next = {};
    if (!targetPaymentType) next.targetPaymentType = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      message.error("Please select a payment type to reallocate to");
      return;
    }
    if (onSubmit) {
      onSubmit({
        targetPaymentType,
        memo: (memo || "").trim(),
        sourceRow,
      });
    }
    handleClose();
  };

  const summaryMessage = (() => {
    if (!sourceRow) return null;
    const when =
      sourceRow.date && dayjs(sourceRow.date).isValid()
        ? convertToLocalTime(sourceRow.date)
        : "—";
    const ref =
      sourceRow.reference != null &&
      String(sourceRow.reference).trim() !== "" &&
      String(sourceRow.reference).trim() !== "-"
        ? String(sourceRow.reference).trim()
        : "—";
    const credit = Number(sourceRow.credit) || 0;
    const amt =
      credit > 0
        ? `€${centsToEuro(credit).toLocaleString("en-IE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        : "—";
    const pt = currentPaymentTypeLabel || "—";
    return `Reclassify payment · ${when} · Ref ${ref} · ${amt} · Current payment type: ${pt}`;
  })();

  return (
    <MyDrawer
      title="Reallocation"
      open={open}
      onClose={handleClose}
      width={700}
      isPagination={false}
      add={handleSubmit}
    >
      <div style={{ padding: "10px" }}>
        <Row gutter={[16, 16]}>
          {summaryMessage ? (
            <Col span={24}>
              <Alert type="info" showIcon message={summaryMessage} />
            </Col>
          ) : null}
          {!hideMemberSearch ? (
            <Col span={24}>
              <label className="my-input-label">Member Search</label>
              <MemberSearch
                fullWidth={true}
                style={{ width: "100%" }}
                onSelectBehavior="none"
              />
            </Col>
          ) : null}
          <Col span={24}>
            <CustomSelect
              label="Reallocate to"
              name="targetPaymentType"
              placeholder="Select payment type"
              options={PAYMENT_TYPE_OPTIONS}
              value={targetPaymentType}
              onChange={(e) => {
                setTargetPaymentType(e.target.value);
                if (errors.targetPaymentType) {
                  setErrors((prev) => ({ ...prev, targetPaymentType: false }));
                }
              }}
              required
              hasError={errors.targetPaymentType}
              isMarginBtm={false}
            />
          </Col>
          <Col span={24}>
            <MyInput
              label="Memo"
              name="memo"
              placeholder="Optional notes"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              type="textarea"
              rows={4}
            />
          </Col>
        </Row>
      </div>
    </MyDrawer>
  );
};

export default ReallocationDrawer;
