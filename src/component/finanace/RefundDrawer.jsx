import React, { useState } from "react";
import { Row, Col, message } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";

const RefundDrawer = ({ open, onClose, onSubmit }) => {
    const [formValues, setFormValues] = useState({
        refund: "",
        refundDate: dayjs(),
        type: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (name, value) => {
        setFormValues((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: false }));
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
            const formattedValues = {
                ...formValues,
                refundDate: formValues.refundDate ? formValues.refundDate.format("YYYY-MM-DD") : null,
            };
            if (onSubmit) onSubmit(formattedValues);
            onClose();
            // Reset form after submission
            setFormValues({
                refund: "",
                refundDate: dayjs(),
                type: "",
            });
            setErrors({});
        } else {
            message.error("Please fill all required fields");
        }
    };

    return (
        <MyDrawer
            title="Refund Entry Drawer"
            open={open}
            onClose={onClose}
            width={500}
            isPagination={false}
            add={handleSubmit}
        >
            <div style={{ padding: "10px" }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <MyInput
                            label="Refund"
                            name="refund"
                            placeholder="Enter refund amount or name"
                            value={formValues.refund}
                            onChange={(e) => handleChange("refund", e.target.value)}
                            required
                            hasError={errors.refund}
                        />
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
                        <CustomSelect
                            label="Type"
                            name="type"
                            placeholder="Select type"
                            options={[
                                { label: "Direct Debit", key: "Direct Debit" },
                                { label: "Credit Card", key: "Credit Card" },
                                { label: "Bank Transfer", key: "Bank Transfer" },
                                { label: "Cheque", key: "Cheque" },
                            ]}
                            value={formValues.type}
                            onChange={(e) => handleChange("type", e.target.value)}
                            required
                            hasError={errors.type}
                        />
                    </Col>
                </Row>
            </div>
        </MyDrawer>
    );
};

export default RefundDrawer;
