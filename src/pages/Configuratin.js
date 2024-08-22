import { React, useState } from "react";
import { SiActigraph } from "react-icons/si";
import MyDrawer from "../component/common/MyDrawer";
import { tableData } from "../Data";
import { LuRefreshCw } from "react-icons/lu";
import { Input, Table, Pagination, Row, Col, Space } from "antd";
import TextArea from "antd/es/input/TextArea";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import { FaRegEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";

import MyMneu from "../component/common/MyMneu";
import {
  Edit as EditIcon,
  Archive as ArchiveIcon,
  FileCopy as FileCopyIcon,
  MoreHoriz as MoreHorizIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { FaEdit } from "react-icons/fa";
import MySelect from "../component/common/MySelect";
import { SerachFitersLookups } from "../Data";
import JiraLikeMenu from "../component/common/JiraLikeMenu";
import { LuCalendarDays } from "react-icons/lu";
import { PiUsersFourDuotone } from "react-icons/pi";
import { render } from "@testing-library/react";
function Configuratin() {
  const [genderModal, setgenderModal] = useState(false);
  const [testing, settesting] = useState(false);
  const [MembershipModal, setMembershipModal] = useState(false);
  const [AddMembershipModal, setAddMembershipModal] = useState(false);
  const [isSubscriptionsModal, setIsSubscriptionsModal] = useState(false);
  const [isAddSubscriptionsModal, setIsAddSubscriptionsModal] = useState(false);
  const [AddgenderModal, setAddgenderModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("buttonLabel");
  const [modaltitle, setmodaltitle] = useState(null);
  const [ModalPartnership, setPartnershipModal] = useState(false);
  const [AddModalPartnership, setAddPartnershipModal] = useState(false);
  const column = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center' , verticalAlign: 'center'}}>{text}</div>,
    },
    {
      title: "Action",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', verticalAlign: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
  ];
  const SubscriptionsColumn = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center'}}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center'}}>{text}</div>,
    },
    {
      title: "Alpha",
      dataIndex: "Alpha",
      key: "Alpha",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Beta",
      dataIndex: "Beta",
      key: "Beta",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
    render: (text) => <div style={{display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center'}}>{text}</div>,
    },

    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space 
        size="middle" 
        className="action-buttons"
        style={{ justifyContent: 'center', display: 'flex' }}
        >
          <FaEdit 
          size ={16}
          style={{ marginRight: '10px' }}
          />
          <AiFillDelete
          size ={16} 
          />
        </Space>
      ),
    },
  ];



  const gender = [
    {
      key: "1",
      ShortName: "Male",
      DisplayName: "Male",
      Alpha: "A163",
      Beta:"B762",
    },
    {
      key: "2",
      ShortName: "Female",
      DisplayName: "Female",
      Alpha: "A164",
      Beta:"B763",
    },
    {
      key: "3",
      ShortName: "Other",
      DisplayName: "Other",
      Alpha: "A165",
      Beta:"B764",
    },
  ];

  

  const genderModalOpen = () => {
    setgenderModal(!genderModal);
  };

const testingModalFtn= ()=>{
  settesting(!testing)
}

const MembershipModalFtn= ()=>{
  setMembershipModal(!MembershipModal)
}

const AddMembershipModalOpenCloseFtn = () =>{
  setAddMembershipModal(!AddMembershipModal)
}



  const subscriptionsModalOpenClosFtn = () => {
    setIsSubscriptionsModal(!isSubscriptionsModal);
  };
  const addSubscriptionsModalOpenClosFtn = () => {
    setIsAddSubscriptionsModal(!isAddSubscriptionsModal);
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

  const handleClick = (e) => {
    e.stopPropagation();
    setAnchorEl(false);
  };

  const handleClose = () => {
    setAnchorEl(!anchorEl);
  };

  const handleMenuItemClick = (item) => {
    setSelectedItem(item.text);
    handleClose();
  };

  const SubscriptionsLookups = [];
  SerachFitersLookups?.SubscriptionsLookups?.map((item) => {
    let obj = {
      key: item?.key,
      label: item?.label,
    };
    SubscriptionsLookups.push(obj);
  });

  return (
    <div className="configuration-main">
      <p className="configuratin-titles">Lookups Configuration</p>

      <Row>
        <Col
          className="hover-col"
          span={4}
          style={{
            paddingTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div onClick={() => genderModalOpen()} className="">
            <SiActigraph className="icons" />
            <p className="lookups-title">Gender</p>
          </div>
        </Col>
        <Col
          className="hover-col"
          span={4}
          style={{
            paddingTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div onClick={testingModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Partnership</p>
          </div>
        </Col>
        <Col
          className="hover-col"
          span={4}
          style={{
            paddingTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div onClick={() => subscriptionsModalOpenClosFtn()} className="">
            <LuCalendarDays className="icons" />
            <p className="lookups-title">Subscriptions</p>
          </div>
        </Col>

        <Col
          className="hover-col"
          span={4}
          style={{
            paddingTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div onClick={MembershipModalFtn}>
            <PiUsersFourDuotone className="icons" />
            <p className="lookups-title">Membership</p>
          </div>
        </Col>
        <Col
          className="hover-col"
          span={4}
          style={{
            paddingTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Dummy</p>
          </div>
        </Col>
        <Col
          className="hover-col"
          span={4}
          style={{
            paddingTop: "0.5rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div onClick={() => PartnershipModalOpen()}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Dummy</p>
          </div>
        </Col>
      </Row>
      {/* Gender */}
      <MyDrawer
        open={genderModal}
        onClose={genderModalOpen}
        add={addGenderModalOpen}
        title="Gender"
      >
        <div className="input-group">
        <div className="input-group">
            <p className="inpt-lbl">Short Name</p>
            <Input placeholder="Please enter short name" />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input placeholder="Please enter display name " />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Alpha</p>
            <Input placeholder="Please enter alpha " />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Beta</p>
            <Input placeholder="Please enter Beta " />
          </div>

          <Input
            placeholder="Search..."
            style={{ marginBottom: "5px" }}
            suffix={<SearchOutlined />}
          />
        </div>
        <Table
          columns={column}
          pagination={true}
          dataSource={gender}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />


 
      </MyDrawer>




{/*Membership modal*/}
        <MyDrawer 
          title="Membership" 
          open={MembershipModal}  
          onClose={MembershipModalFtn}
          add = {AddMembershipModalOpenCloseFtn}
          >

            
          
        
          <div className="input-group">
            <p className="inpt-lbl">Short Name</p>
            <Input placeholder="Please enter short name" />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input placeholder="Please enter display name " />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Alpha</p>
            <Input placeholder="Please enter alpha " />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Beta</p>
            <Input placeholder="Please enter Beta " />
          </div>



          <div className="input-group">
          <Input
            placeholder="Search..."
            style={{ marginBottom: "5px" }}
            suffix={<SearchOutlined />}
          />
        </div>
        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={gender}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{gender.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${gender.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={gender.length}
                pageSize={10}
              />
            </div>
          )}
        />

      </MyDrawer>




{/* testing */}
<MyDrawer title="test with Ayan" open={testing} onClose={testingModalFtn} >


 </MyDrawer>


     
      <MyDrawer
        open={isSubscriptionsModal}
        onClose={subscriptionsModalOpenClosFtn}
        add={addSubscriptionsModalOpenClosFtn}
        title="Subscriptions"
      >
        <div className="input-group">
          <Input
            placeholder="Search..."
            style={{ marginBottom: "5px" }}
            suffix={<SearchOutlined />}
          />
        </div>
        <Table
          columns={SubscriptionsColumn}
          pagination={true}
          dataSource={gender}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />

        <MyDrawer
          title="Add Subscriptions"
          open={isAddSubscriptionsModal}
          onClose={addSubscriptionsModalOpenClosFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">Short Name</p>
            <Input placeholder="Please enter short name" />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input placeholder="Please enter display name " />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Alpha</p>
            <Input placeholder="Please enter alpha " />
          </div>
          <div className="input-group">
            <p className="inpt-lbl">Beta</p>
            <Input placeholder="Please enter Beta " />
          </div>
        </MyDrawer>
      </MyDrawer>
    </div>
  );
}

export default Configuratin;