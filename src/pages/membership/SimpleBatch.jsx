import React, { useState } from "react";
import MyInput from "../../component/common/MyInput";
import CustomSelect from "../../component/common/CustomSelect";
import MyDatePicker1 from "../../component/common/MyDatePicker1";
import MyDrawer from "../../component/common/MyDrawer"
import { Row, Col } from "antd";

const SimpleBatch = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    batchType: "",
    batchName: "",
    fromDate: null,
    toDate: null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const batchTypes = [
    { key: "corn_market", label: "Corn Market" },
    { key: "new_graduate", label: "New Graduate" },
    { key: "corn_market_rewards", label: "Corn Market Rewards" },
  ];

  const handleSubmit = () => {
    // You can add validation here before submitting
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <MyDrawer
      title="Create Batch"
      open={open}
      onClose={onClose}
      add={handleSubmit}
      width={800}
    >
    <div className="drawer-main-cntainer"  style={{ padding: "16px" }}>
        <Row gutter={16}>
          {/* <Col span={24}>
            <CustomSelect
              label="Batch Type:"
              options={batchTypes}
              value={formData.batchType}
              onChange={(e) => handleChange("batchType", e.target.value)}
              required
            />
          </Col> */}
          <Col span={24}>
            <MyInput label="Batch Name:" value={formData.batchName} onChange={(e) => handleChange("batchName", e.target.value)} required />
          </Col>
          <Col span={12}>
            <MyDatePicker1 label="From Date:" value={formData.fromDate} onChange={(date) => handleChange("fromDate", date)} />
          </Col>
          <Col span={12}>
            <MyDatePicker1 label="To Date:" value={formData.toDate} onChange={(date) => handleChange("toDate", date)} />
          </Col>
        </Row>
      </div>
    </MyDrawer>
  );
};

export default SimpleBatch;