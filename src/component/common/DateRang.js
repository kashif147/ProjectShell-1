import React from "react";
import {
  Dropdown,
  Menu,
  Input,
  Row,
  Col,
  Checkbox,
  Button,
  DatePicker,
} from "antd";
import MySelect from "./MySelect";
import { DownOutlined } from "@ant-design/icons";
// import { width } from "@mui/system";
const { RangePicker } = DatePicker;
const onOk = (value) => {
  console.log("onOk: ", value);
};
const data = [
  { key: "Comming week", label: "Comming week" },
  { key: "Two weeks", label: "Two weeks" },
  { key: "Three weeks", label: "Three weeks" },
];
function DateRang({ title }) {
  const onChange = (date, dateString) => {
    console.log(date, dateString);
  };
  const menu = (
    <Menu>
      <Menu.Item key="1">
        <div className="d-flex flex-column">
          <Checkbox
            className="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            In next
          </Checkbox>
          <MySelect
            options={data}
            placeholder="Please select"
           
          />
        </div>
      </Menu.Item>
      <Menu.Item key="1">
        <div className="d-flex flex-column align-items-baseline">
          <Checkbox
            className="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Between
          </Checkbox>
          <div className="d-flex align-items-baseline">
            <DatePicker />
            <h4 style={{ fontSize: "14px",marginInline:"10px" }}>and</h4> <DatePicker />
          </div>
        </div>
      </Menu.Item>
    </Menu>
  );
  return (

    <Dropdown
      overlay={menu}
      trigger={["click"]}
      placement="bottomLeft"
      overlayStyle={{ width: 500, padding: "0px" }}
    >
        <div className="searchfilter- margin">
      <Button className=" ">{title} <DownOutlined /></Button>
      
        </div>
    </Dropdown>
  );
}

export default DateRang;
