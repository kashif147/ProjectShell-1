import React, { useState } from "react";
import { SiActigraph } from "react-icons/si";
import MyDrawer from "../component/common/MyDrawer";
import { LuRefreshCw } from "react-icons/lu";
import { Input, Table, Row, Col, Space, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { LuCalendarDays } from "react-icons/lu";
import { PiUsersFourDuotone } from "react-icons/pi";

function Configuratin() {
  const [genderModal, setGenderModal] = useState(false);
  const [membershipModal, setMembershipModal] = useState(false);
  const [isSubscriptionsModal, setIsSubscriptionsModal] = useState(false);
  const [partnershipModal, setPartnershipModal] = useState(false);
  const [dummyModal, setDummyModal] = useState(false);
  const [genderData, setGenderData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });
  const [PartnershipData, setPartnershipData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });
  const [membershipdata, setMembershipData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });

  const [SubscriptionData, setSubscriptionData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });

  const handleInputChange = (name, value) => {
    setGenderData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange2 = (name2, value2) => {
    setPartnershipData((prevState2) => ({
      ...prevState2,
      [name2]: value2,
    }));
  };

  const handleInputChange3 = (name3, value3) => {
    setMembershipData((prevState3) => ({
      ...prevState3,
      [name3]: value3,
    }));
  };

  const handleInputChange4 = (name4, value4) => {
    setSubscriptionData((prevState4) => ({
      ...prevState4,
      [name4]: value4,
    }));
  };

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


  const column = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      width: 60,
      align: "center",
      render: (text) => <div style={styles.centeredCell}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      align: "center",
      render: (text) => <div style={styles.centeredCell}>{text}</div>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
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

  const partnership = [
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

  const subscription = [
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


  const gender = [
    {
      key: "1",
      ShortName: "Male",
      DisplayName: "Male",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Female",
      DisplayName: "Female",
      Alpha: "A164",
      Beta: "B763",
    },
    {
      key: "3",
      ShortName: "Other",
      DisplayName: "Other",
      Alpha: "A165",
      Beta: "B764",
    },
  ];

  // Toggling Modal Functions
  const genderModalOpen = () => setGenderModal(!genderModal);
  const membershipModalFtn = () => setMembershipModal(!membershipModal);
  const partnershipModalFtn = () => setPartnershipModal(!partnershipModal);
  const dummyModalFtn = () => setDummyModal(!dummyModal);
  const subscriptionsModalFtn = () => setIsSubscriptionsModal(!isSubscriptionsModal);

  const addmembershipFtn = () => {
    console.log(membershipdata);
  }

  const addGenderFtn = () => {
    // Logic for adding gender
    console.log(genderData);
  };

  const AddpartnershipFtn = () => {
    console.log(PartnershipData);
  }

  const AddSubscriptionsFtn = () => {
    console.log(SubscriptionData);
  }

  return (
    <div className="configuration-main">
      <p className="configuratin-titles">Lookups Configuration</p>

      <Row>
        <Col className="hover-col" span={4} style={styles.centeredCol}>
          <div onClick={genderModalOpen}>
            <SiActigraph className="icons" />
            <p className="lookups-title">Gender</p>
          </div>
        </Col>
        <Col className="hover-col" span={4} style={styles.centeredCol}>
          <div onClick={partnershipModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Partnership</p>
          </div>
        </Col>
        <Col className="hover-col" span={4} style={styles.centeredCol}>
          <div onClick={subscriptionsModalFtn}>
            <LuCalendarDays className="icons" />
            <p className="lookups-title">Subscriptions</p>
          </div>
        </Col>
        <Col className="hover-col" span={4} style={styles.centeredCol}>
          <div onClick={membershipModalFtn}>
            <PiUsersFourDuotone className="icons" />
            <p className="lookups-title">Membership</p>
          </div>
        </Col>
        <Col className="hover-col" span={4} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Dummy</p>
          </div>
        </Col>
      </Row>

      {/* Gender Drawer */}
      <MyDrawer
        open={genderModal}
        onClose={genderModalOpen}
        add={addGenderFtn}
        title="Gender"
      >
        <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        
        <Table
          columns={column}
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

      {/* Membership Drawer */}
      <MyDrawer
        open={membershipModal}
        onClose={membershipModalFtn}
        add={addmembershipFtn}
        title="Membership"
      >
        <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange3("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange3("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange3("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange3("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
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

      {/* Partnership Drawer */}
      <MyDrawer
        open={partnershipModal}
        onClose={partnershipModalFtn}
        add={AddpartnershipFtn}
        title="Partnership"
      >
 
 <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange2("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange2("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange2("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange2("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

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

      {/* Dummy Drawer */}
      <MyDrawer
        open={dummyModal}
        onClose={dummyModalFtn}
        add={() => console.log("Adding Dummy")}
        title="Dummy"
      >
        <div className="input-group">
          <p className="inpt-lbl">Dummy Field</p>
          <Input placeholder="Please enter dummy field" />
        </div>
        {/* Add more input fields as required */}
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        <Table
          columns={column} // Assuming columns are the same
          pagination={true}
          dataSource={gender} // Replace with appropriate data
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />
      </MyDrawer>

      {/* Subscriptions Drawer */}
      <MyDrawer
        open={isSubscriptionsModal}
        onClose={subscriptionsModalFtn}
        add={AddSubscriptionsFtn}
        title="Subscriptions"
      >
<div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange4("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange4("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange4("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange4("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

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

const styles = {
  centeredCol: {
    paddingTop: "0.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  centeredCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
};

export default Configuratin;