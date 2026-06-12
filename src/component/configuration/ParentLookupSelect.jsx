import React, { useMemo } from "react";
import { Col } from "antd";
import CustomSelect from "../common/CustomSelect";
import {
  findLookupTypeById,
  findLookupTypeByName,
  getLookupId,
  getLookupName,
  getParentLookupType,
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
      if (fromId) return fromId;
    }
    if (parentLookupTypeName) {
      const fromName = findLookupTypeByName(lookupsTypes, parentLookupTypeName);
      if (fromName) return fromName;
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
  ]);

  const hasParentFromApi =
    !!value || !!parentLookupTypeId || !!parentLookupTypeName;
  const requiresParent =
    lookupTypeRequiresParent(lookupsTypes, lookuptypeId, drawerKey) ||
    hasParentFromApi;
  const showField = requiresParent && (!!parentType || hasParentFromApi);
  const isDisabled = disabled || !showField;

  const fieldLabel =
    parentLookupTypeName ||
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
        disabled={isDisabled}
        required={required && requiresParent}
        hasError={hasError}
        onChange={handleChange}
      />
    </Col>
  );
}

export default ParentLookupSelect;
