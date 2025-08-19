import React, { useState } from "react";
import { AutoComplete, Input } from "antd";
import { MailOutlined, PhoneOutlined, SearchOutlined } from "@ant-design/icons";

const mockMembers = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+44 7123 456789",
    dob: "1985-03-12",
    address: "12 River St, London, UK",
    membershipType: "Full Member",
    membershipCategory: "General",
    status: "Active",
    expiry: "2025-12-31",
  },
  {
    id: 1,
    name: "John Smith1",
    email: "john.smith@email.com",
    phone: "+44 7123 456789",
    dob: "1985-03-12",
    address: "12 River St, London, UK",
    membershipType: "Full Member",
    membershipCategory: "General",
    status: "Active",
    expiry: "2025-12-31",
  },
  {
    id: 2,
    name: "Peter Smith",
    email: "peter.smith@email.com",
    phone: "+44 7987 654321",
    dob: "1988-07-22",
    address: "45 Lake Rd, Manchester, UK",
    membershipType: "Associate Member",
    membershipCategory: "General",
    status: "Expired",
    expiry: "2023-12-31",
  },
];

const MemberSearch = () => {
  const [options, setOptions] = useState([]);

  const handleSearch = (value) => {
    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = mockMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(value.toLowerCase()) ||
        m.email.toLowerCase().includes(value.toLowerCase()) ||
        m.phone.toLowerCase().includes(value.toLowerCase())
    );

    setOptions(
      filtered.map((member) => ({
        value: member.email, // what fills input if selected
        label: (
          <div style={{ padding: "8px" }}>
            <strong>{member.name}</strong>
            <div>
              <MailOutlined /> {member.email}
            </div>
            <div>
              <PhoneOutlined /> {member.phone}
            </div>
            <div>
              DOB: {member.dob}
            </div>
            <div>
              📍 {member.address}
            </div>
            <div>
              📘 {member.membershipCategory} – {member.membershipType}
            </div>
            <div>
              {member.status === "Active" ? "🟢 Active" : "🔴 Expired"} • ⏳ {member.expiry}
            </div>
          </div>
        ),
      }))
    );
  };

  return (
    <div style={{ width: "27rem",}}>
      <AutoComplete
        style={{ width: "100%" }}
        options={options}
        onSearch={handleSearch}
        // placeholder="Search by email or mobile number..."
        // dropdownMatchSelectWidth={600}
      >
        <Input
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Enter email or mobile number..."
          style={{ borderRadius: "3px", padding:'8px' }}
        />
      </AutoComplete>
    </div>
  );
};

export default MemberSearch;
