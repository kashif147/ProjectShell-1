import React from "react";
import { Row, Col, Checkbox, Button } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import { SOLICITORS, toOptions } from "./issueOptions";

const EMPTY_RESPONDENT = { name: "", email: "", phone: "", relationship: "" };

/**
 * COMPLAINT discriminator field set - backend/issue-service/models/issue.complaint.model.js.
 * Controlled component: `values` is the complaint-specific slice of the issue payload,
 * `onChange(field, value)` patches a single field back up to the parent (CasesDetails.js /
 * CreateCasesDrawer.jsx), which owns the full form state. Reused unmodified in both places
 * per the plan - render/edit logic lives here exactly once.
 */
function ComplaintFields({ values = {}, onChange, disabled = false, complaintTypeOptions = [] }) {
  const respondents =
    Array.isArray(values.respondents) && values.respondents.length
      ? values.respondents
      : [];

  const updateRespondent = (index, field, val) => {
    const next = respondents.map((r, i) =>
      i === index ? { ...r, [field]: val } : r,
    );
    onChange("respondents", next);
  };

  const addRespondent = () => {
    onChange("respondents", [...respondents, { ...EMPTY_RESPONDENT }]);
  };

  const removeRespondent = (index) => {
    onChange(
      "respondents",
      respondents.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="form-section issue-type-fields-section">
      <h3 className="section-title">Complaint Details</h3>

      <Row gutter={16}>
        <Col span={12}>
          <CustomSelect
            label="Complaint Type"
            name="complaintType"
            value={values.complaintType || ""}
            onChange={(e) => onChange("complaintType", e.target.value)}
            options={complaintTypeOptions}
            placeholder="Select complaint type"
            disabled={disabled}
            isIDs
          />
        </Col>
        <Col span={12}>
          {/* Auto-set by the backend ("{contactName} {internalReferenceNumber}") - read-only
              here, never sent back on save. */}
          <MyInput
            label="Complainant"
            name="complainant"
            value={values.complainant || ""}
            disabled
          />
        </Col>
      </Row>

      {values.complaintType === "MOSP" && (
        <Row gutter={16}>
          <Col span={12}>
            <MyInput
              label="Service Provider"
              name="serviceProvider"
              value={values.serviceProvider || ""}
              onChange={(e) => onChange("serviceProvider", e.target.value)}
              placeholder="Name of the service provider"
              disabled={disabled}
              required
            />
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        <Col span={8}>
          <div className="my-input-wrapper">
            <label className="my-input-label">External Solicitor Involved</label>
            <div style={{ marginTop: 6 }}>
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
                  placeholder="Enter solicitor name"
                  disabled={disabled}
                />
              </Col>
            )}
          </>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          {/* No staff/user-picker component exists in this codebase (MemberSearch is
              member-only) - rendered as a plain userId text field, consistent with owner.userId
              on the base form. */}
          <MyInput
            label="Resolved By (User Id)"
            name="resolvedByUserId"
            value={values.resolvedByUserId || ""}
            onChange={(e) => onChange("resolvedByUserId", e.target.value)}
            placeholder="User id"
            disabled={disabled}
          />
        </Col>
        <Col span={12}>
          <MyDatePicker1
            label="Due Date"
            name="dueDate"
            value={values.dueDate}
            onChange={(d) => onChange("dueDate", d)}
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
        <Col span={12}>
          <MyInput
            label="External Case Ref"
            name="externalCaseRef"
            value={values.externalCaseRef || ""}
            onChange={(e) => onChange("externalCaseRef", e.target.value)}
            disabled={disabled}
          />
        </Col>
      </Row>

      <div className="respondents-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <label className="my-input-label" style={{ marginBottom: 0 }}>
            Respondents
          </label>
          {!disabled && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={addRespondent}
              size="small"
            >
              Add respondent
            </Button>
          )}
        </div>
        {respondents.length === 0 && (
          <div style={{ color: "var(--theme-text-muted)", fontSize: 13 }}>
            No respondents added.
          </div>
        )}
        {respondents.map((r, index) => (
          <Row gutter={12} key={index} style={{ marginBottom: 8 }} align="middle">
            <Col span={5}>
              <MyInput
                label={index === 0 ? "Name" : ""}
                value={r.name || ""}
                onChange={(e) => updateRespondent(index, "name", e.target.value)}
                placeholder="Name"
                disabled={disabled}
              />
            </Col>
            <Col span={6}>
              <MyInput
                label={index === 0 ? "Email" : ""}
                value={r.email || ""}
                onChange={(e) => updateRespondent(index, "email", e.target.value)}
                placeholder="Email"
                type="email"
                disabled={disabled}
              />
            </Col>
            <Col span={5}>
              <MyInput
                label={index === 0 ? "Phone" : ""}
                value={r.phone || ""}
                onChange={(e) => updateRespondent(index, "phone", e.target.value)}
                placeholder="Phone"
                disabled={disabled}
              />
            </Col>
            <Col span={6}>
              <MyInput
                label={index === 0 ? "Relationship" : ""}
                value={r.relationship || ""}
                onChange={(e) =>
                  updateRespondent(index, "relationship", e.target.value)
                }
                placeholder="Relationship"
                disabled={disabled}
              />
            </Col>
            <Col span={2}>
              {!disabled && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeRespondent(index)}
                />
              )}
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
}

export default ComplaintFields;
