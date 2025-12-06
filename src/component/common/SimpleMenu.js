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

import { getTransferRequestHistoryById } from "../../constants/TransferRequestHistory";
import { useDispatch } from "react-redux";
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
    updateSelectedTitles,
    searchFilters,
    gridData,
    globleFilters,
    getProfile,
    ProfileDetails
  } = useTableColumns();

  const {
    currentPageFilters,
    visibleFilters,
    toggleFilter,
    resetFilters,
    activePage
  } = useFilters();

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
      console.error("Error generating QR code:", error);
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
                <ExportCSV data={gridData} filename="my-data.csv" />
              ) : key === "Export PDF" ? (
                <ExportPDF data={gridData} filename="my-data.pdf" />
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
                    settransferreq(true);
                    dispatch(getTransferRequestHistoryById(record?._id));
                    dispatch(getProfileDetailsById(record?._id));
                    getProfile(record, index);
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
        onClose={() => settransferreq(false)} // This was the issue, it was being passed a boolean
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