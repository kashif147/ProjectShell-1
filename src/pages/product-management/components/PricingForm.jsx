// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Space,
//   Row,
//   Col,
//   Card,
//   Table,
//   Tag,
//   message,
//   Divider,
//   Switch,
// } from "antd";
// import {
//   SaveOutlined,
//   CloseOutlined,
//   PlusOutlined,
//   DeleteOutlined,
//   HistoryOutlined,
// } from "@ant-design/icons";
// import MyInput from "../../../component/common/MyInput";
// import CustomSelect from "../../../component/common/CustomSelect";
// import MyDatePicker from "../../../component/common/MyDatePicker";
// import { useDispatch, useSelector } from "react-redux";
// import { getPricingHistory } from "../../../features/ProductTypesSlice";

// const PricingForm = ({
//   productType,
//   product,
//   pricing,
//   onClose,
//   onSubmit,
//   onRef,
// }) => {
//   const dispatch = useDispatch();
//   const { pricingHistory, loading: historyLoading } = useSelector(
//     (state) => state.productTypes
//   );
// debugger
//   const [formData, setFormData] = useState({
//     productTypeId: "",
//     effectiveFrom: "",
//     effectiveTo: "",
//     memberPrice: "",
//     nonMemberPrice: "",
//     currency: "EUR",
//     isActive: true,
//     status: "Active",
//   });

//   const [pricingRules, setPricingRules] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (productType) {
//       setFormData((prev) => ({
//         ...prev,
//         productTypeId: productType.id,
//       }));

//       // Load pricing history when productType is available
//       dispatch(getPricingHistory(productType.id));
//     }

//     if (pricing) {
//       debugger
//       setFormData({
//         productId: pricing._id,
//         effectiveFrom: pricing.effectiveFrom || "",
//         effectiveTo: pricing.effectiveTo || "",
//         memberPrice: pricing.memberPrice || "",
//         nonMemberPrice: pricing.nonMemberPrice || "",
//         currency: pricing.currency || "EUR",
//         status: pricing?.status,
//       });
//     }
//   }, [productType, pricing, dispatch]);

//   // Expose handleSubmit function to parent component
//   useEffect(() => {
//     if (onRef && typeof onRef === "function") {
//       onRef({
//         handleSubmit,
//         loading,
//       });
//     }
//   }, [onRef, loading]);

//   const handleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));

//     // Clear error when user starts typing
//     if (errors[field]) {
//       setErrors((prev) => ({
//         ...prev,
//         [field]: "",
//       }));
//     }
//   };

//   const validate = () => {
//     let newErrors = {};

//     if (!formData.effectiveFrom)
//       newErrors.effectiveFrom = "Effective from date is required";

//     if (!formData.memberPrice || formData.memberPrice <= 0)
//       newErrors.memberPrice = "Price must be greater than 0";

//     // Only validate non-member price for non-membership products
//     if (productType?.category !== "MEMBERSHIP") {
//       if (!formData.nonMemberPrice || formData.nonMemberPrice <= 0)
//         newErrors.nonMemberPrice = "Non-member price must be greater than 0";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) {
//       return;
//     }

//     setLoading(true);
//     try {
//       // For membership products, use the single price for both member and non-member
//       const submitData = {
//         ...formData,
//         productTypeId: productType?.id,
//       };

//       if (productType?.category === "MEMBERSHIP") {
//         submitData.nonMemberPrice = formData.memberPrice; // Use same price for both
//       }

//       await onSubmit(submitData);
//     } catch (error) {
//       console.error("Error submitting form:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const pricingColumns = [
//     {
//       title: "Effective From",
//       dataIndex: "effectiveFrom",
//       key: "effectiveFrom",
//       render: (date) => new Date(date).toLocaleDateString(),
//     },
//     {
//       title: "Effective To",
//       dataIndex: "effectiveTo",
//       key: "effectiveTo",
//       render: (date) => new Date(date).toLocaleDateString(),
//     },
//     {
//       title: "Member Price",
//       dataIndex: "memberPrice",
//       key: "memberPrice",
//       render: (price) => `€${price}`,
//     },
//     {
//       title: "Non-Member Price",
//       dataIndex: "nonMemberPrice",
//       key: "nonMemberPrice",
//       render: (price) => `€${price}`,
//     },
//     {
//       title: "Status",
//       dataIndex: "isActive",
//       key: "isActive",
//       render: (isActive) => (
//         <Tag color={isActive ? "green" : "red"}>
//           {isActive ? "Active" : "Inactive"}
//         </Tag>
//       ),
//     },
//   ];

//   const getPriceHistoryColumns = () => {
//     const baseColumns = [];

//     // 1. Currency (matches form field sequence)
//     baseColumns.push({
//       title: "Currency",
//       dataIndex: "currency",
//       key: "currency",
//     });

//     // 2. Price (matches form field sequence)
//     if (productType?.category === "MEMBERSHIP") {
//       baseColumns.push({
//         title: "Price",
//         dataIndex: "memberPrice",
//         key: "memberPrice",
//         render: (price, record) => {
//           const currency = record.currency || "EUR";
//           const symbol =
//             currency === "EUR" ? "€" : currency === "USD" ? "€" : "£";
//           return `${symbol}${price || 0}`;
//         },
//       });
//     } else {
//       baseColumns.push(
//         {
//           title: "Member Price",
//           dataIndex: "memberPrice",
//           key: "memberPrice",
//           render: (price, record) => {
//             const currency = record.currency || "EUR";
//             const symbol =
//               currency === "EUR" ? "€" : currency === "USD" ? "€" : "£";
//             return `${symbol}${price || 0}`;
//           },
//         },
//         {
//           title: "Non-Member Price",
//           dataIndex: "nonMemberPrice",
//           key: "nonMemberPrice",
//           render: (price, record) => {
//             const currency = record.currency || "EUR";
//             const symbol =
//               currency === "EUR" ? "€" : currency === "USD" ? "€" : "£";
//             return `${symbol}${price || 0}`;
//           },
//         }
//       );
//     }

//     // 3. Effective From (matches form field sequence)
//     baseColumns.push({
//       title: "Effective From",
//       dataIndex: "effectiveFrom",
//       key: "effectiveFrom",
//       render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
//     });

//     // 4. Effective To (matches form field sequence)
//     baseColumns.push({
//       title: "Effective To",
//       dataIndex: "effectiveTo",
//       key: "effectiveTo",
//       render: (date) =>
//         date ? new Date(date).toLocaleDateString() : "Ongoing",
//     });

//     // 5. Status (matches form field sequence)
//     baseColumns.push({
//       title: "Status",
//       dataIndex: "isActive",
//       key: "isActive",
//       render: (isActive) => (
//         <Tag color={isActive ? "green" : "red"}>
//           {isActive ? "Active" : "Inactive"}
//         </Tag>
//       ),
//     });

//     // Additional columns
//     baseColumns.push(
//       {
//         title: "Created",
//         dataIndex: "createdAt",
//         key: "createdAt",
//         render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
//       },
//       {
//         title: "Updated",
//         dataIndex: "updatedAt",
//         key: "updatedAt",
//         render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
//       }
//     );

//     return baseColumns;
//   };

//   return (
//     <div className="drawer-main-container">
//       {/* Product Information Section */}
//       {product && productType && (
//         <div
//           style={{
//             marginBottom: "24px",
//             padding: "16px",
//             backgroundColor: "#f8f9fa",
//             borderRadius: "8px",
//             border: "1px solid #e9ecef",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               marginBottom: "12px",
//             }}
//           >
//             <div
//               style={{
//                 backgroundColor: "#e3f2fd",
//                 padding: "8px",
//                 borderRadius: "6px",
//                 marginRight: "12px",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: "16px",
//                   fontWeight: "600",
//                   color: "#1976d2",
//                 }}
//               >
//                 {productType.category}
//               </span>
//             </div>
//             <div>
//               <h3
//                 style={{
//                   margin: 0,
//                   fontSize: "18px",
//                   fontWeight: "600",
//                   color: "#1a1a1a",
//                 }}
//               >
//                 {product.name}
//               </h3>
//               <p
//                 style={{
//                   margin: 0,
//                   fontSize: "14px",
//                   color: "#666",
//                   marginTop: "4px",
//                 }}
//               >
//                 {product.description}
//               </p>
//             </div>
//           </div>

//           <div
//             style={{
//               display: "flex",
//               gap: "24px",
//               flexWrap: "wrap",
//             }}
//           >
//             <div>
//               <span
//                 style={{
//                   fontSize: "12px",
//                   color: "#666",
//                   fontWeight: "500",
//                 }}
//               >
//                 PRODUCT CODE
//               </span>
//               <div
//                 style={{
//                   fontSize: "14px",
//                   fontWeight: "600",
//                   color: "#1a1a1a",
//                   marginTop: "2px",
//                 }}
//               >
//                 {product.code}
//               </div>
//             </div>

//             <div>
//               <span
//                 style={{
//                   fontSize: "12px",
//                   color: "#666",
//                   fontWeight: "500",
//                 }}
//               >
//                 STATUS
//               </span>
//               <div style={{ marginTop: "2px" }}>
//                 <Tag color={product.isActive ? "green" : "red"}>
//                   {product.isActive ? "Active" : "Inactive"}
//                 </Tag>
//               </div>
//             </div>

//             {product.createdAt && (
//               <div>
//                 <span
//                   style={{
//                     fontSize: "12px",
//                     color: "#666",
//                     fontWeight: "500",
//                   }}
//                 >
//                   CREATED
//                 </span>
//                 <div
//                   style={{
//                     fontSize: "14px",
//                     fontWeight: "600",
//                     color: "#1a1a1a",
//                     marginTop: "2px",
//                   }}
//                 >
//                   {new Date(product.createdAt).toLocaleDateString()}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Currency Field */}
//       <div className="mb-3">
//         <label className="form-label fw-semibold">Currency</label>
//         <CustomSelect
//           name="currency"
//           value={formData.currency}
//           onChange={(value) => handleInputChange("currency", value)}
//           options={[
//             { value: "EUR", label: "EUR (€)" },
//             { value: "USD", label: "USD ($)" },
//             { value: "GBP", label: "GBP (£)" },
//           ]}
//           placeholder="Select currency"
//         />
//       </div>

//       {/* Price Field - Single price for membership, dual prices for others */}
//       {productType?.category === "MEMBERSHIP" ? (
//         <div className="mb-3">
//           <label className="form-label fw-semibold">
//             Price (
//             {formData.currency === "EUR"
//               ? "€"
//               : formData.currency === "USD"
//                 ? "€"
//                 : "£"}
//             )
//           </label>
//           <MyInput
//             name="memberPrice"
//             value={formData.memberPrice}
//             onChange={(e) => handleInputChange("memberPrice", e.target.value)}
//             hasError={!!errors.memberPrice}
//             errorMessage={errors.memberPrice}
//             placeholder="Enter price"
//             type="number"
//             min="0"
//             step="0.01"
//           />
//         </div>
//       ) : (
//         <>
//           <div className="mb-3">
//             <label className="form-label fw-semibold">
//               Member Price (
//               {formData.currency === "EUR"
//                 ? "€"
//                 : formData.currency === "USD"
//                   ? "€"
//                   : "£"}
//               )
//             </label>
//             <MyInput
//               name="memberPrice"
//               value={formData.memberPrice}
//               onChange={(e) => handleInputChange("memberPrice", e.target.value)}
//               hasError={!!errors.memberPrice}
//               errorMessage={errors.memberPrice}
//               placeholder="Enter member price"
//               type="number"
//               min="0"
//               step="0.01"
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label fw-semibold">
//               Non-Member Price (
//               {formData.currency === "EUR"
//                 ? "€"
//                 : formData.currency === "USD"
//                   ? "€"
//                   : "£"}
//               )
//             </label>
//             <MyInput
//               name="nonMemberPrice"
//               value={formData.nonMemberPrice}
//               onChange={(e) =>
//                 handleInputChange("nonMemberPrice", e.target.value)
//               }
//               hasError={!!errors.nonMemberPrice}
//               errorMessage={errors.nonMemberPrice}
//               placeholder="Enter non-member price"
//               type="number"
//               min="0"
//               step="0.01"
//             />
//           </div>
//         </>
//       )}

//       {/* Effective From Field */}
//       <div className="mb-3">
//         <label className="form-label fw-semibold">Effective From</label>
//         <MyDatePicker
//           name="effectiveFrom"
//           value={formData.effectiveFrom}
//           onChange={(date) => handleInputChange("effectiveFrom", date)}
//           hasError={!!errors.effectiveFrom}
//           errorMessage={errors.effectiveFrom}
//           placeholder="Select effective from date"
//         />
//       </div>

//       {/* Effective To Field */}
//       <div className="mb-3">
//         <label className="form-label fw-semibold">Effective To</label>
//         <MyDatePicker
//           name="effectiveTo"
//           value={formData.effectiveTo}
//           onChange={(date) => handleInputChange("effectiveTo", date)}
//           placeholder="Select effective to date (optional)"
//         />
//       </div>

//       {/* Status Field */}
//       <div className="mb-3">
//         <label className="form-label fw-semibold">Status</label>
//         <div className="switch-container">
//           <Switch
//             checked={formData.status === "Active"} // ✅ true if Active
//             onChange={(checked) =>
//               handleInputChange("status", checked ? "Active" : "Inactive")
//             }
//             checkedChildren="Active"
//             unCheckedChildren="Inactive"
//           />
//           {/* <span className="switch-label">
//             {formData.isActive ? "Active" : "Inactive"}
//           </span> */}
//         </div>
//       </div>

//       {/* Price History Section */}
//       {productType && (
//         <>
//           <Divider orientation="left" style={{ marginTop: "30px" }}>
//             <HistoryOutlined style={{ marginRight: "8px" }} />
//             Price History
//           </Divider>

//           <div style={{ marginBottom: "20px" }}>
//             <Table
//               columns={getPriceHistoryColumns()}
//               dataSource={pricingHistory || []}
//               loading={historyLoading}
//               rowKey="id"
//               pagination={{
//                 pageSize: 5,
//                 showSizeChanger: true,
//                 showQuickJumper: true,
//                 showTotal: (total, range) =>
//                   `${range[0]}-${range[1]} of ${total} pricing records`,
//               }}
//               size="small"
//               bordered
//               className="drawer-tbl"
//               rowClassName={(record, index) =>
//                 index % 2 !== 0 ? "odd-row" : "even-row"
//               }
//             />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default PricingForm;

import React, { useEffect, useState } from "react";
import { Drawer, Button, Space, Divider, Table, Switch } from "antd";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";
import { insertDataFtn, updateFtn } from "../../../utils/Utilities";
import { convertSandToEuro } from "../../../utils/Utilities";
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

  useEffect(() => {
    if (product?.currentPricing) {
      const formatToTwoDecimals = (value) => {
        if (value === null || value === undefined || value === "") return "";
        const num = Number(value);
        return isNaN(num) ? "" : num.toFixed(2);
      };

      setFormData({
        currency: product.currentPricing.currency || "",
        memberPrice: "€"+(product.currentPricing.memberPrice !== null && product.currentPricing.memberPrice !== undefined && product.currentPricing.memberPrice !== "")
          ? formatToTwoDecimals(convertSandToEuro(Number(product.currentPricing.memberPrice)))
          : "",
        nonMemberPrice: "€"+(product.currentPricing.nonMemberPrice !== null && product.currentPricing.nonMemberPrice !== undefined && product.currentPricing.nonMemberPrice !== "")
          ? formatToTwoDecimals(convertSandToEuro(Number(product.currentPricing.nonMemberPrice)))
          : "",
        effectiveFrom: product.currentPricing.effectiveFrom || null,
        effectiveTo: product.currentPricing.effectiveTo || null,
        status: product.currentPricing.status || "Active",
        productId: product._id,
        price: "€"+(product.currentPricing.price !== null && product.currentPricing.price !== undefined && product.currentPricing.price !== "")
          ? formatToTwoDecimals(convertSandToEuro(Number(product.currentPricing.price)))
          : "",
      });
    }
  }, [product]);
  debugger
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // onSubmit?.(formData);
    // const data = {
    //   // productId: product._id,
    //   currency: formData.currency,
    //   memberPrice: formData.memberPrice,
    //   nonMemberPrice: formData.nonMemberPrice,
    //   effectiveFrom: formData.effectiveFrom,
    //   effectiveTo: formData.effectiveTo,
    //   status: formData.status,
    // }

    // updateFtn(process.env.REACT_APP_POLICY_SERVICE_URL, `/api/pricing${formData?._id}`, data, 
    //   () => {
    //   onClose();
    //   setFormData({
    //     currency: "",
    //     memberPrice: "",
    //     nonMemberPrice: "",
    //     effectiveFrom: null,
    //     effectiveTo: null,
    //     status: "Active",
    //   })
    // }),
    // "Updated Successfully", 
  }

  // History table
  const historyColumns = [
    { title: "Currency", dataIndex: "currency", key: "currency" },
    { title: "Member Price", dataIndex: "memberPrice", key: "memberPrice" },
    { title: "Non-Member Price", dataIndex: "nonMemberPrice", key: "nonMemberPrice" },
    { title: "Effective From", dataIndex: "effectiveFrom", key: "effectiveFrom" },
    { title: "Effective To", dataIndex: "effectiveTo", key: "effectiveTo" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];

  // Dummy history data — replace with API / product.pricingHistory
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

