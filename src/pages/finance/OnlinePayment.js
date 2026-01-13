import React, { useEffect } from "react";
import MyTable from "../../component/common/MyTable";
import { getAllBatches } from "../../features/BatchesSlice";
import dayjs from "dayjs";
import { useSelector, useDispatch } from "react-redux";
import { useTableColumns } from "../../context/TableColumnsContext ";

const OnlinePayment = () => {
  const dispatch = useDispatch();
  const { batches, batchesloading } = useSelector((state) => state.batches);
  const { columns } = useTableColumns();
  const tableColumns = columns["onlinePayment"] || [];

  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  const onlineBatches = batches.filter(batch => batch.PaymentType === "Online Payments");

  const formattedData = onlineBatches.map((item, index) => ({
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

export default OnlinePayment;
