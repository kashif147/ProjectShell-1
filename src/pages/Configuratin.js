import { React, useState } from "react";
import { SiActigraph } from "react-icons/si";
import MyDrawer from "../component/common/MyDrawer";
import { Input, Table } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import MyMneu from "../component/common/MyMneu";
import {
  Edit as EditIcon,
  Archive as ArchiveIcon,
  FileCopy as FileCopyIcon,
  MoreHoriz as MoreHorizIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { Button, Menu, MenuItem, Divider } from "@mui/material";
import MySelect from "../component/common/MySelect";
import {SerachFitersLookups} from '../Data'

function Configuratin() {
  const [genderModal, setgenderModal] = useState(false);
  const [AddgenderModal, setAddgenderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("buttonLabel");
  const [modaltitle, setmodaltitle] = useState(null);
  const [ModalPartnership, setPartnershipModal] = useState(false);
  const [AddModalPartnership, setAddPartnershipModal] = useState(false);
  const column = [
    {
      title: "Lookup",
      dataIndex: "Lookup",
      key: "Lookup",
      width: 60,
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
    },
  ];
  const gander = [
    {
      key: "1",
      Lookup: "Male",
      Description: "Male",
    },
    {
      key: "2",
      Lookup: "Female",
      Description: "Female",
    },
    {
      key: "3",
      Lookup: "Other",
      Description: "Other",
    },
  ];
  const genderModalOpen = () => {
    setgenderModal(!genderModal);
  };
  const addGenderModalOpen = () => {
    setAddgenderModal(!AddgenderModal);
  };

  const PartnershipModalOpen = () => {
    setPartnershipModal(!ModalPartnership);
  };

  const addPartnershipModalOpen = () => {
    setAddPartnershipModal(!AddModalPartnership);
  };

  const menuItems = [
    { icon: <EditIcon />, text: "Edit" },
    { icon: <FileCopyIcon />, text: "Duplicate" },
    { divider: true },
    { icon: <ArchiveIcon />, text: "Archive" },
    { icon: <MoreHorizIcon />, text: "More" },
  ];
  const [anchorEl, setAnchorEl] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = () => {
    setAnchorEl(!anchorEl)
  };

  const handleClose = () => {
    setAnchorEl(!anchorEl)
  };
  const handleMenuItemClick = (item) => {
    setSelectedItem(item.text); // Update the selected item
    handleClose();
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
    <div>
      <p className="configuratin-titles">Lookups Configuration</p>
      <div className="lookups-main-continer">
        <div onClick={() => genderModalOpen()} className="lookup-memeber">
          <SiActigraph className="icons" />
          <p className="lookups-title">Gender</p>
        </div>
        <div onClick={() => PartnershipModalOpen()}>
          <PiHandshakeDuotone className="icons" />
          <p className="lookups-title">Partnership</p>
        </div>
        
        <MyMneu
          buttonLabel={selectedItem}
          aria-controls={open ? "customized-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          variant="contained"
          disableElevation
          onClick={handleClick}
          endIcon={<KeyboardArrowDownIcon />}
        >
          {/* {menuItems?.map((item, index) => (
            <div key={index}>
              <MenuItem onClick={() => {handleMenuItemClick(item) 
                handleClose()}}  disableRipple>
                {item.icon}
                {item.text}
              </MenuItem>
              {item.divider && <Divider />}
            </div>
          ))} */}
              <MenuItem >
              <div className="d-flex flex-column">
              <MySelect options={SubscriptionsLookups} />
              <MySelect options={SubscriptionsLookups} />

              </div>
              </MenuItem>
        </MyMneu>
      </div>
      <MyDrawer
        open={genderModal}
        onClose={genderModalOpen}
        add={addGenderModalOpen}
      >
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        <Table
          columns={column}
          dataSource={gander}
          pagination={false}
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />
      </MyDrawer>
      <MyDrawer open={AddgenderModal} onClose={addGenderModalOpen}>
        <div className="input-group">
          <p>Lookup</p>
          <Input placeholder="Please Enter Lookups" />
        </div>
        <div className="input-group">
          <p>Description</p>
          <TextArea placeholder="Please Enter Description" />
        </div>
      </MyDrawer>

      {/* Partnership */}
      <MyDrawer
        open={ModalPartnership}
        onClose={PartnershipModalOpen}
        add={addPartnershipModalOpen}
      >
        <div className="input-group">
          <p>Lookup</p>
          <Input placeholder="Please Enter Lookups" />
        </div>
        <div className="input-group">
          <p>Description</p>
          <TextArea placeholder="Please Enter Description" />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        <Table
          columns={column}
          dataSource={gander}
          pagination={false}
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />
        <MyDrawer open={AddModalPartnership} onClose={addPartnershipModalOpen}>
          <div className="input-group">
            <p>Lookup</p>
            <Input placeholder="Please Enter Lookups" />
          </div>
          <div className="input-group">
            <p>Description</p>
            <TextArea placeholder="Please Enter Description" />
          </div>
        </MyDrawer>
      </MyDrawer>
    </div>
  );
}

export default Configuratin;
