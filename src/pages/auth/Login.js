import { React, useState,useEffect } from 'react'
import "../../styles/Login.css"
// import loginImg from "../../assets/images/img1.png"
import loginImg from "../../assets/images/gra_logo.png"
// import { WindowsFilled } from '@ant-design/icons';
import { Button, Checkbox, Divider, Input } from 'antd';
import { Link } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/AuthSlice';
import { generatePKCE } from '../../utils/Utilities';

const Login = () => {
    const dispatch = useDispatch();

    const { instance, inProgress } = useMsal(); // Get the MSAL instance and interaction status
    const navigate = useNavigate(); // Use the useHistory hook
    const { loading, } = useSelector((state) => state.auth);

  // Step 1: Login button click
const handleLogin = async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE();

    // Save codeVerifier for later token exchange
    sessionStorage.setItem("pkce_code_verifier", codeVerifier);

    const tenantId = "39866a06-30bc-4a89-80c6-9dd9357dd453";
    const clientId = "ad25f823-e2d3-43e2-bea5-a9e6c9b0dbae";
    const redirectUri = "http://localhost:3000/Applications";
    const scopes = "openid profile email offline_access";

    const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("code_challenge", codeChallenge);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("state", "12345");     
    authUrl.searchParams.set("prompt", "login");

    // Redirect to Microsoft login
    window.location.href = authUrl.toString();
};

// Step 2: Handle redirect after Microsoft login
const handleAuthRedirect = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) return; // No code means user hasn't logged in yet

    const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
    if (!codeVerifier) {
        console.error("Missing PKCE code_verifier from sessionStorage");
        return;
    }

    try {
        // Send code + code_verifier to your backend

        const response = await fetch(
            "https://userserviceshell-aqf6f0b8fqgmagch.canadacentral-01.azurewebsites.net/auth/azure-crm",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: code, // backend expects this
                    codeVerifier: codeVerifier,
                }),
            }
        );
        const data = await response.json();
        console.log("Token response from backend:", data);

        // Save tokens to localStorage if presents
        if (data) {
            debugger
           let  token = data.accessToken.replace(/^Bearer\s/, '');
            localStorage.setItem("token", token);
            // navigate("/Summary")
        }
        if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
        }
        // Optional: store expiration time
        if (data.expires_in) {
            const expiryTime = Date.now() + data.expires_in * 1000;
            localStorage.setItem("token_expiry", expiryTime.toString());
        }

        // Clean up URL so code isn’t visible
        window.history.replaceState({}, document.title, "/");

    } catch (err) {
        console.error("Token exchange failed:", err);
    }
};

// Run on page load
useEffect(() => {
    handleAuthRedirect();
}, []);



    // const handleLogout = () => {
    //     instance.logoutPopup().catch(e => {
    //         console.error("Error during logout:", e);
    //     });
    // };
    
    const handleInputChange = (target, value) => {
        // Destructure the name from target
        setCredentials((prev) => ({ ...prev, [target]: value }));
    };

    const [credentials, setCredentials] = useState({ user: 'walt1', pwd: 'Aa$12345' });

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLoginWithCredentional = async (e) => {
        // e.preventDefault();
        await dispatch(loginUser(credentials));
        navigate("/Summary", {
            state: {
                search: "Profile"
            },
        })
    };

    return (

        <main role="main" className="login-body" >

            <div className="login-wrapper main-container" >
                <div>

                </div>
                <div className="imag-con" style={{ opacity: 0.5 }}>
                    <img
                        className="login-image"
                        src={loginImg} alt="Logo"
                    />
                </div>

                <div className="login-con" style={{ width: '50%', padding: '20px', display: 'flex', flexDirection: 'column', justifycontent: 'center', }}>
                    {/* <h1 className='login-welcom'>Welcome Back</h1> */}
                    <h1 className='login-heading'>Login with Microsoft or enter your details</h1>
                    <div style={{ paddingTop: "10px", paddingBottom: "10px" }} className="d-flex justify-content-center my-2">

                        <button
                            onClick={handleLogin}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '8px 16px',
                                border: '1px solid #ccc',
                                borderRadius: '6px',
                                backgroundColor: 'rgb(33, 94, 151)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                                // fontWeight: 500,
                                width: '100%'
                            }}
                        >
                            {/* Microsoft SVG Icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="23px" height="23px">
                                <rect width="22" height="22" x="2" y="2" fill="#F25022" />
                                <rect width="22" height="22" x="24" y="2" fill="#7FBA00" />
                                <rect width="22" height="22" x="2" y="24" fill="#00A4EF" />
                                <rect width="22" height="22" x="24" y="24" fill="#FFB900" />
                            </svg>
                            {inProgress === InteractionStatus.None ? "Login with Microsoft" : "Logging in..."}
                            {/* <span>Sign in with Microsoft</span> */}
                        </button>
                    </div>
                    <Divider orientation="center" style={{ fontWeight: "400", fontSize: "12px" }}>Or</Divider>
                    <form className="login-form">
                        <div className="form-group">
                            <label>Username</label>
                            <Input className='login-form-input'
                                onChange={(e) => handleInputChange("user", e.target.value)}
                                value={credentials.user}
                            />
                        </div>
                        <div className="mb-3 position-relative">
                            <label>Password</label>
                            <div className="d-flex align-items-center">
                                <Input
                                    onChange={(e) => handleInputChange("pwd", e.target.value)}
                                    className='login-form-input'
                                    value={credentials?.pwd}
                                    type={showPassword ? 'text' : 'password'}
                                    suffix={showPassword ? < AiFillEye size={20} onClick={togglePasswordVisibility} /> : <AiFillEyeInvisible size={20} onClick={togglePasswordVisibility} />}
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between">

                            <Checkbox>Remember me</Checkbox>
                            <Link href="/reset-password" className='font-color-12'>Forgot Password?</Link>

                        </div>
                        {/* <Button style={{ backgroundColor: "#215e97", color: "white", borderRadius: "3px", width: "100%", marginTop: "20px", marginBottom: "10px" }} classNames="login-btn" onClick={() => navigate("/Summary")}>Log in</Button> */}
                        <Button loading={loading} style={{ backgroundColor: "#215e97", color: "white", borderRadius: "3px", width: "100%", marginTop: "20px", marginBottom: "10px" }} classNames="login-btn" onClick={(e) => {
                            // 
                            handleLoginWithCredentional(e)
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



