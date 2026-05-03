import React, { useEffect, useId, useState } from "react";
import "../../styles/MyInput.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCountries } from "../../features/CountriesSlice";

/** Digits only, strip trunk leading zeros (e.g. 0345… → 345…) */
function normalizeNationalDigits(raw) {
  const d = (raw || "").replace(/\D/g, "");
  return d.replace(/^0+/, "");
}

function ensurePlusCallingCode(code) {
  if (!code) return "+353";
  const c = String(code).trim();
  return c.startsWith("+") ? c : `+${c}`;
}

/**
 * National number display (no country code).
 * 10 digits → 3 3 4; 9 digits → 2 3 4. Shorter input uses 2-3-4 partial groups while typing.
 */
function formatNationalDisplay(digits) {
  const d = String(digits || "").replace(/\D/g, "");
  if (!d) return "";

  if (d.length >= 10) {
    const core = d.slice(0, 10);
    const rest = d.slice(10);
    const formatted = `${core.slice(0, 3)} ${core.slice(3, 6)} ${core.slice(6, 10)}`;
    return rest ? `${formatted} ${rest}` : formatted;
  }

  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
}

function buildCompactMobile(callingCode, nationalRaw) {
  const national = normalizeNationalDigits(nationalRaw);
  if (!national) return "";
  const code = String(callingCode ?? "").trim();
  if (!code) return national;
  return `${ensurePlusCallingCode(code)}${national}`;
}

/** Fallback prefixes when /countries has not loaded yet (longest first). */
const DEFAULT_CALLING_CODES = [
  "+353",
  "+358",
  "+352",
  "+44",
  "+91",
  "+92",
  "+61",
  "+49",
  "+86",
  "+81",
  "+39",
  "+34",
  "+33",
  "+31",
  "+420",
  "+1",
];

function sortedCallingCodes(countriesData) {
  const set = new Set(DEFAULT_CALLING_CODES);
  (countriesData || []).forEach((c) => {
    (c.callingCodes || []).forEach((raw) => {
      if (!raw) return;
      const code = ensurePlusCallingCode(raw);
      if (code.length > 1) set.add(code);
    });
  });
  return [...set].sort((a, b) => b.length - a.length);
}

/**
 * Parse parent value into calling code + national digits (normalized).
 * Supports E.164 (+35387…), legacy "+353 087…", and national-only values when portal omits country code.
 */
function parseMobileValue(value, countriesData) {
  if (!value || !String(value).trim()) {
    return { code: "+353", national: "" };
  }
  const trimmed = String(value).trim();

  if (trimmed.startsWith("+")) {
    const codes = sortedCallingCodes(countriesData);
    for (const c of codes) {
      if (trimmed === c) {
        return { code: c, national: "" };
      }
    }
    for (const c of codes) {
      if (trimmed.startsWith(c) && trimmed.length > c.length) {
        return {
          code: c,
          national: normalizeNationalDigits(trimmed.slice(c.length)),
        };
      }
    }
    return { code: "+353", national: "" };
  }

  if (trimmed.includes(" ")) {
    const parts = trimmed.split(/\s+/);
    const head = parts[0];
    if (head.startsWith("+")) {
      const code = ensurePlusCallingCode(head);
      const nationalJoined = parts.slice(1).join("");
      return { code, national: normalizeNationalDigits(nationalJoined) };
    }
    const nationalJoined = parts.join("");
    return { code: "", national: normalizeNationalDigits(nationalJoined) };
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly) {
    return { code: "", national: normalizeNationalDigits(digitsOnly) };
  }

  return { code: "+353", national: "" };
}

const MyInput = ({
  label,
  id,
  placeholder = "Enter...",
  value,
  onChange,
  name,
  type = "text",
  required = false,
  hasError = false,
  errorMessage = "Required",
  disabled = false,
  rows = 4,
  extra = null,
  onBlur,
  maxLength,
  prefix,
}) => {
  const uid = useId().replace(/:/g, "");
  const inputId = id ?? (name ? String(name) : `myinput-${uid}`);
  const dispatch = useDispatch();
  const { countriesData, loadingC } = useSelector((state) => state.countries);

  const [isFocused, setIsFocused] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [countryCode, setCountryCode] = useState("+353"); // default fallback
  const [mobileNumber, setMobileNumber] = useState("");

  // 🔹 Fetch countries from API when needed
  useEffect(() => {
    if (!countriesData || countriesData.length === 0) {
      dispatch(fetchCountries());
    }
  }, [dispatch, countriesData]);

  const handleMobileChange = (e) => {
    const national = normalizeNationalDigits(e.target.value);
    const formatted = formatNationalDisplay(national);
    setMobileNumber(formatted);
    onChange({
      target: { name, value: buildCompactMobile(countryCode, national) },
    });
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (type === "mobile") return;

    if (type === "email") {
      onChange(e);
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setInternalError("Invalid email address");
      } else setInternalError("");
      return;
    }

    onChange(e);
    setInternalError("");
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const commonProps = {
    id: inputId,
    name,
    value,
    onChange: handleChange,
    placeholder,
    onFocus: () => setIsFocused(true),
    onBlur: handleBlur,
    className: "my-input-field",
    disabled,
    maxLength,
  };
  if (
    !(label || name) &&
    placeholder &&
    placeholder !== "Enter..."
  ) {
    commonProps["aria-label"] = String(placeholder);
  }

  const showError = hasError || internalError;

  useEffect(() => {
    if (type !== "mobile") return;
    if (!value || !String(value).trim()) {
      setCountryCode("+353");
      setMobileNumber("");
      return;
    }
    const { code, national } = parseMobileValue(value, countriesData);
    setCountryCode(code || "");
    setMobileNumber(formatNationalDisplay(national));
  }, [type, value, countriesData]);

  const showLabelRow = Boolean(label) || required || showError;

  return (
    <div className="my-input-wrapper">
      {showLabelRow ? (
        <div className="d-flex justify-content-between">
          <label
            htmlFor={inputId}
            className={`my-input-label ${showError ? "error" : ""}`}
          >
            {label}
            {required && <span className="required-star"> *</span>}
            {showError && (
              <span className="error-message">
                ({internalError || errorMessage})
              </span>
            )}
          </label>
          {extra && <div className="ml-2">{extra}</div>}
        </div>
      ) : (
        extra && (
          <div className="d-flex justify-content-end mb-1">
            <div className="ml-2">{extra}</div>
          </div>
        )
      )}

      <div
        className={`my-input-container ${showError ? "error" : ""} ${isFocused ? "focused" : ""
          } ${disabled ? "disabled" : ""} ${type === "textarea" ? "textarea-container" : ""}`}
      >
        {prefix && <div className="my-input-prefix">{prefix}</div>}
        {type === "textarea" ? (
          <textarea {...commonProps} rows={rows} />
        ) : type === "mobile" ? (
          <div className="mobile-input-group">
            <select
              id={`${inputId}-calling-code`}
              aria-label="Country calling code"
              className={`country-code-select ${showError ? "error" : ""}`}
              value={countryCode}
              onChange={(e) => {
                const nextCode = e.target.value;
                setCountryCode(nextCode);
                const nationalDigits = normalizeNationalDigits(
                  mobileNumber.replace(/\s/g, "")
                );
                onChange({
                  target: {
                    name,
                    value: buildCompactMobile(nextCode, nationalDigits),
                  },
                });
              }}
              disabled={disabled || loadingC}
            >
              {loadingC ? (
                <option>Loading...</option>
              ) : (
                <>
                  <option value="">Select country code</option>
                  {countriesData?.map((c) => (
                    <option key={c._id} value={c.callingCodes?.[0] || ""}>
                      {c.displayname} {c.callingCodes?.[0]}
                    </option>
                  ))}
                </>
              )}
            </select>

            <input
              id={inputId}
              name={name}
              type="text"
              className={`mobile-number-input ${showError ? "error" : ""}`}
              placeholder="345 049 1493"
              value={mobileNumber}
              onChange={handleMobileChange}
              maxLength={14}
              disabled={disabled}
            />
          </div>
        ) : (
          <input type={type} {...commonProps} />
        )}
        {showError && <span className="error-icon">ⓘ</span>}
      </div>
    </div>
  );
};

export default MyInput;