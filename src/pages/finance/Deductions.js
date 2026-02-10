import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { getAllBatchDetails } from "../../features/profiles/BatchDetailsSlice";
import dayjs from "dayjs";

const Deductions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { columns } = useTableColumns();
  const { allBatches, allBatchesLoading } = useSelector((state) => state.batchDetails);

  useEffect(() => {
    dispatch(getAllBatchDetails());
  }, [dispatch]);

  const rawColumns = columns["Batches"] || [];

  // Add click functionality to Batch Name column
  const tableColumns = rawColumns.map((col) => {
    if (col.dataIndex === "batchName") {
      return {
        ...col,
        render: (text, record) => (
          <span
            style={{ color: "#0052CC", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
            onClick={() => navigate(`/BatchMemberSummary/${record._id}`, { state: { batchName: text } })}
          >
            {text || "Unnamed Batch"}
          </span>
        ),
      };
    }
    return col;
  });

  // Map API data to match table columns
  const formattedData = allBatches.map((item) => ({
    ...item,
    key: item._id,
    batchName: item.description,
    batchDate: item.date ? dayjs(item.date).format("DD/MM/YYYY") : "-",
    batchStatus: item.batchStatus, // Fallback for status
    createdAt: item.createdAt ? dayjs(item.createdAt).format("DD/MM/YYYY HH:mm") : "-",
    createdBy: item.createdBy,
    Count: (item.batchPayments?.length || 0) + (item.batchExceptions?.length || 0),
    PaymentType: item.type,
  }));

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <MyTable
        dataSource={formattedData}
        columns={tableColumns}
        loading={allBatchesLoading}
      />
    </div>
  );
};

export default Deductions;
