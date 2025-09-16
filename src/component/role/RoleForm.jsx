import React, { useState, useEffect } from "react";
import { Drawer, Form, Input, Select, Button, Space, message } from "antd";
import { getTenantsList, ROLE_CATEGORIES } from "../../constants/Roles";
import CustomSelect from "../common/CustomSelect";
import MyInput from "../common/MyInput";
import { getAllRoles } from "../../features/RoleSlice";
import { useDispatch } from 'react-redux';
import { insertDataFtn } from "../../utils/Utilities";
import { useSelector } from "react-redux";
import { updateFtn } from "../../utils/Utilities";

const { Option } = Select;
const { TextArea } = Input;

const RoleForm = ({ isEdit, onClose, role }) => {
  const dispatch = useDispatch()

  const [data, setData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [form] = Form.useForm();
  // const { role, roleLoading, error } = useSelector((state) => state.roleById);
  useEffect(() => {
    if (!isEdit) return;
    const mapped = {
      name: role?.name || "",
      code: role?.code || "",
      description: role?.description || "",
      tenantId: role?.tenantId || "",
      category: role?.category || "",
      status: role?.status || "",
    };
    setData(mapped);
    setOriginalData(mapped); // save original snapshot
  }, [role, isEdit]);

  console.log(data, "data1")


  const [errors, setErrors] = useState({});
  const validate = () => {
    let newErrors = {};

    if (!data?.name?.trim()) newErrors.name = true;
    if (!data?.description?.trim()) newErrors.description = true;
    if (!data?.tenantId?.trim()) newErrors.tenantId = true;
    if (!data?.code?.trim()) newErrors.code = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // ✅ return true if no errors
  };
  const baseURL = process.env.REACT_APP_POLICY_SERVICE_URL
  const getChangedFields = (newData, oldData) => {
    const changed = {};
    Object.keys(newData).forEach((key) => {
      if (newData[key] !== oldData[key]) {
        changed[key] = newData[key];
      }
    });
    return changed;
  };


  const handleSubmit = async () => {
    if (!validate()) {
      console.log("Validation failed", errors);
      return;
    }

    if (isEdit) {
      const changedFields = getChangedFields(data, originalData);
      if (Object.keys(changedFields).length === 0) {
        message.info("No changes detected.");
        return;
      }

      updateFtn(
        baseURL,
        `/api/roles/${role._id}`,
        { ...changedFields, },
       
        () => {
          setData({});
          setErrors({});
          dispatch(getAllRoles());
          onClose();
        },
         "You have successfully Updated",
      );
    } else {
      try {
        await insertDataFtn(
          baseURL,
          "/api/roles",
          { ...data, userType: "CRM" },
          "Role created successfully",
          "Failed to create role",
          () => {
            setData({});
            setErrors({});
            dispatch(getAllRoles());
            onClose();
          }
        );
      } catch (err) {
        console.error("Unexpected error:", err);
        setErrors((prev) => ({
          ...prev,
          api: "Something went wrong. Please try again.",
        }));
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const handleChange = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (value && value.toString().trim() !== "") {
        delete newErrors[field];
      } else {
        newErrors[field] = true;
      }
      return newErrors;
    });
  };

  // useEffect(() => {
  //   if (role) {
  //     form.setFieldsValue({
  //       name: role.name,
  //       description: role.description,
  //       tenantId: role.tenantId,
  //       category: role.category,
  //       status: role.status,
  //     });
  //   } else {
  //     form.resetFields();
  //   }
  // }, [role, form]);

  // const handleSubmit = async () => {
  //   try {
  //     setLoading(true);
  //     const values = await form.validateFields();

  //     const roleData = {
  //       name: values.name,
  //       description: values.description,
  //       code: values?.code,
  //       userType: 'CRM',
  //       // tenantId: values.tenantId,
  //       // tenantName: tenants.find((t) => t.id === values.tenantId)?.name || "",
  //       // category: values.category,
  //       // status: values.status,
  //       // permissions: role?.permissions || [],
  //     };

  //     await onSubmit(roleData);
  //     message.success(
  //       role ? "Role updated successfully" : "Role created successfully"
  //     );
  //   } catch (error) {
  //     console.error("Form validation failed:", error);
  //     message.error("Please fill in all required fields");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const tenants = getTenantsList();

  return (
    <Drawer
      title={isEdit ? "Edit Role" : "Add New Role"}
      width="33%"
      placement="right"
      onClose={handleCancel}
      open={true}
      className="role-form-drawer configuration-main"
      extra={
        <Space>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            style={{
              backgroundColor: "var(--primary-color)",
              borderColor: "var(--primary-color)",
              borderRadius: "4px",
            }}
          >
            {isEdit ? "Update" : "Create"}
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer">
        <div className="drawer-main-cntainer">

          {/* Role Name */}
          <MyInput
            label="Role Name"
            name="name"
            placeholder="Enter role name"
            required
            hasError={errors?.name}
            rules={[
              { min: 2, message: "Name must be at least 2 characters" },
            ]}
            onChange={(e) => handleChange('name', e.target.value)}
            value={data?.name}
          />
          <MyInput
            label="Code"
            name="Code"
            placeholder="Enter Code"
            onChange={(e) => handleChange('code', e.target.value)}
            required
            value={data?.code}
            hasError={errors?.code}
            rules={[
              // { min: 2, message: "Name must be at least 2 characters" },
            ]}
          />

          {/* Description */}
          <MyInput
            label="Description"
            name="description"
            type="textarea"
            rows={4}
            placeholder="Enter role description"
            required
            onChange={(e) => handleChange('description', e.target.value)}
            rules={[
              { min: 10, message: "Description must be at least 10 characters" },
            ]}
            value={data?.description}
            hasError={errors?.description}
            maxLength={200}
            showCount
          />
          {/* Role Category */}
          <CustomSelect
            label="Role Category"
            name="category"
            placeholder="Select role category"
            required
            hasError={errors?.category}
            options={ROLE_CATEGORIES.map((category) => ({
              label: category.label,
              value: category.value,
            }))}
          // value={data?.category}
          // onChange={}
          />

          {/* Tenant */}
          <CustomSelect
            label="Tenant"
            name="tenantId"
            placeholder="Select tenant"
            hasError={errors?.tenantId}
            required
            onChange={(e) => {
              handleChange('tenantId', e.target.value)
            }
            }
            value={data?.tenantId}
            options={tenants.map((tenant) => ({
              label: tenant.name,
              value: tenant.id,
            }))}
          />

          <CustomSelect
            label="Status"
            name="status"
            placeholder="Select status"
            value={data?.Status}
            onChange={(e) => handleChange('Status', e.target.value)}
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Suspended", value: "suspended" },
            ]}
          />

          {/* Guidelines */}
          <div className="form-help">
            <h5>Role Guidelines:</h5>
            <ul>
              <li>Choose a descriptive name that clearly identifies the role's purpose</li>
              <li>Provide a detailed description of what this role is intended for</li>
              <li>Select the appropriate tenant for this role</li>
              <li>Set the initial status (Active, Inactive, or Suspended)</li>
              <li>Permissions can be assigned after creating the role</li>
            </ul>
          </div>
        </div>

      </div>
    </Drawer>
  );
};

export default RoleForm;
