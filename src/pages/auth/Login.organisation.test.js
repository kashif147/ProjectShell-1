import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";

// CRM sign-in organisation context: customer link (?tenant), remembered organisation, manual code.
// Same isolation as Login.test.js.
jest.mock("@azure/msal-react", () => ({ useMsal: () => ({ inProgress: "None" }) }));
jest.mock("@azure/msal-browser", () => ({ InteractionStatus: { None: "None" } }));
jest.mock("react-redux", () => ({ useDispatch: () => jest.fn(), useSelector: () => ({ loading: false }) }));
jest.mock("../../context/AuthorizationContext", () => ({ useAuthorization: () => ({ setUserData: jest.fn() }) }));
jest.mock("react-router-dom", () => ({ useNavigate: () => jest.fn(), Link: ({ children }) => <>{children}</> }));
jest.mock("../../component/common/MyAlert", () => jest.fn());
jest.mock("../../component/msft/msalConfig", () => ({ getRedirectUri: () => "http://localhost:3000/auth/azure-crm" }));
jest.mock("../../utils/authReadyEvent", () => ({ bumpAuthReady: jest.fn() }));
jest.mock("../../context/TenantBrandingContext", () => ({ notifyBrandingRefresh: jest.fn() }));
jest.mock("../../utils/roleHomeModule", () => ({ getHomeMenuKeyFromRoles: () => "Dashboard", getHomeRouteFromRoles: () => "/" }));
jest.mock("../../features/AuthSlice", () => ({ loginUser: jest.fn() }));
jest.mock("../../features/MenuLblSlice", () => ({ updateMenuLbl: jest.fn() }));

const BASE_URL = "http://backend.test";
const GENERIC = "We couldn't start sign-in. Check the organisation details or contact your administrator.";
const INTERNAL_ID = "68cbf7806080b4621d469d34";
const DIRECTORY = "39866a06-30bc-4a89-80c6-9dd9357dd453";
const pkceOk = () => ({
  ok: true,
  json: async () => ({
    codeVerifier: "v",
    authorizationUrls: { azureAD: "https://login.microsoftonline.com/x/oauth2/v2.0/authorize?state=s1&redirect_uri=http%3A%2F%2Flocalhost" },
  }),
});
const pkce400 = () => ({ ok: false, status: 400, json: async () => ({}) });
const startUrl = (code) => `${BASE_URL}/pkce/generate?tenant=${code}`;
const continueWithMicrosoft = () => fireEvent.click(screen.getByRole("button", { name: /Continue with Microsoft/i }));
const differentOrganisation = () => fireEvent.click(screen.getByRole("button", { name: /Use a different organisation/i }));

const originalLocation = window.location;
let replaceState;
beforeEach(() => {
  jest.restoreAllMocks();
  process.env.REACT_APP_BASE_URL_DEV = BASE_URL;
  localStorage.clear();
  sessionStorage.clear();
  ["log", "error", "warn"].forEach((fn) => jest.spyOn(console, fn).mockImplementation(() => {}));
  replaceState = jest.spyOn(window.history, "replaceState").mockImplementation(() => {});
  delete window.location;
  window.location = { href: "https://crm.test/", search: "", pathname: "/", hash: "", reload: jest.fn() };
  global.fetch = jest.fn();
});
afterEach(() => {
  window.location = originalLocation;
});

describe("STATE A - customer link (?tenant=<code>)", () => {
  beforeEach(() => {
    window.location.href = "https://crm.test/?tenant=MULTIAUTH&utm=x";
    window.location.search = "?tenant=MULTIAUTH&utm=x";
  });

  test("19 generic organisation sign-in; 14-17 the code and no internal identifier is rendered", () => {
    const { container } = render(<Login />);
    expect(screen.getByText("Sign in to your organisation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Use a different organisation/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Organisation code/i)).toBeNull();
    const html = container.innerHTML;
    expect(html).not.toContain("MULTIAUTH");
    expect(html).not.toMatch(/\b[0-9a-f]{24}\b/i); // internal tenant / connection ids
    expect(html).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i); // directory ids
    expect(global.fetch).not.toHaveBeenCalled(); // no name lookup before Microsoft sign-in
  });

  test("18 ?tenant is removed from the address bar without a reload (other parameters kept)", () => {
    render(<Login />);
    expect(replaceState).toHaveBeenCalledTimes(1);
    expect(replaceState.mock.calls[0][2]).toBe("/?utm=x");
    expect(window.location.reload).not.toHaveBeenCalled();
  });

  test("the in-memory code is what starts sign-in, even after the URL was cleaned", async () => {
    global.fetch.mockResolvedValueOnce(pkceOk());
    render(<Login />);
    continueWithMicrosoft();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(startUrl("MULTIAUTH")));
  });

  test("a customer link wins over a remembered organisation", async () => {
    localStorage.setItem("login_tenant_code", "DEVTENANTB");
    localStorage.setItem("login_tenant_name", "Tenant B Association");
    global.fetch.mockResolvedValueOnce(pkceOk());
    render(<Login />);
    expect(screen.queryByText("Tenant B Association")).toBeNull();
    continueWithMicrosoft();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(startUrl("MULTIAUTH")));
  });

  test("an internal tenant id in ?tenant is not a usable link: generic message, no redirect", async () => {
    window.location.href = `https://crm.test/?tenant=${INTERNAL_ID}`;
    window.location.search = `?tenant=${INTERNAL_ID}`;
    global.fetch.mockResolvedValueOnce(pkce400());
    const { container } = render(<Login />);
    expect(container.innerHTML).not.toContain(INTERNAL_ID);
    continueWithMicrosoft();
    expect(await screen.findByRole("alert")).toHaveTextContent(GENERIC);
    expect(screen.getByLabelText(/Organisation code/i)).toHaveValue(""); // falls back to manual entry
  });
});

describe("STATE B - remembered organisation", () => {
  beforeEach(() => {
    localStorage.setItem("login_tenant_code", "DEVTENANTB");
    localStorage.setItem("login_tenant_name", "Acme Association");
  });

  test("20 'Welcome back - Continue with <name>'; the code is not rendered", () => {
    const { container } = render(<Login />);
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByTestId("remembered-organisation")).toHaveTextContent("Continue with Acme Association");
    expect(container.innerHTML).not.toContain("DEVTENANTB");
    expect(screen.queryByLabelText(/Organisation code/i)).toBeNull();
  });

  test("21 the remembered CODE (never the display name) starts sign-in", async () => {
    global.fetch.mockResolvedValueOnce(pkceOk());
    render(<Login />);
    continueWithMicrosoft();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(startUrl("DEVTENANTB")));
    expect(global.fetch.mock.calls[0][0]).not.toMatch(/Acme/);
  });

  test("22/26 'Use a different organisation' shows manual entry; the remembered organisation is kept until a new sign-in succeeds", () => {
    render(<Login />);
    differentOrganisation();
    expect(screen.getByText("Sign in to ProjectShell")).toBeInTheDocument();
    expect(screen.getByLabelText(/Organisation code/i)).toHaveValue("");
    expect(screen.queryByText(/Acme Association/)).toBeNull();
    expect(localStorage.getItem("login_tenant_code")).toBe("DEVTENANTB");
    expect(localStorage.getItem("login_tenant_name")).toBe("Acme Association");
  });

  test("24 a stale remembered organisation: generic message, remembered entry cleared, manual entry", async () => {
    global.fetch.mockResolvedValueOnce(pkce400());
    render(<Login />);
    continueWithMicrosoft();
    expect(await screen.findByRole("alert")).toHaveTextContent(GENERIC);
    expect(localStorage.getItem("login_tenant_code")).toBeNull();
    expect(localStorage.getItem("login_tenant_name")).toBeNull();
    expect(screen.getByLabelText(/Organisation code/i)).toHaveValue("");
    expect(window.location.href).toBe("https://crm.test/"); // no redirect
  });

  test("an incomplete remembered entry (code without name) is not shown: manual entry", () => {
    localStorage.removeItem("login_tenant_name");
    render(<Login />);
    expect(screen.getByText("Sign in to ProjectShell")).toBeInTheDocument();
  });
});

describe("STATE C - no organisation context", () => {
  test("manual code entry only; no customer list / dropdown; nothing fetched on load", () => {
    const { container } = render(<Login />);
    expect(screen.getByText("Sign in to ProjectShell")).toBeInTheDocument();
    expect(screen.getByLabelText(/Organisation code/i)).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(container.querySelector("select")).toBeNull();
    expect(screen.queryByRole("button", { name: /Use a different organisation/i })).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled(); // 30 no organisation-list request
  });

  test("the legacy no-code sign-in is no longer offered: Continue is disabled until a code is entered", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: /Continue with Microsoft/i })).toBeDisabled();
    continueWithMicrosoft();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("23 manual code entry starts Microsoft sign-in with that code", async () => {
    global.fetch.mockResolvedValueOnce(pkceOk());
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Organisation code/i), { target: { value: " acme " } });
    continueWithMicrosoft();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(startUrl("acme")));
    await waitFor(() => expect(window.location.href).toContain("login.microsoftonline.com"));
  });

  test("25 invalid organisation: generic message only; the user can try another code", async () => {
    global.fetch.mockResolvedValueOnce(pkce400());
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Organisation code/i), { target: { value: "NOPE" } });
    continueWithMicrosoft();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(GENERIC);
    expect(alert.textContent).not.toMatch(/not found|exists|configured|directory|connection/i);
    fireEvent.change(screen.getByLabelText(/Organisation code/i), { target: { value: "OTHER" } });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  test("a malformed code is refused locally with the same generic message (no request)", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Organisation code/i), { target: { value: "a b/c" } });
    continueWithMicrosoft();
    expect(await screen.findByRole("alert")).toHaveTextContent(GENERIC);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

test("31 starting sign-in stores no organisation data and no internal identifiers", async () => {
  global.fetch.mockResolvedValueOnce(pkceOk());
  render(<Login />);
  fireEvent.change(screen.getByLabelText(/Organisation code/i), { target: { value: "MULTIAUTH" } });
  continueWithMicrosoft();
  await waitFor(() => expect(window.location.href).toContain("login.microsoftonline.com"));
  const stored = Object.keys(localStorage).sort();
  expect(stored).not.toContain("login_tenant_code");
  expect(stored).not.toContain("login_tenant_name");
  const values = Object.values(localStorage).join(" ");
  expect(values).not.toMatch(/\b[0-9a-f]{24}\b/i);
  expect(values).not.toContain(DIRECTORY);
});
