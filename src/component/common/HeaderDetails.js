import {useState,React} from 'react'
import { useLocation } from 'react-router-dom';
import { RightOutlined,PlusOutlined, MenuFoldOutlined,
    MenuUnfoldOutlined, } from '@ant-design/icons';
import { Input, Button } from 'antd';
import MySelect from './MySelect';
import SideNav from './SideNav';
import { FaLess } from 'react-icons/fa';
import MyDrowpDown from './MyDrowpDown';
import {SerachFitersLookups} from "../../Data"

function HeaderDetails() {
    const { Search } = Input;
    const location = useLocation();
    const currentURL = `${location?.pathname}`;
    const nav = location?.pathname || '';
    const formattedNav = nav.replace(/^\//, '');
    console.log(location,"123")
    const [isSideNav, setisSideNav] = useState(true)
   
    const mriatalStatus = [
        {
          label: "Single",
          key: '1',
        },
        {
          label: 'Married',
          key: '2',
        },
        {
          label: "Seperated",
          key: '3',
        },
        {
          label: "Divorced",
          key: '4',
        },
      ];
    const SubscriptionsLookups1 = [
        {
          label: "Single",
          key: '1',
        },
        {
          label: 'Married',
          key: '2',
        },
        {
          label: "Seperated",
          key: '3',
        },
        {
          label: "Divorced",
          key: '4',
        },
      ];
const Gender= [
    {
      key: '1',
      label: "Male",
    },
    {
      key: '2',
      label: "Female",
    },
    {
      key: '3',
      label: "Other",
    },
   
  ]
  const [selectedValue, setSelectedValue] = useState(null);

  const handleChange = value => {
    setSelectedValue(value);
  };
const SubscriptionsLookups = [];
  SerachFitersLookups?.SubscriptionsLookups.map((item)=>{
    let obj = {
      key:item?.key,
      label:item?.label
    } 
    SubscriptionsLookups.push(obj)
  })
  console.log(location?.state?.search,"21")
  return (
    <div className='details-header d-flex w-100%'>
       <div style={{width:"100%"}}>
        <div className='d-flex ' style={{paddingLeft:"10px",paddingRight:"10px"}}>
      <p className='bred-cram-main'>
       { nav=="/"?`Details  /  ${location?.state?.search}` :` ${location?.state?.search}  / ${formattedNav}`}
      </p>
        </div>
        <div className='search-main'>
            <div className='title d-flex justify-content-between'  style={{paddingLeft:"10px",paddingRight:"10px"}} >
            <h2 style={{fontSize:"20px", marginBottom:"1rem"}}>Issues</h2>
            <div>
              
               <Button className='me-1 btn'>Export</Button>
               <Button className='me-1'>Share</Button>
               <Button className='me-1'>DETAILS VIEW</Button>
               <Button className='me-1'>LIST VIEW</Button>
            </div>
            </div>
            <div className='d-flex search-fliters'>
        <Search placeholder='Search by name'  type='search' style={{width:'15%'}} className="margin" />
        <MySelect placeholder={"Gender"} className="margin" options={Gender} />
        <MySelect placeholder={"Partnership"} options={mriatalStatus} />
        {/* <MyDrowpDown title={"Partnership"} style={{width:'12.5%'}} items={mriatalStatus}  className="margin" /> */}
        <Input placeholder='Search by name'  type='search' style={{width:'12.5%'}} className="margin" />
        <Input  type='search' style={{width:'12.5%'}} className="margin" />
        <Input  type='search' style={{width:'12.5%'}} className="margin" />
        <MySelect placeholder={"Subscriptions"} options={SubscriptionsLookups} />
        {/* <MySelect placeholder={"Project"} className="margin" />
        <MySelect placeholder={"Project"} className="margin" />
        <MySelect placeholder={"Assignee"} className="margin" />
        <Button className='margin'>
            More <PlusOutlined />
        </Button> */}
       
            </div>
        </div>
        </div>
    </div>
  )
}

export default HeaderDetails
