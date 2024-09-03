import React, { useState, useEffect } from "react";
import { Dropdown, Menu, Input, Row, Col, Checkbox, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";

function SimpleMenu({ title, data, isCheckBox = true, actions, }) {
  const [checkboxes, setCheckboxes] = useState({});
  const [selectedValues, setSelectedValues] = useState({
    checkboxes: {},
    searchValue: "",
  });

  const checkboxChangeFtn = (key, event) => {
    const updatedCheckboxes = {
      ...checkboxes,
      [key]: event.target.checked,
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
                  checkboxChangeFtn(key, e);
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
          <Menu.Item key={key} onClick={(e)=>actions(e)}>
            {key}
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