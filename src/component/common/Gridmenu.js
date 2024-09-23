import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTableColumns } from "../../context/TableColumnsContext ";

function Gridmenu({ title, screenName,data, setColumnsDragbe, columnsForFilter, setColumnsForFilter }) {
  const { columns, updateColumns, handleCheckboxFilterChange } =
    useTableColumns();
    const handleChange = (e) => {
      console.log('ahmad_data', data)
      console.log('ahmad_columnsForFilter', columnsForFilter)
      
      const filtered_columns = columnsForFilter.map(col => {
        if (col.title === e){
          col.isGride = !col.isGride
          return col;
        }
        return col;
      })
      setColumnsForFilter(filtered_columns);
       const newData = columnsForFilter.filter(col => col.isGride
      )
      setColumnsDragbe(newData);
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
  // console.log(checkBoxData, "checkBoxData");
  const getColumnWidth = (key) => widthMapping[key] || 120;

  console.log(columns, "update");
  const searchInFilters = (query) => {
    // Trim and convert the query to lowercase for a case-insensitive search
    const normalizedQuery = query.trim().toLowerCase();
  
    // Filter the searchFilters array
    const filteredResults = columns[screenName]?.filter((item) =>
      item.titleColumn.toLowerCase().includes(normalizedQuery)
    );
    console.log(filteredResults, "//"); 
    setcheckBoxData(filteredResults);
  };
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Input suffix={<SearchOutlined />} onClick={(e) => e.stopPropagation() } onChange={(e)=>searchInFilters(e.target.value)} />
      </Menu.Item>
      <Row style={{ maxHeight: "200px", overflowY: "auto" }}>
        {columnsForFilter?.map((col) => (
          <Col span={24}>
            <Checkbox
              style={{ marginBottom: "8px" }}
              onClick={(e) => {
                e.stopPropagation();
                handleChange(
                  col?.title,
                  e.target.checked,
                  screenName,
                  col?.width,
                  e
                );
              }}
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
