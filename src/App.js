import "./App.css";
import "./styles/Utilites.css";
import "./styles/GlobalChatbot.css";
import Entry from "./Entry";
import React, { useEffect, useRef } from "react";
import AuthProvider from "./pages/auth/AuthProvider";
import { ChatbotProvider } from "./context/ChatbotContext";
import { FCMProvider } from "./context/FCMContext";
import { App as AntApp, notification } from "antd";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getAllLookups } from "./features/LookupsSlice";
import { getHierarchicalLookups } from "./features/GetLocationWithHierarky";
import "antd/dist/reset.css";
import { NotificationProvider } from "./context/NotificationContext";
import { ProfileRealtimeProvider } from "./context/ProfileRealtimeContext";
import { TenantBrandingProvider } from "./context/TenantBrandingContext";
import { useTenantBranding } from "./context/TenantBrandingContext";
import { normalizeHex } from "./utils/brandingPalette";

function blendHex(foreground, background, amount = 0.5) {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  if (!fg || !bg) return fg || bg || "#ffffff";

  const parse = (hex) => ({
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  });
  const toHex = (channel) =>
    Math.round(channel).toString(16).padStart(2, "0");
  const a = Math.min(Math.max(amount, 0), 1);
  const from = parse(fg);
  const to = parse(bg);

  return `#${toHex(from.r * a + to.r * (1 - a))}${toHex(
    from.g * a + to.g * (1 - a),
  )}${toHex(from.b * a + to.b * (1 - a))}`;
}

function BrandedAntTheme({ children }) {
  const { branding } = useTenantBranding();

  const primary = branding?.primaryColor || "#215e97";
  const secondary = branding?.secondaryColor || "#475569";
  const accent = branding?.accentColor || "#0d9488";
  const secondaryBg = branding?.secondaryBackgroundColor || "#eef2f6";
  const onPrimary = branding?.onPrimaryColor || "#ffffff";

  const config = React.useMemo(
    () => ({
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: primary,
        colorInfo: accent,
        colorLink: primary,
        colorBgLayout: "#f8f9f9",
        colorBgContainer: "#ffffff",
        colorBorder: blendHex(primary, "#d9d9d9", 0.14),
        colorTextHeading: blendHex(primary, "#111827", 0.76),
        borderRadius: 6,
        controlOutline: blendHex(primary, "#ffffff", 0.2),
        fontFamily: '"Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      },
      components: {
        Button: {
          colorPrimary: primary,
          colorPrimaryHover: blendHex(primary, "#000000", 0.84),
          colorPrimaryActive: blendHex(primary, "#000000", 0.74),
          primaryColor: onPrimary,
        },
        Layout: {
          bodyBg: "#f8f9f9",
          headerBg: primary,
          siderBg: primary,
        },
        Menu: {
          itemSelectedBg: blendHex(secondaryBg, "#ffffff", 0.78),
          itemSelectedColor: primary,
          itemHoverColor: primary,
        },
        Table: {
          headerBg: blendHex(secondaryBg, "#ffffff", 0.68),
          headerColor: primary,
          rowHoverBg: blendHex(secondaryBg, "#ffffff", 0.42),
        },
        Tabs: {
          inkBarColor: secondary,
          itemActiveColor: primary,
          itemHoverColor: primary,
          itemSelectedColor: primary,
        },
      },
    }),
    [accent, onPrimary, primary, secondary, secondaryBg],
  );

  return <ConfigProvider theme={config}>{children}</ConfigProvider>;
}

function App() {
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();
  const bootstrapRef = useRef({ lookups: false, hierarchical: false });

  const {
    hierarchicalLookups,
    hierarchicalLookupsLoading,
  } = useSelector((state) => state.hierarchicalLookups);

  const { lookups, lookupsloading: lookupsLoading } = useSelector(
    (state) => state.lookups,
  );

  // Make AntD notification globally available for MyAlert.js
  notification.success = api.success;
  notification.error = api.error;
  notification.info = api.info;
  notification.warning = api.warning;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      bootstrapRef.current = { lookups: false, hierarchical: false };
      return;
    }

    if (
      !lookupsLoading &&
      (!lookups || lookups.length === 0) &&
      !bootstrapRef.current.lookups
    ) {
      bootstrapRef.current.lookups = true;
      dispatch(getAllLookups());
    }

    if (
      !hierarchicalLookupsLoading &&
      (!hierarchicalLookups || hierarchicalLookups.length === 0) &&
      !bootstrapRef.current.hierarchical
    ) {
      bootstrapRef.current.hierarchical = true;
      dispatch(getHierarchicalLookups());
    }
  }, [
    dispatch,
    lookupsLoading,
    lookups,
    hierarchicalLookupsLoading,
    hierarchicalLookups,
  ]);
  useEffect(() => {
    const loadWorklet = async () => {
      // Shared Storage API is only available in secure contexts and specific origins
      if ("sharedStorage" in window && window.location.protocol === "https:") {
        try {
          // Check if worklet.addModule is available
          if (window.sharedStorage?.worklet?.addModule) {
            await window.sharedStorage.worklet.addModule(
              "/shared-storage-worklet.js",
            );
            console.log("✅ Shared Storage worklet loaded");
          }
        } catch (err) {
          // Silently fail - Shared Storage is not available in localhost/development
          // This is expected behavior and not an error
        }
      }
    };
    loadWorklet();
  }, []);

  return (
    <AntApp>
      {contextHolder}
      <AuthProvider>
        <FCMProvider>
          <NotificationProvider>
            <ProfileRealtimeProvider>
              <ChatbotProvider>
                <TenantBrandingProvider>
                  <BrandedAntTheme>
                    <div className="App">
                      <Entry />
                    </div>
                  </BrandedAntTheme>
                </TenantBrandingProvider>
              </ChatbotProvider>
            </ProfileRealtimeProvider>
          </NotificationProvider>
        </FCMProvider>
      </AuthProvider>
    </AntApp>
  );
}

export default App;
