import React, { useState } from "react";
import {
  Drawer,
  Button,
  Tabs,
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Modal
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Checkbox from "antd/es/checkbox/Checkbox";
import ReminderSubCard from "./ReminderSubCard";
import MyMenu from "../common/MyMenu";
import { BsFiletypeXls } from "react-icons/bs";
import CustomSelect from "../common/CustomSelect";
import { useReminders } from "../../context/CampaignDetailsProvider";
const { TabPane } = Tabs;

const BatchDrawer = ({ open, onClose, isDisable = false }) => {


  return (
    <Drawer
      title="Batch Management"
      width={1200}
      open={open}
      onClose={onClose}
      extra={
        <Button className="btun primary-btn" disabled={isDisable}>
          Trigger Batch
        </Button>
      }
    >
     
    </Drawer>
  );
};

export default BatchDrawer;
