import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Card, Button, Space, Typography, Alert, Spin } from "antd";
import { useAuthorization } from "../context/AuthorizationContext";
import {
  useUIInitialization,
  useNavigationMenu,
  useActionButtons,
  useFeatureFlags,
} from "../utils/react-ui-policy-hooks";
import PolicyClient from "../utils/node-policy-client";
import {
  evaluatePolicy,
  evaluateBatchPolicies,
  quickCheck,
  getResourcePermissions,
  PolicyCacheUtils,
  PolicyErrorUtils,
} from "../utils/policy-client-utils";
import "./PolicyClientExample.css";

const { Title, Text } = Typography;

const PolicyClientExample = () => {
  const { policyClient, user, isAuthenticated } = useAuthorization();
  const [evaluationResults, setEvaluationResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [uiInitStatus, setUiInitStatus] = useState("loading"); // "loading", "partial", "complete"

  // Use ref to track initialization state to prevent multiple rapid updates
  const initializationRef = useRef(false);
  const debounceRef = useRef(null);

  // Memoize options and token to prevent unnecessary re-renders
  const uiOptions = useMemo(
    () => ({
      timeout: 30000, // Increased to 30 seconds for Azure
      retries: 3,
      cacheTimeout: 300000,
    }),
    []
  );

  // Stable token that only changes when authentication state changes
  const token = useMemo(() => {
    if (!isAuthenticated) return null;
    return localStorage.getItem("token");
  }, [isAuthenticated]);

  // Initialize UI with policy client - only when token is available
  const uiState = useUIInitialization(
    PolicyClient,
    process.env.REACT_APP_POLICY_SERVICE_URL || "http://localhost:5001",
    token,
    uiOptions
  );

  // Call hooks directly (not inside useMemo)
  const navigationMenu = useNavigationMenu(uiState.capabilities);
  const userActions = useActionButtons(uiState.capabilities, "users");
  const roleActions = useActionButtons(uiState.capabilities, "roles");
  const featureFlags = useFeatureFlags(uiState.capabilities);

  // Test policy evaluations using utility functions
  const testPolicyEvaluations = useCallback(async () => {
    if (!policyClient || !isAuthenticated) {
      setError("Policy client not available or user not authenticated");
      return;
    }

    // Validate token before making requests
    if (!token) {
      setError("No authentication token available. Please log in again.");
      return;
    }

    // Check if token is expired
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const decodedToken = JSON.parse(jsonPayload);

      if (decodedToken.exp) {
        const tokenExpiryTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        if (currentTime >= tokenExpiryTime) {
          setError("Authentication token has expired. Please log in again.");
          return;
        }
      }
    } catch (error) {
      console.warn("Could not decode token:", error);
      setError("Invalid authentication token. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    // Use memoized token instead of localStorage.getItem
    const testCases = [
      { resource: "user", action: "read", context: { type: "test" } },
      { resource: "user", action: "write", context: { type: "test" } },
      { resource: "role", action: "read", context: { type: "test" } },
      { resource: "admin", action: "write", context: { type: "test" } },
      { resource: "crm", action: "delete", context: { type: "test" } },
    ];

    try {
      const results = {};

      // Test individual evaluations using utility function
      for (const testCase of testCases) {
        try {
          const result = await evaluatePolicy(
            policyClient,
            token,
            testCase.resource,
            testCase.action,
            testCase.context
          );
          results[`${testCase.resource}:${testCase.action}`] = {
            success: result,
          };
        } catch (err) {
          results[`${testCase.resource}:${testCase.action}`] = {
            success: false,
            error: PolicyErrorUtils.getUserFriendlyMessage(err),
          };
        }
      }

      // Test batch evaluation using utility function
      try {
        const batchResult = await evaluateBatchPolicies(
          policyClient,
          token,
          testCases
        );
        results.batch = batchResult;
      } catch (err) {
        results.batch = { error: PolicyErrorUtils.getUserFriendlyMessage(err) };
      }

      // Test quick check using utility function
      try {
        const quickCheckResult = await quickCheck(
          policyClient,
          token,
          "user",
          "read"
        );
        results.quickCheck = { success: quickCheckResult };
      } catch (err) {
        results.quickCheck = {
          error: PolicyErrorUtils.getUserFriendlyMessage(err),
        };
      }

      setEvaluationResults(results);
    } catch (err) {
      setError(PolicyErrorUtils.getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  }, [policyClient, isAuthenticated, token]);

  // Test permissions endpoint using utility function
  const testPermissions = async () => {
    if (!policyClient || !isAuthenticated) {
      setError("Policy client not available or user not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    // Use memoized token instead of localStorage.getItem
    const resources = ["user", "role", "admin", "crm"];

    try {
      const permissions = {};
      for (const resource of resources) {
        try {
          const result = await getResourcePermissions(
            policyClient,
            token,
            resource
          );
          permissions[resource] = result;
        } catch (err) {
          permissions[resource] = {
            error: PolicyErrorUtils.getUserFriendlyMessage(err),
          };
        }
      }
      setEvaluationResults((prev) => ({ ...prev, permissions }));
    } catch (err) {
      setError(PolicyErrorUtils.getUserFriendlyMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Debounced initialization to prevent flickering
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (isAuthenticated && policyClient && !initializationRef.current) {
        initializationRef.current = true;
        setInitialized(true);
        testPolicyEvaluations();
      }
    }, 100); // Small delay to prevent rapid state changes

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [isAuthenticated, policyClient, testPolicyEvaluations]);

  // Track when UI is fully loaded to prevent flickering
  useEffect(() => {
    if (uiState.initialized && initialized && !isFullyLoaded) {
      // Small delay to ensure all state updates are complete
      const timer = setTimeout(() => {
        setIsFullyLoaded(true);
        setUiInitStatus("complete");
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [uiState.initialized, initialized, isFullyLoaded]);

  // Update UI initialization status smoothly with debouncing
  useEffect(() => {
    if (!isAuthenticated || !policyClient) return;

    const timer = setTimeout(() => {
      if (uiState.initialized) {
        setUiInitStatus("complete");
      } else if (uiState.loading) {
        setUiInitStatus("loading");
      } else {
        setUiInitStatus("partial");
      }
    }, 100); // Small delay to prevent rapid status changes

    return () => clearTimeout(timer);
  }, [isAuthenticated, policyClient, uiState.initialized, uiState.loading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isFullyLoaded && isAuthenticated) {
        console.warn(
          "PolicyClientExample: Fallback timeout triggered, forcing load"
        );
        setIsFullyLoaded(true);
        setUiInitStatus("partial"); // Force partial status if UI is stuck loading
      }
    }, 3000); // Reduced to 3 second timeout

    return () => clearTimeout(fallbackTimer);
  }, [isFullyLoaded, isAuthenticated]);

  // Additional timeout specifically for UI state loading
  useEffect(() => {
    const uiTimeout = setTimeout(() => {
      if (uiState.loading && isAuthenticated && policyClient) {
        console.warn(
          "PolicyClientExample: UI state loading timeout, forcing partial initialization"
        );
        setUiInitStatus("partial");
      }
    }, 2000); // 2 second timeout for UI state

    return () => clearTimeout(uiTimeout);
  }, [uiState.loading, isAuthenticated, policyClient]);

  // Debug logging to understand loading state
  useEffect(() => {
    console.log("PolicyClientExample Debug:", {
      isAuthenticated,
      policyClient: !!policyClient,
      uiStateLoading: uiState.loading,
      uiStateInitialized: uiState.initialized,
      initialized,
      isFullyLoaded,
      token: !!token,
      uiStateCapabilities: !!uiState.capabilities,
      uiStatePermissions: Object.keys(uiState.permissions || {}).length,
      uiStateResourcePermissions: Object.keys(uiState.resourcePermissions || {})
        .length,
    });
  }, [
    isAuthenticated,
    policyClient,
    uiState.loading,
    uiState.initialized,
    uiState.capabilities,
    uiState.permissions,
    uiState.resourcePermissions,
    initialized,
    isFullyLoaded,
    token,
  ]);

  // Show loading spinner while initializing - with fallback mechanism
  // Allow page to load if user is authenticated, even if policy client is not ready
  if (
    !isAuthenticated ||
    (!isFullyLoaded && uiState.loading && uiInitStatus === "loading")
  ) {
    return (
      <div
        className="policy-client-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>Loading Policy Client...</p>
          <p style={{ fontSize: "12px", color: "#666" }}>
            Auth: {isAuthenticated ? "✓" : "✗"} | Client:{" "}
            {policyClient ? "✓" : "✗"} | UI:{" "}
            {uiState.loading ? "Loading" : "Ready"} | Full:{" "}
            {isFullyLoaded ? "✓" : "✗"}
          </p>
          {isAuthenticated && policyClient && (
            <Button
              type="primary"
              onClick={() => {
                console.warn("Manual override: Forcing UI to load");
                setIsFullyLoaded(true);
                setUiInitStatus("partial");
              }}
              style={{ marginTop: "10px" }}
            >
              Force Load (Debug)
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="policy-client-container">
      <Title level={2}>Centralized Policy Client Integration</Title>

      <Alert
        message="Policy Client Status"
        description={`Policy client is ${
          policyClient ? "initialized" : "not available"
        }. User is ${
          isAuthenticated ? "authenticated" : "not authenticated"
        }. UI State: ${
          uiState.loading
            ? "loading"
            : uiState.initialized
            ? "ready"
            : "not initialized"
        }`}
        type={policyClient && isAuthenticated ? "success" : "warning"}
        style={{ marginBottom: "24px" }}
      />

      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* UI Initialization Status */}
        <Card
          title="UI Initialization Status"
          size="small"
          className="ui-status-card"
        >
          {uiInitStatus === "loading" ? (
            <div>
              <Spin size="small" style={{ marginRight: "8px" }} />
              <Text>Initializing UI components...</Text>
            </div>
          ) : uiInitStatus === "complete" ? (
            <div>
              <Text strong>✅ UI Initialized Successfully</Text>
              <br />
              <Text>
                Capabilities loaded:{" "}
                {uiState.capabilities?.stats?.totalPermissions || 0} permissions
              </Text>
              <br />
              <Text>
                Granted permissions:{" "}
                {uiState.capabilities?.stats?.grantedPermissions || 0}
              </Text>
              <br />
              <Text>Navigation items: {navigationMenu?.length || 0}</Text>
              <br />
              <Text>User actions: {userActions?.length || 0}</Text>
              <br />
              <Text>Role actions: {roleActions?.length || 0}</Text>
            </div>
          ) : (
            <div>
              <Text type="warning">⚠️ UI partially initialized</Text>
              <br />
              <Text>
                Basic functionality available, some features may be limited.
              </Text>
            </div>
          )}
        </Card>

        {/* Navigation Menu */}
        {navigationMenu && navigationMenu.length > 0 && (
          <Card title="Available Navigation" size="small">
            <Space wrap>
              {navigationMenu.map((item) => (
                <Button key={item.id} type="primary" ghost>
                  {item.icon} {item.label}
                </Button>
              ))}
            </Space>
          </Card>
        )}

        {/* Action Buttons */}
        {((userActions && userActions.length > 0) ||
          (roleActions && roleActions.length > 0)) && (
          <Card title="Available Actions" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              {userActions && userActions.length > 0 && (
                <div>
                  <Text strong>User Actions:</Text>
                  <br />
                  <Space wrap>
                    {userActions.map((action) => (
                      <Button key={action.id} onClick={action.onClick}>
                        {action.icon} {action.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              )}
              {roleActions && roleActions.length > 0 && (
                <div>
                  <Text strong>Role Actions:</Text>
                  <br />
                  <Space wrap>
                    {roleActions.map((action) => (
                      <Button key={action.id} onClick={action.onClick}>
                        {action.icon} {action.label}
                      </Button>
                    ))}
                  </Space>
                </div>
              )}
            </Space>
          </Card>
        )}

        {/* Feature Flags */}
        {featureFlags && Object.keys(featureFlags).length > 0 && (
          <Card title="Feature Flags" size="small">
            <Space wrap>
              {Object.entries(featureFlags).map(([key, enabled]) => (
                <Button
                  key={key}
                  type={enabled ? "primary" : "default"}
                  disabled={!enabled}
                >
                  {enabled ? "✅" : "❌"} {key}
                </Button>
              ))}
            </Space>
          </Card>
        )}

        {/* Policy Evaluation Results */}
        <Card
          title="Policy Evaluation Results"
          size="small"
          extra={
            <Space>
              <Button onClick={testPolicyEvaluations} loading={loading}>
                Test Evaluations
              </Button>
              <Button onClick={testPermissions} loading={loading}>
                Test Permissions
              </Button>
              <Button
                onClick={async () => {
                  if (!token) return;
                  setLoading(true);
                  try {
                    const policyUrl =
                      process.env.REACT_APP_POLICY_SERVICE_URL ||
                      "http://localhost:5001";

                    // Test using the correct endpoint: /policy/check/:user/:action
                    console.log(
                      "Testing policy check with correct endpoint..."
                    );
                    const result = await fetch(
                      `${policyUrl}/policy/check/user/read`,
                      {
                        method: "GET",
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        signal: AbortSignal.timeout(10000),
                      }
                    );

                    const data = await result.json();
                    console.log("Policy check result:", data);
                    setEvaluationResults({ policyCheck: data });

                    if (result.ok) {
                      setError(null);
                    } else {
                      setError(
                        `Policy check failed: ${result.status} ${result.statusText}`
                      );
                    }
                  } catch (error) {
                    console.error("Policy check error:", error);
                    setError(`Policy check failed: ${error.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                type="primary"
              >
                Test Policy Check
              </Button>
              <Button
                onClick={() => {
                  console.log("Token Debug:", {
                    token: token ? `${token.substring(0, 20)}...` : "No token",
                    tokenLength: token ? token.length : 0,
                    isAuthenticated,
                    localStorageToken: localStorage.getItem("token")
                      ? `${localStorage.getItem("token").substring(0, 20)}...`
                      : "No token in localStorage",
                  });
                }}
                type="dashed"
              >
                Debug Token
              </Button>
            </Space>
          }
        >
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              style={{ marginBottom: "16px" }}
            />
          )}

          {Object.keys(evaluationResults).length > 0 && (
            <div>
              {Object.entries(evaluationResults).map(([key, result]) => (
                <div key={key} style={{ marginBottom: "12px" }}>
                  <Text strong>{key}:</Text>
                  <pre
                    style={{
                      background: "#f5f5f5",
                      padding: "8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      marginTop: "4px",
                    }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Policy Client Methods */}
        <Card title="Policy Client Methods" size="small">
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Available Methods:</Text>
              <ul>
                <li>
                  <Text code>evaluate(token, resource, action, context)</Text> -
                  Single policy evaluation
                </li>
                <li>
                  <Text code>evaluateBatch(requests)</Text> - Batch policy
                  evaluation
                </li>
                <li>
                  <Text code>getPermissions(token, resource)</Text> - Get
                  resource permissions
                </li>
                <li>
                  <Text code>check(token, resource, action, context)</Text> -
                  Quick authorization check
                </li>
                <li>
                  <Text code>middleware(resource, action)</Text> - Express
                  middleware
                </li>
                <li>
                  <Text code>clearCache()</Text> - Clear client cache
                </li>
                <li>
                  <Text code>getCacheStats()</Text> - Get cache statistics
                </li>
              </ul>
            </div>

            {policyClient && (
              <div>
                <Text strong>Cache Statistics:</Text>
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {JSON.stringify(
                    PolicyCacheUtils.getStats(policyClient),
                    null,
                    2
                  )}
                </pre>
                <Space style={{ marginTop: "8px" }}>
                  <Button
                    size="small"
                    onClick={() => PolicyCacheUtils.clearCache(policyClient)}
                  >
                    Clear Cache
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      const stats = PolicyCacheUtils.getStats(policyClient);
                      console.log("Cache Stats:", stats);
                    }}
                  >
                    Log Stats
                  </Button>
                </Space>
              </div>
            )}
          </Space>
        </Card>

        {/* Authentication Troubleshooting */}
        <Card title="Authentication Troubleshooting" size="small">
          <Space direction="vertical" style={{ width: "100%" }}>
            <div>
              <Text strong>Token Status:</Text>
              <br />
              <Text>
                Token Present: {token ? "✅ Yes" : "❌ No"}
                {token && ` (${token.length} characters)`}
              </Text>
              <br />
              <Text>
                User Authenticated: {isAuthenticated ? "✅ Yes" : "❌ No"}
              </Text>
              <br />
              <Text>
                Policy Client:{" "}
                {policyClient ? "✅ Available" : "❌ Not Available"}
              </Text>
            </div>

            {token && (
              <div>
                <Text strong>Token Information:</Text>
                <br />
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    maxHeight: "150px",
                    overflow: "auto",
                  }}
                >
                  {(() => {
                    try {
                      const base64Url = token.split(".")[1];
                      const base64 = base64Url
                        .replace(/-/g, "+")
                        .replace(/_/g, "/");
                      const jsonPayload = decodeURIComponent(
                        atob(base64)
                          .split("")
                          .map(
                            (c) =>
                              "%" +
                              ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                          )
                          .join("")
                      );
                      const decodedToken = JSON.parse(jsonPayload);
                      return JSON.stringify(decodedToken, null, 2);
                    } catch (error) {
                      return `Error decoding token: ${error.message}`;
                    }
                  })()}
                </pre>
              </div>
            )}

            <div>
              <Text strong>Configuration:</Text>
              <br />
              <Text>
                Policy Server URL:{" "}
                {process.env.REACT_APP_POLICY_SERVICE_URL ||
                  "http://localhost:5001"}
              </Text>
              <br />
              <Text strong>Services Being Called:</Text>
              <ul>
                <li>
                  Policy Service:
                  {/* https://userserviceshell-aqf6f0b8fqgmagch.canadacentral-01.azurewebsites.net */}
                </li>
                <li>
                  Authorization API:
                  {/* https://projectshellapi-c0hqhbdwaaahbcab.northeurope-01.azurewebsites.net */}
                </li>
                <li>
                  Portal API:
                  {/* https://testportal-dabravg2h3hfbke9.canadacentral-01.azurewebsites.net */}
                </li>
              </ul>
              <br />
              <Text strong>Current Issues Detected:</Text>
              <ul>
                <li style={{ color: "red" }}>
                  ❌ 403 Forbidden errors from authorization API
                </li>
                <li style={{ color: "red" }}>
                  ❌ CORS policy blocking requests
                </li>
                <li style={{ color: "red" }}>
                  ❌ Policy service timeout (not responding)
                </li>
                <li style={{ color: "orange" }}>
                  ⚠️ Multiple Azure services being called
                </li>
                <li style={{ color: "orange" }}>
                  ⚠️ Token may not have required permissions
                </li>
              </ul>

              <Text strong>Possible Solutions:</Text>
              <ul>
                <li>
                  <strong>Service Timeout:</strong> Check if the policy service
                  is running and accessible
                </li>
                <li>
                  <strong>403 Errors:</strong> Check if your token has
                  admin/system permissions
                </li>
                <li>
                  <strong>CORS Issues:</strong> Verify CORS configuration on
                  Azure services
                </li>
                <li>
                  <strong>Service Endpoints:</strong> Ensure you're calling the
                  correct service endpoints
                </li>
                <li>
                  <strong>Authentication:</strong> Check if services require
                  different authentication headers
                </li>
                <li>
                  <strong>Permissions:</strong> Contact admin to grant required
                  API permissions
                </li>
                <li>
                  <strong>Network:</strong> Check if there are firewall or
                  network restrictions
                </li>
              </ul>

              <Text strong>Environment Variables to Check:</Text>
              <ul>
                <li>
                  <code>REACT_APP_POLICY_SERVICE_URL</code> - Should point to
                  your policy service
                </li>
                <li>
                  <code>REACT_APP_BASE_URL_DEV</code> - May be used by other
                  parts of the app
                </li>
                <li>
                  <code>REACT_APP_API_BASE_URL</code> - May be used for
                  authorization API
                </li>
                <li>
                  <code>REACT_APP_AUTH_SERVICE_URL</code> - May be used for
                  authentication
                </li>
              </ul>

              <Text strong>CORS Configuration Needed on Policy Service:</Text>
              <ul>
                <li>
                  Add <code>https://project-shell-crm.vercel.app</code> to
                  allowed origins
                </li>
                <li>
                  Allow <code>POST</code> method for policy evaluation
                </li>
                <li>
                  Allow <code>Authorization</code> header
                </li>
                <li>
                  Allow <code>Content-Type</code> header
                </li>
              </ul>

              <Text strong>Working Endpoints:</Text>
              <div
                style={{
                  background: "#f5f5f5",
                  padding: "10px",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <div>
                  <strong>✅ Available Endpoints:</strong>
                </div>
                <code>GET /policy/health</code> - Health check
                <br />
                <code>GET /policy/info</code> - Service info
                <br />
                <code>GET /policy/permissions/:user</code> - User permissions
                <br />
                <code>GET /policy/check/:resource/:action</code> - Policy check
                <br />
                <br />
                <div>
                  <strong>❌ Problematic Endpoints:</strong>
                </div>
                <code>POST /policy/evaluate</code> - Returns 502 Bad Gateway
                <br />
                <code>POST /policy/evaluate-batch</code> - Returns 404 Not Found
                <br />
                <br />
                <div>
                  <strong>✅ Correct Usage:</strong>
                </div>
                <code>
                  curl -H "Authorization: Bearer YOUR_TOKEN"{" "}
                  {process.env.REACT_APP_POLICY_SERVICE_URL ||
                    "http://localhost:5001"}
                  /policy/check/user/read
                </code>
              </div>
            </div>

            <Space>
              <Button
                onClick={() => {
                  console.log("Full token:", token);
                  console.log("Policy client config:", {
                    baseUrl:
                      process.env.REACT_APP_POLICY_SERVICE_URL ||
                      "http://localhost:5001",
                    options: uiOptions,
                  });
                }}
                type="dashed"
              >
                Log Full Debug Info
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const policyUrl =
                      process.env.REACT_APP_POLICY_SERVICE_URL ||
                      "http://localhost:5001";
                    console.log("Testing network connectivity to:", policyUrl);

                    // Simple fetch test
                    const response = await fetch(`${policyUrl}/health`, {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      signal: AbortSignal.timeout(10000), // 10 second timeout
                    });

                    console.log(
                      "Health check response:",
                      response.status,
                      response.statusText
                    );
                    setError(
                      `Network test: ${response.status} ${response.statusText}`
                    );
                  } catch (error) {
                    console.error("Network test failed:", error);
                    setError(`Network test failed: ${error.message}`);
                  }
                }}
                type="dashed"
              >
                Test Network Connectivity
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const policyUrl =
                      process.env.REACT_APP_POLICY_SERVICE_URL ||
                      "http://localhost:5001";
                    console.log("Testing basic connectivity to:", policyUrl);

                    // First test basic connectivity with a simple GET request
                    const connectivityResponse = await fetch(
                      `${policyUrl}/health`,
                      {
                        method: "GET",
                        signal: AbortSignal.timeout(5000), // 5 second timeout
                      }
                    );

                    console.log(
                      "Connectivity test response:",
                      connectivityResponse.status,
                      connectivityResponse.statusText
                    );

                    if (connectivityResponse.ok) {
                      // If basic connectivity works, test CORS with policy request
                      console.log("Testing CORS with policy request...");
                      const corsResponse = await fetch(
                        `${policyUrl}/policy/evaluate`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({
                            resource: "user",
                            action: "read",
                            context: { type: "test" },
                          }),
                          signal: AbortSignal.timeout(10000), // 10 second timeout
                        }
                      );

                      console.log(
                        "CORS test response:",
                        corsResponse.status,
                        corsResponse.statusText
                      );

                      if (corsResponse.ok) {
                        const data = await corsResponse.json();
                        setEvaluationResults({ corsTest: data });
                        setError(null);
                      } else {
                        setError(
                          `CORS test failed: ${corsResponse.status} ${corsResponse.statusText}`
                        );
                      }
                    } else {
                      setError(
                        `Service not reachable: ${connectivityResponse.status} ${connectivityResponse.statusText}`
                      );
                    }
                  } catch (error) {
                    console.error("Connectivity/CORS test failed:", error);
                    if (error.name === "TimeoutError") {
                      setError(
                        `Service timeout: The policy service at ${
                          process.env.REACT_APP_POLICY_SERVICE_URL ||
                          "http://localhost:5001"
                        } is not responding. Check if the service is running and accessible.`
                      );
                    } else if (
                      error.name === "TypeError" &&
                      error.message.includes("CORS")
                    ) {
                      setError(
                        `CORS Error: ${error.message}. Check server CORS configuration.`
                      );
                    } else {
                      setError(`Connectivity test failed: ${error.message}`);
                    }
                  }
                }}
                type="dashed"
              >
                Test Service Connectivity
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const policyUrl =
                      process.env.REACT_APP_POLICY_SERVICE_URL ||
                      "http://localhost:5001";

                    console.log(
                      "Testing different resource/action combinations..."
                    );

                    // Test different resource/action combinations
                    const testCases = [
                      { resource: "user", action: "read" },
                      { resource: "user", action: "write" },
                      { resource: "role", action: "read" },
                      { resource: "role", action: "write" },
                      { resource: "admin", action: "read" },
                      { resource: "admin", action: "write" },
                      { resource: "crm", action: "read" },
                      { resource: "crm", action: "write" },
                      { resource: "system", action: "read" },
                      { resource: "system", action: "write" },
                    ];

                    const results = {};
                    for (const testCase of testCases) {
                      try {
                        console.log(
                          `Testing ${testCase.resource}/${testCase.action}...`
                        );
                        const response = await fetch(
                          `${policyUrl}/policy/check/${testCase.resource}/${testCase.action}`,
                          {
                            method: "GET",
                            headers: {
                              Authorization: `Bearer ${token}`,
                              "Content-Type": "application/json",
                            },
                            signal: AbortSignal.timeout(3000),
                          }
                        );

                        const data = await response.json();
                        console.log(
                          `${testCase.resource}/${testCase.action} - Status: ${response.status}, Data:`,
                          data
                        );
                        results[`${testCase.resource}_${testCase.action}`] = {
                          status: response.status,
                          data: data,
                          success: response.ok,
                        };
                      } catch (error) {
                        console.log(
                          `${testCase.resource}/${testCase.action} - Error:`,
                          error.message
                        );
                        results[`${testCase.resource}_${testCase.action}`] = {
                          error: error.message,
                          success: false,
                        };
                      }
                    }

                    setEvaluationResults({ resourceActionTests: results });
                    setError(
                      "Resource/action tests completed - check console for results"
                    );
                  } catch (error) {
                    console.error("Resource/action test failed:", error);
                    setError(`Resource/action test failed: ${error.message}`);
                  }
                }}
                type="dashed"
              >
                Test Resource/Actions
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const policyUrl =
                      process.env.REACT_APP_POLICY_SERVICE_URL ||
                      "http://localhost:5001";

                    console.log(
                      "Testing different endpoints on policy service..."
                    );

                    // Test different possible endpoints
                    const endpoints = [
                      "/health",
                      "/",
                      "/api/health",
                      "/policy",
                      "/policy/health",
                      "/policy/evaluate",
                      "/evaluate",
                      "/api/policy/evaluate",
                      "/v1/policy/evaluate",
                      "/api/v1/policy/evaluate",
                    ];

                    for (const endpoint of endpoints) {
                      try {
                        console.log(
                          `Testing endpoint: ${policyUrl}${endpoint}`
                        );
                        const response = await fetch(
                          `${policyUrl}${endpoint}`,
                          {
                            method: "GET",
                            signal: AbortSignal.timeout(3000), // 3 second timeout
                          }
                        );

                        console.log(
                          `${endpoint} - Status: ${response.status} ${response.statusText}`
                        );
                        if (response.status !== 404) {
                          console.log(
                            `${endpoint} - Response headers:`,
                            Object.fromEntries(response.headers.entries())
                          );
                          if (response.ok) {
                            const text = await response.text();
                            console.log(
                              `${endpoint} - Response body:`,
                              text.substring(0, 200)
                            );
                          }
                        }
                      } catch (error) {
                        console.log(`${endpoint} - Error:`, error.message);
                      }
                    }

                    setError(
                      "Endpoint test completed - check console for results"
                    );
                  } catch (error) {
                    console.error("Endpoint test failed:", error);
                    setError(`Endpoint test failed: ${error.message}`);
                  }
                }}
                type="dashed"
              >
                Test Service Endpoints
              </Button>
              <Button
                onClick={() => {
                  window.location.reload();
                }}
                type="primary"
              >
                Refresh Page
              </Button>
            </Space>
          </Space>
        </Card>

        {/* User Information */}
        {user && (
          <Card title="Current User" size="small">
            <pre
              style={{
                background: "#f5f5f5",
                padding: "8px",
                borderRadius: "4px",
                fontSize: "12px",
              }}
            >
              {JSON.stringify(user, null, 2)}
            </pre>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default PolicyClientExample;
