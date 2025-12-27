import { useEffect } from "react";
import TableComponent from "../../component/common/TableComponent";
import { fetchBatchesByType, clearBatchesError } from "../../features/profiles/batchMemberSlice";
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';

function RecruitAFriend() {
  const dispatch = useDispatch();
  const {
    loadingBatches,
    batchesData,
    batchesError
  } = useSelector((state) => state.batchMember);

  console.log(batchesData?.data?.batches?.results, "batchesData")

  useEffect(() => {
    dispatch(fetchBatchesByType({
      type: 'recruit-friend',
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
      <TableComponent
        data={tableData}
        isGrideLoading={loadingBatches}
        screenName="NewGraduate"
      />
    </div>
  );
}

export default RecruitAFriend;