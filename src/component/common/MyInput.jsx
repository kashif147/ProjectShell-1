import React, { useEffect, useState } from "react";
import "../../styles/MyInput.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchCountries } from "../../features/CountriesSlice";

const MyInput = ({
  label,
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
    let val = e.target.value.replace(/\D/g, ""); // only digits
    let formatted = val
      .replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3")
      .trim();

    setMobileNumber(formatted);
    const fullNumber = `${countryCode} ${formatted}`;
    onChange({ target: { name, value: fullNumber } });
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
    id: name,
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

  const showError = hasError || internalError;

  useEffect(() => {
    if (type === "mobile") {
      if (!value) {
        setMobileNumber("");
        return;
      }
      let code = "+353"; // default
      let number = "";

      // Handle different formats
      if (value.includes(" ")) {
        // Format: "+353 38 927 5210"
        const parts = value.trim().split(" ");
        code = parts[0] || "+353";
        number = parts.slice(1).join(" ");
      } else {
        // Format: "+3534444444"
        // Extract country code (assuming +353 is the code)
        if (value.startsWith("+353") && value.length > 4) {
          code = "+353";
          const rawNumber = value.substring(4); // Remove +353
          // Format the remaining digits
          number = rawNumber.replace(/(\d{2})(\d{3})(\d{0,4})/, "$1 $2 $3").trim();
        } else {
          // Fallback: try to extract any country code
          const match = value.match(/^(\+\d+)(\d+)$/);
          if (match) {
            code = match[1];
            const rawNumber = match[2];
            // Format based on length
            if (rawNumber.length === 7) {
              number = rawNumber.replace(/(\d{2})(\d{3})(\d{2})/, "$1 $2 $3");
            } else {
              number = rawNumber.replace(/(\d{2})(\d{3})(\d{4})/, "$1 $2 $3");
            }
          } else {
            // If no clear format, use as is
            code = "+353";
            number = value.replace("+353", "");
          }
        }
      }

      setCountryCode(code);
      setMobileNumber(number);
    }
  }, [type, value]);

  return (
    <div className="my-input-wrapper">
      <div className="d-flex justify-content-between">
        <label
          htmlFor={name}
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

      <div
        className={`my-input-container ${showError ? "error" : ""} ${isFocused ? "focused" : ""
          }`}
      >
        {prefix && <div className="my-input-prefix">{prefix}</div>}
        {type === "textarea" ? (
          <textarea {...commonProps} rows={rows} />
        ) : type === "mobile" ? (
          <div className="mobile-input-group">
            <select
              className={`country-code-select ${showError ? "error" : ""}`}
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                const fullNumber = `${e.target.value} ${mobileNumber}`;
                onChange({ target: { name, value: fullNumber } });
              }}
              disabled={disabled || loadingC}
            >
              {loadingC ? (
                <option>Loading...</option>
              ) : (
                countriesData?.map((c) => (
                  <option key={c._id} value={c.callingCodes?.[0] || ""}>
                    {c.displayname} {c.callingCodes?.[0]}
                  </option>
                ))
              )}
            </select>

            <input
              type="text"
              className={`mobile-number-input ${showError ? "error" : ""}`}
              placeholder="87 900 0538"
              value={mobileNumber}
              onChange={handleMobileChange}
              maxLength={11}
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