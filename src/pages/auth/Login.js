import { React, useState } from 'react'
import "../../styles/Login.css"
import loginImg from "../../assets/images/img1.png"
import { WindowsFilled } from '@ant-design/icons';
import { Button, Checkbox, Divider, Input } from 'antd';
import { Link } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

const Login = () => {
    const { instance, inProgress } = useMsal(); // Get the MSAL instance and interaction status

    const handleLogin = () => {
        if (inProgress !== InteractionStatus.None) {
            // If interaction is in progress, prevent new interaction
            console.log("Interaction is in progress, please wait...");
            return;
        }

        instance.loginPopup({
            scopes: ["openid", "profile", "User.Read"], // Scopes you need
        }).then((response) => {
            console.log("Login response: ", response);
        }).catch(e => {
            console.error("Error during login:", e);
        });
    };

    const handleLogout = () => {
        instance.logoutPopup().catch(e => {
            console.error("Error during logout:", e);
        });
    };

// function Login() {
// function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <main role="main" className="">
            <div className="login-wrapper main-container">
                <div className="imag-con">
                    <img
                        className="login-image"
                        src={loginImg} alt="Logo" />
                </div>
                <div className="login-con">
                    {/* <h1 className='login-welcom'>Welcome Back</h1> */}
                    <h1 className='login-heading'>Login with Microsoft or enter your details</h1>
                    <div style={{paddingTop:"10px", paddingBottom:"10px"}}>
                    <Button  size="large" style={{background:"#dcdfe4",width:"100%",margintTop:"10px", marginBottom:"10px"}} className='d-flex align-items-baseline butn'
                    
                    onClick={handleLogin} 
                            disabled={inProgress !== InteractionStatus.None} // Disable button if login is in progress
                            >
                        <span
                            style={{
                               
                                width: 16,
                                height: 16,
                                marginRight: 8,
                            }}
                            
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="23px" height="23px">
                                <rect width="22" height="22" x="2" y="2" fill="#F25022" />
                                <rect width="22" height="22" x="24" y="2" fill="#7FBA00" />
                                <rect width="22" height="22" x="2" y="24" fill="#00A4EF" />
                                <rect width="22" height="22" x="24" y="24" fill="#FFB900" />
                            </svg>
                        </span>
                        {/* <span>Login with Microsoft</span> */}


                {inProgress === InteractionStatus.None ? "Login with Microsoft" : "Logging in..."}

                    </Button>

                    </div>
                    <Divider orientation="center" style={{ fontWeight: "400", fontSize: "12px" }}>Or</Divider>
                    <form className="login-form">
                        <div className="form-group">
                            <label>Email</label>
                            <Input className='login-form-input' />
                        </div>
                        <div className="mb-3 position-relative">
                            <label>Password</label>
                            <div className="d-flex align-items-center">
                                <Input
                                    className='login-form-input'
                                    type={showPassword ? 'text' : 'password'}
                                    suffix={showPassword ? < AiFillEye size={20} onClick={togglePasswordVisibility} /> : <AiFillEyeInvisible size={20} onClick={togglePasswordVisibility} />}
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between">

                            <Checkbox>Remember me</Checkbox>
                            <Link href="/reset-password" className='font-color-12'>Forgot Password?</Link>

                        </div>
                        <Button style={{ backgroundColor: "#086d99", color: "white", borderRadius: "3px", width: "100%", marginTop: "20px", marginBottom: "10px" }} classNames="login-btn" onClick={() => {
                              navigate("/Summary",{
                                state: {
                                  search: "Profile"
                                },
                              })
                            }}>Log in</Button>
                    </form>
                    <p className='font-color-12 text-center'>
                        Don't have an account? <a href="/contact-us">Request access</a>
                    </p>
                </div>
            </div>
        </main>

    )
}

export default Login;