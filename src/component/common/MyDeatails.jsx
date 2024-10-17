
import { React, useEffect, useState } from "react";
import { Tabs, message, Button, DatePicker, Radio, Divider } from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import MySelect from "../common/MySelect";
import { Input, Row, Col, Checkbox } from "antd";
import moment from 'moment';
import MyDrawer from "./MyDrawer";
import { useLocation } from "react-router-dom";
import { useTableColumns } from "../../context/TableColumnsContext ";
import '../../styles/MyDetails.css'

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
    // Logic for adding gender
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
              <p className="lbl">Building or House</p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Street or Road</p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Area or Town</p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>

          </Row>
          <Row gutter={20}>

            <Col style={{ width: '33.00%' }}>
              <p className="lbl">City, County or Postcode</p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Eircode</p>
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
              <p className="lbl">Building or House</p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Street or Road</p>
              <Input />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Area or Town</p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>

          </Row>
          <Row gutter={20}>

            <Col style={{ width: '33.00%' }}>
              <p className="lbl">City, County or Postcode</p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
            <Col style={{ width: '33.00%' }}>
              <p className="lbl">Eircode</p>
              <Input />
            </Col>

          </Row>
        </div>

      ),
    },
  ];
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
    //               <p className="lbl">Garda Reg No:</p>
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
    <div className="details-container">
      <div className="details-con-header">
        <Row>
          <Col span={8}>
            <div className="details-con-header"><h2>Personal Information</h2></div>
            <div className="detail-sub-con">
              <div className="lbl-inpt">
                <p className="lbl">Title :</p>
                <Input className="input" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl lbl1">Forename :</p>
                <Input className="input" value={InfData?.forename} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl lbl1">Surname :</p>
                <Input className="input" value={InfData?.surname} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Gender :</p>
                <Radio.Group
                  options={optionsWithDisabled}
                  onChange={onChange4}
                  value={value4}
                  optionType="button"
                  buttonStyle="solid"
                />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Date of Birth :</p>
                <DatePicker
                  style={{ width: "100%", border: "1px solid", borderRadius: "3px" }}
                  value={InfData?.dateOfBirth ? moment(InfData?.dateOfBirth, 'DD/MM/YYYY') : null}
                />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Date Aged 65 :</p>
                <Input className="input" value={InfData?.gardaRegNo} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Deceased :</p>
                <Input className="input" value={InfData?.gardaRegNo} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Partnership :</p>
                <Input className="input" value={InfData?.gardaRegNo} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Children :</p>
                <Input className="input" value={InfData?.gardaRegNo} />
              </div>
              <Divider>Corresondence Details</Divider>
              <div className="lbl-inpt">
                <p className="lbl">Email :</p>
                <Input className="input" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Mobile :</p>
                <Input className="input" placeholder="000-000-0000" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Other Contact :</p>
                <Input className="input" placeholder="000-000-0000" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Building or House :</p>
                <Input className="input" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Street or Road :</p>
                <Input className="input" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Area or Town :</p>
                <Input className="input" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">County, City or Postcode :</p>
                <Input className="input" />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Eircode :</p>
                <Input className="input" />
              </div>
            </div>
          </Col>

          <Col span={8} >
            <div className="details-con-header"><h2>Professional Details</h2></div>
            <div className="detail-sub-con">
              <div className="lbl-inpt">
                <p className="lbl">Station :</p>
                <Input value={InfData?.gardaRegNo} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Station Phone :</p>
                <Input value={InfData?.gardaRegNo} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">District :</p>
                <MySelect placeholder="0000-AAA-BBB" isSimple={true} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Division :</p>
                <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Retired :</p>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                  <Checkbox
                    onChange={onCheckboxChange}
                    style={{
                      flex: '1', // Set checkbox width
                      marginRight: '5px', // Space between checkbox and input
                      height: '33px', // Set height to match input field
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    checked={InfData?.isPensioner}
                  />
                  <Input
                    type="text"
                    placeholder="Enter something..."
                    disabled={!InfData?.isPensioner} // Disable input when checkbox is not checked
                    // style={{
                    //   flex: '3', // 75% width
                    //   padding: '6px',  // Reduced padding to match checkbox
                    //   borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
                    //   border: "1px solid #333333",
                    //   outline: 'none',
                    //   height: '33px', // Set height
                    //   backgroundColor: !InfData?.isPensioner ? 'white' : '#f0f0f0', // Change background if disabled
                    // }}
                    value={InfData?.pensionNo}
                  />
                </div>
              </div>

              <div className="lbl-inpt">
                <p className="lbl">Pension No :</p>
                <Input
                  type="text"
                  placeholder="Enter something..."
                  disabled={!InfData?.isPensioner} // Disable input when checkbox is not checked              
                  value={InfData?.pensionNo}
                />

              </div>
              <div className="lbl-inpt">
                <p className="lbl">Rank :</p>
                <div style={{ display: 'flex', width: '100%' }}>
                  <Input
                    type="text"
                    placeholder="Enter something..."
                    style={{
                      flex: '3', // 75% width
                      padding: '6px',  // Reduced padding to match button
                      borderRadius: '5px 0 0 5px',
                      border: "1px solid #333333",
                      outline: 'none',
                      height: '33px', // Set a specific height matching the button
                    }}
                    value={InfData?.rank}
                  />
                  <Button
                    onClick={RankOpenCloseFtn}
                    style={{
                      flex: '1', // 25% width
                      marginLeft: '5px', // Add some space between input and button
                      borderRadius: '5px', // Make button fully rounded
                      border: '1px solid #ccc',
                      backgroundColor: '#007BFF',
                      color: 'white',
                      height: '33px', // Same height as the input field
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Rank
                  </Button>
                </div>
              </div>

              <div className="lbl-inpt">
                <p className="lbl">Duty:</p>
                <div style={{ display: 'flex', width: '100%' }}>
                  <Input
                    type="text"
                    placeholder="Enter something..."
                    style={{
                      flex: '3', // 75% width
                      padding: '6px',  // Reduced padding to match buttons
                      borderRadius: '5px 0 0 5px',
                      border: "1px solid #333333",
                      outline: 'none',
                      height: '33px', // Set a specific height matching the button
                    }}
                    value={InfData?.duty}
                  />
                  <Button
                    onClick={DutyOpenCloseFtn}
                    style={{
                      flex: '1', // 25% width
                      marginLeft: '5px', // Add some space between input and button
                      borderRadius: '5px', // Make button fully rounded
                      border: '1px solid #ccc',
                      backgroundColor: '#007BFF',
                      color: 'white',
                      height: '33px', // Same height as the input field
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Duty
                  </Button>
                </div>
              </div>
              <Divider>Training Details</Divider>
              <div className="lbl-inpt">
                <p className="lbl">Templemore :</p>
                <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Class  :</p>
                <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Attested :</p>
                <DatePicker style={{ width: "100%", border: "1px solid", borderRadius: "3px" }} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Graduation :</p>
                <DatePicker style={{ width: "100%", border: "1px solid", borderRadius: "3px" }} />
              </div>
              <div className="lbl-inpt">
                <p className="lbl">Notes :</p>
                <textarea placeholder="Enter Note" style={{ width: "100%", border: "1px solid", borderRadius: "3px" }} />
              </div>
            </div>
          </Col>
          <Col span={8} >
            <div className="details-con-header"><h2>Membership & Subscriptions</h2></div>
            <div className="detail-sub-con">
            </div>
          </Col>
        </Row>
        <Row>
          <Col>

          </Col>
        </Row>
      </div>
    </div>
  );
}

export default MyDeatails;
