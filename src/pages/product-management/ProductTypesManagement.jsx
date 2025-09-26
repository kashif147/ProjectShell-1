import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Space,
  message,
  Table,
  Tag,
  Tooltip,
  Modal,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,
  EyeOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import MyDrawer from "../../component/common/MyDrawer";
import ProductForm from "./components/ProductForm";
import PricingForm from "./components/PricingForm";
import {
  getAllProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  createPricing,
  updatePricing,
  getPricingHistory,
} from "../../features/ProductTypesSlice";
import "../../styles/ProductManagement.css";
import "../../styles/Configuration.css";

const ProductTypesManagement = () => {
  const dispatch = useDispatch();
  const { productTypes, loading, error } = useSelector(
    (state) => state.productTypes
  );

  const [isProductTypeDrawerOpen, setIsProductTypeDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isPricingDrawerOpen, setIsPricingDrawerOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPricing, setEditingPricing] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [pricingFormMethods, setPricingFormMethods] = useState(null);

  useEffect(() => {
    dispatch(getAllProductTypes());
  }, [dispatch]);

  const handleCreateProductType = () => {
    setEditingProductType(null);
    setIsProductTypeDrawerOpen(true);
  };

  const handleEditProductType = (productType) => {
    setEditingProductType(productType);
    setIsProductTypeDrawerOpen(true);
  };

  const handleCreateProduct = (productType) => {
    setSelectedProductType(productType);
    setEditingProduct(null);
    setIsProductDrawerOpen(true);
  };

  const handleEditProduct = (product, productType) => {
    setSelectedProductType(productType);
    setEditingProduct(product);
    setIsProductDrawerOpen(true);
  };

  const handleCreatePricing = (product, productType) => {
    setSelectedProductType(productType);
    setEditingProduct(product);
    setEditingPricing(null);
    setIsPricingDrawerOpen(true);
  };

  const handleEditPricing = (pricing, productType) => {
    setSelectedProductType(productType);
    setEditingPricing(pricing);
    setIsPricingDrawerOpen(true);
  };

  const handleDeleteProductType = (productTypeId) => {
    Modal.confirm({
      title: "Delete Product Type",
      content:
        "Are you sure you want to delete this product type? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        dispatch(deleteProductType(productTypeId));
        message.success({
          content: "Product type deleted successfully",
          style: {
            marginTop: "20vh",
            textAlign: "center",
          },
        });
      },
    });
  };

  const productTypeColumns = [
    {
      title: "Product Type",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-weight-bold">{text}</div>
          <div className="text-muted small">{record.description}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Products Count",
      dataIndex: "products",
      key: "productsCount",
      render: (products) => products?.length || 0,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date, record) => (
        <div>
          <div className="font-weight-bold">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
          <div className="text-muted small">
            {date ? new Date(date).toLocaleTimeString() : ""}
          </div>
          <div className="text-muted small">
            by {record.createdBy || "Unknown"}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date, record) => (
        <div>
          <div className="font-weight-bold">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
          <div className="text-muted small">
            {date ? new Date(date).toLocaleTimeString() : ""}
          </div>
          <div className="text-muted small">
            by {record.updatedBy || "Unknown"}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Add Product">
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleCreateProduct(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Product Type">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProductType(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Product Type">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProductType(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const getProductColumns = (productType) => {
    const baseColumns = [
      {
        title: "Product Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <div>
            <div className="font-weight-bold">{text}</div>
            <div className="text-muted small">{record.description}</div>
          </div>
        ),
      },
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
      },
      {
        title: "Status",
        dataIndex: "isActive",
        key: "isActive",
        render: (isActive) => (
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Active" : "Inactive"}
          </Tag>
        ),
      },
    ];

    // Add price columns based on product type
    if (productType?.category === "MEMBERSHIP") {
      baseColumns.push({
        title: "Price",
        dataIndex: "memberPrice",
        key: "memberPrice",
        render: (price, record) => {
          const currency = record.currency || "EUR";
          const symbol =
            currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
          return price ? `${symbol}${price}` : "-";
        },
      });
    } else {
      baseColumns.push(
        {
          title: "Member Price",
          dataIndex: "memberPrice",
          key: "memberPrice",
          render: (price, record) => {
            const currency = record.currency || "EUR";
            const symbol =
              currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
            return price ? `${symbol}${price}` : "-";
          },
        },
        {
          title: "Non-Member Price",
          dataIndex: "nonMemberPrice",
          key: "nonMemberPrice",
          render: (price, record) => {
            const currency = record.currency || "EUR";
            const symbol =
              currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
            return price ? `${symbol}${price}` : "-";
          },
        }
      );
    }

    // Add remaining columns
    baseColumns.push({
      title: "Actions",
      key: "actions",
      render: (_, record, index, productType) => (
        <Space>
          <Tooltip title="Manage Pricing">
            <Button
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleCreatePricing(record, productType)}
            />
          </Tooltip>
          <Tooltip title="Edit Product">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record, productType)}
            />
          </Tooltip>
        </Space>
      ),
    });

    return baseColumns;
  };

  const renderProductTypesTable = () => (
    <Card title="Product Types" className="theme-card">
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateProductType}
        >
          Add Product Type
        </Button>
      </div>
      <div className="main-table-scroll-container">
        <Table
          columns={productTypeColumns}
          dataSource={productTypes}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          expandable={{
            expandedRowRender: (record) => (
              <div className="expanded-content-container">
                <Divider orientation="left">Products in {record.name}</Divider>
                <div className="table-scroll-container">
                  <Table
                    columns={getProductColumns(record).map((col) => ({
                      ...col,
                      title: col.title,
                      render:
                        col.title === "Actions"
                          ? (text, productRecord) =>
                              col.render(text, productRecord, null, record)
                          : col.render,
                    }))}
                    dataSource={record.products || []}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                </div>
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => handleCreateProduct(record)}
                  >
                    Add Product to {record.name}
                  </Button>
                </div>
              </div>
            ),
            rowExpandable: (record) => (record.products?.length || 0) > 0,
          }}
        />
      </div>
    </Card>
  );

  return (
    <div className="product-management-container">
      <div className="page-header">
        <h2>Product Management</h2>
        <p>Manage product types, products, and pricing for your organization</p>
      </div>

      {renderProductTypesTable()}

      {/* Product Type Form Drawer */}
      <MyDrawer
        title={
          editingProductType ? "Edit Product Type" : "Add New Product Type"
        }
        open={isProductTypeDrawerOpen}
        onClose={() => setIsProductTypeDrawerOpen(false)}
        width={800}
        extra={
          <Space>
            <Button onClick={() => setIsProductTypeDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                // This will be handled by the form's submit
                const form = document.querySelector(".product-form");
                if (form) {
                  const submitEvent = new Event("submit", {
                    bubbles: true,
                    cancelable: true,
                  });
                  form.dispatchEvent(submitEvent);
                }
              }}
            >
              {editingProductType
                ? "Update Product Type"
                : "Create Product Type"}
            </Button>
          </Space>
        }
      >
        <div className="drawer-main-container">
          <ProductForm
            product={editingProductType}
            onClose={() => setIsProductTypeDrawerOpen(false)}
            onSubmit={(data) => {
              if (editingProductType) {
                dispatch(updateProductType(data));
                message.success("Product type updated successfully");
              } else {
                dispatch(createProductType(data));
                message.success("Product type created successfully");
              }
              setIsProductTypeDrawerOpen(false);
            }}
          />
        </div>
      </MyDrawer>

      {/* Product Form Drawer */}
      <MyDrawer
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isProductDrawerOpen}
        onClose={() => setIsProductDrawerOpen(false)}
        width={800}
        extra={
          <Space>
            <Button onClick={() => setIsProductDrawerOpen(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                // This will be handled by the form's submit
                const form = document.querySelector(".product-form");
                if (form) {
                  const submitEvent = new Event("submit", {
                    bubbles: true,
                    cancelable: true,
                  });
                  form.dispatchEvent(submitEvent);
                }
              }}
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </Space>
        }
      >
        <div className="drawer-main-container">
          <ProductForm
            product={editingProduct}
            productType={selectedProductType}
            onClose={() => setIsProductDrawerOpen(false)}
            onSubmit={(data) => {
              if (editingProduct) {
                // Update product logic here
                message.success("Product updated successfully");
              } else {
                // Create product logic here
                message.success("Product created successfully");
              }
              setIsProductDrawerOpen(false);
            }}
          />
        </div>
      </MyDrawer>

      {/* Pricing Form Drawer */}
      <MyDrawer
        title={editingPricing ? "Edit Pricing" : "Add New Pricing"}
        open={isPricingDrawerOpen}
        onClose={() => setIsPricingDrawerOpen(false)}
        width={900}
        extra={
          <Space>
            <Button
              onClick={() => setIsPricingDrawerOpen(false)}
              disabled={pricingFormMethods?.loading}
              icon={<CloseOutlined />}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => pricingFormMethods?.handleSubmit()}
              loading={pricingFormMethods?.loading}
              icon={<SaveOutlined />}
            >
              {editingPricing ? "Update Pricing" : "Create Pricing"}
            </Button>
          </Space>
        }
      >
        <div className="drawer-main-container">
          <PricingForm
            productType={selectedProductType}
            product={editingProduct}
            pricing={editingPricing}
            onClose={() => setIsPricingDrawerOpen(false)}
            onSubmit={(data) => {
              // Handle pricing submission
              message.success("Pricing updated successfully");
              setIsPricingDrawerOpen(false);
            }}
            onRef={setPricingFormMethods}
          />
        </div>
      </MyDrawer>
    </div>
  );
};

export default ProductTypesManagement;
