import React from 'react'
import { CiMenuBurger } from "react-icons/ci";
import { Input } from 'antd'
import { BiSolidPrinter } from "react-icons/bi";
import ChatComponent from '../component/corespondence/ChatComponent'

const {Search} = Input;
function Doucmnets() {
  return (
    <div className='d-flex '>
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
            </div>
  )
}

export default Doucmnets