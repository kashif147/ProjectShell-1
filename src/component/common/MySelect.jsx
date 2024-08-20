import React from 'react'
import { Select } from 'antd'
function MySelect({placeholder,options,defaultValue,value,onChange,isMenu}) {
  const { Option } = Select;
  return (
    <Select
    placeholder={placeholder}
    className={`${isMenu==true?"d":""}`}
    defaultValue={defaultValue}
    value={value}
    style={isMenu?{width:"100%"}:{}}
    onChange={onChange}
    onClick={(e) => e.stopPropagation()}
  >
    
    {options?.map(option => (
      <Option key={option.key} value={option.key}>
        {isMenu? option.label: option?.key}
        {/* {option?.label} */}
      </Option>
    ))}
  </Select>
  )
}

export default MySelect
