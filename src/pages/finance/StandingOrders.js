import {useEffect} from "react";
import TableComponent from "../../component/common/TableComponent";
// import { tableData } from "../../Data";
import { getAllBatches } from "../../features/BatchesSlice";
import { useSelector, useDispatch } from "react-redux";
import moment from 'moment'
const StandingOrders = () => {
  const dispatch = useDispatch();
  const { batches, batchesloading, batcheserror } = useSelector((state) => state.batches);

  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  // Filter batches where PaymentType is "Cheque"
  const chequeBatches = batches.filter(batch => batch.PaymentType === "Standing Orders");

  // Convert & format date fields for cheque batches only
  const formattedData = chequeBatches.map((item) => ({
    ...item,
    batchDate: moment(item.batchDate).format("DD/MM/YYYY"),
    createdAt: moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
  }));
  return (
    <div style={{ padding: 16 }}>
      <TableComponent data={formattedData} screenName="Batches" />
    </div>
  );
};

export default StandingOrders;


