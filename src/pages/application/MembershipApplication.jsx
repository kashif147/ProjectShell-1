import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TableComponent from '../../component/common/TableComponent'
import { getAllApplications } from '../../features/ApplicationSlice';
import { Spin} from 'antd';


function MembershipApplication() {
    const dispatch = useDispatch();
    const { applications, applicationsLoading } = useSelector((state) => state.applications);

    useEffect(() => {
    dispatch(getAllApplications());
  }, [dispatch]);

  return (
    <div className='' style={{width:'95vw'}}>

    <TableComponent data={applications}  screenName="Applications" />

    </div>
  )
}

export default MembershipApplication