import React from "react";
import { useLocation } from "react-router-dom";
import { Table, Space, Button, Pagination, Select, Dropdown, Menu } from "antd";
import { CiEdit } from "react-icons/ci";
import { FiDelete } from "react-icons/fi";
import { tableData } from "../../Data";
import { LuRefreshCw } from "react-icons/lu";
import { MdOutlineSettingsInputComponent } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { PiSlidersHorizontalBold } from "react-icons/pi";

import MyDeatails from "../../component/common/MyDeatails";

function ProfileDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
      <div className="">
       <MyDeatails />
      </div>
    );
  }

export default ProfileDetails
