import React from "react";
import AppTabs from "../../component/common/AppTabs";
function ProfileDetails() {

  // The app tabs display different types of information—such as claims and correspondence—specific to each member.
 
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 1 0%",
          minHeight: 0,
          minWidth: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <AppTabs />
      </div>
    );
  }

export default ProfileDetails
