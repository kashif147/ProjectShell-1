/** @format */

import { React, useEffect, useState } from "react";

import {
  Tabs,
  message,
  Button,
  Radio,
  Divider,
  DatePicker,
  Table,
  Space,
} from "antd";
import {
  LoadingOutlined,
  UploadOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import MySelect from "../common/MySelect";
import { Input, Row, Col, Checkbox, Dropdown, Upload } from "antd";
import moment from "moment";
import MyDrawer from "./MyDrawer";
import { useLocation } from "react-router-dom";
import { getAllLookups } from "../../features/LookupsSlice";
import { useSelector, useDispatch,shallowEqual } from 'react-redux'
import { useTableColumns } from "../../context/TableColumnsContext ";
import "../../styles/MyDetails.css";
import { BsThreeDots } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { useForm } from "react-hook-form";
import MyDatePicker from "./MyDatePicker";
import { FaRegCircleQuestion } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { AiFillDelete } from "react-icons/ai";
import MyTransfer from "./MyTransfer";
import { insertDataFtn } from "../../utils/Utilities";
import { getPartners } from "../../features/PartnersSlice";
import { getChildren } from "../../features/ChildrenSlice";
import { baseURL } from "../../utils/Utilities";
import axios from "axios";
const { TextArea } = Input;

const CheckboxGroup = Checkbox.Group;
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};

const plainOptions = ["Male", "Female", "Other"];
const options = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other", title: "Other" },
];
const optionsWithDisabled = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other", disabled: true },
];

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
};

function MyDeatails() {
  const dispatch = useDispatch();
  const { ProfileDetails, topSearchData, rowIndex, lookupsData, lookupsForSelect, selectLokups } = useTableColumns();
  const { partner, partnerloading, error } = useSelector((state) => state.partner, shallowEqual);
  const { children, childrenError, childrenLoading } = useSelector((state) => state.children, shallowEqual);
  console.log(selectLokups, "partner")
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [InfData, setInfData] = useState();
  const [InfDataPartner, setInfDataPartner] = useState({
    "profileId": "67a1b268a203d65ec4a553e2",
    "maidenName": "",
    "dateOfBirth": "",
    "deceased": false,
    "dateOfDeath": "",
    "title": "",
    "forename": "",
    "surname": ""
  });

  const [iserrors, setIsErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const validateForm = () => {
    let newErrors = {};
    if (!InfDataPartner.title) newErrors.title = "Title Required";
    if (!InfDataPartner.forename) newErrors.forename = "ForeName Required";
    if (!InfDataPartner.surname) newErrors.surname = "SurName Required";
    if (!InfDataPartner.maidenName)
      newErrors.maidenName = "Maiden Name Required";
    if (!InfDataPartner.dateOfBirth)
      newErrors.dateOfBirth = "Date Of Birth Required";
    if (!InfDataPartner.dateMarriage)
      newErrors.dateMarriage = "Date Marriage Required";
    if (!InfDataPartner.dateOfDeath)
      newErrors.dateOfDeath = "Date of Death Required";

    setIsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPartner = (e) => {
    e.preventDefault();
    setSubmitted(true); // Track form submission attempt
    if (validateForm()) {
      console.log("Form Data:", InfDataPartner);

      insertDataFtn(
        "/partner",
        InfDataPartner,
        "Partner added successfully",
        "Failed to submit data", // Failure notification
        () => {
          dispatch(getPartners())
          setInfDataPartner({
            "profileId": "67a1b268a203d65ec4a553e2",
            "maidenName": "",
            "dateOfBirth": "",
            "deceased": false,
            "dateOfDeath": "",
            "title": "",
            "forename": "",
            "surname": ""
          })
        }
      );
    } else {
      console.log("Form data is invalid!");
      alert("Please fill all required fields correctly.");
    }
  };
  // children

  const [childrenData, setChildrenData] = useState({
    profileId: "67a1b268a203d65ec4a553e2",
    title: "",
    forename: "",
    surname: "",
  });
  const [childrenerror, setChildrenError] = useState({});
  const validateChildren = () => {
    let newErrors = {};
    if (!childrenData.title) newErrors.title = "title Required";
    if (!childrenData.forename) newErrors.forename = "forename Required";
    if (!childrenData.surname) newErrors.surname = "surname Required";

    setChildrenError(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleInputChangeChildren = (e) => {
    const { name, value } = e.target;
    setChildrenData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setChildrenError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleSubmitChildren = (e) => {
    e.preventDefault();

    if (!validateChildren()) {
      console.error("Form data is invalid!");
      return;
    }
    insertDataFtn(
      "/children",
      childrenData,
      "Partner added successfully",
      "Failed to submit data", // Failure notification
      () => {
        dispatch(getChildren());
      }
    );



    setChildrenData({});
    setChildrenError({});
  };
  const location = useLocation();
  const profileData = location?.state;
  const [activeTab, setActiveTab] = useState("1");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [value, setValue] = useState(1);
  const [isTransfer, setisTransfer] = useState(false);
  const [isRank, setisRank] = useState(false);
  const [isDuty, setisDuty] = useState(false);
  const [TransferData, setTransferData] = useState({
    NewStationID: "",
    NewStationName: "",
    NewStationAddress: "",
    NewDistrict: "",
    NewDivision: "",
    TransferDate: "",
    TransferMemo: "",
  });

  const [RankData, setRankData] = useState({
    CurrentRank: "",
    NewlyAssignedRank: "",
  });

  const [DutyData, setDutyData] = useState({
    CurrentDuty: "",
    NewlyAssignedDuty: "",
  });

  const [modalOpenData, setmodalOpenData] = useState({
    Partnership: false,
    Children: false,
    TransferScreen: false,
    criticalIllnessScheme: false,
    GardaReviews: false,
    Committees: false,
    PartnerLifeAssuranceClaim: false,
    GardaLifeAssuranceClaim: false,
    GardaLegalAidScheme: false,
  });

  const openCloseModalsFtn = (key) => {
    setmodalOpenData((prevState) => ({
      ...prevState,
      [key]: !modalOpenData[key],
    }));
  };
  const handleInputPartnerChange = (eventOrName, value) => {
    if (eventOrName && eventOrName.target) {
      const { name, type, checked } = eventOrName.target;
      setInfDataPartner((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : eventOrName.target.value,
      }));
    } else {
      setInfDataPartner((prev) => ({
        ...prev,
        [eventOrName]: moment.isMoment(value)
          ? value.format("DD/MM/YYYY")
          : value,
      }));
    }
    setIsErrors((prev) => ({ ...prev, [eventOrName]: "" }));
  };
  const handleInputChange = (name, value) => {
    setTransferData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange1 = (name, value) => {
    setRankData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange2 = (name, value) => {
    setDutyData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChange = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setLoading(false);
      setImageUrl(info.file.response.url);
      message.success("Image uploaded successfully");
    } else if (info.file.status === "error") {
      setLoading(false);
      message.error("Image upload failed.");
    }
  };

  useEffect(() => {
    if (!ProfileDetails?.length) return; // Exit early if ProfileDetails is empty
  
    const profileData = ProfileDetails[0];
  
    const profils = {
      gardaRegNo: profileData?.regNo,
      fullname: profileData?.fullName,
      forename: profileData?.forename,
      surname: profileData?.surname,
      dateOfBirth: profileData?.dateOfBirth,
      dateRetired: profileData?.dateRetired === "N/A" ? null : profileData?.dateRetired,
      dateAged65: profileData?.dateAged65,
      isDeceased: profileData?.dateOfDeath !== "N/A",
      dateOfDeath: profileData?.dateOfDeath === "N/A" ? null : profileData?.dateOfDeath,
      Partnership: profileData?.Partnership,
      stationPh: profileData?.stationPhone,
      District: profileData?.district,
      Division: profileData?.division,
      isPensioner: !!profileData?.pensionNo,
      pensionNo: profileData?.pensionNo,
      duty: profileData?.duty,
      rank: profileData?.rank,
      graduated: profileData?.graduated,
      isGRAMember: !!profileData?.graMember,
      dateJoined: profileData?.dateJoined,
      isJoined: true,
      attested: profileData?.attested,
      DateLeft: profileData?.dateLeft,
      isLeft: true,
      isAssociateMember: profileData?.associateMember === "yes",
    };
  
    setInfData(profils);
  }, [ProfileDetails?.length]); // Dependency optimized
  
  useEffect(() => {
    dispatch(getPartners());
    dispatch(getChildren());
    dispatch(getAllLookups())
  }, [dispatch]); // ✅ No change needed here
  
  
  const handleInputChangeWhole = (field, value) => {
    setInfData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    return () => {
      setInfData({});
    };
  }, [location?.pathname]);
  const [personalInfoChecked, setPersonalInfoChecked] = useState(false);

  const [graInfoChecked, setGraInfoChecked] = useState(false);

  const [membershipInfoChecked, setMembershipInfoChecked] = useState(false);

  const handlePersonalInfoChange = (event) => {
    setPersonalInfoChecked(event.target.checked);
  };

  const handleGraInfoChange = (event) => {
    setGraInfoChecked(event.target.checked);
  };

  const handleMembershipInfoChange = (event) => {
    setMembershipInfoChecked(event.target.checked);
  };

  const options = [
    {
      label: "Male",
      value: "Male",
    },
    {
      label: "Female",
      value: "Female",
    },
    {
      label: "Not Specified",
      value: "Not Specified",
      title: "Not Specified",
    },
  ];

  const optionsWithDisabled = [
    {
      label: "Male",
      value: "Male",
    },
    {
      label: "Female",
      value: "Female",
    },
    {
      label: "Not Specified",
      value: "Not Specified",
      disabled: false,
    },
  ];

  const [value1, setValue1] = useState("Male");
  const [value2, setValue2] = useState("Male");
  const [value3, setValue3] = useState("Male");
  const [value4, setValue4] = useState("Male");

  const onChange1 = ({ target: { value } }) => {
    console.log("radio1 checked", value);
    setValue1(value);
  };
  const onChange2 = ({ target: { value } }) => {
    console.log("radio2 checked", value);
    setValue2(value);
  };
  const onChange3 = ({ target: { value } }) => {
    console.log("radio3 checked", value);
    setValue3(value);
  };
  const onChange4 = ({ target: { value } }) => {
    console.log("radio4 checked", value);
    setValue4(value);
  };

  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };
  const inputsChangeFtn = () => { };
  const onCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const handleNext = () => {
    setActiveTab("2"); // Switch to the second tab (Official Information)
  };

  const TransferOpenCloseFtn = () => setisTransfer(!isTransfer);
  const RankOpenCloseFtn = () => setisRank(!isRank);
  const DutyOpenCloseFtn = () => setisDuty(!isDuty);

  const AddTransferFtn = () => {
    // Lgenderogic for adding
    console.log(TransferData);
  };

  const AddRankFtn = () => {
    // Logic for adding gender
    console.log(RankData);
  };

  const AddDutyFtn = () => {
    // Logic for adding gender
    console.log(DutyData);
  };
  function getNextBirthdayAge(birthDateStr) {
    // Parse the birth date in DD/MM/YYYY format using Moment.js
    const birthDate = moment(birthDateStr, "DD/MM/YYYY");

    // Get today's date
    const today = moment();

    // Create the next birthday date for the current year
    let nextBirthday = moment(birthDate).year(today.year());

    // If the birthday has passed this year, move it to next year
    if (today.isAfter(nextBirthday)) {
      nextBirthday.add(1, "years");
    }

    // Calculate the age on the next birthday
    const ageNextBirthday = nextBirthday.year() - birthDate.year();

    return ageNextBirthday;
  }
  const [regionByParntTyp, setregionByParntTyp] = useState({
    Districts: [],
    station: [],
  })
  const getRegionsByTypAndPrntId = async (data, callback) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');

      // Make the API request
      const response = await axios.get(`${baseURL}/region/RegionTypeID/${data?.RegionTypeID}/ParentRegion/${data?.ParentRegion}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
          'Content-Type': 'application/json',
        },
      });

      // Check if the RegionTypeID matches and the response status is OK (200)
      if (response.status === 200 && data?.RegionTypeID === "671822bca0072a28aab883e7") {
        setregionByParntTyp(prev => ({
          ...prev,
          Districts: response.data?.map(i => ({
            key: i?._id,
            label: i?.RegionName
          })),
        }));
      }

      // In case the resource is not found, handle the 404 status code as necessary
      if (response.status === 404 && data?.RegionTypeID === "671822bca0072a28aab883e7") {
        setregionByParntTyp(prev => ({
          ...prev,
          Districts: [], // You may want to set an empty array or some other value
        }));
      }

      if (data?.RegionTypeID === "671822c6a0072a28aab883e9") {
        if (response.status === 200) {
          setregionByParntTyp(prev => ({
            ...prev,
            station: response.data?.map(i => ({
              key: i?._id,
              label: i?.RegionName
            })),
          }));
        }
      }

      // If there's a callback, pass the response data to it
      if (callback) {
        callback(null, response.data); // Assuming the callback handles success with (error, data)
      }

      return response.data; // Assuming the API returns an array of regions

    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };


  const [ageOnNextBirthday, setAgeOnNextBirthday] = useState(null);

  // let ageOnNextBirthday = getNextBirthdayAge(InfData?.dateOfBirth);
  useEffect(() => {
    if (!InfData?.dateOfBirth) return;
  
    const age = getNextBirthdayAge(InfData.dateOfBirth);
    setAgeOnNextBirthday((prevAge) => (prevAge !== age ? age : prevAge));
  }, [InfData?.dateOfBirth]);
  const customRequest = ({ file, onSuccess, onError }) => {
    setTimeout(() => {
      if (file) {
        onSuccess({ url: URL.createObjectURL(file) }, file);
      } else {
        onError(new Error("Upload failed."));
      }
    }, 1000);
  };
  const childrencolumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Forename",
      dataIndex: "forename",
      key: "forename",
    },
    {
      title: "Surname",
      dataIndex: "surname",
      key: "surname",
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <FaRegCircleQuestion
            size={16}
            style={{ marginRight: "8px" }}
          />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size='middle'>
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const partnershipColumns = [
    {
      title: "Name",
      // dataIndex: "gardaRegNo",
      // key: "gardaRegNo",
      render: (items, index) => (
        <>
          {items?.forename} {items?.surname}
        </>
      )
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Date Marriage",
      dataIndex: "dateMarriage",
      key: "dateMarriage",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Date of Death",
      dataIndex: "dateOfDeath",
      key: "dateOfDeath",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Maiden Name",
      dataIndex: "maidenName",
      key: "maidenName",
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <FaRegCircleQuestion
            size={16}
            style={{ marginRight: "8px" }}
          />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size='middle'>
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const GardaReviewColumns = [
    {
      title: "Start Date",
      dataIndex: "gardaRegNo",
      key: "gardaRegNo",
    },
    {
      title: "End Date",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Notese",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <FaRegCircleQuestion
            size={16}
            style={{ marginRight: "8px" }}
          />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size='middle'>
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const [drawer, setdrawer] = useState(false);
  const criticalIllnessSchemeClm = [
    {
      title: "Claim Type",
      dataIndex: "gardaRegNo",
      key: "gardaRegNo",
    },
    {
      title: "Claim Reason",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Claim Date",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: "Beneficiary",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: "Child Name",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: "Partner Name",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <FaRegCircleQuestion
            size={16}
            style={{ marginRight: "8px" }}
          />
          Action
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size='middle'>
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];

  const PartnerLifeAssuranceClaimClm = [
    {
      title: "Transfer Date",
      dataIndex: "gardaRegNo",
      key: "gardaRegNo",
    },
    {
      title: "Station From",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "Station To",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: "Notes",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          Action
          <FaRegCircleQuestion
            size={16}
            style={{ marginRight: "8px" }}
          />
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size='middle'>
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const CommitteesColumns = [
    {
      title: "Committee",
      dataIndex: "gardaRegNo",
      key: "gardaRegNo",
    },
    {
      title: "Start Date",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : ""),
    },
    {
      title: "End Date",
      dataIndex: "Notes",
      key: "Notes",
    },
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          Action
          <FaRegCircleQuestion
            size={16}
            style={{ marginRight: "8px" }}
          />
        </div>
      ),
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size='middle'>
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const onSubmit = (data) => console.log(data);
  const handleButtonClick = (e) => {
    message.info("Click on left button.");
    console.log("click left button", e);
  };
  const handleMenuClick = (e) => {
    message.info("Click on menu item.");
    console.log("click", e);
  };
  const items = [
    {
      label: "1st menu item",
      key: "1",
      icon: <UserOutlined />,
    },
    {
      label: "2nd menu item",
      key: "2",
      icon: <UserOutlined />,
    },
    {
      label: "3rd menu item",
      key: "3",
      icon: <UserOutlined />,
      danger: true,
    },
    {
      label: "4rd menu item",
      key: "4",
      icon: <UserOutlined />,
      danger: true,
      disabled: true,
    },
  ];
  const menuProps = {
    items,
    onClick: handleMenuClick,
  };
  const props = {
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    onChange({ file, fileList }) {
      if (file.status !== "uploading") {
        console.log(file, fileList);
      }
    },
    defaultFileList: [
      {
        uid: "1",
        name: "khan.png",
        status: "done",
        url: "http://www.bise.com/khan.png",
        percent: 33,
      },
      {
        uid: "2",
        name: "Error",
        status: "done",
        url: "http://www.bise.com/yyy.png",
      },
      {
        uid: "3",
        name: "zzz.png",
        status: "uploading",
        // custom error message to show
        url: "http://www.bise.com/zzz.png",
      },
    ],
  };
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='details-container'>
        <div className='details-con-header1'>
          <Row>
            <Col span={8}>
              <div className='details-con-header'>
                <h2>Personal Information</h2>
              </div>
              <div className='detail-sub-con detail-sub-con-ist'>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Title :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con'>
                      <MySelect
                        placeholder='Select Title'
                        isSimple={true}
                        options={lookupsForSelect?.Titles}
                      />
                      <h1 className='error-text'></h1>
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Forename :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='input-sub-con'>
                      <Input
                        className='input'
                        value={InfData?.forename}
                      />
                      <h1 className='error-text'></h1>
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Surname :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <Input
                      className='input'
                      value={InfData?.surname}
                      {...register("exampleRequired", { required: true })}
                    />
                  </div>
                </div>
                <div className='lbl-inpt gender-container'>
                  <div className='title-cont gender-title-con'>
                    <p className=' '>Gender :</p>
                  </div>
                  <div className='input-cont gender-inpt'>
                    <p className='star-white'>*</p>
                    <div className='input'>
                      <Radio.Group
                        options={optionsWithDisabled}
                        onChange={onChange4}
                        value={value4}
                        optionType='button'
                        buttonStyle='solid'
                      />
                    </div>
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Date of Birth :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <DatePicker
                      style={{ width: "100%", borderRadius: "3px" }}
                      value={
                        InfData?.dateOfBirth
                          ? moment(InfData.dateOfBirth, "DD/MM/YYYY")
                          : null
                      } // Convert string to moment
                      onChange={(date, dateString) => {
                        handleInputChangeWhole(
                          "dateOfBirth",
                          date ? date.format("DD/MM/YYYY") : null
                        ); // Pass the string value
                      }}
                      format='DD/MM/YYYY'
                    />
                    <p className='ag-65-title'>{`${ageOnNextBirthday} Yrs`}</p>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Date Aged 65 :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <MyDatePicker
                      value={
                        InfData?.dateAged65
                          ? moment(InfData?.dateAged65, "DD/MM/YYYY")
                          : null
                      }
                      disabled={true}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Deceased :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='checkbox-con'>
                      <div className='checkbox-sub'>
                        <Checkbox
                          checked={InfData?.isDeceased}
                          onChange={(e) => {
                            handleInputChangeWhole(
                              "deceased",
                              e.target.checked
                            );
                            // if (e.target.checked == false) {
                            //   handleInputChangeWhole('dateOfDeath', null);
                            // }
                          }}
                        />
                      </div>
                      <MyDatePicker
                        className='w-100 date-picker-custom'
                        value={
                          InfData?.dateOfDeath
                            ? moment(InfData?.dateOfDeath, "DD/MM/YYYY")
                            : null
                        }
                        disabled={!InfData?.isDeceased}
                      />
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Partnership :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      className='input'
                      value={InfData?.Partnership}
                    />
                    <Button
                      onClick={() => openCloseModalsFtn("Partnership")}
                      className='primary-btn butn ms-2 detail-btn'>
                      +
                    </Button>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Children :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      className='input'
                      value={InfData?.gardaRegNo}
                    />
                    <Button
                      onClick={() => openCloseModalsFtn("Children")}
                      className='primary-btn butn ms-2 detail-btn'>
                      +
                    </Button>
                  </div>
                </div>
                <Divider>Correspondence Details</Divider>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Email :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <Input className='input' />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Mobile :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <Input
                      className='input'
                      placeholder='000-000-0000'
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Other Contact :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      className='input'
                      placeholder='000-000-0000'
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Building or House :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <Input className='input' />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Street or Road :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input className='input' />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Area or Town :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>

                    <Input className='input' />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>County, City or ZIP :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <MySelect
                      placeholder='Select City'
                      isSimple={true}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Eircode :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input className='input' />
                  </div>
                </div>
              </div>
            </Col>

            <Col span={8}>
              <div className='details-con-header'>
                <h2>Professional Details</h2>
              </div>
              <div className='detail-sub-con'>
                {/* <div className="lbl-inpt">
                <p className="lbl">Station :</p>
                <p className="star">*</p>
                <Input value={InfData?.gardaRegNo} suffix={<BsThreeDots />} />
                <Button className="butn primary-btn ">Tr</Button>
              </div> */}
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Station :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div style={{ display: "flex", width: "100%" }}>
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
                      <MySelect
                        placeholder='Select Station'
                        isSimple={true}
                        options={regionByParntTyp?.station}
                      // onChange={(e)=>getRegionsByTypAndPrntId({RegionTypeID:'671822bca0072a28aab883e7',ParentRegion:e})}
                      />
                    </div>
                    <Button
                      className='butn primary-btn detail-btn ms-2'
                      onClick={() => openCloseModalsFtn("TransferScreen")}>
                      Tr
                    </Button>
                  </div>
                </div>
                <div className='lbl-txtarea-2'>
                  <div className='title-cont-txtarea'>
                    <p className=''></p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <TextArea
                      rows={3}
                      style={{
                        width: "100%",
                        borderRadius: "3px",
                        borderColor: "D9D9D9",
                      }}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Station Phone : </p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input value={InfData?.gardaRegNo} />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>District :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <MySelect
                      placeholder='Select District'
                      isSimple={true}
                      options={regionByParntTyp?.Districts}
                      onChange={(e) => getRegionsByTypAndPrntId({ RegionTypeID: '671822c6a0072a28aab883e9', ParentRegion: e })}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Division :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <MySelect
                      placeholder='Select Division'
                      isSimple={true}
                      options={selectLokups?.Divisions}
                      onChange={(e) => getRegionsByTypAndPrntId({ RegionTypeID: '671822bca0072a28aab883e7', ParentRegion: e })}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Retired :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <div className='checkbox-con'>
                      <div
                        style={{
                          backgroundColor: "white",
                          marginRight: "8px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Checkbox
                          onChange={(e) => {
                            handleInputChangeWhole(
                              "isPensioner",
                              e.target.checked
                            );
                          }}
                          checked={InfData?.isPensioner}
                        />
                      </div>
                      <MyDatePicker
                        disabled={!InfData?.isPensioner}
                        onChange={(date, dateString) => {
                          handleInputChangeWhole(
                            "dateRetired",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        value={
                          InfData?.dateRetired
                            ? moment(InfData?.dateRetired, "DD/MM/YYYY")
                            : null
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Pension No :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <Input
                      type='text'
                      placeholder='Enter something...'
                      disabled={!InfData?.isPensioner}
                      value={InfData?.pensionNo}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Rank :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                      Select Rank
                    </Dropdown.Button> */}
                    <MySelect
                      placeholder='Select Rank'
                      isSimple={true}
                      options={lookupsForSelect?.Ranks}
                    />
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className='lbl'>Duty:</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    {/* <Dropdown.Button menu={menuProps} className="custom-dropdown-button" onClick={handleButtonClick}>
                      Select Duty
                    </Dropdown.Button> */}
                    <MySelect
                      placeholder='Select Duty'
                      isSimple={true}
                      options={lookupsForSelect?.Duties}
                    />
                  </div>
                </div>
                <Divider>Training Details</Divider>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Templemore :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <MyDatePicker
                      className='date-picker'
                      isSimple={true}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Class :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <Input />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Attested :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <MyDatePicker
                      style={{ width: "100%", borderRadius: "3px" }}
                    />
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Graduation :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <MyDatePicker className='date-picker' />
                  </div>
                </div>
                <div className='lbl-txtarea-2'>
                  <div className='title-cont-txtarea'>
                    <p className=''>Notes</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <TextArea
                      rows={5}
                      style={{
                        width: "100%",
                        borderRadius: "3px",
                        borderColor: "D9D9D9",
                      }}
                    />
                  </div>
                </div>
              </div>
            </Col>
            <Col span={8}>
              <div className='details-con-header'>
                <h2>Membership & Subscriptions</h2>
              </div>
              <div className='detail-sub-con'>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Reg No :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div
                      style={{
                        display: "flex",
                        width: "100%",
                        alignItems: "baseline",
                      }}>
                      <div className='input-container-with-sup'>
                        <Input
                          placeholder='Enter text'
                          style={{
                            padding: "0px",
                            width: "100%",
                            borderRight: "1px solid #d9d9d9",
                            borderRadius: "4px 0 0 4px",
                            padding: "0px",
                            paddingLeft: "5px",
                            margin: "0px",
                            height: "33px",
                          }} // Adjust border style
                          suffix={
                            <div className='suffix-container'>
                              <IoSettingsOutline />
                            </div>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Date Joined :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <div className='checkbox-con'>
                      <div className='checkbox-sub'>
                        <Checkbox
                          onChange={(e) =>
                            handleInputChangeWhole("isJoined", e.target.checked)
                          }
                          checked={InfData?.isJoined}
                        />
                      </div>
                      <MyDatePicker
                        className='w-100 date-picker-custom'
                        onChange={(date, dateString) => {
                          handleInputChangeWhole(
                            "dateJoined",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        value={
                          InfData?.dateJoined
                            ? moment(InfData?.dateJoined, "DD/MM/YYYY")
                            : null
                        }
                        disabled={!InfData?.isJoined}
                      />
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Date Left :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <div className='checkbox-con'>
                      <div className='checkbox-sub'>
                        <Checkbox
                          onChange={(e) =>
                            handleInputChangeWhole("isLeft", e.target.checked)
                          }
                          checked={InfData?.isLeft}
                        />
                      </div>
                      <MyDatePicker
                        className='w-100 date-picker-custom'
                        disabled={!InfData?.isLeft}
                        onChange={(date, dateString) => {
                          handleInputChangeWhole(
                            "isLeft",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        value={
                          InfData?.dateAged65
                            ? moment(InfData?.dateAged65, "DD/MM/YYYY")
                            : null
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Reason (Left) :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    {/* <MySelect isSimple={true} /> */}
                    <Input disabled={!InfData?.isLeft} />
                  </div>
                </div>

                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Associate Member :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star-white'>*</p>
                    <div className='checkbox-con'>
                      <div
                        style={{
                          backgroundColor: "white",
                          marginRight: "8px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}>
                        <Checkbox
                          onChange={onCheckboxChange}
                          checked={InfData?.isPensioner}
                        />
                      </div>
                      <Input
                        type='text'
                        placeholder='Enter something...'
                        disabled={!InfData?.isPensioner}
                        value={InfData?.pensionNo}
                      />
                    </div>
                  </div>
                </div>
                <div className='lbl-inpt'>
                  <div className='title-cont'>
                    <p className=''>Statue :</p>
                  </div>
                  <div className='input-cont'>
                    <p className='star'>*</p>
                    <Input value={InfData?.gardaRegNo} />
                  </div>
                </div>
                <Row style={{ paddingLeft: "12px" }}>
                  <Col span={8}>
                    <Checkbox className='lbl'>District Rep</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>Division Rep</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>C.E.C</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>District Sec</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>Division Sec</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>Panel of Friends</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>Division Chair</Checkbox>
                  </Col>
                  <Col span={8}>
                    <Checkbox className='lbl'>District Chair</Checkbox>
                  </Col>
                </Row>
                <div className='d-flex justify-content-start ms-2'>
                  <div className='sub-com-cont me-4'>
                    <p className='sub-com'>Sub Committees :</p>
                  </div>
                  <div className='me-4'>
                    <Button
                      className='butn primary-btn'
                      onClick={() => openCloseModalsFtn("Committees")}>
                      +
                    </Button>
                  </div>
                </div>
                <div className='d-flex justify-content-center upload-container'>
                  <Upload {...props}>
                    <div
                      className='d-flex
                    '>
                      <p className='star'>*</p>
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </div>
                  </Upload>
                </div>
                <Divider>Subscriptions</Divider>
                <Row style={{ paddingLeft: "12px" }}>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'
                      onChange={() =>
                        openCloseModalsFtn("GardaLifeAssuranceClaim")
                      }>
                      Life Assurance (Member)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'
                      onChange={() =>
                        openCloseModalsFtn("PartnerLifeAssuranceClaim")
                      }>
                      Life Assurance (Partner)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'
                      onChange={() =>
                        openCloseModalsFtn("criticalIllnessScheme")
                      }>
                      Critical Illness (Member)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'>
                      Critical Illness (Partner)
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'>
                      Income Protection
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'>
                      Finance Application
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'>
                      Illness / Injury
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'
                      onChange={() =>
                        openCloseModalsFtn("GardaLegalAidScheme")
                      }>
                      Legal Assistance
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'
                      onChange={() => openCloseModalsFtn("GardaReviews")}>
                      Garda Review
                    </Checkbox>
                  </Col>
                  <Col span={12}>
                    <Checkbox
                      checked={drawer}
                      className='subs-chkbx'>
                      Balloted
                    </Checkbox>
                    <Input style={{ width: "80%" }} />
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Row>
            <Col></Col>
          </Row>
        </div>
        <MyDrawer
          title='Partnership'
          open={modalOpenData?.Partnership}
          add={handleSubmitPartner}
          // handleSubmit={handleSubmitPartner}
          onClose={() => openCloseModalsFtn("Partnership")}>
          <div className='drawer-main-cntainer'>
            <div className='details-drawer mb-4'>
              <p>{InfData?.gardaRegNo}</p>
              <p>{InfData?.fullname}</p>
              <p>Garda</p>
            </div>
            <div className='mb-4 pb-4'>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Title :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <MySelect
                      placeholder='Select Title'
                      isSimple={true}
                      options={lookupsForSelect?.Titles}
                    />
                    {submitted && iserrors.title && (
                      <h1 className='error-text'>{iserrors.title}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Forename :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input
                      className='inp'
                      type='text'
                      name='forename'
                      value={InfDataPartner.forename}
                      onChange={handleInputPartnerChange}
                    />
                    {submitted && iserrors.forename && (
                      <h1 className='error-text'>{iserrors.forename}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Surname :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input
                      className='inp'
                      type='text'
                      name='surname'
                      value={InfDataPartner.surname}
                      onChange={handleInputPartnerChange}
                    />
                    {submitted && iserrors.surname && (
                      <h1 className='error-text'>{iserrors.surname}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Maiden Name :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input
                      className='inp'
                      type='text'
                      name='maidenName'
                      value={InfDataPartner.maidenName}
                      onChange={handleInputPartnerChange}
                    />
                    {submitted && iserrors.maidenName && (
                      <h1 className='error-text'>{iserrors.maidenName}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Date of Birth :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <MyDatePicker
                      className='inp'
                      value={
                        InfDataPartner?.dateOfBirth
                          ? moment(InfDataPartner.dateOfBirth, "DD/MM/YYYY")
                          : null
                      } // Convert string to moment
                      onChange={(date, dateString) => {
                        handleInputPartnerChange(
                          "dateOfBirth",
                          date ? date.format("DD/MM/YYYY") : null
                        ); // Pass the string value
                      }}
                      format='DD/MM/YYYY'
                    />
                    {submitted && iserrors.dateOfBirth && (
                      <h1 className='error-text'>{iserrors.dateOfBirth}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Date Marriage :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <MyDatePicker
                      className='inp'
                      value={
                        InfDataPartner?.dateMarriage
                          ? moment(InfDataPartner.dateMarriage, "DD/MM/YYYY")
                          : null
                      } // Convert string to moment
                      onChange={(date, dateString) => {
                        handleInputPartnerChange(
                          "dateMarriage",
                          date ? date.format("DD/MM/YYYY") : null
                        ); // Pass the string value
                      }}
                      format='DD/MM/YYYY'
                    />
                    {submitted && iserrors.dateMarriage && (
                      <h1 className='error-text'>{iserrors.dateMarriage}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Deceased :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star-white'>*</p>
                  <div className='inpt-sub-con'>
                    <div className='checkbox-con'>
                      <div className='checkbox-sub'>
                        <Checkbox
                          checked={InfDataPartner?.deceased}
                          onChange={(e) => {
                            handleInputPartnerChange(
                              "deceased",
                              e.target.checked
                            );
                            // if (e.target.checked == false) {
                            //   handleInputChangeWhole('dateOfDeath', null);
                            // }
                          }}
                        />
                      </div>
                      <MyDatePicker
                        className='w-100 date-picker-custom'
                        onChange={(date, dateString) => {
                          handleInputPartnerChange(
                            "dateOfDeath",
                            date ? date.format("DD/MM/YYYY") : null
                          ); // Pass the string value
                        }}
                        value={
                          InfDataPartner?.dateOfDeath
                            ? moment(InfDataPartner?.dateOfDeath, "DD/MM/YYYY")
                            : null
                        }
                        disabled={!InfDataPartner?.deceased}
                      />
                    </div>
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              {/* <button
                onClick={handleSubmitPartner}
                type='submit'>
                Submite Button
              </button> */}
            </div>
            <h3>History</h3>
            <Table
              rowSelection={rowSelection} // Enables row selection with checkboxes
              columns={partnershipColumns}
              dataSource={partner}
              loading={partnerloading}
              pagination={false}
              bordered
              className='drawer-tbl'
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
            />
          </div>
        </MyDrawer>
        <MyDrawer
          title='Children'
          open={modalOpenData?.Children}
          add={handleSubmitChildren}
          onClose={() => openCloseModalsFtn("Children")}>
          <div className='drawer-main-cntainer'>
            <div className='details-drawer mb-4'>
              <p>{InfData?.gardaRegNo}</p>
              <p>{InfData?.fullname}</p>
              <p>Garda</p>
            </div>
            <div className='mb-4 pb-4'>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Title :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input
                      type='text'
                      name='title'
                      value={childrenData.title}
                      onChange={handleInputChangeChildren}
                    />
                    {childrenerror.title && (
                      <h1 className='error-text'>{childrenerror.title}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Forename :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input
                      className='inp'
                      type='text'
                      name='forename'
                      value={childrenData.forename}
                      onChange={handleInputChangeChildren}
                    />
                    {childrenerror.forename && (
                      <h1 className='error-text'>{childrenerror.forename}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Surname :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input
                      className='inp'
                      type='text'
                      name='surname'
                      value={childrenData.surname}
                      onChange={handleInputChangeChildren}
                    />
                    {childrenerror.surname && (
                      <h1 className='error-text'>{childrenerror.surname}</h1>
                    )}
                  </div>
                  <p className='error'></p>
                </div>
              </div>
            </div>
            <h3>History</h3>
            <Table
              rowSelection={rowSelection} // Enables row selection with checkboxes
              columns={childrencolumns}
              dataSource={children}
              loading={childrenLoading}
              pagination={false}
              bordered
              className='drawer-tbl'
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
            />
          </div>
        </MyDrawer>
        {/* <MyDrawer
          title='Children'
          open={modalOpenData?.Children}
          onClose={() => openCloseModalsFtn("Children")}>
          <div className='drawer-main-cntainer'>
            <div className='details-drawer mb-4'>
              <p>{InfData?.gardaRegNo}</p>
              <p>{InfData?.fullname}</p>
              <p>Garda</p>
            </div>
            <div className='mb-4 pb-4'>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Title :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input type="text" name="title" />
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Forename :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input className='inp' />
                    <h1 className='error-text'></h1>
                  </div>
                  <p className='error'></p>
                </div>
              </div>
              <div className='drawer-inpts-container'>
                <div className='drawer-lbl-container'>
                  <p>Surname :</p>
                </div>
                <div className='inpt-con'>
                  <p className='star'>*</p>
                  <div className='inpt-sub-con'>
                    <Input className='inp' />
                    <h1 className='error-text'></h1>
                  </div>
                  <p className='error'></p>
                </div>
              </div>
            </div>
            <h3>History</h3>
            <Table
              rowSelection={rowSelection} // Enables row selection with checkboxes
              columns={childrencolumns}
              pagination={false}
              bordered
              className='drawer-tbl'
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
            />
          </div>
        </MyDrawer> */}
        <MyDrawer
          title='Transfer Screen'
          open={modalOpenData?.TransferScreen}
          onClose={() => openCloseModalsFtn("TransferScreen")}>
          <div className='drawer-main-cntainer'>
            <div className='d-flex'>
              <div className='w-50  '>
                <div
                  className='d-flex align-items-center justify-content-center'
                  style={{
                    height: "44px",
                    backgroundColor: "#215E97",
                    color: "white",
                  }}>
                  <h3 className='text-center'>Current</h3>
                </div>
                <div className='body-container'>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Station Code :</p>
                    </div>
                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect
                          placeholder='Select Station Code'
                          isSimple={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Station Name :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts1'>
                    <div className='transfer-inpts-title1'>
                      <p className='transfer-main-inpts-p'></p>
                    </div>

                    <div className='transfer-inputs1'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <TextArea rows={3} />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>District :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='Select District'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Division :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='Select District'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-50 ms-4 '>
                <div
                  className='d-flex align-items-center justify-content-center'
                  style={{
                    height: "44px",
                    backgroundColor: "#215E97",
                    color: "white",
                  }}>
                  <h3 className='text-center'>New</h3>
                </div>
                <div className='body-container'>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Station Code :</p>
                    </div>
                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star'>*</p>
                        <MySelect
                          placeholder='Select Station Code'
                          isSimple={true}
                        />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Station Name :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts1'>
                    <div className='transfer-inpts-title1'>
                      <p className='transfer-main-inpts-p'></p>
                    </div>

                    <div className='transfer-inputs1'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <TextArea rows={3} />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>District :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star'>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='Select District'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Division :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star'>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='Select District'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Transfer Date :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <DatePicker className='w-100' />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts1'>
                    <div className='transfer-inpts-title1'>
                      <p className='transfer-main-inpts-p'>Memo :</p>
                    </div>

                    <div className='transfer-inputs1'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <TextArea rows={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MyDrawer>
        <MyDrawer
          title='Critical Illness Scheme'
          open={modalOpenData?.criticalIllnessScheme}
          onClose={() => openCloseModalsFtn("criticalIllnessScheme")}
          isPyment={true}
          InfData={InfData}
          width='785px'>
          <div className='drawer-main-cntainer'>
            <div className='details-drawer mb-4'>
              <p>{InfData?.gardaRegNo}</p>
              <p>{InfData?.fullname}</p>
              <p>Garda</p>
            </div>
            <div className='d-flex'>
              <div className='w-50  '>
                <div className='body-container'>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Joining Date :</p>
                    </div>
                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MyDatePicker />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Claim Type : </p>
                    </div>
                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='Claim Type'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Claim Date :</p>
                    </div>
                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MyDatePicker />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Child Name :</p>
                    </div>
                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='Select Child Name'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-50 ms-4'>
                <div className='body-container'>
                  <div className='d-flex '>
                    <div className='transfer-main-inpts'>
                      <div className='transfer-inputs'>
                        <div className='d-flex '>
                          <p className='star-white '>*</p>
                          <Checkbox>Member Cover</Checkbox>
                        </div>
                      </div>
                      <div className='transfer-inputs'>
                        <div className='d-flex '>
                          <p className='star-white '>*</p>
                          <Checkbox>Partner Cover</Checkbox>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Claim Reason :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect isSimple={true} />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Beneficiary :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <Input />
                      </div>
                    </div>
                  </div>
                  <div className='transfer-main-inpts'>
                    <div className='transfer-inpts-title'>
                      <p className='transfer-main-inpts-p'>Partner Name :</p>
                    </div>

                    <div className='transfer-inputs'>
                      <div className='d-flex '>
                        <p className='star-white '>*</p>
                        <MySelect
                          isSimple={true}
                          placeholder='N/A'
                        />
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
                className='drawer-tbl'
                rowClassName={(record, index) =>
                  index % 2 !== 0 ? "odd-row" : "even-row"
                }
                rowSelection={rowSelection}
                bordered
              />
            </div>
          </div>
        </MyDrawer>
        <MyDrawer
          title='Garda Reviews'
          open={modalOpenData?.GardaReviews}
          onClose={() => openCloseModalsFtn("GardaReviews")}
          width='725px'>
          <div className='drawer-main-cntainer'>
            <div className='details-drawer mb-4'>
              <p>{InfData?.gardaRegNo}</p>
              <p>{InfData?.fullname}</p>
              <p>Garda</p>
            </div>
            <div className='drawer-inpts-container'>
              <div
                className='drawer-lbl-container'
                style={{ width: "20%" }}>
                <p>Review Start date :</p>
              </div>
              <div className='inpt-con'>
                <p className='star'>*</p>
                <div className='inpt-sub-con'>
                  <MyDatePicker />
                </div>
                <p className='error'></p>
              </div>
            </div>
            <div className='drawer-inpts-container'>
              <div
                className='drawer-lbl-container'
                style={{ width: "20%" }}>
                <p>Review End date :</p>
              </div>
              <div className='inpt-con'>
                <p className='star-white'>*</p>
                <div className='inpt-sub-con'>
                  <MyDatePicker />
                </div>
                <p className='error'></p>
              </div>
            </div>
            <div
              className='drawer-inpts-container'
              style={{ height: "200px" }}>
              <div
                className='inpt-con'
                style={{ width: "80%" }}>
                <p className='star-white'>*</p>
                <div className='inpt-sub-con'>
                  <TextArea
                    rows={6}
                    placeholder='Autosize height based on content lines'
                  />
                </div>
                <p className='error'></p>
              </div>
            </div>
            <div className='mt-4 pt-4'>
              <h5>History</h5>
              <Table
                pagination={false}
                columns={GardaReviewColumns}
                className='drawer-tbl'
                rowClassName={(record, index) =>
                  index % 2 !== 0 ? "odd-row" : "even-row"
                }
                rowSelection={rowSelection}
                bordered
              />
            </div>
          </div>
        </MyDrawer>
        <MyDrawer
          title='Committees'
          open={modalOpenData?.Committees}
          onClose={() => openCloseModalsFtn("Committees")}
          width='576px'>
          <div className='drawer-main-cntainer'>
            <div className='d-flex justify-content-center'>
              <MyTransfer />
            </div>
            <div className=''>
              <h5>History</h5>
              <Table
                pagination={false}
                columns={CommitteesColumns}
                className='drawer-tbl'
                rowClassName={(record, index) =>
                  index % 2 !== 0 ? "odd-row" : "even-row"
                }
                rowSelection={rowSelection}
                bordered
              />
            </div>
          </div>
        </MyDrawer>
        <MyDrawer
          title='Partner Life Assurance Claim'
          open={modalOpenData?.PartnerLifeAssuranceClaim}
          onClose={() => openCloseModalsFtn("PartnerLifeAssuranceClaim")}
          width='837px'>
          <div className='drawer-main-cntainer'>
            <div className=''>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Partner Name :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <MySelect
                          isSimple={true}
                          disabled={true}
                          placeholder='Jane Doe'
                        />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Assured From :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star'>*</p>
                      <div className='inpt-sub-con'>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}></div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'></div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Deceased :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-12'>
                  <div
                    className='drawer-inpts-container'
                    style={{ height: "64px" }}>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "16%" }}>
                      <p>Contact Address :</p>
                    </div>
                    <div
                      className='inpt-con'
                      style={{ width: "81%" }}>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <TextArea
                          rows={2}
                          placeholder='Autosize height based on content lines'
                        />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Fire Reference :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star'>*</p>
                      <div className='inpt-sub-con d-flex'>
                        <Input />
                        <Button className='primary-btn butn ms-2 detail-btn'>
                          +
                        </Button>
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Advance Amount :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con d-flex'>
                        <Input />
                        <Button className='primary-btn butn ms-2 detail-btn'>
                          +
                        </Button>
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Advance Date :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Advance Cheque # :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Cover Level :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input placeholder='0.00' />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Balance Amount :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input placeholder='0.00' />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Balance Date :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Balance Cheque # :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input placeholder='' />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-12'>
                  <div
                    className='drawer-inpts-container'
                    style={{ height: "64px" }}>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "16%" }}>
                      <p>Memo :</p>
                    </div>
                    <div
                      className='inpt-con'
                      style={{ width: "81%" }}>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <TextArea
                          rows={2}
                          placeholder='Autosize height based on content lines'
                        />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-4 pt-2'>
              <h5>History</h5>
              <Table
                pagination={false}
                columns={PartnerLifeAssuranceClaimClm}
                className='drawer-tbl'
                rowClassName={(record, index) =>
                  index % 2 !== 0 ? "odd-row" : "even-row"
                }
                rowSelection={rowSelection}
                bordered
              />
            </div>
          </div>
        </MyDrawer>
        <MyDrawer
          title='Garda Life Assurance Claim'
          open={modalOpenData?.GardaLifeAssuranceClaim}
          isAss={true}
          onClose={() => openCloseModalsFtn("GardaLifeAssuranceClaim")}
          width='837px'>
          <div className='drawer-main-cntainer'>
            <div className=''>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Assured From :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Contact Name :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star'>*</p>
                      <div className='inpt-sub-con'>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}></div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Deceased :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Contact Phone :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <Input />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-12'>
                  <div
                    className='drawer-inpts-container'
                    style={{ height: "64px" }}>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "16%" }}>
                      <p>Contact Address :</p>
                    </div>
                    <div
                      className='inpt-con'
                      style={{ width: "81%" }}>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <TextArea
                          rows={2}
                          placeholder='Autosize height based on content lines'
                        />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Fire Reference :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star'>*</p>
                      <div className='inpt-sub-con d-flex'>
                        <Input />
                        <Button className='primary-btn butn ms-2 detail-btn'>
                          +
                        </Button>
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Advance Amount :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con d-flex'>
                        <Input />
                        <Button className='primary-btn butn ms-2 detail-btn'>
                          +
                        </Button>
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Advance Date :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Advance Cheque # :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
                <div className='col-md-6'>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Cover Level :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input placeholder='0.00' />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Balance Amount :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input placeholder='0.00' />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Balance Date :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <MyDatePicker />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                  <div className='drawer-inpts-container'>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "33%" }}>
                      <p>Balance Cheque # :</p>
                    </div>
                    <div className='inpt-con'>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con '>
                        <Input placeholder='' />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='row'>
                <div className='col-md-12'>
                  <div
                    className='drawer-inpts-container'
                    style={{ height: "64px" }}>
                    <div
                      className='drawer-lbl-container'
                      style={{ width: "16%" }}>
                      <p>Memo :</p>
                    </div>
                    <div
                      className='inpt-con'
                      style={{ width: "81%" }}>
                      <p className='star-white'>*</p>
                      <div className='inpt-sub-con'>
                        <TextArea
                          rows={2}
                          placeholder='Autosize height based on content lines'
                        />
                      </div>
                      <p className='error'></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-4 pt-2'>
              <h5>History</h5>
              <Table
                pagination={false}
                columns={PartnerLifeAssuranceClaimClm}
                className='drawer-tbl'
                rowClassName={(record, index) =>
                  index % 2 !== 0 ? "odd-row" : "even-row"
                }
                rowSelection={rowSelection}
                bordered
              />
            </div>
          </div>
        </MyDrawer>
        <MyDrawer
          title='Garda Legal Aid Scheme'
          open={modalOpenData?.GardaLegalAidScheme}
          onClose={() => openCloseModalsFtn("GardaLegalAidScheme")}
          isAprov={true}
          isPyment={true}
          width='800px'>
          <div>
            <div className='details-drawer mb-4'>
              <p>{InfData?.gardaRegNo}</p>
              <p>{InfData?.fullname}</p>
              <p>Garda</p>
            </div>
            <div className='row'>
              <div className='col-md-6'>
                <div className='drawer-inpts-container'>
                  <div
                    className='drawer-lbl-container'
                    style={{ width: "45%" }}>
                    <p>Claim Type : </p>
                  </div>
                  <div className='inpt-con'>
                    <p className='star-white'>*</p>
                    <div className='inpt-sub-con'>
                      <MyDatePicker />
                    </div>
                    <p className='error'></p>
                  </div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='drawer-inpts-container'>
                  <div
                    className='drawer-lbl-container'
                    style={{ width: "45%" }}>
                    <p>Date of Incident :</p>
                  </div>
                  <div className='inpt-con'>
                    <p className='star-white'>*</p>
                    <div className='inpt-sub-con'>
                      <MyDatePicker />
                    </div>
                    <p className='error'></p>
                  </div>
                </div>
              </div>
            </div>
            <div className=''>
              <div
                className='drawer-inpts-container'
                style={{ height: "130px" }}>
                <div
                  className='drawer-lbl-container'
                  style={{ width: "21.7%" }}>
                  <p>Notes :</p>
                </div>
                <div
                  className='inpt-con'
                  style={{ width: "80%" }}>
                  <p className='star-white'>*</p>
                  <div className='inpt-sub-con'>
                    <TextArea rows={5} />
                  </div>
                  <p className='error'></p>
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-md-6'>
                <div className='drawer-inpts-container'>
                  <div
                    className='drawer-lbl-container'
                    style={{ width: "45%" }}>
                    <p>Date Proc Commenced :</p>
                  </div>
                  <div
                    className='inpt-con'
                    style={{}}>
                    <p className='star-white'>*</p>
                    <div className='inpt-sub-con'>
                      <MyDatePicker />
                    </div>
                    <p className='error'></p>
                  </div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='drawer-inpts-container'>
                  <div
                    className='drawer-lbl-container'
                    style={{ width: "45%" }}>
                    <p>Solicitor’s :</p>
                  </div>
                  <div className='inpt-con'>
                    <p className='star-white'>*</p>
                    <div className='inpt-sub-con'>
                      <MySelect
                        placeholder='NA'
                        isSimple={true}
                      />
                    </div>
                    <p className='error'></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MyDrawer>
      </div>
    </form>
  );
}

export default MyDeatails;
