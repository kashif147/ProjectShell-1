import {useEffect} from "react";
import TableComponent from '../../component/common/TableComponent'
import { getAllBatches } from "../../features/BatchesSlice";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";

function OnlinePayment() {
  const dispatch = useDispatch();
  dispatch(getAllBatches());
  const { batches, batchesloading, batcheserror } = useSelector((state) => state.batches);
  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  const chequeBatches = batches.filter(batch => batch.PaymentType === "Online Payments");

  const formattedData = chequeBatches.map((item) => ({
    ...item,
    batchDate: moment(item.batchDate).format("DD/MM/YYYY"),
    createdAt: moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
  }));
  return (
    <div>
       <TableComponent data={formattedData} screenName="Batches" />
    </div>
  )
}

export default OnlinePayment
