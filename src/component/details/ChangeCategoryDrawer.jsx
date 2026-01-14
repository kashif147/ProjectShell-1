import React, { useState } from 'react';
import { Table, Input } from 'antd';
import MyDrawer from '../common/MyDrawer';
import CustomSelect from '../common/CustomSelect';
import MyInput from '../common/MyInput';
import { CatOptions } from '../../Data';
import MyDatePicker from '../common/MyDatePicker';
import dayjs from 'dayjs';
import moment from 'moment';
import SubTableComp from '../common/SubTableComp';
const { Search } = Input;

function CategoryChangeRequest({
  open,
  onClose,
  ProfileDetails,
  columnHistory,
  historyData = [],
  isProfileDetails = false,
  isChangeCat
}) {
  const initialFormData = {
    newCategory: '',
    memo: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});

  const handleChange = (eventOrName, value) => {
    if (eventOrName?.target) {
      const { name, value } = eventOrName.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    } else {
      const name = eventOrName;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    const requiredFields = ['newCategory'];
    const newErrors = {};

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].trim?.() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ Do something with valid formData
    

    // Optionally reset and close
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  return (
    <MyDrawer width="1000px" title={` ${isChangeCat ? "Category Change Request" : "Category Change History"}`} open={open} onClose={handleClose} add={handleSubmit}>
      <div>
        {isProfileDetails === false && isChangeCat && (
          <Search className='pb-4' placeholder="Input search text" />
        )}
        {isProfileDetails && (
          <div className="details-drawer mb-4 mt-4">
            <p>{ProfileDetails?.regNo}</p>
            <p>{ProfileDetails?.fullName}</p>
            <p>{ProfileDetails?.duty}</p>
          </div>
        )}
        {
          isChangeCat && (
            <div className="d-flex">
              {/* Current Section */}
              <div className="w-50">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    height: '35px',
                    backgroundColor: '#215E97',
                    color: 'white',
                  }}
                >
                  <h3 className="text-center" style={{ fontSize: '15px', padding: '0px', margin: '0px' }}>Current</h3>
                </div>
                <div className="body-container">
                  <CustomSelect
                    label="Category"
                    name="currentCategory"
                    value={ProfileDetails?.category}
                    options={CatOptions}
                    disabled
                  />
                  <MyInput
                    label="Reason"
                    name="currentRemarks"
                    type="textarea"
                    value={ProfileDetails?.remarks}
                    disabled
                  />
                  <MyDatePicker
                    label='Effective Date'
                    name="Date"
                    value={dayjs()}
                    disabled={true}
                  />
                </div>
              </div>

              {/* New Section */}
              <div className="w-50 ms-4">
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    height: '35px',
                    backgroundColor: '#215E97',
                    color: 'white',
                  }}
                >
                  <h3 className="text-center" style={{ fontSize: '15px', padding: '0px', margin: '0px' }}>New</h3>
                </div>
                <div className="body-container">
                  <CustomSelect
                    label="Requested Category"
                    name="newCategory"
                    value={formData.newCategory}
                    onChange={(val) => handleChange('newCategory', val)}
                    required
                    hasError={!!errors.newCategory}
                    options={CatOptions}
                  />
                  <MyInput
                    label="Memo"
                    name="memo"
                    type="textarea"
                    placeholder="Enter memo"
                    value={formData.memo}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>)
        }

        {/* History Table */}
        {columnHistory && (
          <div className="mt-4">
            {/* <Table
              pagination={false}
              columns={columnHistory}
              dataSource={historyData}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? 'odd-row' : 'even-row'
              }
              bordered
            /> */}
            <SubTableComp columns={columnHistory}
              dataSource={historyData} />

          </div>
        )}
      </div>
    </MyDrawer>
  );
}

export default CategoryChangeRequest;
