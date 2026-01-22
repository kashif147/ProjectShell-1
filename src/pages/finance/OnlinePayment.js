import React, { useEffect } from "react";
import MyTable from "../../component/common/MyTable";
import { useTableColumns } from "../../context/TableColumnsContext ";
import { useDispatch, useSelector } from "react-redux";
import { fetchStripePayments } from "../../features/AccountSlice";

const OnlinePayment = () => {
  const { columns } = useTableColumns();
  const tableColumns = columns["onlinePayment"] || [];
  const dispatch = useDispatch();
  const { stripePayments, loading } = useSelector((state) => state.account);

  useEffect(() => {
    dispatch(fetchStripePayments());
  }, [dispatch]);

  return (
    <div style={{ width: "100%", padding: "0" }}>
      <MyTable
        dataSource={stripePayments}
        columns={tableColumns}
        loading={loading}
      />
    </div>
  );
};

export default OnlinePayment;
