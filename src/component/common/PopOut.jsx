import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Checkbox, Table, Input as AntInput, Button, Space, Modal, Select, message } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getAllLookups } from "../../features/LookupsSlice";
import { baseURL } from "../../utils/Utilities";
import MyInput from "./MyInput";
import HeaderDetails from "./HeaderDetails";
import ContactDrawer from "./ContactDrawer";

const IRO_ROLE_ID = "68c6b4d1e42306a6836622fa";

function PopOut() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { lookups, lookupsloading } = useSelector((state) => state.lookups);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [contactDrawer, setContactDrawer] = useState(false);

  // Determine type based on path
  const type = useMemo(() => {
    if (location.pathname.includes("/worklocation")) return "workLocation";
    if (location.pathname.includes("/region")) return "Region";
    if (location.pathname.includes("/branch")) return "Branch";
    return "workLocation";
  }, [location.pathname]);

  const typeLabel = useMemo(() => {
    if (type === "workLocation") return "Work Location";
    if (type === "Region") return "Region";
    if (type === "Branch") return "Branch";
    return "Item";
  }, [type]);

  const officerLabel = useMemo(() => {
    if (type === "Branch") return "Branch Manager";
    if (type === "Region") return "Region Officer";
    return "IRO";
  }, [type]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!lookupsloading && (!lookups || lookups.length === 0)) {
      dispatch(getAllLookups());
    }
  }, [dispatch, lookups, lookupsloading]);

  // Helper function to get unique filter values
  const getUniqueFilterValues = (dataSource, getValue) => {
    const uniqueValues = new Set();
    dataSource.forEach((record) => {
      const value = getValue(record);
      if (value !== null && value !== undefined && value !== "") {
        uniqueValues.add(value.toString());
      }
    });
    return Array.from(uniqueValues)
      .sort()
      .map((value) => ({ text: value, value }));
  };

  // Filter Dropdown Component
  const FilterDropdown = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
    dataSource,
    getValue,
  }) => {
    const [searchText, setSearchText] = useState("");
    const uniqueValues = getUniqueFilterValues(dataSource, getValue);
    const filteredOptions = uniqueValues.filter((option) =>
      option.text.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleReset = () => {
      setSearchText("");
      setSelectedKeys([]);
      clearFilters();
    };

    const handleConfirm = () => {
      confirm();
    };

    return (
      <div style={{ padding: 4, width: 280, boxSizing: "border-box" }}>
        <AntInput
          placeholder="Search filter"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleConfirm}
          style={{
            marginBottom: 8,
            width: "100%",
            boxSizing: "border-box",
          }}
        />
        <div
          style={{
            maxHeight: 200,
            overflowY: "auto",
            marginBottom: 8,
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  const newSelectedKeys = selectedKeys?.includes(option.value)
                    ? selectedKeys.filter((key) => key !== option.value)
                    : [...(selectedKeys || []), option.value];
                  setSelectedKeys(newSelectedKeys);
                }}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  backgroundColor: selectedKeys?.includes(option.value)
                    ? "#e6f7ff"
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedKeys?.includes(option.value) || false}
                  readOnly
                  style={{ marginRight: 8 }}
                />
                {option.text}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px", color: "#999" }}>No options found</div>
          )}
        </div>
        <Space style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button size="small" onClick={handleReset} style={{ width: 90 }}>
            Clear
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={handleConfirm}
            style={{ width: 90 }}
          >
            Apply
          </Button>
        </Space>
      </div>
    );
  };

  // Helper function to create searchable filter dropdown
  const createFilterDropdown = (dataSource, getValue) => {
    return (props) => (
      <FilterDropdown {...props} dataSource={dataSource} getValue={getValue} />
    );
  };

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

  const rawData = useMemo(() => {
    if (type === "workLocation") return groupedLookups?.workLocation || [];
    if (type === "Region") return groupedLookups?.Region || [];
    if (type === "Branch") return groupedLookups?.Branch || [];
    return [];
  }, [type, groupedLookups]);

  // For Branch, we need to map region names
  const processedData = useMemo(() => {
    if (type === "Branch") {
      return rawData.map((branch) => {
        const region = (groupedLookups?.Region || []).find(
          (r) => r._id === branch.Parentlookupid
        );
        return {
          ...branch,
          regionName: region ? region.lookupname : "No Region",
        };
      });
    }
    return rawData;
  }, [type, rawData, groupedLookups?.Region]);

  const columns = useMemo(() => {
    const dataSource = processedData;
    const baseColumns = [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      },
      {
        title: typeLabel,
        dataIndex: "lookupname",
        key: "lookupname",
        sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
        filterDropdown: createFilterDropdown(
          dataSource,
          (record) => record.lookupname
        ),
        onFilter: (value, record) => (record.lookupname || "").toString() === value,
        filterIcon: (filtered) => (
          <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
        ),
      },
      {
        title: "Display Name",
        dataIndex: "DisplayName",
        key: "DisplayName",
        sorter: (a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || ""),
      },
    ];

    if (type === "workLocation") {
      baseColumns.push({
        title: "Address",
        key: "address",
        render: (_, record) => {
          const addr = record?.worklocationAddress;
          if (!addr) return "-";
          return [
            addr.buildingOrHouse,
            addr.streetOrRoad,
            addr.areaOrTown,
            addr.countyCityOrPostCode,
            addr.country,
            addr.eircode,
          ].filter(Boolean).join(", ") || "-";
        },
      });
      baseColumns.push({
        title: "Branch",
        dataIndex: "Parentlookup",
        key: "Parentlookup",
        sorter: (a, b) => (a.Parentlookup || "").localeCompare(b.Parentlookup || ""),
      });
    }

    if (type === "Branch") {
      baseColumns.push({
        title: "Region",
        dataIndex: "regionName",
        key: "regionName",
        sorter: (a, b) => (a.regionName || "").localeCompare(b.regionName || ""),
      });
    }

    baseColumns.push({
      title: officerLabel,
      key: "iro",
      render: (_, record) => record.officer?.userEmail || "-",
      sorter: (a, b) => (a.officer?.userEmail || "").localeCompare(b.officer?.userEmail || ""),
      filterDropdown: createFilterDropdown(dataSource, (record) => record.officer?.userEmail),
      onFilter: (value, record) => (record.officer?.userEmail || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    });

    baseColumns.push({
      title: "Action",
      key: "action",
      width: "100px",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<UserOutlined />}
          style={{ display: 'flex', alignItems: 'center', height: '100%' }}
          onClick={() => {
            // Set this single item as the selected work location
            dispatch({ type: "lookups/setSelectedWorkLocations", payload: [record] });
            setContactDrawer(true);
          }}
        >
          Assign
        </Button>
      ),
    });

    return baseColumns;
  }, [type, typeLabel, processedData]);

  const filteredData = useMemo(() => {
    if (!searchText) return processedData;
    const lowerSearch = searchText.toLowerCase();
    return processedData.filter(
      (item) =>
        (item.code || "").toLowerCase().includes(lowerSearch) ||
        (item.lookupname || "").toLowerCase().includes(lowerSearch) ||
        (item.DisplayName || "").toLowerCase().includes(lowerSearch) ||
        (item.Parentlookup || "").toLowerCase().includes(lowerSearch) ||
        (item.regionName || "").toLowerCase().includes(lowerSearch) ||
        (item.officer?.userEmail || "").toLowerCase().includes(lowerSearch)
    );
  }, [searchText, processedData]);

  const onSelectionChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
    const selectedItems = processedData.filter((item) => newSelectedRowKeys.includes(item._id));
    dispatch({ type: "lookups/setSelectedWorkLocations", payload: selectedItems });
  };

  return (
    <div className="" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>


      <div className="bg-white p-4 rounded shadow-sm mt-1">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h2 className="m-0">{typeLabel} Management</h2>
          <div style={{ width: 300 }}>
            <MyInput
              placeholder={`Search ${typeLabel}...`}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="common-table" style={{ width: "100%", overflowX: "auto", paddingBottom: "20px" }}>
          <Table
            columns={columns}
            className="common-table"
            dataSource={filteredData}
            loading={lookupsloading}
            rowKey="_id"
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectionChange,
            }}
            pagination={{
              showSizeChanger: true,
              pageSizeOptions: ["500", "1000", "2000", "5000"],
              defaultPageSize: 500,
            }}
            bordered
          />
        </div>
      </div>

      <ContactDrawer
        open={contactDrawer}
        onClose={() => setContactDrawer(false)}
        type={type}
        onAssign={async (selectedUser, selectedWorkLocations) => {
          if (!selectedWorkLocations || selectedWorkLocations.length === 0) {
            message.warning("Please select at least one location.");
            return;
          }

          const token = localStorage.getItem("token");
          const isUnassign = !selectedUser;
          const officerId = isUnassign ? null : (selectedUser._id || selectedUser.id);
          const actionLabel = isUnassign ? "Unassigning" : "Assigning";

          const processingKey = "iro-assignment-processing";
          message.loading({
            content: `${actionLabel} ${officerLabel} ${isUnassign ? "from" : "to"} ${selectedWorkLocations.length} location(s)...`,
            duration: 0,
            key: processingKey,
          });

          try {
            const locationIds = selectedWorkLocations.map((loc) => loc._id || loc.id);
            const payload = {
              ids: locationIds,
              officer: officerId,
            };

            await axios.patch(`${baseURL}/lookups/officer`, payload, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            message.success({
              content: `${officerLabel} ${isUnassign ? "unassigned" : "assigned"} successfully!`,
              key: processingKey,
            });

            dispatch(getAllLookups());
            setContactDrawer(false);
          } catch (error) {
            console.error(`Failed to ${isUnassign ? "unassign" : "assign"} ${officerLabel}:`, error);
            message.error({
              content: `Failed to ${isUnassign ? "unassign" : "assign"} ${officerLabel}: ${error.response?.data?.message || error.message}`,
              key: processingKey,
            });
          }
        }}
      />
    </div>
  );
}

export default PopOut;
