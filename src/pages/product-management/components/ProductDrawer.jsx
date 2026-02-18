import React, { useState, useEffect } from "react";
import { Button, Space, Switch, Divider, Table, Tag } from "antd";
import { SaveOutlined, CloseOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";
import { convertSandToEuro } from "../../../utils/Utilities";
import dayjs from "dayjs";

const ProductForm = ({ product, productType, onClose, onSubmit, hidePricing }) => {
  const initialFormState = {
    name: "",
    code: "",
    description: "",
    status: "Active",
    memberPrice: "",
    nonMemberPrice: "",
    currency: "",
    effectiveFrom: null,
    effectiveTo: null,
  };
  const [formData, setFormData] = useState(initialFormState);
  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };
  useEffect(() => {
    if (!product) {
      resetForm(); // optional safeguard when switching modes
    }
  }, [product, productType]);

  const handleClose = () => {
    resetForm(); // ✅ clear form
    onClose?.(); // ✅ then close drawer
  };
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isProductType = !productType; // If no productType prop, we're creating a product type
  const isProduct = !!productType; // If productType prop exists, we're creating a product

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        code: product.code || "",
        description: product.description || "",
        status: product.status,
        memberPrice: product.currentPricing?.memberPrice
          ? convertSandToEuro(product.currentPricing.memberPrice)
          : product.currentPricing?.price
            ? convertSandToEuro(product.currentPricing.price)
            : "",
        nonMemberPrice: product.currentPricing?.nonMemberPrice ? convertSandToEuro(product.currentPricing.nonMemberPrice) : "",
        currency: product.currentPricing?.currency || "",
        effectiveFrom: product.currentPricing?.effectiveFrom ? dayjs(product.currentPricing.effectiveFrom) : null,
        effectiveTo: product.currentPricing?.effectiveTo ? dayjs(product.currentPricing.effectiveTo) : null,
      });
    } else if (isProduct) {
      // Set default values for new product
      setFormData((prev) => ({
        ...prev,
      }));
    } else if (isProductType) {
      // Set default values for new product type
      setFormData((prev) => ({
        ...prev,
      }));
    }
  }, [product, productType, isProduct, isProductType]);

  const CURRENCY_OPTIONS = [
    { value: "EUR", label: "EUR" },
    { value: "USD", label: "USD" },
    { value: "GBP", label: "GBP" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const getCurrencySymbol = () => {
    switch (formData.currency) {
      case "USD": return "$";
      case "EUR": return "€";
      case "GBP": return "£";
      default: return "";
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
      }
    );

    return baseColumns;
  };

  const validate = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.name?.trim())
      newErrors.name = `${isProductType ? "Product type" : "Product"
        } name is required`;

    if (!formData.code?.trim())
      newErrors.code = `${isProductType ? "Product type" : "Product"
        } code is required`;

    if (!formData.description?.trim())
      newErrors.description = "Description is required";

    if (isProduct && !hidePricing) {
      if (!formData.effectiveFrom)
        newErrors.effectiveFrom = "Effective from date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (!validate(e)) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submissionData = { ...formData };

      // 🔹 Helper: Convert Euro → Sand
      const euroToSand = (value) => {
        const num = Number(value);
        if (isNaN(num)) return 0;
        return Math.round(num * 100); // 1 Euro = 100 Sand
      };

      // 🔹 Convert prices only if the keys exist
      if ("memberPrice" in formData) {
        submissionData.memberPrice = euroToSand(formData.memberPrice);
      }
      if ("nonMemberPrice" in formData) {
        submissionData.nonMemberPrice = euroToSand(formData.nonMemberPrice);
      }

      // 🔹 For membership products, use same price for both
      if (isProduct && productType?.name === "Membership") {
        submissionData.nonMemberPrice = submissionData.memberPrice;
      }

      // 🔹 Add or update meta fields
      if (isProductType && !product) {
        // submissionData.createdAt = new Date().toISOString();
        // submissionData.createdBy = "current_user";
      } else if (isProductType && product) {
        // submissionData.updatedAt = new Date().toISOString();
        // submissionData.updatedBy = "current_user";
      }

      // 🔹 Submit data
      await onSubmit(submissionData);
      resetForm();
      onClose?.();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      id={productType ? "product-form" : "product-type-form"}
      className="drawer-main-container product-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }}
    >
      {/* Product Type Fields */}
      <div className="mb-3">
        <label className="form-label fw-semibold">
          {isProductType ? "Product Type" : "Product Name"}
        </label>
        <MyInput
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          hasError={!!errors.name}
          errorMessage={errors.name}
          placeholder={`Enter ${isProductType ? "product type" : "product"
            } name`}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Code</label>
        <MyInput
          name="code"
          value={formData.code}
          onChange={(e) => handleInputChange("code", e.target.value)}
          hasError={!!errors.code}
          errorMessage={errors.code}
          placeholder={`Enter unique ${isProductType ? "product type" : "product"
            } code`}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Description</label>
        <MyInput
          name="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          hasError={!!errors.description}
          errorMessage={errors.description}
          placeholder="Enter description"
          textarea
          rows={4}
        />
      </div>

      {/* Product-specific fields */}
      {isProduct && !hidePricing && (
        <>
          <Divider orientation="left">Pricing Information</Divider>

          {/* Currency Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Currency</label>
            <CustomSelect
              name="currency"
              value={formData.currency}
              onChange={(value) =>
                handleInputChange("currency", value.target.value)
              }
              options={CURRENCY_OPTIONS}
              placeholder="Select currency"
            />
          </div>

          {/* Price Field - Single price for membership, dual prices for others */}
          {productType?.name === "Membership" ? (
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Price {formData.currency && getCurrencySymbol() ? `(${getCurrencySymbol()})` : ""}
              </label>
              <MyInput
                name="memberPrice"
                value={formData.memberPrice}
                onChange={(e) =>
                  handleInputChange("memberPrice", e.target.value)
                }
                hasError={!!errors.memberPrice}
                errorMessage={errors.memberPrice}
                placeholder="Enter price"
                type="number"
                min="0"
                step="0.01"
              />
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Member Price {formData.currency && getCurrencySymbol() ? `(${getCurrencySymbol()})` : ""}
                </label>
                <MyInput
                  name="memberPrice"
                  value={formData.memberPrice}
                  onChange={(e) =>
                    handleInputChange("memberPrice", e.target.value)
                  }
                  hasError={!!errors.memberPrice}
                  errorMessage={errors.memberPrice}
                  placeholder="Enter member price"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Non-Member Price {formData.currency && getCurrencySymbol() ? `(${getCurrencySymbol()})` : ""}
                </label>
                <MyInput
                  name="nonMemberPrice"
                  value={formData.nonMemberPrice}
                  onChange={(e) =>
                    handleInputChange("nonMemberPrice", e.target.value)
                  }
                  hasError={!!errors.nonMemberPrice}
                  errorMessage={errors.nonMemberPrice}
                  placeholder="Enter non-member price"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
            </>
          )}

          {/* Effective From Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Effective From</label>
            <MyDatePicker
              name="effectiveFrom"
              value={formData.effectiveFrom}
              onChange={(date) => handleInputChange("effectiveFrom", date)}
              hasError={!!errors.effectiveFrom}
              errorMessage={errors.effectiveFrom}
              placeholder="Select effective from date"
            />
          </div>

          {/* Effective To Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Effective To</label>
            <MyDatePicker
              name="effectiveTo"
              value={formData.effectiveTo}
              onChange={(date) => handleInputChange("effectiveTo", date)}
              placeholder="Select effective to date (optional)"
            />
          </div>
        </>
      )}

      <div className="mb-3">
        {/* <label className="form-label fw-semibold">Status</label> */}
        <div className="switch-container">
          <Switch
            checked={formData.status === "Active"} // convert string → boolean
            style={{ backgroundColor: '#215e97' }}
            onChange={(checked) =>
              handleInputChange("status", checked ? "Active" : "Inactive")

            }
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
          <span className="switch-label">
            {formData.status ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Pricing History - only show for products with pricing */}
      {isProduct && product?.pricingHistory && (
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
      )}
    </form>
  );
};

export default ProductForm;
