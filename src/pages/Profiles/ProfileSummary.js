import { useEffect } from "react";
import TableComponent from "../../component/common/TableComponent";
import { useSelector, useDispatch } from "react-redux";
import { Spin } from "antd";
import { getProfilesWithFilter } from "../../features/profiles/ProfileSlice";

function ProfileSummary() {
  const dispatch = useDispatch();
  const { results, loading } = useSelector((state) => state.profile);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { loading: templatesLoading } = useSelector((state) => state.templetefiltrsclumnapi);
  const { isInitialized } = useSelector((state) => state.applicationWithFilter);

  useEffect(() => {
    if (!activeTemplateId) return;
    dispatch(
      getProfilesWithFilter({
        templateId: activeTemplateId,
        page: 1,
        limit: 10,
      })
    );
  }, [dispatch, activeTemplateId]);

  if (!isInitialized || templatesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", padding: "50px" }}>
        <Spin tip="Initializing Template..." />
      </div>
    );
  }

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
