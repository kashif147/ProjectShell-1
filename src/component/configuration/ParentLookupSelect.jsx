import React, { useMemo } from "react";
import { Col } from "antd";
import CustomSelect from "../common/CustomSelect";
import {
  getParentLookupType,
  getParentLookupOptions,
  getParentLookupLabel,
  lookupTypeRequiresParent,
} from "../../utils/lookupHierarchy";

/**
 * Hierarchy-aware parent lookup dropdown for Configuration lookup drawers.
 */
function ParentLookupSelect({
  drawerKey,
  lookuptypeId,
  lookups = [],
  lookupsTypes = [],
  value,
  parentLabel = "",
  disabled = false,
  required = false,
  hasError = false,
  span = 12,
  onChange,
}) {
  const parentType = useMemo(
    () => getParentLookupType(lookupsTypes, lookuptypeId, drawerKey),
    [lookupsTypes, lookuptypeId, drawerKey],
  );

  const options = useMemo(() => {
    const base = getParentLookupOptions(
      lookups,
      lookupsTypes,
      lookuptypeId,
      drawerKey,
    );
    if (!value) return base;
    const hasValue = base.some(
      (opt) => String(opt.value) === String(value) || String(opt.key) === String(value),
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
  }, [lookups, lookupsTypes, lookuptypeId, drawerKey, value, parentLabel]);

  const requiresParent = lookupTypeRequiresParent(
    lookupsTypes,
    lookuptypeId,
    drawerKey,
  );
  const isDisabled = disabled || !requiresParent || !parentType;

  // const label = getParentLookupLabel(parentType);
  const label = "Parent Lookup Type";

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
        label={label}
        name="Parentlookupid"
        placeholder={
          isDisabled
            ? "No parent lookup for this type"
            : options.length === 0
              ? `No ${parentType?.lookuptype || "parent"} records found`
              : `Select ${parentType?.lookuptype || "parent"}`
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
