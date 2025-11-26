import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { getAllApplications } from "../../features/ApplicationSlice";
import MultiFilterDropdown from "../../component/common/MultiFilterDropdown";
import { Spin } from "antd";
import { useFilters } from "../../context/FilterContext";
import dayjs from "dayjs";

function MembershipApplication() {
  const dispatch = useDispatch();
  const { filtersState } = useFilters();
  const { applications, applicationsLoading } = useSelector(
    (state) => state.applications
  );

  const [formattedApplications, setFormattedApplications] = useState([]);

  // Function to format dates in the application data
  const formatApplicationDates = (applicationData) => {
    if (!applicationData) return applicationData;


    const formatDate = (dateString) => {
      if (!dateString) return null;
      return dayjs(dateString).format('DD/MM/YYYY HH:MM');
    };

    return {
      ...applicationData,
      // Format dates in personalDetails
      personalDetails: applicationData.personalDetails ? {
        ...applicationData.personalDetails,
        personalInfo: applicationData.personalDetails.personalInfo ? {
          ...applicationData.personalDetails.personalInfo,
          dateOfBirth: formatDate(applicationData.personalDetails.personalInfo.dateOfBirth),
          deceasedDate: formatDate(applicationData.personalDetails.personalInfo.deceasedDate)
        } : null,
        contactInfo: applicationData.personalDetails.contactInfo,
        approvalDetails: applicationData.personalDetails.approvalDetails ? {
          ...applicationData.personalDetails.approvalDetails,
          approvedAt: formatDate(applicationData.personalDetails.approvalDetails.approvedAt)
        } : null,
        createdAt: formatDate(applicationData.personalDetails.createdAt),
        updatedAt: formatDate(applicationData.personalDetails.updatedAt)
      } : null,
      
      // Format dates in professionalDetails
      professionalDetails: applicationData.professionalDetails ? {
        ...applicationData.professionalDetails,
        retiredDate: formatDate(applicationData.professionalDetails.retiredDate),
        graduationDate: formatDate(applicationData.professionalDetails.graduationDate)
      } : null,
      
      // Format dates in subscriptionDetails
      subscriptionDetails: applicationData.subscriptionDetails ? {
        ...applicationData.subscriptionDetails,
        dateJoined: formatDate(applicationData.subscriptionDetails.dateJoined),
        submissionDate: formatDate(applicationData.subscriptionDetails.submissionDate)
      } : null,
      
      // Format top-level dates
      createdAt: formatDate(applicationData.createdAt),
      updatedAt: formatDate(applicationData.updatedAt),
      
      // Format approvalDetails dates
      approvalDetails: applicationData.approvalDetails ? {
        ...applicationData.approvalDetails,
        approvedAt: formatDate(applicationData.approvalDetails.approvedAt)
      } : null
    };
  };

  useEffect(() => {
    dispatch(getAllApplications(filtersState));
  }, []);

  // Format applications when they are loaded
  useEffect(() => {
    if (applications && applications.length > 0) {
      const formatted = applications.map(app => formatApplicationDates(app));
      setFormattedApplications(formatted);
    } else {
      setFormattedApplications([]);
    }
  }, [applications]);

  console.log(formattedApplications, "formatted applications");

  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent
        data={formattedApplications}
        screenName="Applications"
        isGrideLoading={applicationsLoading}
      />
      <div style={{ display: "flex", gap: 12 }}>
        {/* <MultiFilterDropdown
          label="Division"
          options={["North", "South", "East", "West"]}
          selectedValues={divisionFilter}
          onChange={setDivisionFilter}
        /> */}
      </div>
    </div>
  );
}

export default MembershipApplication;