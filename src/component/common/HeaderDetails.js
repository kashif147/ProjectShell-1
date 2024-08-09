import { useState, React } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { BsThreeDots } from "react-icons/bs";


function HeaderDetails() {
  const { Search } = Input;
  const location = useLocation();
  const currentURL = `${location?.pathname}`;
  const nav = location?.pathname || "";
  const formattedNav = nav.replace(/^\//, "");

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
    <div className="details-header d-flex w-100% overflow-hidden">
      <div style={{ width: "100%" }}>
        <div className="d-flex ">
          <p className="bred-cram-main">
            {(location?.key == "default" && nav == "/") || nav == "/"
              ? `Profile / Main`
              : ` ${location?.state?.search}  / ${formattedNav}`}
          </p>
        </div>
        <div className="search-main">
          <div className="title d-flex justify-content-between ">
            <h2 className="title-main">
              {nav == "/" && location?.state == null
                ? `Profile`
                : ` ${location?.state?.search}`}
            </h2>
            <div>
              <Button className="me-1 gray-btn butn">Export</Button>
              <Button className="me-1 gray-btn butn">Share</Button>
              <Button className="me-1 gray-btn butn">DETAILS VIEW</Button>
              <Button className="me-1 gray-btn butn">LIST VIEW</Button>
              <Button className="me-1 gray-btn butn">
              <BsThreeDots />
              </Button>
            </div>
          </div>
          <div className="d-flex search-fliters align-items-baseline">
            <Input
              placeholder="Search..."
              style={{ width: "13%", height:"29px" }}
              suffix={<SearchOutlined />}
            />
            <Input
              placeholder="Postal Code"
              style={{ width: "13%", height:"29px" }}
              className="margin"
            />
            <MySelect
              style={{ width: "300px" }}
              placeholder={"Gender"}
              className="margin"
              options={Gender}
            />
            <MySelect placeholder={"Partnership"} options={mriatalStatus} />
            <MySelect
              placeholder={"Subscriptions"}
              options={SubscriptionsLookups}
            />
            <div className="last-chalid-search-filter">
              <MySelect
                placeholder={"Subscriptions"}
                options={SubscriptionsLookups}
              />
              <Button className="margin gray-btn search-fliters-btn " style={{fontSize:"12px"}}>More <PlusOutlined  /></Button>
            </div>
            <Link className="link" style={{ color: "#333333" }}>
              Reset
            </Link>
            <Link className="link">Save fliter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderDetails;
