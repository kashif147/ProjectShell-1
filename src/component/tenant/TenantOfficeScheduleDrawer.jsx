import React from "react";
import { Drawer } from "antd";
import TenantOfficeSchedulePanel from "./TenantOfficeSchedulePanel";
import { useAuthorization } from "../../context/AuthorizationContext";
import "../../styles/TenantManagement.css";

const TenantOfficeScheduleDrawer = ({
  open,
  onClose,
  tenantId,
  office,
  useCurrentTenant = false,
  onSaved,
}) => {
  const { hasPermission } = useAuthorization();
  const canWrite =
    hasPermission("tenant:update") || hasPermission("tenant:write");

  const officesPath = useCurrentTenant
    ? "/tenant/offices"
    : `/tenants/${tenantId}/offices`;

  if (!office?._id) return null;

  return (
    <Drawer
      className="tenant-form-drawer tenant-office-schedule-drawer"
      title={
        <div className="tenant-office-schedule-drawer-title">
          <span className="tenant-office-schedule-drawer-eyebrow">
            Opening hours &amp; closures
          </span>
          <span className="tenant-office-schedule-drawer-heading">
            {office.name}
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
        <TenantOfficeSchedulePanel
          office={office}
          officesPath={officesPath}
          canWrite={canWrite}
          onSaved={onSaved}
        />
      </div>
    </Drawer>
  );
};

export default TenantOfficeScheduleDrawer;
