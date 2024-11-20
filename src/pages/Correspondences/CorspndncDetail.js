import { useState } from 'react'
import ChatComponent from '../../component/corespondence/ChatComponent'
import '../../styles/Correspondence.css'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import { Flex, Radio, Tabs, Input, Button, Menu, Dropdown, Select, Table, Checkbox, Space } from 'antd';
import { FiRefreshCcw } from "react-icons/fi";
import { CiMenuBurger } from "react-icons/ci";
import icon from '../../assets/images/Vector.png'
import { FiCornerUpLeft } from "react-icons/fi";
import { RiCornerUpLeftDoubleLine } from "react-icons/ri";
import { IoReturnUpForwardSharp } from "react-icons/io5";
import { FiCornerUpRight } from "react-icons/fi";
import { useMsal } from '@azure/msal-react';
// import { getGraphClient } from '../graphClient';
import { getGraphClient } from '../../component/msft/graphClient';
import { PiArrowSquareIn } from "react-icons/pi";
import { BiSolidPrinter } from "react-icons/bi";
import MyDrawer from '../../component/common/MyDrawer';
import MySelect from '../../component/common/MySelect';
import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
function CorspndncDetail() {
    const {TextArea} = Input;
    const { Search } = Input;
    const [key, setKey] = useState();
    const [path, setPath] = useState('/projectShell');

    const handleFolderClick = (newPath) => {
      setPath(newPath);
    };
  
    const refreshFileList = () => {
      // This will trigger the useEffect in FileList
      setPath((prevPath) => prevPath);
    };
    const { instance, accounts } = useMsal();
    const [fileUrl, setFileUrl] = useState(null);
    const openCloseDrawerFtn = (name) => {
        setDrawerOpen((prevState) => ({
          ...prevState,
          [name]: !prevState[name]
        }))
      }
    const [drawerOpen, setDrawerOpen] = useState({
        NewCall:false
    })
      
    const handleMenuClick = ({ key }) => {
        // setSelectedValue(getDefaultValue(Number(key))); // Update selected value

        // Execute corresponding function
        // switch (Number(key)) {
        //   case 1:
        //     handleNewEmail();
        //     break;
        //   case 2:
        //     handleNewCall();
        //     break;
        //   case 3:
        //     handleNewLetter();
        //     break;
        //   case 4:
        //     handleNewSMS();
        //     break;
        //   default:
        //     break;
        // }
    };
    const createDocument = async ( ) => {
      debugger
      const graphClient = getGraphClient(instance, accounts);
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const documentName = `NewDocument_${timestamp}.docx`;
  
      const driveItem = {
        name: documentName,
        file: {},
      };
  
      try {
        // Use currentPath instead of hardcoded '/projectShell'
        const response = await graphClient.api(`/me/drive/root:${path}:/children`).post(driveItem);
        if (response && response.webUrl) {
          setFileUrl(response.webUrl);
          // alert('Document Created. Please rename and save it in Word Online.');
          window.open(response.webUrl, '_blank');
          refreshFileList(); // Refresh the file list after creating the document
        } else {
          // alert('Error: Failed to create document.');
          console.log('Error: Failed to create document.')
        }
      } catch (error) {
        console.error('Error creating document:', error.message);
        // alert('Error: Failed to create document.');
      }
    };
    const options = [
        {
            label: 'New Email',
            value: 'New Email',
        },
        {
            label: 'New Call',
            value: 'New Call',
        },
        {
            label: 'New Letter',
            value: 'New Letter',
        },
        {
            label: 'New SMS',
            value: 'New SMS',
        },

    ];
    const bondOptions = [
        {
            label: 'In bound',
            value: 'In bound',
        },
        {
            label: 'Out bound',
            value: 'Out bound',
        },

    ];
    const items = [
        {
            key: '1',
            label: <div className='d-flex align-items-center'>
                <img src={icon} style={{ width: '18px', height: '18px', marginRight: '4px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '400', marginLeft: "10px" }}>
                    Email
                </h4>
                <div className='d-flex justify-content-center align-items-center' style={{ width: "31px", height: '20px', backgroundColor: '#E6F7FF', borderRadius: '100px', margin: '0px' }}>
                    <h4 className='' style={{ color: "#215E97", fontSize: '10px', fontWeight: '400', margin: '0px' }}>99</h4>
                </div>
            </div>
            ,
            children: <div className='d-flex '>
                <div className='chat-container pe-4'>
                    <div className='d-flex justify-content-evenly align-items-center' style={{ height: '70px' }}>
                        <Radio.Group
                            block
                            options={bondOptions}
                            defaultValue="In bound"
                            optionType="button"
                            buttonStyle="solid"
                        />
                        <Search
                            placeholder="Search"
                            // onSearch={onSearch}
                            style={{
                                width: 200,
                            }}
                        />
                        <CiMenuBurger fontSize={"24px"} />
                        <FiRefreshCcw fontSize={"24px"} />
                    </div>
                    <ChatComponent isborder={true} />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                </div>
                <div className='chat-detail-container'>
                    <div className='d-flex align-items-baseline justify-content-between'>
                        <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Ant Design Part 01</h2>
                        <div >
                            <FiCornerUpLeft style={{ color:'#215E97',fontSize: '26px' }} />
                            <RiCornerUpLeftDoubleLine style={{color:'#215E97', fontSize: '26px' }} />
                            <FiCornerUpRight style={{ color:'#215E97',fontSize: '26px' }} />
                            {/* <IoReturnUpForwardSharp style={{color:'#215E97', fontSize: '26px' }} /> */}
                            <PiArrowSquareIn style={{ color:'#215E97',fontSize: '26px' }} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginLeft: '25px', marginTop: '15px' }}>  John Doe &lt;john.doe@gra.ie&gt;</h2>
                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: '10px' }}> To: &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ fontSize: "13px", fontWeight: 400, color: '#00000073' }}>info@gra.ie; secretary@gra.ie</span> </h2>
                    <h2 style={{ fontSize: '28px', color: '#000000D9', marginTop: '25px' }}>Introduction</h2>
                    <h2 style={{ fontSize: '13px', fontWeight: '400' }}>
                        In the process of internal desktop applications development, many different design specs and implementations would be involved, which might cause designers and developers difficulties and duplication and reduce the efficiency of development.
                    </h2>
                    <h2 style={{ fontSize: '13px', fontWeight: '400', marginTop: '5px' }}>
                        After massive project practice and summaries, Ant Design, a design language for background applications, is refined by Ant UED Team, which aims to uniform the user interface specs for internal background projects, lower the unnecessary cost of design differences and implementation and liberate the resources of design and front-end development                    </h2>
                </div>
            </div>,
        },
        {
            key: '2',
            label: <div className='d-flex align-items-center'>
                <img src={icon} style={{ width: '18px', height: '18px', marginRight: '4px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '400', marginLeft: "10px" }}>
                    Calls
                </h4>
                <div className='d-flex justify-content-center align-items-center' style={{ width: "31px", height: '20px', backgroundColor: '#E6F7FF', borderRadius: '100px', margin: '0px' }}>
                    <h4 className='' style={{ color: "#215E97", fontSize: '10px', fontWeight: '400', margin: '0px' }}>5</h4>
                </div>
            </div>,
            children: <div className='me-4 call-container pt-4'>
                <div className='row'>
                    <div className='col-md-4'>
                    </div>
                    <div className='col-md-4'>
                        <Search style={{ width: "75%", height: '36px', marginRight: '10px' }} />
                        <CiMenuBurger fontSize={24} />
                    </div>
                </div>
                <div className='d-flex justify-content-around top-des call-container'>
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>
                        Subject matter: <span style={{ fontSize: '14px', fontWeight: '400' }}> [Message]:</span>
                    </h4>
                    <h4>
                        Message For :
                    </h4>
                    <h4>
                        Source Division :
                    </h4>
                    <h4>
                        Reg No :
                    </h4>
                    <h4>
                        Name :
                    </h4>
                    <h4>
                        Callback No :
                    </h4>
                    <h4>
                        Callback No :
                    </h4>
                </div>
                <div className='call-container'>

                    <ChatComponent isSimple={false} isborder={true} />
                    <ChatComponent isSimple={false} />
                    <ChatComponent isSimple={false} />
                    <ChatComponent isSimple={false} />
                    <ChatComponent isSimple={false} />
                </div>
            </div>,
        },
        {
            key: '3',
            label: <div className='d-flex align-items-center'>
                <img src={icon} style={{ width: '18px', height: '18px', marginRight: '4px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '400', marginLeft: "10px" }}>
                    Letters
                </h4>
                <div className='d-flex justify-content-center align-items-center' style={{ width: "31px", height: '20px', backgroundColor: '#E6F7FF', borderRadius: '100px', margin: '0px' }}>
                    <h4 className='' style={{ color: "#215E97", fontSize: '10px', fontWeight: '400', margin: '0px' }}>1</h4>
                </div>
            </div>
            ,
            children: <div className='d-flex '>
                <div className='chat-container pe-4'>
                    <div className='d-flex justify-content-center align-items-center' style={{ height: '70px' }}>
                        <>
                            <Search
                                placeholder="Search"
                                // onSearch={onSearch}
                                style={{
                                    width: "65%",
                                    borderRadius: "10px"
                                }}
                            />
                            <CiMenuBurger fontSize={"24px"} className='ms-4' />
                        </>
                    </div>
                    <ChatComponent isborder={true} />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                    <ChatComponent />
                </div>
                <div className='chat-detail-container'>
                    <div className='d-flex align-items-baseline justify-content-end'>
                        <div >
                            <BiSolidPrinter fontSize={'27px'} color='#215E97' />
                        </div>
                    </div>

                    <h2 style={{ fontSize: '16px', fontWeight: '600', marginTop: '10px' }}>
                        Birthday Wish Letter Sample
                    </h2>
                    <h2 className='lh-base' style={{ fontSize: '14px', fontWeight: '400', marginBottom: '30px' }}>
                        From:
                        <br></br>
                        Leanne Koocher ,
                        <br></br>
                        7889, Pearl Street<br></br>
                        Behind first Lane ,<br></br>
                        Vellore, Shanghai 4945<br></br>
                        China.
                    </h2>
                    <h2 className='lh-base' style={{ fontSize: '14px', fontWeight: '400', marginBottom: '30px' }}>
                        To:<br></br>
                        Natty Peterson,<br></br>
                        5839, DuckLane 5,<br></br>
                        Quad, KG 48495<br></br>
                        21 May, 2014.<br></br>
                    </h2>
                    <h2 className='lh-base' style={{ fontSize: '14px', fontWeight: '400', marginBottom: '10px' }}>


                        Dear Natty,
                        SUBJECT: LETTER OF BIRTHDAY WISHES<br></br>
                        How are you, hope you are doing well. The letter which I am writing to you, it is with a heart full of excitement, joy and happiness. First of all I would like to feel sorry that I am not available there with you as I got some urgent work .Why I am writing this letter to you is quite obvious considering the fact that we are celebrating your birthday. Natty, although you are still a young lady, your life has been a blessing to all those around you.
                        I must say that being your friend and companion over the years is one of my greatest sources of joy and happiness. I personally learnt so many things from you which is good for my future .You have positively affected my life in various ways, even in ways that you have never thought of yourself. At the end I wish you a good luck for your life. May you live long in good health and wealth.
                        Affectionately yours,
                        Leanne
                    </h2>
                </div>
            </div>,
        },
        {
            key: '4',
            label: <div className='d-flex align-items-center'>
                <img src={icon} style={{ width: '18px', height: '18px', marginRight: '4px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: '400', marginLeft: "10px" }}>
                    SMS
                </h4>
                <div className='d-flex justify-content-center align-items-center' style={{ width: "31px", height: '20px', backgroundColor: '#E6F7FF', borderRadius: '100px', margin: '0px' }}>
                    <h4 className='' style={{ color: "#215E97", fontSize: '10px', fontWeight: '400', margin: '0px' }}>99</h4>
                </div>
            </div>
            ,
            children: <div className='me-4 call-container pt-4'>
                <div className='row'>
                    <div className='col-md-4'>
                    </div>
                    <div className='col-md-4'>
                        <Search style={{ width: "75%", height: '36px', marginRight: '10px' }} />
                        <CiMenuBurger fontSize={24} />
                    </div>
                </div>
                <div className='d-flex justify-content-around top-des call-container'>
                    <h4 style={{ fontSize: '14px', fontWeight: '600' }}>
                        Subject matter: <span style={{ fontSize: '14px', fontWeight: '400' }}> [Message]:</span>
                    </h4>
                    <h4>
                        Message For :
                    </h4>
                    <h4>
                        Source Division :
                    </h4>
                    <h4>
                        Reg No :
                    </h4>
                    <h4>
                        Name :
                    </h4>
                    <h4>
                        Callback No :
                    </h4>
                    <h4>
                        Callback No :
                    </h4>
                </div>
                <div className='call-container'>

                    <ChatComponent isSimple={false} isborder={true} />
                    <ChatComponent isSimple={false} />
                    <ChatComponent isSimple={false} />
                    <ChatComponent isSimple={false} />
                    <ChatComponent isSimple={false} />
                </div>
            </div>,
        },
    ];

    const menu = (
        <Menu onClick={handleMenuClick}>
            <Menu.Item key="1">New Email</Menu.Item>
            <Menu.Item key="2">New Call</Menu.Item>
            <Menu.Item key="3">New Letter</Menu.Item>
            <Menu.Item key="4">New SMS</Menu.Item>
        </Menu>
    );
    const [activeKey, setactiveKey] = useState("1")
    const handleOptionSelect = (value) => {
        switch (value) {
          case "New Email":
            setactiveKey("1");
            break;
          case "New Call":
            setactiveKey("2");
            break;
          case "New Letter":
            setactiveKey("3");
            break;
          case "New SMS":
            setactiveKey("4");
            break;
          default:
            console.error("Invalid value provided");
        }
      };
      const handleNewFtn = () =>{
        if(activeKey==="1"){
            window.open('https://outlook.office.com/mail/deeplink/compose', '_blank');
        }
        else if (activeKey==="2"){
            openCloseDrawerFtn('NewCall')
        }
        else if (activeKey=="3"){
          createDocument()
        }
      }
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

const contactClm = [
  {
    title: "Message For",
    dataIndex: "messageFor",
    key: "messageFor",
  },
  {
    title: "Source Division",
    dataIndex: "sourceDivision",
    key: "sourceDivision",
  },
  {
    title: "Subject Matter",
    dataIndex: "subjectMatter",
    key: "subjectMatter",
  },
  {
    title: "Reg No",
    dataIndex: "regNo",
    key: "regNo",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Callback No",
    dataIndex: "callbackNo",
    key: "callbackNo",
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
  },
  {
    title: "Active",
    dataIndex: "callResolved",
    key: "callResolved",
    render: (index, record) => (
      <Checkbox checked={record?.callResolved}>
      </Checkbox>
    ),
  },
  {
    title: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
        Action
      </div>
    ),
    key: "action",
    align: "center",
    render: (_, record) => (
      <Space size="middle">
        <FaEdit
          size={16}
          style={{ marginRight: "10px" }}
        //   onClick={() => {
        //     IsUpdateFtn("Lookup", !IsUpdateFtn?.Lookup, record);
        //     addIdKeyToLookup(record?._id, "Lookup");
        //   }}
        />
        <AiFillDelete
          size={16}
        //   onClick={() =>
        //     MyConfirm({
        //       title: "Confirm Deletion",
        //       message: "Do You Want To Delete This Item?",
        //       onConfirm: async () => {
        //         await deleteFtn(`${baseURL}/region`, record?._id);
        //         dispatch(getAllLookups());
        //         resetCounteries("Lookup");
        //       },
        //     })
        //   }
        />
      </Space>
    ),
  },
];

    return (
        <div className='corespndence-main'>
            <div style={{ height: '25px', backgroundColor: '#e6f8ff' }}
            >
            </div>
            <Tabs
                defaultActiveKey="1"
                items={items}
                onChange={(e) => setactiveKey(e)}
                tabBarExtraContent={
                    <>
                    <Button className='new-btn' onClick={handleNewFtn}>
                        {activeKey==="1"?"New Email": activeKey==="2"?"New Call":activeKey==="3"?"New Letter":activeKey==="4"?"New SMS":null}
                    </Button>
                    <Select
                        key={key} // Force reset on each selection
                        onChange={handleOptionSelect} // Trigger internal function
                        style={{ borderLeft:'none', borderColor:'red',backgroundColor:"#215E97" }} 
                        // Set dropdown button width
                        value={null}
                        dropdownStyle={{ width: '10%' }}
                    >
                        {options.map((option) => (
                            <Select.Option  key={option.key} value={option.label}>
                          
                            </Select.Option>
                        ))}
                    </Select>
                    </>
                }
            />




<MyDrawer title='New Call' open={drawerOpen?.NewCall} isPagination={true} 
onClose={() => {openCloseDrawerFtn('NewCall')}}
//         IsUpdateFtn('Lookup', false, )
//       }}
        // add={async () => {
        //   await insertDataFtn(
        //     `${baseURL}/region`,
        //     { 'region': drawerIpnuts?.Lookup },
        //     'Data inserted successfully',
        //     'Data did not insert',
        //     () => resetCounteries('Lookup', () => dispatch(getAllLookups()))
        //   );
        //   dispatch(getAllLookups())
        // }}
        // isEdit={isUpdateRec?.Lookup}
        // update={
        //   async () => {
        //    await updateFtn('/region', drawerIpnuts?.Lookup,() => resetCounteries('Lookup', () => dispatch(getAllLookups())))
        //    dispatch(getAllLookups())
        //    IsUpdateFtn('Lookup', false, )
        //   }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Message For :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                <Input />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Source Division :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
               <MySelect isSimple={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Subject matter :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
               <MySelect isSimple={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Reg No :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Callback No :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container" style={{height:'150px'}}>
              <div className="drawer-lbl-container">
                <p>Message :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <TextArea rows={5} />
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
                    // onChange={(e) => drawrInptChng('LookupType', 'isActive', e.target.checked)}
                    checked={true}
                  >Call resolved at Reception</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={contactClm}
            //   dataSource={lookups}
            //   loading={lookupsloading}
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
        </div>
      </MyDrawer>
        </div>
    )
}

export default CorspndncDetail