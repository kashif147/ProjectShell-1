

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Drawer,
  Button,
  Space,
  Divider,
  Table,
  Switch,
  Tag,
  Tooltip,
  Modal,
  Alert,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MyInput from "../../../component/common/MyInput";
import CustomSelect from "../../../component/common/CustomSelect";
import MyDatePicker from "../../../component/common/MyDatePicker";
import {
  convertEuroToSand,
  insertDataFtn,
  updateFtn,
  deleteFtn,
} from "../../../utils/Utilities";
import { convertSandToEuro } from "../../../utils/Utilities";
import MyAlert from "../../../component/common/MyAlert";
import dayjs from "dayjs";

function collectPricingRows(product) {
  const rows = Array.isArray(product?.pricingHistory)
    ? [...product.pricingHistory]
    : [];
  const cur = product?.currentPricing;
  if (cur) {
    const cid = cur._id ?? cur.id;
    if (!rows.some((r) => (r._id ?? r.id) === cid)) rows.push(cur);
  }
  return rows;
}

/** Latest effectiveTo + 1 day; effectiveTo = 31 Dec of that from-year. No ended periods → current calendar year. */
function getDefaultPricingDateRange(product) {
  const rows = collectPricingRows(product);
  const ends = rows
    .map((r) => r.effectiveTo)
    .filter(Boolean)
    .map((d) => dayjs(d));

  const nowY = dayjs().year();
  if (ends.length === 0) {
    const start = dayjs().year(nowY).startOf("year").startOf("day");
    return {
      effectiveFrom: start,
      effectiveTo: start.clone().endOf("year").endOf("day"),
    };
  }

  const latestEnd = ends.reduce((a, b) => (a.isAfter(b) ? a : b));
  const effectiveFrom = latestEnd.add(1, "day").startOf("day");
  const effectiveTo = effectiveFrom.clone().endOf("year").endOf("day");

  return { effectiveFrom, effectiveTo };
}

/** Matches user-service: ended strictly before today (open-ended / no effectiveTo = current). */
function isPricingPeriodFullyEnded(record) {
  if (!record?.effectiveTo) return false;
  return dayjs(record.effectiveTo).endOf("day").isBefore(dayjs().startOf("day"));
}

const PricingDrawer = ({ open, onClose, product, productType, onSubmit }) => {
  const productRef = useRef(product);
  productRef.current = product;

  const [formData, setFormData] = useState({
    currency: "EUR",
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
  const [editingPastOnly, setEditingPastOnly] = useState(false);
  const [hasCloned, setHasCloned] = useState(false);

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
        currency: "EUR",
        memberPrice: "",
        nonMemberPrice: "",
        effectiveFrom: null,
        effectiveTo: null,
        status: "Active",
        price: "",
      });
      setIsEditMode(false);
      setEditingPricingId(null);
      setEditingPastOnly(false);
      setHasCloned(false);
    }
  }, [open]);

  // New price defaults when drawer opens (EUR + dates); ref avoids overwriting edits if product ref refreshes while open
  useEffect(() => {
    if (!open) return;
    const p = productRef.current;
    if (!p?._id) return;
    const { effectiveFrom, effectiveTo } = getDefaultPricingDateRange(p);
    setFormData({
      currency: "EUR",
      memberPrice: "",
      nonMemberPrice: "",
      effectiveFrom,
      effectiveTo,
      status: "Active",
      price: "",
    });
    setHasCloned(false);
    setIsEditMode(false);
    setEditingPricingId(null);
    setEditingPastOnly(false);
  }, [open]);
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle cloning logic for the top button
  const handleCloneLastActive = () => {
    // 1. Find Current Active Pricing
    const currentActive = product?.currentPricing;

    if (!currentActive) {
      MyAlert("warning", "No active pricing found to clone!");
      return;
    }

    const { effectiveFrom: newEffectiveFrom, effectiveTo: newEffectiveTo } =
      getDefaultPricingDateRange(product);

    // 3. Populate Form
    setFormData({
      currency: (currentActive.currency || "EUR").toUpperCase(),
      memberPrice: currentActive.memberPrice ? formatToTwoDecimals(convertSandToEuro(currentActive.memberPrice)) : "",
      nonMemberPrice: currentActive.nonMemberPrice ? formatToTwoDecimals(convertSandToEuro(currentActive.nonMemberPrice)) : "",
      effectiveFrom: newEffectiveFrom,
      effectiveTo: newEffectiveTo,
      status: "Active",
      price: currentActive.price ? formatToTwoDecimals(convertSandToEuro(currentActive.price)) : "",
    });

    // 4. Update State to show "Create" button
    setHasCloned(true);
    setIsEditMode(false);
    setEditingPricingId(null);
    setEditingPastOnly(false);
  };

  // Handle canceling edit mode
  const handleCancel = () => {
    setIsEditMode(false);
    setEditingPricingId(null);
    setEditingPastOnly(false);
    const { effectiveFrom, effectiveTo } = product?._id
      ? getDefaultPricingDateRange(product)
      : { effectiveFrom: null, effectiveTo: null };
    setFormData({
      currency: "EUR",
      memberPrice: "",
      nonMemberPrice: "",
      effectiveFrom,
      effectiveTo,
      status: "Active",
      price: "",
    });
  };

  const beginEditPricing = (record) => {
    const id = record._id || record.id;
    if (!id) return;
    setIsEditMode(true);
    setEditingPricingId(id);
    setEditingPastOnly(isPricingPeriodFullyEnded(record));
    setHasCloned(false);
    setFormData({
      currency: (record.currency || "EUR").toUpperCase(),
      memberPrice:
        record.memberPrice != null
          ? formatToTwoDecimals(convertSandToEuro(record.memberPrice))
          : "",
      nonMemberPrice:
        record.nonMemberPrice != null
          ? formatToTwoDecimals(convertSandToEuro(record.nonMemberPrice))
          : "",
      effectiveFrom: record.effectiveFrom ? dayjs(record.effectiveFrom) : null,
      effectiveTo: record.effectiveTo ? dayjs(record.effectiveTo) : null,
      status: record.status === "Inactive" ? "Inactive" : "Active",
      price:
        record.price != null
          ? formatToTwoDecimals(convertSandToEuro(record.price))
          : "",
    });
  };

  const confirmDeletePricingRecord = (record) => {
    const id = record._id || record.id;
    if (!id || isPricingPeriodFullyEnded(record)) return;
    Modal.confirm({
      title: "Delete this pricing period?",
      content:
        "Current or future periods can be deleted. Past periods must be deactivated (set status to Inactive) instead.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () =>
        deleteFtn(
          `${process.env.REACT_APP_POLICY_SERVICE_URL}/pricing/${id}`,
          async () => {
            if (onSubmit) await onSubmit();
            if (editingPricingId === id) handleCancel();
          }
        ),
    });
  };

  const handleDeleteEditing = () => {
    if (editingPastOnly || !editingPricingId) return;
    Modal.confirm({
      title: "Delete this pricing period?",
      content:
        "Current or future periods can be deleted. Past periods must be deactivated instead.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () =>
        deleteFtn(
          `${process.env.REACT_APP_POLICY_SERVICE_URL}/pricing/${editingPricingId}`,
          async () => {
            if (onSubmit) await onSubmit();
            handleCancel();
            onClose();
          }
        ),
    });
  };

  const pricingTableRows = useMemo(() => {
    const rows = collectPricingRows(product);
    return [...rows].sort(
      (a, b) =>
        dayjs(b.effectiveFrom || 0).valueOf() -
        dayjs(a.effectiveFrom || 0).valueOf()
    );
  }, [product]);

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

      let requestData;

      if (isEditMode && editingPastOnly) {
        requestData = { status: formData.status };
      } else {
        requestData = {
          currency: formData.currency,
          effectiveFrom: formData.effectiveFrom,
          effectiveTo: formData.effectiveTo,
          status: formData.status,
        };
        if (productType?.name === "Membership") {
          requestData.price = convertEuroToSand(formData.price);
        } else {
          requestData.memberPrice = convertEuroToSand(formData.memberPrice);
          requestData.nonMemberPrice = convertEuroToSand(formData.nonMemberPrice);
        }
      }

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
      // ... (Price columns logic is same as before, see next block)
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
        title: "Actions",
        key: "actions",
        fixed: "right",
        render: (_, record) => {
          const past = isPricingPeriodFullyEnded(record);
          return (
            <Space size="small">
              <Tooltip title={past ? "Deactivate / reactivate (status only)" : "Edit"}>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => beginEditPricing(record)}
                />
              </Tooltip>
              {!past && (
                <Tooltip title="Delete period">
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => confirmDeletePricingRecord(record)}
                  />
                </Tooltip>
              )}
            </Space>
          );
        },
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
          {isEditMode ? (
            <>
              {!editingPastOnly && (
                <Button danger className="butn" onClick={handleDeleteEditing}>
                  Delete
                </Button>
              )}
              <Button className="butn" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                className="butn primary-btn"
                onClick={handleSave}
                loading={loading}
              >
                Update
              </Button>
            </>
          ) : product?.currentPricing && !hasCloned ? (
            <Button
              type="primary"
              className="butn primary-btn"
              onClick={handleCloneLastActive}
            >
              Clone Last Active
            </Button>
          ) : (
            <Button
              type="primary"
              className="butn primary-btn"
              onClick={handleSave}
              loading={loading}
            >
              Create
            </Button>
          )}
        </Space>
      }
    >
      <div className="drawer-main-container">

        {isEditMode && editingPastOnly && (
          <Alert
            type="info"
            showIcon
            className="mb-3"
            message="This pricing period has ended. Set status to Inactive to deactivate it (amounts and dates cannot be changed)."
          />
        )}

        <div className="mb-3">
          <label className="form-label fw-semibold">Currency</label>
          <CustomSelect
            disabled={isEditMode && editingPastOnly}
            value={formData.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            options={[
              { label: "EUR", value: "EUR" },
              { label: "USD", value: "USD" },
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
                disabled={isEditMode && editingPastOnly}
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
                  disabled={isEditMode && editingPastOnly}
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
                  disabled={isEditMode && editingPastOnly}
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
            disabled={isEditMode && editingPastOnly}
            value={formData.effectiveFrom}
            onChange={(date) => handleChange("effectiveFrom", date)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Effective To</label>
          <MyDatePicker
            name="effectiveTo"
            disabled={isEditMode && editingPastOnly}
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
            dataSource={pricingTableRows}
            rowKey={(r) => r._id || r.id}
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

