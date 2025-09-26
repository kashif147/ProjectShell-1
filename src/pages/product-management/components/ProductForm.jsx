import React, { useState, useEffect } from "react";
import { Button, Space, Switch, Divider } from "antd";
import { SaveOutlined, CloseOutlined, PlusOutlined } from "@ant-design/icons";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";

const ProductForm = ({ product, productType, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    isActive: true,
    // Meta fields for product types
    createdAt: null,
    updatedAt: null,
    createdBy: null,
    updatedBy: null,
    // Product-specific fields
    memberPrice: "",
    nonMemberPrice: "",
    effectiveFrom: "",
    effectiveTo: "",
    currency: "EUR",
  });

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
        isActive: product.isActive !== undefined ? product.isActive : true,
        // Meta fields
        createdAt: product.createdAt || null,
        updatedAt: product.updatedAt || null,
        createdBy: product.createdBy || null,
        updatedBy: product.updatedBy || null,
        // Product-specific fields
        memberPrice: product.memberPrice || "",
        nonMemberPrice: product.nonMemberPrice || "",
        effectiveFrom: product.effectiveFrom || "",
        effectiveTo: product.effectiveTo || "",
        currency: product.currency || "EUR",
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
        createdAt: new Date().toISOString(),
        createdBy: "current_user", // This should come from auth context
      }));
    }
  }, [product, productType, isProduct, isProductType]);

  const CURRENCY_OPTIONS = [
    { value: "EUR", label: "EUR (€)" },
    { value: "USD", label: "USD ($)" },
    { value: "GBP", label: "GBP (£)" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.name?.trim())
      newErrors.name = `${
        isProductType ? "Product type" : "Product"
      } name is required`;
    if (!formData.code?.trim())
      newErrors.code = `${
        isProductType ? "Product type" : "Product"
      } code is required`;
    if (!formData.description?.trim())
      newErrors.description = "Description is required";

    // Product-specific validation
    if (isProduct) {
      if (!formData.memberPrice || formData.memberPrice <= 0)
        newErrors.memberPrice = "Price must be greater than 0";

      // Validate non-member price
      if (!formData.nonMemberPrice || formData.nonMemberPrice <= 0)
        newErrors.nonMemberPrice = "Non-member price must be greater than 0";

      if (!formData.effectiveFrom)
        newErrors.effectiveFrom = "Effective from date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submissionData = { ...formData };

      // For membership products, use the single price for both member and non-member
      if (isProduct && productType?.category === "MEMBERSHIP") {
        submissionData.nonMemberPrice = formData.memberPrice; // Use same price for both
      }

      // For new product types, set meta fields
      if (isProductType && !product) {
        submissionData.createdAt = new Date().toISOString();
        submissionData.createdBy = "current_user"; // This should come from auth context
      }

      // For existing product types, update meta fields
      if (isProductType && product) {
        submissionData.updatedAt = new Date().toISOString();
        submissionData.updatedBy = "current_user"; // This should come from auth context
      }

      await onSubmit(submissionData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="drawer-main-container product-form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
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
          placeholder={`Enter ${
            isProductType ? "product type" : "product"
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
          placeholder={`Enter unique ${
            isProductType ? "product type" : "product"
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
      {isProduct && (
        <>
          <Divider orientation="left">Pricing Information</Divider>

          {/* Currency Field */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Currency</label>
            <CustomSelect
              name="currency"
              value={formData.currency}
              onChange={(value) => handleInputChange("currency", value)}
              options={CURRENCY_OPTIONS}
              placeholder="Select currency"
            />
          </div>

          {/* Price Field - Single price for membership, dual prices for others */}
          {productType?.category === "MEMBERSHIP" ? (
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Price (
                {formData.currency === "EUR"
                  ? "€"
                  : formData.currency === "USD"
                  ? "$"
                  : "£"}
                )
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
                  Member Price (
                  {formData.currency === "EUR"
                    ? "€"
                    : formData.currency === "USD"
                    ? "$"
                    : "£"}
                  )
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
                  Non-Member Price (
                  {formData.currency === "EUR"
                    ? "€"
                    : formData.currency === "USD"
                    ? "$"
                    : "£"}
                  )
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
        <label className="form-label fw-semibold">Status</label>
        <div className="switch-container">
          <Switch
            checked={formData.isActive}
            onChange={(checked) => handleInputChange("isActive", checked)}
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
          <span className="switch-label">
            {formData.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
