import React, { useCallback, useEffect, useMemo } from "react";
import { Checkbox, Select } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import { useFilters } from "../../../context/FilterContext";
import {
  buildMembershipYearOptions,
  parseMembershipCategoryOptionLabels,
  resolveDashboardMembershipCategoryFilterState,
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
        suffixIcon={
          <DownOutlined className="exec-dashboard-filter-chip__chevron" />
        }
      />
    </div>
  );
}

function FilterCheckboxChip({ label, checked, onChange }) {
  return (
    <div
      className={`exec-dashboard-filter-chip exec-dashboard-filter-checkbox${
        checked ? " exec-dashboard-filter-checkbox--checked" : ""
      }`}
    >
      <Checkbox
        className="exec-dashboard-filter-checkbox__input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      >
        <span className="filter-label">{label}</span>
      </Checkbox>
    </div>
  );
}

function categoryFilterStateChanged(current, next) {
  const curOp = current?.operator || "==";
  const curVals = current?.selectedValues || [];
  if (curOp !== next.operator) return true;
  if (curVals.length !== next.selectedValues.length) return true;
  return next.selectedValues.some((value, index) => value !== curVals[index]);
}

export default function MembershipDashboardHeaderControls({
  variant = "default",
}) {
  const location = useLocation();
  const isMembershipDashboard =
    (location.pathname || "").replace(/\/$/, "").toLowerCase() ===
    "/membershipdashboard";

  const {
    membershipDashboardHeader,
    updateMembershipDashboardHeader,
    bumpMembershipDashboardApply,
    filtersState,
    updateFilter,
    filterOptions,
  } = useFilters();

  const yearOptions = useMemo(() => buildMembershipYearOptions(12), []);

  const allCategoryLabels = useMemo(
    () =>
      parseMembershipCategoryOptionLabels(
        filterOptions["Membership Category"] || [],
      ),
    [filterOptions],
  );

  const syncMembershipCategoryWithHeader = useCallback(
    (header) => {
      if (!isMembershipDashboard) return false;

      const next = resolveDashboardMembershipCategoryFilterState(
        header,
        allCategoryLabels,
        header.manualMembershipCategories,
      );
      const current = filtersState["Membership Category"];
      const changed = categoryFilterStateChanged(current, next);

      if (changed) {
        updateFilter("Membership Category", next.operator, next.selectedValues);
      }
      return changed;
    },
    [
      allCategoryLabels,
      filtersState,
      isMembershipDashboard,
      updateFilter,
    ],
  );

  const applyHeaderChange = useCallback(
    (patch) => {
      const nextHeader = { ...membershipDashboardHeader, ...patch };
      updateMembershipDashboardHeader(patch);
      if (isMembershipDashboard) {
        syncMembershipCategoryWithHeader(nextHeader);
      }
      bumpMembershipDashboardApply();
    },
    [
      membershipDashboardHeader,
      updateMembershipDashboardHeader,
      syncMembershipCategoryWithHeader,
      bumpMembershipDashboardApply,
      isMembershipDashboard,
    ],
  );

  useEffect(() => {
    if (variant !== "inline" || !isMembershipDashboard) return;
    if (!allCategoryLabels.length) return;

    const changed = syncMembershipCategoryWithHeader(membershipDashboardHeader);
    if (changed) {
      bumpMembershipDashboardApply();
    }
  }, [
    variant,
    isMembershipDashboard,
    allCategoryLabels,
    membershipDashboardHeader.includeStudents,
    membershipDashboardHeader.includeHonorary,
    syncMembershipCategoryWithHeader,
    bumpMembershipDashboardApply,
  ]);

  if (variant !== "inline" || !isMembershipDashboard) {
    return null;
  }

  return (
    <div className="exec-dashboard-header-controls exec-dashboard-header-controls--inline">
      <FilterSelectChip
        label="Month"
        value={membershipDashboardHeader.month}
        options={MEMBERSHIP_MONTH_OPTIONS}
        onChange={(month) => applyHeaderChange({ month })}
        className="exec-dashboard-filter-chip--month"
      />
      <FilterSelectChip
        label="Year"
        value={membershipDashboardHeader.year}
        options={yearOptions}
        onChange={(year) => applyHeaderChange({ year })}
      />
      <FilterCheckboxChip
        label="Student"
        checked={membershipDashboardHeader.includeStudents}
        onChange={(includeStudents) => applyHeaderChange({ includeStudents })}
      />
      <FilterCheckboxChip
        label="Honorary"
        checked={membershipDashboardHeader.includeHonorary}
        onChange={(includeHonorary) => applyHeaderChange({ includeHonorary })}
      />
    </div>
  );
}
