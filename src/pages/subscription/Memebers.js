import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import TableComponent from "../../component/common/TableComponent";
import { getSubscriptionsWithTemplate } from "../../features/subscription/subscriptionSlice";

function Members() {
    const dispatch = useDispatch();

    const {
        subscriptionsData,
        subscriptionLoading,
    } = useSelector((state) => state.subscription);
    const { activeTemplateId } = useSelector((state) => state.activeTemplate);
    const { isInitialized, currentTemplateId } = useSelector(
        (state) => state.applicationWithFilter,
    );
    const { templatesFetching: templatesLoading } = useSelector(
        (state) => state.templateFiltersColumnApi,
    );

    useEffect(() => {
        if (!isInitialized || templatesLoading) return;
        dispatch(
            getSubscriptionsWithTemplate({
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

    const data = useMemo(() => {
        if (!subscriptionsData?.data) return [];
        return subscriptionsData.data;
    }, [subscriptionsData]);

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
        <div style={{ width: "100%" }}>
            <TableComponent
                isGrideLoading={subscriptionLoading}
                data={data}
                screenName="Members"
            />
        </div>
    );
}

export default Members;
