import { useEffect, useState, useCallback } from "react";
import TableComponent from "../../component/common/TableComponent";
import { useSelector, useDispatch } from "react-redux";
import { Spin } from "antd";
import { getProfilesWithFilter } from "../../features/profiles/ProfileSlice";
import { useAuthorization } from "../../context/AuthorizationContext";
import { useSelectedIds } from "../../context/SelectedIdsContext";

function ProfileSummary() {
  const dispatch = useDispatch();
  const { hasPermission } = useAuthorization();
  const canCampaign = hasPermission("communication:write");
  const { setSelectedIds } = useSelectedIds();
  const { results, loading } = useSelector((state) => state.profile);
  const { activeTemplateId } = useSelector((state) => state.activeTemplate);
  const { templatesFetching: templatesLoading } = useSelector(
    (state) => state.templateFiltersColumnApi,
  );
  const { isInitialized, currentTemplateId } = useSelector(
    (state) => state.applicationWithFilter,
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectionChange = useCallback(
    (keys) => {
      setSelectedRowKeys(keys || []);
      setSelectedIds(keys || []);
    },
    [setSelectedIds],
  );

  useEffect(() => {
    if (!isInitialized || templatesLoading) return;
    dispatch(
      getProfilesWithFilter({
        templateId: currentTemplateId || activeTemplateId || "",
        page: 1,
        limit: 500,
      }),
    );
  }, [
    dispatch,
    currentTemplateId,
    activeTemplateId,
    isInitialized,
    templatesLoading,
  ]);

  useEffect(() => {
    return () => {
      setSelectedIds([]);
      setSelectedRowKeys([]);
    };
  }, [setSelectedIds]);

  if (!isInitialized || templatesLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "50px",
        }}
      >
        <Spin tip="Initializing Template...">
          <div style={{ minHeight: 200, width: "100%" }} />
        </Spin>
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
        selectedRowKeys={selectedRowKeys}
        onSelectionChange={onSelectionChange}
        selectionType="checkbox"
        enableRowSelection={!!canCampaign}
      />
    </div>
  );
}
export default ProfileSummary;
