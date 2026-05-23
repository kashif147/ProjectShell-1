import { DEFAULT_BRANDING_ASSET_URLS } from "./brandingAssets";

export const PLACEHOLDER_BRANDING_URLS = { ...DEFAULT_BRANDING_ASSET_URLS };

export const applyBrandingPlaceholders = (branding = {}) => ({
  ...branding,
  logoUrl: branding.logoUrl || PLACEHOLDER_BRANDING_URLS.logoUrl,
  logoDarkUrl: branding.logoDarkUrl || PLACEHOLDER_BRANDING_URLS.logoDarkUrl,
  faviconUrl: branding.faviconUrl || PLACEHOLDER_BRANDING_URLS.faviconUrl,
  letterHeaderUrl:
    branding.letterHeaderUrl || PLACEHOLDER_BRANDING_URLS.letterHeaderUrl,
  letterFooterUrl:
    branding.letterFooterUrl || PLACEHOLDER_BRANDING_URLS.letterFooterUrl,
});
