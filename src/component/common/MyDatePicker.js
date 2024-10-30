import React from 'react'
import { DatePicker } from 'antd'
import dayjs from 'dayjs';

const dateFormat = 'DD/MM/YYYY';

function MyDatePicker({onChange,value,disabled }) {
  return (
    // <DatePicker />
    <DatePicker
    style={{ width: "100%", borderRadius: "3px" }}
    onChange={onChange} 
    format={dateFormat} 
    value={value}
    defaultValue={value}
    disabled={disabled}
  />
    // <DatePicker defaultValue={dayjs('2015/01/01', dateFormat)} format={dateFormat} />
  )
}

export default MyDatePicker