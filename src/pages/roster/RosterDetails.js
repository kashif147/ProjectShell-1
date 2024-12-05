import {React,useState} from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import { Button, Select, } from 'antd'
import { FaAngleRight } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import moment from 'moment'
import '../../styles/Roster.css'
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment)


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
const [activeKey, setactiveKey] = useState('1')
    const myEventsList = [
        { title: 'Meeting', start: new Date(), end: new Date(), allDay: false },
    ];
    const handleNewFtn = () =>{
        // if(activeKey==="1"){
        //    setactiveKey('1')
        // }
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
                        {activeKey==="1"?"New Event": activeKey==="2"?"New Email":activeKey==="3"?"New Letter":activeKey==="4"?"New SMS":null}
                    </Button>
                    <Select
                        onChange={handleOptionSelect} // Trigger internal function
                        style={{ borderLeft:'none', borderColor:'red',backgroundColor:"#215E97" }} 
                        value={null}
                        dropdownStyle={{ width: '10%' }}
                    >
                        {options.map((option) => (
                            <Select.Option  key={option.key} value={option.label}>
                            </Select.Option>
                        ))}
                    </Select>
                    </div>
              
                    <Button onClick={goToNext} className="me-1 gray-btn butn" >
                    <FaAngleLeft className="deatil-header-icon" />

                  </Button>
                    <Button className="gray-btn butn" onClick={goToToday}>Today</Button>
                    <Button  onClick={goToBack} className="me-1 gray-btn butn" style={{ marginLeft: "8px" }}>
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
        <div>
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
        </div>
    )
}

export default RosterDetails