import { React, useState } from "react";
import { SiActigraph } from "react-icons/si";
import MyDrawer from "../component/common/MyDrawer";
import { LuRefreshCw } from "react-icons/lu";
import { Input, Table, Pagination, Row, Col, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";

import {
  Edit as EditIcon,
  Archive as ArchiveIcon,
  FileCopy as FileCopyIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";
import { FaEdit } from "react-icons/fa";
import { SerachFitersLookups } from "../Data";
import { LuCalendarDays } from "react-icons/lu";
import { PiUsersFourDuotone } from "react-icons/pi";
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
  const [DummyModal2, setDummyModal2] = useState(false);
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

  const partnership = [
    {
      key: "1",
      ShortName: "Single",
      DisplayName: "Single",
      Alpha: "A163",
      Beta:"B762",
    },
    {
      key: "2",
      ShortName: "Married",
      DisplayName: "Married",
      Alpha: "A164",
      Beta:"B763",
    },
    {
      key: "3",
      ShortName: "Seperated",
      DisplayName: "Seperated",
      Alpha: "A165",
      Beta:"B764",
    },
    {
      key: "4",
      ShortName: "Divorced",
      DisplayName: "Divorced",
      Alpha: "A165",
      Beta:"B764",
    },
  ];

  const membership = [
    {
      key: "1",
      ShortName: "Probation",
      DisplayName: "Single",
      Alpha: "A163",
      Beta:"B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta:"B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta:"B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
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

const PartnershipModalFtn= () =>{
 setPartnershipModal(!ModalPartnership);
}

const DummyModal2Ftn = () =>{
  setDummyModal2(!DummyModal2);
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

  const DummyModal2Open = () =>{
    setDummyModal2(!DummyModal2);
  }

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
          <div onClick={() => PartnershipModalFtn()} className="">
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
         <div onClick={() => DummyModal2Open()}>
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
          <div onClick={() => DummyModal2Open()}>
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
          dataSource={membership}
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




{/* Partnership */}
<MyDrawer
        open={ModalPartnership}
        onClose={PartnershipModalFtn}
        add={PartnershipModalFtn}
        title="Partnership"
      >
        <div className="input-group">
          <Input
            placeholder="Search..."
            style={{ marginBottom: "5px" }}
            suffix={<SearchOutlined />}
          />
        </div>
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
        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={partnership}
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

 {/*Dummy2*/ }
 <MyDrawer
        open={DummyModal2}
        onClose={DummyModal2Ftn}
        add={DummyModal2Ftn}
        title="Dummy2"
      >
        <div className="input-group">
          <Input
            placeholder="Search..."
            style={{ marginBottom: "5px" }}
            suffix={<SearchOutlined />}
          />
        </div>
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
        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={partnership}
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



{/* Subscription */}
     
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
        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={partnership}
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
    </div>
  );
}

export default Configuratin;