import { useState } from 'react'
import MyDrawer from '../common/MyDrawer';
import { Button, Select, Input, Table, Checkbox, Space } from 'antd';
import { useMsal } from '@azure/msal-react';
import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";

import { getGraphClient } from '../msft/graphClient';
import MySelect from '../common/MySelect';

const { TextArea } = Input;
function New() {
    const [activeKey, setactiveKey] = useState("1")
    const [drawerOpen, setDrawerOpen] = useState({
        NewCall: false
    })
    const { instance, accounts } = useMsal();
    const [fileUrl, setFileUrl] = useState(null);
    const [path, setPath] = useState('/projectShell');
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
    const refreshFileList = () => {
        // This will trigger the useEffect in FileList
        setPath((prevPath) => prevPath);
      };
    const handleOptionSelect = (value) => {
        switch (value) {
            case "New Email":
                setactiveKey("1");
                window.open('https://outlook.office.com/mail/deeplink/compose', '_blank');
                break;
            case "New Call":
                setactiveKey("2");
                openCloseDrawerFtn('NewCall')
                break;
            case "New Letter":
                setactiveKey("3");
                createDocument()
                break;
            case "New SMS":
                setactiveKey("4");
                break;
            default:
                console.error("Invalid value provided");
        }
    };
    const handleNewFtn = () => {
        if (activeKey === "1") {
            window.open('https://outlook.office.com/mail/deeplink/compose', '_blank');
        }
        else if (activeKey === "2") {
            openCloseDrawerFtn('NewCall')
        }
        else if (activeKey == "3") {
            createDocument()
        }
    }
    const openCloseDrawerFtn = (name) => {
        setDrawerOpen((prevState) => ({
            ...prevState,
            [name]: !prevState[name]
        }))
    }
    const createDocument = async ( ) => {
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
            label: 'New SMS',
            value: 'New SMS',
        },

    ];
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
            title: "Membership No",
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
        <div>  <Button className='new-btn' onClick={handleNewFtn}>
            {activeKey === "1" ? "New Email" : activeKey === "2" ? "New Call" : activeKey === "4" ? "New SMS" : null}
        </Button>
            <Select
                onChange={handleOptionSelect} 
                style={{ borderLeft: 'none', backgroundColor: "#215E97", borderRadius:'3px' }}
                value={null}
                dropdownStyle={{ width: '10%', }}
                 className="custom-select"
            >
                {options.map((option) => (
                    <Select.Option key={option.key} value={option.label}>

                    </Select.Option>
                ))}
            </Select>

            <MyDrawer title='New Call' open={drawerOpen?.NewCall} isPagination={true}
                onClose={() => { openCloseDrawerFtn('NewCall') }}
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
                                <p>Membership No :</p>
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
                        <div className="drawer-inpts-container" style={{ height: '150px' }}>
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

export default New