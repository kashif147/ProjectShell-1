import { React, useState, useEffect, useCallback, useRef } from "react";
import "../../styles/Login.css";
import { Button, Checkbox, Divider, Input, Spin, Card, Typography } from "antd";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/AuthSlice";
import { updateMenuLbl } from "../../features/MenuLblSlice";
import {
  getHomeMenuKeyFromRoles,
  getHomeRouteFromRoles,
} from "../../utils/roleHomeModule";
import { bumpAuthReady } from "../../utils/authReadyEvent";
import { useAuthorization } from "../../context/AuthorizationContext";
import { getRedirectUri } from "../../component/msft/msalConfig";
import MyAlert from "../../component/common/MyAlert";
import { notifyBrandingRefresh } from "../../context/TenantBrandingContext";
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

  const setMenuLabelForRole = useCallback(
    (roleCodes) => {
      const menuKey = getHomeMenuKeyFromRoles(roleCodes);
      dispatch(updateMenuLbl({ key: menuKey, value: true }));
    },
    [dispatch]
  );

  const { inProgress } = useMsal(); // Get the MSAL instance and interaction status
  const navigate = useNavigate(); // Use the useHistory hook
  const { loading } = useSelector((state) => state.auth);

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
  const isProcessingAuthRef = useRef(false);
  const processedCodeRef = useRef(null);

  // Step 1: Login button click
  const handleLogin = async () => {
    isProcessingAuthRef.current = false;
    processedCodeRef.current = null;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL_DEV}/pkce/generate`
      );

      if (!response.ok) {
        console.error(
          "Failed to obtain PKCE parameters from backend:",
          response.status,
          response.statusText
        );
        MyAlert("error", "Unable to start sign-in", "Please try again.");
        return;
      }

      const data = await response.json();
      const authorizeUrl = data?.authorizationUrls?.azureAD;
      const codeVerifier = data?.codeVerifier;

      if (!authorizeUrl || !codeVerifier) {
        console.error("Malformed /pkce/generate response");
        MyAlert("error", "Unable to start sign-in", "Please try again.");
        return;
      }

      let expectedState;
      let authorizeRedirectUri;
      try {
        const authorizeParams = new URL(authorizeUrl).searchParams;
        expectedState = authorizeParams.get("state");
        authorizeRedirectUri = authorizeParams.get("redirect_uri");
      } catch {
        console.error("Backend returned an invalid Microsoft authorize URL");
        MyAlert("error", "Unable to start sign-in", "Please try again.");
        return;
      }

      if (!expectedState) {
        console.error("Backend authorize URL is missing state");
        MyAlert("error", "Unable to start sign-in", "Please try again.");
        return;
      }

      localStorage.setItem("pkce_code_verifier", codeVerifier);
      localStorage.setItem("pkce_state", expectedState);
      // Microsoft only redeems the code if the token request's redirect_uri matches the
      // authorize request's exactly, so remember the backend's value instead of
      // re-deriving one from REACT_APP_REDIRECT_URI (which can drift from it).
      if (authorizeRedirectUri) {
        localStorage.setItem("pkce_redirect_uri", authorizeRedirectUri);
      }

      window.location.href = authorizeUrl;
    } catch (error) {
      console.error("Failed to start Microsoft sign-in");
      MyAlert("error", "Unable to start sign-in", "Please try again.");
    }
  };
  const handleAuthRedirect = useCallback(async () => {
    // Prevent multiple concurrent calls
    if (isProcessingAuthRef.current) {
      console.log(
        "handleAuthRedirect - Already processing, skipping duplicate call"
      );
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (!code) {
      console.log("handleAuthRedirect - No code found, ending auth redirect");
      return;
    }

    // Check if this code was already processed
    if (processedCodeRef.current === code) {
      console.log("handleAuthRedirect - Code already processed, skipping");
      return;
    }

    // Mark as processing and store the code immediately
    isProcessingAuthRef.current = true;
    processedCodeRef.current = code;
    setAuthLoading(true);

    // Clean up URL immediately to prevent re-triggering
    window.history.replaceState({}, document.title, window.location.pathname);

    const returnedState = urlParams.get("state");
    const codeVerifier = localStorage.getItem("pkce_code_verifier");
    const expectedState = localStorage.getItem("pkce_state");
    const authorizeRedirectUri = localStorage.getItem("pkce_redirect_uri");

    // Single-use: clear the stored transaction immediately after reading it, before
    // doing anything else, so none of these values can be reused regardless of what
    // happens next (success, mismatch, or a network error below) - mirrors the
    // backend's own state/nonce store, which is also single-use-on-read (see
    // helpers/pkceStateStore.js's takeNonceForState/takePolicyForState).
    localStorage.removeItem("pkce_code_verifier");
    localStorage.removeItem("pkce_state");
    localStorage.removeItem("pkce_redirect_uri");

    console.log(
      "handleAuthRedirect - Code verifier:",
      codeVerifier ? "exists" : "missing"
    );

    if (!codeVerifier) {
      console.error("Missing PKCE code_verifier from sessionStorage");
      isProcessingAuthRef.current = false;
      setAuthLoading(false);
      return;
    }

    // Client-side correlation check only - the backend remains the authoritative
    // verifier of state/nonce (see helpers/pkceStateStore.js). This cannot approve
    // anything the backend would otherwise reject; it can only refuse to call the
    // backend at all for a stale/replayed/missing state (e.g. a second tab, a
    // bookmarked callback URL, or a browser back-button replay), before spending a
    // network round-trip on it.
    if (!returnedState || !expectedState || returnedState !== expectedState) {
      console.error("handleAuthRedirect - state mismatch or missing, aborting");
      isProcessingAuthRef.current = false;
      processedCodeRef.current = null;
      setAuthLoading(false);
      return;
    }

    // Must equal the redirect_uri of the authorize request, which the backend chose
    // (see handleLogin); getRedirectUri() is only a fallback for a missing stored value.
    const redirectUri = authorizeRedirectUri || getRedirectUri();
    console.log("handleAuthRedirect - Redirect URI:", redirectUri);

    try {
      const response = await fetch(
        //fixing login api call
        `${process.env.REACT_APP_BASE_URL_DEV}/auth/azure-crm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: code, // backend expects this
            codeVerifier: codeVerifier,
            redirectUri: redirectUri, // must match the one used in authorization request
            state: returnedState,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error || JSON.stringify(errorData);
          console.error(
            "Backend authentication failed - Error details:",
            errorData
          );
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.error(
            "Backend authentication failed - Response text:",
            errorText
          );
        }
        console.error(
          "Backend authentication failed:",
          response.status,
          response.statusText,
          "Details:",
          errorMessage
        );
        MyAlert("error", "Authentication failed", errorMessage);
        isProcessingAuthRef.current = false;
        setAuthLoading(false);
        return;
      }

      const data = await response.json();
      console.log("Token response from backend:", data);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Save tokens to localStorage if presents
      if (data && data.accessToken) {
        // user-service returns the signed JWT as-is (TLS protects it in transit). Anything
        // that isn't a three-part JWT (e.g. an old "iv:tag:data" encrypted value) can't be
        // used as a Bearer token, so stop here rather than store a token the gateway rejects.
        const token1 = data.accessToken;
        if (typeof token1 !== "string" || token1.split(".").length !== 3) {
          console.error("Backend returned an accessToken that is not a JWT");
          MyAlert(
            "error",
            "Authentication failed",
            "Unexpected sign-in response from the server."
          );
          isProcessingAuthRef.current = false;
          setAuthLoading(false);
          return;
        }
        localStorage.setItem("token", token1);
        bumpAuthReady();
        let decode = decodeToken(token1);
        localStorage.setItem("userData", JSON.stringify(decode));
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
        notifyBrandingRefresh();

        // Set appropriate menu label based on user role
        setMenuLabelForRole(roleCodes);

        // Trigger FCM permission request immediately after Microsoft login and JWT token acquisition
        // This must be called synchronously to maintain user interaction context
        console.log(
          "🔔 Microsoft login successful. Requesting notification permission..."
        );
        if (
          window.triggerFCMPermissionRequest &&
          typeof window.triggerFCMPermissionRequest === "function"
        ) {
          // Call immediately (no delay) to stay in user interaction context
          // The permission request doesn't require service worker to be ready
          window.triggerFCMPermissionRequest().catch((error) => {
            console.warn("⚠️ Permission request failed:", error);
          });
        } else {
          console.warn("⚠️ FCM permission request function not available yet");
        }

        console.log("Login Debug - roleCodes:", roleCodes);
        const homeRoute = getHomeRouteFromRoles(roleCodes);
        const homeMenuKey = getHomeMenuKeyFromRoles(roleCodes);
        navigate(homeRoute, {
          state: { search: homeMenuKey === "Finance" ? "Finance" : homeMenuKey },
        });

        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }
        if (data.expires_in) {
          const expiryTime = Date.now() + data.expires_in * 1000;
          localStorage.setItem("token_expiry", expiryTime.toString());
        }
      } else {
        console.error("No data received from backend");
        isProcessingAuthRef.current = false;
        setAuthLoading(false);
        return;
      }
    } catch (err) {
      console.error("Token exchange failed:", err);
      // Reset processing flag on error to allow retry
      processedCodeRef.current = null;
      isProcessingAuthRef.current = false;
      setAuthLoading(false);
      return;
    }

    isProcessingAuthRef.current = false;
    setAuthLoading(false);
  }, [navigate, setUserData, setMenuLabelForRole]);
  useEffect(() => {
    // Check if user is already authenticated before running auth redirect
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    console.log("Login useEffect - token exists:", !!token);
    console.log("Login useEffect - userData exists:", !!userData);
    console.log("Login useEffect - URL code:", code);
    console.log("Login useEffect - Current URL:", window.location.href);
    console.log(
      "Login useEffect - isProcessingAuth:",
      isProcessingAuthRef.current
    );
    console.log("Login useEffect - processedCode:", processedCodeRef.current);

    // Check if we're coming back from Azure AD authentication
    if (
      code &&
      !isProcessingAuthRef.current &&
      processedCodeRef.current !== code
    ) {
      console.log(
        "Login useEffect - Azure AD redirect detected, running handleAuthRedirect"
      );
      handleAuthRedirect();
    } else if (!token || !userData) {
      console.log(
        "Login useEffect - No authentication found, staying on login page"
      );
      // Don't call handleAuthRedirect if there's no code - just stay on login page
    } else {
      console.log(
        "Login useEffect - User already authenticated, redirecting to dashboard"
      );
      // User is already authenticated, redirect to appropriate page
      const decodedUserData = JSON.parse(userData);
      const userRoles = decodedUserData.roles || [];
      const roleCodes = userRoles.map((role) => {
        if (typeof role === "string") return role;
        return role.code || role.name || role;
      });

      setMenuLabelForRole(roleCodes);
      const homeRoute = getHomeRouteFromRoles(roleCodes);
      const homeMenuKey = getHomeMenuKeyFromRoles(roleCodes);
      navigate(homeRoute, {
        state: { search: homeMenuKey === "Finance" ? "Finance" : homeMenuKey },
      });
    }

    // Add class to body to prevent scrolling
    document.body.classList.add("login-page");

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove("login-page");
    };
  }, [handleAuthRedirect, navigate, setMenuLabelForRole]);

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

      // Trigger FCM permission request immediately after login (while still in user interaction context)
      if (
        window.triggerFCMPermissionRequest &&
        typeof window.triggerFCMPermissionRequest === "function"
      ) {
        // Small delay to ensure service worker registration has started
        setTimeout(() => {
          window.triggerFCMPermissionRequest();
        }, 300);
      }

      const homeRoute = getHomeRouteFromRoles(roleCodes);
      const homeMenuKey = getHomeMenuKeyFromRoles(roleCodes);
      navigate(homeRoute, {
        state: {
          search:
            homeMenuKey === "Finance"
              ? "Finance"
              : homeMenuKey === "Subscriptions & Rewards"
                ? "Subscriptions & Rewards"
                : "Profile",
        },
      });
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
