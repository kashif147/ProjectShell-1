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
// import { useTableColumns } from "../../context/TableColumnsContext";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useFilters } from "../../context/FilterContext"; // ✅ new context
import ExportCSV from "./ExportCSV";
import ExportPDF from "./ExportPDF";
import TransferRequests from "../TransferRequests";
import CareerBreakDrawer from "../CareerBreakDrawer";
import ChangeCategoryDrawer from "../details/ChangeCategoryDrawer";
import ContactDrawer from "./ContactDrawer";

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
  const [ddSearch, setddSearch] = useState("");
  const location = useLocation();

  // 🔹 Contexts
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

  // Load global filters initially
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
  // ✅ Dropdown Menu
  // ====================
  const menu = (
    <Menu>
      {isCheckBox && (
        <Menu.Item key="search">
          <Input
            suffix={<SearchOutlined />}
            onChange={(e) => setddSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </Menu.Item>
      )}

      {/* 🔹 Column visibility checkboxes */}
      {/* <Row style={{ maxHeight: "250px", overflowY: "auto" }}>
        {checkboxes &&
          isCheckBox &&
          checkboxes.map((item, index) => (
            <Col span={24} key={index}>
              <Checkbox
                style={{ marginBottom: "8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSelectedTitles(item?.titleColumn, e.target.checked);
                  updateSelectedTitlesA(item?.titleColumn, e.target.checked);
                }}
                checked={item?.isCheck}
              >
                {item?.titleColumn}
              </Checkbox>
            </Col>
          ))}
      </Row> */}

      {/* 🔹 Dynamic filters from FilterContext */}
      {/* <Menu.Divider /> */}
      {/* <Menu.ItemGroup title={`Filters (${activePage})`}> */}
      <Menu.ItemGroup title={``}>
        <Row style={{ maxHeight: "250px", overflowY: "auto",  }}>
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
        <div className="flex justify-end mt-3 ">
          <Button size="small" className="butn secoundry-btn" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </Menu.ItemGroup>

      {/* <Menu.Divider /> */}

      {/* 🔹 Actions */}
      {!isCheckBox &&
        data &&
        Object.keys(data)?.map((key) => (
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
                onClick={() => {
                  settransferreq(true);
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
                className="d-flex align-items-baseline bg-danger"
                onClick={() => setcontactDrawer(!contactDrawer)}
              >
                Assign IRO
              </div>
            ) : key === "Career Break" ? (
              <div
                className="d-flex align-items-baseline"
                onClick={() => {
                  setcareerBreak(!careerBreak);
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
                onClick={async () => {
                  await getProfile(record, index);
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
                onClick={async () => {
                  await getProfile(record, index);
                  setisDrawerOpen(true);
                }}
              >
                <LuSmartphoneNfc
                  style={{
                    fontSize: "12px",
                    marginRight: "10px",
                    color: "#45669d"
                  }}
                />
                Change Category
              </div>
            ) : (
              key
            )}
          </Menu.Item>
        ))}
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
        overlayStyle={{ width: 220, padding: "0px", height:'35px' }}
      >
        <Button
          // className={` gray-btn butn ${vertical ? "gray-btn butn" : "transparent-bg p-0"}`}
          style={{backgroundColor:'#091e420a', borderRadius:'4px', height:'32px',border:'none', fontWeight:'500',marginLeft:'8px' }}
        >
          {title}
        </Button>
      </Dropdown>

      {/* Drawers */}
      <TransferRequests
        open={transferreq}
        onClose={() => settransferreq(false)}
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
