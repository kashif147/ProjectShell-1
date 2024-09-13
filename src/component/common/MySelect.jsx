import React from 'react'
import { Select } from 'antd'
function MySelect({placeholder,options,defaultValue,value,onChange,isMenu,isSimple,width}) {
  const { Option } = Select;
  return (
    <Select
    placeholder={placeholder}
    className={`${isMenu==true?"d":""}`}
    defaultValue={defaultValue}
    value={value}
    style={isMenu 
      ? { width: "100%" } 
      : isSimple 
        ? { width: "100%", border: '1px solid #333333', borderRadius:"3px" } :
        width?
        { width: width, border: '1px solid #333333', borderRadius:"3px" } 
        : {}}
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
