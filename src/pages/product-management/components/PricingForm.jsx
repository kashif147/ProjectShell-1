

import React, { useEffect, useState } from "react";
import { Drawer, Button, Space, Divider, Table, Switch } from "antd";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";
import { convertEuroToSand, insertDataFtn, updateFtn } from "../../../utils/Utilities";
import { convertSandToEuro } from "../../../utils/Utilities";
import MyAlert from "../../../component/common/MyAlert";
const PricingDrawer = ({ open, onClose, product, productType, onSubmit }) => {

  const [formData, setFormData] = useState({
    currency: "",
    memberPrice: "",
    nonMemberPrice: "",
    effectiveFrom: null,
    effectiveTo: null,
    status: "Active",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (product?.currentPricing) {
      const formatToTwoDecimals = (value) => {
        if (value === null || value === undefined || value === "") return "";
        const num = Number(value);
        return isNaN(num) ? "" : num.toFixed(2);
      };

      const pricing = product.currentPricing;

      setFormData({
        currency: (pricing.currency || "").toUpperCase(),
        memberPrice: pricing.memberPrice ? formatToTwoDecimals(convertSandToEuro(pricing.memberPrice)) : "",
        nonMemberPrice: pricing.nonMemberPrice ? formatToTwoDecimals(convertSandToEuro(pricing.nonMemberPrice)) : "",
        effectiveFrom: pricing.effectiveFrom || null,
        effectiveTo: pricing.effectiveTo || null,
        status: pricing.status || "Active",
        productId: product._id,
        price: pricing.price ? formatToTwoDecimals(convertSandToEuro(pricing.price)) : "",
      });
    }
  }, [product]);
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare data according to API body structure
      const requestData = {
        currency: formData.currency,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo,
        status: formData.status,
        price: productType?.name === "Membership" ? convertEuroToSand(formData.price) : undefined,
        memberPrice: productType?.name === "Membership" ? undefined : convertEuroToSand(formData.memberPrice),
        nonMemberPrice: productType?.name === "Membership" ? undefined : convertEuroToSand(formData.nonMemberPrice),
      };

      // Get the pricing ID from product's currentPricing
      const pricingId = product?.currentPricing?._id;

      if (!pricingId) {
        // message.error("Pricing ID not found");
        return;
      }

      // Construct the endpoint URL
      const endpoint = `${process.env.REACT_APP_POLICY_SERVICE_URL || ''}/pricing/${pricingId}`;

      // Make the update call
      const response = await updateFtn(
        process.env.REACT_APP_POLICY_SERVICE_URL,
        `/pricing/${pricingId}`,
        requestData,
        async () => {
          try {
            // Reset form data first
            setFormData({
              currency: "",
              memberPrice: "",
              nonMemberPrice: "",
              effectiveFrom: null,
              effectiveTo: null,
              status: "Active",
              price: "",
            });

            // Refresh product data
            if (onSubmit) await onSubmit();

            // Close last
            onClose();
          } catch (err) {
            console.error("Error in update callback:", err);
          }
        },
        "Updated Successfully"
      );

    } catch (error) {
      MyAlert("error", "Failed to update pricing");
    } finally {
      setLoading(false);
    }
  };

  // History table
  const historyColumns = [
    { title: "Currency", dataIndex: "currency", key: "currency" },
    { title: "Member Price", dataIndex: "memberPrice", key: "memberPrice" },
    { title: "Non-Member Price", dataIndex: "nonMemberPrice", key: "nonMemberPrice" },
    { title: "Effective From", dataIndex: "effectiveFrom", key: "effectiveFrom" },
    { title: "Effective To", dataIndex: "effectiveTo", key: "effectiveTo" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  const historyData = [
    {
      key: "1",
      currency: "USD",
      memberPrice: 2000,
      nonMemberPrice: 3500,
      effectiveFrom: "2024-01-01",
      effectiveTo: "2024-12-31",
      status: "Inactive",
    },
    {
      key: "2",
      currency: "EUR",
      memberPrice: 3000,
      nonMemberPrice: 5000,
      effectiveFrom: "2025-01-01",
      effectiveTo: "2028-10-11",
      status: "Active",
    },
  ];

  return (
    <Drawer
      title={`Pricing for ${product?.name || ""}`}
      open={open}
      onClose={onClose}
      width={800}
      extra={
        <Space>
          {/* <Button onClick={onClose}>Cancel</Button> */}
          <Button type="primary" className="butn primary-btn" onClick={handleSave} loading={loading}>
            update
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-container">

        <div className="mb-3">
          <label className="form-label fw-semibold">Currency</label>
          <CustomSelect
            value={formData.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            options={[
              { label: "USD", value: "USD" },
              { label: "EUR", value: "EUR" },
              { label: "PKR", value: "PKR" },
            ]}
            placeholder="Select currency"
          />
        </div>
        {
          productType?.name === "Membership" ?
            <div className="mb-3">
              <label className="form-label fw-semibold">Price</label>
              <MyInput
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Enter price"
              />
            </div>
            :
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">Member Price</label>
                <MyInput
                  type="number"
                  value={formData.memberPrice}
                  onChange={(e) => handleChange("memberPrice", e.target.value)}
                  placeholder="Enter member price"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Non-Member Price</label>
                <MyInput
                  type="number"
                  value={formData.nonMemberPrice}
                  onChange={(e) => handleChange("nonMemberPrice", e.target.value)}
                  placeholder="Enter non-member price"
                />
              </div>
            </>
        }


        <div className="mb-3">
          <label className="form-label fw-semibold">Effective From</label>
          <MyDatePicker
            value={formData.effectiveFrom}
            onChange={(date) => handleChange("effectiveFrom", date)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Effective To</label>
          <MyDatePicker
            value={formData.effectiveTo}
            onChange={(date) => handleChange("effectiveTo", date)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Status</label>
          <Switch
            checked={formData.status === "Active"}
            // className="butn"
            style={{backgroundColor:'#215e97'}}
            onChange={(checked) => handleChange("status", checked ? "Active" : "Inactive")}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>

        {/* Pricing History */}
        {/* <Divider orientation="left">Pricing History</Divider> */}
        {/* <Table
          columns={historyColumns}
          dataSource={historyData}
          size="small"
          pagination={false}
        /> */}

      </div>
    </Drawer>
  );
};

export default PricingDrawer;

