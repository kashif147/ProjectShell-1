import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { resolveStatisticsReportPeriod } from "./statisticsReportUtils";

dayjs.extend(utc);

const DEFAULT_CATEGORIES = [
  "Hospital (all grades)",
  "Community / primary care",
  "Student midwife",
  "Retired associate",
  "Private nursing home",
  "Agency / locum",
];

function categoryRow(name, stats) {
  const openingActive = stats.openingActive ?? 0;
  const newJoin = stats.newJoin ?? 0;
  const rejoin = stats.rejoin ?? 0;
  const joined = stats.joined ?? newJoin + rejoin;
  const reinstatedFromSuspended = stats.reinstatedFromSuspended ?? 0;
  const reinstatedFromArchived = stats.reinstatedFromArchived ?? 0;
  const reinstatements = reinstatedFromSuspended + reinstatedFromArchived;
  const resigned = stats.resigned ?? 0;
  const cancelled = stats.cancelled ?? stats.lapsed ?? 0;
  const leavers = resigned + cancelled;
  const closingActive =
    stats.closingActive ??
    openingActive + joined + reinstatements - leavers;

  return {
    name,
    openingActive,
    newJoin,
    rejoin,
    joined,
    reinstatements,
    reinstatedFromSuspended,
    reinstatedFromArchived,
    joiners: joined + reinstatements,
    resigned,
    cancelled,
    lapsed: cancelled,
    leavers,
    closingActive,
    calculatedClosing: closingActive,
    variance: 0,
    balances: true,
    suspended: stats.suspended ?? 0,
    archived: stats.archived ?? 0,
  };
}

function locationRow(name, stats) {
  const newJoin = stats.newJoin ?? 0;
  const rejoin = stats.rejoin ?? 0;
  const joined = stats.joined ?? newJoin + rejoin;
  const reinstatedFromSuspended = stats.reinstatedFromSuspended ?? 0;
  const reinstatedFromArchived = stats.reinstatedFromArchived ?? 0;
  const reinstate = reinstatedFromSuspended + reinstatedFromArchived;
  const resigned = stats.resigned ?? 0;
  const cancelled = stats.cancelled ?? 0;
  return {
    name,
    newJoin,
    rejoin,
    joined,
    reinstate,
    reinstateFromSuspended: reinstatedFromSuspended,
    reinstateFromArchived: reinstatedFromArchived,
    reinstatedFromSuspended,
    reinstatedFromArchived,
    joiners: joined + reinstate,
    newTotal: joined + reinstate,
    resigned,
    cancelled,
    leaversTotal: resigned + cancelled,
  };
}

const LOCATION_MOVEMENT_KEYS = [
  "newJoin",
  "rejoin",
  "reinstatedFromSuspended",
  "reinstatedFromArchived",
  "resigned",
  "cancelled",
];

function applyDerivedLocationFields(row) {
  const joined = (row.newJoin || 0) + (row.rejoin || 0);
  const reinstatedFromSuspended = row.reinstatedFromSuspended || 0;
  const reinstatedFromArchived = row.reinstatedFromArchived || 0;
  const reinstate = reinstatedFromSuspended + reinstatedFromArchived;
  const joiners = joined + reinstate;
  row.joined = joined;
  row.reinstate = reinstate;
  row.reinstateFromSuspended = reinstatedFromSuspended;
  row.reinstateFromArchived = reinstatedFromArchived;
  row.joiners = joiners;
  row.newTotal = joiners;
  row.leaversTotal = (row.resigned || 0) + (row.cancelled || 0);
  return row;
}

function sumLocationRows(rows) {
  const totals = {
    newJoin: 0,
    rejoin: 0,
    joined: 0,
    reinstate: 0,
    reinstateFromSuspended: 0,
    reinstateFromArchived: 0,
    reinstatedFromSuspended: 0,
    reinstatedFromArchived: 0,
    joiners: 0,
    newTotal: 0,
    resigned: 0,
    cancelled: 0,
    leaversTotal: 0,
  };
  for (const row of rows) {
    totals.newJoin += row.newJoin || 0;
    totals.rejoin += row.rejoin || 0;
    totals.joined += row.joined ?? (row.newJoin || 0) + (row.rejoin || 0);
    totals.reinstate += row.reinstate || 0;
    totals.reinstateFromSuspended += row.reinstateFromSuspended || 0;
    totals.reinstateFromArchived += row.reinstateFromArchived || 0;
    totals.reinstatedFromSuspended += row.reinstatedFromSuspended || 0;
    totals.reinstatedFromArchived += row.reinstatedFromArchived || 0;
    totals.joiners += row.joiners || row.newTotal || 0;
    totals.newTotal += row.newTotal || 0;
    totals.resigned += row.resigned || 0;
    totals.cancelled += row.cancelled || 0;
    totals.leaversTotal += row.leaversTotal || 0;
  }
  return totals;
}

function sumCategoryMovementTotals(categoryRows = []) {
  return categoryRows.reduce(
    (acc, row) => {
      LOCATION_MOVEMENT_KEYS.forEach((key) => {
        const value =
          key === "cancelled"
            ? row.cancelled ?? row.lapsed ?? 0
            : row[key] || 0;
        acc[key] += Number(value) || 0;
      });
      return acc;
    },
    Object.fromEntries(LOCATION_MOVEMENT_KEYS.map((key) => [key, 0])),
  );
}

function scaleLocationLeavesToTargets(leaves, targetTotals) {
  if (!leaves.length) return;

  const rawTotals = sumLocationRows(leaves);
  for (const key of LOCATION_MOVEMENT_KEYS) {
    const raw = rawTotals[key] || 0;
    const target = targetTotals[key] || 0;
    if (raw === 0) {
      if (target === 0) continue;
      const base = Math.floor(target / leaves.length);
      let remainder = target;
      leaves.forEach((row, index) => {
        const value = index === leaves.length - 1 ? remainder : base;
        row[key] = value;
        remainder -= value;
      });
      continue;
    }

    let allocated = 0;
    leaves.forEach((row, index) => {
      if (index === leaves.length - 1) {
        row[key] = target - allocated;
        return;
      }
      const value = Math.round(((row[key] || 0) * target) / raw);
      row[key] = value;
      allocated += value;
    });
  }

  leaves.forEach(applyDerivedLocationFields);
}

function recomputeLocationHierarchyTotals(hierarchy) {
  for (const region of hierarchy.groups || []) {
    for (const branch of region.branches || []) {
      branch.totals = sumLocationRows(branch.rows || []);
    }
    region.totals = sumLocationRows(
      (region.branches || []).flatMap((branch) => branch.rows || []),
    );
  }
  hierarchy.grandTotal = sumLocationRows(
    (hierarchy.groups || []).flatMap((region) =>
      (region.branches || []).flatMap((branch) => branch.rows || []),
    ),
  );
  return hierarchy;
}

/** Keep sample location grand total aligned with membership category totals. */
export function syncLocationHierarchyToCategoryRows(hierarchy, categoryRows = []) {
  if (!hierarchy?.groups?.length || !categoryRows.length) {
    return hierarchy;
  }

  const leaves = hierarchy.groups.flatMap((region) =>
    (region.branches || []).flatMap((branch) => branch.rows || []),
  );
  const targetTotals = sumCategoryMovementTotals(categoryRows);
  scaleLocationLeavesToTargets(leaves, targetTotals);
  return recomputeLocationHierarchyTotals(hierarchy);
}

function buildSampleLocationHierarchy() {
  const easternBranchA = {
    branch: "Dublin East Coast Branch",
    rows: [
      locationRow("Beaumont Hospital", {
        newJoin: 42,
        rejoin: 8,
        reinstatedFromSuspended: 2,
        reinstatedFromArchived: 1,
        resigned: 12,
        cancelled: 9,
      }),
      locationRow("Mater Misericordiae University Hospital", {
        newJoin: 38,
        rejoin: 5,
        reinstatedFromSuspended: 1,
        reinstatedFromArchived: 1,
        resigned: 10,
        cancelled: 7,
      }),
      locationRow("St Vincent's University Hospital", {
        newJoin: 31,
        rejoin: 4,
        reinstatedFromSuspended: 1,
        reinstatedFromArchived: 0,
        resigned: 8,
        cancelled: 6,
      }),
    ],
  };
  easternBranchA.totals = sumLocationRows(easternBranchA.rows);

  const easternBranchB = {
    branch: "Dublin South West Branch",
    rows: [
      locationRow("Tallaght University Hospital", {
        newJoin: 27,
        rejoin: 6,
        reinstatedFromSuspended: 1,
        reinstatedFromArchived: 1,
        resigned: 9,
        cancelled: 5,
      }),
      locationRow("Beacon Private Hospital", {
        newJoin: 14,
        rejoin: 2,
        reinstatedFromSuspended: 0,
        reinstatedFromArchived: 0,
        resigned: 4,
        cancelled: 3,
      }),
    ],
  };
  easternBranchB.totals = sumLocationRows(easternBranchB.rows);

  const westernBranch = {
    branch: "Galway Branch",
    rows: [
      locationRow("University Hospital Galway", {
        newJoin: 22,
        rejoin: 3,
        reinstatedFromSuspended: 1,
        reinstatedFromArchived: 0,
        resigned: 7,
        cancelled: 4,
      }),
      locationRow("Bon Secours Hospital (Galway)", {
        newJoin: 9,
        rejoin: 1,
        reinstatedFromSuspended: 0,
        reinstatedFromArchived: 0,
        resigned: 3,
        cancelled: 2,
      }),
    ],
  };
  westernBranch.totals = sumLocationRows(westernBranch.rows);

  const eastern = {
    region: "Dublin Mid Leinster",
    label: "Dublin Mid Leinster",
    branches: [easternBranchA, easternBranchB],
    totals: sumLocationRows([
      ...easternBranchA.rows,
      ...easternBranchB.rows,
    ]),
  };

  const western = {
    region: "Western",
    label: "Western",
    branches: [westernBranch],
    totals: sumLocationRows(westernBranch.rows),
  };

  const groups = [eastern, western];
  const grandTotal = sumLocationRows(
    groups.flatMap((g) => g.branches.flatMap((b) => b.rows)),
  );

  return {
    label: "Region / branch / work location",
    groups,
    grandTotal,
  };
}

function buildSampleCategoryRows(categoryNames = []) {
  const names =
    categoryNames.length > 0 ? categoryNames.slice(0, 8) : DEFAULT_CATEGORIES;

  const presets = [
    {
      openingActive: 18240,
      newJoin: 820,
      rejoin: 96,
      reinstatedFromSuspended: 28,
      reinstatedFromArchived: 16,
      resigned: 310,
      cancelled: 280,
      suspended: 12,
      archived: 4,
    },
    {
      openingActive: 6240,
      newJoin: 210,
      rejoin: 38,
      reinstatedFromSuspended: 11,
      reinstatedFromArchived: 7,
      resigned: 95,
      cancelled: 88,
      suspended: 3,
      archived: 1,
    },
    {
      openingActive: 1180,
      newJoin: 420,
      rejoin: 12,
      reinstatedFromSuspended: 4,
      reinstatedFromArchived: 2,
      resigned: 18,
      cancelled: 14,
      suspended: 0,
      archived: 0,
    },
    {
      openingActive: 8920,
      newJoin: 45,
      rejoin: 22,
      reinstatedFromSuspended: 5,
      reinstatedFromArchived: 3,
      resigned: 120,
      cancelled: 95,
      suspended: 8,
      archived: 6,
    },
    {
      openingActive: 2140,
      newJoin: 88,
      rejoin: 14,
      reinstatedFromSuspended: 3,
      reinstatedFromArchived: 2,
      resigned: 42,
      cancelled: 36,
      suspended: 2,
      archived: 0,
    },
    {
      openingActive: 960,
      newJoin: 64,
      rejoin: 9,
      reinstatedFromSuspended: 2,
      reinstatedFromArchived: 1,
      resigned: 28,
      cancelled: 22,
      suspended: 1,
      archived: 0,
    },
  ];

  return names.map((name, index) =>
    categoryRow(name, presets[index % presets.length]),
  );
}

function buildSampleSummary(categoryRows) {
  const totals = categoryRows.reduce(
    (acc, row) => ({
      openingActive: acc.openingActive + row.openingActive,
      newJoin: acc.newJoin + row.newJoin,
      rejoin: acc.rejoin + row.rejoin,
      joined: acc.joined + row.joined,
      reinstatements: acc.reinstatements + row.reinstatements,
      resigned: acc.resigned + row.resigned,
      lapsed: acc.lapsed + (row.cancelled ?? row.lapsed ?? 0),
      cancelled: acc.cancelled + (row.cancelled ?? row.lapsed ?? 0),
      leavers: acc.leavers + row.leavers,
      closingActive: acc.closingActive + row.closingActive,
    }),
    {
      openingActive: 0,
      newJoin: 0,
      rejoin: 0,
      joined: 0,
      reinstatements: 0,
      resigned: 0,
      lapsed: 0,
      cancelled: 0,
      leavers: 0,
      closingActive: 0,
    },
  );

  return {
    ...totals,
    calculatedClosing: totals.closingActive,
    variance: 0,
    balances: true,
    formula: "Opening + joined + reinstated − leavers = closing",
  };
}

/** Build a full statistics report payload for UI preview when live data is missing. */
export function buildSampleStatisticsReport({
  year,
  throughMonth = 12,
  categoryLabels = [],
} = {}) {
  const now = new Date();
  const reportYear = Number(year) || now.getUTCFullYear();
  const month = Math.min(Math.max(Number(throughMonth) || 12, 1), 12);
  const periodRange = resolveStatisticsReportPeriod({
    year: reportYear,
    throughMonth: month,
  });
  const openingDate = `${reportYear - 1}-12-31`;
  const closingDate = periodRange?.closingAsOfDate;

  const categoryRows = buildSampleCategoryRows(categoryLabels);
  const byLocation = syncLocationHierarchyToCategoryRows(
    buildSampleLocationHierarchy(),
    categoryRows,
  );

  return {
    reportTitle: "Statistics Report",
    year: reportYear,
    throughMonth: month,
    isSampleData: true,
    period: {
      opening: {
        asOfDate: openingDate,
        displayAsOfDate: periodRange?.openingAsOfDate,
        label: periodRange?.dateFrom,
        snapshotAvailable: true,
      },
      closing: {
        asOfDate: closingDate,
        label: periodRange?.dateTo,
        snapshotAvailable: true,
      },
      monthsIncluded: month,
    },
    summary: buildSampleSummary(categoryRows),
    breakdowns: {
      byMembershipCategory: {
        label: "Membership category",
        dimension: "membershipCategory",
        rows: categoryRows,
      },
      byLocation,
    },
  };
}

function hasReportContent(report) {
  const categoryRows = report?.breakdowns?.byMembershipCategory?.rows || [];
  const locationGroups = report?.breakdowns?.byLocation?.groups || [];
  return categoryRows.length > 0 || locationGroups.length > 0;
}

/** Return live report when it has rows; otherwise merge in sample breakdowns. */
export function withSampleStatisticsReportIfEmpty(
  report,
  { year, throughMonth, categoryLabels, skipSampleMerge = false } = {},
) {
  if (!report) {
    if (skipSampleMerge) return null;
    return buildSampleStatisticsReport({ year, throughMonth, categoryLabels });
  }

  if (hasReportContent(report)) {
    return report;
  }

  if (skipSampleMerge) {
    return report;
  }

  const sample = buildSampleStatisticsReport({ year, throughMonth, categoryLabels });
  const categoryRows =
    report.breakdowns?.byMembershipCategory?.rows?.length > 0
      ? report.breakdowns.byMembershipCategory.rows
      : sample.breakdowns.byMembershipCategory.rows;
  const byLocation = syncLocationHierarchyToCategoryRows(
    report.breakdowns?.byLocation?.groups?.length > 0
      ? report.breakdowns.byLocation
      : sample.breakdowns.byLocation,
    categoryRows,
  );

  return {
    ...report,
    isSampleData: true,
    summary:
      report.summary?.openingActive != null ? report.summary : sample.summary,
    breakdowns: {
      ...report.breakdowns,
      byMembershipCategory:
        report.breakdowns?.byMembershipCategory?.rows?.length > 0
          ? report.breakdowns.byMembershipCategory
          : sample.breakdowns.byMembershipCategory,
      byLocation,
    },
  };
}
