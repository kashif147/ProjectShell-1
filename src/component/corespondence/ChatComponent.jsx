import React from 'react'
import avator from '../../assets/images/Avatar.png'
import { PiDotsThreeBold } from "react-icons/pi";

function ChatComponent({ isborder = false, isSimple = true, }) {
    return (

        <div className={`p-2 row chat-main cursor-pointer h-auto ${isborder == true ? 'border1' : ''}`} >
            {
                isSimple == true ?
                    <>
                        <div className='col-md-2 cursor-pointer' style={{ '--bs-gutter-x': '0rem', '--bs-gutter-y': '0rem' }}>
                            <img src={avator} style={{ width: "32px" }} />
                        </div>

                        <div className='col-md-8'>
                            <h5 style={{ fontSize: '16px', fontWeight: 500, cursor: 'pointer' }}>Ant Design Part 01</h5>
                            <div className='d-flex '>

                                <h4 style={{ overflow: 'hidden', fontSize: '14px', cursor: 'pointer', fontWeight: '400', color: '#00000073' }}>
                                    Ant Design, a design language for background applications, is refined by Ant UED Team.
                                </h4>
                            </div>
                        </div>
                        <div className='col-md-2 cursor-pointer'>
                         <p style={{color:'#333333'}}>
                         Content
                            </p>   
                        </div>
                    </>
                    :
                    <>
                        <div className='col-md-10 cursor-pointer' style={{ '--bs-gutter-x': '0rem', '--bs-gutter-y': '0rem' }}>
                            <div className='row'>
                                <div className='col-md-1 justify-content-end'>
                                    <img src={avator} style={{ width: "32px" }} />
                                </div>
                                <div className='col-md-11'>
                                    <h5 style={{ fontSize: '16px', fontWeight: 500, cursor: 'pointer' }}>Ant Design Part 01</h5>
                                    <h4 style={{ overflow: 'hidden', fontSize: '14px', cursor: 'pointer', fontWeight: '400', color: '#00000073' }}>
                                        Ant Design, a design language for background applications, is refined by<br></br> Ant UED Team.
                                    </h4>

                                </div>
                            </div>
                        </div>
                        <div className='col-md-2 cursor-pointer d-flex align-items-center '>
                            <div className='d-flex justify-content-evenly align-items-center align-items-center' style={{ height: '78px' }}>
                                <p className='me-2' style={{color:'#333333'}}>Content</p>
                                <p className='me-2' style={{color:' #1890FF'}}>Edit</p>
                                <p className='me-2' style={{color:' #1890FF'}}>Delete</p>
                                <PiDotsThreeBold style={{color:' #1890FF'}} className='me-2' />
                            </div>
                        </div>
                    </>

            }

        </div>
    )
}

export default ChatComponent