import React, { useState } from "react";
import { SiActigraph } from "react-icons/si";
import { FaRegMap } from "react-icons/fa6";
import MyDrawer from "../component/common/MyDrawer";
import { LuRefreshCw } from "react-icons/lu";
import { Input, Table, Row, Col, Space, Pagination, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import { LuCalendarDays } from "react-icons/lu";
import { PiUsersFourDuotone } from "react-icons/pi";
import { tableData } from "../Data";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { HiOutlineMinusCircle } from "react-icons/hi";
import { FiPlusCircle } from "react-icons/fi";
import { TiContacts } from "react-icons/ti";
// import '../styles/Configuratin.css'
import '../styles/Configuration.css'
import MySelect from "../component/common/MySelect";
import { insertDataFtn } from "../utils/Utilities";
import { baseURL } from "../utils/Utilities";


function Configuratin() {
  const [genderModal, setGenderModal] = useState(false);
  const [membershipModal, setMembershipModal] = useState(false);
  const [isSubscriptionsModal, setIsSubscriptionsModal] = useState(false);
  const [isProfileModal, setisProfileModal] = useState(false);
  const [isAddProfileModal, setisAddProfileModal] = useState(false);
  const [isRegionTypeModal, setisRegionTypeModal] = useState(false);
  const [isAddRegionTypeModal, setisAddRegionTypeModal] = useState(false);
  const [isContactTypeModal, setisContactTypeModal] = useState(false);
  const [isAddContactTypeModal, setisAddContactTypeModal] = useState(false);
  const [partnershipModal, setPartnershipModal] = useState(false);
  const [dummyModal, setDummyModal] = useState(false);
  const [profileData, setprofileData] = useState({
    RegNo: "",
    Name: "",
    Rank: "",
    Duty: "",
    Station: "",
    District: "",
    Division: "",
    Address: "",
    Status: "",
    Updated: "",
    alpha: "",
    beta: "",
    giga: "",
  });
  const [RegionTypeData, setRegionTypeData] = useState({
    ReigonTypeId: "",
    ContactType: "",
    DisplayName: "",
  });

  const [ContactTypeData, setContactTypeData] = useState({
    ReigonTypeId: "",
    ReigonType: "",
    DisplayName: "",
    HasChildren: "",
  });

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

  const handleInputChange00 = (name00, value00) => {
    setRegionTypeData((prevState00) => ({
      ...prevState00,
      [name00]: value00,
    }));
  };

  const handleInputChange01 = (name01, value01) => {
    setContactTypeData((prevState01) => ({
      ...prevState01,
      [name01]: value01,
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
const [drawerOpen, setDrawerOpen] = useState({
  Counteries:false,
  Provinces:false,
  Cities:false,
})
let drawerInputsInitalValues = {
  Counteries:{RegionCode:'',RegionName:'',DisplayName:'',ParentRegion:null},
  Provinces:{RegionCode:'',RegionName:'',DisplayName:'',ParentRegion:null},
  Cities:{RegionCode:'',RegionName:'',DisplayName:'',ParentRegion:null},

}
const [drawerIpnuts, setdrawerIpnuts] = useState(drawerInputsInitalValues)
const drawrInptChng = (drawer,field, value) =>{
  setdrawerIpnuts((prevState) => ({
    ...prevState,
    [drawer]: {
      ...prevState[drawer],
      [field]: value,
    },
  }));
}

// this function will drawer all inputs
const resetCounteries = (drawer) => {
  setdrawerIpnuts((prevState) => ({
    ...prevState,
    [drawer]: drawerInputsInitalValues[drawer],
  }));
};

const openCloseDrawerFtn = (name) =>{
    setDrawerOpen((prevState)=>({
      ...prevState,
      [name]:!prevState[name]
    }))
}
  const handleInputChange4 = (name4, value4) => {
    setSubscriptionData((prevState4) => ({
      ...prevState4,
      [name4]: value4,
    }));
  };

  const handleInputChange7 = (name7, value7) => {
    setprofileData((prevState7) => ({
      ...prevState7,
      [name7]: value7,
    }));
  };
  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];
  const columns = [
    {
      title: 'RegionCode',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'RegionName',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'DisplayName',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
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
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Alpha",
      dataIndex: "Alpha",
      key: "Alpha",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Beta",
      dataIndex: "Beta",
      key: "Beta",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
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
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];


  const ProfileColumns = [
    {
      title: "RegNo",
      dataIndex: "RegNo",
      key: "RegNo",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Rank",
      dataIndex: "Rank",
      key: "Rank",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) =>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Duty",
      dataIndex: "Duty",
      key: "Duty",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Station",
      dataIndex: "Station",
      key: "Station",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "District",
      dataIndex: "District",
      key: "District",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Division",
      dataIndex: "Division",
      key: "Division",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Address",
      dataIndex: "Address",
      key: "Address",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Updated",
      dataIndex: "Updated",
      key: "Updated",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Alpha",
      dataIndex: "Alpha",
      key: "Alpha",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Beta",
      dataIndex: "Beta",
      key: "Beta",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Giga",
      dataIndex: "Giga",
      key: "Giga",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
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
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];

  const RegionTypeColumnss = [

    {
      title: "RegionType",
      dataIndex: "RegionType",
      key: "RegionType",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "DisplayName",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) =>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "HasChildren",
      dataIndex: "HasChildren",
      key: "HasChildren",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
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
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];

  const ContactTypeColumns = [

    {
      title: "ContactType",
      dataIndex: "ContactType",
      key: "ContactType",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "DisplayName",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) =>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
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
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
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
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
      Alpha: "A165",
      Beta: "B764",
    },
  ];

  const partnership = [
    {
      key: "1",
      ShortName: "Probation",
      DisplayName: "Single",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
      Alpha: "A165",
      Beta: "B764",
    },
  ];

  const subscription = [
    {
      key: "1",
      ShortName: "Probation",
      DisplayName: "Single",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
      Alpha: "A165",
      Beta: "B764",
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

  const RegionTy = [
    {
      key: "1",
      RegionTypeId: "1",
      RegionType: 'Province',
      DisplayName: 'Province',
      HasChildren: "1",
    },
    {
      key: "2",
      RegionTypeId: "2",
      RegionType: 'County',
      DisplayName: 'County',
      HasChildren: "1",
    },
    {
      key: "3",
      RegionTypeId: "3",
      RegionType: 'Administerative Districts',
      DisplayName: 'District',
      HasChildren: "1",
    },
    {
      key: "4",
      RegionTypeId: "4",
      RegionType: 'City',
      DisplayName: 'City',
      HasChildren: "1",
    },
    {
      key: "5",
      RegionTypeId: "5",
      RegionType: 'PostCode',
      DisplayName: 'PostCode',
      HasChildren: "0",
    },
  ];

  const ContactTy = [
    {
      key: "1",
      ContactTypeId: "1",
      ContactType: 'office',
      DisplayName: 'office',
    },
    {
      key: "2",
      ContactTypeId: "2",
      ContactType: 'office',
      DisplayName: 'office',
    },
    {
      key: "3",
      ContactTypeId: "3",
      ContactType: 'office',
      DisplayName: 'office',
    },
  ];

  const [selectionType, setSelectionType] = useState('checkbox');
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      // Column configuration not to be checked
      name: record.name,
    }),
  };
  // Toggling Modal Functions
  const genderModalOpen = () => setGenderModal(!genderModal);
  const membershipModalFtn = () => setMembershipModal(!membershipModal);
  const partnershipModalFtn = () => setPartnershipModal(!partnershipModal);
  const dummyModalFtn = () => setDummyModal(!dummyModal);
  const subscriptionsModalFtn = () => setIsSubscriptionsModal(!isSubscriptionsModal);
  const profileModalOpenCloseFtn = () => setisProfileModal(!isProfileModal);
  const addprofileModalOpenCloseFtn = () => setisAddProfileModal(!isAddProfileModal);
  const RegionTypeModalOpenCloseFtn = () => setisRegionTypeModal(!isRegionTypeModal);
  const addRegionTypeModalOpenCloseFtn = () => setisAddRegionTypeModal(!isAddRegionTypeModal);
  const ContactTypeModalOpenCloseFtn = () => setisContactTypeModal(!isContactTypeModal);
  const addContactTypeModalOpenCloseFtn = () => setisAddContactTypeModal(!isAddContactTypeModal);

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

  const AddprofileModalFtn = () => {
    console.log(profileData)
  }

  const AddRegionTypeModalFtn = () => {
    console.log(RegionTypeData)
  }

  const AddContactTypeModalFtn = () => {
    console.log(ContactTypeData)
  }

  const AddSubscriptionsFtn = () => {
    console.log(SubscriptionData);
  }

  return (
    <div className="configuration-main">
      <h1 className="config-heading" style={{ marginLeft: '45px' }}>Configurations</h1>
      <Divider orientation="left">lookups Configuration</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={genderModalOpen} className= "center-content">
            <div className="icon-container">
            <SiActigraph className="icons" />
            </div>
            <p className="lookups-title">Titles Titles</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={partnershipModalFtn} className= "center-content">
            <div className="icon-container">
            <PiHandshakeDuotone className="icons" />
            </div>
            <p className="lookups-title">Gender</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={subscriptionsModalFtn} className= "center-content">
            <div className="icon-container">

            <LuCalendarDays className="icons" />
            </div>
            <p className="lookups-title">Marital Status</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={()=>openCloseDrawerFtn('Counteries')} className= "center-content">
            <div className="icon-container">

            <PiUsersFourDuotone className="icons"  />
            </div>
            <p className="lookups-title">Counteries</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={()=>openCloseDrawerFtn('Provinces')}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Provinces</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Counties</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
        <div onClick={()=>openCloseDrawerFtn('Cities')}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Cities</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Post Codes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Divisions</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Districts</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Committees</p>
          </div>
        </Col>

        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Councils</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Boards</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Spoken Languages</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Project Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Trainings</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Ranks</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Duties</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Duties</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Schemes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Solicitors</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Roster Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Reasons</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Contact Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn} className= "center-content">
            <div className="icon-container">

            <PiHandshakeDuotone className="icons" />
            </div>
            <p className="lookups-title ">Payment Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Ranks</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Duties</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Schemes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Roster Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Reasons</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Contact Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Correspondence Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Document Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Claim Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Schemes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Solicitors</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Roster Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Reasons</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Contact Types</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Grid Configuration</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={profileModalOpenCloseFtn}>
            <UserOutlined className="icons" />
            <p className="lookups-title">Profile</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={RegionTypeModalOpenCloseFtn}>
            <FaRegMap className="icons" />
            <p className="lookups-title">Reigon type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <TiContacts className="icons" />
            <p className="lookups-title">Contact Type</p>
          </div>
        </Col>
      </Row>
      <Divider  orientation="left">Roles-Based</Divider>
      <Row>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion  
            className="icons" />
            <p className="lookups-title">Roles</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle   
            className="icons" />
            <p className="lookups-title">Permissions</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle   
            className="icons" />
            <p className="lookups-title">Permissions</p>
          </div>
        </Col>
      </Row>
<Divider orientation="left">Business Rules & Workflows</Divider>
<Row>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion  
            className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle   
            className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle   
            className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Application Settings</Divider>
      <Row>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion  
            className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle   
            className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle   
            className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Customization and Branding</Divider>
      <Row>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion  
            className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle   
            className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle   
            className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">UI/UX Display</Divider>
      <Row>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion  
            className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle   
            className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
      <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle   
            className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
   
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
      {/* Profile multi drawer*/}
      <MyDrawer
        width={"1000px"}
        open={isProfileModal}
        onClose={profileModalOpenCloseFtn}
        add={addprofileModalOpenCloseFtn}
        title="Profile"
      >
        <MyDrawer
          title="Add profile"
          open={isAddProfileModal}
          add={AddprofileModalFtn}
          onClose={addprofileModalOpenCloseFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">RegNo</p>
            <Input
              placeholder="Please enter RegNo"
              onChange={(e) => handleInputChange7("RegNo", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Name</p>
            <Input
              placeholder="Please enter Name"
              onChange={(e) => handleInputChange7("Name", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Rank</p>
            <Input
              placeholder="Please enter Rank"
              onChange={(e) => handleInputChange7("Rank", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Duty</p>
            <Input
              placeholder="Please enter Duty"
              onChange={(e) => handleInputChange7("Duty", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Station</p>
            <Input
              placeholder="Please enter Station"
              onChange={(e) => handleInputChange7("Station", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">District</p>
            <Input
              placeholder="Please enter District"
              onChange={(e) => handleInputChange7("District", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Division</p>
            <Input
              placeholder="Please enter Division"
              onChange={(e) => handleInputChange7("Division", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Address</p>
            <Input
              placeholder="Please enter Address"
              onChange={(e) => handleInputChange7("Address", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Status</p>
            <Input
              placeholder="Please enter Status"
              onChange={(e) => handleInputChange7("Status", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Updated</p>
            <Input
              placeholder="Please enter Updated"
              onChange={(e) => handleInputChange7("Updated", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Alpha</p>
            <Input
              placeholder="Please enter Alpha"
              onChange={(e) => handleInputChange7("alpha", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Beta</p>
            <Input
              placeholder="Please enter Beta"
              onChange={(e) => handleInputChange7("beta", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Giga</p>
            <Input
              placeholder="Please enter Giga"
              onChange={(e) => handleInputChange7("giga", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={ProfileColumns}
          pagination={false}
          dataSource={tableData}
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

      {/*Reigon type Drawer */}

      <MyDrawer
        width={"1000px"}
        open={isRegionTypeModal}
        onClose={RegionTypeModalOpenCloseFtn}
        add={addRegionTypeModalOpenCloseFtn}
        title="Profile"
      >
        <MyDrawer
          title="Add Regiontype"
          open={isAddRegionTypeModal}
          add={AddRegionTypeModalFtn}
          onClose={addRegionTypeModalOpenCloseFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">Reigon type</p>
            <Input
              placeholder="Please enter RegionType"
              onChange={(e) => handleInputChange00("RegionType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              placeholder="Please enter DisplayName"
              onChange={(e) => handleInputChange00("DisplayName", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={RegionTypeColumnss}
          pagination={false}
          dataSource={RegionTy}
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
                  1-{RegionTy.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${RegionTy.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={RegionTy.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>
      {/* ContactType Modal */}

      {/* ContactType Modal */}
      <MyDrawer
        width={"1000px"}
        open={isContactTypeModal}
        onClose={ContactTypeModalOpenCloseFtn}
        add={addContactTypeModalOpenCloseFtn}
        title="Profile"
      >
        <MyDrawer
          title="Add ContactType"
          open={isAddContactTypeModal}
          add={AddContactTypeModalFtn}
          onClose={addContactTypeModalOpenCloseFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">Reigon type</p>
            <Input
              placeholder="Please enter ContactType"
              onChange={(e) => handleInputChange01("ContactType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              placeholder="Please enter DisplayName"
              onChange={(e) => handleInputChange01("DisplayName", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={ContactTypeColumns}
          pagination={false}
          dataSource={ContactTy}
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
                  1-{ContactTy.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${ContactTy.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={ContactTy.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>
      <MyDrawer title='Counteries' open={drawerOpen?.Counteries} onClose={()=>openCloseDrawerFtn('Counteries')} add={()=>{
        console.log(drawerIpnuts?.Counteries)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Counteries, 'Data inserted successfully:', 'Data did not insert:',resetCounteries('Counteries') )
        
      }} >
          <div className="drawer-main-cntainer">
            <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
               <MySelect placeholder='Select Province' isSimple={true} />
               <h1 className="error-text">error-text</h1>
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Code :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp"  onChange={(e)=>drawrInptChng('Counteries','RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode}/>
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Name :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','RegionName', e.target.value)} value={drawerIpnuts?.Counteries?.RegionName} />
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  />
                </div> 
              <p className="error"></p>
              </div>
              </div>
            </div>
            <div className="mt-4 config-tbl-container">
            <Table dataSource={dataSource} columns={columns} 
             className="drawer-tbl"
             rowClassName={(record, index) =>
               index % 2 !== 0 ? "odd-row" : "even-row"
             }
             rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
             bordered
            />;
            </div>
          </div>
      </MyDrawer>
      <MyDrawer title='Provinces' open={drawerOpen?.Provinces} onClose={()=>openCloseDrawerFtn('Provinces')} add={()=>{
        console.log(drawerIpnuts?.Provinces)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Provinces, 'Data inserted successfully:', 'Data did not insert:',resetCounteries('Provinces') )
      }} >
          <div className="drawer-main-cntainer">
            <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
               <MySelect placeholder='Select Province' isSimple={true} />
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Code :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp"  onChange={(e)=>drawrInptChng('Counteries','RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode}/>
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Name :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','RegionName', e.target.value)} value={drawerIpnuts?.Counteries?.RegionName} />
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  />
                </div> 
              <p className="error"></p>
              </div>
              </div>
            </div>
            <div className="mt-4 config-tbl-container">
            <Table dataSource={dataSource} columns={columns} 
             className="drawer-tbl"
             rowClassName={(record, index) =>
               index % 2 !== 0 ? "odd-row" : "even-row"
             }
             rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
             bordered
            />;
            </div>
          </div>
      </MyDrawer>
      <MyDrawer title='Cities' open={drawerOpen?.Cities} onClose={()=>openCloseDrawerFtn('Cities')} add={()=>{
        console.log(drawerIpnuts?.Cities)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Cities, 'Data inserted successfully:', 'Data did not insert:',resetCounteries('Cities') )
      }} >
          <div className="drawer-main-cntainer">
            <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
               <MySelect placeholder='Select Province' isSimple={true} />
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Code :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp"  onChange={(e)=>drawrInptChng('Counteries','RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode}/>
                <h1 className="error-text">error-text</h1>
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Name :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','RegionName', e.target.value)} value={drawerIpnuts?.Counteries?.RegionName} />
                </div> 
              <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
              <p className="star">*</p>
              <div className="inpt-sub-con">
                <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  />
                </div> 
              <p className="error"></p>
              </div>
              </div>
            </div>
            <div className="mt-4 config-tbl-container">
            <Table dataSource={dataSource} columns={columns} 
             className="drawer-tbl"
             rowClassName={(record, index) =>
               index % 2 !== 0 ? "odd-row" : "even-row"
             }
             rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
             bordered
            />;
            </div>
          </div>
      </MyDrawer>

    </div>
  );
}

const styles = {
  // centeredCol: {
  //   paddingTop: "0.5rem",
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // centeredCell: {
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   height: "100%",
  // },
};

export default Configuratin;