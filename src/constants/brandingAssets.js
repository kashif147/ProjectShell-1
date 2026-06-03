/** Default membership branding assets (served from /public/branding). */
const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");

export const DEFAULT_BRANDING_ASSET_URLS = {
  logoUrl: `${base}/branding/logo.svg`,
  logoDarkUrl: `${base}/branding/logo-dark.svg`,
  faviconUrl: `${base}/branding/favicon.svg`,
  letterHeaderUrl: `${base}/branding/letter-header.svg`,
  letterFooterUrl: `${base}/branding/letter-footer.svg`,
};
