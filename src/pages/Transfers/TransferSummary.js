import React, { useEffect } from "react";
import dayjs from "dayjs";
import TableComponent from "../../component/common/TableComponent";
import { getTransferRequest } from "../../features/profiles/TransferRequest";
import { useDispatch, useSelector } from "react-redux"
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

function TransferSummary() {
  const { data, loading, error } = useSelector((state) => state.transferRequest);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getTransferRequest());
  }, []);
  
  console.log("Transfer Request Page", data?.data);
  
  const transferData = data?.data ? data.data.map(item => ({
    ...item,
    // Create fullName from forename and surname
    fullName: `${item.forename || ''} ${item.surname || ''}`.trim(),
    // Convert requestDate to local time and format as DD/MM/YYYY
    requestDate: item.requestDate 
      ? dayjs(item.requestDate).local().format("DD/MM/YYYY")
      : "",
    // If there are other date fields, format them too
    ...(item.createdAt && { 
      createdAt: dayjs(item.createdAt).local().format("DD/MM/YYYY HH:mm") 
    }),
    ...(item.updatedAt && { 
      updatedAt: dayjs(item.updatedAt).local().format("DD/MM/YYYY HH:mm") 
    }),
  })) : [];
  
  // Remove the empty array declaration since we're using transferData
  // const transferDataSource = []

  return (
    <div className="">
      <TableComponent 
        data={transferData} 
        isGrideLoading={loading} 
        screenName="Transfer" 
        redirect="/Details" 
      />
    </div>
  );
}

export default TransferSummary;