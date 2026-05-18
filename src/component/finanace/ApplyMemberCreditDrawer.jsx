import React, { useEffect, useState } from "react";
import { Alert, Row, Col } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import { centsToEuro } from "../../utils/Utilities";

const ApplyMemberCreditDrawer = ({
  open,
  onClose,
  onSubmit,
  submitLoading = false,
  memberId,
  availableCreditCents = 0,
  outstandingCents = 0,
  invoiceSummary = null,
  prefillAmountEuro = null,
}) => {
  const [docNo, setDocNo] = useState("");
  const [amountEuro, setAmountEuro] = useState("");
  const [applyDate, setApplyDate] = useState(dayjs());
  const [memo, setMemo] = useState("");

  const maxEuro =
    Math.round(
      centsToEuro(Math.min(availableCreditCents, outstandingCents)) * 100,
    ) / 100;

  useEffect(() => {
    if (!open) return;
    const suffix = `${Date.now()}`.slice(-8);
    setDocNo(`APC-${memberId || "M"}-${suffix}`);
    const pre =
      prefillAmountEuro != null && !Number.isNaN(Number(prefillAmountEuro))
        ? Math.min(Number(prefillAmountEuro), maxEuro)
        : maxEuro;
    setAmountEuro(pre > 0 ? String(pre) : "");
    setApplyDate(dayjs());
    setMemo("");
  }, [open, memberId, maxEuro, prefillAmountEuro]);

  const handleSubmit = async () => {
    const euros = Number(amountEuro);
    if (!docNo?.trim()) return;
    if (!Number.isFinite(euros) || euros <= 0) return;
    const cents = Math.round(euros * 100);
    const ok = await onSubmit({
      docNo: docNo.trim(),
      date: applyDate.format("YYYY-MM-DD"),
      memberId,
      amount: cents,
      memo: memo?.trim() || undefined,
    });
    if (ok) onClose?.();
  };

  return (
    <MyDrawer
      title="Apply member credit"
      open={open}
      onClose={onClose}
      width={560}
      isPagination={false}
      add={handleSubmit}
      isLoading={submitLoading}
    >
      <div style={{ padding: 10 }}>
        <Row gutter={[16, 16]}>
          {invoiceSummary ? (
            <Col span={24}>
              <Alert type="info" showIcon message={invoiceSummary} />
            </Col>
          ) : null}
          <Col span={24}>
            <p style={{ margin: 0, color: "#595959", fontSize: 13 }}>
              Applies available credit to outstanding balance. Maximum{" "}
              <strong>€{maxEuro.toFixed(2)}</strong>.
            </p>
          </Col>
          <Col span={24}>
            <MyInput
              label="Document no."
              value={docNo}
              onChange={(e) => setDocNo(e.target.value)}
            />
          </Col>
          <Col span={24}>
            <MyDatePicker1
              label="Date"
              name="applyDate"
              value={applyDate}
              onChange={setApplyDate}
            />
          </Col>
          <Col span={24}>
            <MyInput
              label="Amount (€)"
              value={amountEuro}
              onChange={(e) => setAmountEuro(e.target.value)}
            />
          </Col>
          <Col span={24}>
            <MyInput
              label="Memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              type="textarea"
              rows={3}
            />
          </Col>
        </Row>
      </div>
    </MyDrawer>
  );
};

export default ApplyMemberCreditDrawer;
