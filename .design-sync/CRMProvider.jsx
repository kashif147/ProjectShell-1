// CRMProvider - the CRM's app shell, minus routing and auth bootstrap, for rendering
// shared components outside the app (design-sync previews and designs built with them).
//
// Mirrors the provider stack of src/index.js + src/App.js + src/Entry.js, in the same
// order: Redux store, router (in-memory instead of BrowserRouter), the index.js UI
// contexts, auth, notifications, tenant branding, and the Ant Design theme.
// With no signed-in token every provider stays local: AuthorizationProvider reports
// signed-out, NotificationProvider opens no socket, TenantBrandingProvider keeps the
// default palette.
//
// BrandedAntTheme below is a COPY of the one in src/App.js (not exported there).
// Re-sync risk: re-copy it whenever App.js's theme config changes.

import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme as antdTheme } from 'antd';
import store from '../src/store/Store';
import { TableColumnsProvider } from '../src/context/TableColumnsContext ';
import { ExcelProvider } from '../src/context/ExcelContext';
import { ViewProvider } from '../src/context/ViewContext';
import { RemindersProvider } from '../src/context/CampaignDetailsProvider';
import { FilterProvider } from '../src/context/FilterContext';
import { SelectedIdsProvider } from '../src/context/SelectedIdsContext';
import { UnsavedFormProvider } from '../src/context/UnsavedFormContext';
import { AuthorizationProvider } from '../src/context/AuthorizationContext';
import { CasesEditProvider } from '../src/context/CasesEditContext';
import { ReminderBatchesFilterProvider } from '../src/context/ReminderBatchesFilterContext';
import { CancellationBatchesFilterProvider } from '../src/context/CancellationBatchesFilterContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { TenantBrandingProvider, useTenantBranding } from '../src/context/TenantBrandingContext';
import { normalizeHex } from '../src/utils/brandingPalette';

function blendHex(foreground, background, amount = 0.5) {
  const fg = normalizeHex(foreground);
  const bg = normalizeHex(background);
  if (!fg || !bg) return fg || bg || '#ffffff';
  const parse = (hex) => ({
    r: Number.parseInt(hex.slice(1, 3), 16),
    g: Number.parseInt(hex.slice(3, 5), 16),
    b: Number.parseInt(hex.slice(5, 7), 16),
  });
  const toHex = (channel) => Math.round(channel).toString(16).padStart(2, '0');
  const a = Math.min(Math.max(amount, 0), 1);
  const from = parse(fg);
  const to = parse(bg);
  return `#${toHex(from.r * a + to.r * (1 - a))}${toHex(from.g * a + to.g * (1 - a))}${toHex(from.b * a + to.b * (1 - a))}`;
}

function BrandedAntTheme({ children }) {
  const { branding } = useTenantBranding();
  const primary = branding?.primaryColor || '#215e97';
  const secondary = branding?.secondaryColor || '#475569';
  const accent = branding?.accentColor || '#0d9488';
  const secondaryBg = branding?.secondaryBackgroundColor || '#eef2f6';
  const onPrimary = branding?.onPrimaryColor || '#ffffff';
  const config = React.useMemo(
    () => ({
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: primary,
        colorInfo: accent,
        colorLink: primary,
        colorBgLayout: '#f8f9f9',
        colorBgContainer: '#ffffff',
        colorBorder: blendHex(primary, '#d9d9d9', 0.14),
        colorTextHeading: blendHex(primary, '#111827', 0.76),
        borderRadius: 6,
        controlOutline: blendHex(primary, '#ffffff', 0.2),
        fontFamily: '"Roboto", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      },
      components: {
        Button: {
          colorPrimary: primary,
          colorPrimaryHover: blendHex(primary, '#000000', 0.84),
          colorPrimaryActive: blendHex(primary, '#000000', 0.74),
          primaryColor: onPrimary,
        },
        Layout: { bodyBg: '#f8f9f9', headerBg: primary, siderBg: primary },
        Menu: {
          itemSelectedBg: blendHex(secondaryBg, '#ffffff', 0.78),
          itemSelectedColor: primary,
          itemHoverColor: primary,
        },
        Table: {
          headerBg: blendHex(secondaryBg, '#ffffff', 0.68),
          headerColor: primary,
          rowHoverBg: blendHex(secondaryBg, '#ffffff', 0.42),
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

/**
 * Wrap every CRM screen or component in this. It supplies the Redux store, an in-memory
 * router (`initialPath` sets its starting URL), the CRM's UI contexts, signed-out auth,
 * and the branded Ant Design theme. Without it most components throw or render unstyled.
 */
export function CRMProvider({ children, initialPath = '/' }) {
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        <UnsavedFormProvider>
          <ExcelProvider>
            <SelectedIdsProvider>
              <FilterProvider>
                <RemindersProvider>
                  <ViewProvider>
                    <TableColumnsProvider>
                      <AuthorizationProvider>
                        <AntApp>
                          <NotificationProvider>
                            <TenantBrandingProvider>
                              <BrandedAntTheme>
                                {/* Entry.js wraps every route in these three */}
                                <ReminderBatchesFilterProvider>
                                  <CancellationBatchesFilterProvider>
                                    <CasesEditProvider>{children}</CasesEditProvider>
                                  </CancellationBatchesFilterProvider>
                                </ReminderBatchesFilterProvider>
                              </BrandedAntTheme>
                            </TenantBrandingProvider>
                          </NotificationProvider>
                        </AntApp>
                      </AuthorizationProvider>
                    </TableColumnsProvider>
                  </ViewProvider>
                </RemindersProvider>
              </FilterProvider>
            </SelectedIdsProvider>
          </ExcelProvider>
        </UnsavedFormProvider>
      </MemoryRouter>
    </Provider>
  );
}

/**
 * Render children as if the CRM were on `path` (e.g. "/Summary", "/Applications").
 * Use inside CRMProvider for components that only show on a given screen (grid toolbars,
 * Save View menus, route-aware headers). Children mount once the route has moved.
 */
export function CRMRoute({ path, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (location.pathname !== path) navigate(path, { replace: true });
  }, [location.pathname, navigate, path]);
  return location.pathname === path ? <>{children}</> : null;
}

// Date values for antd/CRM date pickers (the CRM uses dayjs throughout).
export { default as dayjs } from 'dayjs';

export default CRMProvider;
