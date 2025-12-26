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
      // Return mock data for development
      return {
        totalMembers: 15420,
        activeMembers: 15200,
        revenueYTD: 1850000,
        refundsYTD: 45000,
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
      const mockData = [];
      for (let i = 0; i < take; i++) {
        mockData.push({
          id: skip + i + 1,
          memberName: `Member ${skip + i + 1}`,
          memberType: ["Paid", "Honorary", "Student"][
            Math.floor(Math.random() * 3)
          ],
          paymentStatus: ["Completed", "Pending", "Failed"][
            Math.floor(Math.random() * 3)
          ],
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
};

export default reportService;

