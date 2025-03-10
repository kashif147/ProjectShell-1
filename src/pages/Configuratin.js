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
import { MdOutlineScreenSearchDesktop } from "react-icons/md";
import { FiPlusCircle } from "react-icons/fi";
import { getAllLookupsType } from '../features/LookupTypeSlice';
import { getAllLookups } from '../features/LookupsSlice'
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { FaFileAlt } from "react-icons/fa";
import { TbBulb } from "react-icons/tb";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineContactPhone } from "react-icons/md";
import { LuFileQuestion } from "react-icons/lu";
import { PiRankingThin } from "react-icons/pi";
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

// import '../styles/Configuratin.css'
import '../styles/Configuration.css'
import MySelect from "../component/common/MySelect";
import { deleteFtn, insertDataFtn, updateFtn } from "../utils/Utilities";
import { baseURL } from "../utils/Utilities";
import { render } from "@testing-library/react";
import { fetchRegions, deleteRegion } from "../features/RegionSlice";
import { getLookupTypes } from "../features/LookupTypeSlice";
import { getAllRegionTypes } from '../features/RegionTypeSlice'
import { getContactTypes } from "../features/ContactTypeSlice";

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
    Stations: [],
    Boards: [],
    Councils: [],
    CorrespondenceType: [],
    DocumentType: [],
    ClaimType: [],
    Schemes: [],
    Reasons: [],
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
    RegionType: false,
    Boards: false,
    ClaimType: false,
    Schemes: false,
    Reasons: false
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
    Counteries: false,
    Boards: false,
    Councils: false,
    CorrespondenceType: false,
    DocumentType: false,
    ClaimType: false,
    Schemes: false,
    Reasons: false,

  })

  useEffect(() => {
    if (data?.Provinces) {
      const transformedData = data.Provinces.map((item) => ({
        key: item?._id,
        label: item?.lookupname,
      }));
      setselectLokups((prevState) => ({
        ...prevState,
        Provinces: transformedData,
      }));
    }
    if (data?.county) {
      const transformedData = data.county.map((item) => ({
        key: item?._id,
        label: item?.lookupname,
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
        label: item?.lookupname,
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
    if (lookups && Array.isArray(lookups)) {
      const filteredCounty = lookups.filter((item) => item?.lookuptypeId?._id === '67bf3d63e314eba2c210517f');
      setdata((prevState) => ({
        ...prevState,
        county: filteredCounty,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const filteredDivision = lookups.filter((item) => item.lookuptypeId?._id === '67bf4317e314eba2c21051dc');

      setdata((prevState) => ({
        ...prevState,
        Divisions: filteredDivision,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const CitiesDivision = lookups.filter((item) => item.lookuptypeId?._id === '67c57868a8320b14514d38ca');

      setdata((prevState) => ({
        ...prevState,
        Cities: CitiesDivision,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FBoards = lookups.filter((item) => item.lookuptypeId?._id === '67c947b6f41d37131f79b1e8');
      setdata((prevState) => ({
        ...prevState,
        Boards: FBoards,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FCouncils = lookups.filter((item) => item.lookuptypeId?._id === '67c96d8af41d37131f79b37a');
      setdata((prevState) => ({
        ...prevState,
        Councils: FCouncils,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FCorrespondenceType = lookups.filter((item) => item.lookuptypeId?._id === '67ca9528a5cd03df6e08c14d');
      setdata((prevState) => ({
        ...prevState,
        CorrespondenceType: FCorrespondenceType,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FDocumentType = lookups.filter((item) => item.lookuptypeId?._id === '67ca9adda5cd03df6e08c202');
      setdata((prevState) => ({
        ...prevState,
        DocumentType: FDocumentType,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FClaimType = lookups.filter((item) => item.lookuptypeId?._id === '67caa10ba5cd03df6e08c29e');
      setdata((prevState) => ({
        ...prevState,
        ClaimType: FClaimType,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FSchemes = lookups.filter((item) => item.lookuptypeId?._id === '67ce8fda4055ac8c72b37e3b');
      setdata((prevState) => ({
        ...prevState,
        Schemes: FSchemes,
      }));
    }
    if (lookups && Array.isArray(lookups)) {
      const FReasons = lookups.filter((item) => item.lookuptypeId?._id === '67ce93394055ac8c72b37ec0');
      setdata((prevState) => ({
        ...prevState,
        Reasons: FReasons,
      }));
    }
  }, [lookups])

  useEffect(() => {
    if (regions && Array.isArray(regions)) {
      const filteredProvinces = regions.filter((item) => item.lookuptypeId?._id === '67bf243ce314eba2c2105098');
      setdata((prevState) => ({
        ...prevState,
        Provinces: filteredProvinces,
      }));
    }


    if (regions && Array.isArray(regions)) {
      const filteredDistricts = regions.filter((item) => item.lookuptypeId?._id === '67bf4317e314eba2c21051dc');

      setdata((prevState) => ({
        ...prevState,
        Districts: filteredDistricts,
      }));
    }

    if (regions && Array.isArray(regions)) {

      const filteredStations = regions.filter((item) => item.RegionTypeID === '671822c6a0072a28aab883e9')

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
    dispatch(getContactTypes());
  }, [dispatch]);
  console.log(contactTypes, "ppppp")
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
    Contacts: {
        ContactName: "",
        ContactPhone: "",
        ContactEmail: "",
        ContactAddress: {
          BuildingOrHouse: "",
          StreetOrRoad: "",
          AreaOrTown: "",
          CityCountyOrPostCode: "",
          Eircode: ""
        },
        ContactTypeID: "",
        isDeleted: false
      },
    RegionType: { RegionType: '', DisplayName: '', isactive: true, isDeleted: false },
    Counteries: { lookuptypeId: '67bf3d63e314eba2c210517f', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Station: { lookuptypeId: '67bf3d63e314eba2c210517f', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Cities: { lookuptypeId: '67c57868a8320b14514d38ca', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Districts: { lookuptypeId: '67bf3d63e314eba2c210517f', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Divisions: { lookuptypeId: '67bf4317e314eba2c21051dc', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Councils: { lookuptypeId: '67c96d8af41d37131f79b37a', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    CorrespondenceType: { lookuptypeId: '67ca9528a5cd03df6e08c14d', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    ClaimType: { lookuptypeId: '67caa10ba5cd03df6e08c29e', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Schemes: { lookuptypeId: '67ce8fda4055ac8c72b37e3b', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Reasons: { lookuptypeId: '67ce93394055ac8c72b37ec0', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    DocumentType: { lookuptypeId: '67ca9adda5cd03df6e08c202', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Boards: { lookuptypeId: '67c947b6f41d37131f79b1e8', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    LookupType: { lookuptype: '', code: '', DisplayName: '', userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Lookup: { lookuptypeId: '', DisplayName: '', lookupname: '', code: '', Parentlookup: '', userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Gender: { lookuptypeId: '674a1977cc0986f64ca36fc6', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Title: { lookuptypeId: '675fc362e9640143bfc38d28', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    SpokenLanguages: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    MaritalStatus: { lookuptypeId: '67b434ccc51214d371b7c0d1', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    ProjectTypes: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Trainings: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Ranks: { lookuptypeId: '674a195dcc0986f64ca36fc2', DisplayName: '', lookupname: '', code: '', Parentlookup: '674a195dcc0986f64ca36fc2', userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Provinces: { lookuptypeId: '67bf243ce314eba2c2105098', DisplayName: '', code: '', lookupname: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    Duties: { lookuptypeId: '674a219fcc0986f64ca3701b', DisplayName: '', lookupname: '', code: '', Parentlookup: null, userid: "67117bea87c907f6cdda0ad9", isactive: true, isDeleted: false },
    ContactType: { ContactType: "", DisplayName: "", isDeleted: false, isactive: true },
  };

  const [drawerIpnuts, setdrawerIpnuts] = useState(drawerInputsInitalValues)
  const drawrInptChng = (drawer, field, value) => {
    setdrawerIpnuts((prevState) => ({
      ...prevState,
      [drawer]: {
        ...prevState[drawer],
        [field]: value,
      },
    }));
    console.log(drawerIpnuts[drawer], "8889")
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
    setDrawerOpen((prevState) => ({
      ...prevState,
      [name]: !prevState[name]
    }))
  }
  // console.log(,drawerOpen?.Schemes,"ppp")
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
      } else if (drawer === "Boards" && updatedDrawerInputs?.Boards) {
        updatedDrawerInputs.Boards = {
          ...updatedDrawerInputs.Boards,
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
      else if (drawer === "Councils" && updatedDrawerInputs?.Councils) {
        updatedDrawerInputs.Councils = {
          ...updatedDrawerInputs.Councils,
          id: idValue,
        };
      }
      else if (drawer === "CorrespondenceType" && updatedDrawerInputs?.CorrespondenceType) {
        updatedDrawerInputs.CorrespondenceType = {
          ...updatedDrawerInputs.CorrespondenceType,
          id: idValue,
        };
      }
      else if (drawer === "DocumentType" && updatedDrawerInputs?.DocumentType) {
        updatedDrawerInputs.DocumentType = {
          ...updatedDrawerInputs.DocumentType,
          id: idValue,
        };
      }
      else if (drawer === "ClaimType" && updatedDrawerInputs?.ClaimType) {
        updatedDrawerInputs.ClaimType = {
          ...updatedDrawerInputs.ClaimType,
          id: idValue,
        };
      }
      else if (drawer === "Schemes" && updatedDrawerInputs?.Schemes) {
        updatedDrawerInputs.Schemes = {
          ...updatedDrawerInputs.Schemes,
          id: idValue,
        };
      }
      else if (drawer === "Reasons" && updatedDrawerInputs?.Reasons) {
        updatedDrawerInputs.Reasons = {
          ...updatedDrawerInputs.Reasons,
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
      dataIndex: 'RegionName',
      key: 'RegionName',
      render: (item) => item?.lookuptypeId?.lookuptype
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
      dataIndex: '',
      key: '',
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
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Contact Type',
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
      render: (record) => <Checkbox checked={record?.isactive} ></Checkbox>
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
      dataIndex: '',
      key: '',
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
      title: 'lookup Name',
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
        <Space size="middle" style={styles.centeredCell}>
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
        <Space size="middle" style={styles.centeredCell}>
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
      title: 'Lookup Name',
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
        <Space size="middle" style={styles.centeredCell}>
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
      title: 'lookup Name',
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
                resetCounteries('Title')
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
        <Space size="middle" style={styles.centeredCell}>
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
        <Space size="middle" style={styles.centeredCell}>
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
        <Space size="middle" style={styles.centeredCell}>
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
  console.log(errors, "errors")
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };
  const validateForm = (drawerType) => {
    let newErrors = { Lookup: {}, [drawerType]: {} };

    if (!drawerIpnuts?.[drawerType]?.code) {
      newErrors[drawerType].code = "Required";
    }
    if (!drawerIpnuts?.[drawerType]?.lookupname) {
      newErrors[drawerType].lookupname = "Required";
    }

    // Mandatory ParentLookup for specific drawers
    const requiresParentLookup = ["Divisions", "Districts", "Cities", "Counteries", "Station"];
    if (requiresParentLookup.includes(drawerType) && (!drawerIpnuts?.[drawerType]?.Parentlookup || drawerIpnuts?.[drawerType]?.Parentlookup === null)) {
      newErrors[drawerType].parentLookup = "Required";
    }
    // Set errors only if there are validation failures
    setErrors(newErrors);
    // Check if there are any errors in the object
    return Object.keys(newErrors.Lookup).length === 0 && Object.keys(newErrors[drawerType]).length === 0;
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
  const columnClaimType = [
    { title: 'Code', dataIndex: 'code', key: 'code', sorter: (a, b) => a.code.localeCompare(b.code), sortDirections: ['ascend', 'descend'] },
    { title: 'Lookup Type', dataIndex: 'lookuptype', key: 'lookuptype', render: (_, record) => record?.lookuptypeId?.lookuptype },
    { title: 'Display Name', dataIndex: 'DisplayName', key: 'DisplayName' },
    { title: 'Lookup Name', dataIndex: 'lookupname', key: 'lookupname' },
    { title: 'Active', dataIndex: 'isactive', key: 'isactive', render: (_, record) => <Checkbox checked={record?.isactive} /> },
    {
      title: <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} /> Action
      </div>,
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle" style={styles.centeredCell}>
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

  const { Search } = Input;
  const sections = [
    {
      title: "Lookups Configuration",
      items: [
        { key: "Title", icon: <Title className="icons" />, label: "Titles" },
        { key: "Gender", icon: <Gender className="icons" />, label: "Gender" },
        { key: "MaritalStatus", icon: <MaritalStatusOutlined className="icons" />, label: "Marital Status" },
        { key: "Provinces", icon: <ProvinceOutlined className="icons" />, label: "Provinces" },
        { key: "Counteries", icon: <CountyOutlined className="icons" />, label: "Counteries" },
        { key: "Divisions", icon: <DivisionsOutlined className="icons" />, label: "Divisions" },
        { key: "Districts", icon: <DistrictsOutlined className="icons" />, label: "Districts" },
        { key: "Cities", icon: <CitiesOutlined className="icons" />, label: "Cities" },
        { key: "Station", icon: <StationOutlined className="icons" />, label: "Station" },
        { key: "PostCode", icon: <PostCodeOutlined className="icons" />, label: "Post Codes" },
        { key: "Boards", icon: <BoardOutlined className="icons" />, label: "Boards" },
        { key: "Councils", icon: <CouncilOutlined className="icons" />, label: "Councils" },
        { key: "SpokenLanguages", icon: <LanguageOutlined className="icons" />, label: "Spoken Languages" },
        { key: "ProjectTypes", icon: <PiHandshakeDuotone className="icons" />, label: "Project Types" },
        { key: "Trainings", icon: <TbBulb className="icons" />, label: "Trainings" },
        { key: "Ranks", icon: <PiRankingThin className="icons" />, label: "Ranks" },
        { key: "Duties", icon: <GrTask className="icons" />, label: "Duties" },
        { key: "Solicitors", icon: <PiGavelThin className="icons" />, label: "Solicitors" },
        { key: "RosterType", icon: <LuCalendarDays className="icons" />, label: "Roster Type" },
        { key: "CorrespondenceType", icon: <SlEnvelopeOpen className="icons" />, label: "Correspondence Type" },
        { key: "DocumentType", icon: <FaFileAlt className="icons" />, label: "Document Type" },
        { key: "ClaimType", icon: <PiHandshakeDuotone className="icons" />, label: "Claim Type" },
        { key: "Schemes", icon: <PiHandshakeDuotone className="icons" />, label: "Schemes" },
        { key: "LookupType", icon: <PiHandshakeDuotone className="icons" />, label: "Lookup Type" },
        { key: "Lookup", icon: <MdOutlineScreenSearchDesktop className="icons" />, label: "Lookup" },
        // { key: "RegionType", icon: <PiHandshakeDuotone className="icons" />, label: "Region Type" },
        { key: "ContactTypes", icon: <MdOutlineContactPhone className="icons" />, label: "Contact Types" },
        { key: "Reasons", icon: <LuFileQuestion className="icons" />, label: "Reasons" },
      ],
    },
    {
      title: "Grid Configuration",
      items: [
        { key: "Profile", icon: <FaRegCircleUser className="icons" />, label: "Profile" },
        // { key: "Reigontype", icon: <FaRegMap className="icons" />, label: "Reigon type" },
      ],
    },
    {
      title: "Roles-Based Configuration",
      items: [
        { key: "Roles", icon: <FaRegCircleQuestion className="icons" />, label: "Roles" },
        { key: "Permissions", icon: <HiOutlineMinusCircle className="icons" />, label: "Permissions" },
        { key: "Permissions", icon: <HiOutlineMinusCircle className="icons" />, label: "Permissions" },
        // { key: "AccessLevels", icon: <TbUsersGroup className="icons" />, label: "Access Levels" },
      ],
    },
    {
      title: "Business Rules & Workflows",
      items: [
        { key: "Member Status", icon: <FaRegCircleQuestion className="icons" />, label: "Member Status" },
        { key: "Priorities", icon: <HiOutlineMinusCircle className="icons" />, label: "Priorities" },
        { key: "pause-circle", icon: <PiHandshakeDuotone className="icons" />, label: "pause-circle" },
      ],
    },
  ];

  return (
    <div>
      <div className="search-inpt">
        <Search style={{ borderRadius: "3px", height: '62px' }} value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      {sections.map((section) => {
        const filteredItems = section.items.filter((item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return filteredItems.length > 0 ? (
          <div key={section.title}>
            <Divider orientation="left">{section.title}</Divider>
            <Row gutter={[16, 16]} align="top">
              {filteredItems.map((item) => (
                <Col key={item.key} className="hover-col" span={3} style={{ textAlign: "left" }} onClick={() => openCloseDrawerFtn(item.key)}>
                  <div>
                    {item.icon}
                    <p className="lookups-title">{item.label}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        ) : null;
      })}

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
      <MyDrawer isPagination={true} title='County' open={drawerOpen?.Counteries}
        onClose={() => openCloseDrawerFtn('Counteries')}
        add={async () => {
          if (!validateForm('Counteries')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Counteries, 'Data inserted successfully:', 'Data did not insert:', () => {
            resetCounteries('Counteries')
            dispatch(getAllLookups())
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Counteries', 'code', e.target.value)}
                    value={drawerIpnuts?.Counteries?.code} />
                  <p className="error">{errors?.Counteries?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>County Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Counteries', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Counteries?.lookupname} />
                  <p className="error">{errors?.Counteries?.lookupname}</p>
                </div>
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
                    onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Counteries?.DisplayName} />
                  <p className="error text-white">txt</p>
                </div>
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
                      drawrInptChng('Counteries', 'Parentlookup', e)
                      console.log()
                    }}
                    value={drawerIpnuts?.Counteries?.parentLookup}
                  />
                  <p className="error">{errors?.Counteries?.parentLookup}</p>
                </div>
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
              pagination={{ pageSize: 10 }}
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
        onClose={() => openCloseDrawerFtn('Provinces')}
        add={() => {
          if (!validateForm("Provinces")) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Provinces,
            'Data inserted successfully:', 'Data did not insert:',
            () => {
              resetCounteries('Provinces')
              dispatch(getAllLookups())
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Provinces', 'code', e.target.value)}
                    value={drawerIpnuts?.Provinces?.code
                    } />
                  <p className="error">{errors?.Provinces?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Province :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp" onChange={(e) => drawrInptChng('Provinces', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Provinces?.lookupname} />
                  <p className="error">{errors?.Provinces?.lookupname}</p>
                </div>
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
      <MyDrawer title='City'
        open={drawerOpen?.Cities} isPagination={true} onClose={() => openCloseDrawerFtn('Cities')} add={() => {
          if (!validateForm('Cities')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Cities,
            'Data inserted successfully:', 'Data did not insert:', () => {
              resetCounteries('Cities')
              dispatch(getAllLookups())
            }
          )
          dispatch(getAllLookups())
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
                  <p className="error text-white"></p>
                </div>
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>District :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <MySelect placeholder='Select County' isSimple={true} options={selectLokups?.Districts}
                    value={drawerIpnuts?.Cities?.Parentlookup}
                    onChange={(e) => {
                      drawrInptChng('Cities', 'Parentlookup', e)
                      console.log(drawerIpnuts?.Cities?.Parentlookup, "888")
                    }}
                  />
                  <p className="error">{errors?.Cities?.parentLookup}</p>
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
                  <Input className="inp" onChange={(e) => drawrInptChng('Cities', 'code', e.target.value)}
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
                  <Input className="inp"
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Cities', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Cities?.DisplayName} />
                </div>
                {/* <p className="error">{errors?.Cities?.}</p> */}
              </div>
            </div>

            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox checked={drawerIpnuts?.Cities?.isactive} onChange={(e) => drawrInptChng('Cities', 'isactive', e.target.value)}>Active</Checkbox>
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
        if (!validateForm("PostCode")) return;
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
      <MyDrawer title='Districts'
        open={drawerOpen?.Districts} isPagination={true}
        onClose={() => openCloseDrawerFtn('Districts')} add={() => {
          if (!validateForm('Districts')) return;
          insertDataFtn(`/lookup`, { region: drawerIpnuts?.Districts }, 'Data inserted successfully:', 'Data did not insert:',
            () => {
              resetCounteries('Districts')
              dispatch(getAllLookups())
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
                  <p className="error text-white">txt</p>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Districts', 'code', e.target.value)}
                    value={drawerIpnuts?.Districts?.code} />
                  <p className="error">{errors?.Districts?.code}</p>
                  {/* <h1 className="error-text"></h1> */}
                </div>
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
                    onChange={(e) => drawrInptChng('Districts', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Districts?.lookupname} />
                  <p className="error">{errors?.Districts?.lookupname}</p>
                </div>
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
                  <p className="error text-white">text</p>
                </div>
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
                    options={selectLokups?.Divisions} onChange={(e) => drawrInptChng('Districts', 'ParentLookup', e)} value={drawerIpnuts?.Districts?.ParentLookup} />
                  {/* <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} /> */}
                  <p className="error">{errors?.Districts?.parentLookup}</p>
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
              pagination={{ pageSize: 10 }}
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
      <MyDrawer title='Divisions' open={drawerOpen?.Divisions} isPagination={true} isContact={true}
        onClose={() => openCloseDrawerFtn('Divisions')}
        add={() => {
          if (!validateForm('Divisions')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Divisions, 'Data inserted successfully:', 'Data did not insert:', () => {
            resetCounteries('Divisions')
            dispatch(getAllLookups())
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
                  <MySelect placeholder='Select County'
                    onChange={(e) => drawrInptChng('Divisions', 'Parentlookup', e)}
                    isSimple={true} options={selectLokups?.Counteries}
                    value={drawerIpnuts?.Divisions?.Parentlookup}
                  />
                  <p className="error">{errors?.Divisions?.parentLookup}</p>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Divisions', 'code', e.target.value)}
                    value={drawerIpnuts?.Divisions?.code} />
                  {/* <h1 className="error-text"></h1> */}
                  <p className="error">{errors?.Divisions?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Division : </p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Divisions', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Divisions?.lookupname}
                  />
                  <h1 className="error-text">{errors?.Divisions?.lookupname}</h1>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Divisions', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Divisions?.DisplayName} />
                </div>
                <p className="error text-white">text</p>
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
              pagination={{ pageSize: 10 }}
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
        isPagination={true} onClose={() => openCloseDrawerFtn('Station')}
        add={() => {
          if (!validateForm('Station')) return;
          insertDataFtn(`/lookup`, drawerIpnuts?.Station,
            'Data inserted successfully:', 'Data did not insert:',
            () => {
              resetCounteries('Station')
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
                  <p className="error text-white">txt</p>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Station', 'code', e.target.value)}
                    value={drawerIpnuts?.Station?.code} />
                  <h1 className="error-text">{errors?.Station?.code}</h1>
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
                    onChange={(e) => drawrInptChng('Station', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Station?.lookupname}
                  />
                  <p className="error">{errors?.Station?.lookupname}</p>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Station', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Station?.DisplayName} />
                  <p className="error text-white">text</p>
                </div>
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
                    value={drawerIpnuts?.Station?.Parentlookup}
                    onChange={(e) => drawrInptChng('Station', 'Parentlookup', e)}
                  />
                  {/* <Input className="inp" onChange={(e) => drawrInptChng('Counteries', 'DisplayName', e.target.value)} value={drawerIpnuts?.Counteries?.DisplayName} /> */}
                  <p className="error">{errors?.Station?.parentLookup}</p>
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
                  <Input className="inp"
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

                  <Input className="inp"
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
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
          if (!validateForm('Gender')) return;
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
            if (!validateForm('Gender')) return;
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
                  <p className="error">{errors?.Gender?.code}</p>
                </div>
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
                  <p className="error">{errors?.Gender?.lookupname}</p>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Gender', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Gender?.DisplayName} />
                  <p className="error"></p>
                </div>
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
                    onChange={(e) => drawrInptChng('LookupType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Gender?.isactive}
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
                    onChange={(e) => drawrInptChng('LookupType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Gender?.isactive}
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
                  <p className="error">{errors?.Title?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Title Name</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con d-flex flex-column">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Title', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.Title?.lookupname}
                  />
                  <p className="error">{errors?.Title?.lookupname}</p>
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
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('Title', 'DisplayName', e.target.value)}
                    value={drawerIpnuts?.Title?.DisplayName} />
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
                  <Checkbox
                    onChange={(e) => drawrInptChng('Title', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Title?.isactive}
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
          if (!validateForm('MaritalStatus')) return;
          await insertDataFtn(
            `${baseURL}/lookup`, // Ensure consistency with baseURL
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
            `${baseURL}/lookup`, // Ensure consistency
            drawerIpnuts?.MaritalStatus,
            () => resetCounteries('MaritalStatus', () => dispatch(getAllLookups()))
          );
          IsUpdateFtn('MaritalStatus', false);
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
                      // drawrInptChng('Lookup', 'Parentlookup', String(value))
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
                  <p className="error">{errors?.MaritalStatus?.code}</p>
                </div>
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
                  <p className="error">{errors?.MaritalStatus?.lookupname}</p>
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
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
                    onChange={(e) => drawrInptChng('Title', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isactive}
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
                    onChange={(e) => drawrInptChng('ProjectTypes', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isactive}
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
                    onChange={(e) => drawrInptChng('ProjectTypes', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isactive}
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
                  <Input className="inp"
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
                  <Input className="inp"
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
                  <Checkbox
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
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
                    className="inp" onChange={(e) => drawrInptChng('Schemes', 'code', e.target.value)}
                    value={drawerIpnuts?.Schemes?.code}
                  />
                  <p className="error">{errors?.Schemes?.code}</p>
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
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
                    className="inp" onChange={(e) => drawrInptChng('Reasons', 'code', e.target.value)}
                    value={drawerIpnuts?.Reasons?.code}
                  />
                  <p className="error">{errors?.Reasons?.code}</p>
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
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
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
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
                  <Input className="inp"
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
                  <Input className="inp"
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
                  <Checkbox
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
                    onChange={(e) => drawrInptChng('Ranks', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.MaritalStatus?.isactive}
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
                  <Input className="inp"
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
                  <Input className="inp"
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
                  <Checkbox
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
                  <Input className="inp"
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
                  <Input className="inp"
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
                  <Checkbox
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
          <div className="mb-4 pb-4">
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
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Code:</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input
                    className="inp" onChange={(e) => drawrInptChng('CorrespondenceType', 'code', e.target.value)}
                    value={drawerIpnuts?.CorrespondenceType?.code}
                  />
                  <p className="error">{errors?.CorrespondenceType?.code}</p>
                </div>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p>Correspondence Type</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    onChange={(e) => drawrInptChng('CorrespondenceType', 'lookupname', e.target.value)}
                    value={drawerIpnuts?.CorrespondenceType?.lookupname}
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
                  <Input className="inp"
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
                  <Checkbox
                    onChange={(e) => drawrInptChng('CorrespondenceType', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.CorrespondenceType?.isactive}
                  >Active</Checkbox>
                </div>
              </div>
            </div>
          </div>
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

      <MyDrawer title='Marital Status'
        open={drawerOpen?.MaritalStatus}
        isPagination={true} onClose={() => {
          openCloseDrawerFtn('MaritalStatus')
        }}
        add={async () => {
          if (!validateForm('MaritalStatus')) return;
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
            if (!validateForm('MaritalStatus')) return;
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
                  <p className="error">{errors?.MaritalStatus?.code}</p>
                </div>
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
                  <p className="error">{errors?.MaritalStatus?.lookupname}</p>
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
                    onChange={(e) => drawrInptChng('MaritalStatus', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.Gender?.isactive}
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
          if (!validateForm('SpokenLanguages')) return;
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
            if (!validateForm('SpokenLanguages')) return;
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
                  <p className="error">{errors?.SpokenLanguages?.code}</p>
                </div>
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
                  <p className="error">{errors?.SpokenLanguages?.lookupname}</p>
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
                    onChange={(e) => drawrInptChng('SpokenLanguages', 'isactive', e.target.checked)}
                    checked={drawerIpnuts?.SpokenLanguages?.isactive}
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
            { 'region': drawerIpnuts?.Solicitors },
            'Data inserted successfully',
            'Data did not insert',
            () => resetCounteries('Solicitors', () => dispatch(getAllLookups()))
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
                  <MySelect isSimple={true} placeholder='Select Contact type'
                    disabled={true} value={drawerIpnuts?.Solicitors?.ContactTypeID}
                  />
                  <h1 className="error-text"></h1>
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Name :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input className="inp"
                    value={drawerIpnuts?.Solicitors?.ContactName}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactName', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Email :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactEmail}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactEmail', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Phone :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactPhone}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactPhone', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Building or House :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactAddress?.BuildingOrHouse}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.BuildingOrHouse', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Street or Road :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactAddress?.StreetOrRoad}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.StreetOrRoad', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Area or Town :</p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactAddress?.AreaOrTown}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.AreaOrTown', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>County, City or Postcode :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactAddress?.CityCountyOrPostCode}
                    onChange={(e) => drawrInptChng('Solicitors', 'ContactAddress.CityCountyOrPostCode', e.target.value)}
                  />
                </div>
                <p className="error"></p>
              </div>
            </div>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container" style={{ width: "25%" }}>
                <p>Eircode :</p>
              </div>
              <div className="inpt-con">
                <p className="star">*</p>
                <div className="inpt-sub-con">
                  <Input value={drawerIpnuts?.Solicitors?.ContactAddress?.Eircode}
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
    // </div>
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