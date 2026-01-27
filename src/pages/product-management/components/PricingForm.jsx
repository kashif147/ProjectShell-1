

import React, { useEffect, useState } from "react";
import { Drawer, Button, Space, Divider, Table, Switch, Tag } from "antd";
import { EditOutlined } from "@ant-design/icons";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";
import { convertEuroToSand, insertDataFtn, updateFtn } from "../../../utils/Utilities";
import { convertSandToEuro } from "../../../utils/Utilities";
import MyAlert from "../../../component/common/MyAlert";
import dayjs from "dayjs";

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPricingId, setEditingPricingId] = useState(null);
  // Helper function to format prices
  const formatToTwoDecimals = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(value);
    return isNaN(num) ? "" : num.toFixed(2);
  };

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setFormData({
        currency: "",
        memberPrice: "",
        nonMemberPrice: "",
        effectiveFrom: null,
        effectiveTo: null,
        status: "Active",
        price: "",
      });
      setIsEditMode(false);
      setEditingPricingId(null);
    }
  }, [open]);
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle editing existing pricing
  const handleEditPricing = (pricingRecord) => {
    setIsEditMode(true);
    setEditingPricingId(pricingRecord._id);

    setFormData({
      currency: (pricingRecord.currency || "").toUpperCase(),
      memberPrice: pricingRecord.memberPrice ? formatToTwoDecimals(convertSandToEuro(pricingRecord.memberPrice)) : "",
      nonMemberPrice: pricingRecord.nonMemberPrice ? formatToTwoDecimals(convertSandToEuro(pricingRecord.nonMemberPrice)) : "",
      effectiveFrom: pricingRecord.effectiveFrom ? dayjs(pricingRecord.effectiveFrom) : null,
      effectiveTo: pricingRecord.effectiveTo ? dayjs(pricingRecord.effectiveTo) : null,
      status: pricingRecord.status || "Active",
      price: pricingRecord.price ? formatToTwoDecimals(convertSandToEuro(pricingRecord.price)) : "",
    });
  };

  // Handle canceling edit mode
  const handleCancel = () => {
    setIsEditMode(false);
    setEditingPricingId(null);
    setFormData({
      currency: "",
      memberPrice: "",
      nonMemberPrice: "",
      effectiveFrom: null,
      effectiveTo: null,
      status: "Active",
      price: "",
    });
  };

  const getCurrencySymbol = () => {
    switch (formData.currency) {
      case "USD": return "$";
      case "EUR": return "€";
      case "PKR": return "Rs";
      default: return "";
    }
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
      };

      // Add price fields based on product type
      if (productType?.name === "Membership") {
        requestData.price = convertEuroToSand(formData.price);
      } else {
        requestData.memberPrice = convertEuroToSand(formData.memberPrice);
        requestData.nonMemberPrice = convertEuroToSand(formData.nonMemberPrice);
      }

      // Add productId for CREATE mode
      if (!isEditMode) {
        requestData.productId = product._id;
      }

      if (isEditMode) {
        // UPDATE existing pricing
        await updateFtn(
          process.env.REACT_APP_POLICY_SERVICE_URL,
          `/pricing/${editingPricingId}`,
          requestData,
          async () => {
            handleCancel();
            if (onSubmit) await onSubmit();
            onClose();
          },
          "Pricing Updated Successfully"
        );
      } else {
        // CREATE new pricing
        await insertDataFtn(
          process.env.REACT_APP_POLICY_SERVICE_URL,
          `/pricing`,
          requestData,
          "Pricing Created Successfully",
          "Failed to create pricing",
          async () => {
            handleCancel();
            if (onSubmit) await onSubmit();
            onClose();
          }
        );
      }

    } catch (error) {
      MyAlert("error", isEditMode ? "Failed to update pricing" : "Failed to create pricing");
    } finally {
      setLoading(false);
    }
  };

  // History table columns with formatting
  const getHistoryColumns = () => {
    const baseColumns = [
      {
        title: "Currency",
        dataIndex: "currency",
        key: "currency",
        render: (currency) => currency?.toUpperCase() || "-"
      },
    ];

    // Add price columns based on product type
    if (productType?.name === "Membership") {
      baseColumns.push({
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (price, record) => {
          if (!price) return "-";
          const formattedPrice = convertSandToEuro(price);
          const symbol = record.currency === "EUR" ? "€" : record.currency === "USD" ? "$" : "";
          return `${symbol}${formattedPrice}.00`;
        }
      });
    } else {
      baseColumns.push(
        {
          title: "Member Price",
          dataIndex: "memberPrice",
          key: "memberPrice",
          render: (price, record) => {
            if (!price) return "-";
            const formattedPrice = convertSandToEuro(price);
            const symbol = record.currency === "EUR" ? "€" : record.currency === "USD" ? "$" : "";
            return `${symbol}${formattedPrice}.00`;
          }
        },
        {
          title: "Non-Member Price",
          dataIndex: "nonMemberPrice",
          key: "nonMemberPrice",
          render: (price, record) => {
            if (!price) return "-";
            const formattedPrice = convertSandToEuro(price);
            const symbol = record.currency === "EUR" ? "€" : record.currency === "USD" ? "$" : "";
            return `${symbol}${formattedPrice}.00`;
          }
        }
      );
    }

    // Add date and status columns
    baseColumns.push(
      {
        title: "Effective From",
        dataIndex: "effectiveFrom",
        key: "effectiveFrom",
        render: (date) => date ? new Date(date).toLocaleDateString() : "-"
      },
      {
        title: "Effective To",
        dataIndex: "effectiveTo",
        key: "effectiveTo",
        render: (date) => date ? new Date(date).toLocaleDateString() : "-"
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Tag color={status === "Active" ? "green" : "red"}>
            {status}
          </Tag>
        )
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => {
          // Only show edit button for current pricing
          const isCurrentPricing = record._id === product?.currentPricing?._id;

          if (!isCurrentPricing) return null;

          return (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditPricing(record)}
            />
          );
        }
      }
    );

    return baseColumns;
  };

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
            {isEditMode ? "Update" : "Create"}
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
              <label className="form-label fw-semibold">
                Price {formData.currency && getCurrencySymbol() ? `(${getCurrencySymbol()})` : ""}
              </label>
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
                <label className="form-label fw-semibold">
                  Member Price {formData.currency && getCurrencySymbol() ? `(${getCurrencySymbol()})` : ""}
                </label>
                <MyInput
                  type="number"
                  value={formData.memberPrice}
                  onChange={(e) => handleChange("memberPrice", e.target.value)}
                  placeholder="Enter member price"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Non-Member Price {formData.currency && getCurrencySymbol() ? `(${getCurrencySymbol()})` : ""}
                </label>
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
            name="effectiveFrom"
            value={formData.effectiveFrom}
            onChange={(date) => handleChange("effectiveFrom", date)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Effective To</label>
          <MyDatePicker
            name="effectiveTo"
            value={formData.effectiveTo}
            onChange={(date) => handleChange("effectiveTo", date)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Status</label>
          <Switch
            checked={formData.status === "Active"}
            // className="butn"
            style={{ backgroundColor: '#215e97' }}
            onChange={(checked) => handleChange("status", checked ? "Active" : "Inactive")}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </div>

        {/* Pricing History */}
        <>
          <Divider orientation="left">Pricing History</Divider>
          <Table
            columns={getHistoryColumns()}
            dataSource={product?.pricingHistory || []}
            rowKey="_id"
            size="small"
            pagination={false}
            scroll={{ x: "max-content" }}
            components={{
              header: {
                cell: (props) => {
                  const { children, ...restProps } = props;
                  return (
                    <th
                      {...restProps}
                      style={{
                        backgroundColor: '#215e97',
                        ...restProps.style
                      }}
                    >
                      <div style={{ color: '#fff' }}>
                        {children}
                      </div>
                    </th>
                  );
                },
              },
            }}
          />
        </>

      </div>
    </Drawer>
  );
};

export default PricingDrawer;

