import React, { useState } from 'react';
import { Upload, message, Divider } from 'antd';
import { FiUpload } from "react-icons/fi";
import { useLocation } from 'react-router-dom';
import { useTableColumns } from '../../context/TableColumnsContext ';
// import { Repeat } from '@mui/icons-material';
// import '../../styles/ProfileHeader.css'
function ProfileHeader() {
    const [imageUrl, setImageUrl] = useState("");
    const { ProfileDetails } = useTableColumns()
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
        <div className='profil-container-main d-flex flex-column' style={{width:'14%',height:'88vh'}}>
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
                                        width: "80px",
                                        height: "80px",
                                        borderRadius: "50%",
                                    }}
                                />
                            ) : (
                                <div className="profile-image" style={{
                                    width: "80px",
                                    height: "80px",
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
                {
                    ProfileDetails?.map((i) => (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center', 
                            // textAlign: 'center', 
                            fontWeight: 'bold',
                            fontSize: '14px',
                            color: '#6B7AAB',
                        }}>      
                            <div style={{color:'#C97A2F', fontSize:'18px'}} >{i?.regNo}</div>
                            <div style={{color:'#215E97', fontSize:'18px',fontWeight:400}}>{i?.fullName}</div>
                            <div style={{color:'#215E97', fontSize:'16px',fontWeight:400}}>(M) 36A Yrs</div>
                            {/* <div >Married</div> */}
                            <div style={{color:'#C97A2F', fontSize:'18px',marginTop:'20px',}} >Member</div>
                            <div style={{color:'#C97A2F', fontSize:'14px',fontWeight:400,fontWeight:400}}>joined:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01/01/2016</div>
                            <div style={{color:'#C97A2F', fontSize:'14px',fontWeight:400,fontWeight:400}}>renewed:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01/01/2016</div>
                            <div style={{color:'#C97A2F', fontSize:'14px',fontWeight:400,fontWeight:400}}>Expiry:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;01/01/2016</div>
                            <div style={{color:'#C97A2F', fontSize:'18px',marginTop:'20px',fontWeight:400,marginBottom:'10px'}} >General - All Grades</div>
                            <div style={{color:'#215E97', fontSize:'18px',fontWeight:400}}>Balance:&nbsp;&nbsp;<span style={{fontWeight:'bold'}}>€200</span></div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400}}>Salary Deduction :&nbsp;&nbsp;<span style={{fontWeight:'bold'}}>- QTR</span></div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400, marginTop:'5px'}}>last payment: &nbsp;&nbsp;<span style={{fontWeight:'bold'}}>€74.7 </span></div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400, marginTop:'5px'}}><span style={{fontWeight:''}}>01/03/2025</span></div>
                            <div style={{color:'#215E97', fontSize:'18px',marginTop:'20px',fontWeight:400}} >STOC</div>
                            <div style={{color:'#215E97', fontSize:'12px'}} >Hardcore Square 2</div>
                            <div style={{color:'#215E97', fontSize:'14px',fontWeight:400,marginTop:'5px',marginBottom:'5px'}} >0109  CDU-SDU</div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400,marginTop:'5px',marginBottom:'5px'}} >0026 CDU/SDU</div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400,marginTop:'5px',marginBottom:'5px'}} >0001 Garda</div>
                            <div style={{color:'#215E97', fontSize:'18px',marginTop:'20px',fontWeight:400}} >CEC Rep</div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400,marginTop:'5px',marginBottom:'5px'}} >Life Assurance (Member)</div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400,marginTop:'5px',marginBottom:'5px'}} >Illness / Injury</div>
                            <div style={{color:'#215E97', fontSize:'12px',fontWeight:400,marginTop:'5px',marginBottom:'5px'}} >Garda Review</div>
                            {/* <div className="centered-text-deceased">11/10/2015 (Deceased)</div>
                            <div >Cases:</div>
                            <div >Claims:</div> */}

                        </div>
                    ))
                }
            </div>
            
             
            
        </div>
    )
}

export default ProfileHeader;   