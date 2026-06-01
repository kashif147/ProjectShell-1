import reportingApi from "../../../services/reportingApi";

/** Matches reporting-service dashboard shape: `{ filters, offset, limit }`. */
function listingBody(filters = {}, skip = 0, take = 500) {
  const {
    startDate,
    endDate,
    category,
    includeStudents,
    includeHonorary,
    memberType,
    paymentStatus,
    membershipStatuses,
    ...rest
  } = filters;

  const filterPayload = {
    ...(startDate != null && startDate !== "" && { startDate }),
    ...(endDate != null && endDate !== "" && { endDate }),
    ...(category != null && category !== "" && { category }),
    ...(includeStudents != null && { includeStudents }),
    ...(includeHonorary != null && { includeHonorary }),
    ...(memberType != null && memberType !== "" && { memberType }),
    ...(paymentStatus != null && paymentStatus !== "" && { paymentStatus }),
    ...(membershipStatuses != null && { membershipStatuses }),
    ...rest,
  };

  return {
    filters: filterPayload,
    offset: skip,
    limit: take,
  };
}

function normalizePresetResponse(raw, skip = 0, take = 500) {
  if (!raw) {
    return { data: [], total: 0, skip, take };
  }
  const rows = raw.rows ?? raw.data ?? raw.items ?? [];
  const total =
    raw.total ??
    raw.count ??
    raw.totalCount ??
    (Array.isArray(rows) ? rows.length : 0);
  return {
    data: Array.isArray(rows) ? rows : [],
    total: Number(total) || 0,
    skip,
    take,
  };
}

async function fetchPresetReport(reportType, filters, skip, take) {
  const raw = await reportingApi.getPresetReport(
    reportType,
    listingBody(filters, skip, take),
  );
  return normalizePresetResponse(raw, skip, take);
}

export const reportService = {
  getNewMembers: async (filters = {}, skip = 0, take = 500) => {
    return fetchPresetReport("new-members", filters, skip, take);
  },

  getJoiners: async (filters = {}, skip = 0, take = 500) => {
    return fetchPresetReport("joiners", filters, skip, take);
  },

  getResignedMembers: async (filters = {}, skip = 0, take = 500) => {
    return fetchPresetReport("resigned", filters, skip, take);
  },

  getCancelledMembers: async (filters = {}, skip = 0, take = 500) => {
    return fetchPresetReport("cancelled", filters, skip, take);
  },

  getSuspendedMembers: async (filters = {}, skip = 0, take = 500) => {
    return fetchPresetReport("suspended", filters, skip, take);
  },

  getLeavers: async (filters = {}, skip = 0, take = 500) => {
    const body = listingBody(
      {
        ...filters,
        membershipStatuses: ["Cancelled", "Resigned"],
      },
      skip,
      take,
    );
    return reportingApi.getMembershipListing(body).then((r) => ({
      data: (r.rows || []).map((row) => ({
        id: row.subscriptionId,
        membershipNo: row.membershipNo,
        fullName: row.fullName,
        leavingDate: row.cancelledAt || row.resignedAt,
        status: row.membershipStatus,
      })),
      total: r.total,
      skip,
      take,
    }));
  },

  getComparisonReport: (body) => reportingApi.getComparisonReport(body),

  getLiveStats: (body) => reportingApi.getLiveStats(body),

  exportPdf: async () => {
    throw new Error("PDF export is not configured for reporting-service yet");
  },

  exportExcel: async () => {
    throw new Error("Excel export is not configured for reporting-service yet");
  },
};

export default reportService;
