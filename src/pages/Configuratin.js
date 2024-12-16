import React, { useEffect, useState } from "react";
import { SiActigraph } from "react-icons/si";
import { FaRegMap } from "react-icons/fa6";
import MyDrawer from "../component/common/MyDrawer";
import { LuRefreshCw } from "react-icons/lu";
import { Input, Table, Row, Col, Space, Pagination, Divider, Checkbox, Button, } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { PiHandshakeDuotone } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { UserOutlined } from "@ant-design/icons";
import { LuCalendarDays } from "react-icons/lu";
import { PiUsersFourDuotone } from "react-icons/pi";
import { tableData } from "../Data";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { HiOutlineMinusCircle } from "react-icons/hi";
import { FiPlusCircle } from "react-icons/fi";
import { getAllLookupsType } from '../features/LookupTypeSlice';
import { getAllLookups } from '../features/LookupsSlice'
import { useDispatch, useSelector } from 'react-redux';
import MyConfirm from "../component/common/MyConfirm";
// import {county, Province_flat,Provinec_Outlined,District_Outlined, Marital_Status_Outlined} from '../utils/Icons'
import { ProvinceOutlined, CountyOutlined, MaritalStatusOutlined,
   StationOutlined,Gender,PostCodeOutlined,DistrictsOutlined,
   DivisionsOutlined,
   BoardOutlined,
   CouncilOutlined,
   CitiesOutlined,
   LanguageOutlined,
   Title

  } from "../utils/Icons";
import { TiContacts } from "react-icons/ti";
// import '../styles/Configuratin.css'
import '../styles/Configuration.css'
import MySelect from "../component/common/MySelect";
import { deleteFtn, insertDataFtn, updateFtn } from "../utils/Utilities";
import { baseURL } from "../utils/Utilities";
import { render } from "@testing-library/react";
import { fetchRegions, deleteRegion } from "../features/RegionSlice";
import { getLookupTypes } from "../features/LookupTypeSlice";
import { set } from "react-hook-form";

function Configuratin() {
const [data, setdata] = useState({
  gender:[],
  SpokenLanguages:[],
})
  const [membershipModal, setMembershipModal] = useState(false);
  const [isSubscriptionsModal, setIsSubscriptionsModal] = useState(false);
  const [isProfileModal, setisProfileModal] = useState(false);
  const [isAddProfileModal, setisAddProfileModal] = useState(false);
  const [isRegionTypeModal, setisRegionTypeModal] = useState(false);
  const [isAddRegionTypeModal, setisAddRegionTypeModal] = useState(false);
  const [isContactTypeModal, setisContactTypeModal] = useState(false);
  const [isAddContactTypeModal, setisAddContactTypeModal] = useState(false);
  const [partnershipModal, setPartnershipModal] = useState(false);
  const [dummyModal, setDummyModal] = useState(false);
  const [profileData, setprofileData] = useState({
    RegNo: "",
    Name: "",
    Rank: "",
    Duty: "",
    Station: "",
    District: "",
    Division: "",
    Address: "",
    Status: "",
    Updated: "",
    alpha: "",
    beta: "",
    giga: "",
  });
  const [RegionTypeData, setRegionTypeData] = useState({
    ReigonTypeId: "",
    ContactType: "",
    DisplayName: "",
  });
  const dispatch = useDispatch()
  const { regions, loading } = useSelector((state) => state.regions);
  const { lookups, lookupsloading } = useSelector((state) => state.lookups);
  const {  lookupsTypes,lookupsTypesloading } = useSelector((state) => state.lookupsTypes);
  
  const [drawerOpen, setDrawerOpen] = useState({
    Counteries: false,
    Provinces: false,
    Cities: false,
    PostCode: false,
    Districts: false,
    Divisions: false,
    Station: false,
    ContactTypes: false,
    LookupType: false,
    Lookup: false,
    Solicitors: false,
    Committees:false,
    SpokenLanguages:false,
    Gender:false,
    Title:false,
    ProjectTypes:false,
    Trainings:false,
    Ranks:false,
    Duties:false,
  })
  const [isUpdateRec, setisUpdateRec] = useState({
    Lookup: false,
    LookupType:false,
  })
  useEffect(()=>{
if(lookups && Array.isArray(lookups)){
  const filteredGender = lookups?.filter((item)=>item?.Parentlookup==='674a1977cc0986f64ca36fc6')
  setdata((prevState) => ({
    ...prevState,
    gender: filteredGender,
  }));
}
  },[lookups]) 
  useEffect(()=>{
if(lookups && Array.isArray(lookups)){
  const filteredGender = lookups?.filter((item)=>item?.Parentlookup==='674a195dcc0986f64ca36fc2')
  setdata((prevState) => ({
    ...prevState,
    SpokenLanguages: filteredGender,
  }));
}
  },[lookups]) 

const [drawer, setdrawer] = useState(false)
  useEffect(() => {
    if (drawerOpen?.LookupType === true) {
      dispatch(fetchRegions());
    }
  }, [drawerOpen?.LookupType, dispatch]);
  const [lookupsType, setLookupsType] = useState([]);
  useEffect(() => {
    dispatch(getAllLookups());
  }, []);

  useEffect(() => {
    const updatedLookupsType = lookupsTypes?.map(item => ({
      key: item._id,
      label: item.lookuptype
    }));
    
    setLookupsType(updatedLookupsType);
  }, [lookupsTypes]);
useEffect(()=>{
  dispatch(getLookupTypes())
},[])
  const [ContactTypeData, setContactTypeData] = useState({
    ReigonTypeId: "",
    ReigonType: "",
    DisplayName: "",
    HasChildren: "",
  });

  const [genderData, setGenderData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });
  const [PartnershipData, setPartnershipData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });
  const [membershipdata, setMembershipData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });

  const [SubscriptionData, setSubscriptionData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: ""
  });

  const handleInputChange = (name, value) => {
    setGenderData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange00 = (name00, value00) => {
    setRegionTypeData((prevState00) => ({
      ...prevState00,
      [name00]: value00,
    }));
  };

  const handleInputChange01 = (name01, value01) => {
    setContactTypeData((prevState01) => ({
      ...prevState01,
      [name01]: value01,
    }));
  };

  const handleInputChange2 = (name2, value2) => {
    setPartnershipData((prevState2) => ({
      ...prevState2,
      [name2]: value2,
    }));
  };

  const handleInputChange3 = (name3, value3) => {
    setMembershipData((prevState3) => ({
      ...prevState3,
      [name3]: value3,
    }));
  };

  let drawerInputsInitalValues = {
    Counteries: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegion: null },
    Provinces: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegion: null },
    Cities: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegion: null },
    LookupType: { lookuptype: '', code: '',DisplayName:'', isActive: true, isDeleted: false },
    Lookup: { lookuptypeId: '',DisplayName:'', lookupname: '',  code: '', Parentlookup: '',"userid": "67117bea87c907f6cdda0ad9",isActive:true },
    Gender: { lookuptypeId: '674a1977cc0986f64ca36fc6',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a1977cc0986f64ca36fc6',"userid": "67117bea87c907f6cdda0ad9",isActive:true },
    Title: { lookuptypeId: '675fc362e9640143bfc38d28',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a1977cc0986f64ca36fc6',"userid": "67117bea87c907f6cdda0ad9",isActive:true },
    SpokenLanguages: { lookuptypeId: '674a195dcc0986f64ca36fc2',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a195dcc0986f64ca36fc2',"userid": "67117bea87c907f6cdda0ad9", isActive:true },
    MaritalStatus: { lookuptypeId: '674a195dcc0986f64ca36fc2',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a195dcc0986f64ca36fc2',"userid": "67117bea87c907f6cdda0ad9", isActive:true },
    ProjectTypes: { lookuptypeId: '674a195dcc0986f64ca36fc2',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a195dcc0986f64ca36fc2',"userid": "67117bea87c907f6cdda0ad9", isActive:true },
    Trainings: { lookuptypeId: '674a195dcc0986f64ca36fc2',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a195dcc0986f64ca36fc2',"userid": "67117bea87c907f6cdda0ad9", isActive:true },
    Ranks: { lookuptypeId: '674a195dcc0986f64ca36fc2',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a195dcc0986f64ca36fc2',"userid": "67117bea87c907f6cdda0ad9", isActive:true },
    Duties: { lookuptypeId: '674a195dcc0986f64ca36fc2',DisplayName:'', lookupname: '',  code: '', Parentlookup: '674a195dcc0986f64ca36fc2',"userid": "67117bea87c907f6cdda0ad9", isActive:true },
  }
  const [drawerIpnuts, setdrawerIpnuts] = useState(drawerInputsInitalValues)
  const drawrInptChng = (drawer, field, value) => {
    setdrawerIpnuts((prevState) => ({
      ...prevState,
      [drawer]: {
        ...prevState[drawer],
        [field]: value,
      },
    }));

  }
  const IsUpdateFtn = (drawer, value, data) => {
    if(value==false){
    setisUpdateRec((prev) => ({
        ...prev,
        [drawer]: false,
      }));
      resetCounteries(drawer)
      return
    }
    setisUpdateRec((prev) => ({
      ...prev,
      [drawer]: value,
    }));

    if (!drawerInputsInitalValues[drawer]) {
      console.error(`Invalid drawer key: ${drawer}`);
      return;
    }

    const filteredData = Object.keys(drawerInputsInitalValues[drawer]).reduce((acc, key) => {
      if (data.hasOwnProperty(key)) {
        acc[key] = data[key];
      }
      return acc;
    }, {});

    setdrawerIpnuts((prev) => ({
      ...prev,
      [drawer]: {
        ...prev[drawer],
        ...filteredData,
      },
    }));
  };

  const [errors, seterrors] = useState()

  const resetCounteries = (drawer, callback) => {
    setdrawerIpnuts((prevState) => ({
      ...prevState,
      [drawer]: drawerInputsInitalValues[drawer],
    }));
    console.log(drawerIpnuts, "test")
    if (callback & typeof callback === 'function') {
      callback()
    }
  };

  const openCloseDrawerFtn = (name) => {
    setDrawerOpen((prevState) => ({
      ...prevState,
      [name]: !prevState[name]
    }))
  }

  const handleInputChange4 = (name4, value4) => {
    setSubscriptionData((prevState4) => ({
      ...prevState4,
      [name4]: value4,
    }));
  };

  const handleInputChange7 = (name7, value7) => {
    setprofileData((prevState7) => ({
      ...prevState7,
      [name7]: value7,
    }));
  };
  const addIdKeyToLookup = (idValue, drawer) => {
    setdrawerIpnuts((prev) => {
      const updatedDrawerInputs = { ...prev };
  
      if (drawer === "Lookup" && updatedDrawerInputs.Lookup) {
        // Add 'id' to Lookup
        updatedDrawerInputs.Lookup = {
          ...updatedDrawerInputs.Lookup,
          id: idValue,
        };
      } else if (drawer === "LookupType" && updatedDrawerInputs.LookupType) {
        // Add 'id' to LookupType
        updatedDrawerInputs.LookupType = {
          ...updatedDrawerInputs.LookupType,
          id: idValue,
        };
      }
  
      return updatedDrawerInputs;
    });
  };
  

  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      age: 32,
      address: '10 Downing Street',
    },
    {
      key: '2',
      name: 'John',
      age: 42,
      address: '10 Downing Street',
    },
  ];
  const columnProvince = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Province',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'Active',
      key: 'DisplayName',
      render: (index, record) => (
        <Checkbox></Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />

        </Space>
      ),
    },
  ];
  const columnCountry = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'County',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Province',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
      render: (index, record) => (
        <Checkbox>

        </Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnPostCode = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Post Code',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'City',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
      render: (index, record) => (
        <Checkbox>

        </Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnDistricts = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Districts',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Division',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
      render: (index, record) => (
        <Checkbox>

        </Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnDivisions = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Division',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
      render: (index, record) => (
        <Checkbox>

        </Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnCity = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Contact Type',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const contactType = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'City',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'County',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
      render: (index, record) => (
        <Checkbox>

        </Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnLookupType = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Lookup Type ',
      dataIndex: 'lookuptype',
      key: 'lookuptype',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },

    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (index, record) => (
        <Checkbox checked={record?.isactive}>

        </Checkbox>
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {IsUpdateFtn('LookupType', !IsUpdateFtn?.LookupType, record)
             addIdKeyToLookup(record?._id, "LookupType")
          }} />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookuptype`, record?._id,);
                  dispatch(getLookupTypes())
                },
              })
            }
            style={{ cursor: 'pointer' }} // Change the cursor to pointer for better UX
          />
        </Space>
      ),
    },
  ];
  const columnLookup = [
    {
      title: 'code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ['ascend', 'descend'], // Optional: Sets the sort order directions
    },
    {
      title: ' Lookup Type ',
      dataIndex: 'lookuptypeId',
      key: 'lookuptypeId',
      filters: [
        { text: 'A01', value: 'A01' },
        { text: 'B02', value: 'B02' },
        { text: 'C03', value: 'C03' },
        // Add more filter options as needed
      ],
      // onFilter: (value, record) => record.RegionCode === value,
    },
    {
      title: ' Display Name',
      dataIndex: '',
      key: '',
    },
    {
      title: 'lookup Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (index, record) => (
        <Checkbox checked={record?.isActive}>
        </Checkbox> 
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {IsUpdateFtn('Lookup', !IsUpdateFtn?.Lookup, record)
             addIdKeyToLookup(record?._id,"Lookup")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Lookup')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnGender = [
    {
      title: 'code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ['ascend', 'descend'], // Optional: Sets the sort order directions
    },
    {
      title: ' Lookup Type ',
      dataIndex: 'lookuptypeId',
      key: 'lookuptypeId',
      filters: [
        { text: 'A01', value: 'A01' },
        { text: 'B02', value: 'B02' },
        { text: 'C03', value: 'C03' },
        // Add more filter options as needed
      ],
      // onFilter: (value, record) => record.RegionCode === value,
    },
    {
      title: ' Display Name',
      dataIndex: '',
      key: '',
    },
    {
      title: 'lookup Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (index, record) => (
        <Checkbox checked={record?.isActive}>
        </Checkbox> 
      )
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {IsUpdateFtn('Gender', !IsUpdateFtn?.Gender, record)
             addIdKeyToLookup(record?._id,"Gender")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Gender')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const Committeescolumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Committee Name',
      dataIndex: 'committeeName',
      key: 'committeeName',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Display Name',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Parent',
      dataIndex: 'parent',
      key: 'parent',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Checkbox checked={isActive}>Active</Checkbox>
      ),
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
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {IsUpdateFtn('Lookup', !IsUpdateFtn?.Lookup, record)
             addIdKeyToLookup(record?._id,"Lookup")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/region`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Lookup')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  
  const SubscriptionsColumn = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Alpha",
      dataIndex: "Alpha",
      key: "Alpha",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Beta",
      dataIndex: "Beta",
      key: "Beta",
      verticalAlign: 'center',
      align: 'center',  // Horizontally center the content
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: 'center', display: 'flex' }}
        >
          <FaEdit
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];
  const ProfileColumns = [
    {
      title: "RegNo",
      dataIndex: "RegNo",
      key: "RegNo",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Rank",
      dataIndex: "Rank",
      key: "Rank",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) =>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Duty",
      dataIndex: "Duty",
      key: "Duty",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Station",
      dataIndex: "Station",
      key: "Station",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "District",
      dataIndex: "District",
      key: "District",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Division",
      dataIndex: "Division",
      key: "Division",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Address",
      dataIndex: "Address",
      key: "Address",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Updated",
      dataIndex: "Updated",
      key: "Updated",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Alpha",
      dataIndex: "Alpha",
      key: "Alpha",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Beta",
      dataIndex: "Beta",
      key: "Beta",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Giga",
      dataIndex: "Giga",
      key: "Giga",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },
    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: 'center', display: 'flex' }}
        >
          <FaEdit
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];
  const RegionTypeColumnss = [

    {
      title: "RegionType",
      dataIndex: "RegionType",
      key: "RegionType",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "DisplayName",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) =>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "HasChildren",
      dataIndex: "HasChildren",
      key: "HasChildren",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: 'center', display: 'flex' }}
        >
          <FaEdit
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];
  const ContactTypeColumns = [

    {
      title: "ContactType",
      dataIndex: "ContactType",
      key: "ContactType",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "DisplayName",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) =>
        <div
          style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },


    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: 'center', display: 'flex' }}
        >
          <FaEdit
            size={16}
            style={{ marginRight: '10px' }}
          />
          <AiFillDelete
            size={16}
          />
        </Space>
      ),
    },
  ];
  const column = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      width: 60,
      align: "center",
      render: (text) => <div style={styles.centeredCell}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      align: "center",
      render: (text) => <div style={styles.centeredCell}>{text}</div>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columns = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      width: 60,
      align: "center",
      render: (text) => <div style={styles.centeredCell}>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      align: "center",
      render: (text) => <div style={styles.centeredCell}>{text}</div>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" style={styles.centeredCell}>
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const membership = [
    {
      key: "1",
      ShortName: "Probation",
      DisplayName: "Single",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
      Alpha: "A165",
      Beta: "B764",
    },
  ];
  const partnership = [
    {
      key: "1",
      ShortName: "Probation",
      DisplayName: "Single",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
      Alpha: "A165",
      Beta: "B764",
    },
  ];
  const subscription = [
    {
      key: "1",
      ShortName: "Probation",
      DisplayName: "Single",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Trainee",
      DisplayName: "Trainee",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "3",
      ShortName: "Associate",
      DisplayName: "Associate",
      Alpha: "A165",
      Beta: "B764",
    },
    {
      key: "4",
      ShortName: "Retired",
      DisplayName: "Retired",
      Alpha: "A165",
      Beta: "B764",
    },
  ];
  const gender = [
    {
      key: "1",
      ShortName: "Male",
      DisplayName: "Male",
      Alpha: "A163",
      Beta: "B762",
    },
    {
      key: "2",
      ShortName: "Female",
      DisplayName: "Female",
      Alpha: "A164",
      Beta: "B763",
    },
    {
      key: "3",
      ShortName: "Other",
      DisplayName: "Other",
      Alpha: "A165",
      Beta: "B764",
    },
  ];
  const RegionTy = [
    {
      key: "1",
      RegionTypeId: "1",
      RegionType: 'Province',
      DisplayName: 'Province',
      HasChildren: "1",
    },
    {
      key: "2",
      RegionTypeId: "2",
      RegionType: 'County',
      DisplayName: 'County',
      HasChildren: "1",
    },
    {
      key: "3",
      RegionTypeId: "3",
      RegionType: 'Administerative Districts',
      DisplayName: 'District',
      HasChildren: "1",
    },
    {
      key: "4",
      RegionTypeId: "4",
      RegionType: 'City',
      DisplayName: 'City',
      HasChildren: "1",
    },
    {
      key: "5",
      RegionTypeId: "5",
      RegionType: 'PostCode',
      DisplayName: 'PostCode',
      HasChildren: "0",
    },
  ];
  const ContactTy = [
    {
      key: "1",
      ContactTypeId: "1",
      ContactType: 'office',
      DisplayName: 'office',
    },
    {
      key: "2",
      ContactTypeId: "2",
      ContactType: 'office',
      DisplayName: 'office',
    },
    {
      key: "3",
      ContactTypeId: "3",
      ContactType: 'office',
      DisplayName: 'office',
    },
  ];

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

  const membershipModalFtn = () => setMembershipModal(!membershipModal);
  const partnershipModalFtn = () => setPartnershipModal(!partnershipModal);
  const dummyModalFtn = () => setDummyModal(!dummyModal);
  const subscriptionsModalFtn = () => setIsSubscriptionsModal(!isSubscriptionsModal);
  const profileModalOpenCloseFtn = () => setisProfileModal(!isProfileModal);
  const addprofileModalOpenCloseFtn = () => setisAddProfileModal(!isAddProfileModal);
  const RegionTypeModalOpenCloseFtn = () => setisRegionTypeModal(!isRegionTypeModal);
  const addRegionTypeModalOpenCloseFtn = () => setisAddRegionTypeModal(!isAddRegionTypeModal);
  const ContactTypeModalOpenCloseFtn = () => setisContactTypeModal(!isContactTypeModal);
  const addContactTypeModalOpenCloseFtn = () => setisAddContactTypeModal(!isAddContactTypeModal);

  const addmembershipFtn = () => {
    console.log(membershipdata);
  }

  const addGenderFtn = () => {
    // Logic for adding gender
    console.log(genderData);
  };

  const AddpartnershipFtn = () => {
    console.log(PartnershipData);
  }

  const AddprofileModalFtn = () => {
    console.log(profileData)
  }

  const AddRegionTypeModalFtn = () => {
    console.log(RegionTypeData)
  }

  const AddContactTypeModalFtn = () => {
    console.log(ContactTypeData)
  }

  const AddSubscriptionsFtn = () => {
    console.log(SubscriptionData);
  }
  const {Search} = Input;
  return (
    <div className="configuration-main">
      <h1 className="config-heading" style={{ marginLeft: '45px' }}>Configurations</h1>
    <div className="search-inpt">
    <Search style={{borderRadius:"3px", height:'62px' }}  />

    </div>
      <Divider orientation="left">lookups Configuration</Divider>
      <Row>
        <Col className="hover-col" span={3} onClick={()=>{openCloseDrawerFtn('Title')}}>
          <div  className="center-content">
            <div className="icon-container">
              <Title className="icons custom-icon" />
            </div>
            <p className="lookups-title">Titles</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={()=>{openCloseDrawerFtn('Gender')}}>
          <div  className="center-content">
            <div className="icon-container">
              <Gender className="custom-icon" />
            </div>
            <p className="lookups-title">Gender</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={()=>{openCloseDrawerFtn('MaritalStatus')}}>
          <div className="center-content">
            <div className="icon-container">
              {/* <img src={Marital_Status_Outlined} className="icons custom-icon" /> */}
              <MaritalStatusOutlined className="icons custom-icon" />
            </div>
            <p className="lookups-title">Marital Status</p>
          </div>
        </Col>
        <Col  onClick={() => openCloseDrawerFtn('Provinces')} className="hover-col" span={3} style={styles.centeredCol}>
          <div>
            <ProvinceOutlined  className="custom-icon icons"   />
            <p className="lookups-title">Provinces</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('Counteries')} className="center-content">
            <div className="icon-container">

              <CountyOutlined className="custom-icon icons" />
            </div>
            <p className="lookups-title">Counteries</p>
          </div>
        </Col>
        <Col className="hover-col" span={3}>
          <div onClick={() => openCloseDrawerFtn('Cities')}>
            <CitiesOutlined className="custom-icon icons" />
            <p className="lookups-title">Cities</p>
          </div>
        </Col>

        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('PostCode')}>
            <PostCodeOutlined className="icons custom-icon" />
            <p className="lookups-title">Post Codes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('Divisions')}>
            <DivisionsOutlined className="icons custom-icon" />
            <p className="lookups-title">Divisions</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('Districts')}>
            <DistrictsOutlined className="icons custom-icon" />
            <p className="lookups-title">Districts</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} >
          <div onClick={() => openCloseDrawerFtn('Station')}>
            <StationOutlined className="icons custom-icon" />
            <p className="lookups-title">Station</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} >
          <div onClick={()=>openCloseDrawerFtn('Committees')}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Committees</p>
          </div>
        </Col>

        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <CouncilOutlined className="icons custom-icon" />
            <p className="lookups-title">Councils</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} >
          <div onClick={dummyModalFtn}>
            <BoardOutlined className="icons custom-icon" />
            <p className="lookups-title">Boards</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={()=>openCloseDrawerFtn('SpokenLanguages')}>
          <div>
            <LanguageOutlined className="icons custom-icon" />
            <p className="lookups-title">Spoken Languages</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={()=>openCloseDrawerFtn('ProjectTypes')}>
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Project Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={()=>openCloseDrawerFtn('Trainings')}>
          <div >
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Trainings</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={()=>openCloseDrawerFtn('Ranks')}>
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Ranks</p>
          </div>
        </Col>
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Duties</p>
          </div>
        </Col> */}
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('Duties')} >
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Duties</p>
          </div>
        </Col>
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Schemes</p>
          </div>
        </Col> */}
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('Solicitors')} >
          <div >
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Solicitors</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Roster Type</p>
          </div>
        </Col>
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Reasons</p>
          </div>
        </Col> */}
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('ContactTypes')}>
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Contact Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('LookupType')}>
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Lookup Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('Lookup')}>
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Lookup</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn} className="center-content">
            <div className="icon-container">

              <PiHandshakeDuotone className="icons" />
            </div>
            <p className="lookups-title ">Payment Types</p>
          </div>
        </Col>
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}> */}
          {/* <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Ranks</p>
          </div> */}
        {/* </Col> */}
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Duties</p>
          </div>
        </Col> */}
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Schemes</p>
          </div>
        </Col> */}
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Roster Type</p>
          </div>
        </Col> */}
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Reasons</p>
          </div>
        </Col>
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Contact Types</p>
          </div>
        </Col> */}
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Correspondence Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Document Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Claim Type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Schemes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Solicitors</p>
          </div>
        </Col>
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Roster Type</p>
          </div>
        </Col> */}
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Reasons</p>
          </div>
        </Col> */}
        {/* <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={dummyModalFtn}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Contact Types</p>
          </div>
        </Col> */}
      </Row>
      <Divider orientation="left">Grid Configuration</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={profileModalOpenCloseFtn}>
            <UserOutlined className="icons" />
            <p className="lookups-title">Profile</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={RegionTypeModalOpenCloseFtn}>
            <FaRegMap className="icons" />
            <p className="lookups-title">Reigon type</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <TiContacts className="icons" />
            <p className="lookups-title">Contact Type</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Roles-Based</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion
              className="icons" />
            <p className="lookups-title">Roles</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle
              className="icons" />
            <p className="lookups-title">Permissions</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle
              className="icons" />
            <p className="lookups-title">Permissions</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Business Rules & Workflows</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion
              className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle
              className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle
              className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Application Settings</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion
              className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle
              className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle
              className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">Customization and Branding</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion
              className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle
              className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle
              className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>
      <Divider orientation="left">UI/UX Display</Divider>
      <Row>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FaRegCircleQuestion
              className="icons" />
            <p className="lookups-title">Member Status</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <HiOutlineMinusCircle
              className="icons" />
            <p className="lookups-title">Priorities</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={ContactTypeModalOpenCloseFtn}>
            <FiPlusCircle
              className="icons" />
            <p className="lookups-title">pause-circle</p>
          </div>
        </Col>
      </Row>

  

      {/* Membership Drawer */}
      <MyDrawer
        open={membershipModal}
        onClose={membershipModalFtn}
        add={addmembershipFtn}
        title="Membership"
      >
        <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange3("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange3("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange3("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange3("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={membership}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{gender.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${gender.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={gender.length}
                pageSize={10}
              />
            </div>
          )}
        />

      </MyDrawer>

      {/* Partnership Drawer */}
      <MyDrawer
        open={partnershipModal}
        onClose={partnershipModalFtn}
        add={AddpartnershipFtn}
        title="Partnership"
      >

        <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange2("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange2("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange2("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange2("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={partnership}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{gender.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${gender.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={gender.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>

      {/* Dummy Drawer */}
      <MyDrawer
        open={dummyModal}
        onClose={dummyModalFtn}
        add={() => console.log("Adding Dummy")}
        title="Dummy"
      >
        <div className="input-group">
          <p className="inpt-lbl">Dummy Field</p>
          <Input placeholder="Please enter dummy field" />
        </div>
        {/* Add more input fields as required */}
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />
        <Table
          columns={column} // Assuming columns are the same
          pagination={false}
          dataSource={gender} // Replace with appropriate data
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
        />
      </MyDrawer>

      {/* Subscriptions Drawer */}
      <MyDrawer
        open={isSubscriptionsModal}
        onClose={subscriptionsModalFtn}
        add={AddSubscriptionsFtn}
        title="Subscriptions"
      >
        <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange4("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange4("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange4("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange4("Beta", e.target.value)}
          />
        </div>
        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={SubscriptionsColumn}
          pagination={false}
          dataSource={partnership}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{gender.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${gender.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={gender.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>
      {/* Profile multi drawer*/}
      <MyDrawer
        width={"1000px"}
        open={isProfileModal}
        onClose={profileModalOpenCloseFtn}
        add={addprofileModalOpenCloseFtn}
        title="Profile"
      >
        <MyDrawer
          title="Add profile"
          open={isAddProfileModal}
          add={AddprofileModalFtn}
          onClose={addprofileModalOpenCloseFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">RegNo</p>
            <Input
              placeholder="Please enter RegNo"
              onChange={(e) => handleInputChange7("RegNo", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Name</p>
            <Input
              placeholder="Please enter Name"
              onChange={(e) => handleInputChange7("Name", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Rank</p>
            <Input
              placeholder="Please enter Rank"
              onChange={(e) => handleInputChange7("Rank", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Duty</p>
            <Input
              placeholder="Please enter Duty"
              onChange={(e) => handleInputChange7("Duty", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Station</p>
            <Input
              placeholder="Please enter Station"
              onChange={(e) => handleInputChange7("Station", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">District</p>
            <Input
              placeholder="Please enter District"
              onChange={(e) => handleInputChange7("District", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Division</p>
            <Input
              placeholder="Please enter Division"
              onChange={(e) => handleInputChange7("Division", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Address</p>
            <Input
              placeholder="Please enter Address"
              onChange={(e) => handleInputChange7("Address", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Status</p>
            <Input
              placeholder="Please enter Status"
              onChange={(e) => handleInputChange7("Status", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Updated</p>
            <Input
              placeholder="Please enter Updated"
              onChange={(e) => handleInputChange7("Updated", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Alpha</p>
            <Input
              placeholder="Please enter Alpha"
              onChange={(e) => handleInputChange7("alpha", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Beta</p>
            <Input
              placeholder="Please enter Beta"
              onChange={(e) => handleInputChange7("beta", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Giga</p>
            <Input
              placeholder="Please enter Giga"
              onChange={(e) => handleInputChange7("giga", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={ProfileColumns}
          pagination={false}
          dataSource={tableData}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{gender.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${gender.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={gender.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>

      {/*Reigon type Drawer */}

      <MyDrawer
        width={"1000px"}
        open={isRegionTypeModal}
        onClose={RegionTypeModalOpenCloseFtn}
        add={addRegionTypeModalOpenCloseFtn}
        title="Profile"
      >
        <MyDrawer
          title="Add Regiontype"
          open={isAddRegionTypeModal}
          add={AddRegionTypeModalFtn}
          onClose={addRegionTypeModalOpenCloseFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">Reigon type</p>
            <Input
              placeholder="Please enter RegionType"
              onChange={(e) => handleInputChange00("RegionType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              placeholder="Please enter DisplayName"
              onChange={(e) => handleInputChange00("DisplayName", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={RegionTypeColumnss}
          pagination={false}
          dataSource={RegionTy}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{RegionTy.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${RegionTy.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={RegionTy.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>
      {/* ContactType Modal */}

      {/* ContactType Modal */}
      <MyDrawer
        width={"1000px"}
        open={isContactTypeModal}
        onClose={ContactTypeModalOpenCloseFtn}
        add={addContactTypeModalOpenCloseFtn}
        title="Profile"
      >
        <MyDrawer
          title="Add ContactType"
          open={isAddContactTypeModal}
          add={AddContactTypeModalFtn}
          onClose={addContactTypeModalOpenCloseFtn}
        >
          <div className="input-group">
            <p className="inpt-lbl">Reigon type</p>
            <Input
              placeholder="Please enter ContactType"
              onChange={(e) => handleInputChange01("ContactType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              placeholder="Please enter DisplayName"
              onChange={(e) => handleInputChange01("DisplayName", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          placeholder="Search..."
          style={{ marginBottom: "5px" }}
          suffix={<SearchOutlined />}
        />

        <Table
          columns={ContactTypeColumns}
          pagination={false}
          dataSource={ContactTy}
          className="drawer-tbl"
          rowClassName={(record, index) =>
            index % 2 !== 0 ? "odd-row" : "even-row"
          }
          footer={() => (
            <div className="d-flex justify-content-between">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  1-{ContactTy.length}
                </span>
                <span
                  style={{
                    marginRight: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {" "}
                  of {`${ContactTy.length}`}
                </span>
                <LuRefreshCw />
              </div>
              <Pagination
                defaultCurrent={1}
                total={ContactTy.length}
                pageSize={10}
              />
            </div>
          )}
        />
      </MyDrawer>
      <MyDrawer isPagination={true} title='County' open={drawerOpen?.Counteries} onClose={() => openCloseDrawerFtn('Counteries')} add={() => {

        console.log(drawerIpnuts?.Counteries)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Counteries, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('Counteries'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='County' isSimple={true} disabled={true} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionName', e.target.value)} value={drawerIpnuts?.Counteries?.RegionName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
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
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnCountry}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Provinces' open={drawerOpen?.Provinces} isPagination={true} onClose={() => openCloseDrawerFtn('Provinces')} add={() => {
        console.log(drawerIpnuts?.Provinces)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Provinces, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('Provinces'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Province' isSimple={true} disabled={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionName', e.target.value)} value={drawerIpnuts?.Counteries?.RegionName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnProvince}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='City' open={drawerOpen?.Cities} isPagination={true} onClose={() => openCloseDrawerFtn('Cities')} add={() => {
        console.log(drawerIpnuts?.Cities)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Cities, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('Cities'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='City' isSimple={true} disabled={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>City Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} />
                  {/* <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  /> */}
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} disabled={true} />

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
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnCity}
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
      <MyDrawer title='Post Code' open={drawerOpen?.PostCode} isPagination={true} onClose={() => openCloseDrawerFtn('PostCode')} add={() => {
        console.log(drawerIpnuts?.PostCode)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.PostCode, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('PostCode'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Postcode' isSimple={true} disabled={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} />
                  {/* <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  /> */}
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>City  :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Dublin' isSimple={true} disabled={true} />
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
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table columns={columnPostCode}
              pagination={false}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Districts' open={drawerOpen?.Districts} isPagination={true} onClose={() => openCloseDrawerFtn('Districts')} add={() => {
        console.log(drawerIpnuts?.Districts)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Districts, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('Districts'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Districts' isSimple={true} disabled={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input />
                  {/* <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  /> */}
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Division :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Select Division' />
                  {/* <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} /> */}
                  <p className="error"></p>
                </div>
                <Button className="butn primary-btn detail-btn ms-2">
                  +
                </Button>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnDistricts}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>

        </div>

      </MyDrawer>
      <MyDrawer title='Divisions' open={drawerOpen?.Divisions} isPagination={true} isContact={true} onClose={() => openCloseDrawerFtn('Divisions')} add={() => {
        console.log(drawerIpnuts?.Divisions)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Divisions, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('Divisions'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Divisions' isSimple={true} disabled={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} />
                  {/* <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  /> */}
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
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
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnDivisions}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Station' open={drawerOpen?.Station} isPagination={true} onClose={() => openCloseDrawerFtn('Station')} add={() => {
        console.log(drawerIpnuts?.Station)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.Station, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('Districts'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Districts' isSimple={true} disabled={true} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} />
                  {/* <Input className="inp" onChange={(e)=>drawrInptChng('Counteries','DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName}  /> */}
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Division :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Select Division' />
                  {/* <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} /> */}
                  <p className="error"></p>
                </div>
                <Button className="butn primary-btn detail-btn ms-2">
                  +
                </Button>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnDistricts}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Contact Types' open={drawerOpen?.ContactTypes} isPagination={true} onClose={() => openCloseDrawerFtn('ContactTypes')} add={() => {
        console.log(drawerIpnuts?.ContactTypes)
        insertDataFtn(`${baseURL}/region`, drawerIpnuts?.ContactTypes, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('ContactTypes'))
      }} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Contact Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">

                  <Input className="inp" />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
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
                  <Checkbox>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnCity}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Lookup Type' open={drawerOpen?.LookupType} isPagination={true} onClose={() => {openCloseDrawerFtn('LookupType')
          IsUpdateFtn('LookupType', false, )
      }}
       isEdit={isUpdateRec?.LookupType}
       update={
        async () => {
         await updateFtn('/lookuptype', drawerIpnuts?.LookupType,() => resetCounteries('LookupType'))
         dispatch(getLookupTypes())
         IsUpdateFtn('LookupType', false, )
        }}
       add={async () => {
          await insertDataFtn(
            `${baseURL}/lookuptype`,
            {...drawerIpnuts?.LookupType,   "userid": "67117bea87c907f6cdda0ad9",
            },
            'Data insert ed successfully',
            'Data did not insert',
            () => resetCounteries('LookupType', () => dispatch(getLookupTypes())) // Pass a function reference
          );
          dispatch(getLookupTypes())
        }}
        total={regions?.length} >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(value) => drawrInptChng('LookupType', 'code', value.target.value)}
                    value={drawerIpnuts?.LookupType?.code}  
                  />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    isSimple={true}
                    placeholder=''
                    onChange={(value) => drawrInptChng('LookupType', 'lookuptype', value.target.value)}
                   value={drawerIpnuts?.LookupType?.lookuptype}                
                 />
                </div>
                <p className="error">{errors?.LookupType?.RegionType}</p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>DisplayName</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    isSimple={true}
                    placeholder=''
                    onChange={(value) => drawrInptChng('LookupType', 'DisplayName', value.target.value)}
                   value={drawerIpnuts?.LookupType?.DisplayName}                
                 />
                </div>
                <p className="error">{errors?.LookupType?.RegionType}</p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
                    onChange={(e) => drawrInptChng('LookupType', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.LookupType?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnLookupType}
              dataSource={lookupsTypes}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
              scroll={{ y: 240 }}
              loading={lookupsTypesloading}
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Lookup' open={drawerOpen?.Lookup} isPagination={true} onClose={() => {openCloseDrawerFtn('Lookup')
        IsUpdateFtn('Lookup', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Lookup ,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Lookup', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Lookup}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.Lookup,() => resetCounteries('Lookup', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Lookup', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Select Lookup type'
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    value={drawerIpnuts?.Lookup?.lookuptypeId} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('Lookup', 'code', e.target.value)}
                    value={drawerIpnuts?.Lookup?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>lookup Name</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Lookup', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Lookup?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Lookup', 'DisplayName', e.target.value)} value={drawerIpnuts?.Lookup?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Parent Lookup :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                  disabled={true}
                  />
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
                    onChange={(e) => drawrInptChng('LookupType', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.LookupType?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnLookup}
              dataSource={lookups}
              loading={lookupsloading}
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
      <MyDrawer title='Gender' open={drawerOpen?.Gender} isPagination={true} onClose={() => {openCloseDrawerFtn('Gender')
        IsUpdateFtn('Gender', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Gender ,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Gender', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Gender}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.Gender,() => resetCounteries('Gender', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Gender', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Gender'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('Gender', 'code', e.target.value)}
                    value={drawerIpnuts?.Gender?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Gender Name</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Gender', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Gender?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('Gender', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.Gender?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('LookupType', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.Gender?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='' open={drawerOpen?.Gender} isPagination={true} onClose={() => {openCloseDrawerFtn('Gender')
        IsUpdateFtn('Gender', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Gender ,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Gender', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Gender}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.Gender,() => resetCounteries('Gender', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Gender', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Gender'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('Gender', 'code', e.target.value)}
                    value={drawerIpnuts?.Gender?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Gender Name</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Gender', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Gender?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('Gender', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.Gender?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('LookupType', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.Gender?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='Title' open={drawerOpen?.Title} isPagination={true} onClose={() => {openCloseDrawerFtn('Title')
        IsUpdateFtn('Title', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Title,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Title', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Title}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.Title,() => resetCounteries('Title', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Title', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Title'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('Title', 'code', e.target.value)}
                    value={drawerIpnuts?.Title?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Title Name</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Title', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Title?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('Title', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.Title?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('Title', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.Title?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              // dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='MaritalStatus' open={drawerOpen?.MaritalStatus} isPagination={true} onClose={() => {openCloseDrawerFtn('MaritalStatus')
        IsUpdateFtn('MaritalStatus', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Title,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.MaritalStatus}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.MaritalStatus,() => resetCounteries('MaritalStatus', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('MaritalStatus', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='MaritalStatus'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('MaritalStatus', 'code', e.target.value)}
                    value={drawerIpnuts?.MaritalStatus?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Marital Status</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('MaritalStatus', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.MaritalStatus?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('MaritalStatus', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.MaritalStatus?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('Title', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              // dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='Project Types' open={drawerOpen?.ProjectTypes} isPagination={true} onClose={() => {openCloseDrawerFtn('ProjectTypes')
        IsUpdateFtn('ProjectTypes', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.ProjectTypes,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('ProjectTypes', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.ProjectTypes}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.ProjectTypes,() => resetCounteries('ProjectTypes', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('ProjectTypes', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='ProjectTypes'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('ProjectTypes', 'code', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Project Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('ProjectTypes', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('ProjectTypes', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.ProjectTypes?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('ProjectTypes', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              // dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='Trainings' open={drawerOpen?.Trainings} isPagination={true} onClose={() => {openCloseDrawerFtn('Trainings')
        IsUpdateFtn('Trainings', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.ProjectTypes,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Trainings', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Trainings}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.Trainings,() => resetCounteries('Trainings', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Trainings', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Trainings'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('ProjectTypes', 'code', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Trainings</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('ProjectTypes', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('ProjectTypes', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.ProjectTypes?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('ProjectTypes', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              // dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer
  title="Duties"
  open={drawerOpen?.Duties}
  isPagination={true}
  onClose={() => {
    openCloseDrawerFtn("Duties");
    IsUpdateFtn("Duties", false);
  }}
  add={async () => {
    await insertDataFtn(
      `${baseURL}/lookup`,
      drawerIpnuts?.Duties,
      "Data inserted successfully",
      "Data did not insert",
      () =>
        resetCounteries("Duties", () => dispatch(getAllLookups()))
    );
    dispatch(getAllLookups());
  }}
  isEdit={isUpdateRec?.Duties}
  update={async () => {
    await updateFtn(
      "/lookup",
      drawerIpnuts?.Duties,
      () => resetCounteries("Duties", () => dispatch(getAllLookups()))
    );
    dispatch(getAllLookups());
    IsUpdateFtn("Duties", false);
  }}
>
  <div className="drawer-main-cntainer">
    <div className="mb-4 pb-4">
      <div className="drawer-inpts-container">
        <div className="drawer-lbl-container">
          <p>Lookup Type :</p>
        </div>
        <div className="inpt-con">
          <p className="star">*</p>
          <div className="inpt-sub-con">
            <MySelect
              isSimple={true}
              placeholder="Duties"
              disabled={true}
              options={lookupsType}
              onChange={(value) => {
                drawrInptChng("Lookup", "Parentlookup", String(value));
                drawrInptChng("Lookup", "lookuptypeId", String(value));
              }}
            />
            <h1 className="error-text"></h1>
          </div>
          <p className="error"></p>
        </div>
      </div>
      <div className="drawer-inpts-container">
        <div className="drawer-lbl-container">
          <p>Code:</p>
        </div>
        <div className="inpt-con">
          <p className="star">*</p>
          <div className="inpt-sub-con">
            <Input
              className="inp"
              onChange={(e) =>
                drawrInptChng("Duties", "code", e.target.value)
              }
              value={drawerIpnuts?.Duties?.code}
            />
          </div>
          <p className="error"></p>
        </div>
      </div>
      <div className="drawer-inpts-container">
        <div className="drawer-lbl-container">
          <p>Duties Name</p>
        </div>
        <div className="inpt-con">
          <p className="star">*</p>
          <div className="inpt-sub-con">
            <Input
              className="inp"
              onChange={(e) =>
                drawrInptChng("Duties", "lookupname", e.target.value)
              }
              value={drawerIpnuts?.Duties?.lookupname}
            />
          </div>
          <p className="error"></p>
        </div>
      </div>
      <div className="drawer-inpts-container">
        <div className="drawer-lbl-container">
          <p>Display Name :</p>
        </div>
        <div className="inpt-con">
          <p className="star-white">*</p>
          <div className="inpt-sub-con">
            <Input
              className="inp"
              onChange={(e) =>
                drawrInptChng("Duties", "DisplayName", e.target.value)
              }
              value={drawerIpnuts?.Duties?.DisplayName}
            />
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
              onChange={(e) =>
                drawrInptChng("Duties", "isActive", e.target.checked)
              }
              checked={drawerIpnuts?.Duties?.isActive}
            >
              Active
            </Checkbox>
          </div>
          <p className="error"></p>
        </div>
      </div>
    </div>
    <div className="mt-4 config-tbl-container">
      <Table
        pagination={false}
        columns={columnGender}
        // dataSource={data?.Duties}
        loading={lookupsloading}
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
</MyDrawer>;

      <MyDrawer title='Ranks' open={drawerOpen?.Ranks} isPagination={true} onClose={() => {openCloseDrawerFtn('Ranks')
        IsUpdateFtn('Ranks', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.ProjectTypes,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Ranks', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Ranks}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.Ranks,() => resetCounteries('Ranks', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Ranks', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Ranks'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('Ranks', 'code', e.target.value)}
                    value={drawerIpnuts?.Ranks?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Rank</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Ranks', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.Ranks}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('Ranks', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.ProjectTypes?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('Ranks', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              // dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='Marital Status' open={drawerOpen?.MaritalStatus} isPagination={true} onClose={() => {openCloseDrawerFtn('MaritalStatus')
        IsUpdateFtn('MaritalStatus', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.MaritalStatus ,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.MaritalStatus}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.MaritalStatus,() => resetCounteries('MaritalStatus', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('MaritalStatus', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Marital Status'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('MaritalStatus', 'code', e.target.value)}
                    value={drawerIpnuts?.lookupname?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Marital Status</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Marital Status', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.MaritalStatus?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('MaritalStatus', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.MaritalStatus?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('MaritalStatus', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.Gender?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnGender}
              dataSource={data?.gender}
              loading={lookupsloading}
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
      <MyDrawer title='Spoken Languages' open={drawerOpen?.SpokenLanguages} isPagination={true} onClose={() => {openCloseDrawerFtn('SpokenLanguages')
        IsUpdateFtn('Spoken Languages', false, )
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.SpokenLanguages,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('SpokenLanguages', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.SpokenLanguages}
        update={
          async () => {
           await updateFtn('/lookup', drawerIpnuts?.SpokenLanguages,() => resetCounteries('SpokenLanguages', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('SpokenLanguages', false, )
          }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect  isSimple={true} placeholder='Spoken Languages'
                  
                  disabled={true}
                   options={lookupsType} onChange={(value) => {
                    drawrInptChng('Lookup', 'Parentlookup', String(value))
                    drawrInptChng('Lookup', 'lookuptypeId', String(value))
                  }}
                    
                     />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('SpokenLanguages', 'code', e.target.value)}
                    value={drawerIpnuts?.SpokenLanguages?.code}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Spoken Languages</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('SpokenLanguages', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.SpokenLanguages?.lookupname}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('SpokenLanguages', 'DisplayName', e.target.value)} 
                  value={drawerIpnuts?.SpokenLanguages?.DisplayName} />
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
                    onChange={(e) => drawrInptChng('SpokenLanguages', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.SpokenLanguages?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnLookup}
              dataSource={data?.SpokenLanguages}
              loading={lookupsloading}
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
      <MyDrawer title='Solicitors' open={drawerOpen?.Solicitors} isPagination={true} onClose={() => openCloseDrawerFtn('Solicitors')}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/region`,
            { 'region': drawerIpnuts?.Lookup },
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Lookup', () => dispatch(getAllLookups()))
          );
        }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Contact Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  {/* <Input className="inp" onChange={(e) => drawrInptChng('LookupType :', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} /> */}
                  <MySelect isSimple={true} placeholder='Select Contact type'
                    disabled={true}
                  />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Title :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Mr.' />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Forename :</p>
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
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Surname :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Email :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Mobile :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Building or House :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Street or Road :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Area or Town :</p>
              </div>
              <div className="inpt-con" >
                <p className="star-white">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>County, City or Postcode :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container ">
              <div className="drawer-lbl-container" style={{ width: "25%" }} >
                <p>Eircode :</p>
              </div>
              <div className="inpt-con" >
                <p className="star">*</p>
                <div className="inpt-sub-con" >
                  <Input />

                </div>
                <p className="error"></p>
              </div>
            </div>

          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnLookup}
              dataSource={lookups}
              loading={lookupsloading}
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
      <MyDrawer title='Committees' open={drawerOpen?.Committees} isPagination={true} onClose={() => {openCloseDrawerFtn('Committees')
        IsUpdateFtn('Committees', false, )
      }}
      isAddMemeber={true}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/region`,
            { 'region': drawerIpnuts?.Committees },
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Lookup', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Lookup}
        update={
          async () => {
           await updateFtn('/region', drawerIpnuts?.Lookup,() => resetCounteries('Lookup', () => dispatch(getAllLookups())))
           dispatch(getAllLookups())
           IsUpdateFtn('Lookup', false, )
          }}
          width="680"
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Committee' disabled={true} options={lookupsType} onChange={(value) => {
                    // drawrInptChng('Lookup', 'RegionTypeID', String(value))
                  }}
                    value={drawerIpnuts?.Lookup?.RegionTypeID} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp"
                    //  onChange={(e) => drawrInptChng('Lookup', 'RegionCode', e.target.value)}
                    // value={drawerIpnuts?.Lookup?.RegionCode}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Committee Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    // onChange={(e) => drawrInptChng('Lookup', 'RegionName', e.target.value)}
                    // value={drawerIpnuts?.Lookup?.RegionName}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Lookup', 'DisplayName', e.target.value)} value={drawerIpnuts?.Lookup?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Parent :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con d-flex ">
                  <Input className="inp"
                  />
                  <Button className="butn primary-btn detail-btn ms-2">+</Button>
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
                    onChange={(e) => drawrInptChng('LookupType', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.LookupType?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={Committeescolumns}
              dataSource={lookups}
              loading={lookupsloading}
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
  );
}

const styles = {
  // centeredCol: {
  //   paddingTop: "0.5rem",
  //   display: "flex",
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  // centeredCell: {
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   height: "100%",
  // },
};

export default Configuratin;