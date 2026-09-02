import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Checkbox, Button, Tag } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import MyInput from "../common/MyInput";
import CustomSelect from "../common/CustomSelect";
import MyDatePicker1 from "../common/MyDatePicker1";
import MemberSearch from "../profile/MemberSearch";
import { baseURL } from "../../utils/Utilities";
import { useTeamUserOptions } from "../../hooks/useTeamUsers";
import { SOLICITORS, toOptions } from "./issueOptions";

const EMPTY_RESPONDENT = { name: "", email: "", phone: "", relationship: "" };

// Complaint Type code for "Member On Member" - Complainant only applies to this type (see
// backend/issue-service/models/issue.complaint.model.js's COMPLAINT_TYPES).
const MEMBER_ON_MEMBER = "MOM";

function memberDisplayLabel(memberData) {
  return (
    `${memberData?.personalInfo?.forename || ""} ${memberData?.personalInfo?.surname || ""}`.trim() ||
    memberData?.membershipNumber ||
    memberData?._id
  );
}

/**
 * Service Provider options, sourced from user-service's Contact model (GET /contacts,
 * filtered client-side to contactTypeId.contactType === "Service Provider") - same
 * seeded-via-Configuration-page contact type used for Solicitors elsewhere. Self-contained
 * fetch (not lifted to a parent/Redux) since ComplaintFields is shared between
 * CreateCasesDrawer.jsx and CasesDetails.js, neither of which already loads Contacts.
 */
function useServiceProviderOptions() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    axios
      .get(`${baseURL}/contacts`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      .then((response) => {
        if (cancelled) return;
        const contacts = Array.isArray(response?.data?.data) ? response.data.data : [];
        const serviceProviders = contacts.filter(
          (contact) => contact?.contactTypeId?.contactType === "Service Provider",
        );
        setOptions(
          serviceProviders.map((contact) => ({
            value: contact._id,
            label: `${contact.forename || ""} ${contact.surname || ""}`.trim() || contact._id,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}

/**
 * COMPLAINT discriminator field set - backend/issue-service/models/issue.complaint.model.js.
 * Controlled component: `values` is the complaint-specific slice of the issue payload,
 * `onChange(field, value)` patches a single field back up to the parent (CasesDetails.js /
 * CreateCasesDrawer.jsx), which owns the full form state. Reused unmodified in both places
 * per the plan - render/edit logic lives here exactly once.
 */
function ComplaintFields({
  values = {},
  onChange,
  disabled = false,
  complaintTypeOptions = [],
  memberIds = [],
  memberLabels = {},
  onSelectComplainant,
  onSelectRelatedMember,
}) {
  const serviceProviderOptions = useServiceProviderOptions();
  const { options: resolvedByOptions } = useTeamUserOptions("issues-complaints");
  const complainantId = memberIds[0] || null;
  // The person the complaint is *about* - memberIds[1], distinct from the complainant
  // (memberIds[0]). For a member-portal submission, issue-service never auto-matches this -
  // it only stores what the member typed in respondents[0].name (see
  // controllers/issuePortal.controller.js#requireRelatedMemberDescription) - a CRM staffer
  // must search for and attach the real profile here. Once linked, memberIds[1] is that
  // real profileId and the free-text name is superseded by the resolved member.
  const relatedMemberId = memberIds[1] || null;
  const providedRelatedMemberName = values.respondents?.[0]?.name || null;

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

      <Row gutter={16} align="top">
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
            required
          />
        </Col>
        {values.complaintType === MEMBER_ON_MEMBER && (
          <Col span={12}>
            {/* Same pattern as Related Member(s) below (MemberSearch + selected Tag), capped
                to a single selection - selecting a complainant here also links them as a
                Related Member (they become memberIds[0], the member the backend's
                auto-generated complainant label is derived from). */}
            <label className="my-input-label mb-0">Complainant</label>
            <MemberSearch
              onSelectBehavior="callback"
              onSelectCallback={onSelectComplainant}
              fullWidth
              showStatus={false}
              disabled={disabled}
            />
            {complainantId && (
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">{memberLabels[complainantId] || complainantId}</Tag>
              </div>
            )}
          </Col>
        )}
        {values.complaintType === MEMBER_ON_MEMBER && (
          <Col span={12}>
            <label className="my-input-label mb-0">Related Member</label>
            {!relatedMemberId && providedRelatedMemberName && (
              <div
                style={{
                  marginBottom: 6,
                  padding: "4px 8px",
                  background: "rgba(250, 173, 20, 0.15)",
                  border: "1px solid rgba(250, 173, 20, 0.4)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                As provided by the member: <strong>{providedRelatedMemberName}</strong> - not
                yet linked to a member profile. Search below to attach.
              </div>
            )}
            <MemberSearch
              onSelectBehavior="callback"
              onSelectCallback={onSelectRelatedMember}
              fullWidth
              showStatus={false}
              disable={disabled}
            />
            {relatedMemberId && (
              <div style={{ marginTop: 8 }}>
                <Tag color="green">{memberLabels[relatedMemberId] || relatedMemberId}</Tag>
              </div>
            )}
          </Col>
        )}
        {values.complaintType === "MOSP" && (
          <Col span={12}>
            <CustomSelect
              label="Service Provider"
              name="serviceProvider"
              value={values.serviceProvider || ""}
              onChange={(e) => onChange("serviceProvider", e.target.value)}
              options={serviceProviderOptions}
              placeholder="Select service provider"
              disabled={disabled}
              isIDs
            />
          </Col>
        )}
      </Row>

      <Row gutter={16} align="top">
        <Col span={8}>
          {/* Same label + `.my-input-container` box shape as the CustomSelect/MyInput fields
              beside it (rather than a bare div with a hand-tuned marginTop), so this column's
              label and control row line up with Solicitor's by construction instead of by
              magic-number guesswork. */}
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
                required
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
