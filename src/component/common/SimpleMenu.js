import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaTrashAlt } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { GrView } from "react-icons/gr";
import { useTableColumns } from "../../context/TableColumnsContext "; // Import the context
import ExportCSV from "./ExportCSV";
import ExportPDF from "./ExportPDF";
import { MdOutlineLocalPrintshop } from "react-icons/md";



function SimpleMenu({
  title,
  data,
  isCheckBox = true,
  actions,
  isBtn = false,
  isTable = false,
  categoryKey = "gender", // Key to save checkbox data in context, e.g., 'gender'
}) {
  const [checkboxes, setCheckboxes] = useState([]);

  const [selectedValues, setSelectedValues] = useState({
    checkboxes: {},
    searchValue: "",
  });

  const [ddSearch, setddSearch] = useState("")
  const { updateState, state, updateSelectedTitles, searchFilters, gridData } = useTableColumns();
  useEffect(() => {
    searchInFilters(ddSearch);
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
  console.log(searchFilters, "searchFilters")
  const searchInFilters = (query) => {
    const normalizedQuery = query.trim().toLowerCase();

    // Filter the searchFilters array
    const filteredResults = searchFilters.filter((item) =>
      item.titleColumn.toLowerCase().includes(normalizedQuery)
    );

    console.log(filteredResults, "//"); // Log filtered results

    // Update the searchFilters state with the filtered results
    setCheckboxes(filteredResults);
  };

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
                checked={item?.isSearch}
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
              <div className="d-flex align-items-baseline">
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
            ) : (
              key
            )}
          </Menu.Item>
        ))}
    </Menu>
  );

  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomLeft"
      overlayStyle={{ width: 200, padding: "0px" }}
    >
      <Button className="transparent-bg p-0">{title}</Button>
    </Dropdown>
  );
}

export default SimpleMenu;
