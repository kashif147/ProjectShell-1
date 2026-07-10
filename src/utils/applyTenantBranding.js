import { SHELL_BRANDING } from "../constants/shellBranding";
import { normalizeHex, readableTextColor } from "./brandingPalette";

/**
 * Applies saved tenant branding to shared CSS variables.
 * Color recommendations are handled in the tenant branding form, not here.
 */

const DEFAULT_TITLE = "Project Shell";

const SHELL_CSS_VARS = [
  "--primary-color",
  "--secoundry-color",
  "--accent-color",
  "--secoundry-bg-color",
  "--brand-on-primary",
  "--brand-on-secondary",
  "--brand-on-accent",
];

function resolveSavedBranding(branding = {}) {
  const primaryColor =
    normalizeHex(branding.primaryColor) || SHELL_BRANDING.primaryColor;
  const secondaryColor =
    normalizeHex(branding.secondaryColor) || SHELL_BRANDING.secondaryColor;
  const accentColor =
    normalizeHex(branding.accentColor) || SHELL_BRANDING.accentColor;
  const secondaryBackgroundColor =
    normalizeHex(branding.secondaryBackgroundColor) ||
    SHELL_BRANDING.secondaryBackgroundColor;

  return {
    ...branding,
    primaryColor,
    secondaryColor,
    accentColor,
    secondaryBackgroundColor,
    onPrimaryColor: readableTextColor(primaryColor),
    onSecondaryColor: readableTextColor(secondaryColor),
    onAccentColor: readableTextColor(accentColor),
  };
}

function applyShellCssVars(branding = SHELL_BRANDING) {
  const root = document.documentElement;
  const resolved = resolveSavedBranding(branding);
  const values = {
    "--primary-color": resolved.primaryColor,
    "--secoundry-color": resolved.secondaryColor,
    "--accent-color": resolved.accentColor,
    "--secoundry-bg-color": resolved.secondaryBackgroundColor,
    "--brand-on-primary": resolved.onPrimaryColor,
    "--brand-on-secondary": resolved.onSecondaryColor,
    "--brand-on-accent": resolved.onAccentColor,
  };

  SHELL_CSS_VARS.forEach((cssVar) => {
    root.style.setProperty(cssVar, values[cssVar]);
  });

  return resolved;
}

function setFavicon(url) {
  if (!url) return;
  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

export function applyTenantBranding(branding = {}) {
  const resolved = applyShellCssVars(branding);

  document.title = resolved.portalTitle?.trim() || DEFAULT_TITLE;
  setFavicon(resolved.faviconUrl || resolved.logoUrl);

  return resolved;
}

export function resetTenantBranding() {
  const resolved = applyShellCssVars(SHELL_BRANDING);
  document.title = DEFAULT_TITLE;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", resolved.primaryColor);
  return resolved;
}
