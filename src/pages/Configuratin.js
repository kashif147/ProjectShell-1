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
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import MyConfirm from "../component/common/MyConfirm";
import {
  ProvinceOutlined, CountyOutlined, MaritalStatusOutlined,
  StationOutlined, Gender, PostCodeOutlined, DistrictsOutlined,
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
import { getAllRegionTypes } from '../features/RegionTypeSlice'

import { set } from "react-hook-form";

function Configuratin() {
  const [data, setdata] = useState({
    gender: [],
    SpokenLanguages: [],
    Provinces: [],
    county: [],
    Divisions: [],
    Districts: [],
    Cities: [],
    Titles: [],
    Stations:[]
  })

console.log(data?.Stations,"88")
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
  const { lookupsTypes, lookupsTypesloading } = useSelector((state) => state.lookupsTypes);
  const { regionTypes, regionTypesLoading } = useSelector((state) => state.regionTypes);

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
    Committees: false,
    SpokenLanguages: false,
    Gender: false,
    Title: false,
    ProjectTypes: false,
    Trainings: false,
    Ranks: false,
    Duties: false,
    RegionType: false
  })
  const [selectLokups, setselectLokups] = useState({
    Provinces: [],
    Counteries: [],
    Divisions: [],
    Districts: [],
  });

  const [lookupsData, setlookupsData] = useState({
    Duties: [],
    MaritalStatus: [],
  })
  // this state indicate that drawer inputs have the value for editing
  const [isUpdateRec, setisUpdateRec] = useState({
    Lookup: false,
    LookupType: false,
    RegionType: false,
    Title: false,
    Gender: false,
    MaritalStatus: false,
    Provinces: false,
    Counteries: false
  })
  useEffect(() => {
    if (data?.Provinces) {
      const transformedData = data.Provinces.map((item) => ({
        key: item?._id,
        label: item?.RegionName,
      }));

      setselectLokups((prevState) => ({
        ...prevState,
        Provinces: transformedData,
      }));
    }
    if (data?.county) {
      const transformedData = data.county.map((item) => ({
        key: item?._id,
        label: item?.RegionName,
      }));

      setselectLokups((prevState) => ({
        ...prevState,
        Counteries: transformedData,
      }));
    }
    if (data?.Divisions) {
      const transformedData = data.Divisions.map((item) => ({
        key: item?._id,
        label: item?.RegionName,
      }));

      setselectLokups((prevState) => ({
        ...prevState,
        Divisions: transformedData,
      }));
    }
    if (data?.Districts) {
      const transformedData = data.Districts.map((item) => ({
        key: item?._id,
        label: item?.RegionName,
      }));

      setselectLokups((prevState) => ({
        ...prevState,
        Districts: transformedData,
      }));
    }
  }, [data]);
  useEffect(() => {
    if (lookups && Array.isArray(lookups)) {
      const filteredGender = lookups?.filter((item) => item?.lookuptypeId?._id === '674a1977cc0986f64ca36fc6')
      setdata((prevState) => ({
        ...prevState,
        gender: filteredGender,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const filteredDuties = lookups?.filter((item) => item?.Parentlookup === '674a219fcc0986f64ca3701b')
      setlookupsData((prevState) => ({
        ...prevState,
        Duties: filteredDuties,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const filteredMaritalStatus = lookups?.filter((item) => item?.lookuptypeId?._id === '67b434ccc51214d371b7c0d1')
      setlookupsData((prevState) => ({
        ...prevState,
        MaritalStatus: filteredMaritalStatus,
      }));
    }
   
  }, [lookups])

  useEffect(() => {
    if (regions && Array.isArray(regions)) {
      const filteredProvinces = regions.filter((item) => item.RegionTypeID === '6761492de9640143bfc38e4c');
      setdata((prevState) => ({
        ...prevState,
        Provinces: filteredProvinces,
      }));
    }
    if (regions && Array.isArray(regions)) {
      const filteredCounty = regions.filter((item) => item.RegionTypeID === '67182276a0072a28aab883de');
      setdata((prevState) => ({
        ...prevState,
        county: filteredCounty,
      }));
    }
    if (regions && Array.isArray(regions)) {
      const filteredDivision = regions.filter((item) => item.RegionTypeID === '671822b4a0072a28aab883e5');

      setdata((prevState) => ({
        ...prevState,
        Divisions: filteredDivision,
      }));
    }
    if (regions && Array.isArray(regions)) {
      const filteredDistricts = regions.filter((item) => item.RegionTypeID === '671822bca0072a28aab883e7');

      setdata((prevState) => ({
        ...prevState,
        Districts: filteredDistricts,
      }));
    }
    if (regions && Array.isArray(regions)) {
      const filteredDistricts = regions.filter((item) => item.RegionTypeID === '671822bca0072a28aab883e7');

      setdata((prevState) => ({
        ...prevState,
        Cities: filteredDistricts,
      }));
    }
    if (regions && Array.isArray(regions)) {
      const filteredDistricts = regions.filter((item) => item.RegionTypeID === '6718228ca0072a28aab883e0');
      
      setdata((prevState) => ({
        ...prevState,
        Cities: filteredDistricts,
      }));
    }
    if (regions && Array.isArray(regions)) {
      
      const filteredStations = regions.filter((item) => item.RegionTypeID === '671822c6a0072a28aab883e9')
     debugger
      setdata((prevState) => ({
        ...prevState,
        Stations: filteredStations,
      }));
    }
  }, [regions]);
  useEffect(() => {
    dispatch(getAllRegionTypes())
  }, [])
  useEffect(() => {
    if (lookups && Array.isArray(lookups)) {
      const filteredLanguage = lookups?.filter((item) => item?.Parentlookup === '674a195dcc0986f64ca36fc2')
      setdata((prevState) => ({
        ...prevState,
        SpokenLanguages: filteredLanguage,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const filteredTitles = lookups?.filter((item) => item?.lookuptypeId?._id === '675fc362e9640143bfc38d28')
      setdata((prevState) => ({
        ...prevState,
        Titles: filteredTitles,
      }));
    }
  }, [lookups])
  const [drawer, setdrawer] = useState(false)
  useEffect(() => {
    dispatch(fetchRegions());

  }, []);
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
  useEffect(() => {
    dispatch(getLookupTypes())
  }, [])
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
    Counteries: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegionId: null, isDeleted: false, RegionTypeID: '67182276a0072a28aab883de', isActive: true },
    Cities: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegionId: null, isDeleted: false, RegionTypeID: '6718228ca0072a28aab883e0' },
    Station: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegionId: null, isDeleted: false, RegionTypeID: '671822c6a0072a28aab883e9' },
    // Station:     {RegionCode:'', RegionTypeID: '671822c6a0072a28aab883e9',RegionName:'', DisplayName: '', isDeleted: false},
    Districts: { RegionCode: '', RegionName: '', DisplayName: '', ParentRegionId: null, isDeleted: false, RegionTypeID: '671822bca0072a28aab883e7' },
    LookupType: { lookuptype: '', code: '', DisplayName: '', isActive: true, isDeleted: false },
    Lookup: { lookuptypeId: '', DisplayName: '', lookupname: '', code: '', Parentlookup: '', "userid": "67117bea87c907f6cdda0ad9", isActive: true },
    Gender: { lookuptypeId: '674a1977cc0986f64ca36fc6', DisplayName: '', lookupname: '', code: '', Parentlookup: null, "userid": "67117bea87c907f6cdda0ad9", },
    Title: { lookuptypeId: '675fc362e9640143bfc38d28', DisplayName: '', lookupname: '', code: '', Parentlookup: null, "userid": "67117bea87c907f6cdda0ad9", },
    SpokenLanguages: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', "userid": "67117bea87c907f6cdda0ad9" },
    MaritalStatus: { lookuptypeId: '67b434ccc51214d371b7c0d1', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', "userid": "67117bea87c907f6cdda0ad9" },
    ProjectTypes: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', "userid": "67117bea87c907f6cdda0ad9", isActive: true },
    Trainings: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', "userid": "67117bea87c907f6cdda0ad9", isActive: true },
    Ranks: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', "userid": "67117bea87c907f6cdda0ad9", isActive: true },
    Provinces: { code: '', lookupname: '', DisplayName: '', Parentlookup: null, lookuptypeId: '6761492de9640143bfc38e4c', isDeleted: false,"userid": "67117bea87c907f6cdda0ad9" },
    Duties: { lookuptypeId: '674a219fcc0986f64ca3701b', DisplayName: '', lookupname: '', code: '', Parentlookup: null, "userid": "67117bea87c907f6cdda0ad9", isActive: true ,},
    RegionType: { RegionType: '', DisplayName: '', isActive: true, isDeleted: false },
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
    if (value == false) {
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
  // /region/RegionTypeID/6761492de9640143bfc38e4c/ParentRegion/67614e73479dfae6328a2641
  //   const getCountyById = async (ParentRegion) =>{
  //     try {
  //         const token = localStorage.getItem('token');
  //         const response = await axios.get(`${baseURL}/region/RegionTypeID/67182268a0072a28aab883dc/ParentRegion/${ParentRegion}`, {
  // // /region/RegionTypeID/67182268a0072a28aab883dc/ParentRegion/67614e73479dfae6328a2641
  //           headers: {
  //                 Authorization: `Bearer ${token}`,
  //                 'Content-Type': 'application/json',
  //             },
  //         });
  // const countyLookup = response?.data?.map((item)=>({
  //   key:item?._id,
  //   label:item?.RegionName
  // }))
  //         return setselectLokups((prev)=>({
  //           ...prev,  Counteries:countyLookup
  //         })) ;
  //     } catch (error) {
  //         // return rejectWithValue(error.response?.data?.message || 'Failed to fetch lookups');
  //     }
  // }
  // console.log(selectLokups,"//")
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
        updatedDrawerInputs.Lookup = {
          ...updatedDrawerInputs.Lookup,
          id: idValue,
        };
      } else if (drawer === "LookupType" && updatedDrawerInputs.LookupType) {
        updatedDrawerInputs.LookupType = {
          ...updatedDrawerInputs.LookupType,
          id: idValue,
        };
      } else if (drawer === "Gender" && updatedDrawerInputs.Gender) {
        updatedDrawerInputs.Gender = {
          ...updatedDrawerInputs.Gender,
          id: idValue,
        };
      } else if (drawer === "RegionType" && updatedDrawerInputs?.RegionType) {

        updatedDrawerInputs.RegionType = {
          ...updatedDrawerInputs.RegionType,
          id: idValue,
        };
      } else if (drawer === "MaritalStatus" && updatedDrawerInputs?.MaritalStatus) {

        updatedDrawerInputs.MaritalStatus = {
          ...updatedDrawerInputs.MaritalStatus,
          id: idValue,
        };
      } else if (drawer === "Title" && updatedDrawerInputs?.Title) {
        updatedDrawerInputs.Title = {
          ...updatedDrawerInputs.Title,
          id: idValue,
        };
      } else if (drawer === "Provinces" && updatedDrawerInputs?.Provinces) {
        updatedDrawerInputs.Title = {
          ...updatedDrawerInputs.Title,
          id: idValue,
        };
      }
      else if (drawer === "Counteries" && updatedDrawerInputs?.Counteries) {
        updatedDrawerInputs.Title = {
          ...updatedDrawerInputs.Title,
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Provinces', !isUpdateRec?.Provinces, record)
            addIdKeyToLookup(record?._id, "Provinces")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/lookup`, record?._id,);
                dispatch(fetchRegions())
              },
            })
          } />
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
      dataIndex: 'RegionName',
      key: 'RegionName',
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
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Counteries', !isUpdateRec?.Provinces, record)
              addIdKeyToLookup(record?._id, "Counteries")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(fetchRegions())
                },
              })
            }}
          />
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
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Active',

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
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Districts', !isUpdateRec?.Provinces, record)
              addIdKeyToLookup(record?._id, "Districts")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(fetchRegions())
                },
              })
            }}
          />
        </Space>
      ),
    },
  ];
  const columnStations = [
    {
      title: 'Code',
      dataIndex: 'RegionCode',
      key: 'RegionCode',
    },
    {
      title: 'Stations',
      dataIndex: 'RegionName',
      key: 'RegionName',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'District',
      dataIndex: '',
      key: 'RegionName',
    },
    {
      title: 'Active',

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
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Districts', !isUpdateRec?.Provinces, record)
              addIdKeyToLookup(record?._id, "Districts")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(fetchRegions())
                },
              })
            }}
          />
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
      dataIndex: '',
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
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Divisions', !isUpdateRec?.Provinces, record)
              addIdKeyToLookup(record?._id, "Divisions")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(fetchRegions())
                },
              })
            }}
          />
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
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Divisions', !isUpdateRec?.Provinces, record)
              addIdKeyToLookup(record?._id, "Divisions")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(fetchRegions())
                },
              })
            }}
          />
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('LookupType', !IsUpdateFtn?.LookupType, record)
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
                  dispatch(getAllRegionTypes())
                },
              })
            }
            style={{ cursor: 'pointer' }} // Change the cursor to pointer for better UX
          />
        </Space>
      ),
    },
  ];
  const columnRegionType = [
    {
      title: 'Region Type',
      dataIndex: 'RegionType',
      key: 'RegionType',
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
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('RegionType', !IsUpdateFtn?.RegionType, record)
              addIdKeyToLookup(record?._id, "RegionType")
            }} />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/RegionType`, record?._id, () => dispatch(getAllRegionTypes()));
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
      render: (index, record) => (
        <div>
          {record?.lookuptypeId?.lookuptype}
        </div>
      )
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Lookup', !IsUpdateFtn?.Lookup, record)
            addIdKeyToLookup(record?._id, "Lookup")
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
      dataIndex: 'lookuptype',
      key: 'lookuptype',
      render: (index, record) => (
        <>
          {
            record?.lookuptypeId?.lookuptype
          }
        </>
      )
    },
    {
      title: ' Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Gender', !IsUpdateFtn?.Gender, record)
            addIdKeyToLookup(record?._id, "Gender")
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
  const columntTitles = [
    {
      title: 'code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ['ascend', 'descend'], // Optional: Sets the sort order directions
    },
    {
      title: ' Lookup Type ',
      // dataIndex: 'lookuptypeId',
      // key: 'lookuptypeId',
      filters: [
        { text: 'A01', value: 'A01' },
        { text: 'B02', value: 'B02' },
        { text: 'C03', value: 'C03' },
        // Add more filter options as needed
      ],
      // onFilter: (value, record) => record.RegionCode === value,
      render: (index, record) => (
        <>
          {record?.lookuptypeId?.lookuptype}
        </>
      )
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Title', !IsUpdateFtn?.Title, record)
            addIdKeyToLookup(record?._id, "Title")
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
  const columnMaritalStatus = [
    {
      title: 'code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ['ascend', 'descend'], // Optional: Sets the sort order directions
    },
    {
      title: ' Lookup Type ',
      filters: [
        { text: 'A01', value: 'A01' },
        { text: 'B02', value: 'B02' },
        { text: 'C03', value: 'C03' },
      ],
      render: (index, record) => (
        <>
          {record?.lookuptypeId?.lookuptype}
        </>
      )
    },
    {
      title: ' Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('MaritalStatus', !isUpdateRec?.MaritalStatus, record)
            addIdKeyToLookup(record?._id, "MaritalStatus")
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
  const columnDuties = [
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Gender', !IsUpdateFtn?.Gender, record)
            addIdKeyToLookup(record?._id, "Gender")
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Lookup', !IsUpdateFtn?.Lookup, record)
            addIdKeyToLookup(record?._id, "Lookup")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/lookup`, record?._id,);
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
  const { Search } = Input;
  return (
    <div className="configuration-main">
      <h1 className="config-heading" style={{ marginLeft: '45px' }}>Configurations</h1>
      <div className="search-inpt">
        <Search style={{ borderRadius: "3px", height: '62px' }} />
      </div>
      <Divider orientation="left">lookups Configuration</Divider>
      <Row>
        <Col className="hover-col" span={3} onClick={() => { openCloseDrawerFtn('Title') }}>
          <div className="center-content">
            <div className="icon-container">
              <Title className="icons custom-icon" />
            </div>
            <p className="lookups-title">Titles</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => { openCloseDrawerFtn('Gender') }}>
          <div className="center-content">
            <div className="icon-container">
              <Gender className="custom-icon" />
            </div>
            <p className="lookups-title">Gender</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => { openCloseDrawerFtn('MaritalStatus') }}>
          <div className="center-content">
            <div className="icon-container">
              {/* <img src={Marital_Status_Outlined} className="icons custom-icon" /> */}
              <MaritalStatusOutlined className="icons custom-icon" />
            </div>
            <p className="lookups-title">Marital Status</p>
          </div>
        </Col>
        <Col onClick={() => openCloseDrawerFtn('Provinces')} className="hover-col" span={3} style={styles.centeredCol}>
          <div>
            <ProvinceOutlined className="custom-icon icons" />
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



        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('Divisions')}>
            <DivisionsOutlined className="icons custom-icon" />
            <p className="lookups-title">Divisions</p>
          </div>
        </Col>
        <Col onClick={() => openCloseDrawerFtn('Districts')} className="hover-col" span={3} style={styles.centeredCol}>
          <div >
            <DistrictsOutlined className="icons custom-icon" />
            <p className="lookups-title">Districts</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('Cities')}>
          <div >
            <CitiesOutlined className="custom-icon icons" />
            <p className="lookups-title">Cities</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} >
          <div onClick={() => openCloseDrawerFtn('Station')}>
            <StationOutlined className="icons custom-icon" />
            <p className="lookups-title">Station</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('PostCode')}>
            <PostCodeOutlined className="icons custom-icon" />
            <p className="lookups-title">Post Codes</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} >
          <div onClick={() => openCloseDrawerFtn('Committees')}>
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
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('SpokenLanguages')}>
          <div>
            <LanguageOutlined className="icons custom-icon" />
            <p className="lookups-title">Spoken Languages</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('ProjectTypes')}>
          <div>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Project Types</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('Trainings')}>
          <div >
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Trainings</p>
          </div>
        </Col>
        <Col className="hover-col" span={3} onClick={() => openCloseDrawerFtn('Ranks')}>
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
          <div>
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
        <Col className="hover-col" span={3} style={styles.centeredCol}>
          <div onClick={() => openCloseDrawerFtn('RegionType')}>
            <PiHandshakeDuotone className="icons" />
            <p className="lookups-title">Region Type</p>
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
        insertDataFtn(`/lookup`, { 'region': drawerIpnuts?.Counteries }, 'Data inserted successfully:', 'Data did not insert:', () => {
          resetCounteries('Counteries')
          dispatch(fetchRegions())
        })
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
                  <MySelect isSimple={true} options={selectLokups?.Provinces}
                    onChange={(e) => {
                      drawrInptChng('Counteries', 'ParentRegionId', e)
                      console.log()
                    }}
                    value={drawerIpnuts?.Counteries?.ParentRegionId}
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
              dataSource={data?.county}
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
      <MyDrawer title='Provinces'
        open={drawerOpen?.Provinces}
        isPagination={true}
        onClose={() => openCloseDrawerFtn('Provinces')} add={() => {
          insertDataFtn(`${baseURL}/lookup`,  drawerIpnuts?.Provinces ,
            'Data inserted successfully:', 'Data did not insert:',
            () => {
              resetCounteries('Provinces')
              dispatch(fetchRegions())
            })

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
                  <Input className="inp" onChange={(e) => drawrInptChng('Provinces', 'RegionCode', e.target.value)}
                    value={drawerIpnuts?.Provinces?.RegionCode} />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Provinces', 'RegionName', e.target.value)}
                    value={drawerIpnuts?.Provinces?.RegionName} />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Provinces', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Provinces?.DisplayName} />
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
              dataSource={data?.Provinces}
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
        insertDataFtn(`/lookup`, { region: drawerIpnuts?.Cities }, 'Data inserted successfully:', 'Data did not insert:', () => resetCounteries('Cities'))
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
            {/* <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} 
                   options={selectLokups?.Provinces} 
                   onChange={(e) => {
                    // drawrInptChng('Counteries', 'RegionTypeID', e)
                    drawrInptChng('Counteries', 'ParentRegion', e)
                    getCountyById(e)
                  }}/>        
                </div>
                <p className="error"></p>
              </div>
            </div> */}
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>District :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} options={selectLokups?.Districts}
                    value={drawerIpnuts?.Cities?.ParentRegionId}
                    onChange={(e) => drawrInptChng('Cities', 'ParentRegionId', e)}
                  />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Cities', 'RegionCode', e.target.value)}
                    value={drawerIpnuts?.Cities?.RegionCode} />
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
                  <Input className="inp"
                    onChange={(e) => {

                      drawrInptChng('Cities', 'RegionName', e.target.value)
                    }} value={drawerIpnuts?.Cities?.RegionName} />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Cities', 'DisplayName', e.target.value)} value={drawerIpnuts?.Cities?.DisplayName} />
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
              dataSource={data?.Cities}
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
        insertDataFtn(`/lookup`, drawerIpnuts?.PostCode, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('PostCode'))
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
        insertDataFtn(`/lookup`, { region: drawerIpnuts?.Districts }, 'Data inserted successfully:', 'Data did not insert:',
          () => {
            resetCounteries('Districts')
            dispatch(fetchRegions())
          })
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Districts', 'RegionCode', e.target.value)}
                    value={drawerIpnuts?.Districts?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>District</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">

                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Districts', 'RegionName', e.target.value)}
                    value={drawerIpnuts?.Districts?.RegionName} />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Districts', 'DisplayName', e.target.value)} value={drawerIpnuts?.Districts?.DisplayName} />
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
                  <MySelect isSimple={true} placeholder='Select Division'
                    options={selectLokups?.Divisions} onChange={(e) => drawrInptChng('Districts', 'ParentRegionId', e)} value={drawerIpnuts?.Districts?.ParentRegion} />
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
              dataSource={data?.Districts}
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
        insertDataFtn(`/lookup`, { region: drawerIpnuts?.Divisions }, 'Data inserted successfully:', 'Data did not insert:', () => {
          resetCounteries('Divisions')
          dispatch(fetchRegions())
        })
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
                <p>County :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' onChange={(e) => drawrInptChng('Divisions', 'ParentRegionId', e)} isSimple={true} options={selectLokups?.Counteries} />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Divisions', 'RegionCode', e.target.value)} value={drawerIpnuts?.Divisions?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>


            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Division : </p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Divisions', 'RegionName', e.target.value)} value={drawerIpnuts?.Divisions?.RegionName} />
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Divisions', 'DisplayName', e.target.value)} value={drawerIpnuts?.Divisions?.DisplayName} />
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
              dataSource={data?.Divisions}
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
      <MyDrawer title='Station' 
      open={drawerOpen?.Station} 
      isPagination={true} onClose={() => openCloseDrawerFtn('Station')} add={() => {
        console.log(drawerIpnuts?.Station)
        insertDataFtn(`/lookup`,{region:drawerIpnuts?.Station}, 
          'Data inserted successfully:', 'Data did not insert:',
           () => {resetCounteries('Station')
           dispatch(fetchRegions())
          }
          )
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
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('Station', 'RegionCode', e.target.value)} 
                  value={drawerIpnuts?.Station?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Station Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" 
                  onChange={(e) => drawrInptChng('Station', 'RegionName', e.target.value)} 
                  value={drawerIpnuts?.Station?.RegionName} 
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                   onChange={(e) => drawrInptChng('Station', 'DisplayName', e.target.value)} 
                   value={drawerIpnuts?.Station?.DisplayName} />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>District :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} 
                  options={selectLokups?.Districts}
                    value={drawerIpnuts?.Station?.ParentRegionId}
                    onChange={(e) => drawrInptChng('Station', 'ParentRegionId', e)}
                  />
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
              columns={columnStations}
              dataSource={data?.Stations}
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
        insertDataFtn(`${baseURL}/lookup`, drawerIpnuts?.ContactTypes, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('ContactTypes'))
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
      <MyDrawer title='Lookup Type' open={drawerOpen?.LookupType} isPagination={true} onClose={() => {
        openCloseDrawerFtn('LookupType')
        IsUpdateFtn('LookupType', false,)
      }}
        isEdit={isUpdateRec?.LookupType}
        update={
          async () => {
            await updateFtn('/lookuptype', drawerIpnuts?.LookupType, () => resetCounteries('LookupType'))
            dispatch(getLookupTypes())
            IsUpdateFtn('LookupType', false,)
          }}
        add={async () => {
          await insertDataFtn(
            `/lookuptype`,
            {
              ...drawerIpnuts?.LookupType, "userid": "67117bea87c907f6cdda0ad9",
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
      <MyDrawer title='Region Type' open={drawerOpen?.RegionType} isPagination={true}
        onClose={() => {
          openCloseDrawerFtn('RegionType')
          IsUpdateFtn('RegionType', false,)
        }}
        isEdit={isUpdateRec?.RegionType}
        update={
          async () => {
            await updateFtn('/regiontype', drawerIpnuts?.RegionType, () => dispatch(getAllRegionTypes()))
            IsUpdateFtn('regiontype', false,)
          }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/regiontype`,
            {
              ...drawerIpnuts?.RegionType, "userid": "67117bea87c907f6cdda0ad9",
            },
            'Data inserted successfully',
            'Data did not insert',
            () => {
              resetCounteries('RegionType')
              dispatch(getAllRegionTypes())
            }
            // Pass a function reference
          );
          // dispatch(getLookupTypes())
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
                    onChange={(value) => drawrInptChng('RegionType', 'code', value.target.value)}
                    value={drawerIpnuts?.RegionType?.code}
                    disabled={true}
                  />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Region Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    isSimple={true}
                    placeholder=''
                    onChange={(value) => drawrInptChng('RegionType', 'RegionType', value.target.value)}
                    value={drawerIpnuts?.RegionType?.RegionType}
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
                    onChange={(value) => drawrInptChng('RegionType', 'DisplayName', value.target.value)}
                    value={drawerIpnuts?.RegionType?.DisplayName}
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
                    onChange={(e) => drawrInptChng('RegionType', 'isActive', e.target.checked)}
                    checked={drawerIpnuts?.RegionType?.isActive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnRegionType}
              dataSource={regionTypes}
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
              loading={regionTypesLoading}
            />;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Lookup' open={drawerOpen?.Lookup} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Lookup')
        IsUpdateFtn('Lookup', false,)
      }}
        add={async () => {
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Lookup,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Lookup', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Lookup}
        update={
          async () => {
            await updateFtn('/lookup', drawerIpnuts?.Lookup, () => resetCounteries('Lookup', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Lookup', false,)
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
                  <MySelect isSimple={true} placeholder='Select Lookup type'
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
      <MyDrawer title='Gender' open={drawerOpen?.Gender} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Gender')
        IsUpdateFtn('Gender', false,)
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Gender,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Gender', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Gender}
        update={
          async () => {
            await updateFtn('/lookup', drawerIpnuts?.Gender, () => resetCounteries('Gender', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Gender', false,)
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
                  <MySelect isSimple={true} placeholder='Gender'
                    disabled={true}
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
      <MyDrawer title='' isPagination={true} onClose={() => {
        openCloseDrawerFtn('Gender')
        IsUpdateFtn('Gender', false,)
      }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Gender,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Gender', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Gender}
        update={
          async () => {
            await updateFtn('/lookup', drawerIpnuts?.Gender, () => resetCounteries('Gender', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Gender', false,)
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
                  <MySelect isSimple={true} placeholder='Gender'

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
      <MyDrawer title='Title' open={drawerOpen?.Title} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Title')
        IsUpdateFtn('Title', false,)
      }}
        add={() => {
           insertDataFtn(
            `/lookup`,
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
            await updateFtn('/lookup', drawerIpnuts?.Title, () => resetCounteries('Title', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Title', false,)
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
                  <MySelect isSimple={true} placeholder='Title'
                    disabled={true}
                    options={lookupsType} onChange={(value) => {
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
              columns={columntTitles}
              dataSource={data?.Titles}
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
      <MyDrawer title='MaritalStatus' open={drawerOpen?.MaritalStatus} isPagination={true} onClose={() => {
        openCloseDrawerFtn('MaritalStatus')
        IsUpdateFtn('MaritalStatus', false,)
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
            await updateFtn('/lookup', drawerIpnuts?.MaritalStatus, () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('MaritalStatus', false,)
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
                  <MySelect isSimple={true} placeholder='MaritalStatus'

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
      <MyDrawer title='Project Types' open={drawerOpen?.ProjectTypes} isPagination={true} onClose={() => {
        openCloseDrawerFtn('ProjectTypes')
        IsUpdateFtn('ProjectTypes', false,)
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
            await updateFtn('/lookup', drawerIpnuts?.ProjectTypes, () => resetCounteries('ProjectTypes', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('ProjectTypes', false,)
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
                  <MySelect isSimple={true} placeholder='ProjectTypes'

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
      <MyDrawer title='Trainings' open={drawerOpen?.Trainings} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Trainings')
        IsUpdateFtn('Trainings', false,)
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
            await updateFtn('/lookup', drawerIpnuts?.Trainings, () => resetCounteries('Trainings', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Trainings', false,)
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
                  <MySelect isSimple={true} placeholder='Trainings'

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
              columns={columnDuties}
              dataSource={lookupsData?.Duties}
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

      <MyDrawer title='Ranks' open={drawerOpen?.Ranks} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Ranks')
        IsUpdateFtn('Ranks', false,)
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
            await updateFtn('/lookup', drawerIpnuts?.Ranks, () => resetCounteries('Ranks', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Ranks', false,)
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
                  <MySelect isSimple={true} placeholder='Ranks'

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
      <MyDrawer title='Marital Status' open={drawerOpen?.MaritalStatus} isPagination={true} onClose={() => {
        openCloseDrawerFtn('MaritalStatus')
      }}
        add={async () => {
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.MaritalStatus,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.MaritalStatus}
        update={
          async () => {
            await updateFtn('/lookup', drawerIpnuts?.MaritalStatus, () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('MaritalStatus', false,)

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
                  <MySelect isSimple={true} placeholder='Marital Status'

                    disabled={true}
                    options={lookupsType} onChange={(value) => {

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
              columns={columnMaritalStatus}
              dataSource={lookupsData?.MaritalStatus}
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
      <MyDrawer title='Spoken Languages' open={drawerOpen?.SpokenLanguages} isPagination={true} onClose={() => {
        openCloseDrawerFtn('SpokenLanguages')
        IsUpdateFtn('Spoken Languages', false,)
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
            await updateFtn('/lookup', drawerIpnuts?.SpokenLanguages, () => resetCounteries('SpokenLanguages', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('SpokenLanguages', false,)
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
                  <MySelect isSimple={true} placeholder='Spoken Languages'

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
            `${baseURL}/lookup`,
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
      <MyDrawer title='Committees' open={drawerOpen?.Committees} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Committees')
        IsUpdateFtn('Committees', false,)
      }}
        isAddMemeber={true}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
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
            await updateFtn('/lookup', drawerIpnuts?.Lookup, () => resetCounteries('Lookup', () => dispatch(getAllLookups())))
            dispatch(getAllLookups())
            IsUpdateFtn('Lookup', false,)
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