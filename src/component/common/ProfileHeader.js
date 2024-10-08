import React, { useState } from 'react';
import { Upload, message, Divider } from 'antd';
import { FiUpload } from "react-icons/fi";
import { useLocation } from 'react-router-dom';
import { useTableColumns } from '../../context/TableColumnsContext ';
import { Repeat } from '@mui/icons-material';
import '../../styles/ProfileHeader.css'
function ProfileHeader() {
    const [imageUrl, setImageUrl] = useState("");
    const {ProfileDetails} = useTableColumns()
    const [loading, setLoading] = useState(false);
    const location = useLocation();

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
            <div className="profile-header-container" style={{
                display: 'flex',
                flexDirection: 'column'     // Center vertically
            }}>
                <div className='d-flex justify-content-center'>
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
                                    color: "#FF0000", // Change the color to white for better visibility

                                }}>
                                    <FiUpload className="upload-icon" />
                                    <h1 style={{ margin: 0 }}>JS</h1>
                                </div>
                            )}
                        </div>
                    </Upload>
                </div>

                <div style={{
                    display: 'flex',
                }}>
                </div>
                <div className='d-flex  justify-content-center flex-column'>
                    <div className="centered-text-large">{ProfileDetails[0]?.regNo}</div>
                    <div className="centered-text">{ProfileDetails[0]?.fullName}</div>
                    <div className="centered-text">20/06/1979 (36 Y)</div>
                    <div className="centered-text">Married</div>
                    <div className="centered-text-deceased">11/10/2015 (Deceased)</div>
                    <div className="centered-text">Cases:</div>
                    <div className="centered-text">Claims:</div>

                </div>
            </div>
            <Divider type='horizontal' />
            <div className='justify-content-center' style={{
                display: 'flex', flexDirection: 'column', fontWeight: 'bold', fontSize: '14px', color: '#6B7AAB',
            }}>
                <div>Member (01/01/2020 - 11/10/2015)</div>
                <div>Graduated on: 01/09/2007</div>
                <div>Attested on: 01/01/2008</div>
                <div>Statue</div>
                <div>0001 Garda</div>
                <div>0021 Garda</div>
                <div>0109 CDU-SDU</div>
                <div>0026 CDU/SDU</div>
                <Divider type='horizontal' />
                <div>District Rep:</div>
                <div>District Secretary:</div>
                <div>District Chairman:</div>
                <div>CEC Rep:</div>
                <Divider type='horizontal' />
                <div>Life Assurance (Member):</div>
                <div>Life Assurance (Partner):</div>
                {/* <div style={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold', fontSize: '14px' }}>
                   <span style={{ marginRight: '45px' }}>Member</span>
                   <span>Partner</span>
                </div> */}
                <br />
                <div>Special Illness (Member):</div>
                {/* <div>Special Illness (Partner):</div> */}

                {/* <div style={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold', fontSize: '14px' }}>
                    <span style={{ marginRight: '45px' }}>Member</span>
                    <span>Partner</span>
                </div> */}
                <div style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold', fontSize: '14px' }}>
                    <br />
                    {/* <div>Illness & Injury</div>
                    <div>Legal Assistance</div>
                    <div>Salary Protection</div> */}
                </div>
            </div>
        </div>
    )
}

export default ProfileHeader;   