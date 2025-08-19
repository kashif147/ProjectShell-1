import React, { useEffect, useState, useMemo } from "react";
import { SiActigraph } from "react-icons/si";
import { FaRegMap, FaRocketchat } from "react-icons/fa6";
import MyDrawer from "../component/common/MyDrawer";
import { LuRefreshCw } from "react-icons/lu";
import { Input, Table, Row, Col, Space, Pagination, Divider, Checkbox, Button, } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  Crown, User, Heart, Map, Globe, Building2, MapPin,
  MapPinned, Mail, Layout, Landmark, Languages, FolderKanban,
  Lightbulb, BarChart3, FileText, Gavel, Calendar, MessageSquare,
  File, Shield, Boxes, Search, Phone, HelpCircle, Users
} from "lucide-react";
import { PiHandshakeDuotone } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { LuCalendarDays } from "react-icons/lu";
import { PiUsersFourDuotone } from "react-icons/pi";
import { tableData } from "../Data";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { HiOutlineMinusCircle } from "react-icons/hi";
import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import { getAllLookups } from '../features/LookupsSlice'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { FaFileAlt } from "react-icons/fa";
import { TbBulb } from "react-icons/tb";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineContactPhone } from "react-icons/md";
import { LuFileQuestion } from "react-icons/lu";
import { PiRankingThin } from "react-icons/pi";
import { useTableColumns } from "../context/TableColumnsContext ";
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
import { TbUsersGroup } from "react-icons/tb";
import { TbFileSettings } from "react-icons/tb";
import { PiRanking } from "react-icons/pi";
import { GrTask } from "react-icons/gr";
import { PiGavelThin } from "react-icons/pi";
import { LuAlarmClock } from "react-icons/lu";
import { SlEnvelopeOpen } from "react-icons/sl";
import CustomSelect from "../component/common/CustomSelect";
// import '../styles/Configuratin.css'
import '../styles/Configuration.css'
import MySelect from "../component/common/MySelect";
import { deleteFtn, insertDataFtn, updateFtn } from "../utils/Utilities";
import { baseURL } from "../utils/Utilities";
import { render } from "@testing-library/react";
import { fetchRegions, deleteRegion } from "../features/RegionSlice";
// import { getLookupTypes } from "../features/LookupTypeSlice";
import { getAllRegionTypes } from '../features/RegionTypeSlice'
import { getContactTypes } from "../features/ContactTypeSlice";
import { getContacts } from "../features/ContactSlice";
import { getLookupTypes } from "../features/LookupTypeSlice";
import { set } from "react-hook-form";
import MyInput from "../component/common/MyInput";
import { useNavigate } from "react-router-dom";

// i have different drwers for configuration of lookups for the system 

function Configuratin() {
  const navigate = useNavigate()
  const [data, setdata] = useState({
    gender: [],
    SpokenLanguages: [],
    Provinces: [],
    county: [],
    Divisions: [],
    Districts: [],
    Cities: [],
    Titles: [],
    Stations: [],
    Boards: [],
    Councils: [],
    CorrespondenceType: [],
    DocumentType: [],
    ClaimType: [],
    Schemes: [],
    Reasons: [],
    ProjectTypes: [],
    Trainings: [],
    Ranks: [],
    Duties: [],
    RosterType: [],
    Solicitors: [],
    MaritalStatus: []
  })

  const [searchQuery, setSearchQuery] = useState("");
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
  const { contactTypes, contactTypesloading, error } = useSelector((state) => state.contactType);
  const { contacts, contactsLoading } = useSelector((state) => state.contact);
  const { lookupsForSelect, disableFtn, isDisable } = useTableColumns();
  const [drawerOpen, setDrawerOpen] = useState({
    Counteries: false,
    Provinces: false,
    Cities: false,
    PostCode: false,
    Districts: false,
    Divisions: false,
    DivisionsForDistrict: false,
    Station: false,
    DivisionsForStation: false,
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
    RegionType: false,
    Boards: false,
    ClaimType: false,
    Schemes: false,
    Reasons: false,
    RosterType: false,
  })
  const [selectLokups, setselectLokups] = useState({
    Provinces: [],
    Counteries: [],
    Divisions: [],
    Districts: [],
  });
  console.log(selectLokups, "6565")
  const [lookupsData, setlookupsData] = useState({
    Duties: [],
    MaritalStatus: [],
  })

  const [isUpdateRec, setisUpdateRec] = useState({
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
    RegionType: false,
    Boards: false,
    ClaimType: false,
    Schemes: false,
    Reasons: false,
    RosterType: false,
    Solicitors: false,

  })

  useMemo(() => {
    if (!data) return;

    const updatedLookups = {};

    if (data.Provinces) {
      updatedLookups.Provinces = data.Provinces.map((item) => ({
        key: item?._id,
        label: item?.lookupname,
      }));
    }

    if (data.county) {
      updatedLookups.Counteries = data.county.map((item) => ({
        key: item?._id,
        label: item?.lookupname,
      }));
    }

    if (data.Divisions) {
      updatedLookups.Divisions = data.Divisions.map((item) => ({
        key: item?._id,
        label: item?.lookupname,
      }));
    }

    if (data.Districts) {
      updatedLookups.Districts = data.Districts.map((item) => ({
        key: item?._id,
        label: item?.lookupname,
      }));
    }

    setselectLokups((prevState) => ({ ...prevState, ...updatedLookups }));
  }, [data]);

  useMemo(() => {
    if (contacts && Array.isArray(contacts)) {
      setdata((prevState) => ({
        ...prevState,
        Solicitors: contacts.filter((item) => item?.ContactTypeID === '67d91cdf8a2875433c189f65'),
      }));
    }
  }, [contacts]);
  const [lookupTypSlct, setlookupTypSlct] = useState([])
  useEffect(() => {
    if (!lookupsTypes || Array.isArray(lookupsTypes)) return;
    let arr = []
    lookupsTypes?.map((lokpty) => {
      arr.push({ key: lokpty?._id, label: lokpty?.lookuptype })
    })
    setlookupTypSlct(arr)
  }, [lookupsTypes]);

  useEffect(() => {
    if (!lookups || !Array.isArray(lookups)) return;

    const lookupFilters = [
      { key: "gender", id: "67f58a2d17f0ecf3dbf79cfe" },
      { key: "Titles", id: "67f57de817f0ecf3dbf79cc2" },
      { key: "ProjectTypes", id: "67f6319a17f0ecf3dbf79fbc" },
      { key: "Duties", id: "67f6351b17f0ecf3dbf7a018" },
      { key: "MaritalStatus", id: "67f590d017f0ecf3dbf79d57" },
      { key: "county", id: "67f5971f17f0ecf3dbf79df6" },
      { key: "Divisions", id: "67f5990b17f0ecf3dbf79e35" },
      { key: "Cities", id: "67f6282f17f0ecf3dbf79ef8" },
      { key: "Boards", id: "67f62cbc17f0ecf3dbf79f5a" },
      { key: "Councils", id: "67f62fb517f0ecf3dbf79f86" },
      { key: "CorrespondenceType", id: "67f68bee17f0ecf3dbf7a088" },
      { key: "Stations", id: "67f6297617f0ecf3dbf79f12" },
      { key: "DocumentType", id: "67f68ee617f0ecf3dbf7a0bc" },
      { key: "ClaimType", id: "67f6906617f0ecf3dbf7a0fe" },
      { key: "Schemes", id: "67f691ef17f0ecf3dbf7a135" },
      { key: "Reasons", id: "67f6956817f0ecf3dbf7a189" },
      { key: "Provinces", id: "67f5945517f0ecf3dbf79db4" },
      { key: "Districts", id: "67f626ed17f0ecf3dbf79ed1" },
      { key: "SpokenLanguages", id: "67f6308417f0ecf3dbf79fa3" },
      { key: "Trainings", id: "67f6329f17f0ecf3dbf79fd3" },
      { key: "Ranks", id: "67f6344d17f0ecf3dbf79fff" },
      { key: "RosterType", id: "67f652cf17f0ecf3dbf7a048" },
    ];

    const filteredData = lookupFilters.reduce((acc, { key, id }) => {
      acc[key] = lookups.filter((item) => item?.lookuptypeId?._id === id);
      return acc;
    }, {});

    setdata((prevState) => ({ ...prevState, ...filteredData }));

  }, [lookups]);


  useMemo(() => {
    if (regions && Array.isArray(regions)) {
      setdata((prevState) => ({
        ...prevState,
        Stations: regions.filter((item) => item.RegionTypeID === '671822c6a0072a28aab883e9'),
      }));
    }
  }, [regions]);

  useEffect(() => {
    dispatch(getContacts());
    dispatch(getAllRegionTypes());
    dispatch(getContactTypes());
    dispatch(getLookupTypes())
    dispatch(getAllLookups())
  }, [dispatch]);

  const [ContactTypeData, setContactTypeData] = useState({
    ReigonTypeId: "",
    ReigonType: "",
    DisplayName: "",
    HasChildren: "",
  });
  const [lookupsType, setLookupsType] = useState([]);
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
    Solicitors: {
      Forename: '',
      Surname: '',
      ContactPhone: "",
      ContactEmail: "",
      ContactAddress: {
        BuildingOrHouse: "",
        StreetOrRoad: "",
        AreaOrTown: "",
        CityCountyOrPostCode: "",
        Eircode: ""
      },
      ContactTypeID: "67d91cdf8a2875433c189f65",
      isDeleted: false
    },
    RegionType: { RegionType: '', DisplayName: '', isactive: true, isDeleted: false },
    Counteries: { lookuptypeId: '67f5971f17f0ecf3dbf79df6', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Station: { lookuptypeId: '67f6297617f0ecf3dbf79f12', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Cities: { lookuptypeId: '67f6282f17f0ecf3dbf79ef8', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Districts: { lookuptypeId: '67f626ed17f0ecf3dbf79ed1', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Divisions: { lookuptypeId: '67f5990b17f0ecf3dbf79e35', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Councils: { lookuptypeId: '67f62fb517f0ecf3dbf79f86', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    CorrespondenceType: { lookuptypeId: '67f68bee17f0ecf3dbf7a088', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    ClaimType: { lookuptypeId: '67f6906617f0ecf3dbf7a0fe', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Schemes: { lookuptypeId: '67f691ef17f0ecf3dbf7a135', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Reasons: { lookuptypeId: '67f6956817f0ecf3dbf7a189', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    DocumentType: { lookuptypeId: '67f68ee617f0ecf3dbf7a0bc', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Boards: { lookuptypeId: '67f62cbc17f0ecf3dbf79f5a', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    LookupType: { lookuptype: '', code: '', DisplayName: '', userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Lookup: { lookuptypeId: '', DisplayName: '', lookupname: '', code: '', Parentlookupid: '', userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Gender: { lookuptypeId: '67f58a2d17f0ecf3dbf79cfe', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Title: { lookuptypeId: '67f57de817f0ecf3dbf79cc2', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    SpokenLanguages: { lookuptypeId: '67f6308417f0ecf3dbf79fa3', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    MaritalStatus: { lookuptypeId: '67f590d017f0ecf3dbf79d57', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    ProjectTypes: { lookuptypeId: '67f6319a17f0ecf3dbf79fbc', DisplayName: '', lookupname: '', code: '', Parentlookupid: '674a195dcc0986f64ca36fc2', userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Trainings: { lookuptypeId: '67f6329f17f0ecf3dbf79fd3', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Ranks: { lookuptypeId: '67f6344d17f0ecf3dbf79fff', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Provinces: { lookuptypeId: '67f5945517f0ecf3dbf79db4', DisplayName: '', code: '', lookupname: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    Duties: { lookuptypeId: '67f6351b17f0ecf3dbf7a018', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    RosterType: { lookuptypeId: '67f652cf17f0ecf3dbf7a048', DisplayName: '', lookupname: '', code: '', Parentlookupid: null, userid: "67f3f9d812b014a0a7a94081", isactive: true, isDeleted: false },
    ContactType: { ContactType: "", DisplayName: "", isDeleted: false, isactive: true },
  };

  const [drawerIpnuts, setdrawerIpnuts] = useState(drawerInputsInitalValues)
  const drawrInptChng = (drawer, field, value) => {
    setdrawerIpnuts((prevState) => {
      // Check if the field is nested inside ContactAddress
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        return {
          ...prevState,
          [drawer]: {
            ...prevState[drawer],
            [parent]: {
              ...prevState[drawer][parent], // Preserve existing values
              [child]: value, // Update only the specific nested field
            },
          },
        };
      } else {
        return {
          ...prevState,
          [drawer]: {
            ...prevState[drawer],
            [field]: value, // Update top-level field
          },
        };
      }
    });

  };

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

  const resetCounteries = (drawer, callback) => {
    setdrawerIpnuts((prevState) => ({
      ...prevState,
      [drawer]: drawerInputsInitalValues[drawer],
    }));
    if (callback & typeof callback === 'function') {
      callback()
    }
  };

  const openCloseDrawerFtn = (name) => {
    setDrawerOpen((prevState) => {
      const wasOpen = prevState[name]; // Check if it was open before
      const newState = {
        ...prevState,
        [name]: !prevState[name],
      };
      if (wasOpen) {
        disableFtn(true); // Execute only when closing
      }
      return newState;
    });
    setErrors({});
  };


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
      if (!prev?.[drawer]) return prev; // Ensure the key exists in state

      return {
        ...prev,
        [drawer]: {
          ...prev[drawer],
          id: idValue,
        },
      };
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
  const columnsSolicitors = [
    {
      title: "Surname",
      dataIndex: "Surname",
      key: "Surname",
    },
    {
      title: "Forename",
      dataIndex: "Forename",
      key: "Forename",
    },
    {
      title: "Phone",
      dataIndex: "ContactPhone",
      key: "ContactPhone",
    },
    {
      title: "Email",
      dataIndex: "ContactEmail",
      key: "ContactEmail",
    },
    {
      title: "Building/House",
      dataIndex: ["ContactAddress", "BuildingOrHouse"],
      key: "BuildingOrHouse",
    },
    {
      title: "Street/Road",
      dataIndex: ["ContactAddress", "StreetOrRoad"],
      key: "StreetOrRoad",
    },
    {
      title: "Area/Town",
      dataIndex: ["ContactAddress", "AreaOrTown"],
      key: "AreaOrTown",
    },
    {
      title: "City/Postcode",
      dataIndex: ["ContactAddress", "CityCountyOrPostCode"],
      key: "CityCountyOrPostCode",
    },
    {
      title: "Eircode",
      dataIndex: ["ContactAddress", "Eircode"],
      key: "Eircode",
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
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Solicitors', !isUpdateRec?.Solicitors, record)
            addIdKeyToLookup(record?._id, "Solicitors")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/contact`, record?._id,);
                dispatch(getContacts())
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnProvince = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Province',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
        <Space size="middle">
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
                dispatch(getAllLookups())
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
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'County',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Province',
      render: (record) => record?.Parentlookup
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}>
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
        <Space size="middle" >
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
                  dispatch(getAllLookups())
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
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Post Code',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
      dataIndex: 'isactive',
      key: 'isactive',
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}>

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
        <Space size="middle" >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnDistricts = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Districts',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Division',
      dataIndex: 'Parentlookup',
      key: 'Parentlookup',
    },
    {
      title: 'Active',

      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}>

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
        <Space size="middle">
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
                  dispatch(getAllLookups())
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
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Work Location',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Branch',
      dataIndex: 'Parentlookup',
      key: 'Parentlookup',
    },
    {
      title: 'Active',
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}>
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Station', !isUpdateRec?.Station, record)
              addIdKeyToLookup(record?._id, "Station")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(getAllLookups())
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
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Division',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'County',
      dataIndex: 'Parentlookup',
      key: 'Parentlookup',
    },
    {
      title: 'Active',
      dataIndex: 'Active',
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}>

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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Divisions', !isUpdateRec?.Divisions, record)
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
                  dispatch(getAllLookups())
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
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'City',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      render: (record) => <Checkbox disabled={isDisable} checked={record?.isactive} ></Checkbox>
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn('Cities', !isUpdateRec?.Cities, record)
              addIdKeyToLookup(record?._id, "Cities")
            }}
          />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/lookup`, record?._id,);
                  dispatch(getAllLookups())
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
      dataIndex: 'Code',
      key: 'Code',
    },
    {
      title: 'Contact Type',
      dataIndex: 'ContactType',
      key: 'ContactType',
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isActive}>

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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('ContactType', !IsUpdateFtn?.ContactType, record)
            addIdKeyToLookup(record?._id, "ContactType")
          }} />
          <AiFillDelete size={16}
            onClick={() => {
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do You Want To Delete This Item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/contacttype`, record?._id,);
                  dispatch(getContactTypes())
                },
              })
            }}
          />
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
      title: 'Name',
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
        <Checkbox disabled={isDisable} checked={record?.isactive}>

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
        <Space size="middle">
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
        <Checkbox disabled={isDisable} checked={record?.isactive}>

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
        <Space size="middle">
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
      title: "Lookup Type",
      dataIndex: ["lookuptypeId", "lookuptype"],  // Ensure correct path
      key: "lookuptype",
      render: (_, record) => <div>{record?.lookuptypeId?.lookuptype || "N/A"}</div>,

      // Filters must be unique and properly extracted
      filters: Array.from(
        new Set(
          lookups?.map((item) => item?.lookuptypeId?.lookuptype).filter(Boolean)
        )
      ).map((value) => ({ text: value, value })),

      // Filtering logic
      onFilter: (value, record) => {
        // console.log("Filtering for:", value, "against", record?.lookuptypeId?.lookuptype);
        return String(record?.lookuptypeId?.lookuptype) === String(value);
      },
    }
    ,
    {
      title: ' Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}>
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
        <Space size="middle">
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
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
  const columnRanks = [
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Ranks', !IsUpdateFtn?.Ranks, record)
            addIdKeyToLookup(record?._id, "Ranks")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Ranks')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const SLColumns = [
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('SpokenLanguages', !IsUpdateFtn?.SpokenLanguages, record)
            addIdKeyToLookup(record?._id, "SpokenLanguages")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('SpokenLanguages')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const ProjectTypesColumns = [
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('ProjectTypes', !IsUpdateFtn?.ProjectTypes, record)
            addIdKeyToLookup(record?._id, "ProjectTypes")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('ProjectTypes')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnTrainings = [
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Trainings', !IsUpdateFtn?.Trainings, record)
            addIdKeyToLookup(record?._id, "Trainings")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Trainings')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnBoards = [
    {
      title: 'Code',
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Boards', !IsUpdateFtn?.Boards, record)
            addIdKeyToLookup(record?._id, "Boards")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Boards')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnCouncils = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: ' Lookup Type ',
      dataIndex: 'lookuptype',
      key: 'lookuptype',
      render: (_, record) => record?.lookuptypeId?.lookuptype
    },
    {
      title: ' Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Councils',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (_, record) => <Checkbox checked={record?.isactive} />
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Councils', !IsUpdateFtn?.Councils, record)
            addIdKeyToLookup(record?._id, "Councils")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id);
                dispatch(getAllLookups())
                resetCounteries('Councils')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnCorrespondenceType = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Lookup Type',
      dataIndex: 'lookuptype',
      key: 'lookuptype',
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('CorrespondenceType', !IsUpdateFtn?.CorrespondenceType, record);
            addIdKeyToLookup(record?._id, "CorrespondenceType");
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id);
                dispatch(getAllLookups());
                resetCounteries('CorrespondenceType');
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
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
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
                resetCounteries('Title')
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
      // dataIndex: 'lookuptypeId',
      // key: 'lookuptypeId',
      // filters: [
      //   { text: 'A01', value: 'A01' },
      //   { text: 'B02', value: 'B02' },
      //   { text: 'C03', value: 'C03' },
      //   // Add more filter options as needed
      // ],
      // onFilter: (value, record) => record.RegionCode === value,
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Duties', !IsUpdateFtn?.Title, record)
            addIdKeyToLookup(record?._id, "Duties")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id,);
                dispatch(getAllLookups())
                resetCounteries('Duties')
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
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
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
        <Space size="middle">
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
      dataIndex: 'isactive',
      key: 'isactive',
      render: (isactive) => (
        <Checkbox checked={isactive}>Active</Checkbox>
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
        <Space size="middle">
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
  const columnDocumentType = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: ' Lookup Type ',
      dataIndex: 'lookuptype',
      key: 'lookuptype',
      render: (_, record) => record?.lookuptypeId?.lookuptype
    },
    {
      title: ' Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (_, record) => <Checkbox checked={record?.isactive} />
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('DocumentType', !IsUpdateFtn?.DocumentType, record)
            addIdKeyToLookup(record?._id, "DocumentType")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id);
                dispatch(getAllLookups())
                resetCounteries('DocumentType')
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const columnReasons = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: ' Lookup Type ',
      dataIndex: 'lookuptype',
      key: 'lookuptype',
      render: (_, record) => record?.lookuptypeId?.lookuptype
    },
    {
      title: ' Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Lookup Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (_, record) => <Checkbox checked={record?.isactive} />
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
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Reasons', !IsUpdateFtn?.Reasons, record)
            addIdKeyToLookup(record?._id, "Reasons")
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id);
                dispatch(getAllLookups())
                resetCounteries('Reasons')
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
      title: "Work Location",
      dataIndex: "Station",
      key: "Station",
      verticalAlign: 'center',
      width: 60,
      align: 'center',
      render: (text) => <div style={{ display: 'flex', alignItems: 'center', height: '100%', justifyContent: 'center', verticalAlign: 'center' }}>{text}</div>,
    },

    {
      title: "Branch",
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
  const columnRosterTypes = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Lookup Type',
      dataIndex: 'lookuptype',
      key: 'lookuptype',
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: 'Display Name',
      dataIndex: 'DisplayName',
      key: 'DisplayName',
    },
    {
      title: 'Roster Type Name',
      dataIndex: 'lookupname',
      key: 'lookupname',
    },
    {
      title: 'Active',
      dataIndex: 'isactive',
      key: 'isactive',
      render: (_, record) => <Checkbox checked={record?.isactive} />,
    },
    {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaRegCircleQuestion size={16} style={{ marginRight: '8px' }} />
          Action
        </div>
      ),
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            size={16}
            style={{ marginRight: '10px', cursor: 'pointer' }}
            onClick={() => {
              IsUpdateFtn('RosterType', !IsUpdateFtn?.RosterType, record);
              addIdKeyToLookup(record?._id, 'RosterType');
            }}
          />
          <AiFillDelete
            size={16}
            style={{ cursor: 'pointer' }}
            onClick={() =>
              MyConfirm({
                title: 'Confirm Deletion',
                message: 'Do you want to delete this item?',
                onConfirm: async () => {
                  await deleteFtn(`${baseURL}/Lookup`, record?._id);
                  dispatch(getAllLookups());
                  resetCounteries('RosterType');
                },
              })
            }
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
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      align: "center",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
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
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      align: "center",
      render: (text) => <div>{text}</div>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
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

  const columnSchemes = [
    { title: 'Scheme Name', dataIndex: 'lookupname', key: 'lookupname' },
    { title: 'Code', dataIndex: 'code', key: 'code', sorter: (a, b) => a.code.localeCompare(b.code), sortDirections: ['ascend', 'descend'] },
    { title: 'Active', dataIndex: 'isactive', key: 'isactive', render: (_, record) => <Checkbox checked={record?.isactive} /> },
    {
      title: <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} /> Action
      </div>,
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('Schemes', !IsUpdateFtn?.Schemes, record);
            addIdKeyToLookup(record?._id, "Schemes");
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id);
                dispatch(getAllLookups());
                resetCounteries('Schemes');
              },
            })
          } />
        </Space>
      ),
    },
  ];


  const [selectionType, setSelectionType] = useState('checkbox');
  const [errors, setErrors] = useState({});
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {

    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };
  // const validateForm = (drawerType) => {
  //   let newErrors = { Lookup: {}, [drawerType]: {} };

  //   if (!drawerIpnuts?.[drawerType]?.code) {
  //     newErrors[drawerType].code = "Required";
  //   }
  //   if (!drawerIpnuts?.[drawerType]?.lookupname) {
  //     newErrors[drawerType].lookupname = "Required";
  //   }

  //   // Mandatory ParentLookup for specific drawers
  //   const requiresParentLookup = ["Divisions", "Districts", "Cities", "Counteries", "Station"];
  //   if (requiresParentLookup.includes(drawerType) && (!drawerIpnuts?.[drawerType]?.Parentlookupid || drawerIpnuts?.[drawerType]?.Parentlookupid === null)) {
  //     newErrors[drawerType].parentLookup = "Required";
  //   }
  //   // Set errors only if there are validation failures
  //   setErrors(newErrors);
  //   // Check if there are any errors in the object
  //   return Object.keys(newErrors.Lookup).length === 0 && Object.keys(newErrors[drawerType]).length === 0;
  // };
  const validateForm = (drawerType) => {
    let newErrors = { Lookup: {}, [drawerType]: {} };

    if (!drawerIpnuts?.[drawerType]?.code) {
      newErrors[drawerType].code = true;
    }
    if (!drawerIpnuts?.[drawerType]?.lookupname) {
      newErrors[drawerType].lookupname = true;
    }

    const requiresParentLookup = ["Divisions", "Districts", "Cities", "Counteries", "Station"];
    if (requiresParentLookup.includes(drawerType) && !drawerIpnuts?.[drawerType]?.Parentlookupid) {
      newErrors[drawerType].parentLookup = true;
    }

    setErrors(newErrors);

    // Return true if no errors
    const noErrors = Object.keys(newErrors[drawerType]).length === 0;
    return noErrors;
  };
  const validateSolicitors = (drawerType) => {
    let newErrors = { [drawerType]: {} };

    if (drawerType === "Solicitors") {
      if (!drawerIpnuts?.Solicitors?.Forename) {
        newErrors[drawerType].Forename = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.Surname) {
        newErrors[drawerType].Surname = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactEmail) {
        newErrors[drawerType].ContactEmail = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactPhone) {
        newErrors[drawerType].ContactPhone = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactAddress?.BuildingOrHouse) {
        newErrors[drawerType].BuildingOrHouse = "Required";
      }
      if (!drawerIpnuts?.Solicitors?.ContactAddress?.AreaOrTown) {
        newErrors[drawerType].AreaOrTown = "Required";
      }
    }
    // Set errors only if there are validation failures
    setErrors(newErrors);
    // Check if there are any errors in the object
    return Object.keys(newErrors[drawerType]).length === 0;
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

  }


  const AddpartnershipFtn = () => {

  }

  const AddprofileModalFtn = () => {

  }

  const AddRegionTypeModalFtn = () => {

  }

  const AddContactTypeModalFtn = () => {

  }

  const AddSubscriptionsFtn = () => {

  }
  const columnClaimType = [
    { title: 'Code', dataIndex: 'code', key: 'code', sorter: (a, b) => a.code.localeCompare(b.code), sortDirections: ['ascend', 'descend'] },
    { title: 'Lookup Type', dataIndex: 'lookuptype', key: 'lookuptype', render: (_, record) => record?.lookuptypeId?.lookuptype },
    { title: 'Display Name', dataIndex: 'DisplayName', key: 'DisplayName' },
    { title: 'Name', dataIndex: 'lookupname', key: 'lookupname' },
    { title: 'Active', dataIndex: 'isactive', key: 'isactive', render: (_, record) => <Checkbox checked={record?.isactive} /> },
    {
      title: <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} /> Action
      </div>,
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <FaEdit size={16} style={{ marginRight: "10px" }} onClick={() => {
            IsUpdateFtn('ClaimType', !IsUpdateFtn?.ClaimType, record);
            addIdKeyToLookup(record?._id, "ClaimType");
          }} />
          <AiFillDelete size={16} onClick={() =>
            MyConfirm({
              title: 'Confirm Deletion',
              message: 'Do You Want To Delete This Item?',
              onConfirm: async () => {
                await deleteFtn(`${baseURL}/Lookup`, record?._id);
                dispatch(getAllLookups());
                resetCounteries('ClaimType');
              },
            })
          } />
        </Space>
      ),
    },
  ];
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const handlePageChange = (page, size) => {
    setCurrent(page);
    setPageSize(size);
  };
  const { Search } = Input;
  const sections = [
    {
      title: "Lookups Configuration",
      items: [
        { key: "Title", icon: <Crown size={24} color="#3b82f6" />, label: "Titles" }, // blue-500
        { key: "Gender", icon: <User size={24} color="#ec4899" />, label: "Gender" }, // pink-500
        { key: "MaritalStatus", icon: <Heart size={24} color="#a78bfa" />, label: "Marital Status" }, // purple-400
        { key: "Provinces", icon: <Map size={24} color="#22c55e" />, label: "Provinces" }, // green-500
        { key: "Countries", icon: <Globe size={24} color="#ef4444" />, label: "Countries" }, // red-500
        { key: "Divisions", icon: <Building2 size={24} color="#6366f1" />, label: "Divisions" }, // indigo-500
        { key: "Districts", icon: <MapPinned size={24} color="#eab308" />, label: "Districts" }, // yellow-500
        { key: "Cities", icon: <Building2 size={24} color="#10b981" />, label: "Cities" }, // emerald-500
        { key: "Station", icon: <MapPin size={24} color="#f97316" />, label: "Station" }, // orange-500
        { key: "PostCode", icon: <Mail size={24} color="#0ea5e9" />, label: "Post Codes" }, // sky-500
        { key: "Boards", icon: <Layout size={24} color="#14b8a6" />, label: "Boards" }, // teal-500
        { key: "Councils", icon: <Landmark size={24} color="#8b5cf6" />, label: "Councils" }, // violet-500
        { key: "SpokenLanguages", icon: <Languages size={24} color="#f43f5e" />, label: "Spoken Languages" }, // rose-500
        { key: "ProjectTypes", icon: <FolderKanban size={24} color="#f59e0b" />, label: "Project Types" }, // amber-500
        { key: "Trainings", icon: <Lightbulb size={24} color="#84cc16" />, label: "Trainings" }, // lime-500
        { key: "Ranks", icon: <BarChart3 size={24} color="#6b7280" />, label: "Ranks" }, // gray-500
        { key: "Duties", icon: <FileText size={24} color="#60a5fa" />, label: "Duties" }, // blue-400
        { key: "Solicitors", icon: <Gavel size={24} color="#64748b" />, label: "Solicitors" }, // slate-500
        { key: "RosterType", icon: <Calendar size={24} color="#06b6d4" />, label: "Roster Type" }, // cyan-500
        { key: "CorrespondenceType", icon: <MessageSquare size={24} color="#4ade80" />, label: "Correspondence Type" }, // green-400
        { key: "DocumentType", icon: <File size={24} color="#818cf8" />, label: "Document Type" }, // indigo-400
        { key: "ClaimType", icon: <Shield size={24} color="#f472b6" />, label: "Claim Type" }, // pink-400
        { key: "Schemes", icon: <Boxes size={24} color="#facc15" />, label: "Schemes" }, // yellow-400
        { key: "LookupType", icon: <Search size={24} color="#34d399" />, label: "Lookup Type" }, // emerald-400
        { key: "Lookup", icon: <Search size={24} color="#fb7185" />, label: "Lookup" }, // rose-400
        { key: "ContactTypes", icon: <Phone size={24} color="#a855f7" />, label: "Contact Types" }, // purple-500
        { key: "Reasons", icon: <HelpCircle size={24} color="#fb923c" />, label: "Reasons" }, // orange-400
        { key: "Committees", icon: <Users size={24} color="#ec4899" />, label: "Committees" }, // pink-500
      ],
    },
  ];

  return (
    <div className="bg-gray-50 mb-4">
      {/* <div className="text-center mb-4">
        <h1 className="fw-bold mb-1">Configuration</h1>
        <p className="text-muted mb-0">System configuration and lookup management</p>
      </div> */}

      {/* Search Bar */}

      <div className="d-flex flex-column mb-4 pb-4" style={{ height: "100vh", overflow: "hidden" }}>
        <div className="text-center " style={{ flexShrink: 0, marginTop: '-4px' }}>
          <h1 className="fw-bold">Configuration</h1>
          <p className="text-muted mb-0">System configuration and lookup management</p>
          <div className="row justify-content-center">
            <div className="col-md-6 mt-3 mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search lookups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded shadow-sm p-4 flex-grow-1 overflow-auto">
          {sections.map((section, idx) => {
            const filteredItems = section.items.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            );

            return (
              <div key={`${section.title}-${idx}`} className="mb-5">
                {/* <h5 className="fw-semibold mb-4">{section.title}</h5> */}

                {filteredItems.length > 0 ? (
                  <div className="row gx-3 gy-3">
                    {filteredItems.map((item) => (
                      <div key={item.key} className="col-6 col-sm-4 col-md-2 d-flex">
                        <div
                          onClick={() => openCloseDrawerFtn(item.key)}
                          className="d-flex flex-column align-items-center justify-content-center border rounded bg-white p-4 w-100 text-center hover-shadow"
                          style={{ cursor: "pointer" }}
                        >
                          <div className="mb-2">{item.icon}</div>
                          <p className="mb-0 small fw-medium text-dark">{item.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                ) : (
                  <p className="text-muted small mb-0 text-center">No matches for “{searchQuery}”.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>



      <MyDrawer
        open={membershipModal}
        onClose={membershipModalFtn}
        add={addmembershipFtn}
        title="Membership"
      >
        <div className="input-group">
          <p className="inpt-lbl">Short Name</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange3("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange3("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange3("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange3("Beta", e.target.value)}
          />
        </div>
        <Input
          disabled={isDisable}
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
            disabled={isDisable}
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange2("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange2("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange2("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange2("Beta", e.target.value)}
          />
        </div>
        <Input
          disabled={isDisable}
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
          <Input
            disabled={isDisable} placeholder="Please enter dummy field" />
        </div>
        {/* Add more input fields as required */}
        <Input
          disabled={isDisable}
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
            disabled={isDisable}
            placeholder="Please enter short name"
            onChange={(e) => handleInputChange4("ShortName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Display Name</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter display name"
            onChange={(e) => handleInputChange4("DisplayName", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Alpha</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter alpha"
            onChange={(e) => handleInputChange4("Alpha", e.target.value)}
          />
        </div>
        <div className="input-group">
          <p className="inpt-lbl">Beta</p>
          <Input
            disabled={isDisable}
            placeholder="Please enter Beta"
            onChange={(e) => handleInputChange4("Beta", e.target.value)}
          />
        </div>
        <Input
          disabled={isDisable}
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
              disabled={isDisable}
              placeholder="Please enter RegNo"
              onChange={(e) => handleInputChange7("RegNo", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Name</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Name"
              onChange={(e) => handleInputChange7("Name", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Rank</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Rank"
              onChange={(e) => handleInputChange7("Rank", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Duty</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Duty"
              onChange={(e) => handleInputChange7("Duty", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Station</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Station"
              onChange={(e) => handleInputChange7("Station", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">District</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter District"
              onChange={(e) => handleInputChange7("District", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Division</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Division"
              onChange={(e) => handleInputChange7("Division", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Address</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Address"
              onChange={(e) => handleInputChange7("Address", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Status</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Status"
              onChange={(e) => handleInputChange7("Status", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Updated</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Updated"
              onChange={(e) => handleInputChange7("Updated", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Alpha</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Alpha"
              onChange={(e) => handleInputChange7("alpha", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Beta</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Beta"
              onChange={(e) => handleInputChange7("beta", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Giga</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter Giga"
              onChange={(e) => handleInputChange7("giga", e.target.value)}
            />
          </div>
        </MyDrawer>

        <Input
          disabled={isDisable}
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
              disabled={isDisable}
              placeholder="Please enter RegionType"
              onChange={(e) => handleInputChange00("RegionType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter DisplayName"
              onChange={(e) => handleInputChange00("DisplayName", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          disabled={isDisable}
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
              disabled={isDisable}
              placeholder="Please enter ContactType"
              onChange={(e) => handleInputChange01("ContactType", e.target.value)}
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter DisplayName"
              onChange={(e) => handleInputChange01("DisplayName", e.target.value)}
            />
          </div>
        </MyDrawer>



        <Input
          disabled={isDisable}
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

      <MyDrawer
        isPagination={true}
        title="County"
        open={drawerOpen?.Counteries}
        onClose={() => openCloseDrawerFtn('Counteries')}
        isEdit={isUpdateRec?.Counteries}
        add={async () => {
          if (!validateForm('Counteries')) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Counteries,
            'Data inserted successfully:',
            'Data did not insert:',
            () => resetCounteries('Counteries', dispatch(getAllLookups()))
          );
        }}
        update={async () => {
          if (!validateForm('Counteries')) return;
          await updateFtn('/lookup', drawerIpnuts?.Counteries, () =>
            resetCounteries('Counteries', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Counteries', false);
        }}
      >
        <div className="drawer-main-cntainer">
          <CustomSelect
            label="Type:"
            placeholder="County"
            value="County"
            options={[{ label: "County", value: "County" }]}
            isSimple
            disabled
            required
            hasError={!!errors?.Counteries?.type}
          />

          <MyInput
            label="Code:"
            name="code"
            placeholder="Enter code"
            value={drawerIpnuts?.Counteries?.code}
            onChange={(e) => drawrInptChng('Counteries', 'code', e.target.value)}
            required
            hasError={!!errors?.Counteries?.code}
            disabled={isDisable}
          />

          <MyInput
            label="County Name:"
            name="lookupname"
            placeholder="Enter county name"
            value={drawerIpnuts?.Counteries?.lookupname}
            onChange={(e) => drawrInptChng('Counteries', 'lookupname', e.target.value)}
            required
            hasError={!!errors?.Counteries?.lookupname}
            disabled={isDisable}
          />

          <MyInput
            label="Display Name:"
            name="DisplayName"
            placeholder="Enter display name"
            value={drawerIpnuts?.Counteries?.DisplayName}
            onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)}
            disabled={isDisable}
            hasError={!!errors?.Counteries?.DisplayName}
          />

          <CustomSelect
            label="Province:"
            placeholder="Select Province"
            options={[{ label: "Province", value: "Province" }]}
            value={'Province'}
            disabled={isDisable}
            onChange={(e) => drawrInptChng('Counteries', 'Parentlookupid', e)}
            required
            hasError={!!errors?.Counteries?.parentLookup}
          />

          <Checkbox
            checked={drawerIpnuts?.Counteries?.isactive}
            onChange={(e) => drawrInptChng('Counteries', 'isactive', e.target.checked)}
            disabled={isDisable}
          >
            Active
          </Checkbox>

          <div className="mt-4 config-tbl-container">
            <Table
              pagination={{ pageSize: 10 }}
              columns={columnCountry}
              loading={lookupsloading}
              dataSource={data?.county}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? 'odd-row' : 'even-row'
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
        title='Provinces'
        open={drawerOpen?.Provinces}
        isPagination={true}
        onClose={() => openCloseDrawerFtn('Provinces')}
        add={() => {
          if (!validateForm("Provinces")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Provinces,
            'Data inserted successfully:',
            'Data did not insert:',
            () => resetCounteries('Provinces', dispatch(getAllLookups()))
          );
        }}
        isEdit={isUpdateRec?.Provinces}
        update={async () => {
          if (!validateForm('Provinces')) return;
          await updateFtn(
            '/lookup',
            drawerIpnuts?.Provinces,
            () => resetCounteries('Provinces', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Provinces', false);
        }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            {/* Lookup Type */}
            <CustomSelect
              label="Type:"
              placeholder="Province"
              value={'Province'}
              options={[{ label: "Province", value: 'Province' }]}
              isSimple={true}
              disabled={true}
              required
              hasError={!!errors?.lookuptypeId}
            />

            {/* Code Field */}
            <MyInput
              label="Code:"
              name="code"
              value={drawerIpnuts?.Provinces?.code}
              onChange={(e) => drawrInptChng('Provinces', 'code', e.target.value)}
              placeholder="Enter code"
              disabled={isDisable}
              required
              hasError={!!errors?.Provinces?.code}
            />

            {/* Province Field */}
            <MyInput
              label="Province:"
              name="lookupname"
              value={drawerIpnuts?.Provinces?.lookupname}
              onChange={(e) => drawrInptChng('Provinces', 'lookupname', e.target.value)}
              placeholder="Enter province"
              disabled={isDisable}
              required
              hasError={!!errors?.Provinces?.lookupname}
            />

            {/* Display Name Field */}
            <MyInput
              label="Display Name:"
              name="DisplayName"
              value={drawerIpnuts?.Provinces?.DisplayName}
              onChange={(e) => drawrInptChng('Provinces', 'DisplayName', e.target.value)}
              placeholder="Enter display name"
              disabled={isDisable}
            />

            {/* Active Checkbox */}
            <Checkbox
              disabled={isDisable}
              onChange={(e) => drawrInptChng('Provinces', 'isactive', e.target.checked)}
              checked={drawerIpnuts?.Provinces?.isactive}
              style={{ marginTop: '16px' }}
            >
              Active
            </Checkbox>
          </div>

          {/* Table */}
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnProvince}
              loading={lookupsloading}
              dataSource={data?.Provinces}
              className="drawer-tbl"
              rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
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
        title='City'
        open={drawerOpen?.Cities}
        isPagination={true}
        isEdit={isUpdateRec?.Cities}
        onClose={() => openCloseDrawerFtn('Cities')} add={() => {
          if (!validateForm('Cities')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Cities,
            'Data inserted successfully:', 'Data did not insert:', () => {
              resetCounteries('Cities')
              dispatch(getAllLookups())
            }
          )
          dispatch(getAllLookups())
        }}
        update={async () => {
          if (!validateForm('Cities')) return;
          await updateFtn('/lookup', drawerIpnuts?.Cities, () =>
            resetCounteries('Cities', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Cities', false);
        }}
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
                  <MySelect placeholder='City' isSimple={true} disabled={true} />
                  <p className="error text-white"></p>
                </div>
              </div>
            </div>


            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp" onChange={(e) => drawrInptChng('Cities', 'code', e.target.value)}
                    value={drawerIpnuts?.Cities?.code} />
                  <h1 className="error-text">{errors?.Cities?.code}</h1>
                </div>
                {/* <p className="error"></p> */}
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>City Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => {

                      drawrInptChng('Cities', 'lookupname', e.target.value)
                    }} value={drawerIpnuts?.Cities?.lookupname} />
                  <p className="error">{errors?.Cities?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Cities', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Cities?.DisplayName} />
                </div>
                {/* <p className="error">{errors?.Cities?.}</p> */}
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County'
                    onChange={(e) => drawrInptChng('Cities', 'Parentlookupid', e)}
                    isSimple={true} options={selectLokups?.Counteries}
                    disabled={isDisable}
                    value={drawerIpnuts?.Cities?.Parentlookupid}
                  />
                  <p className="error">{errors?.Cities?.Parentlookupid}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable} checked={drawerIpnuts?.Cities?.isactive} onChange={(e) => drawrInptChng('Cities', 'isactive', e.target.checked)}>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnCity}
              loading={lookupsloading}
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
      <MyDrawer title='Post Code'
        open={drawerOpen?.PostCode} isPagination={true}
        onClose={() => openCloseDrawerFtn('PostCode')}
        add={() => {
          if (!validateForm("PostCode")) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.PostCode, 'Data inserted successfully:', 'Data did not insert:', resetCounteries('PostCode'))
        }}>
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
                  <p className="error text-white">text</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp" onChange={(e) => drawrInptChng('Counteries', 'RegionCode', e.target.value)} value={drawerIpnuts?.Counteries?.RegionCode} />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Post Code
                </p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  {/* <MySelect placeholder='Select County' isSimple={true} /> */}
                  <Input
                    disabled={isDisable} className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
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
                    disabled={isDisable} className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} />
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
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable} checked={drawerIpnuts?.PostCode?.isactive} onChange={(e) => drawrInptChng(e.target.checked)}>Active</Checkbox>
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
            />
          </div>
        </div>
      </MyDrawer>
      <MyDrawer
        title='Districts'
        open={drawerOpen?.Districts}
        isPagination={true}
        onClose={() => openCloseDrawerFtn('Districts')}
        isEdit={isUpdateRec?.Districts}
        isContact={true}
        update={async () => {
          if (!validateForm('Districts')) return;
          await updateFtn('/lookup', drawerIpnuts?.Districts, () =>
            resetCounteries('Districts', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Districts', false);
        }}
        add={() => {
          if (!validateForm('Districts')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Districts, 'Data inserted successfully:', 'Data did not insert:',
            () => {
              resetCounteries('Districts')
              dispatch(getAllLookups())
            })
        }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            <CustomSelect
              label="Type:"
              placeholder="Districts"
              isSimple={true}
              disabled={true}
              required
            />
            <MyInput
              label="Code:"
              name="code"
              placeholder="Enter code"
              value={drawerIpnuts?.Districts?.code}
              onChange={(e) => drawrInptChng('Districts', 'code', e.target.value)}
              required
              hasError={!!errors?.Districts?.code}
              // errorMessage={errors?.Districts?.code}
              disabled={isDisable}
            />
            <MyInput
              label="District:"
              name="lookupname"
              placeholder="Enter district name"
              value={drawerIpnuts?.Districts?.lookupname}
              onChange={(e) => drawrInptChng('Districts', 'lookupname', e.target.value)}
              required
              hasError={!!errors?.Districts?.lookupname}
              // errorMessage={errors?.Districts?.lookupname}
              disabled={isDisable}
            />

            <MyInput
              label="Display Name:"
              name="DisplayName"
              placeholder="Enter display name"
              value={drawerIpnuts?.Districts?.DisplayName}
              onChange={(e) => drawrInptChng('Districts', 'DisplayName', e.target.value)}
              disabled={isDisable}
              hasError={!!errors?.Districts?.lookupname}
            />


            <div className="d-flex p-0 m-0" >
              <div className="me-2 " style={{ width: '95%' }} >
                <CustomSelect
                  label="Division:"
                  placeholder="Select Division"
                  isSimple={true}
                  disabled={isDisable}
                  options={selectLokups?.Divisions}
                  // value="Division"
                  isMarginBtm={false}
                  hasError={!!errors?.Districts?.lookupname}
                  required
                />
              </div>

              <div className="d-flex align-items-end my-input-container">
                <Button
                  style={{ height: '40px' }}
                  className="butn primary-btn detail-btn "
                  onClick={() => openCloseDrawerFtn('DivisionsForDistrict')}
                >
                  +
                </Button>
              </div>
            </div>

            <Checkbox
              disabled={isDisable}
              checked={drawerIpnuts?.Districts?.isactive}
              onChange={(e) => drawrInptChng('Districts', 'isactive', e.target.checked)}
            >
              Active
            </Checkbox>


          </div>

          <div className="mt-4 config-tbl-container">
            <Table
              columns={columnDistricts}
              loading={lookupsloading}
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
            />
          </div>
        </div>

        {/* Nested Divisions Drawer */}
        <MyDrawer
          title='Divisions'
          open={drawerOpen?.DivisionsForDistrict}
          isPagination={true}
          isContact={true}
          onClose={() => openCloseDrawerFtn('DivisionsForDistrict')}
          add={() => {
            if (!validateForm('Divisions')) return;
            insertDataFtn(`/lookup`, drawerIpnuts?.Divisions, 'Data inserted successfully:', 'Data did not insert:', () => {
              resetCounteries('Divisions')
              dispatch(getAllLookups())
            })
          }}
          update={async () => {
            if (!validateForm('Divisions')) return;
            await updateFtn('/lookup', drawerIpnuts?.Divisions, () =>
              resetCounteries('Divisions', () => dispatch(getAllLookups()))
            );
            dispatch(getAllLookups());
            IsUpdateFtn('Divisions', false);
          }}
          isEdit={isUpdateRec?.Divisions}
        >
          <div className="drawer-main-cntainer">
            <div className="mb-4 pb-4">
              <CustomSelect
                label="Type:"
                placeholder="Divisions"
                isSimple={true}
                disabled={true}
                required
              />

              <MyInput
                label="Code:"
                name="code"
                placeholder="Enter code"
                value={drawerIpnuts?.Divisions?.code}
                onChange={(e) => drawrInptChng('Divisions', 'code', e.target.value)}
                required
                hasError={!!errors?.Divisions?.code}
                errorMessage={errors?.Divisions?.code}
                disabled={isDisable}
              />

              <MyInput
                label="Division:"
                name="lookupname"
                placeholder="Enter division name"
                value={drawerIpnuts?.Divisions?.lookupname}
                onChange={(e) => drawrInptChng('Divisions', 'lookupname', e.target.value)}
                required
                hasError={!!errors?.Divisions?.lookupname}
                errorMessage={errors?.Divisions?.lookupname}
                disabled={isDisable}
              />

              <MyInput
                label="Display Name:"
                name="DisplayName"
                placeholder="Enter display name"
                value={drawerIpnuts?.Divisions?.DisplayName}
                onChange={(e) => drawrInptChng('Divisions', 'DisplayName', e.target.value)}
                disabled={isDisable}
              />

              <CustomSelect
                label="County:"
                placeholder="Select County"
                options={selectLokups?.Counteries}
                onChange={(e) => drawrInptChng('Divisions', 'Parentlookupid', e)}
                value={drawerIpnuts?.Divisions?.Parentlookupid}
                required
                hasError={!!errors?.Divisions?.parentLookup}
                errorMessage={errors?.Divisions?.parentLookup}
                disabled={isDisable}
              />

              <div className="drawer-inpts-container">
                <div className="drawer-lbl-container">
                  <p></p>
                </div>
                <div className="inpt-con">
                  <p className="star-white">*</p>
                  <div className="inpt-sub-con">
                    <Checkbox
                      disabled={isDisable}
                      checked={drawerIpnuts?.Divisions?.isactive}
                      onChange={(e) => drawrInptChng('Divisions', 'isactive', e.target.checked)}
                    >
                      Active
                    </Checkbox>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 config-tbl-container">
              <Table
                pagination={{ pageSize: 10 }}
                columns={columnDivisions}
                dataSource={data?.Divisions}
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
      </MyDrawer>
      <MyDrawer
        title="Divisions"
        open={drawerOpen?.Divisions}
        isPagination={true}
        isContact={true}
        onClose={() => openCloseDrawerFtn('Divisions')}
        isEdit={isUpdateRec?.Divisions}
        add={() => {
          if (!validateForm('Divisions')) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Divisions,
            'Data inserted successfully:',
            'Data did not insert:',
            () => {
              resetCounteries('Divisions');
              dispatch(getAllLookups());
            }
          );
        }}
        update={async () => {
          if (!validateForm('Divisions')) return;
          await updateFtn('/lookup', drawerIpnuts?.Divisions, () =>
            resetCounteries('Divisions', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Divisions', false);
        }}
      >
        <div className="drawer-main-cntainer">
          <CustomSelect
            label="Type"
            required
            placeholder="Divisions"
            isSimple
            disabled
            hasError={!!errors?.Divisions?.type}
          />

          <MyInput
            label="Code"
            required
            value={drawerIpnuts?.Divisions?.code}
            onChange={(e) => drawrInptChng('Divisions', 'code', e.target.value)}
            disabled={isDisable}
            hasError={!!errors?.Divisions?.code}
          />

          <MyInput
            label="Division"
            required
            value={drawerIpnuts?.Divisions?.lookupname}
            onChange={(e) => drawrInptChng('Divisions', 'lookupname', e.target.value)}
            disabled={isDisable}
            hasError={!!errors?.Divisions?.lookupname}
          />

          <MyInput
            label="Display Name"
            value={drawerIpnuts?.Divisions?.DisplayName}
            onChange={(e) => drawrInptChng('Divisions', 'DisplayName', e.target.value)}
            disabled={isDisable}
            hasError={!!errors?.Divisions?.DisplayName}
          />

          <CustomSelect
            label="County"
            required
            placeholder="Select County"
            isSimple
            options={selectLokups?.Counteries}
            value={drawerIpnuts?.Divisions?.Parentlookupid}
            onChange={(e) => drawrInptChng('Divisions', 'Parentlookupid', e)}
            hasError={!!errors?.Divisions?.parentLookup}
          />

          <Checkbox
            disabled={isDisable}
            checked={drawerIpnuts?.Divisions?.isactive}
            onChange={(e) => drawrInptChng('Divisions', 'isactive', e.target.checked)}
          >
            Active
          </Checkbox>

          <div className="mt-4 config-tbl-container">
            <Table
              pagination={{ pageSize: 10 }}
              columns={columnDivisions}
              dataSource={data?.Divisions}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? 'odd-row' : 'even-row'
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
        title="Work Location"
        isContact={true}
        open={drawerOpen?.Station}
        isPagination={true}
        onClose={() => openCloseDrawerFtn('Station')}
        add={() => {
          if (!validateForm('Station')) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Station,
            'Data inserted successfully:',
            'Data did not insert:',
            () => {
              resetCounteries('Station', () => dispatch(getAllLookups()));
            }
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Station}
        update={async () => {
          if (!validateForm('Station')) return;
          await updateFtn('/lookup', drawerIpnuts?.Station, () =>
            resetCounteries('Station', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Station', false);
        }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">

            <CustomSelect
              label="Type"
              name="type"
              placeholder="Work Location"
              disabled={true}
              required
            />

            <MyInput
              label="Code"
              name="code"
              value={drawerIpnuts?.Station?.code}
              onChange={(val) => drawrInptChng('Station', 'code', val)}
              disabled={isDisable}
              hasError={!!errors?.Station?.code}
              errorMessage={errors?.Station?.code}
              required
            />

            <MyInput
              label="Work Location Name"
              name="lookupname"
              value={drawerIpnuts?.Station?.lookupname}
              onChange={(val) => drawrInptChng('Station', 'lookupname', val)}
              disabled={isDisable}
              hasError={!!errors?.Station?.lookupname}
              errorMessage={errors?.Station?.lookupname}
              required
            />

            <MyInput
              label="Display Name"
              name="DisplayName"
              value={drawerIpnuts?.Station?.DisplayName}
              onChange={(val) => drawrInptChng('Station', 'DisplayName', val)}
              disabled={isDisable}
              hasError={false}
              errorMessage={"text"} // Replace if dynamic
            />
            <div className="d-flex">
              <div style={{ flex: 1 }}>
                <CustomSelect
                  label="Branch"
                  name="Parentlookupid"
                  placeholder="Select Branch"
                  options={selectLokups?.Districts}
                  value={drawerIpnuts?.Station?.Parentlookupid}
                  onChange={(val) => drawrInptChng('Station', 'Parentlookupid', val)}
                  disabled={isDisable}
                  hasError={!!errors?.Station?.Parentlookupid}
                  errorMessage={errors?.Station?.Parentlookupid}
                  required
                />
              </div>

              <div className="ms-2 d-flex align-items-end pb-1">
                <Button
                  className="butn primary-btn detail-btn"
                  onClick={() => openCloseDrawerFtn('DivisionsForStation')}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="inpt-sub-con">
              <Checkbox
                disabled={isDisable}
                checked={drawerIpnuts?.Station?.isactive}
                onChange={(e) =>
                  drawrInptChng('Station', 'isactive', e.target.checked)
                }
              >
                Active
              </Checkbox>
            </div>

          </div>
          <div class="d-flex">
            <div class="ms-auto">
              <Button onClick={() => navigate("/Popout", { state: { search: 'Work Location' } })}>
                <FaArrowUpRightFromSquare />
              </Button>

            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnStations}
              dataSource={data?.Stations}
              className="drawer-tbl"
              loading={lookupsloading}
              rowClassName={(record, index) =>
                index % 2 !== 0 ? 'odd-row' : 'even-row'
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

      <MyDrawer title='Contact Types' open={drawerOpen?.ContactTypes} isPagination={true} onClose={() => openCloseDrawerFtn('ContactTypes')} add={() => {
        insertDataFtn(`/contacttype`, drawerIpnuts?.ContactType, 'Data inserted successfully:',
          'Data did not insert:', () => {
            resetCounteries('ContactTypes')
            dispatch(getContactTypes())
          })
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
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('ContactType', 'RegionCode', e.target.value)}
                    value={drawerIpnuts?.Counteries?.RegionCode} />
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

                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('ContactType', 'ContactType', e.target.value)}
                    value={drawerIpnuts?.ContactType?.ContactType}
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('ContactType', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.ContactType?.DisplayName} />
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
                  <Checkbox disabled={isDisable} checked={drawerIpnuts?.ContactType?.isActive}>Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={contactType}
              dataSource={contactTypes}
              loading={contactTypesloading}
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
              ...drawerIpnuts?.LookupType, "userid": "67f3f9d812b014a0a7a94081",
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
                  <Input
                    disabled={isDisable} className="inp"
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
                    disabled={isDisable}
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
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
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
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('LookupType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.LookupType?.isactive}
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
              scroll={{ y: 270 }}
              loading={lookupsTypesloading}
            />;
          </div>
          {/* test */}
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
              ...drawerIpnuts?.RegionType, "userid": "67f3f9d812b014a0a7a94081",
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
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(value) => drawrInptChng('RegionType', 'code', value.target.value)}
                    value={drawerIpnuts?.RegionType?.code}
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
                    disabled={isDisable}
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
                    disabled={isDisable}
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
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('RegionType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.RegionType?.isactive}
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
        total={lookups?.length}
        onChange={handlePageChange} pageSize={pageSize}
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
                      drawrInptChng('Lookup', 'Parentlookupid', String(value))
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
                    disabled={isDisable}
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
                  <Input
                    disabled={isDisable} className="inp"
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
                  <Input
                    disabled={isDisable} className="inp" onChange={(e) => drawrInptChng('Lookup', 'DisplayName', e.target.value)} value={drawerIpnuts?.Lookup?.DisplayName} />
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
                  <Input
                    disabled={isDisable} className="inp"

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
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('LookupType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.LookupType?.isactive}
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
              dataSource={lookups.slice((current - 1) * pageSize, current * pageSize)}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              scroll={{ y: 270 }}
              bordered
            />
          </div>
        </div>
      </MyDrawer>
      <MyDrawer
        title="Gender"
        open={drawerOpen?.Gender}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Gender");
          IsUpdateFtn("Gender", false);
        }}
        add={async () => {
          if (!validateForm("Gender")) return; // validation call
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Gender,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Gender", () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Gender}
        update={async () => {
          if (!validateForm("Gender")) return; // validation call
          await updateFtn(
            "/lookup",
            drawerIpnuts?.Gender,
            () => resetCounteries("Gender", () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Gender", false);
        }}
      >
        <div className="drawer-main-cntainer">
          <CustomSelect
            label="Lookup Type"
            placeholder="Gender"
            value={'Gender'}
            options={[{ label: "Gender", value: 'Gender' }]}
            disabled={true}
            isSimple={true}
            // value={drawerIpnuts?.Gender?.lookuptype}
            onChange={(val) => drawrInptChng("Gender", "lookuptype", val)}
            error={!!errors?.Gender?.lookuptype} // validation error display
            required
          />

          <MyInput
            label="Code"
            required
            disabled={isDisable}
            value={drawerIpnuts?.Gender?.code}
            onChange={(e) => drawrInptChng("Gender", "code", e.target.value)}
            error={errors?.Gender?.code} // validation error display
          />

          <MyInput
            label="Gender Name"
            required
            disabled={isDisable}
            value={drawerIpnuts?.Gender?.lookupname}
            onChange={(e) => drawrInptChng("Gender", "lookupname", e.target.value)}
            error={errors?.Gender?.lookupname} // validation error display
          />

          <MyInput
            label="Display Name"
            disabled={isDisable}
            value={drawerIpnuts?.Gender?.DisplayName}
            onChange={(e) => drawrInptChng("Gender", "DisplayName", e.target.value)}
            error={errors?.Gender?.DisplayName} // validation error display if any
            required={false}
          />

          <Checkbox
            disabled={isDisable}
            onChange={(e) => drawrInptChng("Gender", "isactive", e.target.checked)}
            checked={drawerIpnuts?.Gender?.isactive}
          >
            Active
          </Checkbox>

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
          if (!validateForm('Title')) return; // Stop execution if validation fails
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Title,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Title', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Title}
        update={async () => {
          if (!validateForm('Title')) return; // Stop execution if validation fails
          await updateFtn('/lookup', drawerIpnuts?.Title, () =>
            resetCounteries('Title', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Title', false);
        }}
      >
        <div className="drawer-main-cntainer">
          <CustomSelect
            label="Lookup Type"
            name="lookuptypeId"
            value={'Title'}
            options={[{ label: "Title", value: 'Title' }]}
            required={true}
            disabled={true}
            onChange={(e) => drawrInptChng('Lookup', 'lookuptypeId', e.target.value)}
            hasError={!!errors?.Title?.lookuptypeId}
          />
          <MyInput
            label="Code"
            name="code"
            value={drawerIpnuts?.Title?.code || ''}
            required={true}
            disabled={isDisable}
            options={[{ label: "Title", value: 'Title' }]}
            onChange={(e) => drawrInptChng('Title', 'code', e.target.value)}
            hasError={!!errors?.Title?.code}
          // errorMessage={errors?.Title?.code}
          />

          <MyInput
            label="Title Name"
            name="lookupname"
            value={drawerIpnuts?.Title?.lookupname || ''}
            required={true}
            disabled={isDisable}
            onChange={(e) => drawrInptChng('Title', 'lookupname', e.target.value)}
            hasError={!!errors?.Title?.lookupname}
          // errorMessage={errors?.Title?.lookupname}
          />

          <MyInput
            label="Display Name"
            name="DisplayName"
            value={drawerIpnuts?.Title?.DisplayName || ''}
            required={false}
            disabled={isDisable}
            onChange={(e) => drawrInptChng('Title', 'DisplayName', e.target.value)}
            hasError={!!errors?.Title?.DisplayName}
          // errorMessage={errors?.Title?.DisplayName}
          />

          <Checkbox
            disabled={isDisable}
            onChange={(e) => drawrInptChng('Title', 'isactive', e.target.checked)}
            checked={drawerIpnuts?.Title?.isactive}
          >
            Active
          </Checkbox>

          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columntTitles}
              dataSource={data?.Titles}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) => (index % 2 !== 0 ? 'odd-row' : 'even-row')}
              rowSelection={{
                type: selectionType,
                ...rowSelection,
              }}
              bordered
            />
          </div>
        </div>

      </MyDrawer>
      <MyDrawer title='Roster Type' open={drawerOpen?.RosterType} isPagination={true} onClose={() => {
        openCloseDrawerFtn('RosterType');
        IsUpdateFtn('RosterType', false);
      }}
        add={() => {
          if (!validateForm('RosterType')) return; // Stop execution if validation fails
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.RosterType,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('RosterType', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.RosterType}
        update={async () => {
          if (!validateForm('RosterType')) return; // Stop execution if validation fails
          await updateFtn('/lookup', drawerIpnuts?.RosterType, () =>
            resetCounteries('RosterType', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('RosterType', false);
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
                  <MySelect isSimple={true} placeholder='Roster Type'
                    disabled={true}
                    options={lookupsType} onChange={(value) => {
                      drawrInptChng('RosterType', 'lookuptypeId', String(value));
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('RosterType', 'code', e.target.value)}
                    value={drawerIpnuts?.RosterType?.code}
                  />
                  <p className="error">{errors?.RosterType?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Roster Type Name</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con d-flex flex-column">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('RosterType', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.RosterType?.lookupname}
                  />
                  <p className="error">{errors?.RosterType?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('RosterType', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.RosterType?.DisplayName} />
                  <p className="error"></p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('RosterType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.RosterType?.isactive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnRosterTypes}
              dataSource={data?.RosterType}
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
        title='Marital Status'
        open={drawerOpen?.MaritalStatus}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn('MaritalStatus')
          IsUpdateFtn('MaritalStatus', false)
        }}
        add={async () => {
          if (!validateForm('MaritalStatus')) return;
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.Title,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups()))
          );
        }}
        isEdit={isUpdateRec?.MaritalStatus}
        update={async () => {
          if (!validateForm('MaritalStatus')) return;
          await updateFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.MaritalStatus,
            () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups()))
          );
          IsUpdateFtn('MaritalStatus', false);
        }}
      >
        <div className="drawer-main-cntainer">

          {/* Lookup Type - Keeping your existing MySelect since it's already custom */}

          <CustomSelect
            label="Lookup Type:"
            isSimple={true}
            placeholder='MaritalStatus'
            disabled={true}
            // options={lookupsType}
            value={'Marital Status'}
            options={[{ label: "Marital Status", value: 'Marital Status' }]}
            onChange={(value) => drawrInptChng('Lookup', 'lookuptypeId', String(value))}
            required
          />
        </div>

        {/* Code Field */}
        <MyInput
          label="Code:"
          name="code"
          value={drawerIpnuts?.MaritalStatus?.code}
          onChange={(e) => drawrInptChng('MaritalStatus', 'code', e.target.value)}
          placeholder="Enter code"
          disabled={isDisable}
          hasError={!!errors?.MaritalStatus?.code}
          // errorMessage={errors?.MaritalStatus?.code}
          required
        />

        {/* Marital Status Field */}
        <MyInput
          label="Marital Status:"
          name="lookupname"
          value={drawerIpnuts?.MaritalStatus?.lookupname}
          onChange={(e) => drawrInptChng('MaritalStatus', 'lookupname', e.target.value)}
          placeholder="Enter marital status"
          disabled={isDisable}
          hasError={!!errors?.MaritalStatus?.lookupname}
          // errorMessage={errors?.MaritalStatus?.lookupname}
          required
        />

        {/* Display Name Field */}
        <MyInput
          label="Display Name:"
          name="DisplayName"
          value={drawerIpnuts?.MaritalStatus?.DisplayName}
          onChange={(e) => drawrInptChng('MaritalStatus', 'DisplayName', e.target.value)}
          placeholder="Enter display name"
          disabled={isDisable}
        // errorMessage={errors?.MaritalStatus?.lookupname}
        />

        {/* Active Checkbox - Keeping as is since it's not an input field */}

        <Checkbox
          disabled={isDisable}
          onChange={(e) => drawrInptChng('Title', 'isactive', e.target.checked)}
          checked={drawerIpnuts?.MaritalStatus?.isactive}
        >
          Active
        </Checkbox>

        {/* Table - Remains unchanged */}
        <div className="mt-4 config-tbl-container">
          <Table
            pagination={false}
            columns={columnGender}
            dataSource={data?.gender}
            loading={lookupsloading}
            className="drawer-tbl"
            rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
            rowSelection={{
              type: selectionType,
              ...rowSelection,
            }}
            bordered
          />
        </div>

      </MyDrawer>
      <MyDrawer title='Project Types' open={drawerOpen?.ProjectTypes} isPagination={true} onClose={() => {
        openCloseDrawerFtn('ProjectTypes')
        IsUpdateFtn('ProjectTypes', false,)
      }}
        add={async () => {
          if (!validateForm("ProjectTypes")) return;
          await insertDataFtn(
            `/lookup`,
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
            if (!validateForm("ProjectTypes")) return;
            await updateFtn('/lookup', drawerIpnuts?.ProjectTypes,
              () => resetCounteries('ProjectTypes', () => dispatch(getAllLookups())))
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
                      drawrInptChng('Lookup', 'Parentlookupid', String(value))
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('ProjectTypes', 'code', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.code}
                  />
                  <p className="error">{errors?.ProjectTypes?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Project Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('ProjectTypes', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.lookupname}
                  />
                  <p className="error">{errors?.ProjectTypes?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('ProjectTypes', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.ProjectTypes?.DisplayName} />
                </div>
                {/* <p className="error">{errors?.ProjectTypes?.lookupname}</p> */}
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('ProjectTypes', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.ProjectTypes?.isactive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={ProjectTypesColumns}
              dataSource={data?.ProjectTypes}
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
          if (!validateForm('Trainings')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Trainings,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Trainings', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Trainings}
        update={
          async () => {
            if (!validateForm('Trainings')) return;
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
                      drawrInptChng('Lookup', 'Parentlookupid', String(value))
                      drawrInptChng('Lookup', 'Parentlookupid', String(value))
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('Trainings', 'code', e.target.value)}
                    value={drawerIpnuts?.Trainings?.code}
                  />
                  <p className="error"><p className="error">{errors?.Trainings?.code}</p></p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Trainings</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Trainings', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Trainings?.lookupname}
                  />
                  <p className="error"><p className="error">{errors?.Trainings?.lookupname}</p></p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Trainings', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Trainings?.DisplayName} />
                  <p className="error"></p>
                </div>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('Trainings', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Trainings?.isactive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnTrainings}
              dataSource={data?.Trainings}
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
      <MyDrawer title='Document Type' open={drawerOpen?.DocumentType} isPagination={true} onClose={() => {
        openCloseDrawerFtn('DocumentType')
        IsUpdateFtn('DocumentType', false)
      }}
        add={async () => {
          if (!validateForm('DocumentType')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.DocumentType,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('DocumentType', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.DocumentType}
        update={async () => {
          if (!validateForm('DocumentType')) return;
          await updateFtn('/lookup', drawerIpnuts?.DocumentType, () =>
            () => resetCounteries('DocumentType', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('DocumentType', false);
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
                  <MySelect isSimple={true} placeholder='Document Type'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.DocumentType?.lookupname</p>
                </div>
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('DocumentType', 'code', e.target.value)}
                    value={drawerIpnuts?.DocumentType?.code}
                  />
                  <p className="error">{errors?.DocumentType?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Document Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('DocumentType', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.DocumentType?.lookupname}
                  />
                  <p className="error">{errors?.DocumentType?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('DocumentType', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.DocumentType?.DisplayName} />
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('DocumentType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.DocumentType?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnDocumentType}
              dataSource={data?.DocumentType}
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
      <MyDrawer title='Claim Type' open={drawerOpen?.ClaimType} isPagination={true} onClose={() => {
        openCloseDrawerFtn('ClaimType');
        IsUpdateFtn('ClaimType', false);
      }}
        add={async () => {
          if (!validateForm('ClaimType')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.ClaimType,
            'Data inserted successfully',
            'Data did not insert',
          );
          resetCounteries('ClaimType', () => dispatch(getAllLookups()))
        }}
        isEdit={isUpdateRec?.ClaimType}
        update={async () => {
          if (!validateForm('ClaimType')) return;
          await updateFtn('/lookup', drawerIpnuts?.ClaimType, () =>
            resetCounteries('ClaimType', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('ClaimType', false);
        }}
      >
        <div className="drawer-main-container">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Claim Type'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.ClaimType?.lookupname</p>
                </div>
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('ClaimType', 'code', e.target.value)}
                    value={drawerIpnuts?.ClaimType?.code}
                  />
                  <p className="error">{errors?.ClaimType?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Claim Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => drawrInptChng('ClaimType', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.ClaimType?.lookupname}
                  />
                  <p className="error">{errors?.ClaimType?.lookupname}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name:</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => drawrInptChng('ClaimType', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.ClaimType?.DisplayName}
                  />
                  <p className="error"></p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('ClaimType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.ClaimType?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>

          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnClaimType}
              dataSource={data?.ClaimType}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Schemes' open={drawerOpen?.Schemes} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Schemes');
        IsUpdateFtn('Schemes', false);
      }}
        add={async () => {
          if (!validateForm('Schemes')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Schemes,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Schemes', () => dispatch(getAllLookups()))
          );
          // dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Schemes}
        update={async () => {
          if (!validateForm('Schemes')) return;
          await updateFtn('/lookup', drawerIpnuts?.Schemes, () =>
            resetCounteries('Schemes', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Schemes', false);
        }}
      >
        <div className="drawer-main-container">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Schemes'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.ClaimType?.lookupname</p>
                </div>
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('Schemes', 'code', e.target.value)}
                    value={drawerIpnuts?.Schemes?.code}
                  />
                  <p className="error">{errors?.Schemes?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Schemes</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => drawrInptChng('Schemes', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Schemes?.lookupname}
                  />
                  <p className="error">{errors?.Schemes?.lookupname}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name:</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => drawrInptChng('Schemes', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Schemes?.DisplayName}
                  />
                  <p className="error"></p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('Schemes', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Schemes?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>

          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnSchemes}
              dataSource={data?.Schemes}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />
          </div>
        </div>
      </MyDrawer>
      <MyDrawer title='Reasons' open={drawerOpen?.Reasons} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Reasons');
        IsUpdateFtn('Reasons', false);
      }}
        add={async () => {
          if (!validateForm('Reasons')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Reasons,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Reasons', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Reasons}
        update={async () => {
          if (!validateForm('Reasons')) return;
          await updateFtn('/lookup', drawerIpnuts?.Reasons, () =>
            resetCounteries('Reasons', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Reasons', false);
        }}
      >
        <div className="drawer-main-container">
          <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Schemes'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.ClaimType?.lookupname</p>
                </div>
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('Reasons', 'code', e.target.value)}
                    value={drawerIpnuts?.Reasons?.code}
                  />
                  <p className="error">{errors?.Reasons?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Reasons</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => drawrInptChng('Reasons', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Reasons?.lookupname}
                  />
                  <p className="error">{errors?.Reasons?.lookupname}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Display Name:</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => drawrInptChng('Reasons', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Reasons?.DisplayName}
                  />
                  <p className="error"></p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('Reasons', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Reasons?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>

          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnReasons}
              dataSource={data?.Reasons}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />
          </div>
        </div>
      </MyDrawer>
      {/* <MyDrawer title='Schemes' open={drawerOpen?.Schemes}
        onClose={() => openCloseDrawerFtn('Schemes')}
        add={async () => {
          if (!validateForm('Schemes')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Schemes, 'Data inserted successfully:',
            'Data did not insert:', () => {
              resetCounteries('Schemes')
              dispatch(getAllLookups())
            })
        }}
      >
        <div className="drawer-main-container">
          <div className="mb-4 pb-4">
            <div className="drawer-inputs-container">
              <div className="drawer-lbl-container">
                <p>Scheme Name:</p>
              </div>
              <div className="input-container">
                <p className="star">*</p>
                <div className="input-sub-container">
                  <Input
                  disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Schemes', 'schemeName', e.target.value)}
                    value={drawerIpnuts?.Schemes?.schemeName}
                  />
                  <p className="error">{errors?.Schemes?.schemeName}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inputs-container">
              <div className="drawer-label-container">
                <p>Code:</p>
              </div>
              <div className="input-container">
                <p className="star">*</p>
                <div className="input-sub-container">
                  <Input
                  disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Schemes', 'code', e.target.value)}
                    value={drawerIpnuts?.Schemes?.code}
                  />
                  <p className="error">{errors?.Schemes?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inputs-container">
              <div className="drawer-label-container">
                <p>Status:</p>
              </div>
              <div className="input-container">
                <p className="star-white">*</p>
                <div className="input-sub-container">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('Schemes', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Schemes?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnSchemes}
              dataSource={data?.Schemes}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />
          </div>
        </div>
      </MyDrawer> */}

      <MyDrawer
        title="Duties"
        open={drawerOpen?.Duties}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Duties");
          IsUpdateFtn("Duties", false);
        }}
        add={async () => {
          if (!validateForm("Duties")) return;
          await insertDataFtn(
            `/lookup`,
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
          if (!validateForm("Duties")) return;
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) =>
                      drawrInptChng("Duties", "code", e.target.value)
                    }
                    value={drawerIpnuts?.Duties?.code}
                  />
                  <p className="error">{errors?.Duties?.code}</p>
                </div>
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) =>
                      drawrInptChng("Duties", "lookupname", e.target.value)
                    }
                    value={drawerIpnuts?.Duties?.lookupname}
                  />
                  <p className="error">{errors?.Duties?.lookupname}</p>
                </div>
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) =>
                      drawrInptChng("Duties", "DisplayName", e.target.value)
                    }
                    value={drawerIpnuts?.Duties?.DisplayName}
                  />
                </div>
                {/* <p className="error">{errors?.Duties?.code}</p> */}
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) =>
                      drawrInptChng("Duties", "isactive", e.target.checked)
                    }
                    checked={drawerIpnuts?.Duties?.isactive}
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
              dataSource={data?.Duties}
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
          if (!validateForm("Ranks")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Ranks,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Ranks', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Ranks}
        update={
          async () => {
            if (!validateForm("Ranks")) return;
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('Ranks', 'code', e.target.value)}
                    value={drawerIpnuts?.Ranks?.code}
                  />
                  <p className="error">{errors?.Ranks?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Rank</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Ranks', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Ranks?.lookupname}
                  />
                  <p className="error">{errors?.Ranks?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Ranks', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Ranks?.DisplayName} />
                  {/* <p className="error">{errors?.Ranks?.}</p> */}
                </div>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('Ranks', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Ranks?.isactive}
                  >Active</Checkbox>
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnRanks}
              dataSource={data?.Ranks}
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
      <MyDrawer title='Boards' open={drawerOpen?.Boards} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Boards')
        IsUpdateFtn('Boards', false,)
      }}
        add={async () => {
          if (!validateForm('Boards')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Boards,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Boards', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }
        }
        isEdit={isUpdateRec?.Boards}
        update={async () => {
          if (!validateForm('Boards')) return; // Stop execution if validation fails
          await updateFtn('/lookup', drawerIpnuts?.Boards, () =>
            resetCounteries('Boards', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Boards', false);
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
                  <MySelect isSimple={true} placeholder='Boards'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.Boards?.lookupname</p>
                </div>
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('Boards', 'code', e.target.value)}
                    value={drawerIpnuts?.Boards?.code}
                  />
                  <p className="error">{errors?.Boards?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Board</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Boards', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Boards?.lookupname}
                  />
                  <p className="error">{errors?.Boards?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Boards', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Boards?.DisplayName} />
                </div>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => {
                      drawrInptChng('Boards', 'isactive', e.target.checked)
                    }}
                    checked={drawerIpnuts?.Boards?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnBoards}
              dataSource={data?.Boards}
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
      <MyDrawer title='Councils' open={drawerOpen?.Councils} isPagination={true} onClose={() => {
        openCloseDrawerFtn('Councils')
        IsUpdateFtn('Councils', false)
      }}
        add={async () => {

          if (!validateForm('Councils')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Councils,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Councils', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.Councils}
        update={async () => {
          if (!validateForm('Councils')) return; // Stop execution if validation fails
          await updateFtn('/lookup', drawerIpnuts?.Councils, () =>
            resetCounteries('Councils', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('Councils', false);
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
                  <MySelect isSimple={true} placeholder='Councils'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.Councils?.lookupname</p>
                </div>
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
                    disabled={isDisable}
                    className="inp" onChange={(e) => drawrInptChng('Councils', 'code', e.target.value)}
                    value={drawerIpnuts?.Councils?.code}
                  />
                  <p className="error">{errors?.Councils?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Council</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Councils', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Councils?.lookupname}
                  />
                  <p className="error">{errors?.Councils?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('Councils', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Councils?.DisplayName} />
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('Councils', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Councils?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnCouncils}
              dataSource={data?.Councils}
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
      <MyDrawer title='Correspondence Type' open={drawerOpen?.CorrespondenceType} isPagination={true}
        onClose={() => {
          openCloseDrawerFtn('CorrespondenceType');
          IsUpdateFtn('CorrespondenceType', false);
        }}
        add={async () => {
          if (!validateForm('CorrespondenceType')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.CorrespondenceType,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('CorrespondenceType', dispatch(getAllLookups()))
          );
        }}
        isEdit={isUpdateRec?.CorrespondenceType}
        update={async () => {
          if (!validateForm('CorrespondenceType')) return;
          await updateFtn('/lookup', drawerIpnuts?.CorrespondenceType, () =>
            resetCounteries('CorrespondenceType', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups());
          IsUpdateFtn('CorrespondenceType', false);
        }}
      >
        <div className="drawer-main-cntainer">
          <CustomSelect
            label="Lookup Type"
            name="India"
            value={"IN"}
            required
            // disabled={true}
            // hasError={!country}
            errorMessage="Required"
            options={[
              { label: 'Correspondence Type', value: 'IN' },
              { label: 'Ireland', value: 'IE' },
              { label: 'USA', value: 'US' }
            ]}
          />
          <MyInput
            label="Correspondence Type"
            name="Correspondence Type"
            placeholder="Correspondence Type "
            value={drawerIpnuts?.CorrespondenceType?.lookupname}
            onChange={(e) => drawrInptChng('CorrespondenceType', 'lookupname', e.target.value)}
            required={true}
            hasError={errors?.CorrespondenceType?.lookupname ? true : false}
          />
          <MyInput
            label="Code"
            name="Code"
            placeholder="Enter Code"
            value={drawerIpnuts?.CorrespondenceType?.Code}
            onChange={(e) => drawrInptChng('CorrespondenceType', 'Code', e.target.value)}
            required={false}
            hasError={errors?.CorrespondenceType?.Code ? true : false}
          />
          {/* <div className="mb-4 pb-4">
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Lookup Type :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect isSimple={true} placeholder='Correspondence Type'
                    disabled={true}
                    options={lookupsType}
                  />
                  <p className="error text-white">errors?.CorrespondenceType?.lookupname</p>
                </div>
              </div>
            </div>
            <Input
              label="Code"
              name="code"
              required
              placeholder="Enter code"
              value={drawerIpnuts?.CorrespondenceType?.code || ''}
              onChange={(e) => drawrInptChng('CorrespondenceType', 'code', e.target.value)}
              // showValidation={errors?.CorrespondenceType?.code}
              disabled={isDisable}
            />
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Correspondence Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MyInput

                  />
                
                  <p className="error">{errors?.CorrespondenceType?.lookupname}</p>
                </div>
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
                    disabled={isDisable} className="inp"
                    onChange={(e) => drawrInptChng('CorrespondenceType', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.CorrespondenceType?.DisplayName} />
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('CorrespondenceType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.CorrespondenceType?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>
          </div> */}
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnCorrespondenceType}
              dataSource={data?.CorrespondenceType}
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
        title='Spoken Languages'
        open={drawerOpen?.SpokenLanguages}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn('SpokenLanguages')
          IsUpdateFtn('Spoken Languages', false)
        }}
        add={async () => {
          if (!validateForm('SpokenLanguages')) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.SpokenLanguages,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('SpokenLanguages', () => dispatch(getAllLookups()))
          );
          dispatch(getAllLookups())
        }}
        isEdit={isUpdateRec?.SpokenLanguages}
        update={async () => {
          if (!validateForm('SpokenLanguages')) return;
          await updateFtn('/lookup', drawerIpnuts?.SpokenLanguages, () => resetCounteries('SpokenLanguages', () => dispatch(getAllLookups())))
          dispatch(getAllLookups())
          IsUpdateFtn('SpokenLanguages', false)
        }}
      >
        <div className="drawer-main-cntainer">
          <div className="mb-4 pb-4">
            {/* Lookup Type */}
            <MySelect
              label="Lookup Type:"
              isSimple={true}
              placeholder='Spoken Languages'
              disabled={true}
              options={lookupsType}
              onChange={() => { }}
              required
              hasError={!!errors?.lookuptypeId}
            />

            {/* Code Field */}
            <MyInput
              label="Code:"
              name="code"
              value={drawerIpnuts?.SpokenLanguages?.code}
              onChange={(e) => drawrInptChng('SpokenLanguages', 'code', e.target.value)}
              placeholder="Enter code"
              disabled={isDisable}
              required
              hasError={!!errors?.SpokenLanguages?.code}
            />

            {/* Spoken Languages Field */}
            <MyInput
              label="Spoken Languages:"
              name="lookupname"
              value={drawerIpnuts?.SpokenLanguages?.lookupname}
              onChange={(e) => drawrInptChng('SpokenLanguages', 'lookupname', e.target.value)}
              placeholder="Enter spoken language"
              disabled={isDisable}
              required
              hasError={!!errors?.SpokenLanguages?.lookupname}
            />

            {/* Display Name Field */}
            <MyInput
              label="Display Name:"
              name="DisplayName"
              value={drawerIpnuts?.SpokenLanguages?.DisplayName}
              onChange={(e) => drawrInptChng('SpokenLanguages', 'DisplayName', e.target.value)}
              placeholder="Enter display name"
              disabled={isDisable}
              hasError={!!errors?.SpokenLanguages?.DisplayName}
            />

            {/* Active Checkbox */}
            <div style={{ marginTop: '16px' }}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) => drawrInptChng('SpokenLanguages', 'isactive', e.target.checked)}
                checked={drawerIpnuts?.SpokenLanguages?.isactive}
              >
                Active
              </Checkbox>
            </div>
          </div>

          {/* Table */}
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={SLColumns}
              dataSource={data?.SpokenLanguages}
              loading={lookupsloading}
              className="drawer-tbl"
              rowClassName={(record, index) => index % 2 !== 0 ? "odd-row" : "even-row"}
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
        title='Solicitors'
        open={drawerOpen?.Solicitors}
        isPagination={true}
        onClose={() => openCloseDrawerFtn('Solicitors')}
        add={() => {
          if (!validateSolicitors('Solicitors')) return;
          insertDataFtn(
            `/contact`,
            drawerIpnuts?.Solicitors,
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Solicitors', () => dispatch(getContacts())))
          dispatch(getContacts())
        }}
        update={
          async () => {
            if (!validateSolicitors('Solicitors')) return;
            await updateFtn('/contact', drawerIpnuts?.Solicitors, () => resetCounteries('Solicitors', () => dispatch(getContacts())))
            dispatch(getAllLookups())
            IsUpdateFtn('Solicitors', false,)
          }}
        isEdit={isUpdateRec?.Solicitors}
        width={'1020px'}
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
                  <MySelect
                    placeholder='Select Title'
                    isSimple={true}
                    options={lookupsForSelect?.Titles}
                  />
                  <p className="error text-white">errors?.Solicitors?.Titles</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Forename :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    value={drawerIpnuts?.Solicitors?.Forename}
                    onChange={(e) => drawrInptChng('Solicitors', 'Forename', e.target.value)}
                  />
                  <p className="error">{errors?.Solicitors?.Forename}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Surname :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} className="inp"
                    value={drawerIpnuts?.Solicitors?.Surname}
                    onChange={(e) => drawrInptChng('Solicitors', 'Surname', e.target.value)}
                  />
                  <p className="error">{errors?.Solicitors?.Surname}</p>
                </div>

              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Email :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactEmail}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactEmail', e.target.value)}
                  />
                  <p className="error">{errors?.Solicitors?.ContactEmail}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Mobile :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactPhone}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactPhone', e.target.value)}
                  />
                  <p className="error">{errors?.Solicitors?.ContactPhone}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Building or House :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactAddress?.BuildingOrHouse}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.BuildingOrHouse', e.target.value)}

                  />
                  <p className="error">{errors?.Solicitors?.BuildingOrHouse}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Street or Road :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactAddress?.StreetOrRoad}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.StreetOrRoad', e.target.value)}
                  />
                  <p className="error text-white">errors?.Solicitors?.ContactEmail</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Area or Town :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactAddress?.AreaOrTown}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.AreaOrTown', e.target.value)}
                  />
                  <p className="error">{errors?.Solicitors?.AreaOrTown}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>County, City or Postcode :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactAddress?.CityCountyOrPostCode}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.CityCountyOrPostCode', e.target.value)}
                  />
                </div>
                {/* <p className="error">{drawerIpnuts}</p> */}
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Eircode :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input
                    disabled={isDisable} value={drawerIpnuts?.Solicitors?.ContactAddress?.Eircode}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.Eircode', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
          </div>
          <div className="mt-4 config-tbl-container">
            <Table
              pagination={false}
              columns={columnsSolicitors}
              dataSource={data?.Solicitors}
              loading={contactsLoading}
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
        isEdit={isUpdateRec?.Committees}
        update={
          async () => {
            await updateFtn('/lookup', drawerIpnuts?.Lookup, () => resetCounteries('Committees', () => dispatch(getAllLookups())))
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
                    disabled={isDisable}
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
                  <Input
                    disabled={isDisable} className="inp"
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
                  <Input
                    disabled={isDisable} className="inp" onChange={(e) => drawrInptChng('Lookup', 'DisplayName', e.target.value)} value={drawerIpnuts?.Lookup?.DisplayName} />
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
                <div className="inpt-sub-con d-flex flex-row">
                  <MySelect isSimple={true} placeholder='' options={lookupsType} onChange={(value) => {
                    // drawrInptChng('Lookup', 'RegionTypeID', String(value))
                  }} />
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
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox disabled={isDisable}
                    onChange={(e) => drawrInptChng('LookupType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.LookupType?.isactive}
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
              // dataSource={lookups}
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
    // </div>
  );
}



export default Configuratin;