import { React, useState } from "react";
import { Tabs, message, Button, DatePicker, Radio } from "antd";
import { RadioChangeEvent } from 'antd';
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import MySelect from "../common/MySelect";
import { Input, Row, Col, Checkbox } from "antd";
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};
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

  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [value, setValue]= useState(1);
  console.log(imageUrl, "imageUrl");
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

  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const onCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
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
      label: <h1 className="primary-contact">Primary Adress</h1>,
      children: (
        <div>
          <Row gutter={20}>
            <Col span={12}>
              <p className="lbl">Building</p>
              <Input />
            </Col>
            <Col span={12}>
              <p className="lbl">Street</p>
              <Input />
            </Col>
           
          </Row>
          <Row gutter={20}>
          <Col span={12}>
              <p className="lbl">Area</p>
              <MySelect placeholder="Select area" isSimple={true} />
            </Col>
            <Col span={12}>
              <p className="lbl">City</p>
              <MySelect placeholder="Select City" isSimple={true} />
            </Col>
           
          </Row>
          <Row>
          <Col span={12}>
              <p className="lbl">Eircode</p>
              <Input />
            </Col>
            <Col span={12}>
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
          <Col span={12}>
            <p className="lbl">Building</p>
            <Input />
          </Col>
          <Col span={12}>
            <p className="lbl">Street</p>
            <Input />
          </Col>
         
        </Row>
        <Row gutter={20}>
        <Col span={12}>
            <p className="lbl">Area</p>
            <MySelect placeholder="Select area" isSimple={true} />
          </Col>
          <Col span={12}>
            <p className="lbl">City</p>
            <MySelect placeholder="Select City" isSimple={true} />
          </Col>
         
        </Row>
        <Row>
        <Col span={12}>
            <p className="lbl">Eircode</p>
            <Input />
          </Col>
          <Col span={12}>
          </Col>
        </Row>
      </div>
      ),
    },
  ];
  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          label: <h1 className="primary-contact">Personal Information</h1>,
          key: "1",
          children: (
            <div className="padding-bottom">
              <Row gutter={20}>
                <Col span={8}>
                  <p className="lbl">Garda Reg No:</p>
                  <Input />
                </Col>
              </Row>
              <Row gutter={20}>
              <Col span={8}>
                  <p className="lbl">Fullname</p>
                  <Input />
                </Col>
              <Col span={8}>
                  <p className="lbl">Forename</p>
                  <Input />
                </Col>
                <Col span={8}>
                  <p className="lbl">Surename</p>
                  <Input />
                </Col>
               
              </Row>
              <Row gutter={20}>
                  <Col span={8}>
                  <p className="lbl">Date Of Birth</p>
                      <DatePicker
                        style={{
                          width: "100%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
               </Col>
              <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Next B/d :</p>
                  <Input />
                </Col>
                <Col style={{ width: "33.00%" }}>
                  <p className="lbl">Gender</p>
                  <>
                    <Radio.Group onChange={onChange} value={value}>
                      <Radio value={1}>Male</Radio>
                      <Radio value={2}>Female</Radio>
                      <Radio value={3}>Other</Radio> 
                    </Radio.Group>
                  </>
                </Col>
              
                {/* <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Sexual Orientation</p>
                  <Input />
                </Col> */}

                
               
              </Row>

              <Row gutter={20}>
              
                <Col style={{ width: '33.00%' }}>
                   <p className="lbl">Date Retired</p>
                      <DatePicker
                        style={{
                          width: "100%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
               </Col>
               <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Date Aged 65 :</p>
                  <DatePicker
                        style={{
                          width: "100%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
                </Col>
                <Col style={{ width: '13.00%' }}>
                  <p className="lbl">Deceased</p>
                  <Checkbox onChange={onCheckboxChange}></Checkbox>
                </Col>
                <Col style={{ width: '20.00%' }}>
                   <p className="lbl">Date of death</p>
                      <DatePicker
                      disabled={!isChecked}
                        style={{
                          width: "100%",
                          border: "1px solid #333333",
                          borderRadius: "3px",
                        }}
                        className=""
                      />
               </Col>
               
              </Row>
              <Row gutter={20}>
                <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Partnership</p>
                  <MySelect placeholder="Select Partnership" isSimple={true} />
                </Col>
                <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Children</p>
                  <Input type="number" />
                </Col>
              </Row>
              <Row gutter={20}>
                <Col style={{ width: '33.00%' }}>
                  <p className="lbl">Email</p>
                  <Input type="number" />
                </Col>
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
                <Button className="gray-btn butn">Save</Button>
                <Button className=" butn" onClick={()=>{}}>Cancel</Button>

                </div>
            </div>
          ),
        },
        {
          label: <h1 className="primary-contact">Official Information</h1>,
          key: "2",
          children: (
            <div className="padding-bottom">
            <Row gutter={20}>
              <Col span={12}>
                <p className="lbl">Station:</p>
                <MySelect placeholder="STOC" isSimple={true} />
                <br/>
                <br/>
                <Input />
                <br/>
                <br/>
                <Input />
              </Col>
              <Col span={12}>
                <p className="lbl">Forename</p>
                <Input />
              </Col>
              <Col span={12}>
                <p className="lbl">Station Ph :</p>
                <Input placeholder ="00-000-0000"/>
              </Col>
              <Col span={12}>
                <p className="lbl">District:</p>
                <MySelect placeholder="0000-AAA-BBB" isSimple={true} />
                </Col>
                <Col span={12}>
                <p className="lbl">Division:</p>
                <MySelect placeholder="0000-CCC-DDD" isSimple={true} />
                </Col>
                <Col span={12}>
                   <p className="lbl">Date Retired</p>
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

            </Row>
            </div>
          ),
          
        },
        {
          label: <h1 className="primary-contact">Membership</h1>,
          key: "3",
          children: "Tab 3",
        },
      ]}
    />
  );
}

export default MyDeatails;
