import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaTrashAlt } from "react-icons/fa";
import { ImAttachment } from "react-icons/im";
import { GrView } from "react-icons/gr";

function SimpleMenu({
  title,
  data,
  isCheckBox = true,
  actions,
  isBtn = false,
}) {
  const [checkboxes, setCheckboxes] = useState({});
  const [selectedValues, setSelectedValues] = useState({
    checkboxes: {},
    searchValue: "",
  });

  const checkboxChangeFtn = (key, event, width) => {
    const updatedCheckboxes = {
      ...checkboxes,
      [key]: event.target.checked,
      width:width
    };
    setCheckboxes(updatedCheckboxes);

    setSelectedValues((prevValues) => ({
      ...prevValues,
      checkboxes: updatedCheckboxes,
    }));
  };

  useEffect(() => {
    if (data) {
      setCheckboxes(data);
      setSelectedValues((prevValues) => ({
        ...prevValues,
        checkboxes: data || {},
      }));
    }
  }, [data]);

  const handleSearchChange = (event) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      searchValue: event.target.value,
    }));
  };

  const menu = (
    <Menu>
      {isCheckBox && (
        <Menu.Item key="1">
          <Input suffix={<SearchOutlined />} onChange={handleSearchChange} />
        </Menu.Item>
      )}
      <Row>
        {data &&
          isCheckBox &&
          Object.keys(data)?.map((key) => (
            <Col span={24} key={key}>
              <Checkbox
                style={{ marginBottom: "8px" }}
                onClick={(e) => {
                  e.stopPropagation();
                  checkboxChangeFtn(key, e,70);
                }}
                checked={checkboxes?.[key]}
              >
                {key}
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
    <FaTrashAlt style={{fontSize: "12px", marginRight: "10px"}} /> 
    Delete
  </div>
) 
: key === "Attached" ? (
  <div className="d-flex align-items-baseline">
    <ImAttachment   style={{fontSize: "12px", marginRight: "10px",fontWeight:"500"}} /> 
    Attached
  </div>
) :
 key === "View" ? (
  <div className="d-flex align-items-baseline">
    <GrView   style={{fontSize: "12px", marginRight: "10px", }} /> 
    View
  </div>
) : 
(
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
