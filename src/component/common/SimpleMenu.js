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

function SimpleMenu({ title, data, checkbox = true, isSearched=true, isTransparent=false }) {
  const [checkboxes, setCheckboxes] = useState();
  console.log(checkboxes, "132");
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
  useEffect(() => {
    setCheckboxes(data);
  }, [data]);
  const menu = (
    <Menu>
    { isSearched==true && <Menu.Item key="1">
        <>
          <Input suffix={<SearchOutlined />} />
        </>
      </Menu.Item>}

      {data != null &&
        Object.keys(data)?.map((key) => (
          <Col span={24} className="menu-item">
            {checkbox ? (
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
            ) : (
              <h1 className="without-checkbox">{key}</h1>
            )}
          </Col>
        ))}
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
        
          
            <Button style={{ width: "100%", border: '1px solid #333333',borderRadius:"3px" }} className={`${isTransparent?"transparent-bg":"gray-btn"} butn`}>{title}</Button>
        
       
      </Dropdown>
    </div>
  );
}

export default SimpleMenu;
