import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "./Login";

// Login.js pulls in a wide set of app providers/hooks that are irrelevant to the
// CRM Microsoft-login flow under test here (redux, msal, routing, authorization
// context, branding). Mock them to isolate handleLogin/handleAuthRedirect.
jest.mock("@azure/msal-react", () => ({
  useMsal: () => ({ inProgress: "None" }),
}));
jest.mock("@azure/msal-browser", () => ({ InteractionStatus: { None: "None" } }));
jest.mock("react-redux", () => ({
  useDispatch: () => jest.fn(),
  useSelector: () => ({ loading: false }),
}));
jest.mock("../../context/AuthorizationContext", () => ({
  useAuthorization: () => ({ setUserData: jest.fn() }),
}));
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
  Link: ({ children }) => <>{children}</>,
}));
jest.mock("../../component/common/MyAlert", () => jest.fn());
jest.mock("../../component/msft/msalConfig", () => ({
  getRedirectUri: () => "http://localhost:3000/auth/azure-crm",
}));
jest.mock("../../utils/authReadyEvent", () => ({ bumpAuthReady: jest.fn() }));
jest.mock("../../context/TenantBrandingContext", () => ({
  notifyBrandingRefresh: jest.fn(),
}));
jest.mock("../../utils/roleHomeModule", () => ({
  getHomeMenuKeyFromRoles: () => "Dashboard",
  getHomeRouteFromRoles: () => "/",
}));
jest.mock("../../features/AuthSlice", () => ({ loginUser: jest.fn() }));
jest.mock("../../features/MenuLblSlice", () => ({ updateMenuLbl: jest.fn() }));

const BASE_URL = "http://backend.test";

function mockPkceGenerateResponse(overrides = {}) {
  return {
    ok: true,
    json: async () => ({
      success: true,
      codeVerifier: "server-generated-code-verifier",
      codeChallenge: "server-generated-code-challenge",
      codeChallengeMethod: "S256",
      authorizationUrls: {
        azureAD:
          "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize" +
          "?client_id=client-id&response_type=code&redirect_uri=http%3A%2F%2Flocalhost" +
          "&scope=openid&state=server-generated-state&nonce=server-generated-nonce" +
          "&code_challenge=server-generated-code-challenge&code_challenge_method=S256",
      },
      ...overrides,
    }),
  };
}

describe("Login (CRM Microsoft sign-in)", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    process.env.REACT_APP_BASE_URL_DEV = BASE_URL;
    localStorage.clear();
    jest.restoreAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    delete window.location;
    window.location = { href: "", search: "", pathname: "/login" };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe("handleLogin", () => {
    test("fetches /pkce/generate, redirects to the backend-provided URL, and stores codeVerifier + the state parsed from that URL", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce(mockPkceGenerateResponse());

      render(<Login />);
      fireEvent.click(screen.getByText(/Sign in with Microsoft/i));

      await waitFor(() => {
        expect(window.location.href).toContain(
          "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize"
        );
      });

      expect(global.fetch).toHaveBeenCalledWith(`${BASE_URL}/pkce/generate`);
      expect(localStorage.getItem("pkce_code_verifier")).toBe(
        "server-generated-code-verifier"
      );
      expect(localStorage.getItem("pkce_state")).toBe("server-generated-state");

      // No hardcoded tenant/client ever appears - the redirect target is exactly
      // what the backend returned, untouched.
      expect(window.location.href).not.toContain(
        "39866a06-30bc-4a89-80c6-9dd9357dd453"
      );
      expect(window.location.href).not.toContain(
        "ad25f823-e2d3-43e2-bea5-a9e6c9b0dbae"
      );
    });

    test("stores the redirect_uri the backend put in the authorize URL", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce(mockPkceGenerateResponse());

      render(<Login />);
      fireEvent.click(screen.getByText(/Sign in with Microsoft/i));

      await waitFor(() => {
        expect(window.location.href).toContain("login.microsoftonline.com");
      });

      // mockPkceGenerateResponse's authorize URL carries redirect_uri=http%3A%2F%2Flocalhost
      expect(localStorage.getItem("pkce_redirect_uri")).toBe("http://localhost");
    });

    test("does not redirect if the backend response has no state parameter", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce(
        mockPkceGenerateResponse({
          authorizationUrls: {
            azureAD:
              "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/authorize?client_id=client-id",
          },
        })
      );

      render(<Login />);
      fireEvent.click(screen.getByText(/Sign in with Microsoft/i));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      expect(window.location.href).toBe("");
      expect(localStorage.getItem("pkce_code_verifier")).toBeNull();
      expect(localStorage.getItem("pkce_state")).toBeNull();
    });
  });

  describe("handleAuthRedirect", () => {
    function renderAtCallback({ code = "auth-code", state } = {}) {
      const params = new URLSearchParams({ code });
      if (state !== undefined) params.set("state", state);
      window.location.search = `?${params.toString()}`;
      return render(<Login />);
    }

    test("matching returned state proceeds and calls POST /auth/azure-crm with { code, codeVerifier, redirectUri, state }", async () => {
      localStorage.setItem("pkce_code_verifier", "stored-code-verifier");
      localStorage.setItem("pkce_state", "matching-state");

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, accessToken: null }),
      });

      renderAtCallback({ code: "auth-code", state: "matching-state" });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/auth/azure-crm`,
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              code: "auth-code",
              codeVerifier: "stored-code-verifier",
              redirectUri: "http://localhost:3000/auth/azure-crm",
              state: "matching-state",
            }),
          })
        );
      });
    });

    test("sends the redirect_uri saved at sign-in instead of getRedirectUri(), and clears it", async () => {
      localStorage.setItem("pkce_code_verifier", "stored-code-verifier");
      localStorage.setItem("pkce_state", "matching-state");
      localStorage.setItem(
        "pkce_redirect_uri",
        "https://project-shell-crm-dev.vercel.app/auth/azure-crm"
      );

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, accessToken: null }),
      });

      renderAtCallback({ code: "auth-code", state: "matching-state" });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/auth/azure-crm`,
          expect.objectContaining({
            body: JSON.stringify({
              code: "auth-code",
              codeVerifier: "stored-code-verifier",
              redirectUri: "https://project-shell-crm-dev.vercel.app/auth/azure-crm",
              state: "matching-state",
            }),
          })
        );
      });
      expect(localStorage.getItem("pkce_redirect_uri")).toBeNull();
    });

    describe("accessToken handling", () => {
      const b64url = (obj) =>
        Buffer.from(JSON.stringify(obj))
          .toString("base64")
          .replace(/=/g, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_");
      const jwt = [
        b64url({ alg: "HS256", typ: "JWT" }),
        b64url({ id: "user-1", tenantId: "tenant-1", roles: [{ code: "SU" }], permissions: [] }),
        "signature",
      ].join(".");

      function mockExchange(accessToken) {
        localStorage.setItem("pkce_code_verifier", "stored-code-verifier");
        localStorage.setItem("pkce_state", "matching-state");
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, accessToken }),
        });
        renderAtCallback({ code: "auth-code", state: "matching-state" });
      }

      test("stores the JWT returned by the backend as-is (no client-side decryption)", async () => {
        mockExchange(jwt);

        await waitFor(() => {
          expect(localStorage.getItem("token")).toBe(jwt);
        });
        expect(JSON.parse(localStorage.getItem("userData")).id).toBe("user-1");
      });

      test("rejects an accessToken that is not a JWT (e.g. the old iv:tag:data form) and stores no token", async () => {
        mockExchange("aXY=:dGFn:ZGF0YQ==");

        await waitFor(() => {
          expect(require("../../component/common/MyAlert")).toHaveBeenCalledWith(
            "error",
            "Authentication failed",
            expect.any(String)
          );
        });
        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("userData")).toBeNull();
      });
    });

    test("missing state on the callback URL does not call the backend", async () => {
      localStorage.setItem("pkce_code_verifier", "stored-code-verifier");
      localStorage.setItem("pkce_state", "expected-state");
      global.fetch = jest.fn();

      renderAtCallback({ code: "auth-code" }); // no state param at all

      await waitFor(() => {
        expect(screen.queryByText(/Authenticating/i)).not.toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("mismatching state does not call the backend", async () => {
      localStorage.setItem("pkce_code_verifier", "stored-code-verifier");
      localStorage.setItem("pkce_state", "expected-state");
      global.fetch = jest.fn();

      renderAtCallback({ code: "auth-code", state: "attacker-supplied-state" });

      await waitFor(() => {
        expect(screen.queryByText(/Authenticating/i)).not.toBeInTheDocument();
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("the stored transaction is cleared immediately, before either outcome is known", async () => {
      localStorage.setItem("pkce_code_verifier", "stored-code-verifier");
      localStorage.setItem("pkce_state", "expected-state");
      global.fetch = jest.fn();

      renderAtCallback({ code: "auth-code", state: "mismatched-state" });

      await waitFor(() => {
        expect(localStorage.getItem("pkce_code_verifier")).toBeNull();
        expect(localStorage.getItem("pkce_state")).toBeNull();
      });
    });
  });
});
