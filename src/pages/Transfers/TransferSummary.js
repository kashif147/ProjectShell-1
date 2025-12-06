import React, { useEffect } from "react";

import TableComponent from "../../component/common/TableComponent";
import { getTransferRequest } from "../../features/profiles/TransferRequest";
import { useDispatch, useSelector } from "react-redux"
function TransferSummary() {
  const { data, loading, error } = useSelector((state) => state.transferRequest);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getTransferRequest());
  }, [])
  console.log("Transfer Request Page", data?.data);
  const transferData = data?.data || []
  const transferDataSource = []

  return (
    <div className="">
      <TableComponent data={transferData} screenName="Transfer" redirect="/Details" />
    </div>
  );
}

export default TransferSummary;