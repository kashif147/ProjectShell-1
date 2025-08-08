import React from 'react';
import { Select } from 'antd';

function MySelect({ placeholder, options, defaultValue, value, onChange, isMenu, isSimple, width, disabled }) {
  const { Option } = Select;
  return (
    <Select
      showSearch
      placeholder={placeholder}
      className={`${isMenu === true ? "d" : ""}`}
      defaultValue={defaultValue}
      value={value}
      optionFilterProp="children" // Use "children" if filtering by the displayed text
      filterOption={(input, option) =>
        option?.children?.toLowerCase().includes(input.toLowerCase())
      }
      filterSort={(optionA, optionB) =>
        (optionA.children ?? '').toLowerCase().localeCompare((optionB.children ?? '').toLowerCase())
      }
      style={
        isMenu
          ? { width: "100%" }
          : isSimple
          ? { width: "100%", border: '0px solid #D9D9D9', borderRadius: "3px" }
          : width
          ? { width: width, border: '0px solid #D9D9D9', borderRadius: "3px" }
          : {}
      }
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      disabled={disabled}
    >
      {options?.map(option => (
        <Option key={option.value} value={option.label}>
          {option.label}
        </Option>
      ))}
    </Select>
  );
}

export default MySelect;
