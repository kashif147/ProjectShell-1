

import React, { useEffect, useState } from "react";
import { Drawer, Button, Space, Divider, Table, Switch } from "antd";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";
import { convertEuroToSand, insertDataFtn, updateFtn } from "../../../utils/Utilities";
import { convertSandToEuro } from "../../../utils/Utilities";
import MyAlert from "../../../component/common/MyAlert";
const PricingDrawer = ({ open, onClose, product, onSubmit }) => {

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

      setFormData({
        currency: product.currentPricing.currency || "",
        memberPrice: "€" + (product.currentPricing.memberPrice !== null && product.currentPricing.memberPrice !== undefined && product.currentPricing.memberPrice !== "")
          ? formatToTwoDecimals(convertSandToEuro(Number(product.currentPricing.memberPrice)))
          : "",
        nonMemberPrice: "€" + (product.currentPricing.nonMemberPrice !== null && product.currentPricing.nonMemberPrice !== undefined && product.currentPricing.nonMemberPrice !== "")
          ? formatToTwoDecimals(convertSandToEuro(Number(product.currentPricing.nonMemberPrice)))
          : "",
        effectiveFrom: product.currentPricing.effectiveFrom || null,
        effectiveTo: product.currentPricing.effectiveTo || null,
        status: product.currentPricing.status || "Active",
        productId: product._id,
        price: "€" + (product.currentPricing.price !== null && product.currentPricing.price !== undefined && product.currentPricing.price !== "")
          ? formatToTwoDecimals(convertSandToEuro(Number(product.currentPricing.price)))
          : "",
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
        price: convertEuroToSand(formData.price),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo,
        status: formData.status,
      };

      // Get the pricing ID from product's currentPricing
      const pricingId = product?.currentPricing?._id;

      if (!pricingId) {
        // message.error("Pricing ID not found");
        return;
      }

      // Construct the endpoint URL
      const endpoint = `${process.env.REACT_APP_POLICY_SERVICE_URL || ''}/api/pricing/${pricingId}`;

      // Make the update call
      const response = await updateFtn(
        process.env.REACT_APP_POLICY_SERVICE_URL,
        `/api/pricing/${pricingId}`,
        requestData,
        () => {
          onClose();
          // Reset form data
          setFormData({
            currency: "",
            memberPrice: "",
            nonMemberPrice: "",
            effectiveFrom: null,
            effectiveTo: null,
            status: "Active",
            price: "",
          })

          //  "Updated successfully"
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
          <Button type="primary" onClick={handleSave}>
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
            onChange={(val) => handleChange("currency", val)}
            options={[
              { label: "USD", value: "USD" },
              { label: "EUR", value: "EUR" },
              { label: "PKR", value: "PKR" },
            ]}
            placeholder="Select currency"
          />
        </div>
        {
          product?.name === "Membership" ?
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
            :
            <div className="mb-3">
              <label className="form-label fw-semibold">Price</label>
              <MyInput
                type="number"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="Enter non-member price"
              />
            </div>
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
            onChange={(checked) => handleChange("status", checked ? "Active" : "Inactive")}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>

        {/* Pricing History */}
        <Divider orientation="left">Pricing History</Divider>
        <Table
          columns={historyColumns}
          dataSource={historyData}
          size="small"
          pagination={false}
        />

      </div>
    </Drawer>
  );
};

export default PricingDrawer;

