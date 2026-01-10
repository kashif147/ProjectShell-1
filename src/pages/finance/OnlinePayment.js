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

  const formattedData = []
  return (
    <div>
       <TableComponent data={formattedData} screenName="onlinePayment" />
    </div>
  )
}

export default OnlinePayment
