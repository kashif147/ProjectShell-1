
import { React, useEffect, useState } from "react";

import { Tabs, message, Button, Radio, Divider } from "antd";
import { LoadingOutlined, UploadOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import MySelect from "../common/MySelect";
import { Input, Row, Col, Checkbox, Dropdown, Upload } from "antd";
import moment from 'moment';
import MyDrawer from "./MyDrawer";
import { useLocation } from "react-router-dom";
import { useTableColumns } from "../../context/TableColumnsContext ";
import '../../styles/MyDetails.css'
import { BsThreeDots } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import MyDatePicker from "./MyDatePicker";
const { TextArea } = Input;

const CheckboxGroup = Checkbox.Group;
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};


const plainOptions = ['Male', 'Female', 'Other'];
const options = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other', title: 'Other' },
];
const optionsWithDisabled = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other', disabled: true },
];


const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};



function MyDeatails() {
  const { ProfileDetails, topSearchData, rowIndex, } = useTableColumns()
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [InfData, setInfData] = useState()
  const location = useLocation();
  const profileData = location?.state
  const [activeTab, setActiveTab] = useState("1");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [value, setValue] = useState(1);
  const [isTransfer, setisTransfer] = useState(false);
  const [isRank, setisRank] = useState(false);
  const [isDuty, setisDuty] = useState(false);


  const [TransferData, setTransferData] = useState({
    NewStationID: "",
    NewStationName: "",
    NewStationAddress: "",
    NewDistrict: "",
    NewDivision: "",
    TransferDate: "",
    TransferMemo: "",
  });

  const [RankData, setRankData] = useState({
    CurrentRank: "",
    NewlyAssignedRank: "",
  });

  const [DutyData, setDutyData] = useState({
    CurrentDuty: "",
    NewlyAssignedDuty: "",
  });

  const [modalOpenData, setmodalOpenData] = useState({ Partnership: false, Children: false })
  const openCloseModalsFtn = (key,) => {
    setmodalOpenData((prevState) => ({
      ...prevState,
      [key]: !modalOpenData[key],
    }));
  };

  const handleInputChange = (name, value) => {
    setTransferData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange1 = (name, value) => {
    setRankData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange2 = (name, value) => {
    setDutyData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setLoading(false);
      setImageUrl(info.file.response.url);
      message.success("Image uploaded successfully");
    } else if (info.file.status === "error") {
      setLoading(false);
      message.error("Image upload failed.");
    }
  };

  useEffect(() => {
    let profils;
    if (ProfileDetails) {
      profils = {
        gardaRegNo: ProfileDetails[0]?.regNo,
        fullname: ProfileDetails[0]?.fullName,
        forename: ProfileDetails[0]?.forename,
        surname: ProfileDetails[0]?.surname,
        dateOfBirth: ProfileDetails[0]?.dateOfBirth,
        dateRetired: ProfileDetails[0]?.dateRetired,
        dateAged65: ProfileDetails[0]?.dateAged65,
        isDeceased: ProfileDetails[0]?.dateOfDeath !== "N/A",
        dateOfDeath: ProfileDetails[0]?.dateOfDeath,
        Partnership: ProfileDetails[0]?.Partnership,
        stationPh: ProfileDetails[0]?.stationPhone,
        District: ProfileDetails[0]?.district,
        Division: ProfileDetails[0]?.division,
        isPensioner: ProfileDetails[0]?.pensionNo ? true : false,
        pensionNo: ProfileDetails[0]?.pensionNo,
        duty: ProfileDetails[0]?.duty,
        rank: ProfileDetails[0]?.rank,
        graduated: ProfileDetails[0]?.graduated,
        isGRAMember: ProfileDetails[0]?.graMember ? true : false,
        dateJoined: ProfileDetails[0]?.dateJoined,
        attested: ProfileDetails[0]?.attested,
        DateLeft: ProfileDetails[0]?.dateLeft,
        isAssociateMember: ProfileDetails[0]?.associateMember === "yes" ? true : false,
      };
      setInfData(profils);
    }

  }, [ProfileDetails]);
  useEffect(() => {
    return () => {
      setInfData({});
    };
  }, [location?.pathname]);
  const [personalInfoChecked, setPersonalInfoChecked] = useState(false);

  const [graInfoChecked, setGraInfoChecked] = useState(false);

  const [membershipInfoChecked, setMembershipInfoChecked] = useState(false);

  const handlePersonalInfoChange = (event) => {
    setPersonalInfoChecked(event.target.checked);
  };

  const handleGraInfoChange = (event) => {
    setGraInfoChecked(event.target.checked);
  };

  const handleMembershipInfoChange = (event) => {
    setMembershipInfoChecked(event.target.checked);
  };

  const options = [
    {
      label: 'Male',
      value: 'Male',
    },
    {
      label: 'Female',
      value: 'Female',
    },
    {
      label: 'Not Specified',
      value: 'Not Specified',
      title: 'Not Specified',
    },
  ];

  const optionsWithDisabled = [
    {
      label: 'Male',
      value: 'Male',
    },
    {
      label: 'Female',
      value: 'Female',
    },
    {
      label: 'Not Specified',
      value: 'Not Specified',
      disabled: false,
    },
  ];

  const [value1, setValue1] = useState('Male');
  const [value2, setValue2] = useState('Male');
  const [value3, setValue3] = useState('Male');
  const [value4, setValue4] = useState('Male');

  const onChange1 = ({ target: { value } }) => {
    console.log('radio1 checked', value);
    setValue1(value);
  };
  const onChange2 = ({ target: { value } }) => {
    console.log('radio2 checked', value);
    setValue2(value);
  };
  const onChange3 = ({ target: { value } }) => {
    console.log('radio3 checked', value);
    setValue3(value);
  };
  const onChange4 = ({ target: { value } }) => {
    console.log('radio4 checked', value);
    setValue4(value);
  };

  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const onCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleNext = () => {
    setActiveTab("2"); // Switch to the second tab (Official Information)
  };

  const TransferOpenCloseFtn = () => setisTransfer(!isTransfer);
  const RankOpenCloseFtn = () => setisRank(!isRank);
  const DutyOpenCloseFtn = () => setisDuty(!isDuty);

  const AddTransferFtn = () => {
    // Lgenderogic for adding 
    console.log(TransferData);
  };

  const AddRankFtn = () => {
    // Logic for adding gender
    console.log(RankData);
  };

  const AddDutyFtn = () => {
    // Logic for adding gender
    console.log(DutyData);
  };

  const customRequest = ({ file, onSuccess, onError }) => {
    setTimeout(() => {
      if (file) {
        onSuccess({ url: URL.createObjectURL(file) }, file);
      } else {
        onError(new Error("Upload failed."));
      }
    }, 1000);
  };
  const uploadButton = (
    <Button
      style={{ marginTop: "5px" }}
      icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
    >
      {loading ? "Uploading" : "Upload"}
    </Button>
  );
  const contact = [
    {
      key: "1",
      label: <h1 className="primary-contact">Primary Address</h1>,
      children: (
        <div>
          <Row gutter={20}>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Building or House<span className="star">*</span></p>
              <p className="star">*</p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Street or Road<span className="star">*</span></p>
              <p className="star">*</p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Area or Town<span className="star">*</span></p>
              <p className="star">*</p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>

          </Row>
          <Row gutter={20}>

            <Col style={{ width: '33.00%' }}>
              <p className="lbl">City, County or Postcode<span className="star">*</span></p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Eircode<span className="star">*</span></p>
              <Input />
            </Col>

          </Row>




        </div>
      ),
    },
    {
      key: "2",
      label: <h1 className="primary-contact">Secondary Adress</h1>,
      children: (
        <div>
          <Row gutter={20}>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Building or House<span className="star">*</span></p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Street or Road<span className="star">*</span></p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Area or Town<span className="star">*</span></p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>

          </Row>
          <Row gutter={20}>

            <Col style={{ width: '33.00%' }}>
              <p className="lbl">City, County or Postcode<span className="star">*</span></p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Eircode<span className="star">*</span></p>
              <Input />
            </Col>

          </Row>
        </div>

      ),
    },
  ];
  const onSubmit = data => console.log(data);
  const handleButtonClick = (e) => {
    message.info('Click on left button.');
    console.log('click left button', e);
  };
  const handleMenuClick = (e) => {
    message.info('Click on menu item.');
    console.log('click', e);
  };
  const items = [
    {
      label: '1st menu item',
      key: '1',
      icon: <UserOutlined />,
    },
    {
      label: '2nd menu item',
      key: '2',
      icon: <UserOutlined />,
    },
    {
      label: '3rd menu item',
      key: '3',
      icon: <UserOutlined />,
      danger: true,
    },
    {
      label: '4rd menu item',
      key: '4',
      icon: <UserOutlined />,
      danger: true,
      disabled: true,
    },
  ]
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  const props = {
    action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange({ file, fileList }) {
      if (file.status !== 'uploading') {
        console.log(file, fileList);
      }
    },
    defaultFileList: [
      {
        uid: '1',
        name: 'khan.png',
        status: 'done',
        url: 'http://www.bise.com/khan.png',
        percent: 33,
      },
      {
        uid: '2',
        name: 'Error',
        status: 'done',
        url: 'http://www.bise.com/yyy.png',
      },
      {
        uid: '3',
        name: 'zzz.png',
        status: 'uploading',
        // custom error message to show
        url: 'http://www.bise.com/zzz.png',
      },
    ],
  };
  return (

    // <Tabs
    //   defaultActiveKey="1"
    //   activeKey={activeTab}
    //   onChange={setActiveTab}
    //   items={[
    //     {
    //       label: <h1 className="primary-contact">Personal Information</h1>,
    //       key: "1",
    //       children: (
    //         <div className="padding-bottom">
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Garda Reg No:<span className="star">*</span></p>
    //               <Input value={InfData?.gardaRegNo} />
    //             </Col>
    //           </Row>
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Fullname</p>
    //               <Input style={{
    //                 width: "100%",
    //                 border: "1px solid",
    //                 borderRadius: "3px",
    //               }} className=""
    //                 value={InfData?.fullname}
    //               />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Forename</p>
    //               <Input value={InfData?.forename} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Surname</p>
    //               <Input value={InfData?.surname} />
    //             </Col>

    //           </Row>
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Date Of Birth</p>
    //               <DatePicker
    //                 style={{
    //                   width: "100%",
    //                   border: "1px solid",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //                 value={InfData?.dateOfBirth ? moment(InfData?.dateOfBirth, 'DD/MM/YYYY') : null}
    //               />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Next B/d :</p>
    //               <Input disabled={true} />
    //             </Col>
    //             <Col style={{ width: "33.00%" }}>
    //               <p className="lbl">Gender</p>
    //               <>
    //                 <Radio.Group
    //                   options={optionsWithDisabled}
    //                   onChange={onChange4}
    //                   value={value4}
    //                   optionType="button"
    //                   buttonStyle="solid"
    //                 />
    //               </>
    //             </Col>
    //           </Row>

    //           <Row gutter={20}>

    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Date Retired</p>
    //               <DatePicker
    //                 style={{
    //                   width: "100%",
    //                   border: "1px solid",
    //                   borderRadius: "3px",
    //                 }}
    //                 value={InfData?.dateRetired ? moment(InfData?.dateRetired, 'DD/MM/YYYY') : null}
    //                 className=""
    //               />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Date Aged 65 :</p>
    //               <DatePicker
    //                 disabled={true}
    //                 style={{
    //                   width: "100%",
    //                   border: "1px solid",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //                 value={InfData?.dateAged65 ? moment(InfData?.dateAged65, 'DD/MM/YYYY') : null}
    //               />
    //             </Col>
    //             <Col style={{ width: '33%' }}>
    //               <p className="lbl">Deceased:</p>
    //               <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
    //                 <Checkbox
    //                   onChange={onCheckboxChange}
    //                   style={{
    //                     flex: '1', // Set checkbox width
    //                     marginRight: '5px', // Space between checkbox and input
    //                     height: '33px', // Set height to match input field
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',

    //                   }}
    //                   checked={InfData?.isDeceased}
    //                 />
    //                 <DatePicker
    //                   type="text"
    //                   placeholder="Date of Deceased..."
    //                   disabled={!isChecked} // Disable input when checkbox is not checked
    //                   style={{
    //                     flex: '3', // 75% width
    //                     padding: '6px',  // Reduced padding to match checkbox
    //                     borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
    //                     border: "1px solid",
    //                     outline: 'none',
    //                     height: '33px', // Set height
    //                     backgroundColor: isChecked ? '#ebf1fd' : '#f0f1f1', // Change background if disabled
    //                   }}
    //                   value={InfData?.dateOfDeath != "N/A" ? moment(InfData?.dateOfDeath, 'DD/MM/YYYY') : null}
    //                 />
    //               </div>
    //             </Col>

    //           </Row>

    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Partnership</p>
    //               <MySelect placeholder="Select Partnership" isSimple={true} />
    //             </Col>
    //             <Col style={{ width: '33%' }}>
    //               <p className="lbl">Children:</p>
    //               <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
    //                 <Checkbox
    //                   onChange={onCheckboxChange}
    //                   style={{
    //                     flex: '1', // Set checkbox width
    //                     marginRight: '5px', // Space between checkbox and input
    //                     height: '33px', // Set height to match input field
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                   }}
    //                 />
    //                 <input
    //                   type="text"
    //                   placeholder="No of children..."
    //                   disabled={!isChecked} // Disable input when checkbox is not checked
    //                   style={{
    //                     flex: '3', // 75% width
    //                     padding: '6px',  // Reduced padding to match checkbox
    //                     borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
    //                     border: "1px solid #333333",
    //                     outline: 'none',
    //                     height: '33px', // Set height
    //                     backgroundColor: isChecked ? 'white' : '#f0f0f0', // Change background if disabled
    //                   }}
    //                 />
    //               </div>
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Email</p>
    //               <Input type="number" />
    //             </Col>
    //           </Row>

    //           <Row gutter={20}>

    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Primary Contact</p>
    //               <Input type placeholder="000-000-0000" />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Secondary Contact</p>
    //               <Input type placeholder="000-000-0000" />
    //             </Col>

    //           </Row>
    //           <Tabs defaultActiveKey="1" items={contact} onChange={() => { }} />
    //           <div className="btn-main-con">
    //             <Button className="gray-btn butn" onClick={handleNext}>
    //               Next
    //             </Button>
    //             <Button className=" butn" onClick={() => { }}>Cancel</Button>

    //           </div>
    //         </div>
    //       ),
    //     },
    //     {
    //       label: <h1 className="primary-contact">GRA Information</h1>,
    //       key: "2",
    //       children: (
    //         <div className="padding-bottom">
    //           <Row gutter={20}>
    //             <Col style={{ width: '33%' }}>
    //               <p className="lbl">Station:</p>
    //               <div style={{ display: 'flex', width: '100%' }}>
    //                 <MySelect
    //                   isSimple={true}
    //                   placeholder="STOC..."
    //                   style={{
    //                     flex: '3', // 75% width
    //                     padding: '6px',  // Ensure padding is consistent
    //                     borderRadius: '5px 0 0 5px',
    //                     border: '1px solid #333333',
    //                     outline: 'none',
    //                     height: '33px', // Same height as the button
    //                     boxSizing: 'border-box' // Ensure consistent sizing
    //                   }}
    //                 />
    //                 <Button
    //                   onClick={TransferOpenCloseFtn}
    //                   style={{
    //                     flex: '1', // 25% width
    //                     marginLeft: '5px',
    //                     borderRadius: '5px',
    //                     border: '1px solid #ccc',
    //                     backgroundColor: '#007BFF',
    //                     color: 'white',
    //                     height: '33px',
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                   }}
    //                 >
    //                   Transfer
    //                 </Button>
    //               </div>
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Address Line 1:</p>
    //               <Input placeholder="..." />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Address Line 2:</p>
    //               <Input placeholder="..." />
    //             </Col>
    //           </Row>
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Station Ph :</p>
    //               <Input placeholder="00-000-0000" value={InfData?.stationPh} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">District:</p>
    //               <MySelect placeholder="0000-AAA-BBB" isSimple={true} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Division:</p>
    //               <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
    //             </Col>
    //           </Row>
    //           <Row gutter={20}>
    //             <Col style={{ width: '33%' }}>
    //               <p className="lbl">Pensioner:</p>
    //               <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
    //                 <Checkbox
    //                   onChange={onCheckboxChange}
    //                   style={{
    //                     flex: '1', // Set checkbox width
    //                     marginRight: '5px', // Space between checkbox and input
    //                     height: '33px', // Set height to match input field
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                   }}
    //                   checked={InfData?.isPensioner}
    //                 />
    //                 <input
    //                   type="text"
    //                   placeholder="Enter something..."
    //                   disabled={!InfData?.isPensioner} // Disable input when checkbox is not checked
    //                   style={{
    //                     flex: '3', // 75% width
    //                     padding: '6px',  // Reduced padding to match checkbox
    //                     borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
    //                     border: "1px solid #333333",
    //                     outline: 'none',
    //                     height: '33px', // Set height
    //                     backgroundColor: !InfData?.isPensioner ? 'white' : '#f0f0f0', // Change background if disabled
    //                   }}
    //                   value={InfData?.pensionNo}
    //                 />
    //               </div>
    //             </Col>
    //             <Col style={{ width: '33%' }}>
    //               <p className="lbl">Rank:</p>
    //               <div style={{ display: 'flex', width: '100%' }}>
    //                 <input
    //                   type="text"
    //                   placeholder="Enter something..."
    //                   style={{
    //                     flex: '3', // 75% width
    //                     padding: '6px',  // Reduced padding to match button
    //                     borderRadius: '5px 0 0 5px',
    //                     border: "1px solid #333333",
    //                     outline: 'none',
    //                     height: '33px', // Set a specific height matching the button
    //                   }}
    //                   value={InfData?.rank}
    //                 />
    //                 <Button
    //                   onClick={RankOpenCloseFtn}
    //                   style={{
    //                     flex: '1', // 25% width
    //                     marginLeft: '5px', // Add some space between input and button
    //                     borderRadius: '5px', // Make button fully rounded
    //                     border: '1px solid #ccc',
    //                     backgroundColor: '#007BFF',
    //                     color: 'white',
    //                     height: '33px', // Same height as the input field
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                   }}
    //                 >
    //                   Rank
    //                 </Button>
    //               </div>
    //             </Col>
    //             <Col style={{ width: '33%' }}>
    //               <p className="lbl">Duty:</p>
    //               <div style={{ display: 'flex', width: '100%' }}>
    //                 <input
    //                   type="text"
    //                   placeholder="Enter something..."
    //                   style={{
    //                     flex: '3', // 75% width
    //                     padding: '6px',  // Reduced padding to match buttons
    //                     borderRadius: '5px 0 0 5px',
    //                     border: "1px solid #333333",
    //                     outline: 'none',
    //                     height: '33px', // Set a specific height matching the button
    //                   }}
    //                   value={InfData?.duty}
    //                 />
    //                 <Button
    //                   onClick={DutyOpenCloseFtn}
    //                   style={{
    //                     flex: '1', // 25% width
    //                     marginLeft: '5px', // Add some space between input and button
    //                     borderRadius: '5px', // Make button fully rounded
    //                     border: '1px solid #ccc',
    //                     backgroundColor: '#007BFF',
    //                     color: 'white',
    //                     height: '33px', // Same height as the input field
    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     justifyContent: 'center',
    //                   }}
    //                 >
    //                   Duty
    //                 </Button>
    //               </div>
    //             </Col>
    //           </Row>

    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Templemore:</p>
    //               <DatePicker
    //                 placeholder="../../...."
    //                 style={{
    //                   width: "100%",
    //                   border: "1px solid #333333",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //               />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Class:</p>
    //               <Input />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Attested:</p>
    //               <Input value={InfData?.attested} />
    //             </Col>
    //           </Row>
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Graduated:</p>
    //               <Input value={InfData?.graduated} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Notes:</p>
    //               <Input />
    //             </Col>
    //           </Row>

    //           <MyDrawer
    //             width={"1000px"}
    //             open={isTransfer}
    //             onClose={TransferOpenCloseFtn}
    //             add={AddTransferFtn}
    //             title="Transfer">
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Station ID:</p>
    //               <Input
    //                 placeholder="Please enter New Station ID"
    //                 onChange={(e) => handleInputChange("NewStationID", e.target.value)}
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Station Name:</p>
    //               <Input
    //                 placeholder="Please enter New Station Name"
    //                 onChange={(e) => handleInputChange("NewStationName", e.target.value)}
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Station Address:</p>
    //               <Input
    //                 placeholder="Please enter New Station Address"
    //                 onChange={(e) => handleInputChange("NewStationAddress", e.target.value)}
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">New District</p>
    //               <Input
    //                 placeholder="Please enter New District"
    //                 onChange={(e) => handleInputChange("NewDistrict", e.target.value)}
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Division:</p>
    //               <Input
    //                 placeholder="Please enter New Division"
    //                 onChange={(e) => handleInputChange("NewDivision", e.target.value)}
    //               />
    //             </div>
    //             <Divider style={{ borderColor: '#333' }} />

    //             <div className="input-group">
    //               <p className="inpt-lbl">Transefer Date:</p>
    //               <DatePicker
    //                 style={{
    //                   width: "100.00%",
    //                   border: "1px solid #333333",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">Transefer Memo:</p>
    //               <Input
    //                 placeholder="Please enter Transfer Memo"
    //                 onChange={(e) => handleInputChange("TransferMemo", e.target.value)}
    //               />
    //             </div>

    //           </MyDrawer>
    //           {/* Drawer 2*/}
    //           <MyDrawer
    //             width={"1000px"}
    //             open={isRank}
    //             onClose={RankOpenCloseFtn}
    //             add={AddRankFtn}
    //             title="Transfer">
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Rank:</p>
    //               <Input
    //                 placeholder="Please enter Current Rank"
    //                 onChange={(e) => handleInputChange1("CurrentRank", e.target.value)}
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Station Name:</p>
    //               <Input
    //                 placeholder="Please enter Newly Assigned Rank"
    //                 onChange={(e) => handleInputChange1("NewlyAssignedRank", e.target.value)}
    //               />
    //             </div>

    //             <Divider style={{ borderColor: '#333' }} />

    //             <div className="input-group">
    //               <p className="inpt-lbl">Transefer Date:</p>
    //               <DatePicker
    //                 style={{
    //                   width: "100.00%",
    //                   border: "1px solid #333333",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">Transefer Memo:</p>
    //               <Input
    //                 placeholder="Please enter Transfer Memo"
    //                 onChange={(e) => handleInputChange("TransferMemo", e.target.value)}
    //               />
    //             </div>

    //           </MyDrawer>

    //           {/* Drawer 2*/}
    //           <MyDrawer
    //             width={"1000px"}
    //             open={isRank}
    //             onClose={DutyOpenCloseFtn}
    //             add={AddDutyFtn}
    //             title="Transfer">
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Duty:</p>
    //               <Input
    //                 placeholder="Please enter Current Rank"
    //                 onChange={(e) => handleInputChange1("CurrentDuty", e.target.value)}
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">New Station Name:</p>
    //               <Input
    //                 placeholder="Please enter Newly Assigned Rank"
    //                 onChange={(e) => handleInputChange1("NewlyAssignedDuty", e.target.value)}
    //               />
    //             </div>

    //             <Divider style={{ borderColor: '#333' }} />

    //             <div className="input-group">
    //               <p className="inpt-lbl">Transefer Date:</p>
    //               <DatePicker
    //                 style={{
    //                   width: "100.00%",
    //                   border: "1px solid #333333",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //               />
    //             </div>
    //             <div className="input-group">
    //               <p className="inpt-lbl">Transefer Memo:</p>
    //               <Input
    //                 placeholder="Please enter Transfer Memo"
    //                 onChange={(e) => handleInputChange("TransferMemo", e.target.value)}
    //               />
    //             </div>

    //           </MyDrawer>

    //         </div>
    //       ),



    //     },
    //     {
    //       label: <h1 className="primary-contact">Membership & Subscriptions</h1>,
    //       key: "3",
    //       children: (
    //         <div className="padding-bottom">
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">GRA Member</p>
    //               <Checkbox checked={InfData?.isGRAMember} onChange={onCheckboxChange}></Checkbox>
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Date Joined:</p>
    //               <DatePicker
    //                 disabled={!isChecked}
    //                 style={{
    //                   width: "100.00%",
    //                   border: "1px solid #333333",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //                 value={InfData?.dateJoined ? moment(InfData?.dateJoined, 'DD/MM/YYYY') : null}
    //               // value={InfData?.dateJoined}
    //               />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Date Left:</p>
    //               <DatePicker
    //                 disabled={!isChecked}
    //                 style={{
    //                   width: "100.00%",
    //                   border: "1px solid #333333",
    //                   borderRadius: "3px",
    //                 }}
    //                 className=""
    //                 value={InfData?.DateLeft != "N/A" ? moment(InfData?.DateLeft, 'DD/MM/YYYY') : null}
    //               />
    //             </Col>
    //           </Row>
    //           <Row gutter={20}>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">Associate Member:</p>
    //               <Checkbox disabled={!isChecked} checked={InfData?.isAssociateMember} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl">.</p>
    //               <Button disabled={!isChecked}>Statue </Button>
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> District Rep:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> District Sec:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> District Chair:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> Division Rep:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> Division Sec:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> Division Chair:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> C.E.C:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>
    //             <Col style={{ width: '33.00%' }}>
    //               <p className="lbl"> Panel of Friends:</p>
    //               <Checkbox disabled={!isChecked} />
    //             </Col>

    //           </Row>
    //         </div>
    //       ),
    //     },
    //   ]}
    // />
    <form onSubmit={handleSubmit(onSubmit)}>


      <div className="details-container">
        <div className="details-con-header1">
          <Row>
            <Col span={8}>
              <div className="details-con-header"><h2>Personal Information</h2></div>
              <div className="detail-sub-con">
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Title :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <div className="input-sub-con">
                      <MySelect isSimple={true} placeholder='Mr.' />
                      <h1 className="error-text">error-text</h1>
                    </div>

                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Forename :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <div className="input-sub-con">
                      <Input className="input" value={InfData?.forename} />

                    </div>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Surname :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Input className="input" value={InfData?.surname} {...register("exampleRequired", { required: true })} />
                  </div>
                </div>
                <div className="lbl-inpt-2">
                  <div className="title-cont-2">
                    <p className=" ">Gender :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <div className="input">
                      <Radio.Group
                        options={optionsWithDisabled}
                        onChange={onChange4}
                        value={value4}
                        optionType="button"
                        buttonStyle="solid"
                      />

                    </div>
                  </div>
                </div>
                {/* <div className="lbl-inpt">
                <p className="lbl">Gender :</p>
                <div>
                <p className="star-white">*</p>
                <Radio.Group
                  options={optionsWithDisabled}
                  onChange={onChange4}
                  value={value4}
                  optionType="button"
                  buttonStyle="solid"
                />
                </div>
               
              </div> */}
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Date of Birth :</p>
                  </div>

                  <div className="input-cont">
                    <p className="star">*</p>
                    <MyDatePicker
                      style={{ width: "100%", borderRadius: "3px" }}
                      defaultValue={InfData?.dateOfBirth ? moment(InfData?.dateOfBirth, 'DD/MM/YYYY') : null}
                    />
                    {/* <div className="ag-65"> */}
                    <p className="ag-65-title" >46 Yrs</p>
                    {/* </div> */}
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Date Aged 65 :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <MyDatePicker
                      
                      defaultValue={InfData?.dateOfBirth ? moment(InfData?.dateOfBirth, 'DD/MM/YYYY') : null}
                    />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Deceased :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <div className="checkbox-con">
                      <div className="checkbox-sub">
                        <Checkbox
                          onChange={onCheckboxChange}
                          checked={InfData?.isPensioner}
                        />

                      </div>
                      <MyDatePicker className="w-100 date-picker-custom" />
                    </div>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Partnership :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>

                    <Input className="input" value={InfData?.gardaRegNo} />
                    <Button
                      onClick={() => openCloseModalsFtn("Partnership")}
                      className="primary-btn butn ms-2 detail-btn"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Children :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <Input className="input" value={InfData?.gardaRegNo} />
                    <Button
                      onClick={() => openCloseModalsFtn("Children")}
                      className="primary-btn butn ms-2 detail-btn"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <Divider>Corresondence Details</Divider>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Email :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Input className="input" />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Mobile :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Input className="input" placeholder="000-000-0000" />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Other Contact :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <Input className="input" placeholder="000-000-0000" />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Building or House :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Input className="input" />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Street or Road :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <Input className="input" />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Area or Town :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>

                    <Input className="input" />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">County, City or ZIP :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <MySelect placeholder="Select City" isSimple={true} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Eircode :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <Input className="input" />
                  </div>
                </div>
              </div>
            </Col>

            <Col span={8} >
              <div className="details-con-header"><h2>Professional Details</h2></div>
              <div className="detail-sub-con">
                {/* <div className="lbl-inpt">
                <p className="lbl">Station :</p>
                <p className="star">*</p>
                <Input value={InfData?.gardaRegNo} suffix={<BsThreeDots />} />
                <Button className="butn primary-btn ">Tr</Button>
              </div> */}
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Station :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <div style={{ display: 'flex', width: '100%' }}>
                      {/* <div className="input-container-with-sup"> */}
                      {/* <Input
                        placeholder="Enter text"
                        style={{ width: '100%', borderRight: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px', padding: '0px', paddingLeft: '5px', margin: '0px', height: '33px' }} // Adjust border style
                        suffix={<div className="suffix-container">
                          <BsThreeDots />
                        </div>}
                      /> */}
                      <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                        Select Station
                      </Dropdown.Button>
                    </div>
                    <Button className="butn primary-btn detail-btn ms-2">
                      Tr
                    </Button>
                  </div>
                </div>
                <div className="lbl-txtarea-2">
                  <div className="title-cont-txtarea">
                    <p className=""></p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <TextArea rows={4} style={{ width: "100%", borderRadius: "3px", borderColor: 'D9D9D9' }} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Station Phone : </p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <Input value={InfData?.gardaRegNo} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">District :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <MySelect placeholder="0000-AAA-BBB" isSimple={true} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Division :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Retired :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <div className="checkbox-con">
                      <div style={{ backgroundColor: "white", marginRight: '8px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Checkbox
                          onChange={onCheckboxChange}
                          checked={InfData?.isPensioner}
                        />
                      </div>

                      <Input
                        type="text"
                        placeholder="Enter something..."
                        disabled={!InfData?.isPensioner}
                        value={InfData?.pensionNo}
                      />
                    </div>
                  </div>
                </div>

                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Pension No :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <Input
                      type="text"
                      placeholder="Enter something..."
                      disabled={!InfData?.isPensioner}
                      value={InfData?.pensionNo}
                    />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Rank :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                      Select Rank
                    </Dropdown.Button>
                  </div>
                </div>

                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="lbl">Duty:</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                      Select Duty
                    </Dropdown.Button>
                  </div>
                </div>
                <Divider>Training Details</Divider>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Templemore :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <MyDatePicker className="date-picker" isSimple={true} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Class  :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Input />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Attested :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <MyDatePicker style={{ width: "100%", borderRadius: "3px" }} />
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Graduation :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <MyDatePicker className="date-picker" />
                  </div>
                </div>
                <div className="lbl-txtarea-2">
                  <div className="title-cont-txtarea">
                    <p className="">Notes</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <TextArea rows={4} style={{ width: "100%", borderRadius: "3px", borderColor: 'D9D9D9' }} />
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8} >
              <div className="details-con-header"><h2>Membership & Subscriptions</h2></div>
              <div className="detail-sub-con">
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Reg No :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'baseline' }}>
                      <div className="input-container-with-sup">
                        <Input
                          placeholder="Enter text"
                          style={{ width: '100%', borderRight: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px', padding: '0px', paddingLeft: '5px', margin: '0px', height: '33px' }} // Adjust border style
                          suffix={<div className="suffix-container">
                            <IoSettingsOutline />
                          </div>}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Date Joined :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <div className="checkbox-con">
                      <div className="checkbox-sub">
                        <Checkbox
                          onChange={onCheckboxChange}
                          checked={InfData?.isPensioner}
                        />
                      </div>
                      <MyDatePicker className="w-100 date-picker-custom" />
                    </div>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Date Left :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <div className="checkbox-con">
                      <div className="checkbox-sub">
                        <Checkbox
                          onChange={onCheckboxChange}
                          checked={InfData?.isPensioner}
                        />

                      </div>
                      <MyDatePicker className="w-100 date-picker-custom" />
                    </div>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Reason (Left) :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <MySelect isSimple={true} />
                  </div>
                </div>
              
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Associate Member :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star-white">*</p>
                    <div className="checkbox-con">
                      <div style={{ backgroundColor: "white", marginRight: '8px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Checkbox
                          onChange={onCheckboxChange}
                          checked={InfData?.isPensioner}
                        />
                      </div>

                      <Input
                        type="text"
                        placeholder="Enter something..."
                        disabled={!InfData?.isPensioner}
                        value={InfData?.pensionNo}
                      />
                    </div>
                  </div>
                </div>
                <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">Statue :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <Input value={InfData?.gardaRegNo} />
                  </div>
                </div>
                <Row style={{paddingLeft:'12px'}}>
                  <Col span={8}>
                  <Checkbox className="lbl">
                    District Rep
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                  Division Rep
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                  C.E.C
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                    District Sec
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                    Division Sec
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                    Panel of
                    Friends
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                    Division Chair
                  </Checkbox>
                  </Col>
                  <Col span={8}>
                  <Checkbox className="lbl">
                  District Chair
                  </Checkbox>
                  </Col>
                </Row>
                <div className="d-flex justify-content-end ms-2">
                  <div className="sub-com-cont me-4">
                  <p className="sub-com">Sub Committees :</p>
                  </div>
                  <div className="me-4">
                  <Button className="butn primary-btn">+</Button>
                  </div>
                </div>
                <div className="d-flex justify-content-center">  {/* Ensure the outer div is a flexbox */}
                  <Upload {...props}>
                    <div className="d-flex
                    ">
                  <p className="star">*</p>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                      </div>
                  </Upload>
                </div>
                <Divider>Subscriptions</Divider>
                <Row style={{paddingLeft:'12px'}}>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Life Assurance (Member)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Life Assurance (Partner)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Critical Illness (Member)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Critical Illness (Partner)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Income Protection
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Finance Application
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Illness / Injury
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Legal Assistance
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Garda Review
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox className="subs-chkbx">
                      Balloted
                    </Checkbox>
                    <Input style={{width:'80%'}} />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>

            </Col>
          </Row>
        </div>
        <MyDrawer title='Partnership' open={modalOpenData?.Partnership} onClose={() => openCloseModalsFtn("Partnership")} >
          <div className="details-drawer mb-4">
            <p>{InfData?.gardaRegNo}</p>
            <p>{InfData?.fullname}</p>
            <p>Garda</p>
          </div>
          <div>
            <div className="inpt-container">
              <div className="drawer-lbl">
                <p>Title :</p>
              </div>
              <div className="inpt"><Input /></div>
            </div>
            <div className="inpt-container">
              <div className="drawer-lbl">
                <p>Title :</p>
              </div>
              <div className="inpt"><Input /></div>
            </div>
          </div>
        </MyDrawer>
        <MyDrawer title='Children' open={modalOpenData?.Children} onClose={() => openCloseModalsFtn("Children")} >
          <div className="details-drawer mb-4">
            <p>{InfData?.gardaRegNo}</p>
            <p>{InfData?.fullname}</p>
            <p>Garda</p>
          </div>
          <div>
            <div className="inpt-container">
              <div className="drawer-lbl">
                <p>Title :</p>
              </div>
              <div className="inpt"><Input /></div>
            </div>
            <div className="inpt-container">
              <div className="drawer-lbl">
                <p>Title :</p>
              </div>
              <div className="inpt"><Input /></div>
            </div>
          </div>
        </MyDrawer>
      </div>
    </form>
  );
}

export default MyDeatails;
