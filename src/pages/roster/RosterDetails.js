import { React, useState } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { Button, Select, TimePicker, Input, Table } from 'antd'
import { FaAngleRight } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import moment from 'moment'

import '../../styles/Roster.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MyDrawer from '../../component/common/MyDrawer';


const localizer = momentLocalizer(moment)
const format = 'HH:mm';
const { TextArea } = Input;

function RosterDetails() {

    const options = [
        {
            label: 'New Event',
            value: 'New Event',
        },
        {
            label: 'New Email',
            value: 'New Email',
        },


    ];
    const [isDrawerOpen, setisDrawerOpen] = useState({
        NewEvent: false
    })
    const column = [
        {
            title: 'Title',
            dataIndex: 'Title',
            key: 'Title',
        },
        {
            title: 'Invite Attendies',
            dataIndex: 'Invite Attendies',
            key: 'Invite Attendies',
        },
        {
            title: 'Start Time',
            dataIndex: 'Start Time',
            key: 'Start Time',
        },
        {
            title: 'End Time',
            dataIndex: 'End Time',
            key: 'End Time',
        },
        {
            title: 'Description',
            dataIndex: 'Description',
            key: 'Description',
        },
    ]
    const drawerOpenFtn = (drawer) => {
        setisDrawerOpen((prev) => ({
            ...prev,
            [drawer]: !prev[drawer],
        }));
    };
    const [activeKey, setactiveKey] = useState('1')
    const myEventsList = [
        { title: 'Meeting', start: new Date(), end: new Date(), allDay: false },
    ];
    const handleNewFtn = () => {
        if (activeKey === "1") {
            drawerOpenFtn('NewEvent')
        }
        // else if (activeKey==="2"){
        //     openCloseDrawerFtn('NewCall')
        // }
        // else if (activeKey=="3"){
        //   createDocument()
        // }
    }
    const handleOptionSelect = (value) => {
        switch (value) {
            case "New Event":
                setactiveKey("1");
                // window.open('https://outlook.office.com/mail/deeplink/compose', '_blank');
                break;
            case "New Email":
                setactiveKey("2");
                // openCloseDrawerFtn('NewCall')
                break;
            // case "New Letter":
            //     setactiveKey("3");
            //     createDocument()
            //     break;
            // case "New SMS":
            //     setactiveKey("4");
            //     break;
            default:
                console.error("Invalid value provided");
        }
    };
    const CustomToolbar = (props) => {
        const { label } = props;

        const goToBack = () => props.onNavigate('PREV');
        const goToNext = () => props.onNavigate('NEXT');
        const goToToday = () => props.onNavigate('TODAY');
        const viewChange = (view) => props.onView(view);

        return (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className='d-flex'>
                    <div className='me-2 ms-3'>
                        <Button className='new-btn ' onClick={handleNewFtn}>
                            {activeKey === "1" ? "New Event" : activeKey === "2" ? "New Email" : activeKey === "3" ? "New Letter" : activeKey === "4" ? "New SMS" : null}
                        </Button>
                        <Select
                            onChange={handleOptionSelect} // Trigger internal function
                            style={{ borderLeft: 'none', borderColor: 'red', backgroundColor: "#215E97" }}
                            value={null}
                            dropdownStyle={{ width: '10%' }}
                        >
                            {options.map((option) => (
                                <Select.Option key={option.key} value={option.label}>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <Button onClick={goToNext} className="me-1 gray-btn butn" >
                        <FaAngleLeft className="deatil-header-icon" />

                    </Button>
                    <Button className="gray-btn butn" onClick={goToToday}>Today</Button>
                    <Button onClick={goToBack} className="me-1 gray-btn butn" style={{ marginLeft: "8px" }}>
                        <FaAngleRight className="deatil-header-icon" />
                    </Button>
                    {/* <button onClick={goToNext}>&gt;</button> */}
                </div>
                <div>{label}</div>
                <div className='me-3'>
                    <Button className="me-1 gray-btn butn" onClick={() => viewChange('month')}>Month</Button>
                    <Button className="me-1 gray-btn butn" onClick={() => viewChange('week')}>Week</Button>
                    <Button className="me-1 gray-btn butn" onClick={() => viewChange('day')}>Day</Button>
                </div>
            </div>
        );
    };
    const CustomEvent = ({ event }) => {
        return (
            <div>
                <strong>{event.title}</strong>
                <br />
                <span>
                    {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                </span>
            </div>
        );
    };

    return (
        <div className='mt-2'>
            <div className='row'>
                <div className='col-md-2'>

                </div>
                <div>
                    <Calendar
                        localizer={localizer}
                        events={myEventsList}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100vh' }}
                        components={{
                            toolbar: CustomToolbar, // Use the custom toolbar
                            event: CustomEvent,
                        }}

                    />
                </div>
                <div>

                </div>
            </div>
            <MyDrawer title='Add New Events' open={isDrawerOpen?.NewEvent} onClose={() => setisDrawerOpen(!isDrawerOpen)} isrecursion={true}>
                <div>
                    <div className="details-drawer mb-4">
                        <p>45217A</p>
                        <p> Smith</p>
                        <p>Garda</p>
                    </div>
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container">
                            <p>Title :</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star">*</p>
                            <div className="inpt-sub-con">
                                <Input className="inp"
                                // onChange={(value) => drawrInptChng('LookupType', 'code', value.target.value)}
                                // value={drawerIpnuts?.LookupType?.code}  
                                />
                                {/* <h1 className="error-text"></h1> */}
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container">
                            <p>Invite Attendies</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star">*</p>
                            <div className="inpt-sub-con">
                                <Input className="inp"
                                // onChange={(value) => drawrInptChng('LookupType', 'code', value.target.value)}
                                // value={drawerIpnuts?.LookupType?.code}  
                                />
                                {/* <h1 className="error-text"></h1> */}
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container">
                            <p>Time </p>
                        </div>
                        <div className="inpt-con">
                            <p className="star-white">*</p>
                            <div className="inpt-sub-con">
                                <TimePicker.RangePicker format={format} style={{ width: '100%', borderRadius: '3px' }} />
                                {/* <h1 className="error-text"></h1> */}
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <div className="drawer-inpts-container" style={{ height: 'auto', }}>
                        <div className="drawer-lbl-container">
                            <p>Description </p>
                        </div>
                        <div className="inpt-con">
                            <p className="star-white">*</p>
                            <div className="inpt-sub-con">
                                <TextArea
                                    rows={7}
                                />
                                {/* <h1 className="error-text"></h1> */}
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <Table
                        pagination={false}
                        columns={column}
                        // dataSource={lookups}
                        // loading={lookupsloading}
                        className="drawer-tbl"
                        // rowClassName={(record, index) =>
                        //     index % 2 !== 0 ? "odd-row" : "even-row"
                        // }
                        // rowSelection={{
                        //     type: selectionType,
                        //     ...rowSelection,
                        // }}
                        bordered
                    />

                </div>
            </MyDrawer>
            {/* <AddNew  isModalOpen={addNew} handleOk={()=>setaddNew(!addNew)}  handleCancel={()=>setaddNew(!addNew)}/> */}
        </div>
    )
}

export default RosterDetails