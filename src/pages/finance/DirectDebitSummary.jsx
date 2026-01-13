import { useEffect } from "react";
import MyTable from "../../component/common/MyTable";
import { fetchBatchesByType } from "../../features/profiles/batchMemberSlice";
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { useTableColumns } from "../../context/TableColumnsContext ";

function DirectDebitSummary() {
    const dispatch = useDispatch();
    const {
        loadingBatches,
        batchesData
    } = useSelector((state) => state.batchMember);
    const { columns } = useTableColumns();
    const tableColumns = columns["DirectDebitSummary"] || [];

    useEffect(() => {
        dispatch(fetchBatchesByType({
            type: 'direct-debit',
            page: 1,
            limit: 500
        }));
    }, [dispatch]);

    // Format the batches data for the table
    const formatTableData = () => {
        let batches = batchesData?.data?.batches;

        // If no data is available from API, use mock data for demonstration
        if (!batches || !Array.isArray(batches) || batches.length === 0) {
            batches = [
                {
                    id: "DD-001",
                    name: "Monthly DD Batch - January 2024",
                    date: "2024-01-05",
                    batchStatus: "Completed",
                    createdAt: "2024-01-01T09:30:00Z",
                    createdBy: "John Doe",
                    updatedAt: "2024-01-05T14:45:00Z",
                    profileIds: new Array(125).fill(0)
                },
                {
                    id: "DD-002",
                    name: "Monthly DD Batch - February 2024",
                    date: "2024-02-05",
                    batchStatus: "Processing",
                    createdAt: "2024-02-01T10:15:00Z",
                    createdBy: "Jane Smith",
                    updatedAt: "2024-02-03T11:20:00Z",
                    profileIds: new Array(88).fill(0)
                },
                {
                    id: "DD-003",
                    name: "Urgent Correction Batch",
                    date: "2024-03-01",
                    batchStatus: "Draft",
                    createdAt: "2024-02-28T16:40:00Z",
                    createdBy: "Finance Admin",
                    updatedAt: "2024-02-28T16:45:00Z",
                    profileIds: new Array(12).fill(0)
                },
                {
                    id: "DD-004",
                    name: "Bi-Weekly Run - Week 12",
                    date: "2024-03-15",
                    batchStatus: "Pending",
                    createdAt: "2024-03-12T08:00:00Z",
                    createdBy: "System",
                    updatedAt: "2024-03-12T08:00:00Z",
                    profileIds: new Array(45).fill(0)
                }
            ];
        }
        return batches.map((batch, index) => {
            // Format date to DD/MM/YYYY
            let formattedDate = "N/A";
            if (batch.date) {
                try {
                    formattedDate = dayjs(batch.date).format('DD/MM/YYYY');
                } catch (error) {
                    console.error('Error formatting date:', error);
                    formattedDate = "Invalid Date";
                }
            }

            // Format createdAt to DD/MM/YYYY HH:mm
            let formattedCreatedAt = "N/A";
            if (batch.createdAt) {
                try {
                    formattedCreatedAt = dayjs(batch.createdAt).format('DD/MM/YYYY HH:mm');
                } catch (error) {
                    console.error('Error formatting createdAt:', error);
                    formattedCreatedAt = "Invalid Date";
                }
            }

            // Format updatedAt to DD/MM/YYYY HH:mm
            let formattedUpdatedAt = "N/A";
            if (batch.updatedAt) {
                try {
                    formattedUpdatedAt = dayjs(batch.updatedAt).format('DD/MM/YYYY HH:mm');
                } catch (error) {
                    console.error('Error formatting updatedAt:', error);
                    formattedUpdatedAt = "Invalid Date";
                }
            }

            return {
                key: batch.id || batch.batchId || index.toString(),
                name: batch.name || batch.batchName || "N/A",
                date: formattedDate,
                batchStatus: batch.batchStatus || batch.status || "N/A",
                createdAt: formattedCreatedAt,
                createdBy: batch.createdBy || "N/A",
                updatedAt: formattedUpdatedAt,
                Count: batch.profileIds?.length || 0,
                _original: batch
            };
        });
    };

    const tableData = formatTableData();

    return (
        <div className="" style={{ width: "100%" }}>
            <MyTable
                dataSource={tableData}
                columns={tableColumns}
                loading={loadingBatches}
            />
        </div>
    );
}

export default DirectDebitSummary;
