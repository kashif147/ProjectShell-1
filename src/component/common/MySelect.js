import React from 'react'
import { Select } from 'antd'
function MySelect({placeholder,options,value,onChange}) {
  const { Option } = Select;
  return (
    <Select
    placeholder={placeholder}
    className="margin"
    value={value}
    onChange={onChange}
  >
    {options.map(option => (
      <Option key={option.key} value={option.key}>
        {option.label}
      </Option>
    ))}
  </Select>
  )
}

export default MySelect
