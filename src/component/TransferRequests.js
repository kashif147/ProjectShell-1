import React, { useState } from "react";
import { Table, Input, Space } from "antd";
import MyDrawer from "./common/MyDrawer";
import MyInput from "./common/MyInput";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { useTableColumns } from "../context/TableColumnsContext ";
import CustomSelect from "./common/CustomSelect";
import { workLocations } from "../Data";
import { workLocationDetails } from "../Data";
import { CatOptions } from "../Data";
import "../styles/MyDetails.css";
import dayjs from "dayjs";
import SubTableComp from "./common/SubTableComp";
import { useSelector, useDispatch } from "react-redux";
import { createTransferRequest } from "../features/profiles/TransferRequest";

const { Search } = Input;

function TransferRequests({ open, onClose, isSearch, isChangeCat }) {
  const onSearch = (value, _e, info) => console.log(info?.source, value);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    newWorkLocation: "",
    newBranch: "",
    newRegion: "",
    newDescription: "",
    transferDate: "",
    memo: "",
  });

  const [errors, setErrors] = useState({});
  const { history, loading } = useSelector(
    (state) => state.transferRequestHistory
  );
  const { profileDetails } = useSelector((state) => state.profileDetails);
  const { loading: createLoading, error: createError } = useSelector(
    (state) => state.transferRequest
  );
console.log(history,"lp")
  const allBranches = Array.from(
    new Set(Object.values(workLocationDetails).map((d) => d.branch))
  );
  const allRegions = Array.from(
    new Set(Object.values(workLocationDetails).map((d) => d.region))
  );
  const handleChange = (eventOrName, value) => {
    if (eventOrName?.target) {
      const { name, type, value, checked } = eventOrName.target;
      const finalValue = type === "checkbox" ? checked : value;
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: finalValue,
        };
        if (name === "newWorkLocation" && workLocationDetails[finalValue]) {
          updated.newBranch = workLocationDetails[finalValue].branch;
          updated.newRegion = workLocationDetails[finalValue].region;
        }
        return updated;
      });
    } else {
      const name = eventOrName;
      const formattedValue = dayjs.isDayjs(value)
        ? value.format("DD/MM/YYYY")
        : value;

      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: formattedValue,
        };

        // Handle WorkLocation → branch & region
        if (name === "newWorkLocation" && workLocationDetails[formattedValue]) {
          updated.branch = workLocationDetails[formattedValue].newBranch;
          updated.region = workLocationDetails[formattedValue].newRegion;
        }

        return updated;
      });

      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const [selectionType] = useState("checkbox");

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        "selectedRowKeys:",
        selectedRowKeys,
        "selectedRows:",
        selectedRows
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      name: record.name,
    }),
  };

  const { ProfileDetails } = useTableColumns();

  const oncloseftn = () => {
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
    // TODO: Dispatch create request action
    console.log("Submitted data:", formData);
  };
  const columnHistory = [
    {
      title: "Transfer Date",
      dataIndex: "transferDate",
      key: "transferDate",
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
        else if (text === "Pending") color = "orange";
        return <span style={{ color }}>{text}</span>;
      },
    },
  ];

  return (
    <MyDrawer
      title={"Transfer Request & History1"}
      open={open}
      onClose={oncloseftn}
      add={onSubmit}
      width={"1000px"}
    >
      <div className="drawer-main-cntainer p-4">
        <div className="details-drawer mb-4 mt-4">
          <p>{`${profileDetails?.personalInfo?.forename || ""}  ${
            profileDetails?.personalInfo?.surname || ""
          }`}</p>
          <p>{profileDetails?.membershipNumber}</p>
          <p>{profileDetails?.professionalDetails?.grade}</p>
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
                value={profileDetails?.professionalDetails?.workLocation}
                options={workLocations.map((loc) => ({
                  value: loc,
                  label: loc,
                }))}
                disabled
              />
              <CustomSelect
                label="Branch"
                name="currentBranch"
                value={profileDetails?.professionalDetails?.branch}
                disabled
                options={allBranches.map((branch) => ({
                  value: branch,
                  label: branch,
                }))}
              />
              <CustomSelect
                label="Region"
                name="currentRegion"
                value={profileDetails?.professionalDetails?.region}
                options={allRegions.map((region) => ({
                  value: region,
                  label: region,
                }))}
                disabled
              />
              <MyInput
                label="Transfer Reason"
                name="currentDescription"
                type="textarea"
                value={""} // No reason for current
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
                onChange={handleChange}
                required
                options={workLocations.map((loc) => ({
                  value: loc,
                  label: loc,
                }))}
                hasError={!!errors.newWorkLocation}
              />
              <CustomSelect
                label="Branch"
                name="newBranch"
                disabled={true}
                value={formData.newBranch}
                options={allBranches.map((branch) => ({
                  value: branch,
                  label: branch,
                }))}
              />
              <CustomSelect
                label="Region"
                name="newRegion"
                value={formData.newRegion}
                disabled={true}
                options={allRegions.map((region) => ({
                  value: region,
                  label: region,
                }))}
              />
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
          <h4 className="mt-4 mb-3">Transfer History</h4>
          <SubTableComp
            columns={columnHistory}
            dataSource={history}
            loading={loading}
          />
        </div>
      </div>
    </MyDrawer>
  );
}

export default TransferRequests;
