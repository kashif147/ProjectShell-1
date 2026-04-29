import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, message, Alert, InputNumber } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearch from "../profile/MemberSearch";

const PERIOD_BUCKET_OPTIONS = [
    { label: "Overdue (Arrears)", key: "arrears" },
    { label: "Due Now (Current Period)", key: "current" },
    { label: "Scheduled (Future)", key: "future" },
];

const initialFormState = () => ({
    docNo: "",
    amountEuros: "",
    writeOffDate: dayjs(),
    periodBucket: "",
    memo: "",
});

const WriteOffDrawer = ({
    open,
    onClose,
    onSubmit,
    submitLoading = false,
    hideMemberSearch = false,
    /** Optional info banner when member search is hidden (e.g. selected invoice summary). */
    invoiceSummary = null,
    /** When set, write-off amount is prefilled (euros), e.g. from selected invoice debits. */
    prefillWriteOffAmountEuro = null,
}) => {
    const [formValues, setFormValues] = useState(() => initialFormState());
    const [errors, setErrors] = useState({});

    const resetForm = useCallback(() => {
        setFormValues(initialFormState());
        setErrors({});
    }, []);

    useEffect(() => {
        if (!open) return;
        const base = initialFormState();
        const prefillRaw =
            prefillWriteOffAmountEuro != null &&
            !Number.isNaN(Number(prefillWriteOffAmountEuro))
                ? Number(prefillWriteOffAmountEuro)
                : null;
        const amountPrefill =
            prefillRaw != null && prefillRaw > 0
                ? Math.round(prefillRaw * 100) / 100
                : "";
        setFormValues({ ...base, amountEuros: amountPrefill });
        setErrors({});
    }, [open, prefillWriteOffAmountEuro]);

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

    const validate = () => {
        const newErrors = {};
        const amt = Number(formValues.amountEuros);
        if (
            formValues.amountEuros === "" ||
            formValues.amountEuros == null ||
            !Number.isFinite(amt) ||
            amt <= 0
        ) {
            newErrors.amountEuros = true;
        }
        if (!formValues.writeOffDate) newErrors.writeOffDate = true;
        if (!formValues.periodBucket) newErrors.periodBucket = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (submitLoading) return;
        if (!validate()) {
            message.error("Please fill all required fields");
            return;
        }
        const eurosNum = Number(formValues.amountEuros);
        const formattedValues = {
            docNo: String(formValues.docNo || "").trim(),
            memo: String(formValues.memo || "").trim(),
            date: formValues.writeOffDate
                ? formValues.writeOffDate.format("YYYY-MM-DD")
                : null,
            amountEuros: Number.isFinite(eurosNum)
                ? Math.round(eurosNum * 100) / 100
                : formValues.amountEuros,
            periodBucket: formValues.periodBucket,
        };
        try {
            const result = onSubmit ? await onSubmit(formattedValues) : true;
            if (result !== false) {
                handleDrawerClose();
            }
        } catch (error) {
            console.error("Write-off submit failed:", error);
        }
    };

    return (
        <MyDrawer
            title="Write-off Entry Drawer"
            open={open}
            onClose={handleDrawerClose}
            width={700}
            isPagination={false}
            add={handleSubmit}
            isLoading={submitLoading}
        >
            <div style={{ padding: "10px" }}>
                <Row gutter={[16, 16]}>
                    {invoiceSummary ? (
                        <Col span={24}>
                            <Alert type="info" showIcon message={invoiceSummary} />
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
                        <MyInput
                            label="Ref No."
                            name="docNo"
                            placeholder="Enter Ref No."
                            value={formValues.docNo}
                            onChange={(e) => handleChange("docNo", e.target.value)}
                        />
                    </Col>
                    <Col span={24}>
                        <div className="my-input-wrapper">
                            <div className="d-flex justify-content-between">
                                <label
                                    htmlFor="writeOffAmount"
                                    className={`my-input-label ${errors.amountEuros ? "error" : ""}`}
                                >
                                    Write-off amount <span className="star">*</span>
                                    {errors.amountEuros ? (
                                        <span className="error-message">Required</span>
                                    ) : null}
                                </label>
                            </div>
                            <div
                                className={`my-input-container ${errors.amountEuros ? "error" : ""}`}
                            >
                                <InputNumber
                                    id="writeOffAmount"
                                    name="amountEuros"
                                    placeholder="0.00"
                                    value={formValues.amountEuros}
                                    onChange={(value) => {
                                        if (value != null && typeof value === "number") {
                                            handleChange(
                                                "amountEuros",
                                                Math.round(value * 100) / 100
                                            );
                                        } else {
                                            handleChange("amountEuros", value);
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
                                    status={errors.amountEuros ? "error" : ""}
                                    addonAfter="€"
                                />
                            </div>
                        </div>
                    </Col>
                    <Col span={24}>
                        <MyDatePicker1
                            label="Write-off Date"
                            name="writeOffDate"
                            value={formValues.writeOffDate}
                            onChange={(date) => handleChange("writeOffDate", date)}
                            required
                            hasError={errors.writeOffDate}
                        />
                    </Col>
                    <Col span={24}>
                        <CustomSelect
                            label="Period"
                            name="periodBucket"
                            placeholder="Select period"
                            options={PERIOD_BUCKET_OPTIONS}
                            value={formValues.periodBucket}
                            onChange={(e) =>
                                handleChange("periodBucket", e.target.value)
                            }
                            required
                            hasError={errors.periodBucket}
                            isMarginBtm={false}
                            isIDs
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

export default WriteOffDrawer;
