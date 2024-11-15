import React from 'react'
import ChatComponent from '../../component/corespondence/ChatComponent'
import '../../styles/Correspondence.css'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import { Flex, Radio, Tabs, Input } from 'antd';
import { FiRefreshCcw } from "react-icons/fi";
import { CiMenuBurger } from "react-icons/ci";
import icon from '../../assets/images/Vector.png'
import { FiCornerUpLeft } from "react-icons/fi";
import { RiCornerUpLeftDoubleLine } from "react-icons/ri";
import { FiCornerUpRight } from "react-icons/fi";
import { PiArrowSquareIn } from "react-icons/pi";
import { BiSolidPrinter } from "react-icons/bi";


function CorspndncDetail() {
    const { Search } = Input;
    const options = [
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
                            options={options}
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
                            <FiCornerUpLeft style={{ fontSize: '26px' }} />
                            <RiCornerUpLeftDoubleLine style={{ fontSize: '26px' }} />
                            <PiArrowSquareIn style={{ fontSize: '26px' }} />
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
                    <div className='col-md-4 '>
                    </div>
                    <div className='col-md-4'>
                        <Search style={{ width: "75%", height: '36px', marginRight:'10px' }} />
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
                            <BiSolidPrinter fontSize={'27px'} />
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
            children: "tab 4",
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
            />
        </div>
    )
}

export default CorspndncDetail