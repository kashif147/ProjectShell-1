
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

const JiraLikeMenu = ({ title, data, isSimple=false }) => {
  console.log(data, "data");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [selectedOption, setSelectedOption] = useState("!=");
  const [checkboxes, setCheckboxes] = useState();
 
  const [trueKeys, setTrueKeys] = useState([]);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectChange = (value) => {
    setSelectedOption(value);
  };
  const handleDropdownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const graterEqualDD = [
    {
      key: "!=",
      label: "!= (not equal)",
    },
    {
      key: "=",
      label: "= (equal)",
    },
  ];

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
        {
          isSimple==false && 
          <>
          <MySelect
            isMenu={true}
            options={graterEqualDD}
            defaultValue={graterEqualDD?.key == "!="}
            value={selectedOption}
            onChange={(e) => setSelectedOption(e)}
          />
          <Divider />
          </>
        }
        <Row>
          {data != null &&
            Object.keys(data)?.map((key) => (
              <Col span={24}>
                <Checkbox
                style={{marginBottom:"8px"}}
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
        {
          isSimple==false?
        <Button className={`${trueKeys?.length > 0 ? "active" : ""}`}>
          {title} {trueKeys?.length == 0 && <DownOutlined />}
        </Button>
        :
        <Button >
          {title} 
        </Button>
        }
      </Dropdown>
      {trueKeys?.length > 0 && (
        <MySelect
          className="active"
          options={graterEqualDD}
          value={selectedOption}
          onChange={(e) => setSelectedOption(e)}
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
