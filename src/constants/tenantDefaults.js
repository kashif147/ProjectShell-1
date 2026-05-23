import { applyBrandingPlaceholders } from "./tenantBrandingPlaceholders";
import { DEFAULT_BRANDING_ASSET_URLS } from "./brandingAssets";
import { SHELL_BRANDING } from "./shellBranding";

export const defaultOrganisationProfile = {
  legalName: "",
  tradingName: "",
  registrationNumber: "",
  charityNumber: "",
  vatNumber: "",
  website: "",
  email: "",
  contactNumber: "",
  sepaOriginatorIdentificationNumber: "",
};

export const defaultBranding = {
  ...DEFAULT_BRANDING_ASSET_URLS,
  primaryColor: SHELL_BRANDING.primaryColor,
  secondaryColor: SHELL_BRANDING.secondaryColor,
  accentColor: SHELL_BRANDING.accentColor,
  secondaryBackgroundColor: SHELL_BRANDING.secondaryBackgroundColor,
  portalTitle: SHELL_BRANDING.portalTitle,
  emailFooterText: "",
};

export const defaultRegionalSettings = {
  timezone: "Europe/Dublin",
  locale: "en-IE",
  currency: "EUR",
  dateFormat: "DD/MM/YYYY",
};

export const mergeTenantFormData = (tenant) => ({
  name: "",
  code: "",
  description: "",
  domain: "",
  status: "PENDING",
  isActive: true,
  organisationProfile: {
    ...defaultOrganisationProfile,
    ...(tenant?.organisationProfile || {}),
    email:
      tenant?.organisationProfile?.email ??
      tenant?.organisationProfile?.supportEmail ??
      "",
  },
  branding: applyBrandingPlaceholders({
    ...defaultBranding,
    ...(tenant?.branding || {}),
  }),
  regionalSettings: {
    ...defaultRegionalSettings,
    ...(tenant?.regionalSettings || {}),
  },
  settings: {
    maxUsers: 100,
    allowSelfRegistration: true,
    sessionTimeout: 24,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    ...(tenant?.settings || {}),
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      ...(tenant?.settings?.passwordPolicy || {}),
    },
  },
  subscription: {
    plan: "FREE",
    startDate: "",
    endDate: "",
    autoRenew: true,
    ...(tenant?.subscription || {}),
  },
  authenticationConnections: tenant?.authenticationConnections || [],
  ...(tenant
    ? {
        name: tenant.name ?? "",
        code: tenant.code ?? "",
        description: tenant.description ?? "",
        domain: tenant.domain ?? "",
        status: tenant.status ?? "PENDING",
        isActive: tenant.isActive ?? true,
      }
    : {}),
});
