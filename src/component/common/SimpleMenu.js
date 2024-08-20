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
  const [checkboxes, setCheckboxes] = useState();
  const [trueKeys, setTrueKeys] = useState([]);
  const checkboxChangeFtn = (key, event) => {
    setCheckboxes((prevState) => {
      const updatedState = {
        ...prevState,
        [key]: event.target.checked,
      };
      const newTrueKeys = Object.entries(updatedState)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      setTrueKeys(newTrueKeys);
      return updatedState;
    });
  };
  useEffect(()=>{
    setCheckboxes(data)
  },[data])
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
      {/* <Menu.Item key="2">
            <>
           <Input suffix={<SearchOutlined />} />
              <Divider />
            </>
          </Menu.Item>
          <Menu.Item key="3">
            <>
           <Input suffix={<SearchOutlined />} />
              <Divider />
            </>
          </Menu.Item> */}
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
        <Button>{title}</Button>
      </Dropdown>
    </div>
  );
}

export default SimpleMenu;
