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
import { useSearchFilters } from "../../context/SearchFilterContext";

function SimpleMenu({ title, data, checkbox = true, isSearched=true, isTransparent=false }) {
  
  const { trueKeys, setTrueKeys,checkboxes, setCheckboxes } = useSearchFilters();

  useEffect(() => {
    if (data) {
      const initialCheckboxes = Object.keys(data).reduce((acc, key) => {
        acc[key] = checkboxes[key] ?? true; // Use global state or default to true
        return acc;
      }, {});

      // Only update if there's a difference
      const isDifferent = Object.keys(initialCheckboxes).some(
        key => checkboxes[key] !== initialCheckboxes[key]
      );

      if (isDifferent) {
        setCheckboxes(prevState => ({
          ...prevState,
          ...initialCheckboxes,
        }));
      }
    }
  }, [data, checkboxes, setCheckboxes]);

  const checkboxChangeFtn = (key, event) => {
    const isChecked = event.target.checked;
    setCheckboxes(prevState => ({
      ...prevState,
      [key]: isChecked,
    }));
  };
  console.log(trueKeys,"trueKeys")

  const menu = (
    <Menu>
    { isSearched==true && <Menu.Item key="1">
        <>
          <Input suffix={<SearchOutlined />} />
        </>
      </Menu.Item>}

      {data &&
  Object.keys(data).map((key) => (
    <Col span={24} className="menu-item" key={key}>
      {checkbox ? (
        <Checkbox
          style={{ marginBottom: "8px" }}
          onClick={(e) => {
            e.stopPropagation();
            checkboxChangeFtn(key, e);
          }}
          checked={checkboxes?.[key]} // Use the global state to determine if it's checked
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
