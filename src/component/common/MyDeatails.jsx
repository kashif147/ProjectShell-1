import { React, useState } from "react";
import { Tabs, Upload, Flex, message, Button, DatePicker } from "antd";
import { AndroidOutlined, AppleOutlined } from "@ant-design/icons";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { FaRegCircleUser } from "react-icons/fa6";
import MySelect from "../common/MySelect";
import { Input, Row, Col } from "antd";
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

function MyDeatails() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  console.log(imageUrl, "imageUrl");
  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      // Assuming the server returns the URL of the uploaded image
      setLoading(false);
      setImageUrl(info.file.response.url);
      message.success("Image uploaded successfully");
    } else if (info.file.status === "error") {
      setLoading(false);
      message.error("Image upload failed.");
    }
  };

  const customRequest = ({ file, onSuccess, onError }) => {
    // Simulate an upload process with a delay
    setTimeout(() => {
      if (file) {
        // Here you would typically send the file to your server
        // For this example, we'll simulate a successful upload
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
  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          label: "Personal Information",
          key: "1",
          children: (
            <div>
              <Row gutter={20}>
                <Col span={7}>
                  <p className="lbl">Garda Reg No:</p>
                  <Input />
                  <div className="d-flex w-100">
                    <div className="w-100">
                      <p className="lbl">Date Of Birth</p>
                      <DatePicker style={{ width: "100%" }} className="" />
                    </div>
                    <div className="w-100" style={{ marginLeft: "1rem" }}>
                      <p className="lbl">Date Aged 65</p>
                      <DatePicker style={{ width: "100%" }} className="" />
                    </div>
                  </div>
                </Col>
                <Col span={7}>
                  <p className="lbl">Forename</p>
                  <Input />
                  <p className="lbl">Forename</p>
                  <Input />
                </Col>
                <Col span={7}>
                  <p className="lbl">Gernder</p>
                  <Input />
                  <p className="lbl">Forename</p>
                  <Input />
                </Col>
                <Col span={3}>
                  <Upload
                    customRequest={customRequest}
                    showUploadList={false}
                    onChange={handleChange}
                    accept="image/*"
                  >
                    <div className="d-flex flex-column">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Uploaded"
                          style={{
                            width: "150px",
                            height: "auto",
                            marginTop: "10px",
                            marginBottom: "10px",
                          }}
                        />
                      ) : (
                        <FaRegCircleUser
                          style={{
                            width: "100px",
                            height: "auto",
                            opacity: "0.9",
                            marginTop: "10px",
                          }}
                        />
                      )}
                      {uploadButton}
                    </div>
                  </Upload>
                </Col>
              </Row>
              <Row gutter={20}>
                <Col span={7}>
                  <p className="lbl">Partnership</p>
                  <div className="d-flex align-items-baseline">
                    <MySelect placeholder="Partnership" />
                    
                  </div>
                </Col>
                <Col span={7}>
                <p className="lbl">
                Children
                </p>
                  <Input type="number" />
                </Col>
                <Col span={7}></Col>
              </Row>
              <h2 className="primary-contact">Primery Contact:</h2>
            </div>
          ),
        },
        {
          label: "Offical Information",
          key: "2",
          children: "Tab 3",
        },
        {
          label: "Membership",
          key: "3",
          children: "Tab 3",
        },
      ]}
    />
  );
}

export default MyDeatails;
