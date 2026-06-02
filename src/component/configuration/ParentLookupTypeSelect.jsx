import React, { useMemo } from "react";
import { Col } from "antd";
import CustomSelect from "../common/CustomSelect";

const normalizeId = (id) => {
  if (id == null || id === "") return null;
  if (typeof id === "object" && id._id) return String(id._id);
  return String(id);
};

const normalizeTypeName = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

/**
 * Parent lookup type picker for the Lookup Type drawer.
 * Lists all lookup types; sets ParentlookuptypeId + Parentlookuptype on select.
 */
function ParentLookupTypeSelect({
  lookupsTypes = [],
  value = null,
  parentLabel = "",
  excludeTypeId = null,
  excludeTypeName = "",
  disabled = false,
  hasError = false,
  span = 12,
  onChange,
}) {
  const parentTypeId = normalizeId(value);

  const options = useMemo(() => {
    const excludeId = normalizeId(excludeTypeId);
    const excludeName = normalizeTypeName(excludeTypeName);
    return (lookupsTypes || [])
      .filter((lt) => {
        const id = normalizeId(lt._id);
        if (excludeId && id === excludeId) return false;
        if (
          excludeName &&
          normalizeTypeName(lt.lookuptype || lt.DisplayName) === excludeName
        ) {
          return false;
        }
        return true;
      })
      .map((lt) => ({
        value: lt._id,
        key: lt._id,
        label: lt.lookuptype || lt.DisplayName || lt.code || "",
        lookuptype: lt.lookuptype || "",
      }))
      .sort((a, b) =>
        String(a.label || "")
          .toLowerCase()
          .localeCompare(String(b.label || "").toLowerCase()),
      );
  }, [lookupsTypes, excludeTypeId, excludeTypeName]);

  const optionsWithCurrent = useMemo(() => {
    if (!parentTypeId) return options;
    const hasValue = options.some(
      (opt) => String(opt.value) === String(parentTypeId),
    );
    if (hasValue) return options;
    return [
      {
        value: parentTypeId,
        key: parentTypeId,
        label: parentLabel || parentTypeId,
        lookuptype: parentLabel || "",
      },
      ...options,
    ];
  }, [options, parentTypeId, parentLabel]);

  const handleChange = (e) => {
    const selectedId = e?.target?.value ?? "";
    const selected = optionsWithCurrent.find(
      (opt) => String(opt.value) === String(selectedId),
    );
    if (selectedId === "") {
      onChange?.({ parentTypeId: null, parentTypeLabel: null });
      return;
    }
    onChange?.({
      parentTypeId: String(selectedId),
      parentTypeLabel: selected?.lookuptype || selected?.label || "",
    });
  };

  return (
    <Col span={span}>
      <CustomSelect
        label="Parent Lookup Type"
        name="ParentlookuptypeId"
        placeholder="Select parent lookup type"
        value={parentTypeId || ""}
        options={optionsWithCurrent}
        isSimple={true}
        isIDs={true}
        disabled={disabled}
        required={false}
        hasError={hasError}
        onChange={handleChange}
      />
    </Col>
  );
}

export default ParentLookupTypeSelect;
