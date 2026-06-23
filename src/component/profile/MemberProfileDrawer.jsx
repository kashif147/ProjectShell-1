import React, { Suspense, lazy } from "react";
import { Drawer, Spin } from "antd";
import "./MemberProfileDrawer.css";

const AppTabs = lazy(() => import("../common/AppTabs"));

export default function MemberProfileDrawer({
  open,
  onClose,
  profileId,
  subscriptionId,
  memberName,
}) {
  const title = memberName ? `Member — ${memberName}` : "Member profile";

  return (
    <Drawer
      title={title}
      open={open}
      onClose={onClose}
      placement="right"
      width="80%"
      destroyOnClose
      className="member-profile-drawer"
    >
      {open && profileId ? (
        <div className="member-profile-drawer-content">
          <Suspense
            fallback={
              <div className="member-profile-drawer-loading">
                <Spin size="large" />
              </div>
            }
          >
            <AppTabs profileId={profileId} subscriptionId={subscriptionId} />
          </Suspense>
        </div>
      ) : null}
    </Drawer>
  );
}
