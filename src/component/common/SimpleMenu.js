import { useState, useEffect, useRef } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaTrashAlt } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { GrView } from "react-icons/gr";
import QRCode from 'qrcode';
import { LuSmartphoneNfc } from "react-icons/lu";
import { useTableColumns } from "../../context/TableColumnsContext "; // Import the context
import ExportCSV from "./ExportCSV";
import ExportPDF from "./ExportPDF";
import { MdOutlineLocalPrintshop } from "react-icons/md";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { FaUserAltSlash } from "react-icons/fa";
import { Navigate, useLocation } from "react-router-dom";
import TransferRequests from "../TransferRequests";
import CareerBreakDrawer from "../CareerBreakDrawer";
import ChangeCategoryDrawer from "../details/ChangeCategoryDrawer";


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
  const [transferreq, settransferreq] = useState(false)
  const [careerBreak, setcareerBreak] = useState(false)
    const [isDrawerOpen, setisDrawerOpen] = useState(false)
  const location = useLocation
  const screenName = location?.state?.search
  const [ddSearch, setddSearch] = useState("")
  const { updateSelectedTitles, searchFilters, gridData, globleFilters, getProfile, ProfileDetails } = useTableColumns();

  useEffect(() => {
    if (ddSearch != "") {
      searchInFilters(ddSearch);
    }
  }, [ddSearch]);
  const updateSelectedTitlesA = (title, isChecked) => {
    setCheckboxes((prevProfile) => {
      return prevProfile.map((item) => {
        if (item.titleColumn === title) {
          return { ...item, isSearch: isChecked };
        }
        return item;
      });
    });
  };
  useEffect(() => {
    setCheckboxes(globleFilters)
  }, [globleFilters])
  const searchInFilters = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    const filteredResults = searchFilters[screenName]?.filter((item) =>
      item.titleColumn.toLowerCase().includes(normalizedQuery)
    );
    setCheckboxes(filteredResults);
  };
  // The QR code value could come from NFC data; here we use a static example.
  const [qrValue] = useState("Hello NFC");
  // Reference to the wrapper element containing the QR code SVG.
  const qrRef = useRef(null);
  /**
  * Simulates the creation of an NFC tag object for testing purposes.
  * @param {Array} records - An array of record objects, each should include:
  *                          - recordType: A string (e.g., "text", "url").
  *                          - data: The payload data (e.g., a string).
  *                          - (Optional) mediaType: MIME type for the data.
  * @returns {Object} A simulated NFC tag object.
  */
  function createTestNFCTag(records = []) {
    const simulatedTag = {
      id: 'test-tag-' + Math.floor(Math.random() * 10000), // Generates a random ID
      records: records.map(record => ({
        recordType: record.recordType,
        RegNo: record.data,
        // mediaType: record.mediaType || 'text/plain'
      })),
      timestamp: Date.now()
    };

    return simulatedTag;
  }
  const handleGenerate = () => {
    // Example records; adjust or modify as needed.
    const tag = createTestNFCTag([
      { recordType: "text", data: ProfileDetails?.regNo },
    ]);
    // For demonstration, we show the tag data in an alert.
    alert("Generated NFC Tag:\n" + JSON.stringify(tag, null, 2));
  };
  const downloadQRCode = async () => {
    try {
      const qrText = "Hello NFC"; // Replace with your desired data
      // Generate a data URL for the QR code as a PNG image
      const url = await QRCode.toDataURL(qrText, { type: 'image/png' });
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };
  // The three-dots menu (top-right and grid) and actions like "Add Filter" or "Add Column"
  // are handled based on props passed to this component.
  // This separation allows better control and reuse, 

  const menu = (
    <Menu>
      {isCheckBox && (
        <Menu.Item key="1">
          <Input
            suffix={<SearchOutlined />}
            onChange={(e) => {
              setddSearch(e.target.value)
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Menu.Item>
      )}
      <Row style={{ maxHeight: "300px", overflowY: "auto" }}>
        {checkboxes &&
          isCheckBox &&
          checkboxes?.map((item, index) => (
            <Col span={24} key={index}>
              <Checkbox
                style={{ marginBottom: "8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  updateSelectedTitles(item?.titleColumn, e.target.checked);
                  updateSelectedTitlesA(item?.titleColumn, e.target.checked)
                }}
                checked={item?.isCheck}
              >
                {item?.titleColumn}
              </Checkbox>
            </Col>
          ))}
      </Row>
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
                    color: "#45669d",
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
                    color: "#45669d",
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
                    color: "#45669d",
                  }}

                />
                View
              </div>
            ) : key === "Export CSV" ? (
              <div className="d-flex align-items-baseline">
                <ExportCSV data={gridData} filename="my-data.csv" />

              </div>
            ) : key === "Print Label" ? (
              <div className="d-flex align-items-baseline">
                <MdOutlineLocalPrintshop style={{
                  fontSize: "12px",
                  marginRight: "10px",
                  color: "#45669d",
                }} />
                Print Label
              </div>
            ) : key === "Export PDF" ? (
              <div className="d-flex align-items-baseline">
                {/* <ExportCSV data={gridData} filename="my-data.csv" /> */}
                <ExportPDF data={gridData} filename="my-data.pdf" />

              </div>
            ) :

              key === 'Transfer Requests' ? (
                <div className="d-flex align-items-baseline bg-danger" onClick={() => {
                  settransferreq(true)
                  getProfile(record, index)

                }}>
                  <FaRegArrowAltCircleRight style={{
                    fontSize: "12px",
                    marginRight: "10px",
                    color: "#45669d",
                  }} />
                  Transfer Request
                </div>
              ) :
                key === 'Career Break' ? (
                  <div className="d-flex align-items-baseline" onClick={() => {
                    setcareerBreak(!careerBreak)
                    getProfile(record, index)
                  }}>
                    <FaUserAltSlash
                      style={{
                        fontSize: "12px",
                        marginRight: "10px",
                        color: "#45669d",
                      }}
                    />
                    Career Break
                  </div>
                ) :
                  key === 'Generate NFC tag' ? (
                    <div className="d-flex align-items-baseline" onClick={async () => {
                      await getProfile(record, index);
                      handleGenerate();
                    }}>
                      <LuSmartphoneNfc
                        style={{
                          fontSize: "12px",
                          marginRight: "10px",
                          color: "#45669d",
                        }}
                      />
                      Generate NFC tag
                    </div>
                  ) :
                  key === 'Change Category' ? (
                    <div className="d-flex align-items-baseline" onClick={async () => {
                      await getProfile(record, index);
                      setisDrawerOpen(true);
                    }}>
                      <LuSmartphoneNfc
                        style={{
                          fontSize: "12px",
                          marginRight: "10px",
                          color: "#45669d",
                        }}
                      />
                      Change Category
                    </div>
                  ) :
                    key === 'Roster' ?
                      <div className="d-flex align-items-baseline" onClick={() => {

                      }}>

                      </div>
                      :

                      (
                        key
                      )}
          </Menu.Item>
        ))}
    </Menu>
  );

  const [formData, setFormData] = useState({
    currentWorkLocation: '',
    currentBranch: '',
    currentDescription: '',
    currentRegion: '',
    newWorkLocation: '',
    newBranch: '',
    newDescription: '',
    newRegion: '',
    transferDate: '',
    memo: ''
  });

  const [errors, setErrors] = useState({});
  return (
    <>

      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomLeft"
        overlayStyle={{ width: 200, padding: "0px" }}
      >
        <Button className={` ${vertical == true ? "gray-btn butn" : "transparent-bg p-0"}`}>{title}</Button>

      </Dropdown>
      {formData && (
        <TransferRequests
          open={transferreq}
          onClose={() => settransferreq(false)}
          isSearch={false}
          formData={formData}
          handleChange={(field, value) =>
            setFormData(prev => ({ ...prev, [field]: value }))
          }
          errors={errors}
        />
      )}
      <CareerBreakDrawer open={careerBreak} onClose={() => setcareerBreak(!careerBreak)} />
        <ChangeCategoryDrawer
                open={isDrawerOpen}
                onClose={() => setisDrawerOpen(false)}
                isProfileDetails={false}
                // currentCategory={profileData?.currentCategory}
                // newCategory={formData?.newCategory}
                // onNewCategoryChange={(value) =>
                //   setFormData(prev => ({ ...prev, newCategory: value }))
                // }
                // onAccept={handleAccept}
                // onReject={handleReject}
              />
    </>
  );
}

export default SimpleMenu;
