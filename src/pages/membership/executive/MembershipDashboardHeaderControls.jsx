import React, { useCallback, useMemo } from "react";
import { Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useFilters } from "../../../context/FilterContext";
import {
  buildMembershipYearOptions,
  MEMBERSHIP_MONTH_OPTIONS,
} from "./executiveDashboardUtils";

function FilterSelectChip({ label, value, options, onChange, className = "" }) {
  return (
    <div className={`exec-dashboard-filter-chip ${className}`.trim()}>
      <span className="filter-label">{label}</span>
      <Select
        className="exec-dashboard-filter-chip__select"
        popupClassName="exec-dashboard-filter-chip__dropdown"
        value={value}
        options={options}
        onChange={onChange}
        bordered={false}
        suffixIcon={<DownOutlined className="exec-dashboard-filter-chip__chevron" />}
      />
    </div>
  );
}

function FilterToggleChip({ label, checked, onChange }) {
  return (
    <button
      type="button"
      className={`exec-dashboard-filter-chip exec-dashboard-filter-toggle${
        checked ? " active" : ""
      }`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="filter-label">{label}</span>
    </button>
  );
}

export default function MembershipDashboardHeaderControls({ variant = "default" }) {
  const {
    membershipDashboardHeader,
    updateMembershipDashboardHeader,
    bumpMembershipDashboardApply,
  } = useFilters();

  const yearOptions = useMemo(() => buildMembershipYearOptions(12), []);

  const applyHeaderChange = useCallback(
    (patch) => {
      updateMembershipDashboardHeader(patch);
      bumpMembershipDashboardApply();
    },
    [updateMembershipDashboardHeader, bumpMembershipDashboardApply]
  );

  if (variant !== "inline") {
    return null;
  }

  return (
    <div className="exec-dashboard-header-controls exec-dashboard-header-controls--inline">
      <FilterSelectChip
        label="Year"
        value={membershipDashboardHeader.year}
        options={yearOptions}
        onChange={(year) => applyHeaderChange({ year })}
      />
      <FilterSelectChip
        label="Month"
        value={membershipDashboardHeader.month}
        options={MEMBERSHIP_MONTH_OPTIONS}
        onChange={(month) => applyHeaderChange({ month })}
        className="exec-dashboard-filter-chip--month"
      />
      <FilterToggleChip
        label="Include Student"
        checked={membershipDashboardHeader.includeStudents}
        onChange={(includeStudents) => applyHeaderChange({ includeStudents })}
      />
      <FilterToggleChip
        label="Include Honorary"
        checked={membershipDashboardHeader.includeHonorary}
        onChange={(includeHonorary) => applyHeaderChange({ includeHonorary })}
      />
    </div>
  );
}
