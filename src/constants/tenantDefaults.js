import { applyBrandingPlaceholders } from "./tenantBrandingPlaceholders";
import { DEFAULT_BRANDING_ASSET_URLS } from "./brandingAssets";
import { SHELL_BRANDING } from "./shellBranding";
import { defaultOfficeAddress } from "./tenantOfficeDefaults";

export const defaultOrganisationProfile = {
  legalName: "",
  tradingName: "",
  registrationNumber: "",
  charityNumber: "",
  vatNumber: "",
  website: "",
  email: "",
  contactNumber: "",
  bankName: "",
  bankAddress: defaultOfficeAddress(),
  iban: "",
  bic: "",
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

export const defaultLifecycleBatches = {
  reminder: {
    generateMode: "manual",
    executeMode: "manual",
  },
  cancellation: {
    generateMode: "manual",
    executeMode: "manual",
  },
  schedule: {
    dayMode: "FIRST_WORKING_DAY",
  },
  notificationRecipientRoleCodes: ["MO"],
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
    bankAddress: {
      ...defaultOfficeAddress(),
      ...(tenant?.organisationProfile?.bankAddress || {}),
    },
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
    lifecycleBatches: defaultLifecycleBatches,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    ...(tenant?.settings || {}),
    lifecycleBatches: {
      ...defaultLifecycleBatches,
      ...(tenant?.settings?.lifecycleBatches || {}),
      reminder: {
        ...defaultLifecycleBatches.reminder,
        ...(tenant?.settings?.lifecycleBatches?.reminder || {}),
      },
      cancellation: {
        ...defaultLifecycleBatches.cancellation,
        ...(tenant?.settings?.lifecycleBatches?.cancellation || {}),
      },
      schedule: {
        ...defaultLifecycleBatches.schedule,
        ...(tenant?.settings?.lifecycleBatches?.schedule || {}),
      },
      notificationRecipientRoleCodes:
        tenant?.settings?.lifecycleBatches?.notificationRecipientRoleCodes ||
        defaultLifecycleBatches.notificationRecipientRoleCodes,
    },
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
