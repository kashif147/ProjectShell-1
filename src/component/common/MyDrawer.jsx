import { React, useState } from "react";
import { Button, Drawer, Space, Pagination, Input, Table } from "antd";
import MySelect from "./MySelect";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
import MyDatePicker from "./MyDatePicker";
import TextArea from "antd/es/input/TextArea";

function MyDrawer({ title, open, onClose, children, add, width = 820, isHeader = false, isPagination = false, total, isContact = false, isEdit, update, isPyment=false, isAss = false, InfData, pymntAddFtn,pymentCloseFtn }) {
  const onChange = (pageNumber) => {
    console.log('Page: ', pageNumber);
  };
  const [contactDrawer, setcontactDrawer] = useState(false)
  const [isPayment, setisPayment] = useState(false)
  const [selectionType, setSelectionType] = useState('checkbox');
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };
  const columnCountry = [
    {
      title: 'Transfer Date',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Station From',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Station To',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Notes',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },

    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const CriticalIllnessSchemePaymentsClm = [
    {
      title: 'File Reference',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Amount',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Payment Date',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Cheque No',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },

    {
      title: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  return (

    <Drawer
      width={width}
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      extra={
        <div className="d-flex space-evenly">
          {
            isContact && (
              <div className="mx-auto" style={{ marginRight: '80%' }}>
                <Button onClick={() => setcontactDrawer(!contactDrawer)}
                  className="butn" style={{ color: 'blue', marginRight: '250px' }}>
                  Add Contact
                </Button>
              </div>
            )
          }
          {
            isPyment && (
              <div className="mx-auto" style={{ marginRight: '80%' }}>
                <Button onClick={() => setisPayment(!isPayment)}
                  className="butn secondary" style={{ color: 'blue', marginRight: '250px' }}>
                  Add Payment
                </Button>
              </div>
            )
          }
          <Space>
            {
              isAss == true && (
                <>
                  <Button className="gray-btn butn" onClick={onClose}>
                    <FaFile />
                    NOK
                  </Button>
                  <Button className="gray-btn butn" >
                    <FaFile />
                    Ins.Co.
                  </Button>
                </>
              )
            }
            <Button className="butn secoundry-btn" onClick={onClose}>
              Close
            </Button>
            <Button className="butn primary-btn" onClick={isEdit == true ? update : add}>
              {isEdit == true ? "Save" : 'Add'}
            </Button>

          </Space>
        </div>
      }
    >
      <div className="">
        {children}
        {
          isPagination &&
          (
            <div className="d-flex justify-content-center align-items-baseline">
              Total Items: <Pagination showQuickJumper defaultCurrent={1} total={total} onChange={onChange} />
            </div>
          )
        }
      </div>
      <Drawer open={contactDrawer}
        onClose={() => setcontactDrawer(!contactDrawer)}
        width="620px"
        title="Contacts"
      >
        <div className='transfer-main-cont'>
          <div className='w-100'>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Contact Type :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <MySelect isSimple={true} placeholder="Select contact type" />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Title :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <MySelect placeholder='Mr.' isSimple={true} />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Forename :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Surname :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Email :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Mobile :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Building or House :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Street or Road :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Area or Town :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>County, City or Postcode :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Eircode :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>

          </div>
          <h5>History</h5>
          <Table
            pagination={false}
            columns={columnCountry}
            className="drawer-tbl"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>

      </Drawer>
      <Drawer open={isPayment}
        onClose={() => setisPayment(!isPayment)}
        width="526px"
        title="Critical Illness Scheme Payments"
        extra={
          <Space>
            <Button className="butn secoundry-btn" onClick={() => setisPayment(!isPayment)}>
              Close
            </Button>
            <Button className="butn primary-btn" onClick={pymntAddFtn}>
              Add
            </Button>

          </Space>
        }
        
      >
        <div className='transfer-main-cont'>
          <div className="details-drawer mb-4">
            <p>{InfData?.gardaRegNo}</p>
            <p>{InfData?.fullname}</p>
            <p>Garda</p>
          </div>
          <div className='w-100'>
          
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>File Reference :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Payment Amount :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input placeholder="0.00"  type="number"/>

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Payment Date :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                <MyDatePicker />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Cheque # :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Refund Amount :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input placeholder="0.00" disabled={true} />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Refund Date :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                 <MyDatePicker />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container " style={{height:'100px'}}>
              <div className="drawer-lbl-container" style={{ width: "33%" }}>
                <p>Memo :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                 <TextArea rows={4}  placeholder="Autosize height based on content lines"/>

                </div>
                <p className="error"></p>
              </div>
            </div>
           
          </div>
          <h5>History</h5>
          <Table
            pagination={false}
            columns={CriticalIllnessSchemePaymentsClm}
            className="drawer-tbl"
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>

      </Drawer>
    </Drawer>
  );
}

export default MyDrawer;
