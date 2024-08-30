import { React, useState, useEffect } from "react";
import {
  Dropdown,
  Menu,
  Input,
  Divider,
  Button,
  Row,
  Col,
  Checkbox,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";

function SimpleMenu({ title, data }) {
  const [checkboxes, setCheckboxes] = useState({});
  const [selectedValues, setSelectedValues] = useState({ checkboxes: {}, searchValue: "" });

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
    setCheckboxes(data);
    setSelectedValues((prevValues) => ({
      ...prevValues,
      checkboxes: data || {},
    }));
  }, [data]);
  const handleSearchChange = (event) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      searchValue: event.target.value,
    }));
  };
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <>
          <Input suffix={<SearchOutlined />} />
        </>
      </Menu.Item>
      <Row>
        {data != null &&
          Object.keys(data)?.map((key) => (
            <Col span={24}>
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
    </Menu>
  );
  return (
    <div>
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomLeft"
        overlayStyle={{ width: 200, padding: "0px" }}
      >
        <Button className="transparent-bg">{title}</Button>
      </Dropdown>
    </div>
  );
}

export default SimpleMenu;
