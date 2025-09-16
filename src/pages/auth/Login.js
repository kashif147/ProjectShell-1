import { React, useState, useEffect } from "react";
import "../../styles/Login.css";
import { Button, Checkbox, Divider, Input, Spin, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/AuthSlice";
import { updateMenuLbl } from "../../features/MenuLblSlice";
import { generatePKCE } from "../../utils/Utilities";
import { useAuthorization } from "../../context/AuthorizationContext";
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
// Using a professional business image from Unsplash
const loginImage =
  "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const { setUserData } = useAuthorization();

  // Function to set appropriate menu label based on user role
  const setMenuLabelForRole = (roleCodes) => {
    if (roleCodes.includes("SU")) {
      // Super User - show Configuration module
      dispatch(updateMenuLbl({ key: "Configuration", value: true }));
    } else if (roleCodes.includes("GS") || roleCodes.includes("DGS")) {
      // General Secretary roles - show Configuration module
      dispatch(updateMenuLbl({ key: "Configuration", value: true }));
    } else if (roleCodes.includes("MO") || roleCodes.includes("AMO")) {
      // Membership Officer roles - show Subscriptions & Rewards
      dispatch(updateMenuLbl({ key: "Subscriptions & Rewards", value: true }));
    } else if (roleCodes.includes("AM") || roleCodes.includes("DAM")) {
      // Account Manager roles - show Finance
      dispatch(updateMenuLbl({ key: "Finance", value: true }));
    } else if (roleCodes.includes("IRO")) {
      // Industrial Relations Officer - show Issue Management
      dispatch(updateMenuLbl({ key: "Issue Management", value: true }));
    } else if (roleCodes.includes("MEMBER")) {
      // Regular member - show Subscriptions & Rewards
      dispatch(updateMenuLbl({ key: "Subscriptions & Rewards", value: true }));
    } else {
      // Default fallback
      dispatch(updateMenuLbl({ key: "Subscriptions & Rewards", value: true }));
    }
  };

  const { instance, inProgress } = useMsal(); // Get the MSAL instance and interaction status
  const navigate = useNavigate(); // Use the useHistory hook
  const { loading, user, roles, permissions } = useSelector(
    (state) => state.auth
  );

  function decodeToken(token) {
    try {
      const base64Url = token.split(".")[1]; // get payload part
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
  const [authLoading, setAuthLoading] = useState(false);
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);
  // Step 1: Login button click
  const handleLogin = async () => {
    const { codeVerifier, codeChallenge } = await generatePKCE();
    // Save codeVerifier for later token exchange
    localStorage.setItem("pkce_code_verifier", codeVerifier);
    const tenantId = "39866a06-30bc-4a89-80c6-9dd9357dd453";
    const clientId = "ad25f823-e2d3-43e2-bea5-a9e6c9b0dbae";
    const redirectUri = "http://localhost:3000";
    const scopes = "openid profile email offline_access";
    const authUrl = new URL(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
    );
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
  const handleAuthRedirect = async () => {
    setAuthLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) return setAuthLoading(false);
    // return;
    const codeVerifier = localStorage.getItem("pkce_code_verifier");
    if (!codeVerifier) {
      console.error("Missing PKCE code_verifier from sessionStorage");
      return;
    }
    try {
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
        let token = data.accessToken.replace(/^Bearer\s/, "");
        localStorage.setItem("token", token);
        let decode = decodeToken(token);
        localStorage.setItem("userdata", JSON.stringify(decode));

        // Extract roles and permissions from the decoded JWT token
        const userRoles = decode.roles || [];
        const userPermissions = decode.permissions || [];

        // Convert role objects to role codes for authorization
        const roleCodes = userRoles.map((role) => {
          if (typeof role === "string") return role;
          return role.code || role.name || role;
        });

        console.log("Extracted from JWT token:", {
          userRoles,
          userPermissions,
          roleCodes,
          decodedToken: decode,
        });

        // Set user data in authorization context
        await setUserData(decode, roleCodes, userPermissions);

        // Set appropriate menu label based on user role
        setMenuLabelForRole(roleCodes);

        // Navigate based on user role
        if (roleCodes.includes("SU")) {
          navigate("/Configuratin");
        } else {
          navigate("/MembershipDashboard");
        }
        setAuthLoading(!authLoading);
      }
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }
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
  useEffect(() => {
    handleAuthRedirect();

    // Add class to body to prevent scrolling
    document.body.classList.add("login-page");

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);

  // Step 2: Handle redirect after Microsoft login

  // Run on page load

  // const handleLogout = () => {
  //     instance.logoutPopup().catch(e => {
  //         console.error("Error during logout:", e);
  //     });
  // };

  const handleInputChange = (target, value) => {
    // Destructure the name from target
    setCredentials((prev) => ({ ...prev, [target]: value }));
  };

  const [credentials, setCredentials] = useState({
    user: "walt1",
    pwd: "Aa$12345",
  });

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLoginWithCredentional = async (e) => {
    // e.preventDefault();
    const result = await dispatch(loginUser(credentials));

    // Check if login was successful and set user data
    if (result.payload && result.payload.accessToken) {
      // Decode the token to extract roles and permissions
      const token = result.payload.accessToken.replace(/^Bearer\s/, "");
      const decodedToken = decodeToken(token);

      const userRoles = decodedToken?.roles || result.payload.roles || [];
      const userPermissions =
        decodedToken?.permissions || result.payload.permissions || [];

      // Convert role objects to role codes for authorization
      const roleCodes = userRoles.map((role) => {
        if (typeof role === "string") return role;
        return role.code || role.name || role;
      });

      console.log("Traditional login - extracted from JWT token:", {
        userRoles,
        userPermissions,
        roleCodes,
        decodedToken,
      });

      // Set user data in authorization context
      await setUserData(
        decodedToken || result.payload,
        roleCodes,
        userPermissions
      );

      // Set appropriate menu label based on user role
      setMenuLabelForRole(roleCodes);

      // Navigate based on user role
      if (roleCodes.includes("SU")) {
        navigate("/Configuratin");
      } else {
        navigate("/Summary", {
          state: {
            search: "Profile",
          },
        });
      }
    }
  };

  return (
    <main role="main" className="login-body">
      {authLoading === true ? (
        <div className="login-loading">
          <Spin size="large" />
          <Text style={{ marginTop: "16px", color: "var(--font-color)" }}>
            Authenticating...
          </Text>
        </div>
      ) : (
        <div className="login-container">
          <div className="login-image-section">
            <img src={loginImage} alt="Welcome" className="login-hero-image" />
            <div className="image-overlay">
              <Title level={1} className="hero-title">
                Welcome to Our Platform
              </Title>
              <Text className="hero-subtitle">
                Secure access to your membership platform
              </Text>
            </div>
          </div>

          <Card className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <UserOutlined />
              </div>
              <Title level={2} className="login-title">
                {showTraditionalLogin ? "Sign In" : "Welcome Back"}
              </Title>
              <Text className="login-subtitle">
                {showTraditionalLogin
                  ? "Enter your credentials to continue"
                  : "Choose your preferred sign-in method"}
              </Text>
            </div>

            <div className="login-content">
              {!showTraditionalLogin ? (
                // Step 1: Microsoft Login (Primary)
                <>
                  <Button
                    className="theme-btn theme-btn-primary microsoft-btn"
                    onClick={handleLogin}
                    size="large"
                    block
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      width="20px"
                      height="20px"
                      style={{ marginRight: "8px" }}
                    >
                      <rect width="22" height="22" x="2" y="2" fill="#F25022" />
                      <rect
                        width="22"
                        height="22"
                        x="24"
                        y="2"
                        fill="#7FBA00"
                      />
                      <rect
                        width="22"
                        height="22"
                        x="2"
                        y="24"
                        fill="#00A4EF"
                      />
                      <rect
                        width="22"
                        height="22"
                        x="24"
                        y="24"
                        fill="#FFB900"
                      />
                    </svg>
                    {inProgress === InteractionStatus.None
                      ? "Sign in with Microsoft"
                      : "Signing in..."}
                  </Button>

                  <Divider className="login-divider">Or</Divider>

                  <Button
                    className="theme-btn theme-btn-secondary"
                    onClick={() => setShowTraditionalLogin(true)}
                    size="large"
                    block
                    icon={<LoginOutlined />}
                  >
                    Sign in with Username & Password
                  </Button>
                </>
              ) : (
                // Step 2: Traditional Login Form
                <>
                  <Button
                    className="back-button"
                    onClick={() => setShowTraditionalLogin(false)}
                    icon={<ArrowLeftOutlined />}
                    type="text"
                  >
                    Back to Sign-in Options
                  </Button>

                  <form className="login-form">
                    <div className="form-group">
                      <label className="form-label">
                        <UserOutlined className="label-icon" />
                        Username
                      </label>
                      <Input
                        className="theme-input"
                        placeholder="Enter your username"
                        prefix={<UserOutlined />}
                        onChange={(e) =>
                          handleInputChange("user", e.target.value)
                        }
                        value={credentials.user}
                        size="large"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <LockOutlined className="label-icon" />
                        Password
                      </label>
                      <Input.Password
                        className="theme-input"
                        placeholder="Enter your password"
                        prefix={<LockOutlined />}
                        onChange={(e) =>
                          handleInputChange("pwd", e.target.value)
                        }
                        value={credentials?.pwd}
                        size="large"
                        visibilityToggle={{
                          visible: showPassword,
                          onVisibleChange: setShowPassword,
                        }}
                      />
                    </div>

                    <div className="login-options">
                      <Checkbox className="remember-checkbox">
                        Remember me
                      </Checkbox>
                      <Link to="/reset-password" className="forgot-link">
                        Forgot Password?
                      </Link>
                    </div>

                    <Button
                      className="theme-btn theme-btn-primary login-submit-btn"
                      loading={loading}
                      onClick={handleLoginWithCredentional}
                      size="large"
                      block
                    >
                      Sign In
                    </Button>
                  </form>
                </>
              )}

              <div className="login-footer">
                <Text className="signup-text">
                  Don't have an account?{" "}
                  <Link to="/contact-us" className="signup-link">
                    Request access
                  </Link>
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
};

export default Login;
