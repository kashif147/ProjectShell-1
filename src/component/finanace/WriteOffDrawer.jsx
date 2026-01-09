import React, { useState } from "react";
import { Row, Col, message } from "antd";
import dayjs from "dayjs";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearch from "../profile/MemberSearch";

const WriteOffDrawer = ({ open, onClose, onSubmit }) => {
    const [formValues, setFormValues] = useState({
        writeOff: "",
        writeOffDate: dayjs(),
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
        if (!formValues.writeOff) newErrors.writeOff = true;
        if (!formValues.writeOffDate) newErrors.writeOffDate = true;
        if (!formValues.type) newErrors.type = true;
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            const formattedValues = {
                ...formValues,
                writeOffDate: formValues.writeOffDate ? formValues.writeOffDate.format("YYYY-MM-DD") : null,
            };
            if (onSubmit) onSubmit(formattedValues);
            onClose();
            // Reset form after submission
            setFormValues({
                writeOff: "",
                writeOffDate: dayjs(),
                type: "",
                refNo: "",
            });
            setErrors({});
        } else {
            message.error("Please fill all required fields");
        }
    };

    return (
        <MyDrawer
            title="Write-off Entry Drawer"
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
                        <MyInput
                            label="Write-off"
                            name="writeOff"
                            placeholder="Enter write-off amount or name"
                            value={formValues.writeOff}
                            onChange={(e) => handleChange("writeOff", e.target.value)}
                            required
                            hasError={errors.writeOff}
                        />
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

export default WriteOffDrawer;
