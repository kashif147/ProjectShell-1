import React from 'react'
import { DatePicker } from 'antd'
import dayjs from 'dayjs';

const dateFormat = 'DD/MM/YYYY';

function MyDatePicker({onChange,value }) {
  return (
    // <DatePicker />
    <DatePicker
    style={{ width: "100%", borderRadius: "3px" }}
    onChange={onChange} // Handle change event// Apply passed styles
    format={dateFormat} // Set the date format
    value={value} // Controlled value from props
  />
    // <DatePicker defaultValue={dayjs('2015/01/01', dateFormat)} format={dateFormat} />
  )
}

export default MyDatePicker