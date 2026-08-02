import React, { useEffect, useRef, useState } from "react";
import { Select, Button, Radio, Tag, Spin, message } from "antd";
import { PlusOutlined, CloseOutlined } from "@ant-design/icons";
import MemberSearch from "../profile/MemberSearch";
import MyInput from "../common/MyInput";
import { fetchGroups, fetchGroupById, fetchGroupMembers, createGroup } from "../../services/groupsApi";

/**
 * Group linking control for Issue Management - the requirements doc's "To link multiple
 * issues, user should be able to create a group... interface to create a group and drill
 * down to find members based on workplace, section, grade, branch, region, IRO, membership
 * category... static or dynamic" paragraph. Backed by profile-service's Group feature
 * (src/services/groupsApi.js).
 *
 * Controlled component, same shape convention as the 4 issue-type field-set components:
 * `value` is the current groupId (string|null), `onChange(groupId, groupObject|null)` fires
 * on select/create/clear. Deliberately does NOT persist anything itself - the host page
 * decides whether to save immediately (CasesDetails.js, matching its memberIds pattern) or
 * defer to a Save button (CreateCasesDrawer.jsx, IrFields.jsx), same division of
 * responsibility as every other controlled field on this form.
 *
 * Two modes, switched by whether a group is currently selected:
 *  - No group selected: a debounced async-search Select (same pattern as IrFields.jsx's
 *    issueDesignation search) against GET /groups?search=, plus a "Create new group" toggle
 *    that expands an inline form (name, STATIC member list via MemberSearch, or DYNAMIC
 *    criteria via free-text tag inputs).
 *  - Group selected: a closable Tag with the group's name/mode plus its live resolved
 *    member count (GET /groups/:id/members).
 */

const CRITERIA_FIELDS = [
  { key: "workLocation", label: "Work Location" },
  { key: "section", label: "Section" },
  { key: "grade", label: "Grade" },
  { key: "branch", label: "Branch" },
  { key: "region", label: "Region" },
  { key: "membershipCategory", label: "Membership Category" },
];

function emptyCreateForm() {
  return {
    name: "",
    description: "",
    membershipMode: "STATIC",
    staticMemberIds: [],
    criteria: {
      workLocation: [],
      section: [],
      grade: [],
      branch: [],
      region: [],
      membershipCategory: [],
    },
  };
}

function GroupPicker({ value, onChange, disabled = false }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [resolving, setResolving] = useState(false);

  const [searchOptions, setSearchOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [memberLabels, setMemberLabels] = useState({});

  useEffect(
    () => () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    },
    [],
  );

  // Self-heal the display name for an already-saved groupId (e.g. loaded from an existing
  // issue) - GET /issues/:id only returns the raw groupId string, not a name.
  useEffect(() => {
    if (!value) {
      setSelectedGroup(null);
      setMemberCount(null);
      return;
    }
    if (selectedGroup && String(selectedGroup._id) === String(value)) return;
    let cancelled = false;
    setResolving(true);
    fetchGroupById(value)
      .then((group) => {
        if (!cancelled && group) setSelectedGroup(group);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Live resolved member count - re-fetched whenever the selected group id changes.
  useEffect(() => {
    if (!value) {
      setMemberCount(null);
      return;
    }
    let cancelled = false;
    fetchGroupMembers(value)
      .then((result) => {
        if (!cancelled) setMemberCount(typeof result?.total === "number" ? result.total : null);
      })
      .catch(() => {
        if (!cancelled) setMemberCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const runSearch = (query) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setSearching(true);
      try {
        const result = await fetchGroups({ search: query, limit: 20 });
        if (requestId !== requestIdRef.current) return;
        const groups = Array.isArray(result?.groups) ? result.groups : [];
        setSearchOptions(
          groups.map((g) => ({
            value: g._id,
            label: `${g.name} (${g.membershipMode === "DYNAMIC" ? "Dynamic" : "Static"})`,
            group: g,
          })),
        );
      } catch {
        if (requestId === requestIdRef.current) setSearchOptions([]);
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    }, 300);
  };

  const handleSelect = (groupId, option) => {
    if (!groupId) return;
    setSelectedGroup(option?.group || { _id: groupId });
    onChange(groupId, option?.group || null);
  };

  const handleClear = () => {
    setSelectedGroup(null);
    setMemberCount(null);
    onChange(null, null);
  };

  const handleCreateFieldChange = (field, val) => {
    setCreateForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleCriteriaChange = (key, val) => {
    setCreateForm((prev) => ({ ...prev, criteria: { ...prev.criteria, [key]: val } }));
  };

  const handleAddStaticMember = (memberData) => {
    const id = memberData?._id;
    if (!id) return;
    setCreateForm((prev) => {
      if (prev.staticMemberIds.includes(id)) return prev;
      return { ...prev, staticMemberIds: [...prev.staticMemberIds, id] };
    });
    setMemberLabels((prev) => ({
      ...prev,
      [id]:
        `${memberData?.personalInfo?.forename || ""} ${memberData?.personalInfo?.surname || ""}`.trim() ||
        memberData?.membershipNumber ||
        id,
    }));
  };

  const handleRemoveStaticMember = (id) => {
    setCreateForm((prev) => ({
      ...prev,
      staticMemberIds: prev.staticMemberIds.filter((m) => m !== id),
    }));
  };

  const cancelCreate = () => {
    setShowCreate(false);
    setCreateForm(emptyCreateForm());
    setMemberLabels({});
  };

  const handleCreateGroup = async () => {
    if (!createForm.name.trim()) {
      message.error("Group name is required");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: createForm.name.trim(),
        description: createForm.description || null,
        membershipMode: createForm.membershipMode,
        staticMemberIds:
          createForm.membershipMode === "STATIC" ? createForm.staticMemberIds : [],
        criteria: createForm.membershipMode === "DYNAMIC" ? createForm.criteria : undefined,
      };
      const group = await createGroup(payload);
      message.success("Group created");
      setSelectedGroup(group);
      onChange(group._id, group);
      cancelCreate();
    } catch (error) {
      message.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create group",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="group-picker">
      {selectedGroup ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Tag
            color="blue"
            closable={!disabled}
            onClose={handleClear}
            closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
          >
            {selectedGroup.name || selectedGroup._id}
            {selectedGroup.membershipMode
              ? ` (${selectedGroup.membershipMode === "DYNAMIC" ? "Dynamic" : "Static"})`
              : ""}
          </Tag>
          <span style={{ fontSize: 12, color: "var(--theme-text-muted)" }}>
            {memberCount != null ? `${memberCount} member(s)` : resolving ? <Spin size="small" /> : ""}
          </span>
        </div>
      ) : (
        <Select
          showSearch
          allowClear
          disabled={disabled}
          placeholder="Search group by name..."
          filterOption={false}
          notFoundContent={searching ? <Spin size="small" /> : null}
          onSearch={runSearch}
          onFocus={() => runSearch("")}
          onChange={handleSelect}
          options={searchOptions}
          style={{ width: "100%" }}
        />
      )}

      {!disabled && !selectedGroup && !showCreate && (
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setShowCreate(true)}
          style={{ paddingLeft: 0 }}
        >
          Create new group
        </Button>
      )}

      {showCreate && (
        <div
          style={{
            border: "1px solid var(--theme-border-color, #eee)",
            borderRadius: 6,
            padding: 12,
            marginTop: 8,
          }}
        >
          <MyInput
            label="Group Name"
            name="groupName"
            value={createForm.name}
            onChange={(e) => handleCreateFieldChange("name", e.target.value)}
            required
          />
          <MyInput
            label="Description"
            name="groupDescription"
            value={createForm.description}
            onChange={(e) => handleCreateFieldChange("description", e.target.value)}
          />

          <div className="my-input-wrapper">
            <label className="my-input-label">Membership Mode</label>
            <div style={{ marginTop: 6 }}>
              <Radio.Group
                value={createForm.membershipMode}
                onChange={(e) => handleCreateFieldChange("membershipMode", e.target.value)}
              >
                <Radio value="STATIC">Static (fixed member list)</Radio>
                <Radio value="DYNAMIC">Dynamic (criteria, resolved live)</Radio>
              </Radio.Group>
            </div>
          </div>

          {createForm.membershipMode === "STATIC" ? (
            <div className="my-input-wrapper">
              <label className="my-input-label">Members</label>
              <MemberSearch
                onSelectBehavior="callback"
                onSelectCallback={handleAddStaticMember}
                fullWidth
                compact
                showStatus={false}
              />
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {createForm.staticMemberIds.length === 0 && (
                  <span style={{ color: "var(--theme-text-muted)", fontSize: 12 }}>
                    No members added yet.
                  </span>
                )}
                {createForm.staticMemberIds.map((id) => (
                  <Tag
                    key={id}
                    closable
                    onClose={() => handleRemoveStaticMember(id)}
                    closeIcon={<CloseOutlined style={{ fontSize: 10 }} />}
                  >
                    {memberLabels[id] || id}
                  </Tag>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {CRITERIA_FIELDS.map((field) => (
                <div className="my-input-wrapper" key={field.key}>
                  <label className="my-input-label">{field.label}</label>
                  <Select
                    mode="tags"
                    value={createForm.criteria[field.key]}
                    onChange={(v) => handleCriteriaChange(field.key, v)}
                    style={{ width: "100%" }}
                    placeholder={`Add ${field.label.toLowerCase()}(s)...`}
                    tokenSeparators={[","]}
                  />
                </div>
              ))}
              <div style={{ fontSize: 12, color: "var(--theme-text-muted)" }}>
                Members matching any of the above (per field) will be resolved live each time
                the group is viewed.
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <Button type="primary" size="small" loading={creating} onClick={handleCreateGroup}>
              Save Group
            </Button>
            <Button size="small" onClick={cancelCreate} disabled={creating}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupPicker;
