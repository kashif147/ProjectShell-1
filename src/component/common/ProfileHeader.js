import {React, useState }from 'react'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Row, Upload, Col, message } from 'antd';
import { FiUpload } from "react-icons/fi";

function ProfileHeader() {
    const [imageUrl, setImageUrl] = useState("");
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const customRequest = ({ file, onSuccess, onError }) => {
        setTimeout(() => {
          if (file) {
            onSuccess({ url: URL.createObjectURL(file) }, file);
          } else {
            onError(new Error("Upload failed."));
          }
        }, 1000);
      };
      const handleChange1 = (info) => {
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
  return (
    <div className='profil-container-main d-flex flex-column'>
       {location?.pathname == "/Details" && (
            <div className="patient-header">
              
                  <Upload
                    customRequest={customRequest}
                    showUploadList={false}
                    onChange={handleChange1}
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
                          }}
                        />
                      ) : (
                        <div className="profile-image">
                          <FiUpload className="upload-icon" />

                          <h1>JS</h1>
                        </div>
                      )}
                    </div>
                  </Upload>
                

            </div>
          )}
          <h1 className="primary-contact">Profile Header</h1>
    </div>
  )
}

export default ProfileHeader
