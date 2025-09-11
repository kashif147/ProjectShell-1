// API service for membership dashboard data
// Replace with actual API endpoints

export const membershipDashboardAPI = {
  // Get dashboard overview statistics
  getDashboardStats: async () => {
    // Always return mock data for development
    return {
      // Current month data
      totalActive: 15420,
      newJoiners: 245,
      leavers: 89,
      paidMembers: 12350,
      honoraryMembers: 2150,
      studentMembers: 920,

      // Year-to-date comparisons (cumulative from Jan to current month)
      totalActiveYTD: 15420,
      totalActiveLY: 14850,
      newJoinersYTD: 2450, // Fixed: should be cumulative YTD, not monthly
      newJoinersLY: 2100,
      leaversYTD: 890, // Fixed: should be cumulative YTD, not monthly
      leaversLY: 750,
      paidMembersYTD: 12350,
      paidMembersLY: 11800,
      honoraryMembersYTD: 2150,
      honoraryMembersLY: 2000,
      studentMembersYTD: 920,
      studentMembersLY: 1050,

      // This month vs last month comparisons
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
  },

  // Get membership data by category
  getMembershipByCategory: async () => {
    // Always return mock data for development
    return [
      { name: "Paid Members", value: 12350, color: "#8884d8" },
      { name: "Honorary Members", value: 2150, color: "#82ca9d" },
      { name: "Student Members", value: 920, color: "#ffc658" },
      { name: "Other", value: 0, color: "#ff7300" },
    ];
  },

  // Get membership data by grade
  getMembershipByGrade: async () => {
    // Always return mock data for development
    return [
      { name: "Grade A", count: 4500 },
      { name: "Grade B", count: 3200 },
      { name: "Grade C", count: 2800 },
      { name: "Grade D", count: 2100 },
      { name: "Grade E", count: 1800 },
      { name: "Grade F", count: 1020 },
    ];
  },

  // Get membership data by section
  getMembershipBySection: async () => {
    // Always return mock data for development
    return [
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
  },

  // Get membership data by branch
  getMembershipByBranch: async () => {
    // Always return mock data for development
    return [
      { name: "Dublin", count: 4500 },
      { name: "Cork", count: 3200 },
      { name: "Galway", count: 2800 },
      { name: "Limerick", count: 2100 },
      { name: "Waterford", count: 1800 },
      { name: "Sligo", count: 1020 },
    ];
  },

  // Get membership data by region
  getMembershipByRegion: async () => {
    // Always return mock data for development
    return [
      { name: "Leinster", count: 6500 },
      { name: "Munster", count: 4200 },
      { name: "Connacht", count: 2800 },
      { name: "Ulster", count: 1920 },
    ];
  },

  // Get membership data by work location
  getMembershipByWorkLocation: async () => {
    // Always return mock data for development
    return [
      { name: "Office", count: 8500 },
      { name: "Remote", count: 4200 },
      { name: "Hybrid", count: 2720 },
    ];
  },
};

export default membershipDashboardAPI;
