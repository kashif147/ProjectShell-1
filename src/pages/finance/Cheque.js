import React, { useEffect } from "react";
import MyTable from "../../component/common/MyTable";
import { getAllBatches } from "../../features/BatchesSlice";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import { useTableColumns } from "../../context/TableColumnsContext ";

const Cheque = () => {
  const dispatch = useDispatch();
  const { batches, batchesloading } = useSelector((state) => state.batches);
  const { columns } = useTableColumns();
  const tableColumns = columns["Cheque"] || [];

  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  const chequeBatches = batches.filter(batch => batch.PaymentType === "Cheque");

  const formattedData = chequeBatches.map((item, index) => ({
    ...item,
    key: item.id || item._id || index,
    batchDate: dayjs(item.batchDate).format("DD/MM/YYYY"),
    createdAt: dayjs(item.createdAt).format("DD/MM/YYYY HH:mm"),
  }));

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <MyTable
        dataSource={formattedData}
        columns={tableColumns}
        loading={batchesloading}
      />
    </div>
  );
};

export default Cheque;
