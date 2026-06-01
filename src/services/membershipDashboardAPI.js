import reportingApi from "./reportingApi";

/**
 * Membership dashboard — backed by reporting-service POST /dashboard/membership
 */
export const membershipDashboardAPI = {
  getDashboardStats: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data;
  },

  getMembershipByCategory: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data.categoryData || [];
  },

  getMembershipByGrade: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data.gradeData || [];
  },

  getMembershipBySection: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data.sectionData || [];
  },

  getMembershipByBranch: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data.branchData || [];
  },

  getMembershipByRegion: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data.regionData || [];
  },

  getMembershipByWorkLocation: async (filters = {}) => {
    const data = await reportingApi.getMembershipDashboard(filters);
    return data.workLocationData || [];
  },
};

export default membershipDashboardAPI;
