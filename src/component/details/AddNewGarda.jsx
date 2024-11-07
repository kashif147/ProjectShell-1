import React, { useState } from 'react'
import MyDrawer from '../common/MyDrawer'
import MySelect from '../common/MySelect';
import { Input, Button, DatePicker, Col, Row, Upload, Checkbox, Divider, Radio } from 'antd';
import MyDatePicker from '../common/MyDatePicker';
import { LoadingOutlined, UploadOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import { IoSettingsOutline } from "react-icons/io5";
import moment from 'moment';
const { TextArea } = Input;


function AddNewGarda({ open, onClose, }) {
    const inputsInitValue = {
        gardaRegNo: null,
        fullname: null,
        forename: null,
        surname: null,
        dateOfBirth: null,
        dateRetired: null,
        dateAged65: null,
        isDeceased: null,
        dateOfDeath: null,
        Partnership: null,
        stationPh: null,
        District: null,
        Division: null,
        isPensioner: null,
        pensionNo: null,
        duty: null,
        rank: null,
        graduated: null,
        isGRAMember: null,
        dateJoined: null,
        isJoined: null,
        attested: null,
        DateLeft: null,
        isLeft: null,
        isAssociateMember: null,
    };
    const [InfData, setInfData] = useState(inputsInitValue)
    const [ageOnNextBirthday, setAgeOnNextBirthday] = useState(null);
    const handleInputChangeWhole = (field, value) => {

        setInfData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const props = {
        action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
        onChange({ file, fileList }) {
            if (file.status !== 'uploading') {
                console.log(file, fileList);
            }
        },
        defaultFileList: [
            {
                uid: '1',
                name: 'khan.png',
                status: 'done',
                url: 'http://www.bise.com/khan.png',
                percent: 33,
            },
            {
                uid: '2',
                name: 'Error',
                status: 'done',
                url: 'http://www.bise.com/yyy.png',
            },
            {
                uid: '3',
                name: 'zzz.png',
                status: 'uploading',
                // custom error message to show
                url: 'http://www.bise.com/zzz.png',
            },
        ],
    };
    const [modalOpenData, setmodalOpenData] = useState({ Partnership: false, Children: false, TransferScreen: false })
    const openCloseModalsFtn = (key,) => {
        setmodalOpenData((prevState) => ({
            ...prevState,
            [key]: !modalOpenData[key],
        }));
    };
    const optionsWithDisabled = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Other', value: 'Other', disabled: true },
    ];
    const [value4, setValue4] = useState('Male');
    const onChange4 = ({ target: { value } }) => {
        console.log('radio4 checked', value);
        setValue4(value);
    };

    return (
        <MyDrawer title="New Garda Details" open={open} onClose={onClose} width='991px'>
            <div className="details-con-header1" >
                <Row>
                    <Col span={12}>

                        <div className="detail-sub-con detail-sub-con-ist" style={{ backgroundColor: 'white', border: 'none', height:'auto' }}>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Reg No :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <div style={{ display: 'flex', width: '100%', alignItems: 'baseline' }}>
                                        <div className="input-container-with-sup">
                                            <Input
                                                placeholder="Enter text"
                                                style={{ padding: '0px', width: '100%', borderRight: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px', padding: '0px', paddingLeft: '5px', margin: '0px', height: '33px' }} // Adjust border style
                                                suffix={<div className="suffix-container">
                                                    <IoSettingsOutline />
                                                </div>}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Title :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <div className="input-sub-con">
                                        <MySelect isSimple={true} placeholder='Mr.' />
                                        <h1 className="error-text">error-text</h1>
                                    </div>

                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Forename :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <div className="input-sub-con">
                                        <Input className="input" value={InfData?.forename} />
                                        <h1 className="error-text">error-text</h1>
                                    </div>
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Surname :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Input className="input" value={InfData?.surname} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Date of Birth :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <DatePicker
                                        style={{ width: "100%", borderRadius: "3px" }}
                                        value={InfData?.dateOfBirth ? moment(InfData.dateOfBirth, 'DD/MM/YYYY') : null} // Convert string to moment
                                        onChange={(date, dateString) => {
                                            handleInputChangeWhole('dateOfBirth', date ? date.format('DD/MM/YYYY') : null); // Pass the string value
                                        }}
                                        format='DD/MM/YYYY'
                                    />
                                    {/* <div className="ag-65"> */}{
                                        ageOnNextBirthday != null && (
                                            <p className="ag-65-title" >{`${ageOnNextBirthday} Yrs`}</p>
                                        )
                                    }

                                    {/* </div> */}
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Gender :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Radio.Group
                                            options={optionsWithDisabled}
                                            onChange={onChange4}
                                            value={value4}
                                            optionType="button"
                                            buttonStyle="solid"
                                        />
                                </div>
                            </div>
                          
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Building or House :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Input className="input" />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Street or Road :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Input className="input" />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Area or Town :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>

                                    <Input className="input" />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                  <div className="title-cont">
                    <p className="">County, City or Postcode :</p>
                  </div>
                  <div className="input-cont">
                    <p className="star">*</p>
                    <MySelect placeholder="Select City" isSimple={true} />
                  </div>
                </div>
                <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Eircode :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <Input className="input" />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Mobile :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Input className="input" placeholder="000-000-0000" />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Other Contact :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <Input className="input" placeholder="000-000-0000" />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Email :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Input className="input" />
                                </div>
                            </div>
                         
                        </div>
                    </Col>

                    <Col span={12} >

                        <div className="detail-sub-con" style={{ border: 'none', backgroundColor: 'white', height:'auto'}}>
                        <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Rank :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                      Select Rank
                    </Dropdown.Button> */}
                                    <MySelect placeholder='Select Rank' isSimple={true} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="lbl">Duty:</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                      Select Duty
                    </Dropdown.Button> */}
                                    <MySelect placeholder='Select Duty' isSimple={true} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Division :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <MySelect placeholder="Select Division" isSimple={true} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">District :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <MySelect placeholder="Select District" isSimple={true} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Station :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <div style={{ display: 'flex', width: '100%' }}>
                                        {/* <div className="input-container-with-sup"> */}
                                        {/* <Input
                        placeholder="Enter text"
                        style={{ width: '100%', borderRight: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px', padding: '0px', paddingLeft: '5px', margin: '0px', height: '33px' }} // Adjust border style
                        suffix={<div className="suffix-container">
                          <BsThreeDots />
                        </div>}
                      /> */}
                                        {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                        Select Station
                      </Dropdown.Button> */}
                                        <MySelect placeholder='Select Station' isSimple={true} />
                                    </div>
                                    <Button className="butn primary-btn detail-btn ms-2"
                                        onClick={() => openCloseModalsFtn("TransferScreen")}
                                    >
                                        Tr
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="lbl-txtarea-2">
                                <div className="title-cont-txtarea">
                                    <p className=""></p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <TextArea rows={2} style={{ width: "100%", borderRadius: "3px", borderColor: 'D9D9D9' }} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Station Phone : </p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <Input value={InfData?.gardaRegNo} />
                                </div>
                            </div>
                            
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Templemore :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <MyDatePicker className="date-picker" isSimple={true} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Retired :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <div className="checkbox-con">
                                        <div style={{ backgroundColor: "white", marginRight: '8px', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                            <Checkbox
                                                onChange={(e) => { handleInputChangeWhole('isPensioner', e.target.checked) }}
                                                checked={InfData?.isPensioner}
                                            />
                                        </div>
                                        <MyDatePicker disabled={!InfData?.isPensioner}
                                            onChange={(date, dateString) => {
                                                handleInputChangeWhole('dateRetired', date ? date.format('DD/MM/YYYY') : null); // Pass the string value
                                            }}
                                            value={InfData?.dateRetired ? moment(InfData?.dateRetired, 'DD/MM/YYYY') : null} />
                                    </div>
                                </div>
                            </div>

                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Pension No :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <Input
                                        type="text"
                                        placeholder="Enter something..."
                                        disabled={!InfData?.isPensioner}
                                        value={InfData?.pensionNo}
                                    />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Class  :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star">*</p>
                                    <Input />
                                </div>
                            </div>
                           
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Attested :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <MyDatePicker style={{ width: "100%", borderRadius: "3px" }} />
                                </div>
                            </div>
                            <div className="lbl-inpt">
                                <div className="title-cont">
                                    <p className="">Graduation :</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <MyDatePicker className="date-picker" />
                                </div>
                            </div>
                            <div className="lbl-txtarea-2">
                                <div className="title-cont-txtarea">
                                    <p className="">Notes</p>
                                </div>
                                <div className="input-cont">
                                    <p className="star-white">*</p>
                                    <TextArea rows={2} style={{ width: "100%", borderRadius: "3px", borderColor: 'D9D9D9' }} />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>

                    </Col>
                </Row>
            </div>
        </MyDrawer>
    )
}

export default AddNewGarda


