import React from 'react'
import { DatePicker } from 'antd'
const dateFormat = 'DD/MM/YYYY';

function MyDatePicker({onChange,defaultValue }) {
  return (
    // <DatePicker />
    <DatePicker 
    style={{ width: "100%", borderRadius: "3px" }}
    format={dateFormat} 
    defaultValue={defaultValue}
    />
    // <DatePicker defaultValue={dayjs('2015/01/01', dateFormat)} format={dateFormat} />
  )
}

export default MyDatePicker