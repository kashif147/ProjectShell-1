import React from "react";
import { Drawer } from "antd";
import TenantDepartmentContactsPanel from "./TenantDepartmentContactsPanel";
import "../../styles/TenantManagement.css";

const TenantDepartmentContactsDrawer = ({
  open,
  onClose,
  tenantId,
  department,
  useCurrentTenant = false,
  showInactive = false,
}) => {
  if (!department?._id) return null;

  const departmentLabel = [department.name, department.code]
    .filter(Boolean)
    .join(" · ");

  return (
    <Drawer
      className="tenant-form-drawer tenant-department-contacts-list-drawer"
      title={
        <div className="tenant-department-contacts-drawer-title">
          <span className="tenant-department-contacts-drawer-eyebrow">
            Department contacts
          </span>
          <span className="tenant-department-contacts-drawer-heading">
            {departmentLabel}
          </span>
        </div>
      }
      width={920}
      zIndex={1100}
      open={open}
      onClose={onClose}
      destroyOnClose
      push={false}
      maskClosable
    >
      <div className="drawer-main-cntainer">
        <TenantDepartmentContactsPanel
          tenantId={tenantId}
          departmentId={department._id}
          departmentName={department.name}
          useCurrentTenant={useCurrentTenant}
          showInactive={showInactive}
        />
      </div>
    </Drawer>
  );
};

export default TenantDepartmentContactsDrawer;
