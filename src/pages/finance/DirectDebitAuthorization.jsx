import React, { useEffect, useState, useCallback } from "react";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { filterPaymentForms } from "../../api/paymentFormApi";
import PaymentFormDetailDrawer from "../../component/paymentForms/PaymentFormDetailDrawer";
import { formatIbanDisplay } from "../../utils/iban";
import { message } from "antd";

const DirectDebitAuthorization = () => {
  const { columns } = useTableColumns();
  const tableColumns = columns["DirectDebitAuthorization"];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await filterPaymentForms({
        formType: "DD_MANDATE",
        page: 1,
        limit: 500,
      });
      const items = result.paymentForms || [];
      setData(
        items.map((row, i) => ({
          key: row._id || String(i),
          _id: row._id,
          id: row.membershipNumber,
          accountName: row.memberFullName || "—",
          bankName: "—",
          iban: formatIbanDisplay(row.directDebitMandate?.debtorIbanDisplay) || "—",
          status: row.isAuthorized ? "Active" : row.status,
          dateAuthorized: row.updatedAt
            ? new Date(row.updatedAt).toISOString().slice(0, 10)
            : "—",
        })),
      );
    } catch {
      message.error("Could not load direct debit authorisations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <MyTable
        dataSource={data}
        columns={tableColumns}
        loading={loading}
        selection={true}
        selectionType="checkbox"
        onRowClick={(record) => {
          if (record._id) {
            setDetailId(record._id);
            setDetailOpen(true);
          }
        }}
      />
      <PaymentFormDetailDrawer
        open={detailOpen}
        formId={detailId}
        onClose={() => {
          setDetailOpen(false);
          setDetailId(null);
        }}
        onUpdated={load}
      />
    </div>
  );
};

export default DirectDebitAuthorization;
