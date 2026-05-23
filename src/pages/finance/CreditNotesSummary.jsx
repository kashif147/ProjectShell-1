import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { message } from "antd";
import { useLocation } from "react-router-dom";
import TableComponent from "../../component/common/TableComponent";
import { getAccountServiceBaseUrl } from "../../config/serviceUrls";

const CreditNotesSummary = () => {
  const location = useLocation();
  const highlightDocNo = String(location.state?.highlightDocNo || "").trim();
  const filterMemberId = String(location.state?.memberId || "").trim();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCreditNotes = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = { limit: 500 };
      if (filterMemberId) params.memberId = filterMemberId;
      const response = await axios.get(
        `${getAccountServiceBaseUrl()}/journal/credit-notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params,
        },
      );

      const payload = response?.data?.data ?? response?.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const mappedRows = items.map((item, index) => {
        const docNo = item?.docNo || "";
        return {
          key: item?._id || docNo || `credit-note-${index}`,
          _id: item?._id,
          docNo,
          invoiceDocNo: item?.invoiceDocNo || "—",
          memberId: item?.memberId || "",
          amount: item?.amount ?? "-",
          status: item?.status || "—",
          effectiveDate: item?.effectiveDate || item?.date || null,
          reason: item?.reason || "",
          createdBy: item?.createdBy || "System",
          createdAt: item?.createdAt || null,
          highlight:
            Boolean(highlightDocNo) &&
            String(docNo).trim() === highlightDocNo,
        };
      });

      setRows(mappedRows);
    } catch (error) {
      console.error("Failed to fetch credit notes:", error);
      message.error("Failed to load credit notes");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filterMemberId, highlightDocNo]);

  useEffect(() => {
    fetchCreditNotes();
  }, [fetchCreditNotes]);

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <TableComponent
        data={rows}
        isGrideLoading={loading}
        screenName="CreditNotes"
      />
    </div>
  );
};

export default CreditNotesSummary;
