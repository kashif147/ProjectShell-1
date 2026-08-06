import React, { useEffect, useMemo, useState } from "react";
import { Progress, Radio, Upload, Button, Row, Col, Tag, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import MyDrawer from "../common/MyDrawer";
import MyInput from "../common/MyInput";
import MyDatePicker1 from "../common/MyDatePicker1";
import CustomSelect from "../common/CustomSelect";
import MemberSearch from "../profile/MemberSearch";
import GroupPicker from "./GroupPicker";
import ComplaintFields from "./ComplaintFields";
import FtpFields from "./FtpFields";
import IrFields from "./IrFields";
import DataProtectionFields from "./DataProtectionFields";
import { createIssue } from "../../services/issuesApi";
import { useIssueDropdownLookups, useIssueStatusOptions } from "../../hooks/useIssueLookups";
import { buildIssueCreatePayload } from "./issueOptions";
import "../../styles/CreateCasesDrawer.css";

const { Dragger } = Upload;

const TYPE_FIELDS_COMPONENT = {
  COMPLAINT: ComplaintFields,
  FTP: FtpFields,
  IR: IrFields,
  DP: DataProtectionFields,
};

function emptyFormValues() {
  return {
    description: "",
    dateReceived: null,
    origin: null,
    issueType: null,
    issueSource: null,
    issueSourceOther: "",
    // Left empty until an Issue Type is picked - the type-scoping effect below fills it in
    // with that type's "Active" status as soon as one is selected.
    issueStatus: null,
    issueStatusOther: "",
    priority: "MEDIUM",
    memberIds: [],
    groupId: null,
    owner: { userId: "" },
  };
}

/**
 * "Create issue" drawer - the issueType selector below drives which of the 4
 * discriminator field-set components (ComplaintFields/FtpFields/IrFields/
 * DataProtectionFields, same components CasesDetails.js uses for editing) renders inline,
 * before the first save. Previously had no Save handler at all - now wired to
 * issuesApi.createIssue.
 *
 * `presetMember` ({_id, displayName}) is optional and lets a caller (e.g. the Profile
 * detail page's "Log an Issue" action) open the drawer with a member already linked,
 * skipping the MemberSearch step for the obvious case. Mirrors how
 * CreateAttendeeDrawer accepts an `eventId` prop to lock/pre-populate its event field.
 * When omitted, the drawer behaves exactly as before (opened from the Issues grid header
 * with no member pre-linked).
 *
 * `defaultIssueType` (one of ISSUE_TYPES) is optional and lets a caller (the dedicated
 * Complaints/Fitness to Practice/Industrial Relations/Data Protection side-nav pages, via
 * HeaderDetails.jsx's "+ Create" button) open the drawer with Issue Type already selected
 * to match that page - still a plain editable field, not locked, since the doc only asks
 * for a *default*.
 */
const CreateCasesDrawer = ({ open, onClose, presetMember, defaultIssueType }) => {
  const [formValues, setFormValues] = useState(emptyFormValues);
  const [memberLabels, setMemberLabels] = useState({});
  const [saving, setSaving] = useState(false);

  // This drawer is always mounted (HeaderDetails.jsx just toggles `open`, so its close
  // animation isn't cut short), so useIssueDropdownLookups()'s one-shot fetch-on-mount would
  // only ever run once per session - long before the user necessarily opens this drawer, and
  // with no way to recover if that early fetch raced or failed. Bump dropdownReloadKey only
  // on true open transitions so every open gets its own fresh, self-healing fetch.
  const [dropdownReloadKey, setDropdownReloadKey] = useState(0);
  useEffect(() => {
    if (open) setDropdownReloadKey((key) => key + 1);
  }, [open]);

  const {
    issueTypeOptions,
    originOptions,
    issueSourceOptions,
    priorityOptions,
    complaintTypeOptions,
    criteriaLetterStatusOptions,
    legislationOptions,
    caseTypeOptions,
  } = useIssueDropdownLookups(dropdownReloadKey);
  const { options: issueStatusOptions } = useIssueStatusOptions(formValues.issueType);

  // Default Issue Status to "Active" for whichever Issue Type is currently selected, then
  // leave the user's choice alone. Issue Status options are type-scoped (see
  // useIssueLookups.js) and each type's "Active" status has its own code (e.g. "ACTIVE" for
  // Complaint, "ACTIVE-FTP" for FTP) sharing the same "Active" display label, so match by
  // label rather than assuming a single "ACTIVE" code - falls back to the first option if a
  // type has no status literally labeled "Active".
  useEffect(() => {
    if (!formValues.issueType || issueStatusOptions.length === 0) return;
    const validCodes = issueStatusOptions.map((o) => o.value);
    if (validCodes.includes(formValues.issueStatus)) return;
    const activeOption = issueStatusOptions.find(
      (o) => String(o.label || "").trim().toLowerCase() === "active",
    );
    setFormValues((prev) => ({
      ...prev,
      issueStatus: activeOption ? activeOption.value : validCodes[0],
    }));
  }, [issueStatusOptions, formValues.issueType, formValues.issueStatus]);

  const presetMemberId = presetMember?._id || presetMember?.id || null;

  // Re-applied every time the drawer opens (not just on mount) so the preset member is
  // still there after a previous open/close/reset cycle.
  useEffect(() => {
    if (!open || !presetMemberId) return;
    setFormValues((prev) => {
      const current = Array.isArray(prev.memberIds) ? prev.memberIds : [];
      if (current.includes(presetMemberId)) return prev;
      return { ...prev, memberIds: [...current, presetMemberId] };
    });
    setMemberLabels((prev) => ({
      ...prev,
      [presetMemberId]: presetMember?.displayName || presetMemberId,
    }));
  }, [open, presetMemberId, presetMember?.displayName]);

  // Only sets it when the form doesn't already have one selected (each fresh open starts
  // from emptyFormValues()'s issueType:null, so this fires exactly once per open unless the
  // user has already picked something) - never overrides an in-progress user choice.
  useEffect(() => {
    if (!open || !defaultIssueType) return;
    setFormValues((prev) => (prev.issueType ? prev : { ...prev, issueType: defaultIssueType }));
  }, [open, defaultIssueType]);

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddMember = (memberData) => {
    const id = memberData?._id;
    if (!id) return;
    setFormValues((prev) => {
      const current = Array.isArray(prev.memberIds) ? prev.memberIds : [];
      if (current.includes(id)) return prev;
      return { ...prev, memberIds: [...current, id] };
    });
    setMemberLabels((prev) => ({
      ...prev,
      [id]:
        `${memberData?.personalInfo?.forename || ""} ${memberData?.personalInfo?.surname || ""}`.trim() ||
        memberData?.membershipNumber ||
        id,
    }));
  };

  const handleRemoveMember = (id) => {
    // The preset/originating member (set via the `presetMember` prop) stays linked -
    // it's why the drawer was opened in the first place.
    if (id === presetMemberId) return;
    setFormValues((prev) => ({
      ...prev,
      memberIds: (prev.memberIds || []).filter((m) => m !== id),
    }));
  };

  const resetAndClose = () => {
    setFormValues(emptyFormValues());
    setMemberLabels({});
    onClose();
  };

  const handleSave = async () => {
    if (!formValues.issueType) {
      message.error("Issue Type is required");
      return;
    }
    if (!formValues.description) {
      message.error("Description is required");
      return;
    }
    setSaving(true);
    try {
      const payload = buildIssueCreatePayload(formValues, formValues.issueType);
      await createIssue(payload);
      message.success("Issue created");
      // No live-refresh hook available: CasesSummary.js fetches its own row list with
      // local useState (not the issues Redux slice), and this drawer is out of scope to
      // wire that refresh into (see the task's "don't touch CasesSummary.js") - the grid
      // will pick up the new issue on its next natural reload/navigation.
      resetAndClose();
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create issue",
      );
    } finally {
      setSaving(false);
    }
  };

  const memberIds = Array.isArray(formValues.memberIds) ? formValues.memberIds : [];
  const isIrGroupCase =
    formValues.issueType === "IR" &&
    (formValues.caseType === "GROUP" || formValues.caseType === "NATIONAL");

  const progressPercent = useMemo(() => {
    const checks = [
      !!formValues.issueType,
      !!formValues.description,
      !!formValues.dateReceived,
      !!formValues.issueSource,
      !!formValues.origin,
      memberIds.length > 0,
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  }, [formValues, memberIds.length]);

  const headerActions = (
    <div className="case-drawer-header-actions">
      <Button className="header-discard-btn" onClick={resetAndClose} disabled={saving}>
        Cancel
      </Button>
      <Button className="header-finalize-btn" type="primary" onClick={handleSave} loading={saving}>
        Save
      </Button>
    </div>
  );

  const renderIssueOverview = () => (
    <div className="form-section issue-overview-section">
      <div className="section-header-row">
        <h3 className="section-title">Issue Overview</h3>
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <CustomSelect
            label="Issue Type"
            name="issueType"
            value={formValues.issueType || ""}
            onChange={(e) => handleChange("issueType", e.target.value)}
            placeholder="Select issue type"
            options={issueTypeOptions}
            isIDs
            required
          />
        </Col>
        <Col span={12}>
          <CustomSelect
            label="Issue Status"
            name="issueStatus"
            value={formValues.issueStatus || ""}
            onChange={(e) => handleChange("issueStatus", e.target.value)}
            placeholder="Select issue type first"
            options={issueStatusOptions}
            disabled={!formValues.issueType}
            isIDs
          />
        </Col>
      </Row>
      {formValues.issueStatus === "OTHER" && (
        <MyInput
          label="Issue Status (Other)"
          name="issueStatusOther"
          value={formValues.issueStatusOther || ""}
          onChange={(e) => handleChange("issueStatusOther", e.target.value)}
          maxLength={45}
          extra="Max 45 characters"
        />
      )}
      <MyInput
        label="Description"
        name="description"
        value={formValues.description || ""}
        onChange={(e) => handleChange("description", e.target.value)}
        placeholder="Detailed description of the issue..."
        type="textarea"
        rows={2}
        required
      />
    </div>
  );

  const renderIncidentDetails = () => (
    <div className="form-section">
      <h3 className="section-title">Incident Details</h3>
      <Row gutter={16}>
        <Col span={8}>
          <MyDatePicker1
            label="Date Received"
            name="dateReceived"
            value={formValues.dateReceived}
            onChange={(d) => handleChange("dateReceived", d)}
            placeholder="DD/MM/YYYY"
            format="DD/MM/YYYY"
          />
        </Col>
        <Col span={8}>
          <CustomSelect
            label="Origin"
            name="origin"
            value={formValues.origin || ""}
            onChange={(e) => handleChange("origin", e.target.value)}
            placeholder="How was this reported?"
            options={originOptions}
            isIDs
          />
        </Col>
        <Col span={8}>
          <CustomSelect
            label="Issue Source"
            name="issueSource"
            value={formValues.issueSource || ""}
            onChange={(e) => handleChange("issueSource", e.target.value)}
            placeholder="Select source"
            options={issueSourceOptions}
            isIDs
          />
        </Col>
      </Row>
      {formValues.issueSource === "OTHR-IS" && (
        <MyInput
          label="Issue Source (Other)"
          name="issueSourceOther"
          value={formValues.issueSourceOther || ""}
          onChange={(e) => handleChange("issueSourceOther", e.target.value)}
        />
      )}
    </div>
  );

  const renderOwnership = () => (
    <div className="form-section">
      <h3 className="section-title">Ownership &amp; Members</h3>
      <Row gutter={16}>
        <Col span={12}>
          {/* No staff/user-picker component exists in this codebase - freeform userId text,
              same simplification as CasesDetails.js's Owner field. Ignored server-side for
              IR (auto-resolved to the member's IRO). */}
          <MyInput
            label="Owner (User Id)"
            name="ownerUserId"
            value={formValues.owner?.userId || ""}
            onChange={(e) =>
              setFormValues((prev) => ({ ...prev, owner: { ...(prev.owner || {}), userId: e.target.value } }))
            }
            placeholder="Optional - auto-resolved for IR"
          />
        </Col>
        <Col span={12}>
          <label className="my-input-label">Related Member(s)</label>
          <MemberSearch onSelectBehavior="callback" onSelectCallback={handleAddMember} fullWidth compact showStatus={false} />
        </Col>
      </Row>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {memberIds.map((id) => {
          const isPreset = id === presetMemberId;
          return (
            <Tag
              key={id}
              color={isPreset ? "blue" : undefined}
              closable={!isPreset}
              onClose={isPreset ? undefined : () => handleRemoveMember(id)}
              title={isPreset ? "Originating member - added from the member's Profile" : undefined}
            >
              {memberLabels[id] || id}
              {isPreset ? " (member)" : ""}
            </Tag>
          );
        })}
      </div>
      {/* Group linking (profile-service's Group feature, GroupPicker.jsx) - deferred to the
          Save button like every other field in this drawer (no issue exists to persist
          against yet). Suppressed here for IR Group/National cases: IrFields.jsx (rendered
          above, via TypeFieldsComponent) already shows this same control prominently, bound
          to the same formValues.groupId - see that file's header comment. */}
      {isIrGroupCase ? (
        <div style={{ marginTop: 12, fontSize: 12, color: "var(--theme-text-muted)" }}>
          Group linking is handled in the Industrial Relations section above (Case Type ={" "}
          {formValues.caseType === "NATIONAL" ? "National" : "Group"}).
        </div>
      ) : (
        <div style={{ marginTop: 12 }}>
          <label className="my-input-label">Related Group (optional)</label>
          <GroupPicker
            value={formValues.groupId || null}
            onChange={(groupId) => handleChange("groupId", groupId)}
          />
        </div>
      )}
    </div>
  );

  const renderDocumentation = () => (
    <div className="form-section">
      <h3 className="section-title">Documentation</h3>
      <label className="form-label">Attachments</label>
      <Dragger className="case-upload-dragger" disabled>
        <p className="upload-icon-wrapper">
          <InboxOutlined style={{ fontSize: "32px", color: "var(--app-brand-accent)" }} />
        </p>
        <p className="upload-hint">
          Drag &amp; drop or tap to select PDFs, PNGs, or DOCX (not yet wired to a backend -
          issue-service has no attachments endpoint)
        </p>
      </Dragger>
    </div>
  );

  const renderWorkflow = () => (
    <div className="form-section">
      <h3 className="section-title">Workflow</h3>
      <div className="case-input-container">
        <label className="form-label">
          Priority <span className="required-star">*</span>
        </label>
        <div className="priority-control-container">
          <Radio.Group
            value={formValues.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            buttonStyle="solid"
            className="priority-group"
          >
            {priorityOptions.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value} className="priority-btn">
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>
    </div>
  );

  const TypeFieldsComponent = formValues.issueType
    ? TYPE_FIELDS_COMPONENT[formValues.issueType]
    : null;

  return (
    <MyDrawer
      title="Create issue"
      open={open}
      onClose={resetAndClose}
      width={900}
      isPagination={false}
      extra={headerActions}
      className="create-case-drawer"
    >
      <div className="create-case-drawer-content">
        <div className="completion-progress-container">
          <div className="progress-header">
            <span className="progress-title">FORM COMPLETION</span>
            <span className="progress-percentage">{progressPercent}%</span>
          </div>
          <Progress
            percent={progressPercent}
            showInfo={false}
            strokeWidth={4}
            strokeColor="var(--app-brand-accent)"
            trailColor="#d9d9d9"
          />
        </div>

        <div className="case-form-scroll-container">
          {renderIssueOverview()}
          {renderIncidentDetails()}
          {TypeFieldsComponent && (
            <TypeFieldsComponent
              values={formValues}
              onChange={handleChange}
              complaintTypeOptions={complaintTypeOptions}
              criteriaLetterStatusOptions={criteriaLetterStatusOptions}
              legislationOptions={legislationOptions}
              caseTypeOptions={caseTypeOptions}
            />
          )}
          {renderOwnership()}
          {renderWorkflow()}
          {renderDocumentation()}
        </div>
      </div>
    </MyDrawer>
  );
};

export default CreateCasesDrawer;
