import dayjs from "dayjs";

function normalizeFormValue(value) {
  if (dayjs.isDayjs(value)) {
    return value.isValid() ? value.format("YYYY-MM-DD") : null;
  }
  if (value instanceof Date) {
    const d = dayjs(value);
    return d.isValid() ? d.format("YYYY-MM-DD") : null;
  }
  return value;
}

export function serializeMembershipFormData(formData) {
  return JSON.stringify(formData, (_key, value) => normalizeFormValue(value));
}

export function isMembershipFormDirty(formData, baselineSerialized) {
  if (!baselineSerialized) return false;
  return serializeMembershipFormData(formData) !== baselineSerialized;
}
