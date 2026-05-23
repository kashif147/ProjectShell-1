import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, message, Alert, InputNumber } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearch from "../profile/MemberSearch";

const initialFormState = (overrides = {}) => ({
  docNo: "",
  invoiceDocNo: "",
  amountEuros: "",
  effectiveDate: dayjs(),
  reason: "",
  notes: "",
  ...overrides,
});

const CreditNoteDrawer = ({
  open,
  onClose,
  mode = "create",
  memberId,
  invoiceDocNo: invoiceDocNoProp = "",
  creditNoteDocNo = "",
  prefillAmountEuro = null,
  onSubmitCreate,
  onSubmitApprove,
  submitLoading = false,
  invoiceSummary = null,
  hideMemberSearch = false,
}) => {
  const [formValues, setFormValues] = useState(() => initialFormState());
  const [errors, setErrors] = useState({});
  const [selectedMemberId, setSelectedMemberId] = useState(
    () => String(memberId || "").trim(),
  );

  const resetForm = useCallback(() => {
    setFormValues(initialFormState());
    setErrors({});
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelectedMemberId(String(memberId || "").trim());
    const prefillRaw =
      prefillAmountEuro != null && !Number.isNaN(Number(prefillAmountEuro))
        ? Number(prefillAmountEuro)
        : null;
    const amountPrefill =
      prefillRaw != null && prefillRaw > 0
        ? Math.round(prefillRaw * 100) / 100
        : "";
    const suffix = Date.now().toString(36).toUpperCase();
    setFormValues(
      initialFormState({
        docNo: mode === "approve" ? creditNoteDocNo : `CN-${suffix}`,
        invoiceDocNo: invoiceDocNoProp || "",
        amountEuros: mode === "approve" ? "" : amountPrefill,
        effectiveDate: dayjs(),
      }),
    );
    setErrors({});
  }, [open, mode, invoiceDocNoProp, creditNoteDocNo, prefillAmountEuro, memberId]);

  const handleDrawerClose = () => {
    resetForm();
    setSelectedMemberId("");
    onClose();
  };

  const resolvedMemberId = String(memberId || selectedMemberId || "").trim();

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validateCreate = () => {
    const next = {};
    if (!String(formValues.invoiceDocNo || "").trim()) next.invoiceDocNo = true;
    if (!resolvedMemberId) next.memberId = true;
    if (!String(formValues.docNo || "").trim()) next.docNo = true;
    const amt = Number(formValues.amountEuros);
    if (!Number.isFinite(amt) || amt <= 0) next.amountEuros = true;
    if (!formValues.effectiveDate) next.effectiveDate = true;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (submitLoading) return;
    if (mode === "approve") {
      if (!creditNoteDocNo) {
        message.error("Credit note reference missing");
        return;
      }
      const result = onSubmitApprove
        ? await onSubmitApprove({ docNo: creditNoteDocNo })
        : true;
      if (result !== false) handleDrawerClose();
      return;
    }
    if (!validateCreate()) {
      message.error("Please fill all required fields");
      return;
    }
    const euros = Number(formValues.amountEuros);
    const payload = {
      docNo: String(formValues.docNo).trim(),
      memberId: resolvedMemberId,
      invoiceDocNo: String(formValues.invoiceDocNo).trim(),
      amount: Math.round(euros * 100),
      date: formValues.effectiveDate.format("YYYY-MM-DD"),
      reason: String(formValues.reason || "").trim(),
      notes: String(formValues.notes || "").trim(),
    };
    const result = onSubmitCreate ? await onSubmitCreate(payload) : true;
    if (result !== false) handleDrawerClose();
  };

  const title =
    mode === "approve" ? "Approve credit note" : "Create credit note (draft)";

  return (
    <MyDrawer
      title={title}
      open={open}
      onClose={handleDrawerClose}
      width={520}
      isPagination={false}
      add={handleSubmit}
      isLoading={submitLoading}
    >
      <div style={{ padding: 10 }}>
        {invoiceSummary ? (
          <Alert type="info" showIcon message={invoiceSummary} style={{ marginBottom: 16 }} />
        ) : null}
        {mode === "approve" ? (
          <Alert
            type="warning"
            showIcon
            message={`Approve credit note ${creditNoteDocNo}? This posts GL entries and may create member credit if the invoice was paid.`}
          />
        ) : (
          <Row gutter={[16, 16]}>
            {!hideMemberSearch && !memberId ? (
              <Col span={24}>
                <label className="my-input-label">
                  Member search <span className="star">*</span>
                </label>
                <MemberSearch
                  fullWidth
                  style={{ width: "100%" }}
                  onSelectBehavior="callback"
                  onSelectCallback={(record) => {
                    const mid =
                      record?.membershipNumber ||
                      record?.memberId ||
                      record?.membershipNo ||
                      "";
                    setSelectedMemberId(String(mid || "").trim());
                    if (errors.memberId) {
                      setErrors((prev) => ({ ...prev, memberId: false }));
                    }
                  }}
                />
                {errors.memberId ? (
                  <span className="error-message">Member is required</span>
                ) : null}
              </Col>
            ) : null}
            <Col span={24}>
              <MyInput
                label="Credit note no."
                name="docNo"
                value={formValues.docNo}
                onChange={(e) => handleChange("docNo", e.target.value)}
                error={errors.docNo}
              />
            </Col>
            <Col span={24}>
              <MyInput
                label="Invoice doc no."
                name="invoiceDocNo"
                value={formValues.invoiceDocNo}
                onChange={(e) => handleChange("invoiceDocNo", e.target.value)}
                error={errors.invoiceDocNo}
                disabled={Boolean(invoiceDocNoProp)}
              />
            </Col>
            <Col span={24}>
              <label className="my-input-label">Amount (€)</label>
              <InputNumber
                style={{ width: "100%" }}
                min={0.01}
                step={0.01}
                precision={2}
                value={formValues.amountEuros}
                onChange={(v) => handleChange("amountEuros", v)}
                status={errors.amountEuros ? "error" : undefined}
              />
            </Col>
            <Col span={24}>
              <MyDatePicker1
                label="Effective date"
                value={formValues.effectiveDate}
                onChange={(d) => handleChange("effectiveDate", d)}
                error={errors.effectiveDate}
              />
            </Col>
            <Col span={24}>
              <MyInput
                label="Reason"
                name="reason"
                value={formValues.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
              />
            </Col>
            <Col span={24}>
              <MyInput
                label="Notes"
                name="notes"
                value={formValues.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </Col>
          </Row>
        )}
      </div>
    </MyDrawer>
  );
};

export default CreditNoteDrawer;
