import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Table } from "antd";
import { getAllLookups } from "../../features/LookupsSlice";
import MyTable from "../../component/common/MyTable";
import Breadcrumb from "../../component/common/Breadcrumb";
import MyInput from "../../component/common/MyInput";

function WorkLocation() {
  const dispatch = useDispatch();
  const { lookups, lookupsloading } = useSelector((state) => state.lookups);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  // const onSelectionChange = (newSelectedRowKeys) => {
  //   setSelectedRowKeys(newSelectedRowKeys);
  // };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!lookupsloading && (!lookups || lookups.length === 0)) {
      dispatch(getAllLookups());
    }
  }, [dispatch, lookups, lookupsloading]);

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
    },
    {
      title: "Work Location",
      dataIndex: "lookupname",
      key: "lookupname",
      sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      sorter: (a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || ""),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: (a, b) => (a.address || "").localeCompare(b.address || ""),
    },
    {
      title: "Branch",
      dataIndex: "Parentlookup",
      key: "Parentlookup",
      sorter: (a, b) => (a.Parentlookup || "").localeCompare(b.Parentlookup || ""),
    },
    // {
    //   title: "Active",
    //   dataIndex: "isactive",
    //   key: "isactive",
    //   render: (active) => <Checkbox checked={active} disabled />,
    // },
  ];

  const groupedLookups = useMemo(() => {
    if (!lookups || lookups.length === 0) return {};
    return lookups.reduce((grouped, item) => {
      const lookupType = item.lookuptypeId?.lookuptype;
      if (!grouped[lookupType]) {
        grouped[lookupType] = [];
      }
      grouped[lookupType].push(item);
      return grouped;
    }, {});
  }, [lookups]);

  const workLocationData = groupedLookups?.workLocation || [];

  const filteredData = useMemo(() => {
    if (!searchText) return workLocationData;
    const lowerSearch = searchText.toLowerCase();
    return workLocationData.filter(
      (item) =>
        (item.code || "").toLowerCase().includes(lowerSearch) ||
        (item.lookupname || "").toLowerCase().includes(lowerSearch) ||
        (item.DisplayName || "").toLowerCase().includes(lowerSearch) ||
        (item.Parentlookup || "").toLowerCase().includes(lowerSearch)
    );
  }, [searchText, workLocationData]);

  const onSelectionChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  return (
    <div >

      <div style={{ marginLeft: "34px", display: "flex", justifyContent: "flex-start" }}>
        <div style={{ width: 300 }}>
          <MyInput
            placeholder="Search Work Location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      {/* <MyTable
        columns={columns}
        dataSource={filteredData}
        loading={lookupsloading}
        selection={true}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectionChange,
        }}
        onSelectionChange={onSelectionChange}
      /> */}
      <div
        className="common-table"
        style={{
          // ...tablePadding,
          width: "100%",
          overflowX: "auto",
          paddingBottom: "80px",
          paddingLeft: "34px",
          paddingRight: "34px",
        }}
      >
        <Table
          columns={columns}
          className="common-table"
          dataSource={filteredData}
          loading={lookupsloading}
          selection={true}
          rowKey="_id"
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectionChange,
          }}
        // onSelectionChange={onSelectionChange}
        />
      </div>
    </div>
  );
}

export default WorkLocation;
