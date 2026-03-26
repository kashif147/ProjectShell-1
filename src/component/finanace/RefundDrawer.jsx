import React, { useState } from "react";
import { Row, Col, message, Checkbox, InputNumber } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearch from "../profile/MemberSearch";

const RefundDrawer = ({ open, onClose, onSubmit }) => {
    const [formValues, setFormValues] = useState({
        refund: "",
        refundDate: dayjs(),
        type: "",
        refNo: "",
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
                refNo: "",
            });
            setErrors({});
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
            onClose={onClose}
            width={700}
            isPagination={false}
            add={handleSubmit}
        >
            <div style={{ padding: "10px" }}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <label className="my-input-label">Member Search</label>
                        <MemberSearch
                            fullWidth={true}
                            style={{ width: "100%" }}
                            onSelectBehavior="none"
                        />
                    </Col>
                    <Col span={24}>
                        <MyInput
                            label="Ref No."
                            name="refNo"
                            placeholder="Enter Ref No."
                            value={formValues.refNo}
                            onChange={(e) => handleChange("refNo", e.target.value)}
                        />
                    </Col>
                    <Col span={24}>
                        <div className="my-input-wrapper">
  <div className="d-flex justify-content-between">
    <label htmlFor="refund" className={`my-input-label ${errors.refund ? "error" : ""}`}>
      Refund <span className="star">*</span>
      {errors.refund && <span className="error-message">Required</span>}
    </label>
  </div>
  <div className={`my-input-container ${errors.refund ? "error" : ""}`}>
    <InputNumber
      name="refund"
      placeholder="0.00"
      value={formValues.refund}
      onChange={(value) => handleChange("refund", value)}
      prefix="€"
      precision={2}
      min={0}
      style={{ width: "100%" }}
      controls={false}
      size="large"
      className="refund-input-right"
      formatter={(value) =>
        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
      }
      parser={(value) => value.replace(/[^\d.]/g, "")}
      status={errors.refund ? "error" : ""}
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
                            isMarginBtm={false}
                        />
                    </Col>
                </Row>
            </div>
        </MyDrawer>
    );
};

export default RefundDrawer;
