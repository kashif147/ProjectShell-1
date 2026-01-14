import { useState, useEffect, useRef } from "react";
import {
  Dropdown,
  Menu,
  Input,
  Row,
  Col,
  Checkbox,
  Button
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  FaTrashAlt,
  FaRegArrowAltCircleRight,
  FaUserAltSlash
} from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { GrView } from "react-icons/gr";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { LuSmartphoneNfc } from "react-icons/lu";
import QRCode from "qrcode";
import { useLocation } from "react-router-dom";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useFilters } from "../../context/FilterContext";
import ExportCSV from "./ExportCSV";
import ExportPDF from "./ExportPDF";
import TransferRequests from "../TransferRequests";
import CareerBreakDrawer from "../CareerBreakDrawer";
import ChangeCategoryDrawer from "../details/ChangeCategoryDrawer";
import ContactDrawer from "./ContactDrawer";
import { getProfileDetailsById } from "../../features/profiles/ProfileDetailsSlice";
import { getTransferRequestById } from "../../features/profiles/TransferRequest";

import { clearSingleTransferRequest } from "../../features/profiles/TransferRequest";
import { getTransferRequestHistoryById } from "../../constants/TransferRequestHistory";
import { useDispatch, useSelector } from "react-redux";
import { getAllApplications } from "../../features/ApplicationSlice";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
function SimpleMenu({
  title,
  data,
  isCheckBox = true,
  actions,
  vertical,
  attachedFtn,
  record,
  index
}) {
  const [checkboxes, setCheckboxes] = useState([]);
  const [transferreq, settransferreq] = useState(false);
  const [careerBreak, setcareerBreak] = useState(false);
  const [isDrawerOpen, setisDrawerOpen] = useState(false);
  const [contactDrawer, setcontactDrawer] = useState(false);
  const dispatch = useDispatch();
  const [ddSearch, setddSearch] = useState("");
  const location = useLocation();

  const {
    columns,
    updateSelectedTitles,
    searchFilters,
    gridData,
    setGridData,
    globleFilters,
    getProfile,
    ProfileDetails
  } = useTableColumns();

  const {
    currentPageFilters,
    visibleFilters,
    toggleFilter,
    resetFilters,
    activePage,
    filtersState
  } = useFilters();

  const { applications, applicationsLoading } = useSelector(
    (state) => state.applications
  );

  // Function to format dates in the application data (matching MembershipApplication.jsx)
  const formatApplicationDates = (applicationData) => {
    if (!applicationData) return applicationData;

    const formatDate = (dateString) => {
      if (!dateString) return null;
      return dayjs.utc(dateString).format("DD/MM/YYYY HH:mm");
    };

    const formatDateOnly = (dateString) => {
      if (!dateString) return null;
      return dayjs.utc(dateString).format("DD/MM/YYYY");
    };

    return {
      ...applicationData,
      personalDetails: applicationData.personalDetails ? {
        ...applicationData.personalDetails,
        personalInfo: applicationData.personalDetails.personalInfo ? {
          ...applicationData.personalDetails.personalInfo,
          dateOfBirth: formatDateOnly(applicationData.personalDetails.personalInfo.dateOfBirth),
          deceasedDate: formatDateOnly(applicationData.personalDetails.personalInfo.deceasedDate)
        } : null,
        contactInfo: applicationData.personalDetails.contactInfo,
        approvalDetails: applicationData.personalDetails.approvalDetails ? {
          ...applicationData.personalDetails.approvalDetails,
          approvedAt: formatDate(applicationData.personalDetails.approvalDetails.approvedAt)
        } : null,
        createdAt: formatDate(applicationData.personalDetails.createdAt),
        updatedAt: formatDate(applicationData.personalDetails.updatedAt)
      } : null,
      professionalDetails: applicationData.professionalDetails ? {
        ...applicationData.professionalDetails,
        retiredDate: formatDate(applicationData.professionalDetails.retiredDate),
        graduationDate: formatDate(applicationData.professionalDetails.graduationDate)
      } : null,
      subscriptionDetails: applicationData.subscriptionDetails ? {
        ...applicationData.subscriptionDetails,
        dateJoined: formatDate(applicationData.subscriptionDetails.dateJoined),
        submissionDate: formatDate(applicationData.subscriptionDetails.submissionDate)
      } : null,
      createdAt: formatDate(applicationData.createdAt),
      updatedAt: formatDate(applicationData.updatedAt),
      approvalDetails: applicationData.approvalDetails ? {
        ...applicationData.approvalDetails,
        approvedAt: formatDate(applicationData.approvalDetails.approvedAt)
      } : null
    };
  };

  const prepareDataForExport = (data, screenName) => {
    // Determine the correct mapping key for the screen
    let mappingKey = screenName;
    if (location.pathname === "/MembershipApplication" || location.pathname === "/Applications") {
      mappingKey = "Applications";
    }

    if (!data || !mappingKey || !columns[mappingKey]) return data;

    const activeColumns = columns[mappingKey].filter(
      (col) => col.isGride !== false && col.title !== "Action" && col.dataIndex
    );

    return data.map((record) => {
      const flattened = {};
      activeColumns.forEach((col) => {
        let value = "";
        if (Array.isArray(col.dataIndex)) {
          value = col.dataIndex.reduce((acc, key) => acc?.[key], record);
        } else {
          value = record[col.dataIndex];
        }

        // Apply basic formatting if value is still an object or boolean
        if (typeof value === "boolean") {
          value = value ? "Yes" : "No";
        } else if (value === null || value === undefined) {
          value = "-";
        } else if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        flattened[col.title] = value;
      });
      return flattened;
    });
  };

  const getAppliedFiltersMetadata = () => {
    const lines = [];

    // 1. Applied Filters line
    if (filtersState) {
      const applied = Object.entries(filtersState)
        .filter(([_, value]) => value?.selectedValues && value.selectedValues.length > 0)
        .map(([key, value]) => `${key}: ${value.selectedValues.join(", ")}`);

      lines.push(applied.length > 0 ? `Applied Filters: ${applied.join(" | ")}` : "Applied Filters: None");
    } else {
      lines.push("Applied Filters: None");
    }

    // 2. Created At line
    lines.push(`Exported At: ${dayjs().format("DD/MM/YYYY HH:mm")}`);

    return lines;
  };

  useEffect(() => {
    if (location.pathname === "/Applications" && !record) {
      dispatch(getAllApplications(filtersState));
    }
  }, [location.pathname, filtersState, dispatch, record]);

  useEffect(() => {
    if (location.pathname === "/Applications" && applications && applications.length > 0) {
      const formatted = applications.map(app => formatApplicationDates(app));
      setGridData(formatted);
    } else if (location.pathname === "/Applications") {
      setGridData([]);
    }
  }, [applications, location.pathname, setGridData]);

  useEffect(() => {
    setCheckboxes(globleFilters);
  }, [globleFilters]);

  useEffect(() => {
    if (ddSearch !== "") {
      searchInFilters(ddSearch);
    }
  }, [ddSearch]);

  const searchInFilters = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredResults = searchFilters[location.pathname]?.filter((item) =>
      item.titleColumn.toLowerCase().includes(normalizedQuery)
    );
    setCheckboxes(filteredResults);
  };

  useEffect(() => {
    if (transferreq && record?._id) {
      // When the drawer is set to open, dispatch all data fetching actions
      dispatch(getTransferRequestHistoryById(record._id));
      dispatch(getProfileDetailsById(record._id));
      dispatch(getTransferRequestById(record._id));
      getProfile(record, index);
    }
  }, [transferreq, record, index, dispatch, getProfile]);

  const updateSelectedTitlesA = (title, isChecked) => {
    setCheckboxes((prevProfile) =>
      prevProfile.map((item) =>
        item.titleColumn === title ? { ...item, isSearch: isChecked } : item
      )
    );
  };

  // ====================
  // ✅ QR + NFC Logic
  // ====================
  const qrRef = useRef(null);
  const [qrValue] = useState("Hello NFC");

  const createTestNFCTag = (records = []) => ({
    id: "test-tag-" + Math.floor(Math.random() * 10000),
    records: records.map((r) => ({
      recordType: r.recordType,
      RegNo: r.data
    })),
    timestamp: Date.now()
  });

  const handleGenerate = () => {
    const tag = createTestNFCTag([
      { recordType: "text", data: ProfileDetails?.regNo }
    ]);
    alert("Generated NFC Tag:\n" + JSON.stringify(tag, null, 2));
  };

  const downloadQRCode = async () => {
    try {
      const url = await QRCode.toDataURL("Hello NFC", { type: "image/png" });
      const link = document.createElement("a");
      link.href = url;
      link.download = "qr-code.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      
    }
  };

  // ====================
  // ✅ Dropdown Menu - FIXED
  // ====================
  const menu = (
    <Menu>
      {/* 🔹 Only show filters section when isCheckBox is true */}
      {isCheckBox ? (
        <>
          <Menu.Item key="search">
            <Input
              suffix={<SearchOutlined />}
              onChange={(e) => setddSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Search filters..."
            />
          </Menu.Item>

          {/* 🔹 Dynamic filters from FilterContext - ONLY when isCheckBox is true */}
          <Menu.ItemGroup title={`Filters (${activePage})`}>
            <Row style={{ maxHeight: "250px", overflowY: "auto" }}>
              {currentPageFilters.map((filter, idx) => (
                <Col span={24} key={idx}>
                  <Checkbox
                    checked={visibleFilters.includes(filter)}
                    onChange={(e) => toggleFilter(filter, e.target.checked)}
                  >
                    {filter}
                  </Checkbox>
                </Col>
              ))}
            </Row>
            <div className="flex justify-end mt-3">
              <Button size="small" className="butn secoundry-btn" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </Menu.ItemGroup>
        </>
      ) : (
        // 🔹 When isCheckBox is false, only show action items
        <>
          {data && Object.keys(data)?.map((key) => (
            <Menu.Item key={key} onClick={(e) => actions(e)}>
              {key === "Delete" ? (
                <div className="d-flex align-items-baseline">
                  <FaTrashAlt
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      color: "#45669d"
                    }}
                  />
                  Delete
                </div>
              ) : key === "Attached" ? (
                <div onClick={attachedFtn} className="d-flex align-items-baseline">
                  <ImAttachment
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      fontWeight: "500",
                      color: "#45669d"
                    }}
                  />
                  Attached
                </div>
              ) : key === "View" ? (
                <div className="d-flex align-items-baseline">
                  <GrView
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      color: "#45669d"
                    }}
                  />
                  View
                </div>
              ) : key === "Export CSV" ? (
                <ExportCSV
                  data={prepareDataForExport(gridData, activePage)}
                  filename={`${activePage}-data.csv`}
                  metadata={getAppliedFiltersMetadata()}
                />
              ) : key === "Export PDF" ? (
                <ExportPDF data={prepareDataForExport(gridData, activePage)} filename={`${activePage}-data.pdf`} />
              ) : key === "Print Label" ? (
                <div className="d-flex align-items-baseline">
                  <MdOutlineLocalPrintshop
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      color: "#45669d"
                    }}
                  />
                  Print Label
                </div>
              ) : key === "Transfer Requests" ? (
                <div
                  className="d-flex align-items-baseline"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent menu from closing
                    settransferreq(true); // Just set the state to open the drawer
                    getTransferRequestById(record)
                  }}
                >
                  <FaRegArrowAltCircleRight
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      color: "#45669d"
                    }}
                  />
                  Transfer Request
                </div>
              ) : key === "assign IRO" ? (
                <div
                  className="d-flex align-items-baseline"
                  onClick={(e) => { e.stopPropagation(); setcontactDrawer(!contactDrawer); }}
                >
                  Assign IRO
                </div>
              ) : key === "Career Break" ? (
                <div
                  className="d-flex align-items-baseline"
                  onClick={(e) => {
                    // This one seems to work, but for consistency let's add stopPropagation
                    e.stopPropagation(); setcareerBreak(!careerBreak);
                    getProfile(record, index);
                  }}
                >
                  <FaUserAltSlash
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      color: "#45669d"
                    }}
                  />
                  Career Break
                </div>
              ) : key === "Generate NFC tag" ? (
                <div
                  className="d-flex align-items-baseline"
                  onClick={async (e) => {
                    e.stopPropagation(); // Prevent menu from closing
                    getProfile(record, index); // No need to await if it doesn't return a promise
                    handleGenerate();
                  }}
                >
                  <LuSmartphoneNfc
                    style={{
                      fontSize: "12px",
                      marginRight: "10px",
                      color: "#45669d"
                    }}
                  />
                  Generate NFC tag
                </div>
              ) : key === "Change Category" ? (
                <div
                  className="d-flex align-items-baseline"
                  onClick={async (e) => {
                    e.stopPropagation(e); // Prevent menu from closing
                    getProfile(record, index); // No need to await if it doesn't return a promise
                    setisDrawerOpen(true);
                  }}
                >
                  Change Category
                </div>
              ) : (
                key
              )}
            </Menu.Item>
          ))}
        </>
      )}
    </Menu>
  );

  // ====================
  // ✅ Return JSX
  // ====================
  const [formData, setFormData] = useState({
    currentWorkLocation: "",
    currentBranch: "",
    currentDescription: "",
    currentRegion: "",
    newWorkLocation: "",
    newBranch: "",
    newDescription: "",
    newRegion: "",
    transferDate: "",
    memo: ""
  });
  const [errors, setErrors] = useState({});

  return (
    <>
      <Dropdown
        overlay={menu}
        trigger={["hover"]}
        placement="bottomLeft"
        overlayStyle={{ width: 220, padding: "0px" }}
      >
        <Button
          style={
            isCheckBox
              ? {
                backgroundColor: '#091e420a',
                borderRadius: '4px',
                height: '32px',
                border: 'none',
                fontWeight: '500',
                marginLeft: '8px'
              }
              : {
                backgroundColor: 'transparent',
                borderRadius: '4px',
                height: '32px',
                border: 'none',
                fontWeight: '500',
                marginLeft: '0px',
                boxShadow: 'none'
              }
          }
        >
          {title}
        </Button>
      </Dropdown>

      {/* Drawers */}
      <TransferRequests
        open={transferreq}
        onClose={() => {
          settransferreq(false);
          // Clear the single transfer request data when closing the drawer
          dispatch(clearSingleTransferRequest());
        }}
        isSearch={false}
        formData={formData}
        handleChange={(field, value) =>
          setFormData((prev) => ({ ...prev, [field]: value }))
        }
        errors={errors}
        isChangeCat={true}
      />
      <CareerBreakDrawer
        open={careerBreak}
        onClose={() => setcareerBreak(!careerBreak)}
      />
      <ChangeCategoryDrawer
        open={isDrawerOpen}
        onClose={() => setisDrawerOpen(false)}
        isProfileDetails={true}
        ProfileDetails={ProfileDetails}
      />
      <ContactDrawer
        open={contactDrawer}
        onClose={() => setcontactDrawer(false)}
      />
    </>
  );
}

export default SimpleMenu;