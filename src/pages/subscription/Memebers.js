import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableComponent from "../../component/common/TableComponent";
import { getAllSubscription } from "../../features/subscription/subscriptionSlice";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const formatLocalDate = (value) =>
    value ? dayjs.utc(value).local().format("DD/MM/YYYY") : "-";

function Members() {
    const dispatch = useDispatch();

    const {
        subscriptionsData,
        subscriptionLoading,
    } = useSelector((state) => state.subscription);

    useEffect(() => {
        dispatch(getAllSubscription());
    }, [dispatch]);

    const data = useMemo(() => {
        if (!subscriptionsData?.data) return [];

        return subscriptionsData.data.map((item) => ({
            ...item,
            startDate: formatLocalDate(item.startDate),
            endDate: formatLocalDate(item.endDate),
            rolloverDate: formatLocalDate(item.rolloverDate),
            createdAt: formatLocalDate(item.createdAt),
            updatedAt: formatLocalDate(item.updatedAt),
        }));
    }, [subscriptionsData]);

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
