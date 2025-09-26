import React, { useState, useEffect } from "react";
import { Card, Button, Space, Row, Col, message, Tag, Divider } from "antd";
import {
  PlusOutlined,
  DollarOutlined,
  CalendarOutlined,
  TeamOutlined,
  BookOutlined,
  InsuranceOutlined,
} from "@ant-design/icons";
import ProductTypesManagement from "./ProductTypesManagement";
import "../../styles/ProductManagement.css";

const ProductManagementDemo = () => {
  const [showFullInterface, setShowFullInterface] = useState(false);

  const sampleProductTypes = [
    {
      id: 1,
      name: "Membership",
      code: "MEM",
      description: "Annual membership products for nurses and midwives",
      category: "MEMBERSHIP",
      isActive: true,
      products: [
        {
          id: 1,
          name: "General (all grades)",
          code: "MEM-GEN",
          description: "Standard membership for all nursing grades",
          currentPrice: 299,
          effectiveFrom: "2025-01-01",
          isActive: true,
        },
        {
          id: 2,
          name: "Postgraduate Student",
          code: "MEM-PG",
          description: "Membership for postgraduate students",
          currentPrice: 299,
          effectiveFrom: "2025-01-01",
          isActive: true,
        },
        {
          id: 3,
          name: "Undergraduate Student",
          code: "MEM-UG",
          description: "Free membership for undergraduate students",
          currentPrice: 0,
          effectiveFrom: "2025-01-01",
          isActive: true,
        },
      ],
    },
    {
      id: 2,
      name: "Events",
      code: "EVT",
      description: "Professional development events and conferences",
      category: "EVENTS",
      isActive: true,
      products: [],
    },
    {
      id: 3,
      name: "Courses",
      code: "CRS",
      description: "Training courses and educational programs",
      category: "COURSES",
      isActive: true,
      products: [],
    },
    {
      id: 4,
      name: "Insurance",
      code: "INS",
      description:
        "Financial protection products including PHI, Life Assurance, and Critical Illness",
      category: "INSURANCE",
      isActive: false,
      products: [],
    },
  ];

  const getCategoryIcon = (category) => {
    const icons = {
      MEMBERSHIP: <TeamOutlined />,
      EVENTS: <CalendarOutlined />,
      COURSES: <BookOutlined />,
      INSURANCE: <InsuranceOutlined />,
      FINANCIAL: <DollarOutlined />,
    };
    return icons[category] || <DollarOutlined />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      MEMBERSHIP: "blue",
      EVENTS: "green",
      COURSES: "orange",
      INSURANCE: "purple",
      FINANCIAL: "red",
    };
    return colors[category] || "default";
  };

  const renderOverview = () => (
    <div className="product-demo-overview">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card className="theme-card">
            <div className="theme-card-header">
              <h3 className="theme-card-title">Product Types Overview</h3>
              <p className="theme-card-subtitle">
                Manage different types of products including memberships,
                events, courses, and insurance products
              </p>
            </div>
            <div className="theme-card-body">
              <Row gutter={[16, 16]}>
                {sampleProductTypes.map((productType) => (
                  <Col xs={24} sm={12} lg={6} key={productType.id}>
                    <Card className="product-type-card">
                      <div className="product-type-header">
                        <div className="product-type-title">
                          {getCategoryIcon(productType.category)}{" "}
                          {productType.name}
                        </div>
                        <div className="product-type-subtitle">
                          {productType.description}
                        </div>
                      </div>
                      <div className="product-type-body">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Tag color={getCategoryColor(productType.category)}>
                            {productType.category}
                          </Tag>
                          <Tag color={productType.isActive ? "green" : "red"}>
                            {productType.isActive ? "Active" : "Inactive"}
                          </Tag>
                        </div>
                        <div className="text-muted small mb-3">
                          {productType.products.length} products configured
                        </div>
                        <Space>
                          <Button size="small" icon={<PlusOutlined />}>
                            Add Product
                          </Button>
                          <Button size="small" icon={<DollarOutlined />}>
                            Pricing
                          </Button>
                        </Space>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-4">
        <Col span={24}>
          <Card className="theme-card">
            <div className="theme-card-header">
              <h3 className="theme-card-title">2025 Membership Pricing</h3>
              <p className="theme-card-subtitle">
                Current pricing structure for membership products
              </p>
            </div>
            <div className="theme-card-body">
              <Row gutter={[16, 16]}>
                {sampleProductTypes[0].products.map((product) => (
                  <Col xs={24} sm={12} lg={8} key={product.id}>
                    <div className="pricing-summary-card">
                      <div className="pricing-summary-value">
                        €{product.currentPrice}
                      </div>
                      <div className="pricing-summary-label">
                        {product.name}
                      </div>
                      <div className="text-muted small mt-2">
                        {product.description}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="mt-4">
        <Col span={24}>
          <Card className="theme-card">
            <div className="theme-card-header">
              <h3 className="theme-card-title">Key Features</h3>
              <p className="theme-card-subtitle">
                What you can do with the Product Management System
              </p>
            </div>
            <div className="theme-card-body">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <div className="feature-card text-center">
                    <div className="feature-icon mb-3">
                      <TeamOutlined
                        style={{
                          fontSize: "2rem",
                          color: "var(--primary-blue)",
                        }}
                      />
                    </div>
                    <h5>Product Types</h5>
                    <p className="text-muted small">
                      Define different categories like Membership, Events,
                      Courses, and Insurance
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="feature-card text-center">
                    <div className="feature-icon mb-3">
                      <DollarOutlined
                        style={{
                          fontSize: "2rem",
                          color: "var(--success-color)",
                        }}
                      />
                    </div>
                    <h5>Dynamic Pricing</h5>
                    <p className="text-muted small">
                      Set different prices for members vs non-members with
                      effective date ranges
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="feature-card text-center">
                    <div className="feature-icon mb-3">
                      <CalendarOutlined
                        style={{
                          fontSize: "2rem",
                          color: "var(--warning-color)",
                        }}
                      />
                    </div>
                    <h5>Time-based Pricing</h5>
                    <p className="text-muted small">
                      Manage pricing changes over time with effective from/to
                      dates
                    </p>
                  </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <div className="feature-card text-center">
                    <div className="feature-icon mb-3">
                      <BookOutlined
                        style={{ fontSize: "2rem", color: "var(--info-color)" }}
                      />
                    </div>
                    <h5>Product Management</h5>
                    <p className="text-muted small">
                      Add, edit, and manage individual products within each
                      category
                    </p>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="text-center mt-4">
        <Button
          type="primary"
          size="large"
          onClick={() => setShowFullInterface(true)}
          className="theme-btn-primary"
        >
          Launch Full Product Management Interface
        </Button>
      </div>
    </div>
  );

  if (showFullInterface) {
    return <ProductTypesManagement />;
  }

  return (
    <div className="product-management-container">
      <div className="page-header">
        <h2>Product Management System</h2>
        <p>
          A comprehensive solution for managing product types, pricing, and
          configurations
        </p>
      </div>

      {renderOverview()}
    </div>
  );
};

export default ProductManagementDemo;
