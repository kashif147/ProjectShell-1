import React, { useMemo } from "react";
import { Col } from "antd";
import CustomSelect from "../common/CustomSelect";
import {
  findLookupTypeById,
  findLookupTypeByName,
  getLookupId,
  getLookupName,
  getParentLookupType,
  getDrawerParentFieldLabel,
  canonicalParentTypeName,
  lookupBelongsToType,
  lookupTypeRequiresParent,
} from "../../utils/lookupHierarchy";

/**
 * Hierarchy-aware parent lookup dropdown for Configuration lookup drawers.
 * When the API returns a parent type (e.g. Branch), that name is used as the field label.
 */
function ParentLookupSelect({
  drawerKey,
  lookuptypeId,
  lookups = [],
  lookupsTypes = [],
  value,
  parentLabel = "",
  parentLookupTypeId = null,
  parentLookupTypeName = "",
  disabled = false,
  required = false,
  hasError = false,
  span = 12,
  onChange,
}) {
  const parentType = useMemo(() => {
    if (parentLookupTypeId) {
      const fromId = findLookupTypeById(lookupsTypes, parentLookupTypeId);
      if (fromId) {
        const canonical = canonicalParentTypeName(
          fromId.lookuptype || fromId.DisplayName || fromId.name,
        );
        if (
          canonical &&
          normalizeLoose(canonical) !==
            normalizeLoose(fromId.lookuptype || fromId.DisplayName || fromId.name)
        ) {
          const aliased = findLookupTypeByName(lookupsTypes, canonical);
          if (aliased) return aliased;
        }
        // Branch parent must stay Region even if id points at legacy "Divisions"
        if (drawerKey === "Districts") {
          const region = findLookupTypeByName(lookupsTypes, "Region");
          if (region) return region;
        }
        return fromId;
      }
    }
    if (parentLookupTypeName) {
      const fromName = findLookupTypeByName(
        lookupsTypes,
        canonicalParentTypeName(parentLookupTypeName),
      );
      if (fromName) return fromName;
      const raw = findLookupTypeByName(lookupsTypes, parentLookupTypeName);
      if (raw) return raw;
    }
    return getParentLookupType(lookupsTypes, lookuptypeId, drawerKey);
  }, [
    lookupsTypes,
    lookuptypeId,
    drawerKey,
    parentLookupTypeId,
    parentLookupTypeName,
  ]);

  const options = useMemo(() => {
    const base = parentType
      ? (lookups || [])
          .filter((item) => lookupBelongsToType(item, parentType))
          .map((item) => ({
            value: getLookupId(item),
            key: getLookupId(item),
            label: getLookupName(item) || item.code,
          }))
          .sort((a, b) =>
            String(a.label || "")
              .toLowerCase()
              .localeCompare(String(b.label || "").toLowerCase()),
          )
      : [];
    if (!value) return base;
    const hasValue = base.some(
      (opt) =>
        String(opt.value) === String(value) ||
        String(opt.key) === String(value),
    );
    if (hasValue) return base;
    return [
      {
        value,
        key: value,
        label: parentLabel || String(value),
      },
      ...base,
    ];
  }, [
    lookups,
    lookupsTypes,
    lookuptypeId,
    drawerKey,
    value,
    parentLabel,
    parentType,
  ]);

  const requiresParent = lookupTypeRequiresParent(
    lookupsTypes,
    lookuptypeId,
    drawerKey,
  );
  const showField = requiresParent && !!parentType;
  const isDisabled = disabled || !showField;

  if (!showField) {
    return null;
  }

  const fieldLabel =
    getDrawerParentFieldLabel(drawerKey, "") ||
    canonicalParentTypeName(parentLookupTypeName) ||
    parentType?.lookuptype ||
    parentType?.DisplayName ||
    "Parent Lookup";

  const handleChange = (e) => {
    const selectedId = e?.target?.value ?? e?.value ?? "";
    const selected = options.find(
      (opt) =>
        String(opt.value) === String(selectedId) ||
        String(opt.key) === String(selectedId),
    );
    onChange?.({
      parentId: selectedId === "" ? null : String(selectedId),
      parentLabel: selected?.label || "",
    });
  };

  return (
    <Col span={span}>
      <CustomSelect
        label={fieldLabel}
        name="Parentlookupid"
        placeholder={
          isDisabled
            ? "No parent lookup for this type"
            : options.length === 0
              ? `No ${fieldLabel} records found`
              : `Select ${fieldLabel}`
        }
        value={value || ""}
        options={options}
        isSimple={true}
        isIDs={true}
        showSearch
        disabled={isDisabled}
        required={required && requiresParent}
        hasError={hasError}
        onChange={handleChange}
      />
    </Col>
  );
}

function normalizeLoose(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

export default ParentLookupSelect;
