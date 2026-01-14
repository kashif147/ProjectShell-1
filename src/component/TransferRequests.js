import React, { useState, useEffect } from "react";
import { Drawer, Button, Space } from "antd";
import MyInput from "./common/MyInput";
import CustomSelect from "./common/CustomSelect";
import SubTableComp from "./common/SubTableComp";
import { useSelector } from "react-redux";
import { selectFilteredTransfer } from '../features/profiles/filterTransferSlice';
import { getTransferRequest } from "../features/profiles/TransferRequest";
import "../styles/MyDetails.css";
import dayjs from "dayjs";
import axios from "axios";
import MyAlert from "./common/MyAlert";

import { useDispatch } from "react-redux";
import MyDatePicker1 from "./common/MyDatePicker1";
import { Table } from "antd";

function TransferRequests({ open, onClose }) {
  const dispatch = useDispatch();
  const filteredData = useSelector(selectFilteredTransfer);
  console.log("Filtered Transfer Data in Drawer:", filteredData);
  const [formData, setFormData] = useState({
    newWorkLocation: "",
    newBranch: "",
    newRegion: "",
    newDescription: "",
    transferDate: "",
    memo: "",
  });
  const {
    titleOptions,
    genderOptions,
    workLocationOptions,
    gradeOptions,
    sectionOptions,
    membershipCategoryOptions,
    paymentTypeOptions,
    branchOptions,
    regionOptions,
    secondarySectionOptions,
    countryOptions,
  } = useSelector((state) => state.lookups);
  const [errors, setErrors] = useState({});
  const [requestId, setRequestId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(open);

  useEffect(() => {
    setDrawerOpen(open);
  }, [open]);

  const updateStatusftn = async (requestId, reason) => {
    try {
      const requestBody = {
        action: "APPROVE", // Only approve option
        reason: reason || ""
      };

      // Get token from localStorage, Redux store, or auth context
      const token = localStorage.getItem('token')

      const response = await axios.put(
        `${process.env.REACT_APP_PROFILE_SERVICE_URL}/transfer-request/${requestId}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Status update successful:", response.data);

      // Show success notification
      MyAlert('success',
        'Transfer Request Approved',
        'The transfer request has been approved successfully.'
      );
      dispatch(getTransferRequest())
      oncloseftn();
         
      // Dispatch action to update Redux state if needed
      // dispatch(updateTransferStatus({ id: requestId, status: "APPROVED" }));

      return { success: true, data: response.data };

    } catch (error) {
      console.error("Error approving transfer:", error);

      // Show error notification
      let errorMessage = "Failed to approve transfer request";

      if (error.response) {
        // Server responded with error status
        console.error("Error response:", error.response.data);
        errorMessage = error.response.data?.message || error.message;
        MyAlert('error',
          'Approval Failed',
          `Server error: ${errorMessage}`
        );
      } else if (error.request) {
        // Request made but no response
        console.error("No response received:", error.request);
        MyAlert('error',
          'Network Error',
          'No response from server. Please check your connection.'
        );
      } else {
        // Something else happened
        errorMessage = error.message;
        MyAlert('error',
          'Approval Error',
          `Error: ${errorMessage}`
        );
      }

      return {
        success: false,
        error: errorMessage,
        status: error.response?.status
      };
    }
  };

  // Populate form when filteredData changes
  console.log("Filtered Data in useEffect:", filteredData);
  useEffect(() => {
    if (filteredData) {
      setFormData({
        newWorkLocation: filteredData?.requestedWorkLocationName || "",
        newBranch: filteredData?.requestedBranchName || "",
        newRegion: filteredData?.requestedRegionName || "",
        newDescription: filteredData?.reason || "",
        transferDate: filteredData?.requestDate ? dayjs(filteredData.requestDate).format("DD/MM/YYYY") : "",
        memo: filteredData?.notes || "",
      });
      setRequestId(filteredData._id);
    }
  }, [filteredData]);
  console.log("Form Data:", formData);

  const handleChange = (name, value) => {
    const formattedValue = dayjs.isDayjs(value)
      ? value.format("DD/MM/YYYY")
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const oncloseftn = () => {
    setDrawerOpen(false);
    onClose();
    setFormData({
      newWorkLocation: "",
      newBranch: "",
      newRegion: "",
      newDescription: "",
      transferDate: "",
      memo: "",
    });
    setErrors({});
  };

  const onSubmit = () => {
    const requiredFields = ["newWorkLocation", "transferDate"];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Dispatch create/update request action
    console.log("Submitted data:", formData);
  };

  // Format the transfer history data
  const transferHistory = filteredData ? [{
    transferDate: filteredData.requestDate ? dayjs(filteredData.requestDate) : "",
    currentWorkLocationName: filteredData.currentWorkLocationName || "",
    reason: filteredData.reason || "",
    requestedWorkLocationName: filteredData.requestedWorkLocationName || "",
    notes: filteredData.notes || "",
    status: filteredData.status || "PENDING"
  }] : [];

  const columnHistory = [
    {
      title: "Transfer Date",
      dataIndex: "transferDate",
      key: "transferDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Work Location From",
      dataIndex: "currentWorkLocationName",
      key: "currentWorkLocationName",
    },
    {
      title: "Transfer reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Work Location To",
      dataIndex: "requestedWorkLocationName",
      key: "requestedWorkLocationName",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        let color = "default";
        if (text === "Approved") color = "green";
        else if (text === "Rejected") color = "red";
        else if (text === "Pending" || text === "PENDING") color = "orange";
        return <span style={{ color }}>{text}</span>;
      },
    },
  ];

  return (
    <Drawer
      title={`Transfer Request & History - ${filteredData?.profileId?.personalInfo?.forename || ""} ${filteredData?.profileId?.personalInfo?.surname || ""}`}
      open={drawerOpen}
      onClose={oncloseftn}
      width={1000}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => updateStatusftn(requestId)}
            style={{
              backgroundColor: "#215E97",
              borderColor: "#215E97",
              color: "white",
              fontWeight: "500",
              fontSize: "14px",
              padding: "4px 15px",
              height: "32px",
              borderRadius: "4px"
            }}
          >
            Approve
          </Button>
        </Space>
      }
    >
      <div className="drawer-main-cntainer p-4">
        {/* Profile Details Section */}
        <div className="details-drawer mb-4 mt-4 ps-2 pe-2">
          <p>{filteredData?.profileId?.personalInfo?.title || ""}</p>
          <p>{`${filteredData?.profileId?.personalInfo?.forename || ""}  ${filteredData?.profileId?.personalInfo?.surname || ""
            }`}</p>
          <p>{filteredData?.profileId?.membershipNumber || "N/A"}</p>
        </div>

        <div className="d-flex">
          {/* Current Section (Disabled) */}
          <div className="w-50">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: "35px",
                backgroundColor: "#215E97",
                color: "white",
              }}
            >
              <h3 className="text-center" style={{ fontSize: "15px" }}>
                Current
              </h3>
            </div>
            <div className="body-container">
              <CustomSelect
                label="Work Location"
                name="currentWorkLocation"
                value={filteredData?.currentWorkLocationName || ""}
                options={workLocationOptions}
                disabled
              />
              <CustomSelect
                label="Branch"
                name="currentBranch"
                value={filteredData?.currentBranchName || ""}
                options={branchOptions}
                disabled
              />
              <CustomSelect
                label="Region"
                name="currentRegion"
                value={filteredData?.currentRegionName || ""}
                options={regionOptions}
                disabled
              />
              <MyDatePicker1
                label="Request Date"
                name="transferDate"
                type="date"
                disabled={true}
                placeholder="Select date"
                value={formData.transferDate}
                onChange={(e) => handleChange("transferDate", e.target.value)}
                hasError={!!errors.transferDate}
                required
              />
              <MyInput
                label="Transfer Reason"
                name="currentDescription"
                type="textarea"
                value=""
                disabled
              />
            </div>
          </div>

          {/* New Section (Editable) */}
          <div className="w-50 ms-4">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                height: "35px",
                backgroundColor: "#215E97",
                color: "white",
              }}
            >
              <h3
                className="text-center"
                style={{ fontSize: "15px", margin: "0px" }}
              >
                New
              </h3>
            </div>
            <div className="body-container">
              <CustomSelect
                label="Work Location"
                name="newWorkLocation"
                value={formData.newWorkLocation}
                onChange={(name, value) => handleChange(name, value)}
                required
                options={workLocationOptions} // Add your work locations array here
                hasError={!!errors.newWorkLocation}
              />
              <CustomSelect
                label="Branch"
                name="newBranch"
                value={formData.newBranch}
                options={branchOptions} // Add your branches array here
                disabled
              />
              <CustomSelect
                label="Region"
                name="newRegion"
                value={formData.newRegion}
                options={regionOptions} // Add your regions array here
                disabled
              />
              {/* <MyInput
                label="Transfer Reason"
                name="newDescription"
                type="textarea"
                placeholder="Enter reason"
                value={formData.newDescription}
                onChange={(e) => handleChange("newDescription", e.target.value)}
              /> */}

              <MyInput
                label="Memo"
                name="memo"
                type="textarea"
                placeholder="Enter memo"
                value={formData.memo}
                onChange={(e) => handleChange("memo", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="mt-2 mb-3">Transfer History</h4>
          <Table
            className='claims-table'
            bortdered
            columns={columnHistory} dataSource={transferHistory} loading={!filteredData} pagination={false} />
          {/* <SubTableComp
            columns={columnHistory}
            dataSource={transferHistory}
            loading={!filteredData}
          /> */}
        </div>
      </div>
    </Drawer>
  );
}

export default TransferRequests;