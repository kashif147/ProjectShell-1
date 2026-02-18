import { useEffect } from "react";
import MyTable from "../../component/common/MyTable";
import { fetchBatchesByType, clearBatchesError } from "../../features/profiles/batchMemberSlice";
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { useTableColumns } from "../../context/TableColumnsContext ";
import { Link, useLocation } from "react-router-dom";
import { getCornMarketBatchById } from "../../features/profiles/CornMarketBatchByIdSlice";

function NewlyJoint() {
  const dispatch = useDispatch();
  const location = useLocation();
  const {
    loadingBatches,
    batchesData,
    batchesError
  } = useSelector((state) => state.batchMember);

  const { columns } = useTableColumns();
  const tableColumnsRaw = columns["CornMarketRewards"];

  const tableColumns = tableColumnsRaw.map(col => {
    if (col.title === "Batch Name") {
      return {
        ...col,
        render: (text, record) => {
          const targetPath = "/SimpleBatchMemberSummary";
          return (
            <Link
              to={targetPath}
              state={{
                batchName: text,
                batchId: record?.key,
                batchStatus: record?.batchStatus,
                search: "CornMarketRewards",
              }}
              style={{ color: "inherit", textDecoration: "none" }}
              onClick={() => {
                if (record?._original?._id) {
                  dispatch(getCornMarketBatchById(record._original._id));
                }
              }}
            >
              {text}
            </Link>
          );
        }
      };
    }
    return col;
  });

  console.log(batchesData?.data?.batches?.results, "batchesData")

  useEffect(() => {
    dispatch(fetchBatchesByType({
      type: 'inmo-rewards',
      page: 1,
      limit: 500
    }));
  }, [dispatch]);
  useEffect(() => {
    let data = batchesData?.data?.batches?.results

  }, [batchesData])
  // Format the batches data for the table
  const formatTableData = () => {
    if (!batchesData?.data?.batches || !Array.isArray(batchesData.data.batches)) {
      return [];
    }

    return batchesData.data.batches.map((batch, index) => {
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
        // Count: batch.count || batch.totalCount || 0,
        Count: batch.profileIds?.length || 0,
        // Add original data as well if needed
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
        selection={false}
      />
    </div>
  );
}

export default NewlyJoint;