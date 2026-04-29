// API service for membership dashboard data
// Replace with actual API endpoints

function activeDashboardFilterCount(filters) {
  if (!filters || typeof filters !== "object") return 0;
  return Object.values(filters).filter(
    (v) => Array.isArray(v) && v.length > 0
  ).length;
}

function mockScaleFactor(filters) {
  const n = activeDashboardFilterCount(filters);
  if (n === 0) return 1;
  return Math.max(0.55, 1 - n * 0.07);
}

function scaleStats(base, filters) {
  const f = mockScaleFactor(filters);
  if (f === 1) return base;
  const out = { ...base };
  Object.keys(out).forEach((k) => {
    const v = out[k];
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = Math.round(v * f);
    }
  });
  return out;
}

function scaleRows(rows, filters, key) {
  const f = mockScaleFactor(filters);
  if (f === 1) return rows;
  return rows.map((r) => ({
    ...r,
    [key]: Math.round((r[key] || 0) * f),
  }));
}

export const membershipDashboardAPI = {
  // Get dashboard overview statistics
  getDashboardStats: async (filters = {}) => {
    const base = {
      totalActive: 15420,
      newJoiners: 245,
      leavers: 89,
      paidMembers: 12350,
      honoraryMembers: 2150,
      studentMembers: 920,
      totalActiveYTD: 15420,
      totalActiveLY: 14850,
      newJoinersYTD: 2450,
      newJoinersLY: 2100,
      leaversYTD: 890,
      leaversLY: 750,
      paidMembersYTD: 12350,
      paidMembersLY: 11800,
      honoraryMembersYTD: 2150,
      honoraryMembersLY: 2000,
      studentMembersYTD: 920,
      studentMembersLY: 1050,
      totalActiveThisMonth: 15420,
      totalActiveLastMonth: 15200,
      newJoinersThisMonth: 245,
      newJoinersLastMonth: 180,
      leaversThisMonth: 89,
      leaversLastMonth: 120,
      paidMembersThisMonth: 12350,
      paidMembersLastMonth: 12100,
      honoraryMembersThisMonth: 2150,
      honoraryMembersLastMonth: 2100,
      studentMembersThisMonth: 920,
      studentMembersLastMonth: 1000,
    };
    return scaleStats(base, filters);
  },

  getMembershipByCategory: async (filters = {}) => {
    const rows = [
      { name: "Paid Members", value: 12350, color: "#8884d8" },
      { name: "Honorary Members", value: 2150, color: "#82ca9d" },
      { name: "Student Members", value: 920, color: "#ffc658" },
      { name: "Other", value: 0, color: "#ff7300" },
    ];
    return scaleRows(rows, filters, "value");
  },

  getMembershipByGrade: async (filters = {}) => {
    const rows = [
      { name: "Grade A", count: 4500 },
      { name: "Grade B", count: 3200 },
      { name: "Grade C", count: 2800 },
      { name: "Grade D", count: 2100 },
      { name: "Grade E", count: 1800 },
      { name: "Grade F", count: 1020 },
    ];
    return scaleRows(rows, filters, "count");
  },

  getMembershipBySection: async (filters = {}) => {
    const rows = [
      { name: "Administration", count: 3200 },
      { name: "Operations", count: 2800 },
      { name: "Finance", count: 2100 },
      { name: "HR", count: 1800 },
      { name: "IT", count: 1500 },
      { name: "Legal", count: 1200 },
      { name: "Marketing", count: 1000 },
      { name: "Research", count: 820 },
      { name: "Training", count: 600 },
      { name: "Security", count: 400 },
    ];
    return scaleRows(rows, filters, "count");
  },

  getMembershipByBranch: async (filters = {}) => {
    const rows = [
      { name: "Dublin", count: 4500 },
      { name: "Cork", count: 3200 },
      { name: "Galway", count: 2800 },
      { name: "Limerick", count: 2100 },
      { name: "Waterford", count: 1800 },
      { name: "Sligo", count: 1020 },
    ];
    return scaleRows(rows, filters, "count");
  },

  getMembershipByRegion: async (filters = {}) => {
    const rows = [
      { name: "Leinster", count: 6500 },
      { name: "Munster", count: 4200 },
      { name: "Connacht", count: 2800 },
      { name: "Ulster", count: 1920 },
    ];
    return scaleRows(rows, filters, "count");
  },

  getMembershipByWorkLocation: async (filters = {}) => {
    const rows = [
      { name: "Office", count: 8500 },
      { name: "Remote", count: 4200 },
      { name: "Hybrid", count: 2720 },
    ];
    return scaleRows(rows, filters, "count");
  },
};

export default membershipDashboardAPI;
