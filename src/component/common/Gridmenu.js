import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";

function Gridmenu({ title, screenName, setColumnsDragbe, columnsForFilter, setColumnsForFilter }) {
  const { columns, updateColumns, handleCheckboxFilterChange } =
    useTableColumns();
  const handleChange = (title, checked, screen, width, e) => {
    const filtered_columns = columnsForFilter.map(col => {
      if (col.title === title) {
        col.isGride = checked;
        return col;
      }
      return col;
    });
    setColumnsForFilter(filtered_columns);
    const newData = filtered_columns.filter(col => col.isGride);
    setColumnsDragbe(newData);

    // Update global context
    handleCheckboxFilterChange(title, checked, screen, width);
  }
  const [checkBoxData, setcheckBoxData] = useState();
  useEffect(() => {
    setcheckBoxData(columns?.[screenName]);
  }, [columns]);
  const widthMapping = {
    RegNo: 100,
    Name: 120,
    Rank: 140,
    Duty: 100,
    Station: 120,
    Distric: 120,
    Division: 120,
    Address: 220,
  };

  const getColumnWidth = (key) => widthMapping[key] || 120;

  const searchInFilters = (query) => {

    const normalizedQuery = query.trim().toLowerCase();

    const filteredResults = columnsForFilter?.map((item) => {
      // Create a new object based on the condition
      return {
        ...item, // Spread existing properties
        isVisible: item.title.toLowerCase().includes(normalizedQuery), // Set isVisible based on the condition
      }
    }

    );
    // console.log(filteredResults, "//"); 
    setColumnsForFilter(filteredResults);

  };
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Input suffix={<SearchOutlined />} onClick={(e) => e.stopPropagation()} onChange={(e) => searchInFilters(e.target.value)} />
      </Menu.Item>
      <Row style={{ maxHeight: "200px", overflowY: "auto" }}>
        {columnsForFilter?.map((col) =>
          col.isVisible && (
            <Col span={24} key={col.key || col.title || col.dataIndex}>
              <Checkbox
                style={{ marginBottom: "8px" }}
                onChange={(e) => {
                  handleChange(
                    col?.title,
                    e.target.checked,
                    screenName,
                    col?.width,
                    e
                  );
                }}
                onMouseDown={(e) => e.stopPropagation()} // Stop menu closure on click
                checked={col.isGride}
              >
                {col?.title}
              </Checkbox>
            </Col>
          ))}
      </Row>
    </Menu>
  );
  return (
    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomLeft"
      overlayStyle={{ width: 200, padding: "0px" }}
    >
      <Button className="transparent-bg">{title}</Button>
    </Dropdown>
  );
}
export default Gridmenu;
