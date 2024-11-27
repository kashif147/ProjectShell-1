import { useState, useEffect } from 'react'
import {  Space,Input, Checkbox,Menu,Dropdown,Button,Table } from 'antd'
import { DownOutlined } from "@ant-design/icons";
import moment from 'moment'
import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import { useLocation } from 'react-router-dom';

import MySelect from '../common/MySelect'
import MyDatePicker from '../common/MyDatePicker';
import MyDrawer from '../common/MyDrawer'
import { useTableColumns } from '../../context/TableColumnsContext ';


const { Search, TextArea } = Input
function CreateClaim() {
    const location = useLocation()
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    }
  };
  const GardaReviewColumns = [
    {
      title: 'Start Date',
      dataIndex: 'gardaRegNo',
      key: 'gardaRegNo',
    },
    {
      title: 'End Date',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date) => (date ? moment(date).format('DD/MM/YYYY') : ''),
    },
    {
      title: 'Notese',
      dataIndex: 'Notes',
      key: 'Notes',
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
  ]
    const { ProfileDetails, topSearchData, rowIndex, } = useTableColumns()
    const [modalOpenData, setmodalOpenData] = useState({
        Partnership: false, Children: false,
        TransferScreen: false, criticalIllnessScheme: false, GardaReviews: false,
        Committees: false,
        PartnerLifeAssuranceClaim: false,
        GardaLifeAssuranceClaim: false,
        GardaLegalAidScheme: false
    })
    const [InfData, setInfData] = useState()
    const openCloseModalsFtn = (key,) => {
        setmodalOpenData((prevState) => ({
            ...prevState,
            [key]: !modalOpenData[key],
        }));
    };
    const criticalIllnessSchemeClm = [
        {
          title: 'Claim Type',
          dataIndex: 'gardaRegNo',
          key: 'gardaRegNo',
        },
        {
          title: 'Claim Reason',
          dataIndex: 'dateOfBirth',
          key: 'dateOfBirth',
          render: (date) => (date ? moment(date).format('DD/MM/YYYY') : ''),
        },
        {
          title: 'Claim Date',
          dataIndex: 'Notes',
          key: 'Notes',
        },
        {
          title: 'Beneficiary',
          dataIndex: 'Notes',
          key: 'Notes',
        },
        {
          title: 'Child Name',
          dataIndex: 'Notes',
          key: 'Notes',
        },
        {
          title: 'Partner Name',
          dataIndex: 'Notes',
          key: 'Notes',
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
    
      ]
     
      const PartnerLifeAssuranceClaimClm = [
        {
          title: 'Transfer Date',
          dataIndex: 'gardaRegNo',
          key: 'gardaRegNo',
        },
        {
          title: 'Station From',
          dataIndex: 'dateOfBirth',
          key: 'dateOfBirth',
          render: (date) => (date ? moment(date).format('DD/MM/YYYY') : ''),
        },
        {
          title: 'Station To',
          dataIndex: 'Notes',
          key: 'Notes',
        },
        {
          title: 'Notes',
          dataIndex: 'Notes',
          key: 'Notes',
        },
        {
          title: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              Action
              <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />
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
    
      ]
    useEffect(() => {
        let profils;
        if (ProfileDetails) {
            profils = {
                gardaRegNo: ProfileDetails[0]?.regNo,
                fullname: ProfileDetails[0]?.fullName,
                forename: ProfileDetails[0]?.forename,
                surname: ProfileDetails[0]?.surname,
                dateOfBirth: ProfileDetails[0]?.dateOfBirth,
                dateRetired: ProfileDetails[0]?.dateRetired == 'N/A' ? null : ProfileDetails[0]?.dateRetired,
                dateAged65: ProfileDetails[0]?.dateAged65,
                isDeceased: ProfileDetails[0]?.dateOfDeath == "N/A" ? false : true,
                dateOfDeath: ProfileDetails[0]?.dateOfDeath == 'N/A' ? null : ProfileDetails[0]?.dateOfDeath,
                Partnership: ProfileDetails[0]?.Partnership,
                stationPh: ProfileDetails[0]?.stationPhone,
                District: ProfileDetails[0]?.district,
                Division: ProfileDetails[0]?.division,
                isPensioner: ProfileDetails[0]?.pensionNo ? true : false,
                pensionNo: ProfileDetails[0]?.pensionNo,
                duty: ProfileDetails[0]?.duty,
                rank: ProfileDetails[0]?.rank,
                graduated: ProfileDetails[0]?.graduated,
                isGRAMember: ProfileDetails[0]?.graMember ? true : false,
                dateJoined: ProfileDetails[0]?.dateJoined,
                isJoined: true,
                attested: ProfileDetails[0]?.attested,
                DateLeft: ProfileDetails[0]?.dateLeft,
                isLeft: true,
                isAssociateMember: ProfileDetails[0]?.associateMember === "yes" ? true : false,
            };
            setInfData(profils);
        }

    }, [ProfileDetails]);
    const handleInputChangeWhole = (field, value) => {

        setInfData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    console.log(InfData, "77")
    useEffect(() => {
        return () => {
            setInfData({});
        };
    }, [location?.pathname]);
    const [drawer, setdrawer] = useState(false)
    const menu = (
        <Menu>
            <Menu.Item key="1">
                <Search />

            </Menu.Item>
            <Menu.Item key="2"  onClick={() => openCloseModalsFtn("GardaLifeAssuranceClaim")}>
            <Checkbox checked={drawer} className="subs-chkbx" >
                      Life Assurance (Member)
                    </Checkbox>

            </Menu.Item>
            <Menu.Item key="3">
            <Checkbox checked={drawer} className="subs-chkbx" onChange={() => openCloseModalsFtn("PartnerLifeAssuranceClaim")}>
                      Life Assurance (Partner)
                    </Checkbox>

            </Menu.Item>
            <Menu.Item key="4">
            <Checkbox checked={drawer} className="subs-chkbx" onChange={() => openCloseModalsFtn("criticalIllnessScheme")}>
                      Critical Illness (Member)
                    </Checkbox>

            </Menu.Item>
            <Menu.Item key="5">
            <Checkbox checked={drawer} className="subs-chkbx">
                      Critical Illness (Partner)
                    </Checkbox>

            </Menu.Item>
            
        </Menu>
    )
    return (
        <div>
            <Dropdown
                overlay={menu}
                trigger={["click"]}
                placement="bottomLeft"
                overlayStyle={{ width: 200, padding: "0px" }}
               
            >
                <Button  style={{marginRight:'50px'}} className="butn primary-btn">Create <DownOutlined /></Button>

            </Dropdown>
            <MyDrawer title='Critical Illness Scheme'
                open={modalOpenData?.criticalIllnessScheme} onClose={() => openCloseModalsFtn("criticalIllnessScheme")}
                isPyment={true}
                InfData={InfData}
                width='785px' >
                <div className="drawer-main-cntainer">
                    <div className="details-drawer mb-4">
                        <p>{InfData?.gardaRegNo}</p>
                        <p>{InfData?.fullname}</p>
                        <p>Garda</p>
                    </div>
                    <div className="d-flex">
                        <div className="w-50  ">
                            <div className="body-container">
                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Joining Date :</p>
                                    </div>
                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <MyDatePicker />
                                        </div>

                                    </div>
                                </div>
                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Claim Type : </p>
                                    </div>
                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <MySelect isSimple={true} placeholder='Claim Type' />
                                        </div>

                                    </div>
                                </div>
                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Claim Date :</p>
                                    </div>
                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <MyDatePicker />
                                        </div>

                                    </div>
                                </div>
                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Child Name :</p>
                                    </div>
                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <MySelect isSimple={true} placeholder='Select Child Name' />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-50 ms-4">
                            <div className="body-container">
                                <div className="d-flex ">
                                    <div className="transfer-main-inpts">

                                        <div className="transfer-inputs">
                                            <div className="d-flex ">
                                                <p className="star-white ">*</p>
                                                <Checkbox>
                                                    Member Cover
                                                </Checkbox>
                                            </div>

                                        </div>
                                        <div className="transfer-inputs">
                                            <div className="d-flex ">
                                                <p className="star-white ">*</p>
                                                <Checkbox>
                                                    Partner Cover
                                                </Checkbox>
                                            </div>

                                        </div>
                                    </div>
                                </div>

                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Claim Reason :</p>
                                    </div>

                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <MySelect isSimple={true} />
                                        </div>

                                    </div>
                                </div>
                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Beneficiary :</p>
                                    </div>

                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <Input />
                                        </div>

                                    </div>
                                </div>
                                <div className="transfer-main-inpts">
                                    <div className="transfer-inpts-title">
                                        <p className="transfer-main-inpts-p">Partner Name :</p>
                                    </div>

                                    <div className="transfer-inputs">
                                        <div className="d-flex ">
                                            <p className="star-white ">*</p>
                                            <MySelect isSimple={true} placeholder='N/A' />
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div>
                        <Table
                            pagination={false}
                            columns={criticalIllnessSchemeClm}
                            className="drawer-tbl"
                            rowClassName={(record, index) =>
                                index % 2 !== 0 ? "odd-row" : "even-row"
                            }
                            rowSelection={rowSelection}
                            bordered
                        />
                    </div>
                </div>
            </MyDrawer>
            <MyDrawer title='Garda Reviews'
                open={modalOpenData?.GardaReviews} onClose={() => openCloseModalsFtn("GardaReviews")}
                width='725px' >
                <div className="drawer-main-cntainer">
                    <div className="details-drawer mb-4">
                        <p>{InfData?.gardaRegNo}</p>
                        <p>{InfData?.fullname}</p>
                        <p>Garda</p>
                    </div>
                    <div className="drawer-inpts-container">
                        <div className="drawer-lbl-container" style={{ width: '20%' }}>
                            <p>Review Start date :</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star">*</p>
                            <div className="inpt-sub-con">
                                <MyDatePicker />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <div className="drawer-inpts-container" >
                        <div className="drawer-lbl-container" style={{ width: '20%' }}>
                            <p>Review End date :</p>
                        </div>
                        <div className="inpt-con">
                            <p className="star-white">*</p>
                            <div className="inpt-sub-con">
                                <MyDatePicker />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <div className="drawer-inpts-container" style={{ height: '200px' }}>

                        <div className="inpt-con" style={{ width: '80%', }}>
                            <p className="star-white">*</p>
                            <div className="inpt-sub-con">
                                <TextArea rows={6} placeholder="Autosize height based on content lines" />
                            </div>
                            <p className="error"></p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4">
                        <h5>History</h5>
                        <Table
                            pagination={false}
                            columns={GardaReviewColumns}
                            className="drawer-tbl"
                            rowClassName={(record, index) =>
                                index % 2 !== 0 ? "odd-row" : "even-row"
                            }
                            rowSelection={rowSelection}
                            bordered
                        />
                    </div>
                </div>
            </MyDrawer>
            <MyDrawer title='Partner Life Assurance Claim'
                open={modalOpenData?.PartnerLifeAssuranceClaim} onClose={() => openCloseModalsFtn("PartnerLifeAssuranceClaim")}
                width='837px' >
                <div className="drawer-main-cntainer">
                    <div className="">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Partner Name :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <MySelect isSimple={true} disabled={true} placeholder="Jane Doe" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Assured From :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star">*</p>
                                        <div className="inpt-sub-con">
                                            <MyDatePicker />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Deceased :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <MyDatePicker />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="drawer-inpts-container" style={{ height: '64px' }}>
                                    <div className="drawer-lbl-container" style={{ width: '16%' }}>
                                        <p>Contact Address :</p>
                                    </div>
                                    <div className="inpt-con" style={{ width: '81%' }}>
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <TextArea rows={2} placeholder="Autosize height based on content lines" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Fire Reference :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star">*</p>
                                        <div className="inpt-sub-con d-flex">
                                            <Input />
                                            <Button className="primary-btn butn ms-2 detail-btn">+</Button>
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Advance Amount :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con d-flex">
                                            <Input />
                                            <Button className="primary-btn butn ms-2 detail-btn">+</Button>
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Advance Date :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <MyDatePicker />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Advance Cheque # :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Cover Level :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input placeholder="0.00" />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Balance Amount :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input placeholder="0.00" />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Balance Date :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <MyDatePicker />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Balance Cheque # :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input placeholder="" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="drawer-inpts-container" style={{ height: '64px' }}>
                                    <div className="drawer-lbl-container" style={{ width: '16%' }}>
                                        <p>Memo :</p>
                                    </div>
                                    <div className="inpt-con" style={{ width: '81%' }}>
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <TextArea rows={2} placeholder="Autosize height based on content lines" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2">
                        <h5>History</h5>
                        <Table
                            pagination={false}
                            columns={PartnerLifeAssuranceClaimClm}
                            className="drawer-tbl"
                            rowClassName={(record, index) =>
                                index % 2 !== 0 ? "odd-row" : "even-row"
                            }
                            rowSelection={rowSelection}
                            bordered
                        />
                    </div>
                </div>
            </MyDrawer>
            <MyDrawer title='Garda Life Assurance Claim'
                open={modalOpenData?.GardaLifeAssuranceClaim}
                isAss={true}
                onClose={() => openCloseModalsFtn("GardaLifeAssuranceClaim")}
                width='837px' >
                <div className="drawer-main-cntainer">
                    <div className="">
                        <div className="row">
                            <div className="col-md-6">

                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Assured From :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <MyDatePicker />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Contact Name :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star">*</p>
                                        <div className="inpt-sub-con">
                                            <MyDatePicker />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>

                            </div>
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                    </div>

                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Deceased :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <MyDatePicker />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Contact Phone :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <Input />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="drawer-inpts-container" style={{ height: '64px' }}>
                                    <div className="drawer-lbl-container" style={{ width: '16%' }}>
                                        <p>Contact Address :</p>
                                    </div>
                                    <div className="inpt-con" style={{ width: '81%' }}>
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <TextArea rows={2} placeholder="Autosize height based on content lines" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Fire Reference :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star">*</p>
                                        <div className="inpt-sub-con d-flex">
                                            <Input />
                                            <Button className="primary-btn butn ms-2 detail-btn">+</Button>
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Advance Amount :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con d-flex">
                                            <Input />
                                            <Button className="primary-btn butn ms-2 detail-btn">+</Button>
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Advance Date :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <MyDatePicker />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Advance Cheque # :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Cover Level :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input placeholder="0.00" />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Balance Amount :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input placeholder="0.00" />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Balance Date :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <MyDatePicker />

                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                                <div className="drawer-inpts-container">
                                    <div className="drawer-lbl-container" style={{ width: '33%' }}>
                                        <p>Balance Cheque # :</p>
                                    </div>
                                    <div className="inpt-con">
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con ">
                                            <Input placeholder="" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="drawer-inpts-container" style={{ height: '64px' }}>
                                    <div className="drawer-lbl-container" style={{ width: '16%' }}>
                                        <p>Memo :</p>
                                    </div>
                                    <div className="inpt-con" style={{ width: '81%' }}>
                                        <p className="star-white">*</p>
                                        <div className="inpt-sub-con">
                                            <TextArea rows={2} placeholder="Autosize height based on content lines" />
                                        </div>
                                        <p className="error"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-2">
                        <h5>History</h5>
                        <Table
                            pagination={false}
                            columns={PartnerLifeAssuranceClaimClm}
                            className="drawer-tbl"
                            rowClassName={(record, index) =>
                                index % 2 !== 0 ? "odd-row" : "even-row"
                            }
                            rowSelection={rowSelection}
                            bordered
                        />
                    </div>
                </div>
            </MyDrawer>
            <MyDrawer title="Garda Legal Aid Scheme" open={modalOpenData?.GardaLegalAidScheme}
                onClose={() => openCloseModalsFtn("GardaLegalAidScheme")
                }
                isAprov={true}
                isPyment={true}
                width='800px'
            >
                <div>
                    <div className="details-drawer mb-4">
                        <p>{InfData?.gardaRegNo}</p>
                        <p>{InfData?.fullname}</p>
                        <p>Garda</p>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="drawer-inpts-container" >
                                <div className="drawer-lbl-container" style={{ width: '45%' }}>
                                    <p>Claim Type : </p>
                                </div>
                                <div className="inpt-con">
                                    <p className="star-white">*</p>
                                    <div className="inpt-sub-con">
                                        <MyDatePicker />
                                    </div>
                                    <p className="error"></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="drawer-inpts-container" >
                                <div className="drawer-lbl-container" style={{ width: '45%' }}>
                                    <p>Date of Incident  :</p>
                                </div>
                                <div className="inpt-con">
                                    <p className="star-white">*</p>
                                    <div className="inpt-sub-con">
                                        <MyDatePicker />
                                    </div>
                                    <p className="error"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="">

                        <div className="drawer-inpts-container" style={{ height: '130px' }} >
                            <div className="drawer-lbl-container" style={{ width: '21.7%' }}>
                                <p>Notes :</p>
                            </div>
                            <div className="inpt-con" style={{ width: '80%' }}>
                                <p className="star-white">*</p>
                                <div className="inpt-sub-con">
                                    <TextArea
                                        rows={5}
                                    />
                                </div>
                                <p className="error"></p>
                            </div>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="drawer-inpts-container" >
                                <div className="drawer-lbl-container" style={{ width: '45%' }}>
                                    <p>Date Proc Commenced  :</p>
                                </div>
                                <div className="inpt-con" style={{}}>
                                    <p className="star-white">*</p>
                                    <div className="inpt-sub-con">
                                        <MyDatePicker />
                                    </div>
                                    <p className="error"></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="drawer-inpts-container" >
                                <div className="drawer-lbl-container" style={{ width: '45%' }}>
                                    <p>Solicitor’s  :</p>
                                </div>
                                <div className="inpt-con">
                                    <p className="star-white">*</p>
                                    <div className="inpt-sub-con">
                                        <MySelect placeholder="NA" isSimple={true} />
                                    </div>
                                    <p className="error"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </MyDrawer>
        </div>
    )
}

export default CreateClaim