export function normalizeIban(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

/** Organisation creditor/beneficiary IBAN used to block debtor using the same account. */
export function resolveOrganisationIban(record) {
  const safe = record || {};
  const so = safe.standingOrder || {};
  const dd = safe.directDebitMandate || {};
  const org = safe.organisationSnapshot || {};
  const orgProfile =
    org.organisationProfile && typeof org.organisationProfile === "object"
      ? org.organisationProfile
      : org;

  const candidates = [
    so.beneficiaryIban,
    dd.creditorIban,
    org.iban,
    orgProfile.iban,
  ];

  for (const raw of candidates) {
    const n = normalizeIban(raw);
    if (n) return n;
  }
  return "";
}

export function resolveOrganisationBic(record) {
  const safe = record || {};
  const so = safe.standingOrder || {};
  const dd = safe.directDebitMandate || {};
  const org = safe.organisationSnapshot || {};
  const orgProfile =
    org.organisationProfile && typeof org.organisationProfile === "object"
      ? org.organisationProfile
      : org;

  const candidates = [so.beneficiaryBic, dd.creditorBic, org.bic, orgProfile.bic];
  for (const raw of candidates) {
    const n = normalizeBic(raw);
    if (n) return n;
  }
  return "";
}

export function isMaskedIban(value) {
  return String(value || "").includes("****");
}

function mod97(iban) {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = "";
  for (let i = 0; i < rearranged.length; i += 1) {
    const ch = rearranged[i];
    remainder += /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    if (remainder.length > 9) {
      remainder = String(parseInt(remainder, 10) % 97);
    }
  }
  return parseInt(remainder, 10) % 97;
}

export function validateIban(value, { required = true } = {}) {
  const iban = normalizeIban(value);
  if (!iban) {
    return required
      ? { valid: false, message: "IBAN is required" }
      : { valid: true, iban: "" };
  }
  if (isMaskedIban(iban)) {
    return { valid: true, iban, masked: true };
  }
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) {
    return { valid: false, message: "Invalid IBAN format" };
  }
  if (iban.length < 15 || iban.length > 34) {
    return { valid: false, message: "Invalid IBAN length" };
  }
  if (mod97(iban) !== 1) {
    return { valid: false, message: "IBAN check digits are invalid" };
  }
  return { valid: true, iban };
}

export function maskIban(iban) {
  const n = normalizeIban(iban);
  if (!n || isMaskedIban(n)) return n;
  if (n.length <= 8) return "****";
  return `${n.slice(0, 4)}****${n.slice(-4)}`;
}

export function formatIbanDisplay(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (isMaskedIban(raw)) {
    const compact = normalizeIban(raw);
    const [head, tail] = compact.split("****");
    if (tail !== undefined) {
      const prefix = head.slice(0, 4);
      const suffix = tail.slice(-4);
      return `${prefix} **** ${suffix}`.trim();
    }
    return compact.replace("****", " **** ");
  }
  const n = normalizeIban(raw);
  return n.replace(/(.{4})/g, "$1 ").trim();
}

export function sanitizeIbanInput(value) {
  const compact = String(value || "")
    .replace(/[^A-Za-z0-9*]/g, "")
    .toUpperCase()
    .slice(0, 34);
  if (isMaskedIban(compact)) return compact;
  return compact.replace(/[^A-Z0-9]/g, "").slice(0, 34);
}

export function buildIbanFormRules({
  required = true,
  organisationIban = "",
} = {}) {
  const orgIbanNorm = normalizeIban(organisationIban);
  return [
    {
      validator: (_, value) => {
        const result = validateIban(value, { required });
        if (!result.valid) {
          return Promise.reject(new Error(result.message));
        }
        if (required && result.masked) {
          return Promise.reject(new Error("Enter the full IBAN"));
        }
        if (orgIbanNorm) {
          const orgMatch = debtorMatchesOrganisationBank({
            debtorIban: value,
            organisationIban: orgIbanNorm,
          });
          if (orgMatch.matches) {
            return Promise.reject(new Error(orgMatch.message));
          }
        }
        return Promise.resolve();
      },
    },
  ];
}

export function ibanFormItemProps({ required = true, organisationIban } = {}) {
  return {
    getValueProps: (value) => ({ value: formatIbanDisplay(value) }),
    normalize: (value) => sanitizeIbanInput(value),
    rules: buildIbanFormRules({ required, organisationIban }),
  };
}

export const IBAN_INPUT_PROPS = {
  placeholder: "IE12 BOFI 9012 3456 78",
  className: "payment-form-drawer__iban-input",
  autoComplete: "off",
  spellCheck: false,
};

export function normalizeBic(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .toUpperCase();
}

export function validateBic(value, { required = false } = {}) {
  const bic = normalizeBic(value);
  if (!bic) {
    return required
      ? { valid: false, message: "BIC is required" }
      : { valid: true, bic: "" };
  }
  if (!/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic)) {
    return { valid: false, message: "Invalid BIC format" };
  }
  return { valid: true, bic };
}

/** Reject only when debtor IBAN equals the organisation creditor/beneficiary IBAN (BIC may match — same bank). */
export function debtorMatchesOrganisationBank({ debtorIban, organisationIban }) {
  const orgIban = normalizeIban(organisationIban);
  const memberIban = normalizeIban(debtorIban);

  if (orgIban && memberIban && !isMaskedIban(memberIban) && memberIban === orgIban) {
    return {
      matches: true,
      message:
        "You cannot use the organisation creditor/beneficiary IBAN as your account IBAN",
    };
  }
  return { matches: false };
}

export function formatBicDisplay(value) {
  return normalizeBic(value);
}

export function sanitizeBicInput(value) {
  return String(value || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 11);
}

export function bicFormItemProps({ required = false } = {}) {
  return {
    getValueProps: (value) => ({ value: formatBicDisplay(value) }),
    normalize: (value) => sanitizeBicInput(value),
    rules: [
      ...(required ? [{ required: true, message: "BIC is required" }] : []),
      {
        validator: (_, value) => {
          const result = validateBic(value, { required });
          if (!result.valid) {
            return Promise.reject(new Error(result.message));
          }
          return Promise.resolve();
        },
      },
    ],
  };
}

export const BIC_INPUT_PROPS = {
  placeholder: "BOFIIE2D",
  className: "payment-form-drawer__bic-input",
  autoComplete: "off",
  spellCheck: false,
  maxLength: 11,
};

/** IBAN is complete and valid (not masked). */
export function isIbanFieldComplete(iban) {
  const result = validateIban(iban, { required: true });
  return result.valid && !result.masked;
}

/** BIC is complete and valid when a value has been entered (optional field). */
export function isBicFieldComplete(bic) {
  const bicNorm = normalizeBic(bic);
  if (!bicNorm) return false;
  return validateBic(bic, { required: false }).valid;
}

/** Required IBAN valid; optional BIC empty or valid. */
export function isBankSectionComplete(iban, bic) {
  if (!isIbanFieldComplete(iban)) return false;
  const bicNorm = normalizeBic(bic);
  if (!bicNorm) return true;
  return validateBic(bic, { required: false }).valid;
}

/** @deprecated Use isBankSectionComplete */
export function isBankPairValid(iban, bic) {
  return isBankSectionComplete(iban, bic);
}

export function getBankFieldStatuses(iban, bic, { organisationIban } = {}) {
  const ibanNorm = normalizeIban(iban);
  const bicNorm = normalizeBic(bic);
  const ibanResult = validateIban(iban, { required: true });
  const bicResult = validateBic(bic, { required: false });
  const orgIbanNorm = normalizeIban(organisationIban);
  const ibanOrgMatch = debtorMatchesOrganisationBank({
    debtorIban: iban,
    organisationIban: orgIbanNorm,
  });
  const ibanComplete =
    isIbanFieldComplete(iban) && !ibanOrgMatch.matches;
  const bicComplete = isBicFieldComplete(bic);

  let ibanStatus;
  let bicStatus;

  if (ibanComplete) {
    ibanStatus = "success";
  } else if (ibanNorm && (!ibanResult.valid || ibanResult.masked || ibanOrgMatch.matches)) {
    ibanStatus = "error";
  }

  if (bicComplete) {
    bicStatus = "success";
  } else if (bicNorm && !bicResult.valid) {
    bicStatus = "error";
  }

  return {
    sectionComplete:
      ibanComplete &&
      (!bicNorm || bicComplete),
    ibanComplete,
    bicComplete,
    ibanStatus,
    bicStatus,
  };
}
