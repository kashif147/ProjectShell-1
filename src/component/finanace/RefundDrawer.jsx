import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, message, Checkbox, InputNumber, Alert } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearch from "../profile/MemberSearch";

const CREDIT_CARD_TYPE = "Credit Card";

function generateCreditCardRefNo() {
    const suffix =
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()
            : `${Date.now()}${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
    return `CC-${suffix}`;
}

const initialFormState = () => ({
    refund: "",
    refundDate: dayjs(),
    type: "",
    refNo: "",
    memo: "",
});

const RefundDrawer = ({
    open,
    onClose,
    onSubmit,
    /** When set, refund amount field is prefilled (euros). */
    prefillRefundAmountEuro = null,
    /** Hide member search (e.g. member profile finance tab). */
    hideMemberSearch = false,
    /** Optional info banner above the form. */
    receiptSummary = null,
}) => {
    const [formValues, setFormValues] = useState(() => initialFormState());

    const [errors, setErrors] = useState({});

    const resetForm = useCallback(() => {
        setFormValues(initialFormState());
        setErrors({});
    }, []);

    useEffect(() => {
        if (!open) return;
        const n =
            prefillRefundAmountEuro != null && !Number.isNaN(Number(prefillRefundAmountEuro))
                ? Number(prefillRefundAmountEuro)
                : null;
        if (n != null && n > 0) {
            setFormValues((prev) => ({
                ...prev,
                refund: Math.round(n * 100) / 100,
            }));
        }
    }, [open, prefillRefundAmountEuro]);

    const handleDrawerClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
        }
    };

    const handleRefundTypeChange = (value) => {
        setFormValues((prev) => {
            const next = { ...prev, type: value };
            if (value === CREDIT_CARD_TYPE) {
                next.refNo = generateCreditCardRefNo();
            }
            return next;
        });
        if (errors.type) {
            setErrors((prev) => ({ ...prev, type: false }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formValues.refund) newErrors.refund = true;
        if (!formValues.refundDate) newErrors.refundDate = true;
        if (!formValues.type) newErrors.type = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            const refundNum = Number(formValues.refund);
            const formattedValues = {
                ...formValues,
                refund: Number.isFinite(refundNum)
                    ? Math.round(refundNum * 100) / 100
                    : formValues.refund,
                refundDate: formValues.refundDate ? formValues.refundDate.format("YYYY-MM-DD") : null,
                memo: (formValues.memo || "").trim(),
            };
            if (onSubmit) onSubmit(formattedValues);
            handleDrawerClose();
        } else {
            message.error("Please fill all required fields");
        }
    };

    const drawerTitle = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Refund Entry Drawer</span>
            <Checkbox>
                <span style={{ marginLeft: '10px' }}>Bulk Entry</span>
            </Checkbox>
        </div>
    );

    return (
        <MyDrawer
            title={drawerTitle}
            open={open}
            onClose={handleDrawerClose}
            width={700}
            isPagination={false}
            add={handleSubmit}
        >
            <div style={{ padding: "10px" }}>
                <Row gutter={[16, 16]}>
                    {receiptSummary ? (
                        <Col span={24}>
                            <Alert type="info" showIcon message={receiptSummary} />
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
                            label="Refund Type"
                            name="type"
                            placeholder="Select refund type"
                            options={[
                                { label: "Credit Card", key: "Credit Card" },
                                { label: "Bank Transfer", key: "Bank Transfer" },
                                { label: "Cheque", key: "Cheque" },
                            ]}
                            value={formValues.type}
                            onChange={(e) => handleRefundTypeChange(e.target.value)}
                            required
                            hasError={errors.type}
                            isMarginBtm={false}
                        />
                    </Col>
                    <Col span={24}>
                        <MyInput
                            label="Ref No."
                            name="refNo"
                            placeholder={
                                formValues.type === CREDIT_CARD_TYPE
                                    ? "Auto-generated; edit if needed"
                                    : "Enter Ref No."
                            }
                            value={formValues.refNo}
                            onChange={(e) => handleChange("refNo", e.target.value)}
                        />
                    </Col>
                    <Col span={24}>
                        <div className="my-input-wrapper">
                            <div className="d-flex justify-content-between">
                                <label htmlFor="refund" className={`my-input-label ${errors.refund ? "error" : ""}`}>
                                    Refund Amount <span className="star">*</span>
                                    {errors.refund && <span className="error-message">Required</span>}
                                </label>
                            </div>
                            <div className={`my-input-container ${errors.refund ? "error" : ""}`}>
                                <InputNumber
                                    name="refund"
                                    placeholder="0.00"
                                    value={formValues.refund}
                                    onChange={(value) => {
                                        if (value != null && typeof value === "number") {
                                            handleChange(
                                                "refund",
                                                Math.round(value * 100) / 100
                                            );
                                        } else {
                                            handleChange("refund", value);
                                        }
                                    }}
                                    precision={2}
                                    min={0}
                                    style={{ width: "100%" }}
                                    controls={false}
                                    size="large"
                                    formatter={(value, info) => {
                                        const raw = value ?? "";
                                        if (raw === "") return "";
                                        if (info?.userTyping) {
                                            return String(raw).replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ","
                                            );
                                        }
                                        const n = Number.parseFloat(
                                            String(raw).replace(/,/g, "")
                                        );
                                        if (Number.isNaN(n)) return "";
                                        const [intPart, decPart] = n
                                            .toFixed(2)
                                            .split(".");
                                        return `${intPart.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ","
                                        )}.${decPart}`;
                                    }}
                                    parser={(value) => value.replace(/[^\d.]/g, "")}
                                    status={errors.refund ? "error" : ""}
                                    addonAfter="€"
                                />
                            </div>
                        </div>
                        <style>{`
  .refund-input-right .ant-input-number-input { text-align: right !important; }
`}</style>

                    </Col>
                    <Col span={24}>
                        <MyDatePicker1
                            label="Refund Date"
                            name="refundDate"
                            value={formValues.refundDate}
                            onChange={(date) => handleChange("refundDate", date)}
                            required
                            hasError={errors.refundDate}
                        />
                    </Col>
                    <Col span={24}>
                        <MyInput
                            label="Memo"
                            name="memo"
                            placeholder="Enter memo (optional)"
                            value={formValues.memo}
                            onChange={(e) => handleChange("memo", e.target.value)}
                            type="textarea"
                            rows={4}
                        />
                    </Col>
                </Row>
            </div>
        </MyDrawer>
    );
};

export default RefundDrawer;
