import React, { useState } from "react";
import { AutoComplete, Input, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { getApplicationById } from "../../features/ApplicationDetailsSlice";
import { useDispatch } from "react-redux";
// import { useTableColumns } from "../../context/TableColumnsContext";
import { useTableColumns } from "../../context/TableColumnsContext ";

// Mock data extended for UI demo
const mockMembers = [
  {
    id: "e2c16ea2-c6b6-4579-9ff6-febfab4e5bf5",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+44 7123 456789",
    dob: "1985-03-12",
    address: "12 River St, London, UK",
    membership: "General – Full Member",
    status: "Active",
    expiry: "2025-12-31",
  },
  {
    id: "2e1d0f2b-ad56-45e2-b712-69862183b97b",
    name: "Peter Smith",
    email: "peter.smith@email.com",
    phone: "+44 7123 987654",
    dob: "1990-07-22",
    address: "10 Downing St, London, UK",
    membership: "General – Full Member",
    status: "Active",
    expiry: "2025-12-31",
  },
];

const MemberSearch = ({fullWidth=false}) => {
  const { disableFtn } = useTableColumns();
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();

  const handleSearch = (value) => {
    setSearchValue(value);

    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = mockMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(value.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(value.toLowerCase())) ||
        (m.phone && m.phone.includes(value))
    );

    if (filtered.length > 0) {
      setOptions(
        filtered.map((member) => ({
          value: member.email || member.name,
          label: (
            <div style={{ padding: "8px 0" }}>
              {/* Row 1: Name, email, phone */}
              <div style={{ fontWeight: "600" }}>
                {member.name}{" "}
                <span style={{ color: "#555", fontWeight: "normal" }}>
                  • {member.email} • {member.phone}
                </span>
              </div>

              {/* Row 2: DOB + Address */}
              <div style={{ fontSize: "13px", color: "#555" }}>
                DOB: {member.dob} • {member.address}
              </div>

              {/* Row 3: membership, status, expiry */}
              <div style={{ fontSize: "13px", marginTop: "2px" }}>
                <span>📘 {member.membership}</span> •{" "}
                <span>☑ {member.status}</span> •{" "}
                <span>⏳ {member.expiry}</span>
              </div>
            </div>
          ),
          memberId: member.id,
        }))
      );
    } else {
      setOptions([
        {
          value: "__no_match__",
          label: (
            <div
              style={{
                padding: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>No Member Found</span>
              <Button
                size="small"
                type="primary"
                onClick={() => handleAdd(searchValue)}
              >
                Add
              </Button>
            </div>
          ),
          disabled: true,
        },
      ]);
    }
  };

  const handleSelect = (value, option) => {
    if (option.memberId) {
      dispatch(getApplicationById({ id: option.memberId }));
      disableFtn(false);
    }
  };

  const handleAdd = () => {
    disableFtn(false);
    setSearchValue("");
    setOptions([]);
  };

  return (
    <div style={{ width: fullWidth ? "100%" : "20rem" }}>
      <AutoComplete
        style={{ width: "100%" }}
        options={options}
        onSearch={handleSearch}
        onSelect={handleSelect}
        value={searchValue}
        onChange={setSearchValue}
        dropdownMatchSelectWidth={true}
      >
        <Input
          // size="small"
          prefix={<SearchOutlined />}
          placeholder="Search Member by Email or Mobile Number"
          // style={}
          className="p-2 my-input-field"
        />
      </AutoComplete>
    </div>
  );
};

export default MemberSearch;
