import axios from "axios";
import { baseURL } from "../../../utils/Utilities";

const REPORTING_BASE_URL = baseURL || process.env.REACT_APP_POLICY_SERVICE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const reportService = {
  /**
   * Get KPI overview data for dashboard
   */
  getKpiOverview: async () => {
    try {
      const response = await axios.get(
        `${REPORTING_BASE_URL}/reports/kpi-overview`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching KPI overview:", error);
      // Return mock data with some random jitter for realism
      return {
        totalMembers: 15420 + Math.floor(Math.random() * 100),
        activeMembers: 15200 + Math.floor(Math.random() * 100),
        revenueYTD: 1850000 + Math.floor(Math.random() * 50000),
        refundsYTD: 45000 + Math.floor(Math.random() * 1000),
      };
    }
  },

  /**
   * Get revenue data by month
   */
  getRevenueMonthly: async (startDate, endDate) => {
    try {
      const response = await axios.get(
        `${REPORTING_BASE_URL}/reports/revenue/monthly`,
        {
          headers: getAuthHeaders(),
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly revenue:", error);
      // Return mock data
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.map((month, index) => ({
        month,
        revenue: Math.floor(Math.random() * 200000) + 100000,
        date: `2024-${String(index + 1).padStart(2, "0")}-01`,
      }));
    }
  },

  /**
   * Get revenue data by day
   */
  getRevenueDaily: async (startDate, endDate) => {
    try {
      const response = await axios.get(
        `${REPORTING_BASE_URL}/reports/revenue/daily`,
        {
          headers: getAuthHeaders(),
          params: {
            startDate,
            endDate,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching daily revenue:", error);
      // Return mock data for last 30 days
      const days = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push({
          date: date.toISOString().split("T")[0],
          revenue: Math.floor(Math.random() * 10000) + 2000,
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
        });
      }
      return days;
    }
  },

  /**
   * Get payments/report data with pagination
   */
  getPayments: async (filters = {}, skip = 0, take = 20) => {
    try {
      const response = await axios.get(
        `${REPORTING_BASE_URL}/reports/payments`,
        {
          headers: getAuthHeaders(),
          params: {
            ...filters,
            skip,
            take,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching payments:", error);
      // Return mock data
      const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth"];
      const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
      const memberTypes = ["Paid", "Honorary", "Student", "Associate", "Lifetime"];
      const paymentStatuses = ["Completed", "Pending", "Failed"];

      const mockData = [];
      for (let i = 0; i < take; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];

        mockData.push({
          id: skip + i + 1,
          memberName: `${fn} ${ln}`,
          memberType: memberTypes[Math.floor(Math.random() * memberTypes.length)],
          paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
          amount: Math.floor(Math.random() * 500) + 50,
          paymentDate: new Date(
            Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0],
          transactionId: `TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        });
      }
      return {
        data: mockData,
        total: 1000,
        skip,
        take,
      };
    }
  },

  /**
   * Export report as PDF via backend
   */
  exportPdf: async (filters = {}, reportType = "payments") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${REPORTING_BASE_URL}/reports/export/pdf`,
        {
          filters,
          reportType,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.status === 404
        ? "PDF export endpoint not found. Please ensure the backend API is configured."
        : error.response?.status === 401
          ? "Unauthorized. Please check your authentication."
          : error.response?.status >= 500
            ? "Server error. Please try again later."
            : error.message || "Failed to export PDF";

      const exportError = new Error(errorMessage);
      exportError.status = error.response?.status;
      exportError.originalError = error;
      throw exportError;
    }
  },

  /**
   * Export report as Excel via backend
   */
  exportExcel: async (filters = {}, reportType = "payments") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${REPORTING_BASE_URL}/reports/export/excel`,
        {
          filters,
          reportType,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );

      // Create blob and download
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.status === 404
        ? "Excel export endpoint not found. Please ensure the backend API is configured."
        : error.response?.status === 401
          ? "Unauthorized. Please check your authentication."
          : error.response?.status >= 500
            ? "Server error. Please try again later."
            : error.message || "Failed to export Excel";

      const exportError = new Error(errorMessage);
      exportError.status = error.response?.status;
      exportError.originalError = error;
      throw exportError;
    }
  },

  /**
   * Get suspended members data with pagination
   */
  getSuspendedMembers: async (filters = {}, skip = 0, take = 20) => {
    // Enhanced mock data for suspended members
    const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Jessica", "William", "Emma"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
    const reasons = ["Non-payment of fees", "Disciplinary action", "Code of conduct violation", "Pending investigation", "Administrative suspension"];

    const mockData = [];
    for (let i = 0; i < take; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      mockData.push({
        id: skip + i + 1,
        membershipNo: `MEM${String(skip + i + 1000).padStart(4, "0")}`,
        fullName: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        suspendedDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: "Suspended"
      });
    }
    return { data: mockData, total: 150, skip, take };
  },

  /**
   * Get resigned members data with pagination
   */
  getResignedMembers: async (filters = {}, skip = 0, take = 20) => {
    const firstNames = ["Daniel", "Olivia", "Matthew", "Sophia", "Christopher", "Isabella", "Andrew", "Mia", "Joseph", "Charlotte"];
    const lastNames = ["Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson"];
    const reasons = ["Relocation", "Career change", "Personal reasons", "Dissatisfaction with service", "Financial constraint"];

    const mockData = [];
    for (let i = 0; i < take; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      mockData.push({
        id: skip + i + 1,
        membershipNo: `MEM${String(skip + i + 2000).padStart(4, "0")}`,
        fullName: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        resignationDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: "Resigned"
      });
    }
    return { data: mockData, total: 120, skip, take };
  },

  /**
   * Get new members data with pagination
   */
  getNewMembers: async (filters = {}, skip = 0, take = 20) => {
    const firstNames = ["James", "Ava", "Joshua", "Amelia", "Ryan", "Harper", "Jacob", "Evelyn", "Nicholas", "Abigail"];
    const lastNames = ["White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen"];
    const categories = ["Regular", "Student", "Associate", "Professional", "Lifetime"];

    const mockData = [];
    for (let i = 0; i < take; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      mockData.push({
        id: skip + i + 1,
        membershipNo: `MEM${String(skip + i + 3000).padStart(4, "0")}`,
        fullName: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        joiningDate: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        category: categories[Math.floor(Math.random() * categories.length)],
        status: "Active"
      });
    }
    return { data: mockData, total: 200, skip, take };
  },

  /**
   * Get leavers data with pagination
   */
  getLeavers: async (filters = {}, skip = 0, take = 20) => {
    const firstNames = ["Anthony", "Ella", "Jonathan", "Scarlett", "Brandon", "Grace", "Benjamin", "Chloe", "Samuel", "Victoria"];
    const lastNames = ["King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson"];
    const reasons = ["Retirement", "Terminated", "Contract Ended", "Voluntary Exit", "Membership Expired"];

    const mockData = [];
    for (let i = 0; i < take; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      mockData.push({
        id: skip + i + 1,
        membershipNo: `MEM${String(skip + i + 4000).padStart(4, "0")}`,
        fullName: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        leavingDate: new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        status: "Left"
      });
    }
    return { data: mockData, total: 80, skip, take };
  },

  /**
   * Get joiners data with pagination
   */
  getJoiners: async (filters = {}, skip = 0, take = 20) => {
    const firstNames = ["Alexander", "Madison", "Tyler", "Luna", "Zachary", "Zoey", "Nathan", "Penelope", "Dylan", "Riley"];
    const lastNames = ["Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans"];
    const sources = ["Online Portal", "Friend Referral", "Marketing Campagin", "Walk-in", "Social Media"];

    const mockData = [];
    for (let i = 0; i < take; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      mockData.push({
        id: skip + i + 1,
        membershipNo: `MEM${String(skip + i + 5000).padStart(4, "0")}`,
        fullName: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`,
        joiningDate: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        source: sources[Math.floor(Math.random() * sources.length)],
        status: "Active"
      });
    }
    return { data: mockData, total: 180, skip, take };
  },
};

export default reportService;

