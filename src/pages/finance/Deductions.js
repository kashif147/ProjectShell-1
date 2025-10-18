import {useEffect} from "react";
import TableComponent from "../../component/common/TableComponent";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";
import { getAllBatches } from "../../features/BatchesSlice";

function Deductions() {
    const dispatch = useDispatch();
    dispatch(getAllBatches());
    const { batches, batchesloading, batcheserror } = useSelector((state) => state.batches);
    useEffect(() => {
      dispatch(getAllBatches());
    }, [dispatch]);
  
    const chequeBatches = batches.filter(batch => batch.PaymentType === "Deductions");
  
    const formattedData = chequeBatches.map((item) => ({
      ...item,
      batchDate: moment(item.batchDate).format("DD/MM/YYYY"),
      createdAt: moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
    }));
  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent data={formattedData} screenName="Batches" />
    </div>
  );
}

export default Deductions;


