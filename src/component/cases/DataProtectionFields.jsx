import React from "react";
import { Row, Col, Checkbox } from "antd";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import {
  SEVERITIES,
  DP_STATUSES,
  DP_ISSUE_TYPES,
  SOLICITORS,
  toOptions,
} from "./issueOptions";
import { useTeamUserOptions } from "../../hooks/useTeamUsers";

/**
 * DP discriminator field set -
 * backend/issue-service/models/issue.dataprotection.model.js. Same controlled
 * `values`/`onChange(field, value)` contract as the other 3 field-set components - see
 * ComplaintFields.jsx's header comment. `dpStatus` (not `status`) to avoid colliding with
 * the base Issue's `issueStatus`, per the backend model's own naming note.
 */
function DataProtectionFields({ values = {}, onChange, disabled = false }) {
  const { options: resolvedByOptions } = useTeamUserOptions("issues-dataprotection");
  return (
    <div className="form-section issue-type-fields-section">
      <h3 className="section-title">Data Protection Details</h3>

      <Row gutter={16}>
        <Col span={8}>
          <CustomSelect
            label="Severity"
            name="severity"
            value={values.severity || ""}
            onChange={(e) => onChange("severity", e.target.value)}
            options={toOptions(SEVERITIES)}
            placeholder="Select severity"
            disabled={disabled}
          />
        </Col>
        <Col span={8}>
          <CustomSelect
            label="DP Status"
            name="dpStatus"
            value={values.dpStatus || "OPEN"}
            onChange={(e) => onChange("dpStatus", e.target.value)}
            options={toOptions(DP_STATUSES)}
            disabled={disabled}
          />
        </Col>
        <Col span={8}>
          <CustomSelect
            label="DP Issue Type"
            name="dpIssueType"
            value={values.dpIssueType || ""}
            onChange={(e) => onChange("dpIssueType", e.target.value)}
            options={toOptions(DP_ISSUE_TYPES)}
            placeholder="Select type"
            disabled={disabled}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <MyInput
            label="External Agency"
            name="externalAgency"
            value={values.externalAgency || ""}
            onChange={(e) => onChange("externalAgency", e.target.value)}
            disabled={disabled}
          />
        </Col>
        <Col span={6}>
          <div className="my-input-wrapper">
            <label className="my-input-label mb-0">DPC Informed</label>
            <div className="my-input-container" style={{ paddingLeft: 12 }}>
              <Checkbox
                checked={!!values.dpcInformed}
                onChange={(e) => onChange("dpcInformed", e.target.checked)}
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        {values.dpcInformed && (
          <Col span={6}>
            <MyDatePicker1
              label="DPC Informed On"
              name="dpcInformedDatetime"
              value={values.dpcInformedDatetime}
              onChange={(d) => onChange("dpcInformedDatetime", d)}
              disabled={disabled}
              required
            />
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label mb-0">External Solicitor Involved</label>
            <div className="my-input-container" style={{ paddingLeft: 12 }}>
              <Checkbox
                checked={!!values.externalSolicitorInvolved}
                onChange={(e) =>
                  onChange("externalSolicitorInvolved", e.target.checked)
                }
                disabled={disabled}
              >
                Yes
              </Checkbox>
            </div>
          </div>
        </Col>
        {values.externalSolicitorInvolved && (
          <>
            <Col span={8}>
              <CustomSelect
                label="Solicitor"
                name="solicitor"
                value={values.solicitor || ""}
                onChange={(e) => onChange("solicitor", e.target.value)}
                options={toOptions(SOLICITORS)}
                placeholder="Select solicitor"
                disabled={disabled}
              />
            </Col>
            {values.solicitor === "OTHER" && (
              <Col span={8}>
                <MyInput
                  label="Solicitor (Other)"
                  name="solicitorOther"
                  value={values.solicitorOther || ""}
                  onChange={(e) => onChange("solicitorOther", e.target.value)}
                  disabled={disabled}
                />
              </Col>
            )}
          </>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <MyDatePicker1
            label="Due Date"
            name="dueDate"
            value={values.dueDate}
            onChange={(d) => onChange("dueDate", d)}
            disabled={disabled}
          />
        </Col>
        <Col span={12}>
          <CustomSelect
            label="Resolved By (User Id)"
            name="resolvedByUserId"
            value={values.resolvedByUserId || ""}
            onChange={(e) => onChange("resolvedByUserId", e.target.value)}
            options={resolvedByOptions}
            placeholder="Select user"
            disabled={disabled}
            showSearch
            isIDs
          />
        </Col>
      </Row>
    </div>
  );
}

export default DataProtectionFields;
