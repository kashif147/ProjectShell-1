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
import MyAlert from "../../component/common/MyAlert";

import axios from "axios";
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
import { getAllProducts } from "../../features/ProductsSlice";
import { getProductTypesWithProducts } from "../../features/ProducttypeWithProducts";
import "../../styles/ProductManagement.css";
import "../../styles/Configuration.css";
import { deleteFtn, insertDataFtn, updateFtn } from "../../utils/Utilities";

const ProductTypesManagement = () => {
  const dispatch = useDispatch();
  const { productTypes } = useSelector(
    (state) => state.productTypes
  );
  const { allProducts, } = useSelector(
    (state) => state.products
  );
  const { data, loading, error } = useSelector(
    (state) => state.productTypesWithProducts
  );
  console.log(data, "product")
  const [isProductTypeDrawerOpen, setIsProductTypeDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isPricingDrawerOpen, setIsPricingDrawerOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPricing, setEditingPricing] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [pricingFormMethods, setPricingFormMethods] = useState(null);

  useEffect(() => {
    dispatch(getProductTypesWithProducts());
  }, [dispatch]);

  const handleCreateProductType = () => {
    setEditingProductType(null);
    setIsProductTypeDrawerOpen(true);
  };

  const handleEditProductType = (productType) => {
    debugger
    setEditingProductType(productType);
    setIsProductTypeDrawerOpen(true);
  };

  const handleCreateProduct = (productType) => {
    setSelectedProductType(productType);
    setEditingProduct(null);
    setIsProductDrawerOpen(true);
  };

  const handleEditProduct = (product, productType) => {
    debugger
    setSelectedProductType(productType);
    setEditingProduct(product);
    setIsProductDrawerOpen(true);
  };

  const handleCreatePricing = (product, productType) => {
    debugger
    setSelectedProductType(productType);
    setEditingProduct(product);
    setEditingPricing(product?.currentPricing);
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
        deleteFtn(`${process.env.REACT_APP_POLICY_SERVICE_URL}/api/product-types/${productTypeId}`,
          () => {
            dispatch(getProductTypesWithProducts());
          })
        // dispatch(deleteProductType(productTypeId));
        // message.success({
        //   content: "Product type deleted successfully",
        //   style: {
        //     marginTop: "20vh",
        //     textAlign: "center",
        //   },
        // });
      },
    });
  };


  const handleDeleteBoth = async (productTypeId) => {
    try {
      const token = localStorage.getItem("token");

      // custom delete function (no default notifications)
      const deleteRequest = (url) =>
        axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

      // delete pricing first
      if (productTypeId?.currentPricing?.id) {
        await deleteRequest(
          `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/pricing/${productTypeId.currentPricing.id}`
        );
      }

      // then delete product
      await deleteRequest(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/products/${productTypeId?._id}`
      );

      // refresh after both are done
      dispatch(getProductTypesWithProducts());

      // ✅ show success
      MyAlert("success", "Deleted", "Product and pricing deleted successfully!");
    } catch (err) {
      MyAlert("error", "Error", "Failed to delete product or pricing.");
    }
  };



  const handleDeleteProduct = (productTypeId) => {
    Modal.confirm({
      title: "Delete Product Type",
      content:
        "Are you sure you want to delete this product type? This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () =>
        // dispatch(deleteProductType(productTypeId));
        // message.success({
        //   content: "Product type deleted successfully",
        //   style: {
        //     marginTop: "20vh",
        //     textAlign: "center",
        //   },
        // });
        handleDeleteBoth(productTypeId, dispatch)
    });
  };

  const productTypeColumns = [
    {
      title: "Product Type123",
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
            {/* by {record.createdBy || "Unknown"} */}
            by {"Unknown"}
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
            {/* by {record.updatedBy || "Unknown"} */}
            by {"Unknown"}
          </div>
        </div>
      ),
      sorter: (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
    },
    {
      title: "Actions1",
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
              onClick={() => handleDeleteProductType(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  const createProductWithPricing = async (data, selectedProductType) => {
    debugger
    try {
      const token = localStorage.getItem("token");
      // 1️⃣ Create Product
      const productRes = await axios.post(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/products`,
        {
          name: data?.name,
          code: data?.code,
          description: data?.description,
          productTypeId: selectedProductType?._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const prodid = productRes.data?.data?._id;
      debugger
      if (!prodid) throw new Error("Product ID missing from response");

      // 2️⃣ Create Pricing
      await axios.post(
        `${process.env.REACT_APP_POLICY_SERVICE_URL}/api/pricing`,
        {
          effectiveFrom: data?.effectiveFrom,
          effectiveTo: data?.effectiveTo,
          status: data?.status,
          currency: data?.currency,
          productId: prodid,
          price: data?.memberPrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ Single success notification
      MyAlert("success", "Product and Pricing created successfully ✅");
      dispatch(getProductTypesWithProducts())
      return true;
    } catch (error) {
      console.error("❌ Error creating product/pricing:", error);
      // ❌ Single error notification
      MyAlert(
        "error",
        error?.response?.data?.message || "Failed to create product or pricing"
      );
      return false;
    }
  };

  const getProductColumns = (productType) => {
    const baseColumns = [
      {
        title: "Product Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => (
          <div>
            <div className="font-weight-bold">{text}</div>
            <div className="text-muted small">{record?.description}</div>
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
          const currency = record.currentPricing?.currentPricing || "EUR";
          const symbol =
            currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
          return price ? `${symbol}${price}` : "-";
        },
      });
    } else {
      baseColumns.push(
        {
          title: "Member Price1",
          dataIndex: "memberPrice",
          key: "memberPrice",
          render: (price, record) => {
            debugger
            const currency = record.currentPricing?.memberPrice || "EUR";
            const symbol =
              currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
            return currency ? `${symbol}${currency}` : "-";
          },
        },
        {
          title: "Non-Member Price",
          dataIndex: "nonMemberPrice",
          key: "nonMemberPrice",
          render: (price, record) => {
            const currency = record.currentPricing?.nonMemberPrice || "EUR";
            const symbol =
              currency === "EUR" ? "€" : currency === "USD" ? "$" : "£";
            return currency ? `${symbol}${currency}` : "-";
          },
        }
      );
    }

    // Add remaining columns
    baseColumns.push({
      title: "Actions2",
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
          <Tooltip title="Edit Product1">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProduct(record, productType)}
            />
          </Tooltip>
          <Tooltip title="Delete Product">
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProduct(record)}
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
          className=""
          columns={productTypeColumns}
          dataSource={data || []}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ y: 400 }} // ✅ horizontal scroll
          expandable={{
            expandedRowRender: (record) => (
              <div className="expanded-content-container">
                Products in {record.name}
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
                  dataSource={record?.products || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: "max-content" }}   // ✅ scroll for inner table too
                />
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
            rowExpandable: () => true,
          }}
        />


        {/* <Table columns={productTypeColumns}
         dataSource={productTypes || []} */}
        {/* /> */}
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
                : "Create Product Type1"}
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

                updateFtn(process.env.REACT_APP_POLICY_SERVICE_URL, `/api/product-types/${editingProductType?._id}`,
                  data,
                  () => {
                    dispatch(getProductTypesWithProducts());
                  })
              } else {
                // dispatch(createProductType(data));

                insertDataFtn(process.env.REACT_APP_POLICY_SERVICE_URL, '/api/product-types',
                  data,
                  "Product Type Created Successfully",
                  "Product Type Creation Failed",
                  () => {
                    dispatch(getProductTypesWithProducts());
                  })
              }
              setIsProductTypeDrawerOpen(false);
            }}
          />
        </div>
      </MyDrawer>

      {/* Product Form Drawer */}
      <MyDrawer
        title={editingProduct ? "Edit Product11" : "Add New Product2"}
        open={isProductDrawerOpen}
        onClose={() => {
          setIsProductDrawerOpen(false)
          setEditingProduct(null)
        }
        }
        width={800}
        extra={
          <Space>
            {/* <Button onClick={() => setIsProductDrawerOpen(false)}>
              Cancel
            </Button> */}
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
              {editingProduct ? "Update Product123" : "Create Product"}
            </Button>
          </Space>
        }
      >
        <div className="drawer-main-container">
          <ProductForm
            product={editingProduct}
            productType={selectedProductType}
            onClose={() => setIsProductDrawerOpen(false)}
            onSubmit={
              async (data) => {
                debugger
                if (editingProduct) {
                  const updatedData = {
                    name: data?.name,
                    code: data?.code,
                    description: data?.description,
                    status: data?.status
                  }
                  updateFtn(process.env.REACT_APP_POLICY_SERVICE_URL, `/api/products/${editingProduct?._id}`, updatedData, () => {
                    dispatch(getProductTypesWithProducts())
                  })

                } else { await createProductWithPricing(data, selectedProductType); }
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
