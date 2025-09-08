import React, { useState, useEffect } from "react";
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Select,
  Card,
  Divider,
  message,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { addTenant, updateTenant } from "../../features/TenantSlice";
import "../../styles/TenantManagement.css";

const { Option } = Select;

const TenantForm = ({ tenant, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (tenant) {
      form.setFieldsValue({
        name: tenant.name,
        verifiedDomains: tenant.verifiedDomains,
      });
      setConnections(tenant.connections || []);
    } else {
      form.resetFields();
      setConnections([]);
    }
  }, [tenant, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const tenantData = {
        ...values,
        connections: connections,
        createdAt: tenant ? tenant.createdAt : new Date().toISOString(),
      };

      if (tenant) {
        await dispatch(
          updateTenant({ id: tenant._id, updatedTenant: tenantData })
        );
        message.success("Tenant updated successfully");
      } else {
        await dispatch(addTenant(tenantData));
        message.success("Tenant created successfully");
      }

      onSubmit(tenantData);
    } catch (error) {
      message.error("Failed to save tenant");
      console.error("Error saving tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  const addConnection = () => {
    setConnections([
      ...connections,
      { type: "entra", issuer: "", directoryId: "", audience: "" },
    ]);
  };

  const removeConnection = (index) => {
    setConnections(connections.filter((_, i) => i !== index));
  };

  const updateConnection = (index, field, value) => {
    const updatedConnections = [...connections];
    updatedConnections[index] = {
      ...updatedConnections[index],
      [field]: value,
    };
    setConnections(updatedConnections);
  };

  return (
    <Drawer
      title={tenant ? "Edit Tenant" : "Add New Tenant"}
      width={800}
      open={true}
      onClose={onClose}
      extra={
        <Space>
          <Button onClick={onClose} className="butn secoundry-btn">
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={() => form.submit()}
            loading={loading}
            className="butn primary-btn"
          >
            {tenant ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="tenant-form"
        >
          {/* Basic Information */}
          <Card title="Basic Information" className="mb-4">
            <Form.Item
              label="Organization Name"
              name="name"
              rules={[
                { required: true, message: "Please enter organization name" },
              ]}
            >
              <Input placeholder="Enter organization name" />
            </Form.Item>

            <Form.Item
              label="Verified Domains"
              name="verifiedDomains"
              rules={[
                { required: true, message: "Please add at least one domain" },
              ]}
            >
              <Select
                mode="tags"
                placeholder="Add verified domains (e.g., acme.com)"
                style={{ width: "100%" }}
                tokenSeparators={[","]}
              />
            </Form.Item>
          </Card>

          {/* Authentication Connections */}
          <Card
            title="Authentication Connections"
            className="mb-4"
            extra={
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addConnection}
                size="small"
              >
                Add Connection
              </Button>
            }
          >
            {connections.length === 0 ? (
              <div className="text-center text-muted py-4">
                <p>No connections configured</p>
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={addConnection}
                >
                  Add First Connection
                </Button>
              </div>
            ) : (
              connections.map((connection, index) => (
                <Card
                  key={index}
                  size="small"
                  className="mb-3"
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeConnection(index)}
                    />
                  }
                >
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item label="Connection Type">
                        <Select
                          value={connection.type}
                          onChange={(value) =>
                            updateConnection(index, "type", value)
                          }
                        >
                          <Option value="entra">Entra ID (Azure AD)</Option>
                          <Option value="b2c">Azure B2C</Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item label="Issuer URL">
                        <Input
                          value={connection.issuer}
                          onChange={(e) =>
                            updateConnection(index, "issuer", e.target.value)
                          }
                          placeholder="https://login.microsoftonline.com/{tid}/v2.0"
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item label="Directory ID">
                        <Input
                          value={connection.directoryId}
                          onChange={(e) =>
                            updateConnection(
                              index,
                              "directoryId",
                              e.target.value
                            )
                          }
                          placeholder="{tid}"
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item label="Audience">
                        <Input
                          value={connection.audience}
                          onChange={(e) =>
                            updateConnection(index, "audience", e.target.value)
                          }
                          placeholder="{clientId}"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </Card>

          {/* Preview */}
          {connections.length > 0 && (
            <Card title="Configuration Preview" size="small">
              <pre className="bg-light p-3 rounded">
                {JSON.stringify(
                  {
                    name: form.getFieldValue("name"),
                    verifiedDomains: form.getFieldValue("verifiedDomains"),
                    connections: connections,
                  },
                  null,
                  2
                )}
              </pre>
            </Card>
          )}
        </Form>
      </div>
    </Drawer>
  );
};

export default TenantForm;
