import { useState, React } from "react";
import { useLocation } from "react-router-dom";
import {
  RightOutlined,
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Input, Button } from "antd";
import MySelect from "./MySelect";
import SideNav from "./SideNav";
import { FaLess } from "react-icons/fa";
import MyDrowpDown from "./MyDrowpDown";
import { SerachFitersLookups } from "../../Data";
import { SearchOutlined } from "@ant-design/icons";

function HeaderDetails() {
  const { Search } = Input;
  const location = useLocation();
  const currentURL = `${location?.pathname}`;
  const nav = location?.pathname || "";
  const formattedNav = nav.replace(/^\//, "");
  console.log(location?.key, "123");
  console.log(typeof nav);
  const [isSideNav, setisSideNav] = useState(true);

  const mriatalStatus = [
    {
      label: "Single",
      key: "1",
    },
    {
      label: "Married",
      key: "2",
    },
    {
      label: "Seperated",
      key: "3",
    },
    {
      label: "Divorced",
      key: "4",
    },
  ];
  const SubscriptionsLookups1 = [
    {
      label: "Single",
      key: "1",
    },
    {
      label: "Married",
      key: "2",
    },
    {
      label: "Seperated",
      key: "3",
    },
    {
      label: "Divorced",
      key: "4",
    },
  ];
  const Gender = [
    {
      key: "1",
      label: "Male",
    },
    {
      key: "2",
      label: "Female",
    },
    {
      key: "3",
      label: "Other",
    },
  ];
  const [selectedValue, setSelectedValue] = useState(null);

  const handleChange = (value) => {
    setSelectedValue(value);
  };
  const SubscriptionsLookups = [];
  SerachFitersLookups?.SubscriptionsLookups.map((item) => {
    let obj = {
      key: item?.key,
      label: item?.label,
    };
    SubscriptionsLookups.push(obj);
  });
  return (
    <div className="details-header d-flex w-100%">
      <div style={{ width: "100%" }}>
        <div className="d-flex ">
          <p className="bred-cram-main">
            {(location?.key == "default" && nav == "/") || nav == "/"
              ? `Profile / Main`
              : ` ${location?.state?.search}  / ${formattedNav}`}
          </p>
        </div>
        <div className="search-main">
          <div className="title d-flex justify-content-between">
            <h2 className="title-main">
              {nav == "/" && location?.state == null
                ? `Profile  /  Details`
                  ? nav == "/"
                  : `${location?.state?.search} /  Details`
                : ` ${location?.state?.search}${formattedNav}`}
            </h2>
            <div>
              <Button className="me-1 gray-btn butn">Export</Button>
              <Button className="me-1 gray-btn butn">Share</Button>
              <Button className="me-1 gray-btn butn">DETAILS VIEW</Button>
              <Button className="me-1 gray-btn butn">LIST VIEW</Button>
            </div>
          </div>
          <div className="d-flex search-fliters">
            <Input
              placeholder="Search..."
              style={{ width: "15%" }}
              suffix={<SearchOutlined />}
            />
            <MySelect
              placeholder={"Gender"}
              className="margin"
              options={Gender}
            />
            <MySelect placeholder={"Partnership"} options={mriatalStatus} />
            <Input
              placeholder="Search by name"
              type="search"
              style={{ width: "12.5%" }}
              className="margin"
            />
            <Input
              type="search"
              style={{ width: "12.5%" }}
              className="margin"
            />
            <Input
              type="search"
              style={{ width: "12.5%" }}
              className="margin"
            />
            <MySelect
              placeholder={"Subscriptions"}
              options={SubscriptionsLookups}
            />
            {/* <MySelect placeholder={"Project"} className="margin" />
        <MySelect placeholder={"Project"} className="margin" />
        <MySelect placeholder={"Assignee"} className="margin" />
        <Button className='margin'>
            More <PlusOutlined />
        </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderDetails;
