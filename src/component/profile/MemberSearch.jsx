import React, { useState } from "react";
import { AutoComplete, Input, Button } from "antd";
import { MailOutlined, SearchOutlined } from "@ant-design/icons";
import { getApplicationById } from "../../features/ApplicationDetailsSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTableColumns } from "../../context/TableColumnsContext ";

const mockMembers = [
  {
    id: 'e2c16ea2-c6b6-4579-9ff6-febfab4e5bf5',
    name: "John Smith",
    email: "john.smith@email.com",
  },
  {
    id: "30020826-cd75-4c14-99ea-8b9971e5b7c2",
    name: "John Smith1",
  },
  {
    id: "2e1d0f2b-ad56-45e2-b712-69862183b97b",
    name: "Peter Smith",
    email: "peter.smith@email.com",
  },
];

const MemberSearch = () => {
  const { disableFtn, isDisable } = useTableColumns();
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value) => {
    setSearchValue(value);

    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = mockMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(value.toLowerCase()) ||
        (m.email && m.email.toLowerCase().includes(value.toLowerCase()))
    );

    if (filtered.length > 0) {
      setOptions(
        filtered.map((member) => ({
          value: member.email || member.name,
          label: (
            <div style={{ padding: "8px" }}>
              <strong>{member.name}</strong>
              {member.email && (
                <div>
                  <MailOutlined /> {member.email}
                </div>
              )}
            </div>
          ),
          memberId: member.id,
        }))
      );
    } else {
      // No match found
      setOptions([
        {
          value: "__no_match__", // dummy value
          label: (
            <div style={{ padding: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>No search match</span>
              <Button size="small" className="butn primary-btn" onClick={() => handleAdd(searchValue)}>
                Add
              </Button>
            </div>
          ),
          disabled: true, // prevent selection
        },
      ]);
    }
  };

  const dispatch = useDispatch();
  const handleSelect = (value, option) => {
    if (option.memberId) {
      dispatch(getApplicationById({ id: option.memberId }));
      disableFtn(false)
    }
  };

  const handleAdd = () => {
    disableFtn(false);

    // Close dropdown and clear input
    setSearchValue("");
    setOptions([]);
  };

  return (
    <div style={{ width: "27rem" }}>
      <AutoComplete
        style={{ width: "100%" }}
        options={options}
        onSearch={handleSearch}
        onSelect={handleSelect}
        value={searchValue}
        onChange={setSearchValue}
      >
        <Input
          size="large"
          prefix={<SearchOutlined />}
          style={{ borderRadius: "3px", padding: '8px' }}
          placeholder="Enter email or name..."
        />
      </AutoComplete>
    </div>
  );
};

export default MemberSearch;
