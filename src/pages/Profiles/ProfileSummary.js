import { useEffect } from "react";
import { useTableColumns } from "../../context/TableColumnsContext ";
import TableComponent from "../../component/common/TableComponent";
import { useSelector, useDispatch } from "react-redux";
import { getAllProfiles,searchProfiles } from "../../features/profiles/ProfileSlice";
import { use } from "react";

function ProfileSummary() {
  // const{gridData} = useTableColumns()
  const dispatch = useDispatch();
  const { results, loading, error } = useSelector((state) => state.profile);
 
  useEffect(() => {
    dispatch(getAllProfiles());
  }, [dispatch]);
  console.log("Profiles from Redux Store:", results);
  return (
    <div className="" style={{ width: "100%" }}>
      <TableComponent
      isGrideLoading={loading}
        data={results}
        screenName="Profile"
        redirect="/Details"
      />
    </div>
  );
}
export default ProfileSummary;
