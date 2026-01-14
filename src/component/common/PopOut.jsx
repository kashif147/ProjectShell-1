import { useEffect } from "react";
import TableComponent from "../../component/common/TableComponent";
import { useDispatch, useSelector } from "react-redux";
import { getAllLookups } from "../../features/LookupsSlice";
function PopOut() {
  const dispatch = useDispatch();
  const { lookups, loading: lookupsLoading } = useSelector(
    (state) => state.lookups
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Only fetch if data doesn't exist and not already loading
    if (!lookupsLoading && (!lookups || lookups.length === 0)) {
      dispatch(getAllLookups());
    }
  }, [dispatch, lookups, lookupsLoading]);
  const targetId = "67f6297617f0ecf3dbf79f12";

  const filtered = lookups?.filter(
    (item) => item.lookuptypeId?._id === targetId
  );
  console.log(filtered, "pe");
  return (
    <TableComponent data={filtered} screenName="Popout" />
    // <>
    // <h1>tesst</h1>
    // </>
  );
}

export default PopOut;
