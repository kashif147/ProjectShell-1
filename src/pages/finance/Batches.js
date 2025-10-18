import { useEffect } from "react";
import TableComponent from "../../component/common/TableComponent";
import { getAllBatches } from "../../features/BatchesSlice";
import moment from "moment";
import { useSelector, useDispatch } from "react-redux";

function Batches() {
  // Get all batches using the function
  const dispatch = useDispatch();
  dispatch(getAllBatches());
  const { batches, batchesloading, batcheserror } = useSelector((state) => state.batches);
  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);
  const allBatches = getAllBatches();

  // Convert & format date fields
  const formattedData = batches.map((item) => ({
    ...item,
    batchDate: moment(item.batchDate).format("DD/MM/YYYY"),
    createdAt: moment(item.createdAt).format("DD/MM/YYYY HH:mm"),
  }));

  return (
    <div style={{ width: "100%" }}>
      <TableComponent data={formattedData} screenName="Batches" isGrideLoading={batchesloading} />
    </div>
  );
}

export default Batches;