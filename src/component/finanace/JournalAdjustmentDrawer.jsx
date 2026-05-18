import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Row, Col, message, InputNumber, Button, Space } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import CustomSelect from "../common/CustomSelect";
import MemberSearch from "../profile/MemberSearch";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";

const formatCoaOptionLabel = (code, description) =>
  `${code} – ${description || code}`;

/** Past years available in the financial period dropdown (current year included). */
const FINANCIAL_PERIOD_PAST_YEARS = 10;

const buildFinancialPeriodOptions = () => {
  const currentYear = dayjs().year();
  const years = [];
  for (let y = currentYear - FINANCIAL_PERIOD_PAST_YEARS; y <= currentYear; y += 1) {
    const label = y === currentYear ? `${y} (current year)` : String(y);
    years.push({ key: String(y), label });
  }
  return years.reverse();
};

const initialFormState = (overrides = {}) => ({
  docNo: "",
  debitAccount: "",
  creditAccount: "",
  amountEuros: "",
  memberId: "",
  memberName: "",
  memberProfileId: "",
  financialPeriod: String(dayjs().year()),
  reason: "",
  notes: "",
  effectiveDate: dayjs(),
  ...overrides,
});

const JournalAdjustmentDrawer = ({
  open,
  onClose,
  onSubmitDraft,
  onSubmitApprove,
  submitLoading = false,
}) => {
  const [formValues, setFormValues] = useState(() => initialFormState());
  const [errors, setErrors] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [coaOptions, setCoaOptions] = useState([]);
  const [coaLoading, setCoaLoading] = useState(false);
  const [memberSearchKey, setMemberSearchKey] = useState(0);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  }, []);

  const accountSelectOptions = useMemo(
    () =>
      coaOptions.map((item) => ({
        key: item.code,
        label: formatCoaOptionLabel(item.code, item.description),
      })),
    [coaOptions],
  );

  const financialPeriodOptions = useMemo(() => buildFinancialPeriodOptions(), []);

  const resetForm = useCallback(() => {
    setFormValues(initialFormState());
    setErrors({});
    setPendingAction(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    const suffix = Date.now().toString().slice(-6);
    setFormValues(
      initialFormState({
        docNo: `JADJ-${dayjs().format("YYYYMMDD")}-${suffix}`,
        financialPeriod: String(dayjs().year()),
      }),
    );
    setErrors({});
    setPendingAction(null);
    setMemberSearchKey((k) => k + 1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const loadCoa = async () => {
      setCoaLoading(true);
      try {
        const res = await axios.get(`${getAccountServiceBaseUrl()}/admin/coa`, {
          headers: authHeaders(),
        });
        const payload = res.data?.data ?? res.data;
        const items = payload?.items || [];
        if (!cancelled) setCoaOptions(items);
      } catch (error) {
        if (!cancelled) {
          setCoaOptions([]);
          message.error(
            error?.response?.data?.message ||
              "Could not load chart of accounts",
          );
        }
      } finally {
        if (!cancelled) setCoaLoading(false);
      }
    };
    loadCoa();
    return () => {
      cancelled = true;
    };
  }, [open, authHeaders]);

  const handleDrawerClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleMemberSelect = useCallback((memberData) => {
    const mid = String(memberData?.membershipNumber || "").trim();
    const profileId = String(memberData?._id || "").trim();
    const displayName = `${memberData?.personalInfo?.forename || ""} ${memberData?.personalInfo?.surname || ""}`.trim();
    const name =
      displayName ||
      String(memberData?.fullName || "").trim() ||
      mid ||
      "";
    setFormValues((prev) => ({
      ...prev,
      memberId: mid,
      memberName: name,
      memberProfileId: profileId,
    }));
    setErrors((prev) => (prev.memberId ? { ...prev, memberId: false } : prev));
  }, []);

  const handleMemberClear = useCallback(() => {
    setFormValues((prev) => ({
      ...prev,
      memberId: "",
      memberName: "",
      memberProfileId: "",
    }));
  }, []);

  const validate = () => {
    const next = {};
    if (!String(formValues.debitAccount || "").trim()) next.debitAccount = true;
    if (!String(formValues.creditAccount || "").trim()) next.creditAccount = true;
    const amt = Number(formValues.amountEuros);
    if (!Number.isFinite(amt) || amt <= 0) next.amountEuros = true;
    if (!String(formValues.reason || "").trim()) next.reason = true;
    if (!formValues.effectiveDate) next.effectiveDate = true;
    if (!String(formValues.financialPeriod || "").trim()) next.financialPeriod = true;
    if (
      formValues.debitAccount &&
      formValues.creditAccount &&
      formValues.debitAccount === formValues.creditAccount
    ) {
      next.debitAccount = true;
      next.creditAccount = true;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const buildPayload = () => {
    const docNo =
      String(formValues.docNo || "").trim() ||
      `JADJ-${dayjs().format("YYYYMMDD")}-${String(Date.now()).slice(-6)}`;
    const euros = Number(formValues.amountEuros);
    const mid = String(formValues.memberId || "").trim();
    const base = {
      docNo,
      debitAccount: String(formValues.debitAccount).trim(),
      creditAccount: String(formValues.creditAccount).trim(),
      amount: Math.round(euros * 100),
      reason: String(formValues.reason || "").trim(),
      notes: String(formValues.notes || "").trim() || undefined,
      financialPeriod: String(formValues.financialPeriod).trim(),
      date: formValues.effectiveDate.format("YYYY-MM-DD"),
    };
    if (mid) {
      return {
        ...base,
        memberId: mid,
        memberName: String(formValues.memberName || "").trim() || undefined,
        memberProfileId: String(formValues.memberProfileId || "").trim() || undefined,
      };
    }
    return { ...base };
  };

  const runAction = async (action) => {
    if (submitLoading) return;
    if (!validate()) {
      const sameAccount =
        formValues.debitAccount &&
        formValues.debitAccount === formValues.creditAccount;
      message.error(
        sameAccount
          ? "Debit and credit accounts must be different"
          : "Please fill all required fields",
      );
      return;
    }
    setPendingAction(action);
    const payload = buildPayload();
    const handler = action === "approve" ? onSubmitApprove : onSubmitDraft;
    if (!handler) return;
    const result = await handler(payload);
    setPendingAction(null);
    if (result !== false) handleDrawerClose();
  };

  const draftLoading = submitLoading && pendingAction === "draft";
  const approveLoading = submitLoading && pendingAction === "approve";

  return (
    <MyDrawer
      title="New journal adjustment"
      open={open}
      onClose={handleDrawerClose}
      width={520}
      isPagination={false}
      extra={
        <Space>
          <Button
            className="butn secoundry-btn"
            onClick={() => runAction("draft")}
            loading={draftLoading}
            disabled={submitLoading && !draftLoading}
          >
            Save draft
          </Button>
          <Button
            className="butn primary-btn"
            type="primary"
            onClick={() => runAction("approve")}
            loading={approveLoading}
            disabled={submitLoading && !approveLoading}
          >
            Approve
          </Button>
        </Space>
      }
    >
      <div style={{ padding: 10 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <MyInput
              label="Adjustment reference"
              name="docNo"
              value={formValues.docNo}
              onChange={(e) => handleChange("docNo", e.target.value)}
              placeholder="Auto-generated if empty (e.g. JADJ-…)"
            />
          </Col>
          <Col span={24}>
            <CustomSelect
              label="Debit account"
              name="debitAccount"
              value={formValues.debitAccount}
              onChange={(e) => handleChange("debitAccount", e.target.value)}
              options={accountSelectOptions}
              isIDs
              required
              hasError={!!errors.debitAccount}
              errorMessage={
                formValues.debitAccount &&
                formValues.debitAccount === formValues.creditAccount
                  ? "Must differ from credit account"
                  : "Required"
              }
              disabled={coaLoading || accountSelectOptions.length === 0}
              placeholder={coaLoading ? "Loading accounts…" : "Select debit account"}
            />
          </Col>
          <Col span={24}>
            <CustomSelect
              label="Credit account"
              name="creditAccount"
              value={formValues.creditAccount}
              onChange={(e) => handleChange("creditAccount", e.target.value)}
              options={accountSelectOptions}
              isIDs
              required
              hasError={!!errors.creditAccount}
              errorMessage={
                formValues.debitAccount &&
                formValues.debitAccount === formValues.creditAccount
                  ? "Must differ from debit account"
                  : "Required"
              }
              disabled={coaLoading || accountSelectOptions.length === 0}
              placeholder={coaLoading ? "Loading accounts…" : "Select credit account"}
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
            <label className="my-input-label">Member (optional)</label>
            <MemberSearch
              key={memberSearchKey}
              fullWidth
              style={{ width: "100%" }}
              onSelectBehavior="callback"
              onSelectCallback={handleMemberSelect}
              onClear={handleMemberClear}
              showStatus={false}
            />
            {formValues.memberId ? (
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(0,0,0,0.45)",
                  marginTop: 6,
                  marginBottom: 0,
                }}
              >
                {formValues.memberName
                  ? `${formValues.memberName} · Member no. ${formValues.memberId}`
                  : `Member no. ${formValues.memberId}`}
              </p>
            ) : null}
          </Col>
          <Col span={24}>
            <MyDatePicker1
              label="Effective date"
              value={formValues.effectiveDate}
              onChange={(d) => handleChange("effectiveDate", d)}
              hasError={!!errors.effectiveDate}
            />
          </Col>
          <Col span={24}>
            <CustomSelect
              label="Financial period (year)"
              name="financialPeriod"
              value={formValues.financialPeriod}
              onChange={(e) => handleChange("financialPeriod", e.target.value)}
              options={financialPeriodOptions}
              isIDs
              required
              hasError={!!errors.financialPeriod}
              placeholder="Select year"
            />
            <p
              style={{
                fontSize: 12,
                color: "rgba(0,0,0,0.45)",
                marginTop: 6,
                marginBottom: 0,
              }}
            >
              Classifies which year this adjustment relates to (current or prior years
              only). GL posting date is controlled by effective date.
            </p>
          </Col>
          <Col span={24}>
            <MyInput
              label="Reason"
              name="reason"
              value={formValues.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              required
              hasError={!!errors.reason}
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
      </div>
    </MyDrawer>
  );
};

export default JournalAdjustmentDrawer;
