import React, { useEffect, useState } from "react";
import {
  Menu,
  Dropdown,
  Button,
  Select,
  Divider,
  Checkbox,
  Row,
  Col,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import MySelect from "./MySelect";
import { useTableColumns } from "../../context/TableColumnsContext ";

const JiraLikeMenu = ({ title, data, isSimple = false }) => {
  const { state, updateState } = useTableColumns();
  console.log(state,"state")
  const menuState = state[title] || {
    selectedOption: "!=",
    checkboxes: data || {},
  };

  const [trueKeys, setTrueKeys] = useState([]);

  const handleSelectChange = (value) => {
    updateState(title, {
      ...menuState,
      selectedOption: value,
    });
  };

  const checkboxChangeFtn = (key, event) => {
    const updatedCheckboxes = {
      ...menuState.checkboxes,
      [key]: event.target.checked,
    };

    const newTrueKeys = Object.entries(updatedCheckboxes)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    setTrueKeys(newTrueKeys);
    updateState(title, {
      ...menuState,
      checkboxes: updatedCheckboxes,
    });
  };

  useEffect(() => {
    updateState(title, {
      ...menuState,
      checkboxes: data || {},
    });
  }, [data]);

  const graterEqualDD = [
    { key: "!=", label: "!= (not equal)" },
    { key: "=", label: "= (equal)" },
  ];

  const menu = (
    <Menu>
      <Menu.Item key="1">
        {isSimple == false && (
          <>
            <MySelect
               isMenu={true}
               options={graterEqualDD}
               value={menuState.selectedOption}
               onChange={handleSelectChange}
            />
            <Divider />
          </>
        )}
        <Row>
          {data &&
            Object.keys(data).map((key) => (
              <Col span={24} key={key}>
                <Checkbox
                  style={{ marginBottom: "8px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    checkboxChangeFtn(key, e);
                  }}
                  checked={menuState.checkboxes[key]}
                >
                  {key}
                </Checkbox>
              </Col>
            ))}
        </Row>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="searchfilter- margin">
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomLeft"
        overlayStyle={{ width: 300, padding: "0px" }}
      >
        {isSimple == false ? (
          <Button className={`${trueKeys?.length > 0 ? "active" : ""}`}>
            {title} {trueKeys?.length == 0 && <DownOutlined />}
          </Button>
        ) : (
          <Button>{title}</Button>
        )}
      </Dropdown>
      {trueKeys?.length > 0 && (
        <MySelect
        className="active"
        options={graterEqualDD}
        value={menuState.selectedOption}
        onChange={handleSelectChange}
        />
      )}
      {trueKeys?.length > 0 && (
        <Dropdown
          overlay={menu}
          trigger={["click"]}
          placement="bottomRight"
          overlayStyle={{ width: 300, padding: "0px" }}
        >
          <Button className="">
            <span className="ml-4 active"> {trueKeys[0]} </span>
            <DownOutlined className="ml-4 active" />
          </Button>
        </Dropdown>
      )}
    </div>
  );
};

export default JiraLikeMenu;