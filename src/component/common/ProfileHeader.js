import React, { useState } from 'react';
import { FiUpload } from "react-icons/fi";
import { useLocation } from 'react-router-dom';
import { useTableColumns } from '../../context/TableColumnsContext ';
import { Card, Avatar, Button, Tag, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
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
            // message.success("Image uploaded successfully");
        } else if (info.file.status === "error") {
            setLoading(false);
            // message.error("Image upload failed.");
        }
    };

    return (
        <div className='d-flex flex-column ms-2 me-2 pe-2 ps-2 pt-2' style={{ width: '20%', height: '88vh', backgroundColor:'#e6f8ff' }}>
            <Card
                style={{ borderRadius: 8, backgroundColor:'##e6f8ff' }}
               
            >
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <Avatar size={64} style={{ backgroundColor: "#e6f7ff" }} icon={<UserOutlined />} />
                    <div style={{ marginTop: 8, fontWeight: 600, fontSize: 16 }}>Jack Smith</div>
                    <div style={{ color: "#8c8c8c", fontSize: 12 }}>(M) 36A Yrs</div>
                    <Tag color="#52c41a" style={{ marginTop: 4 }}>
                        Active Member
                    </Tag>
                </div>

                <div style={{ marginBottom: 12, }}>
                    <div>
                        <strong>Member ID:</strong>{" "}
                        <span style={{ color: "#1890ff", cursor: "pointer" }}>45217A</span>
                    </div>
                    <div>
                        <strong>Joined:</strong> 01/01/2016
                    </div>
                    <div>
                        <strong>Expires:</strong> 01/01/2026
                    </div>
                    <div>
                        <Divider />
                        <strong>Balance:</strong>{" "}
                        <span style={{ color: "#52c41a", fontWeight: 600 }}>€200</span>
                    </div>
                    <div>
                        <strong>Last Payment:</strong> €74.7
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <Button danger style={{ flex: 1 }}>
                        Cancel
                    </Button>
                </div>
            </Card>

            <Card className='mt-2'>
                <div style={{ fontSize: 12, color: "#595959",  }}>
                    <div>
                        <strong>Grade:</strong> General - All Grades
                    </div>
                    <div>
                        <strong>Category:</strong> Undergraduate Student
                    </div>
                    <div>
                        <strong>Status:</strong> STOC Member
                    </div>
                </div>

            </Card>


        </div>
    )
}

export default ProfileHeader;   