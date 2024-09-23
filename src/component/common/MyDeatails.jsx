
import { React, useState } from "react";
import { Tabs, message, Button, DatePicker, Radio, Divider } from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import MySelect from "../common/MySelect";
import { Input, Row, Col, Checkbox } from "antd";
import MyDrawer from "./MyDrawer"; 

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

{/* Extra */} 
 
{/* Extra */}

function MyDeatails() {
  const [activeTab, setActiveTab] = useState("1");
  const [isChecked, setIsChecked] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [value, setValue]= useState(1);
  // console.log(imageUrl, "imageUrl");
  const [isTransfer, setisTransfer] = useState(false); 
  const [isRank, setisRank] = useState(false);
  const [isDuty, setisDuty] = useState(false);

  const [TransferData, setTransferData] = useState({
    NewStationID: "",
    NewStationName: "",
    NewStationAddress: "",
    NewDistrict: "",
    NewDivision: "",
    TransferDate:"",
    TransferMemo:"",
  });

  const [RankData, setRankData] = useState({
   CurrentRank:"",
   NewlyAssignedRank:"",
  });

  const [DutyData, setDutyData] = useState({
    CurrentDuty:"",
    NewlyAssignedDuty:"",
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

  const [personalInfoChecked, setPersonalInfoChecked] = useState(false);

  // State for GRA Information
  const [graInfoChecked, setGraInfoChecked] = useState(false);

  // State for Membership Information
  const [membershipInfoChecked, setMembershipInfoChecked] = useState(false);

  // Handlers for each checkbox
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
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Building or House</p>
              <Input />
            </Col>
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Street or Road</p>
              <Input />
            </Col>
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Area or Town</p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>
           
          </Row>
          <Row gutter={20}>
   
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">City, County or Postcode</p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
            <Col style ={{ width: '33.00%' }}>
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
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Building or House</p>
              <Input />
            </Col>
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Street or Road</p>
              <Input />
            </Col>
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Area or Town</p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>
           
          </Row>
          <Row gutter={20}>
   
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">City, County or Postcode</p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
            <Col style ={{ width: '33.00%' }}>
              <p className="lbl">Eircode</p>
              <Input />
            </Col>
           
          </Row>
      </div>
      
      ),
    },
  ];
  return (
    
    <Tabs
      defaultActiveKey="1"
      activeKey={activeTab}
      onChange={setActiveTab}
      items={[
        {
          label: <h1 className="primary-contact">Personal Information</h1>,
          key: "1",
          children: (
            <div className="padding-bottom">
              <Row gutter={20}>
                <Col style ={{ width: '33.00%' }}>
                  <p className="lbl">Garda Reg No:</p>
                  <Input />
                </Col>
              </Row>
              <Row gutter={20}>
              <Col style ={{ width: '33.00%' }}>
                  <p className="lbl">Fullname</p>
                  <Input  style={{
                          width: "100%",
                          border: "1px solid",
                          borderRadius: "3px",
                        }} className=""/>
                </Col>
              <Col style ={{ width: '33.00%' }}>
                  <p className="lbl">Forename</p>
                  <Input />
                </Col>
                <Col style ={{ width: '33.00%' }}>
                  <p className="lbl">Surname</p>
                  <Input />
                </Col>
               
              </Row>
              <Row gutter={20}>
                  <Col style ={{ width: '33.00%' }}>
                  <p className="lbl">Date Of Birth</p>
                      <DatePicker
                        style={{
                          width: "100%",
                          border: "1px solid",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
               </Col>
              <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Next B/d :</p>
                  <Input disabled={true} />
                </Col>
                <Col style={{ width: "33.00%" }}>
                  <p className="lbl">Gender</p>
                <>
      
       
      <Radio.Group
      
        options={optionsWithDisabled}
        onChange={onChange4}
        value={value4}
        optionType="button"
        buttonStyle="solid"
      />
    </>
                </Col>
              
 
               
              </Row>

              <Row gutter={20}>
              
                <Col style={{ width: '33.00%' }}>
                   <p className="lbl">Date Retired</p>
                      <DatePicker
                        style={{
                          width: "100%",
                          border: "1px solid",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
               </Col>
               <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Date Aged 65 :</p>
                  <DatePicker 
                  disabled={true}
                        style={{
                          width: "100%",
                          border: "1px solid",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
                </Col>
                <Col style={{ width: '33%' }}>
      <p className="lbl">Deceased:</p>
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
        />
        <DatePicker
          type="text"
          placeholder="Date of Deceased..."
          disabled={!isChecked} // Disable input when checkbox is not checked
          style={{
            flex: '3', // 75% width
            padding: '6px',  // Reduced padding to match checkbox
            borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
            border: "1px solid",
            outline: 'none',
            height: '33px', // Set height
            backgroundColor: isChecked ? '#ebf1fd' : '#f0f1f1', // Change background if disabled
          }}
        />
      </div>
    </Col>
               
              </Row>
                 
                <Row gutter={20}>
                <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Partnership</p>
                  <MySelect placeholder="Select Partnership" isSimple={true} />
                </Col>
                <Col style={{ width: '33%' }}>
      <p className="lbl">Children:</p>
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
        />
        <input
          type="text"
          placeholder="No of children..."
          disabled={!isChecked} // Disable input when checkbox is not checked
          style={{
            flex: '3', // 75% width
            padding: '6px',  // Reduced padding to match checkbox
            borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
            border: "1px solid #333333",
            outline: 'none',
            height: '33px', // Set height
            backgroundColor: isChecked ? 'white' : '#f0f0f0', // Change background if disabled
          }}
        />
      </div>
    </Col>
    <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Email</p>
                  <Input type="number" />
                </Col>
              </Row>
             
              <Row gutter={20}>
                
                <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Primary Contact</p>
                  <Input type placeholder="000-000-0000" />
                </Col>
                <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Secondary Contact</p>
                  <Input type placeholder="000-000-0000" />
                </Col>
               
              </Row>
              <Tabs defaultActiveKey="1" items={contact} onChange={() => {}} />
                <div className="btn-main-con">
                <Button className="gray-btn butn" onClick={handleNext }>
                  Next
                </Button>
                <Button className=" butn" onClick={()=>{}}>Cancel</Button>

                </div>
            </div>
          ),
        },
        {
          label: <h1 className="primary-contact">GRA Information</h1>,
          key: "2",
          children: (
            <div className="padding-bottom">
            <Row gutter={20}>
            <Col style={{ width: '33%' }}>
  <p className="lbl">Station:</p>
  <div style={{ display: 'flex', width: '100%' }}>
    <MySelect
    isSimple={true}
      placeholder="STOC..."
      style={{
        flex: '3', // 75% width
        padding: '6px',  // Ensure padding is consistent
        borderRadius: '5px 0 0 5px',
        border: '1px solid #333333',
        outline: 'none',
        height: '33px', // Same height as the button
        boxSizing: 'border-box' // Ensure consistent sizing
      }}
    />
    <Button
      onClick={TransferOpenCloseFtn}
      style={{
        flex: '1', // 25% width
        marginLeft: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        backgroundColor: '#007BFF',
        color: 'white',
        height: '33px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      Transfer
    </Button>
  </div>
</Col>
              <Col  style={{ width: '33.00%' }}>
                <p className="lbl">Address Line 1:</p>
                <Input placeholder ="..."/>
              </Col>
              <Col  style={{ width: '33.00%' }}>
                <p className="lbl">Address Line 2:</p>
                <Input placeholder ="..."/>
              </Col>
                  </Row>
                  <Row gutter={20}>
              <Col  style={{ width: '33.00%' }}>
                <p className="lbl">Station Ph :</p>
                <Input placeholder ="00-000-0000"/>
              </Col>
              <Col  style={{ width: '33.00%' }}>
                <p className="lbl">District:</p>
                <MySelect placeholder="0000-AAA-BBB" isSimple={true} />
                </Col>
                <Col  style={{ width: '33.00%' }}>
                <p className="lbl">Division:</p>
                <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
                </Col>
                </Row>
                <Row gutter={20}>
                  <Col style={{ width: '33%' }}>
      <p className="lbl">Pensioner:</p>
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
        />
        <input
          type="text"
          placeholder="Enter something..."
          disabled={!isChecked} // Disable input when checkbox is not checked
          style={{
            flex: '3', // 75% width
            padding: '6px',  // Reduced padding to match checkbox
            borderRadius: '0 5px 5px 0', // Border radius adjusted for left side
            border: "1px solid #333333",
            outline: 'none',
            height: '33px', // Set height
            backgroundColor: isChecked ? 'white' : '#f0f0f0', // Change background if disabled
          }}
        />
      </div>
    </Col>
    <Col style={{ width: '33%' }}>
  <p className="lbl">Rank:</p>
  <div style={{ display: 'flex', width: '100%' }}>
    <input
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
</Col>
<Col style={{ width: '33%' }}>
  <p className="lbl">Duty:</p>
  <div style={{ display: 'flex', width: '100%' }}>
    <input
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
</Col>
    </Row>
            
            <Row gutter={20}>
              <Col style={{ width: '33.00%' }}>
              <p className="lbl">Templemore:</p>
              <DatePicker
                      placeholder="../../...."
                        style={{
                          width: "100%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
              </Col>
              <Col style ={{width: '33.00%'}}>
              <p className="lbl">Class:</p>
              <Input />
              </Col>
              <Col style ={{width: '33.00%'}}>
              <p className="lbl">Attested:</p>
              <Input />
              </Col>
              </Row>
              <Row gutter={20}>
              <Col style ={{width: '33.00%'}}>
              <p className="lbl">Graduated:</p>
              <Input />
              </Col>
              <Col style ={{width: '33.00%'}}>
              <p className="lbl">Notes:</p>
              <Input />
              </Col>
           </Row>
            
            <MyDrawer 
            width={"1000px"}
        open={isTransfer}
        onClose={TransferOpenCloseFtn}
        add={AddTransferFtn}
        title="Transfer">
              <div className="input-group">
          <p className="inpt-lbl">New Station ID:</p>
          <Input
            placeholder="Please enter New Station ID"
            onChange={(e) => handleInputChange("NewStationID", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">New Station Name:</p>
          <Input
            placeholder="Please enter New Station Name"
            onChange={(e) => handleInputChange("NewStationName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">New Station Address:</p>
          <Input
            placeholder="Please enter New Station Address"
            onChange={(e) => handleInputChange("NewStationAddress", e.target.value)}
          /> 
        </div>
        <div className="input-group">
          <p className="inpt-lbl">New District</p>
          <Input
            placeholder="Please enter New District"
            onChange={(e) => handleInputChange("NewDistrict", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">New Division:</p>
          <Input
            placeholder="Please enter New Division"
            onChange={(e) => handleInputChange("NewDivision", e.target.value)}
          />
        </div>
        <Divider  style={{ borderColor: '#333' }} />

        <div className="input-group">
          <p className="inpt-lbl">Transefer Date:</p>
          <DatePicker
                        style={{
                          width: "100.00%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Transefer Memo:</p>
          <Input
            placeholder="Please enter Transfer Memo"
            onChange={(e) => handleInputChange("TransferMemo", e.target.value)}
          />
        </div>

            </MyDrawer>
          {/* Drawer 2*/}
<MyDrawer 
            width={"1000px"}
        open={isRank}
        onClose={RankOpenCloseFtn}
        add={AddRankFtn}
        title="Transfer">
              <div className="input-group">
          <p className="inpt-lbl">New Rank:</p>
          <Input
            placeholder="Please enter Current Rank"
            onChange={(e) => handleInputChange1("CurrentRank", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">New Station Name:</p>
          <Input
            placeholder="Please enter Newly Assigned Rank"
            onChange={(e) => handleInputChange1("NewlyAssignedRank", e.target.value)}
          />
        </div>
       
        <Divider  style={{ borderColor: '#333' }} />

        <div className="input-group">
          <p className="inpt-lbl">Transefer Date:</p>
          <DatePicker
                        style={{
                          width: "100.00%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Transefer Memo:</p>
          <Input
            placeholder="Please enter Transfer Memo"
            onChange={(e) => handleInputChange("TransferMemo", e.target.value)}
          />
        </div>

            </MyDrawer>

             {/* Drawer 2*/}
<MyDrawer 
            width={"1000px"}
        open={isRank}
        onClose={DutyOpenCloseFtn}
        add={AddDutyFtn}
        title="Transfer">
              <div className="input-group">
          <p className="inpt-lbl">New Duty:</p>
          <Input
            placeholder="Please enter Current Rank"
            onChange={(e) => handleInputChange1("CurrentDuty", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">New Station Name:</p>
          <Input
            placeholder="Please enter Newly Assigned Rank"
            onChange={(e) => handleInputChange1("NewlyAssignedDuty", e.target.value)}
          />
        </div>
       
        <Divider  style={{ borderColor: '#333' }} />

        <div className="input-group">
          <p className="inpt-lbl">Transefer Date:</p>
          <DatePicker
                        style={{
                          width: "100.00%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Transefer Memo:</p>
          <Input
            placeholder="Please enter Transfer Memo"
            onChange={(e) => handleInputChange("TransferMemo", e.target.value)}
          />
        </div>

            </MyDrawer>
             
            </div>
          ),
          
           

        },
        {
          label: <h1 className="primary-contact">Membership & Subscriptions</h1>,
          key: "3",
          children: (
            <div className="padding-bottom">
            <Row gutter={20}>
            <Col style={{ width: '33.00%' }}>
            <p className="lbl">GRA Member</p>
            <Checkbox onChange={onCheckboxChange}></Checkbox>
          </Col>
          <Col style={{ width: '33.00%' }}>
             <p className="lbl">Date Joined:</p>
             <DatePicker
                        disabled={!isChecked}
                        style={{
                          width: "100.00%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
         </Col>
         <Col style={{ width: '33.00%' }}>
             <p className="lbl">Date Left:</p>
             <DatePicker
                        disabled={!isChecked}
                        style={{
                          width: "100.00%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
         </Col>
         </Row>
         <Row gutter={20}>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl">Associate Member:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl">.</p>
            <Button  disabled={!isChecked}>Statue </Button>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> District Rep:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> District Sec:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> District Chair:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> Division Rep:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> Division Sec:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> Division Chair:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> C.E.C:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>
          <Col style={{ width: '33.00%' }}>
            <p className="lbl"> Panel of Friends:</p>
            <Checkbox  disabled={!isChecked}/>
          </Col>

         </Row>
         </div>
          ),
        },
      ]}
    />
  );
}

export default MyDeatails;
