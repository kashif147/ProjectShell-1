import { React, useState, useEffect } from 'react'
import "../../styles/Login.css"
// import loginImg from "../../assets/images/img1.png"
import loginImg from "../../assets/images/gra_logo.png"
// import { WindowsFilled } from '@ant-design/icons';
import { Button, Checkbox, Divider, Input } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useDispatch, useSelector } from 'react-redux';
import { BatchResponseContent } from '@microsoft/microsoft-graph-client';
import { loginUser } from '../../store/slice/AuthSlice';

const Login = () => {
  const dispatch = useDispatch();
  const { instance, inProgress } = useMsal(); // Get the MSAL instance and interaction status
  const navigate = useNavigate(); // Use the useHistory hook
  const { loading, error, user } = useSelector((state) => state.auth);
  
  const handleLogin = () => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }

    const loginRequest = {
      scopes: ['User.Read'],
    };

    instance.loginPopup({
      scopes: ["openid", "profile", "User.Read", "Mail.Read"], // Scopes you need
    }).then((response) => {
      if (response) {
        dispatch(loginUser({
          user: response?.account?.username,
          isMicrosoft: true
        }));
      }
      // localStorage.setItem('token',response?.accessToken)
      navigate("/Summary", {
        state: {
          search: "Profile"
        },
      })
    }).catch(e => {
      console.error("Error during login:", e);
    });
  };

  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error("Error during logout:", e);
    });
  };
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
    if (user) {
      navigate('/Summary');
    }
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
          <div style={{ paddingTop: "10px", paddingBottom: "10px" }}>
            <Button size="large" style={{ background: "#caccce", width: "100%", margintTop: "10px", marginBottom: "10px" }} className='d-flex align-items-baseline butn'

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
              navigate("/Summary", {
                state: {
                  search: "Profile"
                },
              })
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



