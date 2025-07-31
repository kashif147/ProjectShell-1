import {useEffect} from 'react'
import TableComponent from '../../component/common/TableComponent'
import { useDispatch, useSelector } from 'react-redux';
import { getAllLookups } from '../../features/LookupsSlice'
function PopOut() {
  const dispatch = useDispatch();
    useEffect(() => {
    dispatch(getAllLookups());
  }, [dispatch]);
  const { lookups, } = useSelector((state) => state.lookups);
 const targetId = "67f6297617f0ecf3dbf79f12";

const filtered = lookups?.filter(
  item => item.lookuptypeId?._id === targetId
);
console.log(filtered,"pe");
  return (
    <TableComponent data={filtered}  screenName="Popout" />
    // <>
    // <h1>tesst</h1>
    // </>
  )
}

export default PopOut
