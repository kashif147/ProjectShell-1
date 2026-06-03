import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  Button,
  Space,
  Upload,
  Input,
  Form,
  message,
  Select,
  DatePicker,
  Checkbox,
  Row,
  Col,
  Alert,
  InputNumber,
  Popconfirm,
  Radio,
} from "antd";
import dayjs from "dayjs";
import {
  getPaymentForm,
  prefillPaymentForm,
  createPaymentForm,
  updatePaymentForm,
  submitPaymentForm,
  verifyPaymentForm,
  approvePaymentForm,
  rejectPaymentForm,
  deletePaymentForm,
  uploadPaperPaymentForm,
  uploadSignedPaymentForm,
  downloadPaymentFormPdf,
} from "../../api/paymentFormApi";
import {
  parseFilenameFromContentDisposition,
  triggerBlobDownload,
} from "../../utils/paymentFormDownload";
import { useDispatch, useSelector } from "react-redux";
import { getAllLookups } from "../../features/LookupsSlice";
import { fetchCountries } from "../../features/CountriesSlice";
import MemberSearch from "../profile/MemberSearch";
import {
  FORM_TYPE_SELECT_OPTIONS,
  SOURCE_LABELS,
} from "./paymentFormTypes";
import {
  formatIbanDisplay,
  isMaskedIban,
  normalizeBic,
  normalizeIban,
  resolveOrganisationIban,
  resolveOrganisationBic,
  debtorMatchesOrganisationBank,
} from "../../utils/iban";
import "./PaymentFormDrawer.css";
import BankIbanBicFields from "./BankIbanBicFields";
import { CRM_PAYMENT_FREQUENCY_OPTIONS } from "../../constants/paymentFrequency";
import {
  installmentFromAnnual,
  parseInstallmentAmountEur,
  resolveStandingOrderAnnualFee,
} from "../../utils/paymentFormFinancials";

const DRAWER_WIDTH = 960;

const IRISH_BANKS = [
  "Allied Irish Banks (AIB)",
  "Bank of Ireland",
  "Ulster Bank",
  "Permanent TSB",
  "AIB",
  "Revolut",
  "N26",
];

function isPdfUrl(url, name) {
  if (name && /\.pdf$/i.test(name)) return true;
  if (!url) return false;
  const clean = String(url).split("?")[0].toLowerCase();
  return clean.endsWith(".pdf");
}

function ScanPreview({ url, name }) {
  if (!url) return null;
  const pdf = isPdfUrl(url, name);
  return (
    <div className="payment-form-drawer__scan-preview">
      {pdf ? (
        <iframe
          src={url}
          className="payment-form-drawer__scan-iframe"
          title={name || "Signed mandate"}
        />
      ) : (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={name || "Signed mandate"}
            className="payment-form-drawer__scan-image"
          />
        </a>
      )}
      <div className="payment-form-drawer__scan-meta">
        <span className="payment-form-drawer__scan-name">
          {name || (pdf ? "Signed mandate (PDF)" : "Signed mandate")}
        </span>
        <Space size="small">
          <a href={url} target="_blank" rel="noreferrer">
            Open
          </a>
          <a href={url} download>
            Download
          </a>
        </Space>
      </div>
    </div>
  );
}

function AuthorisationChoice({
  value,
  onChange,
  digitalLabel,
  onFileLabel = "Authorisation on file (signed scan attached).",
  uploadLabel = "Upload scanned form",
  replaceLabel = "Replace scanned form",
  scanUrl,
  scanName,
  pendingFile,
  onPickFile,
  onRemoveFile,
  disabled,
}) {
  const set = (next) => {
    if (disabled) return;
    onChange?.(next === value ? null : next);
  };
  return (
    <div className="payment-form-drawer__auth-choice">
      <div
        className={`payment-form-drawer__auth-option${value === "on_file" ? " is-active" : ""}`}
      >
        <Checkbox
          checked={value === "on_file"}
          onChange={() => set("on_file")}
          disabled={disabled}
        >
          <span className="payment-form-drawer__auth-text">
            <strong>{onFileLabel}</strong>
          </span>
        </Checkbox>
        {value === "on_file" && (
          <div className="payment-form-drawer__auth-option-body">
            {!disabled && (
              <Upload
                beforeUpload={(file) => {
                  onPickFile?.(file);
                  return false;
                }}
                onRemove={() => onRemoveFile?.()}
                maxCount={1}
                fileList={
                  pendingFile
                    ? [
                        {
                          uid: "pending",
                          name: pendingFile.name,
                          status: "done",
                        },
                      ]
                    : []
                }
              >
                <Button>{scanUrl ? replaceLabel : uploadLabel}</Button>
              </Upload>
            )}
            {scanUrl && <ScanPreview url={scanUrl} name={scanName} />}
          </div>
        )}
      </div>
      <div
        className={`payment-form-drawer__auth-option${value === "digital" ? " is-active" : ""}`}
      >
        <Checkbox
          checked={value === "digital"}
          onChange={() => set("digital")}
          disabled={disabled}
        >
          <span className="payment-form-drawer__auth-text">{digitalLabel}</span>
        </Checkbox>
      </div>
    </div>
  );
}

function SignaturePreview({ url, label }) {
  if (!url) return null;
  return (
    <div className="payment-form-drawer__signature-inline">
      {label && (
        <span className="payment-form-drawer__signature-inline-label">
          {label}
        </span>
      )}
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={label || "Signature"}
          className="payment-form-drawer__signature-image"
        />
      </a>
    </div>
  );
}

function SignatureEvidence({ record, signatureUrls }) {
  const hasCanvas = (signatureUrls || []).some(Boolean);
  const paperUrl = record?.downloadUrls?.paperUpload;
  const signedPdfUrl = record?.downloadUrls?.signedPdf;
  const paperName = record?.paperUpload?.fileName;
  const signedName = record?.signedPdf?.fileName;

  if (!hasCanvas && !paperUrl && !signedPdfUrl) {
    return (
      <div className="payment-form-drawer__signature-evidence payment-form-drawer__signature-evidence--missing">
        <span className="payment-form-drawer__signature-evidence-hint">
          No signature evidence on file yet.
        </span>
      </div>
    );
  }

  return (
    <div className="payment-form-drawer__signature-evidence">
      {hasCanvas && (
        <div className="payment-form-drawer__signature-inline-row">
          {signatureUrls.map((url, idx) =>
            url ? (
              <SignaturePreview
                key={`${url}-${idx}`}
                url={url}
                label={
                  signatureUrls.filter(Boolean).length > 1
                    ? `Signature ${idx + 1}`
                    : "Signature"
                }
              />
            ) : null,
          )}
        </div>
      )}
      {(paperUrl || signedPdfUrl) && (
        <div className="payment-form-drawer__signature-evidence-links">
          {paperUrl && (
            <a
              className="payment-form-drawer__signature-evidence-link"
              href={paperUrl}
              target="_blank"
              rel="noreferrer"
            >
              View scanned form{paperName ? ` (${paperName})` : ""}
            </a>
          )}
          {signedPdfUrl && (
            <a
              className="payment-form-drawer__signature-evidence-link"
              href={signedPdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              View signed PDF{signedName ? ` (${signedName})` : ""}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function ReadonlyRow({ label, value, mono = false }) {
  return (
    <div className="payment-form-drawer__readonly-row">
      <span className="payment-form-drawer__readonly-label">{label}</span>
      <span
        className={`payment-form-drawer__readonly-value${mono ? " payment-form-drawer__readonly-value--mono" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}

const DD_PAYMENT_TYPE_OPTIONS = [
  { value: "recurrent", label: "Recurrent payment" },
  { value: "oneoff", label: "One-off payment" },
];

/** Backend sets status to `active` when a form is approved. */
const READ_ONLY_PAYMENT_FORM_STATUSES = new Set(["active"]);

function ddPaymentTypeFromRecord(dd = {}) {
  return dd.paymentTypeRecurrent === false ? "oneoff" : "recurrent";
}

function resolveDdPaymentType(values, formInstance) {
  const raw =
    values.ddPaymentType ?? formInstance?.getFieldValue?.("ddPaymentType");
  return raw === "oneoff" ? "oneoff" : "recurrent";
}

function resolveCreditorAddressLines(record, dd = {}) {
  const safeRecord = record || {};
  const safeDd = dd || {};
  const bank = safeRecord.organisationSnapshot?.bankAddress || {};
  const line1 = String(bank.buildingOrHouse || "").trim();
  const line2 = String(bank.streetOrRoad || "").trim();
  if (line1 || line2) {
    return { line1, line2 };
  }
  return splitDebtorAddressLines(safeDd.creditorAddress);
}

function splitDebtorAddressLines(address) {
  const raw = String(address || "").trim();
  if (!raw) return { line1: "", line2: "" };
  if (raw.includes("\n")) {
    const [line1, ...rest] = raw.split("\n");
    return { line1: line1.trim(), line2: rest.join("\n").trim() };
  }
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { line1: parts[0] || "", line2: parts[1] || "" };
}

function joinDebtorAddressLines(line1, line2) {
  return [line1, line2]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join("\n");
}

function formatInstallmentAmount(section = {}) {
  if (section.installmentAmountDisplay) return section.installmentAmountDisplay;
  const eur = Number(section.installmentAmountEur);
  if (Number.isFinite(eur) && eur > 0) {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(eur);
  }
  return "";
}

function resolveOrganisationBankDetails(record) {
  return {
    iban: resolveOrganisationIban(record),
    bic: resolveOrganisationBic(record),
  };
}

function normalizeOrgNameKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/** One organisation label — avoids "Foo (Foo Ltd)" when names are variants of each other. */
function resolveOrganisationDisplayName(org = {}, branding = {}) {
  const legalName = String(org.legalName || "").trim();
  const tradingName = String(org.tradingName || "").trim();
  const fallbackName = branding.portalTitle || "the Organisation";

  if (!legalName && !tradingName) return fallbackName;
  if (!legalName) return tradingName;
  if (!tradingName) return legalName;

  const legalKey = normalizeOrgNameKey(legalName);
  const tradingKey = normalizeOrgNameKey(tradingName);
  if (legalKey === tradingKey) return legalName;

  if (legalName.includes(tradingName) || tradingName.includes(legalName)) {
    return legalName.length >= tradingName.length ? legalName : tradingName;
  }

  const parenSuffix = legalName.match(/\(([^)]+)\)\s*$/);
  if (parenSuffix && normalizeOrgNameKey(parenSuffix[1]) === tradingKey) {
    return legalName;
  }

  return `${legalName} (${tradingName})`;
}

function resolveOrganisationReturnDetails(record = {}) {
  const org = record?.organisationSnapshot || {};
  const branding = record?.brandingSnapshot || {};
  const displayName = resolveOrganisationDisplayName(org, branding);
  const bank = org.bankAddress || {};
  const tenantAddress = org.address || {};
  const addressLine =
    [
      [bank.buildingOrHouse, bank.streetOrRoad].filter(Boolean).join(", "),
      [bank.areaOrTown, bank.countyCityOrPostCode].filter(Boolean).join(", "),
      bank.eircode,
      bank.country,
    ]
      .filter(Boolean)
      .join(", ") ||
    [
      [tenantAddress.street, tenantAddress.city].filter(Boolean).join(", "),
      [tenantAddress.state, tenantAddress.zipCode].filter(Boolean).join(", "),
      tenantAddress.country,
    ]
      .filter(Boolean)
      .join(", ");
  return { name: displayName, displayName, addressLine };
}

function OrganisationNameBold({ name }) {
  if (!name) return null;
  return <strong className="payment-form-drawer__org-name">{name}</strong>;
}

function formatMemberHeaderLabel(selectedMember, record) {
  if (selectedMember) {
    const name = [
      selectedMember.personalInfo?.forename,
      selectedMember.personalInfo?.surname,
    ]
      .filter(Boolean)
      .join(" ");
    if (selectedMember.membershipNumber && name) {
      return `${selectedMember.membershipNumber} — ${name}`;
    }
    return selectedMember.membershipNumber || name || "";
  }
  if (record?.membershipNumber) {
    const name =
      record.salaryDeduction?.memberFullName ||
      record.directDebitMandate?.debtorName ||
      "";
    if (name) return `${record.membershipNumber} — ${name}`;
    return record.membershipNumber;
  }
  return "";
}

export default function PaymentFormDetailDrawer({
  open,
  formId,
  onClose,
  onUpdated,
  createMode = false,
  createFormType = null,
  onPersisted,
  initialProfileId = null,
  initialProfile = null,
  lockMemberSelection = false,
}) {
  const [form] = Form.useForm();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [composeFormType, setComposeFormType] = useState(createFormType);
  const [pendingScanFile, setPendingScanFile] = useState(null);
  const [memberFormError, setMemberFormError] = useState(null);
  const isCompose = createMode && !formId;
  const memberLocked = lockMemberSelection || Boolean(initialProfileId);
  const dispatch = useDispatch();
  const branchOptions = useSelector((s) => s.lookups?.branchOptions || []);
  const workLocationOptions = useSelector(
    (s) => s.lookups?.workLocationOptions || [],
  );
  const countriesOptions = useSelector(
    (s) => s.countries?.countriesOptions || [],
  );
  const countrySelectOptions = countriesOptions.map((c) => ({
    value: c.label,
    label: c.label,
  }));
  const standingOrderFrequency = Form.useWatch("paymentFrequency", form);
  const skipFrequencyRecalcRef = useRef(true);

  const bankOptions = [
    ...IRISH_BANKS.map((b) => ({ value: b, label: b })),
    ...(branchOptions || []).map((b) => ({
      value: b.label || b.value,
      label: b.label || b.value,
    })),
  ];

  const load = async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const data = await getPaymentForm(formId);
      setRecord(data);
      hydrateForm(data);
    } catch {
      message.error("Could not load payment form");
    } finally {
      setLoading(false);
    }
  };

  const hydrateForm = (data) => {
    const so = data.standingOrder || {};
    const sd = data.salaryDeduction || {};
    const dd = data.directDebitMandate || {};
    const sigDates = so.signatureDates || [];
    form.setFieldsValue({
      debtorBankName: so.debtorBankName,
      debtorBankAddress: so.debtorBankAddress,
      debtorAccountName: so.debtorAccountName,
      debtorIban: normalizeIban(
        so.debtorIbanPlain || so.debtorIbanDisplay || "",
      ),
      debtorBic: normalizeBic(so.debtorBicPlain || ""),
      startDate: so.startDate ? dayjs(so.startDate) : null,
      paymentFrequency:
        so.paymentFrequency || so.frequencyLayoutKey || "Monthly",
      installmentAmountEur: parseInstallmentAmountEur(so),
      soAuthorisationMode:
        so.authorisationMode || (so.isAuthorized ? "digital" : null),
      signatureDate1: sigDates[0] ? dayjs(sigDates[0]) : null,
      signatureDate2: sigDates[1] ? dayjs(sigDates[1]) : null,
      memberFullName: sd.memberFullName,
      employedAt: sd.employedAt,
      payrollStaffNo: sd.payrollStaffNo,
      commencingDate: sd.commencingDate ? dayjs(sd.commencingDate) : null,
      signatureDate: sd.signedDate ? dayjs(sd.signedDate) : null,
      sdAuthorisationMode:
        sd.authorisationMode || (sd.isAuthorized ? "digital" : null),
      debtorName: dd.debtorName,
      ...(() => {
        const { line1, line2 } = splitDebtorAddressLines(dd.debtorAddress);
        return {
          debtorAddressLine1: line1,
          debtorAddressLine2: line2,
        };
      })(),
      debtorCity: dd.debtorCity,
      debtorPostcode: dd.debtorPostcode,
      debtorCountry: dd.debtorCountry,
      ddIban: normalizeIban(dd.debtorIbanPlain || dd.debtorIbanDisplay || ""),
      ddBic: normalizeBic(dd.debtorBicPlain || ""),
      ddSignedDate: dd.signedDate ? dayjs(dd.signedDate) : null,
      ddAuthorisationMode:
        dd.authorisationMode || (dd.isAuthorized ? "digital" : null),
      ddPaymentType: ddPaymentTypeFromRecord(dd),
    });
    skipFrequencyRecalcRef.current = true;
  };

  useEffect(() => {
    const formType = record?.formType || composeFormType;
    if (formType !== "STANDING_ORDER" || !record) return;
    if (skipFrequencyRecalcRef.current) {
      skipFrequencyRecalcRef.current = false;
      return;
    }
    const annual = resolveStandingOrderAnnualFee(record);
    if (!annual || !standingOrderFrequency) return;
    const next = installmentFromAnnual(annual, standingOrderFrequency);
    if (next != null) {
      form.setFieldValue("installmentAmountEur", next);
    }
  }, [standingOrderFrequency, record, composeFormType, form]);

  const resetCompose = () => {
    setRecord(null);
    setSelectedMember(null);
    setMemberFormError(null);
    setComposeFormType(createFormType || "STANDING_ORDER");
    setPendingScanFile(null);
    form.resetFields();
  };

  const loadPrefill = async (profileId, preferredFormType = null) => {
    if (!profileId) return;
    setLoading(true);
    setMemberFormError(null);
    try {
      const data = await prefillPaymentForm(profileId, preferredFormType || undefined);
      const allowed = data.allowedFormType || data.formType;
      setComposeFormType(allowed);
      setRecord({ ...data, formType: allowed, unsaved: true });
      hydrateForm(data);
    } catch (err) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Could not load form for this member";
      setMemberFormError(msg);
      message.error(msg);
      setRecord(null);
      setComposeFormType(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (member) => {
    if (!member?._id) return;
    setSelectedMember(member);
    loadPrefill(member._id);
  };

  const handleMemberClear = () => {
    setSelectedMember(null);
    setRecord(null);
    setMemberFormError(null);
    setComposeFormType(createFormType || "STANDING_ORDER");
    form.resetFields();
  };

  const handleClose = () => {
    if (isCompose) resetCompose();
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    if (formId) {
      load();
      return;
    }
    if (isCompose) {
      if (initialProfileId) {
        setSelectedMember(
          initialProfile?._id
            ? initialProfile
            : { _id: initialProfileId },
        );
        setMemberFormError(null);
        setComposeFormType(null);
        form.resetFields();
        loadPrefill(initialProfileId);
      } else {
        resetCompose();
      }
    }
  }, [open, formId, isCompose, createFormType, initialProfileId]);

  useEffect(() => {
    if (!open) return;
    if (!workLocationOptions.length) {
      dispatch(getAllLookups());
    }
    dispatch(fetchCountries());
  }, [open, dispatch, workLocationOptions.length]);

  const buildPatchBody = (values) => {
    const activeType = record?.formType || composeFormType;
    if (activeType === "STANDING_ORDER") {
      const signatureDates = [values.signatureDate1, values.signatureDate2]
        .filter(Boolean)
        .map((d) => d.toISOString());
      return {
        standingOrder: {
          debtorBankName: values.debtorBankName,
          debtorBankAddress: values.debtorBankAddress,
          debtorAccountName: values.debtorAccountName,
          debtorIban: (() => {
            const iban = normalizeIban(values.debtorIban);
            return isMaskedIban(iban) ? undefined : iban;
          })(),
          debtorBic: normalizeBic(values.debtorBic) || undefined,
          startDate: values.startDate?.toISOString?.(),
          paymentFrequency: values.paymentFrequency || "Monthly",
          installmentAmountEur: values.installmentAmountEur,
          signatureDates,
          authorisationMode:
            values.soAuthorisationMode === "on_file" ||
            values.soAuthorisationMode === "digital"
              ? values.soAuthorisationMode
              : null,
        },
      };
    }
    if (activeType === "SALARY_DEDUCTION") {
      return {
        salaryDeduction: {
          memberFullName: values.memberFullName?.trim(),
          employedAt: values.employedAt,
          payrollStaffNo: values.payrollStaffNo,
          commencingDate: values.commencingDate?.toISOString?.(),
          signedDate: values.signatureDate?.toISOString?.(),
          authorisationMode:
            values.sdAuthorisationMode === "on_file" ||
            values.sdAuthorisationMode === "digital"
              ? values.sdAuthorisationMode
              : null,
        },
      };
    }
    if (activeType === "DD_MANDATE") {
      return {
        directDebitMandate: {
          debtorName: values.debtorName,
          debtorAddress: joinDebtorAddressLines(
            values.debtorAddressLine1,
            values.debtorAddressLine2,
          ),
          debtorCity: values.debtorCity,
          debtorPostcode: values.debtorPostcode,
          debtorCountry: values.debtorCountry,
          debtorIban: (() => {
            const iban = normalizeIban(values.ddIban);
            return isMaskedIban(iban) ? undefined : iban;
          })(),
          debtorBic: normalizeBic(values.ddBic) || undefined,
          signedDate: values.ddSignedDate?.toISOString?.(),
          authorisationMode:
            values.ddAuthorisationMode === "on_file" ||
            values.ddAuthorisationMode === "digital"
              ? values.ddAuthorisationMode
              : null,
          paymentTypeRecurrent: resolveDdPaymentType(values, form) !== "oneoff",
        },
      };
    }
    return {};
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const orgIban = resolveOrganisationIban(record);
      const activeType = record?.formType || composeFormType;
      const debtorIbanRaw =
        activeType === "DD_MANDATE"
          ? values.ddIban
          : activeType === "STANDING_ORDER"
            ? values.debtorIban
            : "";
      if (orgIban && debtorIbanRaw) {
        const orgMatch = debtorMatchesOrganisationBank({
          debtorIban: debtorIbanRaw,
          organisationIban: orgIban,
        });
        if (orgMatch.matches) {
          message.error(orgMatch.message);
          return;
        }
      }
      const onFileSelectionField =
        activeType === "DD_MANDATE" && values.ddAuthorisationMode === "on_file"
          ? "ddAuthorisationMode"
          : activeType === "STANDING_ORDER" &&
              values.soAuthorisationMode === "on_file"
            ? "soAuthorisationMode"
            : activeType === "SALARY_DEDUCTION" &&
                values.sdAuthorisationMode === "on_file"
              ? "sdAuthorisationMode"
              : null;
      if (onFileSelectionField) {
        const hasExistingScan = Boolean(
          record?.downloadUrls?.signedPdf || record?.downloadUrls?.paperUpload,
        );
        if (!pendingScanFile && !hasExistingScan) {
          message.error(
            "Upload the scanned form to use 'Authorisation on file'.",
          );
          form.scrollToField(onFileSelectionField);
          return;
        }
      }
      const body = buildPatchBody(values);
      const wantsScanUpload =
        Boolean(onFileSelectionField) && Boolean(pendingScanFile);
      setSaving(true);
      if (isCompose) {
        const profileId = selectedMember?._id || record?.profileId;
        const formTypeToCreate = record?.formType || composeFormType;
        if (!profileId || !formTypeToCreate) {
          message.error("Select a member before saving");
          return;
        }
        const created = await createPaymentForm({
          profileId,
          formType: formTypeToCreate,
          ...body,
        });
        if (wantsScanUpload && created?._id) {
          try {
            const withScan = await uploadSignedPaymentForm(
              created._id,
              pendingScanFile,
            );
            setRecord(withScan);
            hydrateForm(withScan);
            setPendingScanFile(null);
          } catch {
            message.warning(
              "Form saved, but the scanned mandate could not be uploaded. Use the Signature evidence panel to attach it.",
            );
            setRecord(created);
            hydrateForm(created);
          }
        } else {
          setRecord(created);
          hydrateForm(created);
        }
        message.success("Payment form saved");
        onPersisted?.(created);
        onUpdated?.();
        return;
      }
      const updated = await updatePaymentForm(formId, body);
      let next = updated;
      if (wantsScanUpload) {
        try {
          next = await uploadSignedPaymentForm(formId, pendingScanFile);
          setPendingScanFile(null);
        } catch {
          message.warning(
            "Form saved, but the scanned mandate could not be uploaded. Try again from the Signature evidence panel.",
          );
        }
      }
      setRecord(next);
      hydrateForm(next);
      message.success("Saved");
      onUpdated?.();
    } catch (err) {
      if (Array.isArray(err?.errorFields) && err.errorFields.length > 0) {
        const missingLabels = err.errorFields
          .map((f) => f?.errors?.[0])
          .filter(Boolean);
        const summary =
          missingLabels.length === 1
            ? missingLabels[0]
            : `Please complete the highlighted fields: ${missingLabels.join("; ")}`;
        message.error(summary);
        const firstField = err.errorFields[0]?.name;
        if (firstField) form.scrollToField(firstField);
        return;
      }
      message.error(err?.response?.data?.error?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const runAction = async (fn, label) => {
    setSaving(true);
    try {
      const updated = await fn(formId);
      setRecord(updated);
      hydrateForm(updated);
      message.success(label);
      onUpdated?.();
    } catch (err) {
      message.error(err?.response?.data?.error?.message || `${label} failed`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deletePaymentForm(formId);
      message.success("Payment form deleted");
      onUpdated?.();
      handleClose();
    } catch (err) {
      message.error(
        err?.response?.data?.error?.message || "Could not delete payment form",
      );
    } finally {
      setSaving(false);
    }
  };

  const isFormReadOnly =
    !isCompose &&
    Boolean(record) &&
    READ_ONLY_PAYMENT_FORM_STATUSES.has(record.status);

  const canDeletePaymentForm =
    !isCompose &&
    !isFormReadOnly &&
    formId &&
    (record?.status === "draft" || record?.status === "generated");

  const handlePaperUpload = async (info) => {
    const file = info?.file?.originFileObj || info?.file;
    if (!file) return;
    try {
      await uploadPaperPaymentForm(formId, file);
      message.success("Paper form uploaded");
      load();
      onUpdated?.();
    } catch {
      message.error("Upload failed");
    }
  };

  const handleDownloadPdfCopy = async () => {
    if (!formId) return;
    setPdfDownloading(true);
    try {
      const { blob, filename: disposition } =
        await downloadPaymentFormPdf(formId);
      const parsed = parseFilenameFromContentDisposition(disposition);
      triggerBlobDownload(blob, parsed || "payment-form.pdf");
    } catch (err) {
      message.error(
        err?.response?.data?.error?.message ||
          "Could not download payment form PDF",
      );
    } finally {
      setPdfDownloading(false);
    }
  };

  const handleSignedUpload = async (info) => {
    const file = info?.file?.originFileObj || info?.file;
    if (!file) return;
    try {
      await uploadSignedPaymentForm(formId, file);
      message.success("Signed PDF uploaded");
      load();
      onUpdated?.();
    } catch {
      message.error("Upload failed");
    }
  };

  const allowedFormTypeOptions = composeFormType
    ? FORM_TYPE_SELECT_OPTIONS.filter((o) => o.value === composeFormType)
    : [];

  const formType = record?.formType || composeFormType;
  const so = record?.standingOrder || {};
  const sd = record?.salaryDeduction || {};
  const dd = record?.directDebitMandate || {};
  const signatureUrls = Array.isArray(record?.downloadUrls?.signatures)
    ? record.downloadUrls.signatures
    : [];
  const organisationReturn = resolveOrganisationReturnDetails(record);
  const organisationBank = resolveOrganisationBankDetails(record);
  const creditorAddressLines = resolveCreditorAddressLines(record, dd);

  const drawerTitle =
    formType === "STANDING_ORDER"
      ? isCompose
        ? "New standing order form"
        : "Standing Order Set Up Form"
      : formType === "SALARY_DEDUCTION"
        ? isCompose
          ? "New salary deduction form"
          : `Authorisation to Deduct ${organisationReturn.displayName} Membership Fee From Pay`
        : formType === "DD_MANDATE"
          ? isCompose
            ? "New SEPA direct debit mandate"
            : "SEPA Direct Debit Mandate"
          : isCompose
            ? "New payment form"
            : "Payment form";

  const memberHeaderLabel = formatMemberHeaderLabel(selectedMember, record);
  const sourceLabel = record?.source ? SOURCE_LABELS[record.source] : null;

  return (
    <Drawer
      className="payment-form-drawer"
      title={
        <div className="payment-form-drawer__header">
          <div className="payment-form-drawer__header-title">{drawerTitle}</div>
          {memberHeaderLabel ? (
            <div className="payment-form-drawer__header-member">
              {memberHeaderLabel}
            </div>
          ) : null}
          {sourceLabel && !isCompose ? (
            <div className="payment-form-drawer__header-source">
              Received via {sourceLabel}
            </div>
          ) : null}
        </div>
      }
      open={open}
      onClose={handleClose}
      width={DRAWER_WIDTH}
      loading={loading}
      destroyOnClose
      footer={
        <div className="payment-form-drawer__footer-actions">
          <Space wrap size="middle">
            {canDeletePaymentForm && (
              <Popconfirm
                title="Delete this payment form?"
                description="This cannot be undone."
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                onConfirm={handleDelete}
              >
                <Button danger loading={saving}>
                  Delete
                </Button>
              </Popconfirm>
            )}
            <Button onClick={handleClose}>
              {isCompose ? "Cancel" : "Close"}
            </Button>
            {!isFormReadOnly && (
              <>
                <Button
                  type="primary"
                  loading={saving}
                  onClick={handleSave}
                  disabled={
                    isCompose &&
                    (!record ||
                      !(record?.formType || composeFormType) ||
                      !!memberFormError)
                  }
                >
                  {isCompose ? "Save" : "Save draft"}
                </Button>
                {!isCompose && formId && (
                  <>
                    <Button
                      onClick={() => runAction(submitPaymentForm, "Submitted")}
                    >
                      Mark submitted
                    </Button>
                    <Button
                      onClick={() => runAction(verifyPaymentForm, "Verified")}
                    >
                      Verify
                    </Button>
                    <Button
                      danger
                      onClick={() => runAction(rejectPaymentForm, "Rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      type="primary"
                      loading={saving}
                      onClick={() => runAction(approvePaymentForm, "Approved")}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </>
            )}
          </Space>
        </div>
      }
    >
      {isCompose && !memberLocked && (
        <div className="payment-form-drawer__panel" style={{ marginBottom: 8 }}>
          <div className="payment-form-drawer__compose-row">
            <div className="payment-form-drawer__compose-member">
              <label className="payment-form-drawer__compose-type-label">
                Member
              </label>
              <MemberSearch
                fullWidth
                onSelectBehavior="callback"
                onSelectCallback={handleMemberSelect}
                onClear={handleMemberClear}
                showStatus={false}
                getPopupContainer={(trigger) =>
                  trigger.closest(".ant-drawer-body") || document.body
                }
              />
            </div>
            <div className="payment-form-drawer__compose-type">
              <label className="payment-form-drawer__compose-type-label">
                Form type
              </label>
              <Select
                value={composeFormType || undefined}
                placeholder="Select member first"
                options={allowedFormTypeOptions}
                disabled
                style={{ width: "100%" }}
                getPopupContainer={(trigger) =>
                  trigger.closest(".ant-drawer-body") || document.body
                }
              />
            </div>
          </div>
          {memberFormError && (
            <Alert
              className="payment-form-drawer__notice"
              type="error"
              showIcon
              message="Cannot create payment form"
              description={memberFormError}
            />
          )}
        </div>
      )}
      {isCompose && memberLocked && memberFormError && (
        <Alert
          className="payment-form-drawer__notice"
          type="error"
          showIcon
          message="Cannot create payment form"
          description={memberFormError}
        />
      )}

      {record && (
        <>
          {isFormReadOnly && (
            <Alert
              className="payment-form-drawer__notice"
              type="info"
              showIcon
              message="This payment form has been approved"
              description="The form is read-only. Download attachments below if needed."
            />
          )}
          <div className="payment-form-drawer__panel" key={formType}>
            <Form form={form} layout="vertical" disabled={isFormReadOnly}>
              {formType === "STANDING_ORDER" && (
                <>
                  <p className="payment-form-drawer__intro">
                    Please allow 5 working days prior to the first payment due
                    date.
                  </p>

                  <h3 className="payment-form-drawer__section-title">
                    Standing Order Set Up Form
                  </h3>

                  <Form.Item
                    name="soAuthorisationMode"
                    className="payment-form-drawer__auth-item"
                    rules={[
                      {
                        validator: (_, val) =>
                          val === "on_file" || val === "digital"
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "Select one of the standing order authorisation options",
                                ),
                              ),
                      },
                    ]}
                  >
                    <AuthorisationChoice
                      onFileLabel="Standing order authorisation on file (signed scan attached)."
                      uploadLabel="Upload scanned standing order"
                      replaceLabel="Replace scanned standing order"
                      digitalLabel={
                        <>
                          I/We hereby authorise and request you to debit my/our
                          account (Details of the account from which payment
                          will be made).
                        </>
                      }
                      scanUrl={
                        record?.downloadUrls?.signedPdf ||
                        record?.downloadUrls?.paperUpload ||
                        null
                      }
                      scanName={
                        record?.signedPdf?.fileName ||
                        record?.paperUpload?.fileName ||
                        null
                      }
                      pendingFile={pendingScanFile}
                      onPickFile={setPendingScanFile}
                      onRemoveFile={() => setPendingScanFile(null)}
                      disabled={isFormReadOnly}
                    />
                  </Form.Item>

                  <Form.Item
                    name="debtorBankName"
                    label="Bank Name (Manager)"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Select
                      showSearch
                      allowClear
                      options={bankOptions}
                      placeholder="Select bank"
                    />
                  </Form.Item>
                  <Form.Item name="debtorBankAddress" label="Branch Address">
                    <Input.TextArea rows={2} placeholder="Branch address" />
                  </Form.Item>
                  <Form.Item name="debtorAccountName" label="Account Name">
                    <Input placeholder="Account name" />
                  </Form.Item>
                  <BankIbanBicFields
                    form={form}
                    ibanName="debtorIban"
                    bicName="debtorBic"
                    organisationIban={organisationBank.iban}
                  />

                  <p className="payment-form-drawer__subsection">
                    and to Credit the Beneficiary/Receive account (Details of
                    the account to which payments will be made)
                  </p>

                  <div className="payment-form-drawer__readonly-block">
                    <ReadonlyRow
                      label="Account Name"
                      value={so.beneficiaryAccountName}
                    />
                    <ReadonlyRow
                      label="Branch Address"
                      value={so.beneficiaryAddress}
                    />
                    <ReadonlyRow
                      label="IBAN"
                      value={formatIbanDisplay(so.beneficiaryIban)}
                      mono
                    />
                    <ReadonlyRow label="BIC" value={so.beneficiaryBic} />
                  </div>

                  <Form.Item label="*Beneficiary/Receiver Reference">
                    <Input readOnly value={so.beneficiaryReference} />
                  </Form.Item>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginTop: -6,
                      marginBottom: 8,
                    }}
                  >
                    Reference will appear on Beneficiary/Receive Statement
                  </p>

                  <Form.Item
                    name="startDate"
                    label="Start Date (please allow 5 working days from signature date below)"
                    rules={[
                      { required: true, message: "Start date is required" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>

                  <Form.Item
                    name="paymentFrequency"
                    label="Frequency"
                    initialValue="Monthly"
                    rules={[
                      { required: true, message: "Frequency is required" },
                    ]}
                  >
                    <Select options={CRM_PAYMENT_FREQUENCY_OPTIONS} />
                  </Form.Item>

                  <Form.Item label="Number of Payments">
                    <Input readOnly value="N / A" />
                  </Form.Item>

                  <Form.Item
                    name="installmentAmountEur"
                    label="Amount"
                    rules={[
                      { required: true, message: "Amount is required" },
                      {
                        type: "number",
                        min: 0.01,
                        message: "Enter a valid amount",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0.01}
                      step={0.01}
                      precision={2}
                      prefix="€"
                      placeholder="0.00"
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="signatureDate1" label="Signature Date">
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="signatureDate2" label="Signature Date">
                        <DatePicker
                          style={{ width: "100%" }}
                          format="DD/MM/YYYY"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

              {formType === "SALARY_DEDUCTION" && (
                <>
                  <h3 className="payment-form-drawer__section-title">
                    Authorisation to Deduct{" "}
                    <OrganisationNameBold name={organisationReturn.displayName} />{" "}
                    Membership Fee From Pay
                  </h3>

                  <Form.Item
                    name="memberFullName"
                    label="NAME (Block Capitals Please)"
                    rules={[{ required: true, message: "Name is required" }]}
                  >
                    <Input className="payment-form-drawer__name-field" />
                  </Form.Item>

                  <Form.Item
                    name="employedAt"
                    label="EMPLOYED AT"
                    rules={[
                      { required: true, message: "Employed at is required" },
                    ]}
                  >
                    <Select
                      showSearch
                      placeholder="Select work location"
                      options={workLocationOptions}
                      optionFilterProp="label"
                    />
                  </Form.Item>

                  <Form.Item
                    name="sdAuthorisationMode"
                    className="payment-form-drawer__auth-item"
                    rules={[
                      {
                        validator: (_, val) =>
                          val === "on_file" || val === "digital"
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "Select one of the salary deduction authorisation options",
                                ),
                              ),
                      },
                    ]}
                  >
                    <AuthorisationChoice
                      onFileLabel="Salary deduction authorisation on file (signed scan attached)."
                      uploadLabel="Upload signed salary deduction form"
                      replaceLabel="Replace signed salary deduction form"
                      digitalLabel={
                        <>
                          Authorise the deduction from my pay, until further
                          notice, the sum of{" "}
                          {formatInstallmentAmount(sd) || "the applicable amount"}{" "}
                          in respect of the{" "}
                          <OrganisationNameBold
                            name={organisationReturn.displayName}
                          />{" "}
                          financial year January – December, to be deducted on
                          each pay day and paid to{" "}
                          <OrganisationNameBold
                            name={organisationReturn.displayName}
                          />{" "}
                          on my behalf. I also agree that if the subscription be
                          varied, the deduction shall be varied accordingly. If
                          there is an inadvertent shortfall in the amount
                          deducted at source in respect of annual fee, I agree
                          to pay the balance directly to{" "}
                          <OrganisationNameBold
                            name={organisationReturn.displayName}
                          />
                          {organisationReturn.addressLine
                            ? ` at ${organisationReturn.addressLine}`
                            : ""}
                          .
                        </>
                      }
                      scanUrl={
                        record?.downloadUrls?.signedPdf ||
                        record?.downloadUrls?.paperUpload ||
                        null
                      }
                      scanName={
                        record?.signedPdf?.fileName ||
                        record?.paperUpload?.fileName ||
                        null
                      }
                      pendingFile={pendingScanFile}
                      onPickFile={setPendingScanFile}
                      onRemoveFile={() => setPendingScanFile(null)}
                      disabled={isFormReadOnly}
                    />
                  </Form.Item>

                  <Form.Item label="Reference (Membership) No">
                    <Input readOnly value={sd.referenceMembershipNo} />
                  </Form.Item>

                  <Form.Item
                    name="payrollStaffNo"
                    label="PAYROLL / STAFF NO (available on pay slip)"
                    rules={[
                      {
                        required: true,
                        message: "Payroll / staff number is required",
                      },
                    ]}
                  >
                    <Input placeholder="Payroll or staff number" />
                  </Form.Item>

                  <Form.Item
                    name="commencingDate"
                    label="Commencing date"
                    rules={[
                      {
                        required: true,
                        message: "Commencing date is required",
                      },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>

                  <Form.Item name="signatureDate" label="DATE">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>

                  <p
                    className="payment-form-drawer__static-text"
                    style={{ fontSize: 12 }}
                  >
                    IMPORTANT: When completed and signed, the member should
                    upload or return this form directly to{" "}
                    <OrganisationNameBold name={organisationReturn.displayName} />
                    {organisationReturn.addressLine
                      ? `, ${organisationReturn.addressLine}`
                      : ""}
                    .
                  </p>
                </>
              )}

              {formType === "DD_MANDATE" && (
                <>
                  <h3 className="payment-form-drawer__section-title">
                    SEPA Direct Debit Mandate
                  </h3>

                  <Form.Item
                    label="Unique Mandate Reference (UMR)"
                    required
                    className="payment-form-drawer__umr-field"
                  >
                    <Input readOnly value={dd.uniqueMandateReference} />
                  </Form.Item>

                  <Form.Item
                    name="ddAuthorisationMode"
                    className="payment-form-drawer__auth-item"
                    rules={[
                      {
                        validator: (_, val) =>
                          val === "on_file" || val === "digital"
                            ? Promise.resolve()
                            : Promise.reject(
                                new Error(
                                  "Select one of the mandate authorisation options",
                                ),
                              ),
                      },
                    ]}
                  >
                    <AuthorisationChoice
                      onFileLabel="Mandate authorisation on file (signed scan attached)."
                      uploadLabel="Upload scanned mandate"
                      replaceLabel="Replace scanned mandate"
                      digitalLabel={
                        <>
                          By signing this mandate form, you authorise (A) the{" "}
                          <strong>{dd.creditorName || "Creditor"}</strong> to
                          send instructions to your bank to debit your account
                          and (B) your bank to debit your account in accordance
                          with the instructions from the{" "}
                          <strong>{dd.creditorName || "Creditor"}</strong>. As
                          part of your rights, you are entitled to a refund
                          from your bank under the terms and conditions of your
                          agreement with your bank. A refund must be claimed
                          within 8 weeks starting from the date on which your
                          account was debited. Your rights are explained in a
                          statement that you can obtain from your bank.
                        </>
                      }
                      scanUrl={
                        record?.downloadUrls?.signedPdf ||
                        record?.downloadUrls?.paperUpload ||
                        null
                      }
                      scanName={
                        record?.signedPdf?.fileName ||
                        record?.paperUpload?.fileName ||
                        null
                      }
                      pendingFile={pendingScanFile}
                      onPickFile={setPendingScanFile}
                      onRemoveFile={() => setPendingScanFile(null)}
                      disabled={isFormReadOnly}
                    />
                  </Form.Item>

                  <div className="payment-form-drawer__readonly-block">
                    <ReadonlyRow
                      label="Creditor's Name"
                      value={dd.creditorName}
                    />
                    <ReadonlyRow
                      label="Creditor's Identifier"
                      value={dd.creditorIdentifier}
                    />
                    <ReadonlyRow
                      label="Creditor's address line 1"
                      value={[
                        creditorAddressLines.line1,
                        creditorAddressLines.line2,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    />
                    <ReadonlyRow label="City" value={dd.creditorCity} />
                    <ReadonlyRow
                      label="Eircode / Post Code"
                      value={dd.creditorPostcode}
                    />
                    <ReadonlyRow label="Country" value={dd.creditorCountry} />
                  </div>

                  <p className="payment-form-drawer__required-hint">
                    Please complete all the fields marked *
                  </p>
                  <span className="payment-form-drawer__payment-type-label">
                    Type of payment
                    <span
                      className="payment-form-drawer__required-mark"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </span>
                  <Form.Item
                    name="ddPaymentType"
                    initialValue="recurrent"
                    className="payment-form-drawer__payment-type-item"
                    rules={[
                      {
                        required: true,
                        message: "Type of payment is required",
                      },
                    ]}
                  >
                    <Radio.Group className="payment-form-drawer__payment-type-inline payment-form-drawer__payment-type-radio">
                      {DD_PAYMENT_TYPE_OPTIONS.map((opt) => (
                        <Radio key={opt.value} value={opt.value}>
                          {opt.label}
                        </Radio>
                      ))}
                    </Radio.Group>
                  </Form.Item>

                  <Form.Item
                    name="debtorName"
                    label="Debtor Name"
                    required
                    rules={[
                      { required: true, message: "Debtor name is required" },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="debtorAddressLine1"
                        label="Address line 1"
                        required
                        rules={[
                          {
                            required: true,
                            message: "Address line 1 is required",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="debtorAddressLine2"
                        label="Address line 2"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="debtorCity"
                        label="City"
                        required
                        rules={[
                          { required: true, message: "City is required" },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="debtorPostcode"
                        label="Eircode / Post Code"
                        required
                        rules={[
                          {
                            required: true,
                            message: "Eircode / post code is required",
                          },
                        ]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name="debtorCountry"
                        label="Country"
                        required
                        rules={[
                          { required: true, message: "Country is required" },
                        ]}
                      >
                        <Select
                          showSearch
                          optionFilterProp="label"
                          placeholder="Select country"
                          options={countrySelectOptions}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <BankIbanBicFields
                    form={form}
                    ibanName="ddIban"
                    bicName="ddBic"
                    ibanLabel="Debtor account number – IBAN"
                    bicLabel="Debtor bank identifier code – BIC"
                    organisationIban={organisationBank.iban}
                  />

                  <p
                    className="payment-form-drawer__static-text"
                    style={{ fontSize: 12 }}
                  >
                    Where the account being debited is a joint account and more
                    than 1 person is needed to withdraw funds, then all parties
                    must sign this form. Please return this mandate to the
                    Creditor.
                  </p>

                  <Form.Item
                    name="ddSignedDate"
                    label="Signature & Date"
                    required
                    rules={[
                      { required: true, message: "Signature date is required" },
                    ]}
                  >
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                  </Form.Item>
                </>
              )}
            </Form>
          </div>

          {!record.unsaved && formId && (
            <div className="payment-form-drawer__panel payment-form-drawer__panel--attachments">
              <h3 className="payment-form-drawer__section-title">
                Signature evidence
              </h3>
              <SignatureEvidence
                record={record}
                signatureUrls={signatureUrls}
              />
              <div className="payment-form-drawer__attachments-row">
                <Button
                  loading={pdfDownloading}
                  onClick={handleDownloadPdfCopy}
                >
                  Download PDF copy
                </Button>
                {!isFormReadOnly && (
                  <>
                    <Upload
                      beforeUpload={() => false}
                      onChange={handlePaperUpload}
                      maxCount={1}
                    >
                      <Button>Upload paper / scan</Button>
                    </Upload>
                    <Upload
                      beforeUpload={() => false}
                      onChange={handleSignedUpload}
                      maxCount={1}
                    >
                      <Button>Upload signed PDF</Button>
                    </Upload>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Drawer>
  );
}
