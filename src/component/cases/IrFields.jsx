import React, { useEffect, useRef, useState } from "react";
import { Row, Col, Checkbox, Select, Spin } from "antd";
import MyInput from "../common/MyInput";
import { searchIssueDesignations } from "../../services/issuesApi";

/**
 * IR (Industrial Relations) discriminator field set -
 * backend/issue-service/models/issue.ir.model.js. Same controlled `values`/`onChange(field,
 * value)` contract as the other 3 field-set components - see ComplaintFields.jsx's header
 * comment.
 *
 * Issue Designation is an async-search-only dropdown backed by
 * GET /issue-designations?search= (issue-service's thin proxy over user-service's Lookup
 * system) - there is no "fetch all" endpoint for this lookup, so it can't use the plain
 * static-options CustomSelect used elsewhere on this form; it uses antd's Select directly
 * with `showSearch` + `onSearch`, debounced.
 */
function IrFields({ values = {}, onChange, disabled = false }) {
  const [designationOptions, setDesignationOptions] = useState(() =>
    values.issueDesignationLabel
      ? [{ value: values.issueDesignation, label: values.issueDesignationLabel }]
      : [],
  );
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    },
    [],
  );

  // Self-heal the label for an already-saved issueDesignation id (e.g. loaded from an
  // existing issue) - GET /issues/:id only returns the raw Lookup id, not a display name,
  // and there is no by-id fetch on this proxy, only search. An empty query returns every
  // designation unfiltered (see issue-service's searchIssueDesignations), so this is the
  // only way to resolve id -> label without the user re-searching.
  useEffect(() => {
    if (!values.issueDesignation || values.issueDesignationLabel) return;
    let cancelled = false;
    searchIssueDesignations("")
      .then((results) => {
        if (cancelled) return;
        const rows = Array.isArray(results) ? results : [];
        const match = rows.find((row) => String(row.id) === String(values.issueDesignation));
        if (match) {
          setDesignationOptions((prev) => {
            const exists = prev.some((o) => o.value === match.id);
            return exists ? prev : [...prev, { value: match.id, label: match.displayName || match.code }];
          });
          onChange("issueDesignationLabel", match.displayName || match.code || null);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.issueDesignation]);

  const runSearch = (query) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setSearching(true);
      try {
        const results = await searchIssueDesignations(query);
        if (requestId !== requestIdRef.current) return;
        const rows = Array.isArray(results) ? results : [];
        setDesignationOptions(
          rows.map((row) => ({
            value: row.id,
            label: row.displayName || row.code || row.id,
          })),
        );
      } catch {
        if (requestId === requestIdRef.current) setDesignationOptions([]);
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 300);
  };

  return (
    <div className="form-section issue-type-fields-section">
      <h3 className="section-title">Industrial Relations Details</h3>

      <Row gutter={16}>
        <Col span={12}>
          <MyInput
            label="Case File Number"
            name="caseFileNumber"
            value={values.caseFileNumber || ""}
            disabled
            placeholder="Auto-generated"
          />
        </Col>
        <Col span={12}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Issue Designation</label>
            <Select
              showSearch
              value={values.issueDesignation || undefined}
              placeholder="Search issue designation..."
              filterOption={false}
              notFoundContent={searching ? <Spin size="small" /> : null}
              onSearch={runSearch}
              onFocus={() => runSearch("")}
              onChange={(value, option) => {
                onChange("issueDesignation", value || null);
                onChange("issueDesignationLabel", option?.label || null);
              }}
              options={designationOptions}
              disabled={disabled}
              allowClear
              onClear={() => {
                onChange("issueDesignation", null);
                onChange("issueDesignationLabel", null);
              }}
              style={{ width: "100%" }}
            />
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Correspondence With External Party</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.correspondenceWithExternalParty}
                onChange={(e) =>
                  onChange("correspondenceWithExternalParty", e.target.checked)
                }
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Membership Verified</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.membershipVerified}
                onChange={(e) => onChange("membershipVerified", e.target.checked)}
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        <Col span={8}>
          {/* No staff/user-picker component in this codebase - see ComplaintFields.jsx's
              same note on resolvedByUserId. */}
          <MyInput
            label="Resolved By (User Id)"
            name="resolvedByUserId"
            value={values.resolvedByUserId || ""}
            onChange={(e) => onChange("resolvedByUserId", e.target.value)}
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Referred to Third Party</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.referredToThirdParty}
                onChange={(e) => onChange("referredToThirdParty", e.target.checked)}
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Submission Issued to Third Party</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.submissionIssuedToThirdParty}
                onChange={(e) =>
                  onChange("submissionIssuedToThirdParty", e.target.checked)
                }
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">Outcome Received From Third Party</label>
            <div style={{ marginTop: 6 }}>
              <Checkbox
                checked={!!values.outcomeReceivedFromThirdParty}
                onChange={(e) =>
                  onChange("outcomeReceivedFromThirdParty", e.target.checked)
                }
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <MyInput
            label="WRC Case Number"
            name="wrcCaseNumber"
            value={values.wrcCaseNumber || ""}
            onChange={(e) => onChange("wrcCaseNumber", e.target.value)}
            disabled={disabled}
          />
        </Col>
      </Row>
    </div>
  );
}

export default IrFields;
