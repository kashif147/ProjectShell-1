import React, { useState } from 'react';
import { Upload, message, Divider, Space } from 'antd';
import { FiUpload } from "react-icons/fi";
import Column from 'antd/es/table/Column';

function ProfileHeader() {
    const [imageUrl, setImageUrl] = useState("");
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
            <div className="profile-header-container" style={{ display: 'flex', alignItems: 'center' }}>
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
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    color: "#FF0000",
                                }}
                            />
                        ) : (
                            <div className="profile-image" style={{
                                width: "100px",
                                height: "100px",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "50%",
                                backgroundColor: "#FF0000",
                                fontSize: "32px",
                                color: "#FF0000",
                            }}>
                                <FiUpload className="upload-icon" />
                                <h1 style={{ margin: 0 }}>JS</h1>
                            </div>
                        )}
                    </div>
                </Upload>
                <Divider type='vertical' style={{ height: "100%", margin: "0 20px", backgroundColor: "#FFFFFF" }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 'bold', color: '#FFD700', fontSize: '12px' }}>Code 56606L</div>
                    <div style={{ fontWeight: 'bold', color: '#6B7AAB', fontSize: '12px' }}>Jack Smith</div>
                    <div style={{ fontWeight: 'bold', color: '#6B7AAB', fontSize: '12px' }}>20/06/1979 (36 Y)</div>
                    <div style={{ fontWeight: 'bold', color: '#6B7AAB', fontSize: '12px' }}>Married</div>
                    <div style={{ fontWeight: 'bold', color: '#FF7F7F', fontSize: '12px' }}>11/10/2015 (Deceased)</div>
                </div>
            </div>
            <Divider type='horizontal' />
            
            <div style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold', color: '#555', fontSize: '12px', color: '#6B7AAB' }}>
                   <div>Cases:</div>
                   <br/>
                   <div>Claims:</div>
                   <br/>
                   <div>Member (01/01/2020 - 11/10/2015)</div>
                   <div>Draduated on: 01/09/2007</div>
                   <div>Attested on: 01/01/2008</div>
                   <br/>
                   <div>Statue</div>
                   <br/>
                   <div>0001 Garda</div>
                   <div>0021 Garda</div>
                   <div>0109 CDU-SDU</div>
                   <div>0026 CDU/SDU</div>
                <Divider type='horizontal' />
                   <div>District Rep:</div>
                   <br/>
                   <div>District Secretary:</div>
                   <br/>
                   <div>District Chairman:</div>
                   <br/>
                   <div>CEC Rep:</div>
                <Divider type='horizontal' />
                   <div>Life Assurance:</div>
                <br/>
                <div style={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold', color: '#555', fontSize: '12px', color: '#6B7AAB' }}>
                   <span style={{ marginRight: '45px' }}>Member</span>
                   <span>Partner</span>
                </div>
                   <br/>
                   <div>Special Illness:</div>
                   <br/>
                <div style={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold', color: '#555', fontSize: '12px' , color: '#6B7AAB'}}>
                <br/>
                  <span style={{ marginRight: '45px' }}>Member</span>
                  <span>Partner</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold', color: '#555', fontSize: '12px', color: '#6B7AAB' }}>
                  <br/>
                <div>Illness & Injury</div>
                <br/>
                <div>Legal Assistance</div>
                <br/>
                <div>Salary Protection</div>
                </div>
            </div>

        </div>
    )
}

export default ProfileHeader;