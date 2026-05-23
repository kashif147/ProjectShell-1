/**
 * Applies tenant branding without overriding app shell CSS variables.
 * Sidebar, buttons, and chrome keep Utilites.css (:root) values.
 * Colours in tenant.branding are stored for future use (e.g. letters) only.
 */

const DEFAULT_TITLE = "Project Shell";

const SHELL_CSS_VARS = [
  "--primary-color",
  "--secoundry-color",
  "--accent-color",
  "--secoundry-bg-color",
];

function clearShellStyleOverrides() {
  const root = document.documentElement;
  SHELL_CSS_VARS.forEach((cssVar) => root.style.removeProperty(cssVar));
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
  clearShellStyleOverrides();

  document.title = branding.portalTitle?.trim() || DEFAULT_TITLE;
  setFavicon(branding.faviconUrl || branding.logoUrl);

  return branding;
}

export function resetTenantBranding() {
  clearShellStyleOverrides();
  document.title = DEFAULT_TITLE;

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute("content", "#000000");
}
