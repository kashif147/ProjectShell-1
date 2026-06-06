import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { SiActigraph } from "react-icons/si";
import { FaLeaf, FaRegMap, FaRocketchat } from "react-icons/fa6";
import MyDrawer from "../component/common/MyDrawer";
import { LuRefreshCw } from "react-icons/lu";
// import { selectGroupedLookups, selectGroupedLookupsByType } from "../features/LookupsSlice";
import {
  Input,
  Table,
  Row,
  Col,
  Space,
  Pagination,
  Divider,
  Checkbox,
  Button,
  Modal,
  Spin,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  Map,
  Globe,
  Building2,
  MapPin,
  University,
  MapPinned,
  Mail,
  Layout,
  Landmark,
  Languages,
  FolderKanban,
  Lightbulb,
  BarChart3,
  FileText,
  Gavel,
  Calendar,
  MessageSquare,
  File,
  Shield,
  Boxes,
  Search,
  Phone,
  Bookmark,
  CircleHelp,
  Users,
  Briefcase,
  User,
  Heart,
  Crown,
} from "lucide-react";
import { PiHandshakeDuotone } from "react-icons/pi";
import { AiFillDelete } from "react-icons/ai";
import { FaEdit } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { FaRegCircleQuestion } from "react-icons/fa6";
import {
  getAllLookups,
  getLookupById,
  resetLookups,
} from "../features/LookupsSlice";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useTableColumns } from "../context/TableColumnsContext ";
import MyConfirm from "../component/common/MyConfirm";
import { CountyOutlined } from "../utils/Icons";
import { TiContacts } from "react-icons/ti";
import { TbUsersGroup } from "react-icons/tb";
import { TbFileSettings } from "react-icons/tb";
import { PiRanking } from "react-icons/pi";
import { GrTask } from "react-icons/gr";
import { PiGavelThin } from "react-icons/pi";
import { LuAlarmClock } from "react-icons/lu";
import { SlEnvelopeOpen } from "react-icons/sl";
import CustomSelect from "../component/common/CustomSelect";
import MyAlert from "../component/common/MyAlert";
// import '../styles/Configuratin.css'
import "../styles/Configuration.css";
import MySelect from "../component/common/MySelect";
import { deleteFtn, updateFtn } from "../utils/Utilities";
import { baseURL } from "../utils/Utilities";
import { fetchRegions, deleteRegion } from "../features/RegionSlice";
// import { getLookupTypes } from "../features/LookupTypeSlice";
import { getAllRegionTypes } from "../features/RegionTypeSlice";
import {
  getContactTypes,
  resetContactTypes,
} from "../features/ContactTypeSlice";
import { getContacts, resetContacts } from "../features/ContactSlice";
import {
  getLookupTypes,
  getLookupTypeById,
  clearLookupTypes,
} from "../features/LookupTypeSlice";
import {
  buildConfigurationCards,
  getDrawerKeyForLookupType,
  getLookupTypeRecordForDrawer,
  getLookupsForDrawer,
  getLookupTypeFieldProps,
  resolveConfigurationDrawerKey,
  getLookupsForLookupType,
  getLookupTypeFieldPropsForRecord,
  withDynamicLookupTypeId,
  isLookupDrawerKey,
} from "../utils/configurationLookupHelpers";
import {
  lookupTypeRequiresParent,
  resolveParentLookupIdFromRecord,
  resolveParentLookupLabelFromRecord,
  resolveParentLookupTypeIdFromRecord,
  resolveParentLookupTypeLabelFromRecord,
  mapLookupTypeToFormValues,
  mapLookupToFormValues,
} from "../utils/lookupHierarchy";
import ParentLookupSelect from "../component/configuration/ParentLookupSelect";
import ParentLookupTypeSelect from "../component/configuration/ParentLookupTypeSelect";
import { set } from "react-hook-form";
import MyInput from "../component/common/MyInput";
import { useNavigate } from "react-router-dom";
import { fetchCountries, clearCountriesData } from "../features/CountriesSlice";
import { getBookmarks } from "../features/templete/BookmarkActions";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";

const IRO_ROLE_ID = "68c6b4d1e42306a6836622fa";

// Helper function to get unique filter values
const getUniqueFilterValues = (dataSource, getValue) => {
  const uniqueValues = new Set();
  if (Array.isArray(dataSource)) {
    dataSource.forEach((record) => {
      const value = getValue(record);
      if (value !== null && value !== undefined && value !== "") {
        uniqueValues.add(value.toString());
      }
    });
  }
  return Array.from(uniqueValues)
    .sort()
    .map((value) => ({ text: value, value }));
};

// Filter Dropdown Component
const FilterDropdown = ({
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  dataSource,
  getValue,
}) => {
  const [searchText, setSearchText] = useState("");
  const uniqueValues = getUniqueFilterValues(dataSource, getValue);
  const filteredOptions = uniqueValues.filter((option) =>
    option.text.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleReset = () => {
    setSearchText("");
    setSelectedKeys([]);
    if (clearFilters) clearFilters();
    confirm();
  };

  const handleConfirm = () => {
    confirm();
  };

  return (
    <div style={{ padding: 8, width: 280, boxSizing: "border-box" }}>
      <Input
        placeholder="Search filter"
        prefix={<SearchOutlined />}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onPressEnter={handleConfirm}
        style={{
          marginBottom: 8,
          width: "100%",
          boxSizing: "border-box",
        }}
        allowClear
      />
      <div
        style={{
          maxHeight: 200,
          overflowY: "auto",
          marginBottom: 8,
          border: "1px solid #f0f0f0",
          borderRadius: "4px",
        }}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                const newSelectedKeys = selectedKeys?.includes(option.value)
                  ? selectedKeys.filter((key) => key !== option.value)
                  : [...(selectedKeys || []), option.value];
                setSelectedKeys(newSelectedKeys);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                backgroundColor: selectedKeys?.includes(option.value)
                  ? "#e6f7ff"
                  : "transparent",
                borderBottom: "1px solid #f0f0f0",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Checkbox
                checked={selectedKeys?.includes(option.value) || false}
                style={{ marginRight: 8 }}
              />
              <span style={{ fontSize: "14px" }}>{option.text}</span>
            </div>
          ))
        ) : (
          <div style={{ padding: "12px", color: "#999", textAlign: "center" }}>
            No options found
          </div>
        )}
      </div>
      <Space
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}
      >
        <Button size="small" onClick={handleReset} style={{ width: 80 }}>
          Reset
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleConfirm}
          style={{ width: 80 }}
        >
          OK
        </Button>
      </Space>
    </div>
  );
};

// Helper function to create searchable filter dropdown
const createFilterDropdown = (dataSource, getValue) => {
  return (props) => (
    <FilterDropdown {...props} dataSource={dataSource} getValue={getValue} />
  );
};

// i have different drwers for configuration of lookups for the system

const Configuration = () => {
  const [iroUsers, setIroUsers] = useState([]);

  useEffect(() => {
    const fetchIroUsers = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `${baseURL}/roles/${IRO_ROLE_ID}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = response.data?.data || response.data || [];
        setIroUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch IRO users:", error);
      }
    };
    fetchIroUsers();
  }, []);

  const dispatch = useDispatch();
  const { bookmarks, bookmarksLoading, bookmarksError } = useSelector(
    (state) => state.bookmarks,
  );
  const { lookups, lookupsloading, lookupDetailLoading } = useSelector(
    (state) => state.lookups,
  );
  const { lookupsTypes, lookupsTypesloading, lookupTypeDetailLoading } =
    useSelector((state) => state.lookupsTypes);
  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.regions,
  );
  const { regionTypes, regionTypesLoading } = useSelector(
    (state) => state.regionTypes,
  );
  const { contacts, contactsLoading } = useSelector((state) => state.contact);
  const { contactTypes, contactTypesloading } = useSelector(
    (state) => state.contactType,
  );
  const {
    countriesData,
    loadingC: countriesLoading,
    countriesOptions,
  } = useSelector((state) => state.countries);

  const [searchTermLookup, setSearchTermLookup] = useState("");
  const [filteredLookups, setFilteredLookups] = useState([]);
  const [searchTermBranch, setSearchTermBranch] = useState("");
  const [branchesWithRegionData, setBranchesWithRegionData] = useState([]);
  const [searchTermStation, setSearchTermStation] = useState("");
  const [searchTermRegion, setSearchTermRegion] = useState("");

  const groupedLookups = useMemo(() => {
    if (!lookups || !Array.isArray(lookups)) return {};
    return lookups.reduce((acc, item) => {
      const type =
        item.lookuptypeName ||
        item.lookuptypeId?.lookuptype ||
        item.lookuptype?.name;
      if (type) {
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
      }
      return acc;
    }, {});
  }, [lookups]);

  // Lookup-specific search handler function
  const handleLookupSearch = (value) => {
    setSearchTermLookup(value);
    if (!value.trim()) {
      setFilteredLookups(lookups);
      return;
    }
    const searchValue = value.toLowerCase();
    const filtered = lookups.filter((item) => {
      const basicMatch =
        (item.code && item.code.toLowerCase().includes(searchValue)) ||
        (item.lookupname &&
          item.lookupname.toLowerCase().includes(searchValue)) ||
        (item.DisplayName &&
          item.DisplayName.toLowerCase().includes(searchValue));
      const typeMatch =
        item.lookuptype &&
        ((item.lookuptype.name &&
          item.lookuptype.name.toLowerCase().includes(searchValue)) ||
          (item.lookuptypeId &&
            item.lookuptypeId.toString().toLowerCase().includes(searchValue)));
      const parentMatch =
        item.Parentlookup &&
        ((item.Parentlookup.lookupname &&
          item.Parentlookup.lookupname.toLowerCase().includes(searchValue)) ||
          (item.Parentlookup.DisplayName &&
            item.Parentlookup.DisplayName.toLowerCase().includes(
              searchValue,
            )) ||
          (item.Parentlookupid &&
            item.Parentlookupid.toString()
              .toLowerCase()
              .includes(searchValue)));
      const statusMatch =
        item.isactive !== undefined &&
        ((item.isactive && "active".includes(searchValue)) ||
          (!item.isactive && "inactive".includes(searchValue)));
      return basicMatch || typeMatch || parentMatch || statusMatch;
    });
    setFilteredLookups(filtered);
  };

  // Add this useEffect to initialize filtered Lookup data when lookups change
  useEffect(() => {
    setFilteredLookups(lookups);
  }, [lookups]);

  // Function to get region name for a branch
  const getRegionNameForBranch = useCallback(
    (parentLookupId) => {
      const region = groupedLookups?.Region?.find(
        (r) => r._id === parentLookupId,
      );
      return region ? region.lookupname : "No Region";
    },
    [groupedLookups?.Region],
  );

  // Use useEffect to update branchesWithRegionData when groupedLookups changes
  useEffect(() => {
    if (groupedLookups?.Branch) {
      const updatedBranches = groupedLookups.Branch.map((branch) => ({
        ...branch,
        regionName: getRegionNameForBranch(branch.Parentlookupid),
      }));
      setBranchesWithRegionData(updatedBranches);
    }
  }, [groupedLookups?.Branch, getRegionNameForBranch]);

  // Filter branches based on search term
  const filteredBranches = useMemo(() => {
    if (!branchesWithRegionData.length) return [];
    if (!searchTermBranch.trim()) return branchesWithRegionData;
    const searchTerm = searchTermBranch.toLowerCase().trim();
    return branchesWithRegionData.filter(
      (branch) =>
        branch.lookupname?.toLowerCase().includes(searchTerm) ||
        branch.code?.toLowerCase().includes(searchTerm) ||
        branch.DisplayName?.toLowerCase().includes(searchTerm) ||
        branch.regionName?.toLowerCase().includes(searchTerm),
    );
  }, [branchesWithRegionData, searchTermBranch]);

  const filteredWorkLocations = useMemo(() => {
    const workLocations = groupedLookups?.workLocation || [];
    if (!searchTermStation.trim()) return workLocations;
    const term = searchTermStation.toLowerCase().trim();
    return workLocations.filter(
      (item) =>
        (item.lookupname || "").toLowerCase().includes(term) ||
        (item.code || "").toLowerCase().includes(term) ||
        (item.DisplayName || "").toLowerCase().includes(term) ||
        (item.Parentlookup || "").toLowerCase().includes(term) ||
        (item.officer?.userEmail || "").toLowerCase().includes(term),
    );
  }, [groupedLookups?.workLocation, searchTermStation]);

  const filteredRegions = useMemo(() => {
    const regionData = groupedLookups?.Region || [];
    if (!searchTermRegion.trim()) return regionData;
    const term = searchTermRegion.toLowerCase().trim();
    return regionData.filter(
      (item) =>
        (item.lookupname || "").toLowerCase().includes(term) ||
        (item.code || "").toLowerCase().includes(term) ||
        (item.DisplayName || "").toLowerCase().includes(term) ||
        (item.officer?.userEmail || "").toLowerCase().includes(term),
    );
  }, [groupedLookups?.Region, searchTermRegion]);

  // Function to handle search input changes
  const handleBranchSearchChange = (e) => setSearchTermBranch(e.target.value);
  const clearBranchSearch = () => setSearchTermBranch("");

  const handleStationSearchChange = (e) => setSearchTermStation(e.target.value);
  const clearStationSearch = () => setSearchTermStation("");

  const handleRegionSearchChange = (e) => setSearchTermRegion(e.target.value);
  const clearRegionSearch = () => setSearchTermRegion("");
  const insertDataFtn = async (
    url,
    data,
    successNotification,
    failureNotification,
    callback,
    isCoum,
  ) => {
    const token = localStorage.getItem("token");
    const baseUrl = isCoum ? process.env.REACT_APP_CUMM : baseURL;

    try {
      setButtonLoading((prev) => ({ ...prev, insert: true }));
      const response = await axios.post(`${baseUrl}${url}`, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        setTimeout(() => {
          MyAlert("success", successNotification);
        }, 100);
        if (typeof callback === "function") {
          callback();
        }
        return response.data;
      }
    } catch (error) {
      console.error("Axios Error:", error?.response || error);

      // ✅ Extract message safely
      const errMsg =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Something went wrong";

      // ✅ Trigger failure alert properly
      MyAlert("error", failureNotification, errMsg); // Remove return here
      return null; // Always return something
    } finally {
      setButtonLoading((prev) => ({ ...prev, insert: false }));
    }
  };
  useEffect(() => {
    dispatch(getBookmarks());
  }, [dispatch]);
  const columnsSolicitors = [
    {
      title: "Surname",
      dataIndex: "surname",
      key: "surname",
    },
    {
      title: "Forename",
      dataIndex: "forename",
      key: "forename",
    },
    {
      title: "Phone",
      dataIndex: "contactPhone",
      key: "contactPhone",
    },
    {
      title: "Email",
      dataIndex: "contactEmail",
      key: "contactEmail",
    },
    {
      title: "Building/House",
      dataIndex: ["contactAddress", "buildingOrHouse"],
      key: "buildingOrHouse",
    },
    {
      title: "Street/Road",
      dataIndex: ["contactAddress", "streetOrRoad"],
      key: "streetOrRoad",
    },
    {
      title: "Area/Town",
      dataIndex: ["contactAddress", "areaOrTown"],
      key: "areaOrTown",
    },
    {
      title: "City/Postcode",
      dataIndex: ["contactAddress", "cityCountyOrPostCode"],
      key: "cityCountyOrPostCode",
    },
    {
      title: "Eircode",
      dataIndex: ["contactAddress", "eircode"],
      key: "eircode",
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
            style={{ marginRight: "10px", cursor: "pointer" }}
            onClick={() => {
              IsUpdateFtn("Solicitors", !isUpdateRec?.Solicitors, record);
              addIdKeyToLookup(record?._id, "Solicitors");
            }}
          />
          <AiFillDelete
            size={16}
            style={{ cursor: "pointer" }}
            spin={buttonLoading.delete}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do you want to delete this solicitor?",
                onConfirm: async () => {
                  await deleteFtn(`contacts/${record?._id}`, null, () => {
                    dispatch(resetContacts());
                    dispatch(getContacts());
                  });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];

  const updateFtn = async (
    endPoint,
    data1,
    callback,
    msg = "updated successfully",
    isCoum = false,
  ) => {
    try {
      const token = localStorage.getItem("token");
      const baseUrl = isCoum ? process.env.REACT_APP_CUMM : baseURL;

      let finalEndPoint = endPoint;
      // const { id, ...finalData } = data1;
      // const { id, ...finalData } = data1;

      setButtonLoading((prev) => ({ ...prev, update: true }));
      const response = await axios.put(`${baseUrl}${finalEndPoint}`, data1, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Update Response:", response);

      if (response?.status === 200) {
        MyAlert("success", msg);
        if (typeof callback === "function") {
          callback();
        }
        return response.data;
      } else {
        MyAlert("error", "Update failed");
        return null; // ← Add this
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      MyAlert(
        "error",
        "Update failed",
        error.response?.data?.message || error.message,
      );
      return null; // ← Add this
    } finally {
      setButtonLoading((prev) => ({ ...prev, update: false }));
    }
  };
  const updateCountiesFtn = async (
    // apiURL = baseURL,
    endPoint,
    data1,
    callback,
    msg = "updated successfully",
  ) => {
    try {
      const token = localStorage.getItem("token");
      // ✅ If `id` exists in data1 but not in URL, append it
      let finalEndPoint = endPoint;
      if (data1?.id && !endPoint.includes(data1.id)) {
        finalEndPoint = `${endPoint}/${data1.id}`;
      }

      const { id, ...finalData } = data1;

      const response = await axios.put(
        `${baseURL}${finalEndPoint}`,
        finalData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("Update Response:", response);
      if (response?.status === 200) {
        MyAlert("success", msg);
        if (typeof callback === "function") {
          await callback(); // wait in case it's async
        }
        return response.data;
      } else {
        MyAlert("error", "notificationsMsg?.updating?.falier");
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      // throw error;
    }
  };
  const deleteFtn = async (
    url1,
    body = null,
    callback,
    showAlert = true,
    isCoum = false,
    refreshData = true, // New parameter
  ) => {
    const token = localStorage.getItem("token");

    const baseUrl = isCoum ? process.env.REACT_APP_CUMM : baseURL;

    const resolveDeleteUrl = (base, pathOrUrl, forCoum) => {
      if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
      }

      const normalizedBase = String(base || "").replace(/\/+$/, "");
      let path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

      // Prevent .../api/api/... when base already ends with /api
      if (normalizedBase.endsWith("/api") && path.startsWith("/api/")) {
        path = path.slice(4) || "/";
      }
      if (normalizedBase.endsWith("/api") && path === "/api") {
        path = "";
      }

      if (forCoum) {
        return `${normalizedBase}/${String(pathOrUrl).replace(/^\/+/, "")}`;
      }
      return `${normalizedBase}${path}`;
    };

    const finalUrl = resolveDeleteUrl(baseUrl, url1, isCoum);

    const config = {
      method: "delete",
      url: finalUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (body) config.data = body;

    try {
      setButtonLoading((prev) => ({ ...prev, delete: true }));
      console.log("Making DELETE request...");
      const response = await axios.request(config);
      console.log("DELETE successful");

      // ✅ If refreshData flag is true, dispatch getAllLookups
      if (refreshData) {
        Modal.destroyAll();
        console.log("Refreshing data after delete...");
        await dispatch(getAllLookups()); // Assuming dispatch is available
      }

      if (typeof callback === "function") {
        await callback();
      }

      if (showAlert) {
        MyAlert("success", "Deleted successfully.");
      }

      // ✅ Close any open modals after successful delete

      return response.data;
    } catch (error) {
      console.error("DELETE error:", error);
      const errMsg =
        error?.response?.data?.error?.message ||
        error?.message ||
        "Delete failed";
      MyAlert("error", "Delete failed", errMsg);

      // ✅ Also close modals on error
      Modal.destroyAll();

      return null;
    } finally {
      setButtonLoading((prev) => ({ ...prev, delete: false }));
      // ✅ Ensure modal is always destroyed (double safety)
      setTimeout(() => Modal.destroyAll(), 100);
    }
  };

  // Helper function to refresh data after mutations
  // Resets the state first (so condition allows fetch) then fetches fresh data
  const refreshLookups = () => {
    dispatch(resetLookups());
    dispatch(getAllLookups());
  };

  const refreshContacts = () => {
    dispatch(resetContacts());
    dispatch(getContacts());
  };

  const refreshContactTypes = () => {
    dispatch(resetContactTypes());
    dispatch(getContactTypes());
  };

  const refreshCountries = () => {
    dispatch(clearCountriesData());
    dispatch(fetchCountries());
  };

  const refreshLookupTypes = () => {
    dispatch(clearLookupTypes());
    dispatch(getLookupTypes(true));
  };

  const columnBookmark = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
      width: "20%",
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      width: "25%",
    },
    {
      title: "Path",
      dataIndex: "path",
      key: "path",
      width: "30%",
    },
    {
      title: "Data Type",
      dataIndex: "dataType",
      key: "dataType",
      width: "15%",
      // render: (dataType) => (
      //   <Tag color={getDataTypeColor(dataType)}>
      //     {dataType?.toUpperCase()}
      //   </Tag>
      // ),
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'isactive',
    //   key: 'isactive',
    //   width: '10%',
    // render: (isactive) => (
    //   <Tag color={isactive ? 'green' : 'red'}>
    //     {isactive ? 'Active' : 'Inactive'}
    //   </Tag>
    // ),

    // },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
            onClick={() => {
              IsUpdateFtn("Bookmarks", !IsUpdateFtn?.Bookmarks, record);
              addIdKeyToLookup(record?._id, "Bookmarks");
            }}
          />
          <AiFillDelete
            size={16}
            spin={buttonLoading.delete}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn(
                    `bookmarks/fields/${record?._id}`, // Fixed URL - removed leading slash
                    null, // No body needed when using URL parameter
                    () => dispatch(getBookmarks()), // Fixed callback - pass function reference
                    true, // showAlert
                    true, // isCoum
                  );
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const [bookmarkSearch, setBookmarkSearch] = useState("");

  const filteredBookmarks = useMemo(() => {
    if (!bookmarkSearch) return bookmarks;

    const s = bookmarkSearch.toLowerCase();

    return bookmarks.filter(
      (b) =>
        b.key?.toLowerCase().includes(s) || b.label?.toLowerCase().includes(s),
    );
  }, [bookmarkSearch, bookmarks]);

  const navigate = useNavigate();
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
    MaritalStatus: [],
    Sections: [],
    Committees: [],
    ContactType: [],
    PostCode: [],
  });

  // const groupedlookupsForSelect = useSelector(selectGroupedLookupsByType);

  const [searchQuery, setSearchQuery] = useState("");
  // ---- Work Location Eircode Search ----
  const [addressSearchValue, setAddressSearchValue] = useState("");
  const addressInputRef = useRef(null);
  const mapsLibraries = ["places", "maps"];
  const { isLoaded: isMapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o",
    libraries: mapsLibraries,
  });

  const handleStationPlacesChanged = () => {
    const places = addressInputRef.current?.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    if (place.formatted_address) setAddressSearchValue(place.formatted_address);

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );
    service.getDetails(
      {
        placeId: place.place_id,
        fields: ["address_components", "formatted_address"],
      },
      (details, status) => {
        if (
          status !== window.google.maps.places.PlacesServiceStatus.OK ||
          !details
        )
          return;

        const components = details.address_components;
        const getComp = (type) =>
          components.find((c) => c.types.includes(type))?.long_name || "";

        const streetNumber = getComp("street_number");
        const route = getComp("route");
        const neighborhood =
          getComp("neighborhood") || getComp("sublocality") || "";
        const town = getComp("locality") || getComp("postal_town") || "";
        const county = getComp("administrative_area_level_1") || "";
        const postalCode = getComp("postal_code");
        const countryName = getComp("country");
        const countryShort =
          components.find((c) => c.types.includes("country"))?.short_name || "";

        let finalCountry = countryName;
        const matchedCountry = countriesOptions?.find(
          (c) =>
            c?.label?.toLowerCase() === countryName.toLowerCase() ||
            c?.value?.toLowerCase() === countryName.toLowerCase() ||
            c?.label?.toLowerCase() === countryShort.toLowerCase() ||
            c?.value?.toLowerCase() === countryShort.toLowerCase() ||
            c?.displayname?.toLowerCase() === countryName.toLowerCase(),
        );

        if (matchedCountry) {
          finalCountry =
            matchedCountry.displayname ||
            matchedCountry.label ||
            matchedCountry.value;
        }

        setdrawerIpnuts((prev) => ({
          ...prev,
          Station: {
            ...prev.Station,
            worklocationAddress: {
              ...prev.Station.worklocationAddress,
              buildingOrHouse: `${streetNumber} ${route}`.trim(),
              streetOrRoad: neighborhood,
              areaOrTown: town,
              countyCityOrPostCode: county,
              eircode: postalCode,
              country: finalCountry,
              fullAddress: details.formatted_address || "",
            },
          },
        }));
      },
    );
  };
  // ---- End Work Location Eircode Search ----
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

  const {
    titleOptions,
    genderOptions,
    workLocationOptions,
    gradeOptions,
    sectionOptions,
    membershipCategoryOptions,
    paymentTypeOptions,
    branchOptions,
    regionOptions,
    secondarySectionOptions,
    countryOptions,
    provincesOption,
  } = useSelector((state) => state.lookups);
  console.log("lookups", lookups);
  // const { countriesData, countriesOptions } = useSelector((state) => state.countries);

  const [contactTypelookup, setcontactTypelookup] = useState([]);
  useEffect(() => {
    if (contactTypes) {
      let arr = [];
      let obj = {};
      contactTypes.map((ct) => {
        obj = {
          label: ct?.contactType,
          value: ct?._id,
        };
        arr.push(obj);
      });
      setcontactTypelookup(arr);
    }
  }, [contactTypes]);
  const { lookupsForSelect, disableFtn, isDisable } = useTableColumns();
  const [drawerOpen, setDrawerOpen] = useState({
    counties: false,
    Countries: false,
    StudyLocation: false,
    Provinces: false,
    Cities: false,
    PostCode: false,
    Districts: false,
    Divisions: false,
    DivisionsForDistrict: false,
    Station: false,
    DivisionsForStation: false,
    ContactType: false,
    LookupType: false,
    Lookup: false,
    StandardLookup: false,
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
    Sections: false,
    Bookmarks: false,
  });
  const [selectLokups, setselectLokups] = useState({
    Provinces: [],
    Counteries: [],
    Divisions: [],
    Districts: [],
  });
  const [lookupsData, setlookupsData] = useState({
    Duties: [],
    MaritalStatus: [],
  });

  const [isUpdateRec, setisUpdateRec] = useState({
    counties: false,
    Countries: false,
    Provinces: false,
    Cities: false,
    PostCode: false,
    Districts: false,
    Divisions: false,
    Station: false,
    ContactType: false,
    LookupType: false,
    Lookup: false,
    StandardLookup: false,
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
    Sections: false,
    Bookmarks: false,
  });
  const [buttonLoading, setButtonLoading] = useState({
    insert: false,
    update: false,
    delete: false,
  });
  const [editingLookupDrawer, setEditingLookupDrawer] = useState(null);
  function transformData(originalData) {
    return originalData.map((item) => ({
      id: item._id,
      value: item._id,
      label: item.lookupname,
    }));
  }
  // const transformedData = transformData(lookups);
  const transformedData = transformData(lookups).sort((a, b) => {
    // Compare labels alphabetically
    const labelA = a.label.toLowerCase();
    const labelB = b.label.toLowerCase();

    if (labelA < labelB) return -1; // a comes before b
    if (labelA > labelB) return 1; // a comes after b
    return 0; // equal
  });
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
        Solicitors: contacts.filter(
          (item) => item?.contactTypeId?.contactType === "Solicitors",
        ),
      }));
    }
  }, [contacts]);

  const [lookupTypSlct, setlookupTypSlct] = useState([]);
  useEffect(() => {
    if (!Array.isArray(lookupsTypes)) return;
    const arr = lookupsTypes.map((lokpty) => ({
      key: lokpty?._id,
      label: lokpty?.lookuptype,
    }));
    setlookupTypSlct(arr);
  }, [lookupsTypes]);

  const configurationCards = useMemo(
    () => buildConfigurationCards(lookupsTypes),
    [lookupsTypes],
  );

  const [activeStandardLookupType, setActiveStandardLookupType] =
    useState(null);

  const standardLookupTableData = useMemo(
    () => getLookupsForLookupType(activeStandardLookupType, lookups),
    [activeStandardLookupType, lookups],
  );

  useEffect(() => {
    if (!lookups || !Array.isArray(lookups) || !lookupsTypes?.length) return;

    const filteredData = lookupsTypes.reduce((acc, lookupType) => {
      const drawerKey = getDrawerKeyForLookupType(lookupType);
      if (!drawerKey) return acc;
      acc[drawerKey] = lookups.filter(
        (item) =>
          String(item?.lookuptypeId?._id) === String(lookupType._id) ||
          item?.lookuptypeId?.lookuptype === lookupType.lookuptype ||
          item?.lookuptypeName === lookupType.lookuptype,
      );
      return acc;
    }, {});

    setdata((prevState) => ({ ...prevState, ...filteredData }));
  }, [lookups, lookupsTypes]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLookupsTypes, setFilteredLookupsTypes] = useState([]);
  // const [filteredLookupsTypes, setFilteredLookupsTypes] = useState([]);
  const sortLookupTypesByName = (arr) =>
    [...(arr || [])].sort((a, b) =>
      (a.lookuptype || "").localeCompare(b.lookuptype || ""),
    );
  const handleSearchLookupTypes = (searchValue) => {
    setSearchTerm(searchValue);

    if (!searchValue.trim()) {
      setFilteredLookupsTypes(sortLookupTypesByName(lookupsTypes));
      return;
    }

    const filtered = lookupsTypes.filter((item) => {
      const searchLower = searchValue.toLowerCase();

      return (
        item.lookuptype?.toLowerCase().includes(searchLower) ||
        item.code?.toLowerCase().includes(searchLower) ||
        item.DisplayName?.toLowerCase().includes(searchLower)
      );
    });

    setFilteredLookupsTypes(sortLookupTypesByName(filtered));
  };
  // Initialize filtered data when lookupsTypes changes
  useEffect(() => {
    setFilteredLookupsTypes(sortLookupTypesByName(lookupsTypes));
  }, [lookupsTypes]);
  useMemo(() => {
    if (regions && Array.isArray(regions)) {
      setdata((prevState) => ({
        ...prevState,
        Stations: regions.filter(
          (item) => item.RegionTypeID === "671822c6a0072a28aab883e9",
        ),
      }));
    }
  }, [regions]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Only fetch contacts if they don't exist and not already loading
    if (!contactsLoading && (!contacts || contacts.length === 0)) {
      dispatch(getContacts());
    }

    // Fetch lookup types when not loaded (do not block on regionTypes — same API, separate slice)
    if (!lookupsTypesloading && (!lookupsTypes || lookupsTypes.length === 0)) {
      dispatch(getLookupTypes());
    }

    // Only fetch lookups if they don't exist and not already loading
    if (!lookupsloading && (!lookups || lookups.length === 0)) {
      dispatch(getAllLookups());
    }

    // Only fetch countries if they don't exist and not already loading
    if (!countriesLoading && (!countriesData || countriesData.length === 0)) {
      dispatch(fetchCountries());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    Beta: "",
  });
  const [PartnershipData, setPartnershipData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: "",
  });
  const [membershipdata, setMembershipData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: "",
  });

  const [SubscriptionData, setSubscriptionData] = useState({
    ShortName: "",
    DisplayName: "",
    Alpha: "",
    Beta: "",
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

  const baseDrawerInputsInitalValues = {
    Bookmarks: {
      key: "",
      label: "",
      path: "",
      dataType: "",
    },
    Solicitors: {
      forename: "",
      surname: "",
      contactPhone: "",
      contactEmail: "",
      contactAddress: {
        buildingOrHouse: "",
        streetOrRoad: "",
        areaOrTown: "",
        cityCountyOrPostCode: "",
        eircode: "",
      },
      contactTypeId: "68e94242aa4ff1e89eefa827",
      isactive: true, // ✅ added based on API field
      isDeleted: false, // keep this if your app uses soft-delete flag
    },

    RegionType: {
      RegionType: "",
      DisplayName: "",
      isactive: true,
      isDeleted: false,
    },
    // Counteries: {
    //   lookuptypeId: "68c85f21302e5600dc8477e4",
    //   DisplayName: "",
    //   lookupname: "",
    //   code: "",
    //   Parentlookupid: null,
    //   userid: "67f3f9d812b014a0a7a94081",
    //   isactive: true,
    //   isDeleted: false,
    // },

    //worklocation
    Station: {
      lookuptypeId: "68d0369c662428d1c504b3aa",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
      officer: null,
      worklocationAddress: {
        eircode: "",
        buildingOrHouse: "",
        streetOrRoad: "",
        areaOrTown: "",
        countyCityOrPostCode: "",
        country: "",
        fullAddress: "",
      },
    },
    Cities: {
      lookuptypeId: "68c85f22302e5600dc8477ed",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Districts: {
      lookuptypeId: "68d0369c662428d1c504b3aa",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
      officer: null,
    },
    // Region
    Divisions: {
      lookuptypeId: "68d0362a662428d1c504b3a8",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
      officer: null,
    },
    Councils: {
      lookuptypeId: "68c85f22302e5600dc8477f6",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    CorrespondenceType: {
      lookuptypeId: "68c85f22302e5600dc84780b",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    ClaimType: {
      lookuptypeId: "68c85f22302e5600dc847811",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Schemes: {
      lookuptypeId: "68c85f22302e5600dc847814",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Reasons: {
      lookuptypeId: "68c85f22302e5600dc847817",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    DocumentType: {
      lookuptypeId: "68c85f22302e5600dc84780e",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Boards: {
      lookuptypeId: "68c85f22302e5600dc8477f3",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    LookupType: {
      lookuptype: "",
      code: "",
      DisplayName: "",
      ParentlookuptypeId: null,
      Parentlookuptype: null,
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Lookup: {
      lookuptypeId: "",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    StandardLookup: {
      lookuptypeId: "",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Gender: {
      lookuptypeId: "68c85f21302e5600dc8477da",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Title: {
      lookuptypeId: "68c85f21302e5600dc8477d6",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    SpokenLanguages: {
      lookuptypeId: "68c85f22302e5600dc8477f9",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    MaritalStatus: {
      lookuptypeId: "68c85f21302e5600dc8477dd",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    ProjectTypes: {
      lookuptypeId: "68c85f22302e5600dc8477fc",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: "674a195dcc0986f64ca36fc2",
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Trainings: {
      lookuptypeId: "68c85f22302e5600dc8477ff",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Ranks: {
      lookuptypeId: "68c85f22302e5600dc84781a",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Provinces: {
      lookuptypeId: "68c85f21302e5600dc8477e0",
      DisplayName: "",
      code: "",
      lookupname: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Duties: {
      lookuptypeId: "68c85f22302e5600dc847805",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    RosterType: {
      lookuptypeId: "68c85f22302e5600dc847808",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    ContactType: {
      contactType: "",
      displayName: "",
      isactive: true,
      code: "",
    },
    Sections: {
      lookuptypeId: "68d06c36c1e03afe191120ef",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Committees: {
      lookuptypeId: "",
      RegionTypeID: "",
      RegionCode: "",
      RegionName: "",
      DisplayName: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      isactive: true,
      isDeleted: false,
    },
    PostCode: {
      lookuptypeId: "",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    StudyLocation: {
      lookuptypeId: "",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    counties: {
      lookuptypeId: "68c85f21302e5600dc8477e4",
      DisplayName: "",
      lookupname: "",
      code: "",
      Parentlookupid: null,
      Parentlookup: "",
      ParentlookuptypeId: null,
      Parentlookuptype: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
    },
    Countries: {
      displayname: "",
      name: "",
      code: "",
      callingCodes: "",
    },
  };

  const [drawerIpnuts, setdrawerIpnuts] = useState(
    baseDrawerInputsInitalValues,
  );

  useEffect(() => {
    if (!Array.isArray(lookupsTypes) || lookupsTypes.length === 0) return;
    setdrawerIpnuts((prev) => {
      let changed = false;
      const next = { ...prev };
      Object.keys(baseDrawerInputsInitalValues).forEach((drawerKey) => {
        if (!prev[drawerKey]) return;
        const updated = withDynamicLookupTypeId(
          prev[drawerKey],
          drawerKey,
          lookupsTypes,
        );
        if (updated?.lookuptypeId !== prev[drawerKey]?.lookuptypeId) {
          next[drawerKey] = updated;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [lookupsTypes]);

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

  const handleParentLookupChange = (drawer, { parentId, parentLabel }) => {
    setdrawerIpnuts((prev) => ({
      ...prev,
      [drawer]: {
        ...prev[drawer],
        Parentlookupid: parentId,
        Parentlookup: parentLabel ?? "",
      },
    }));
  };

  const handleParentLookupTypeChange = ({ parentTypeId, parentTypeLabel }) => {
    setdrawerIpnuts((prev) => ({
      ...prev,
      LookupType: {
        ...prev.LookupType,
        ParentlookuptypeId: parentTypeId,
        Parentlookuptype: parentTypeLabel,
      },
    }));
  };

  const loadLookupTypeForEdit = async (record) => {
    const id = record?._id || record?.id;
    if (!id) return;

    if (!drawerOpen?.LookupType) {
      openCloseDrawerFtn("LookupType");
    }
    disableFtn(false);
    setisUpdateRec((prev) => ({ ...prev, LookupType: true }));

    try {
      const detail = await dispatch(getLookupTypeById(id)).unwrap();
      const formValues = mapLookupTypeToFormValues(detail, lookupsTypes);
      setdrawerIpnuts((prev) => ({
        ...prev,
        LookupType: {
          ...(prev.LookupType || baseDrawerInputsInitalValues.LookupType),
          ...formValues,
        },
      }));
    } catch (error) {
      const formValues = mapLookupTypeToFormValues(record, lookupsTypes);
      setdrawerIpnuts((prev) => ({
        ...prev,
        LookupType: {
          ...(prev.LookupType || baseDrawerInputsInitalValues.LookupType),
          ...formValues,
        },
      }));
      MyAlert(
        "warning",
        "Could not load full lookup type details",
        error?.message || error || "Using table row data instead.",
      );
    }
  };

  const loadLookupForEdit = async (drawerKey, record) => {
    const id = record?._id || record?.id;
    if (!id || !isLookupDrawerKey(drawerKey)) return;

    if (!drawerOpen?.[drawerKey]) {
      openCloseDrawerFtn(drawerKey);
    }
    disableFtn(false);
    setEditingLookupDrawer(drawerKey);
    setisUpdateRec((prev) => ({ ...prev, [drawerKey]: true }));

    try {
      const detail = await dispatch(getLookupById(id)).unwrap();
      const formValues = mapLookupToFormValues(detail, lookupsTypes);
      setdrawerIpnuts((prev) => ({
        ...prev,
        [drawerKey]: {
          ...(prev[drawerKey] || baseDrawerInputsInitalValues[drawerKey] || {}),
          ...formValues,
        },
      }));
    } catch (error) {
      const formValues = mapLookupToFormValues(record, lookupsTypes);
      setdrawerIpnuts((prev) => ({
        ...prev,
        [drawerKey]: {
          ...(prev[drawerKey] || baseDrawerInputsInitalValues[drawerKey] || {}),
          ...formValues,
        },
      }));
      MyAlert(
        "warning",
        "Could not load full lookup details",
        error?.message || error || "Using table row data instead.",
      );
    } finally {
      setEditingLookupDrawer(null);
    }
  };

  const IsUpdateFtn = (drawer, value, data) => {
    if (value === false) {
      setisUpdateRec((prev) => ({
        ...prev,
        [drawer]: false,
      }));
      resetCounteries(drawer);
      return;
    }

    setisUpdateRec((prev) => ({
      ...prev,
      [drawer]: value,
    }));

    const filteredData = Object.keys(
      baseDrawerInputsInitalValues[drawer] || {},
    ).reduce((acc, key) => {
      if (key === "lookuptypeId") {
        if (data.lookuptypeId != null && data.lookuptypeId !== "") {
          const val = data.lookuptypeId;
          acc.lookuptypeId =
            typeof val === "object" && val !== null && val._id
              ? String(val._id)
              : String(val);
        }
        return acc;
      }

      if (data.hasOwnProperty(key)) {
        const val = data[key];
        if (
          typeof val === "object" &&
          val !== null &&
          val._id &&
          key !== "worklocationAddress" &&
          key !== "contactAddress"
        ) {
          acc[key] = val._id;
        } else {
          acc[key] = val;
        }
      }
      return acc;
    }, {});

    const parentId = resolveParentLookupIdFromRecord(data);
    const parentLabel = resolveParentLookupLabelFromRecord(data);
    if (parentId != null) {
      filteredData.Parentlookupid = parentId;
    }
    if (parentLabel) {
      filteredData.Parentlookup = parentLabel;
    }

    if (Object.prototype.hasOwnProperty.call(data, "ParentlookuptypeId")) {
      const parentTypeId = resolveParentLookupTypeIdFromRecord(data);
      filteredData.ParentlookuptypeId = parentTypeId;
    }
    if (Object.prototype.hasOwnProperty.call(data, "Parentlookuptype")) {
      const parentTypeLabel = resolveParentLookupTypeLabelFromRecord(
        data,
        lookupsTypes,
      );
      filteredData.Parentlookuptype =
        data.Parentlookuptype ?? parentTypeLabel ?? null;
    }

    if (drawer === "LookupType") {
      const mapped = mapLookupTypeToFormValues(data, lookupsTypes);
      setdrawerIpnuts((prev) => ({
        ...prev,
        LookupType: {
          ...(prev.LookupType || baseDrawerInputsInitalValues.LookupType),
          ...mapped,
        },
      }));
      return;
    }

    if (isLookupDrawerKey(drawer)) {
      const mapped = mapLookupToFormValues(data, lookupsTypes);
      setdrawerIpnuts((prev) => ({
        ...prev,
        [drawer]: {
          ...(prev[drawer] || baseDrawerInputsInitalValues[drawer] || {}),
          ...mapped,
        },
      }));
      return;
    }

    setdrawerIpnuts((prev) => ({
      ...prev,
      [drawer]: {
        ...prev[drawer],
        ...filteredData,
      },
    }));
  };

  const transformLookupTypes = (data) => {
    return data.map((item) => ({
      value: item._id,
      key: item._id,
      label: item.lookuptype,
    }));
  };
  // const lookupsTypesSelect = transformLookupTypes(lookupsTypes);
  const sortArray = (array, key, order = "asc") => {
    if (!Array.isArray(array)) return [];

    return [...array].sort((a, b) => {
      const aValue = a[key] || "";
      const bValue = b[key] || "";

      const comparison = String(aValue)
        .toLowerCase()
        .localeCompare(String(bValue).toLowerCase());

      return order === "desc" ? -comparison : comparison;
    });
  };

  // Apply sorting to the transformed lookups types
  const lookupsTypesSelect = sortArray(
    transformLookupTypes(lookupsTypes),
    "label",
    "asc",
  );
  const getDrawerInputsTemplate = (drawer) =>
    withDynamicLookupTypeId(
      baseDrawerInputsInitalValues[drawer],
      drawer,
      lookupsTypes,
    );

  const resetCounteries = (drawer, callback) => {
    setdrawerIpnuts((prevState) => ({
      ...prevState,
      [drawer]: getDrawerInputsTemplate(drawer),
    }));
    if (callback && typeof callback === "function") {
      callback();
    }
  };

  const resetLookupDrawerForNextEntry = (callback) => {
    setdrawerIpnuts((prevState) => {
      const lookuptypeId = prevState?.Lookup?.lookuptypeId ?? "";
      return {
        ...prevState,
        Lookup: {
          ...baseDrawerInputsInitalValues.Lookup,
          lookuptypeId:
            lookuptypeId === null || lookuptypeId === undefined
              ? ""
              : String(lookuptypeId),
        },
      };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.Lookup;
      return next;
    });
    if (callback && typeof callback === "function") {
      callback();
    }
  };

  const openConfigurationCard = (card) => {
    if (!card) return;
    if (card.isSystem) {
      openCloseDrawerFtn(card.key);
      return;
    }
    const drawerKey = resolveConfigurationDrawerKey(
      card.lookupType,
      card.drawerKey || card.key,
    );
    if (drawerKey === "StandardLookup" && card.lookupType) {
      setActiveStandardLookupType(card.lookupType);
    }
    openCloseDrawerFtn(drawerKey, card.lookupType);
  };

  const openCloseDrawerFtn = (name, lookupTypeRecord = null) => {
    setDrawerOpen((prevState) => {
      const wasOpen = prevState[name];
      if (wasOpen) {
        disableFtn(true);
      } else {
        const lookupType =
          lookupTypeRecord ||
          (name === "StandardLookup"
            ? activeStandardLookupType
            : getLookupTypeRecordForDrawer(name, lookupsTypes));
        if (lookupType?._id) {
          setdrawerIpnuts((prev) => ({
            ...prev,
            [name]: {
              ...(prev[name] || getDrawerInputsTemplate(name) || {}),
              lookuptypeId: lookupType._id,
            },
          }));
        }
      }
      return {
        ...prevState,
        [name]: !wasOpen,
      };
    });
    setErrors({});
  };

  const handleInputChange4 = (name4, value4) => {
    setSubscriptionData((prevState4) => ({
      ...prevState4,
      [name4]: value4,
    }));
  };
  function simplifyContact(contact) {
    // Create a shallow copy to avoid mutating the original
    const cleaned = { ...contact };

    if (cleaned.contactTypeId && cleaned.contactTypeId._id) {
      cleaned.contactTypeId = cleaned.contactTypeId._id;
    }

    return cleaned;
  }
  const handleInputChange7 = (name7, value7) => {
    setprofileData((prevState7) => ({
      ...prevState7,
      [name7]: value7,
    }));
  };
  const addIdKeyToLookup = (idValue, drawer) => {
    disableFtn(false);
    setdrawerIpnuts((prev) => {
      if (!prev?.[drawer]) return prev; // Ensure the key exists in state

      return {
        ...prev,
        [drawer]: {
          ...prev[drawer],
          _id: idValue,
          id: idValue,
        },
      };
    });
  };
  console.log(drawerIpnuts, "drawerinpt");
  const columnProvince = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Province",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Active",
      dataIndex: "Active",
      key: "DisplayName",

      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Provinces", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const countiesColumn = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Country",
      dataIndex: "displayname",
      key: "displayname",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Calling Codes",
      dataIndex: "callingCodes",
      key: "callingCodes",
    },
    {
      title: "Active",
      dataIndex: "Active",
      key: "DisplayName",

      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            // onClick={() => {
            //   IsUpdateFtn("Provinces", !isUpdateRec?.Provinces, record);
            //   addIdKeyToLookup(record?._id, "Provinces");
            // }}
            onClick={() => {
              IsUpdateFtn("Countries", !isUpdateRec?.Countries, record);
              addIdKeyToLookup(record?._id, "Countries");
            }}
          />
          <AiFillDelete
            size={16}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn(
                    `countries/${record?._id}`,
                    null,
                    () => dispatch(getAllLookups()), // Use getAllLookups to refresh
                  );
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const columnCountry = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "County",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },

    // {
    //   title: "Calling Codes",
    //   render: (record) => record?.callingCodes,
    // },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("counties", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn(`countries/${record?._id}`, () =>
                    dispatch(fetchCountries()),
                  );
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const columnPostCode = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Post Code",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "City",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("PostCode", record)}
          />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnDistricts = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.Branch,
        (record) => record.code,
      ),
      onFilter: (value, record) => (record.code || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Branch",
      dataIndex: "lookupname",
      key: "lookupname",
      sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.Branch,
        (record) => record.lookupname,
      ),
      onFilter: (value, record) =>
        (record.lookupname || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    // {
    //   title: "Region",
    //   dataIndex: "Parentlookup",
    //   key: "Parentlookup",
    // },
    {
      title: "Branch Manager",
      key: "officer",
      sorter: (a, b) => {
        const emailA =
          a.officer?.userEmail ||
          (typeof a.officer === "string" ? a.officer : "");
        const emailB =
          b.officer?.userEmail ||
          (typeof b.officer === "string" ? b.officer : "");
        return emailA.localeCompare(emailB);
      },
      filterDropdown: createFilterDropdown(groupedLookups?.Branch, (record) => {
        const o = record?.officer;
        if (!o) return "";
        return o.userEmail || (typeof o === "string" ? o : "");
      }),
      onFilter: (value, record) => {
        const o = record?.officer;
        const email = o?.userEmail || (typeof o === "string" ? o : "");
        return (email || "").toString() === value;
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      render: (_, record) => {
        const o = record?.officer;
        if (!o) return "-";
        if (typeof o === "object")
          return (
            o.userEmail ||
            `${o.userFirstName || ""} ${o.userLastName || ""}`.trim() ||
            "-"
          );
        return String(o);
      },
    },
    {
      title: "Active",

      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Districts", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id }, () => {
                    dispatch(resetLookups());
                    dispatch(getAllLookups());
                  });
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const columnStations = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.workLocation,
        (record) => record.code,
      ),
      onFilter: (value, record) => (record.code || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Work Location",
      dataIndex: "lookupname",
      key: "lookupname",
      sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.workLocation,
        (record) => record.lookupname,
      ),
      onFilter: (value, record) =>
        (record.lookupname || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      sorter: (a, b) =>
        (a.DisplayName || "").localeCompare(b.DisplayName || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.workLocation,
        (record) => record.DisplayName,
      ),
      onFilter: (value, record) =>
        (record.DisplayName || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Branch",
      dataIndex: "Parentlookup",
      key: "Parentlookup",
      sorter: (a, b) =>
        (a.Parentlookup || "").localeCompare(b.Parentlookup || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.workLocation,
        (record) => record.Parentlookup,
      ),
      onFilter: (value, record) =>
        (record.Parentlookup || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "IRO",
      key: "officer",
      sorter: (a, b) => {
        const emailA =
          a.officer?.userEmail ||
          (typeof a.officer === "string" ? a.officer : "");
        const emailB =
          b.officer?.userEmail ||
          (typeof b.officer === "string" ? b.officer : "");
        return emailA.localeCompare(emailB);
      },
      filterDropdown: createFilterDropdown(
        groupedLookups?.workLocation,
        (record) => {
          const o = record?.officer;
          if (!o) return "";
          return o.userEmail || (typeof o === "string" ? o : "");
        },
      ),
      onFilter: (value, record) => {
        const o = record?.officer;
        const email = o?.userEmail || (typeof o === "string" ? o : "");
        return (email || "").toString() === value;
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      render: (_, record) => {
        const o = record?.officer;
        if (!o) return "-";
        if (typeof o === "object") {
          return (
            o.userEmail ||
            `${o.userFirstName || ""} ${o.userLastName || ""}`.trim() ||
            "-"
          );
        }
        return String(o);
      },
    },
    {
      title: "Address",
      key: "worklocationAddress",
      render: (_, record) => {
        const addr = record?.worklocationAddress;
        if (!addr) return "-";
        return (
          [
            addr.buildingOrHouse,
            addr.streetOrRoad,
            addr.areaOrTown,
            addr.countyCityOrPostCode,
            addr.country,
            addr.eircode,
          ]
            .filter(Boolean)
            .join(", ") || "-"
        );
      },
    },
    {
      title: "Active",
      render: (_, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            style={{ marginRight: "10px", cursor: "pointer" }}
            onClick={() => loadLookupForEdit("Station", record)}
          />
          <AiFillDelete
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id }, () => {
                    dispatch(resetLookups());
                    dispatch(getAllLookups());
                  });
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const columnDivisions = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.Region,
        (record) => record.code,
      ),
      onFilter: (value, record) => (record.code || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Region",
      dataIndex: "lookupname",
      key: "lookupname",
      sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
      filterDropdown: createFilterDropdown(
        groupedLookups?.Region,
        (record) => record.lookupname,
      ),
      onFilter: (value, record) =>
        (record.lookupname || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    // {
    //   title: "County",
    //   dataIndex: "Parentlookup",
    //   key: "Parentlookup",
    // },
    {
      title: "Assigned Officer",
      key: "officer",
      sorter: (a, b) => {
        const emailA =
          a.officer?.userEmail ||
          (typeof a.officer === "string" ? a.officer : "");
        const emailB =
          b.officer?.userEmail ||
          (typeof b.officer === "string" ? b.officer : "");
        return emailA.localeCompare(emailB);
      },
      filterDropdown: createFilterDropdown(groupedLookups?.Region, (record) => {
        const o = record?.officer;
        if (!o) return "";
        return o.userEmail || (typeof o === "string" ? o : "");
      }),
      onFilter: (value, record) => {
        const o = record?.officer;
        const email = o?.userEmail || (typeof o === "string" ? o : "");
        return (email || "").toString() === value;
      },
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      render: (_, record) => {
        const o = record?.officer;
        if (!o) return "-";
        if (typeof o === "object")
          return (
            o.userEmail ||
            `${o.userFirstName || ""} ${o.userLastName || ""}`.trim() ||
            "-"
          );
        return String(o);
      },
    },
    {
      title: "Active",
      dataIndex: "Active",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Divisions", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id }, () => {
                    refreshLookups();
                  });
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const columnCity = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "City",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Active",
      render: (record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Cities", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                  dispatch(getAllLookups());
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const contactType = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Contact Type",
      dataIndex: "contactType",
      key: "contactType",
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => {
              IsUpdateFtn("ContactType", !isUpdateRec?.ContactType, record);
              addIdKeyToLookup(record?._id, "ContactType");
            }}
          />
          <AiFillDelete
            size={16}
            onClick={() => {
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn(`contact-types/${record?._id}`, null, () =>
                    dispatch(getContactTypes()),
                  );
                },
              });
            }}
          />
        </Space>
      ),
    },
  ];
  const columnLookupType = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Name",
      dataIndex: "lookuptype",
      key: "lookuptype",
      defaultSortOrder: "ascend",
      sorter: (a, b) => (a.lookuptype || "").localeCompare(b.lookuptype || ""),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      render: (_, record) =>
        record?.DisplayName || record?.displayname || record?.displayName || "",
      sorter: (a, b) =>
        (a.DisplayName || a.displayname || "").localeCompare(
          b.DisplayName || b.displayname || "",
        ),
    },

    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupTypeForEdit(record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn(
                    "/lookuptype/",
                    { id: record?._id },
                    () => refreshLookupTypes(),
                    true,
                    false,
                    false,
                  );
                },
              })
            }
            style={{ cursor: "pointer" }} // Change the cursor to pointer for better UX
          />
        </Space>
      ),
    },
  ];
  const columnRegionType = [
    {
      title: "Region Type",
      dataIndex: "RegionType",
      key: "RegionType",
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },

    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => {
              IsUpdateFtn("RegionType", !IsUpdateFtn?.RegionType, record);
              addIdKeyToLookup(record?._id, "RegionType");
            }}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn(`/lookuptype/${record?._id}`, null, () =>
                    dispatch(getAllRegionTypes()),
                  );
                },
              })
            }
            style={{ cursor: "pointer" }} // Change the cursor to pointer for better UX
          />
        </Space>
      ),
    },
  ];
  const columnLookup = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: "Lookup Type",
      key: "lookuptype",
      dataIndex: ["lookuptypeId", "lookuptype"],

      render: (_, record) => (
        <div>{record?.lookuptypeId?.lookuptype || "N/A"}</div>
      ),

      // Generate unique filters from the same table data
      filters: Array.from(
        new Set(
          (lookups || [])
            .map((item) => item?.lookuptypeId?.lookuptype)
            .filter(Boolean),
        ),
      ).map((value) => ({ text: value, value })),

      // Perform case-insensitive filtering
      onFilter: (value, record) => {
        const lookupType = record?.lookuptypeId?.lookuptype || "";
        return lookupType.toLowerCase() === value.toLowerCase();
      },
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox disabled={isDisable} checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Lookup", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id }, () => {
                    dispatch(resetLookups());
                    dispatch(getAllLookups());
                  });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  // Usage
  // const groupedLookups = groupByLookupType(lookups);

  const columnGender = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Gender", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnRanks = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Ranks", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnSections = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Section Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <FaEdit
            size={16}
            style={{ marginRight: "10px" }}
            onClick={() => loadLookupForEdit("Sections", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const SLColumns = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("SpokenLanguages", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const ProjectTypesColumns = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("ProjectTypes", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnTrainings = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Trainings", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnBoards = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Boards", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnStandardLookup = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive}></Checkbox>,
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
            onClick={() => loadLookupForEdit("StandardLookup", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnCouncils = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Councils",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
            onClick={() => loadLookupForEdit("Councils", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnCorrespondenceType = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Lookup Type",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
            onClick={() => loadLookupForEdit("CorrespondenceType", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () =>
                  deleteFtn("/lookup/", { id: record?._id }),
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columntTitles = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      // dataIndex: 'lookuptypeId',
      // key: 'lookuptypeId',
      filters: [
        { text: "A01", value: "A01" },
        { text: "B02", value: "B02" },
        { text: "C03", value: "C03" },
        // Add more filter options as needed
      ],
      // onFilter: (value, record) => record.RegionCode === value,
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Title", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnDuties = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      // dataIndex: 'lookuptypeId',
      // key: 'lookuptypeId',
      // filters: [
      //   { text: 'A01', value: 'A01' },
      //   { text: 'B02', value: 'B02' },
      //   { text: 'C03', value: 'C03' },
      //   // Add more filter options as needed
      // ],
      // onFilter: (value, record) => record.RegionCode === value,
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("Duties", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnMaritalStatus = [
    {
      title: "code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code), // Assumes RegionCode is a string
      sortDirections: ["ascend", "descend"], // Optional: Sets the sort order directions
    },
    {
      title: " Lookup Type ",
      filters: [
        { text: "A01", value: "A01" },
        { text: "B02", value: "B02" },
        { text: "C03", value: "C03" },
      ],
      render: (index, record) => <>{record?.lookuptypeId?.lookuptype}</>,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (index, record) => (
        <Checkbox checked={record?.isactive}></Checkbox>
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
            onClick={() => loadLookupForEdit("MaritalStatus", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];

  const Committeescolumns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Committee Name",
      dataIndex: "committeeName",
      key: "committeeName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Display Name",
      dataIndex: "displayName",
      key: "displayName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Parent",
      dataIndex: "parent",
      key: "parent",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (isactive) => <Checkbox checked={isactive}>Active</Checkbox>,
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
            onClick={() => loadLookupForEdit("Committees", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnDocumentType = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
            onClick={() => loadLookupForEdit("DocumentType", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const columnReasons = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: " Lookup Type ",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: " Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Lookup Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
            onClick={() => loadLookupForEdit("Reasons", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];
  const SubscriptionsColumn = [
    {
      title: "Short Name",
      dataIndex: "ShortName",
      key: "ShortName",
      verticalAlign: "center",
      width: 60,
      align: "center", // Horizontally center the content
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: "center",
      align: "center", // Horizontally center the content
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Alpha",
      dataIndex: "Alpha",
      key: "Alpha",
      verticalAlign: "center",
      align: "center", // Horizontally center the content
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Beta",
      dataIndex: "Beta",
      key: "Beta",
      verticalAlign: "center",
      align: "center", // Horizontally center the content
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: "center", display: "flex" }}
        >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];

  const RegionTypeColumnss = [
    {
      title: "RegionType",
      dataIndex: "RegionType",
      key: "RegionType",
      verticalAlign: "center",
      width: 60,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "DisplayName",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: "center",
      width: 60,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "HasChildren",
      dataIndex: "HasChildren",
      key: "HasChildren",
      verticalAlign: "center",
      width: 60,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: "center", display: "flex" }}
        >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
        </Space>
      ),
    },
  ];
  const columnRosterTypes = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Lookup Type",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
    },
    {
      title: "Roster Type Name",
      dataIndex: "lookupname",
      key: "lookupname",
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
            style={{ marginRight: "10px", cursor: "pointer" }}
            onClick={() => loadLookupForEdit("RosterType", record)}
          />
          <AiFillDelete
            size={16}
            style={{ cursor: "pointer" }}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do you want to delete this item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
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
      verticalAlign: "center",
      width: 60,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "DisplayName",
      dataIndex: "DisplayName",
      key: "DisplayName",
      verticalAlign: "center",
      width: 60,
      align: "center",
      render: (text) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            justifyContent: "center",
            verticalAlign: "center",
          }}
        >
          {text}
        </div>
      ),
    },

    {
      title: "Action",
      dataIndex: "DisplayName",
      render: (_, record) => (
        <Space
          size="middle"
          className="action-buttons"
          style={{ justifyContent: "center", display: "flex" }}
        >
          <FaEdit size={16} style={{ marginRight: "10px" }} />
          <AiFillDelete size={16} />
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
      RegionType: "Province",
      DisplayName: "Province",
      HasChildren: "1",
    },
    {
      key: "2",
      RegionTypeId: "2",
      RegionType: "County",
      DisplayName: "County",
      HasChildren: "1",
    },
    {
      key: "3",
      RegionTypeId: "3",
      RegionType: "Administerative Districts",
      DisplayName: "District",
      HasChildren: "1",
    },
    {
      key: "4",
      RegionTypeId: "4",
      RegionType: "City",
      DisplayName: "City",
      HasChildren: "1",
    },
    {
      key: "5",
      RegionTypeId: "5",
      RegionType: "PostCode",
      DisplayName: "PostCode",
      HasChildren: "0",
    },
  ];
  const ContactTy = [
    {
      key: "1",
      ContactTypeId: "1",
      ContactType: "office",
      DisplayName: "office",
    },
    {
      key: "2",
      ContactTypeId: "2",
      ContactType: "office",
      DisplayName: "office",
    },
    {
      key: "3",
      ContactTypeId: "3",
      ContactType: "office",
      DisplayName: "office",
    },
  ];

  const columnSchemes = [
    { title: "Scheme Name", dataIndex: "lookupname", key: "lookupname" },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />{" "}
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
            onClick={() => loadLookupForEdit("Schemes", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
        </Space>
      ),
    },
  ];

  const [selectionType, setSelectionType] = useState("checkbox");
  const [errors, setErrors] = useState({});
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {},
    getCheckboxProps: (record) => ({
      disabled: record.name === "Disabled User",
      name: record.name,
    }),
  };
  const validateForm = (drawerType) => {
    let newErrors = { Lookup: {}, [drawerType]: {} };

    const currentInput = drawerIpnuts?.[drawerType] || {};

    // Code is required for all EXCEPT Bookmarks
    if (drawerType !== "Bookmarks" && !currentInput.code) {
      newErrors[drawerType].code = true;
    }

    // Special case: "Countries" uses 'name' instead of 'lookupname'
    if (drawerType === "Countries") {
      if (!currentInput.name) {
        newErrors[drawerType].name = true;
      }
      if (!currentInput.callingCodes) {
        newErrors[drawerType].callingCodes = true;
      }
    }
    // Special case: "ContactType" uses 'contactType' instead of 'lookupname'
    else if (drawerType === "ContactType") {
      if (!currentInput.contactType) {
        newErrors[drawerType].contactType = true;
      }
    } else if (drawerType === "LookupType") {
      if (!currentInput.lookuptype) {
        newErrors[drawerType].lookuptype = true;
      }
    }
    // Special case: "Bookmarks" uses 'key' and 'label' instead of 'lookupname'
    else if (drawerType === "Bookmarks") {
      if (!currentInput.key) {
        newErrors[drawerType].key = true;
      }
      if (!currentInput.label) {
        newErrors[drawerType].label = true;
      }
      if (!currentInput.path) {
        newErrors[drawerType].path = true;
      }
      if (!currentInput.dataType) {
        newErrors[drawerType].dataType = true;
      }
      // Note: code is NOT required for Bookmarks
    }
    // Default case: other drawers use 'lookupname'
    else if (drawerType !== "LookupType" && drawerType !== "RegionType") {
      if (!currentInput.lookupname) {
        newErrors[drawerType].lookupname = true;
      }
    }

    if (drawerType !== "LookupType") {
      const lookuptypeId =
        currentInput.lookuptypeId?._id ||
        currentInput.lookuptypeId ||
        getLookupTypeRecordForDrawer(drawerType, lookupsTypes)?._id;
      if (
        lookupTypeRequiresParent(lookupsTypes, lookuptypeId, drawerType) &&
        !currentInput.Parentlookupid
      ) {
        newErrors[drawerType].Parentlookupid = true;
      }
    }

    setErrors(newErrors);

    // Return true if no errors
    const noErrors = Object.keys(newErrors[drawerType]).length === 0;
    return noErrors;
  };

  const validateSolicitors = (drawerType) => {
    let newErrors = { [drawerType]: {} };

    if (drawerType === "Solicitors") {
      const solicitor = drawerIpnuts?.Solicitors || {};

      if (!solicitor?.forename) {
        newErrors[drawerType].forename = "Required";
      }
      if (!solicitor?.surname) {
        newErrors[drawerType].surname = "Required";
      }
      if (!solicitor?.contactEmail) {
        newErrors[drawerType].contactEmail = "Required";
      }
      if (!solicitor?.contactPhone) {
        newErrors[drawerType].contactPhone = "Required";
      }
      if (!solicitor?.contactAddress?.buildingOrHouse) {
        newErrors[drawerType].buildingOrHouse = "Required";
      }
      if (!solicitor?.contactAddress?.areaOrTown) {
        newErrors[drawerType].areaOrTown = "Required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors[drawerType]).length === 0;
  };

  const membershipModalFtn = () => setMembershipModal(!membershipModal);
  const partnershipModalFtn = () => setPartnershipModal(!partnershipModal);
  const dummyModalFtn = () => setDummyModal(!dummyModal);
  const subscriptionsModalFtn = () =>
    setIsSubscriptionsModal(!isSubscriptionsModal);
  const profileModalOpenCloseFtn = () => setisProfileModal(!isProfileModal);
  const addprofileModalOpenCloseFtn = () =>
    setisAddProfileModal(!isAddProfileModal);
  const RegionTypeModalOpenCloseFtn = () =>
    setisRegionTypeModal(!isRegionTypeModal);
  const addRegionTypeModalOpenCloseFtn = () =>
    setisAddRegionTypeModal(!isAddRegionTypeModal);
  const ContactTypeModalOpenCloseFtn = () =>
    setisContactTypeModal(!isContactTypeModal);
  const addContactTypeModalOpenCloseFtn = () =>
    setisAddContactTypeModal(!isAddContactTypeModal);
  const addmembershipFtn = () => {};

  const AddpartnershipFtn = () => {};

  const AddprofileModalFtn = () => {};

  const AddRegionTypeModalFtn = () => {};

  const AddContactTypeModalFtn = () => {};

  const AddSubscriptionsFtn = () => {};

  const columnClaimType = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Lookup Type",
      dataIndex: "lookuptype",
      key: "lookuptype",
      render: (_, record) => record?.lookuptypeId?.lookuptype,
    },
    { title: "Display Name", dataIndex: "DisplayName", key: "DisplayName" },
    { title: "Name", dataIndex: "lookupname", key: "lookupname" },
    {
      title: "Active",
      dataIndex: "isactive",
      key: "isactive",
      render: (_, record) => <Checkbox checked={record?.isactive} />,
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
          <FaRegCircleQuestion size={16} style={{ marginRight: "8px" }} />{" "}
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
            onClick={() => loadLookupForEdit("ClaimType", record)}
          />
          <AiFillDelete
            size={16}
            onClick={() =>
              MyConfirm({
                title: "Confirm Deletion",
                message: "Do You Want To Delete This Item?",
                onConfirm: async () => {
                  await deleteFtn("/lookup/", { id: record?._id });
                },
              })
            }
          />
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
  // const { Search } = Input;

  // Updated table columns with Region filter
  const uniqueRegionNames = useMemo(() => {
    if (!branchesWithRegionData.length) return [];
    return Array.from(
      new Set(
        branchesWithRegionData
          .map((item) => item.regionName)
          .filter((name) => name),
      ),
    );
  }, [branchesWithRegionData]);

  // Create columns array with Region as second last
  const columnsWithRegion = useMemo(() => {
    // Assuming the last column is Action (as per your screenshot)
    const allColumnsExceptLast = columnDistricts.slice(0, -1);
    const lastColumn = columnDistricts[columnDistricts.length - 1];

    // Create the Region column
    const regionColumn = {
      title: "Region",
      dataIndex: "regionName",
      key: "regionName",
      sorter: (a, b) => (a.regionName || "").localeCompare(b.regionName || ""),
      filterDropdown: createFilterDropdown(
        branchesWithRegionData,
        (record) => record.regionName,
      ),
      onFilter: (value, record) =>
        (record.regionName || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    };

    // Return columns in correct order: [...other columns, Region, Action]
    return [...allColumnsExceptLast, regionColumn, lastColumn];
  }, [columnDistricts, uniqueRegionNames]);

  const lookupTypeSelectProps = (drawerKey) =>
    getLookupTypeFieldProps(
      drawerKey,
      lookupsTypes,
      drawerIpnuts?.[drawerKey]?.lookuptypeId,
    );

  return (
    <div
      className="bg-gray-50 mb-4 configuration-main"
      style={{ paddingBottom: "120px" }}
    >
      {/* <div className="text-center mb-4">
        <h1 className="fw-bold mb-1">Configuration</h1>
        <p className="text-muted mb-0">System configuration and lookup management</p>
      </div> */}
      {/* Search Bar */}
      <div
        className="d-flex flex-column mb-4 pb-4"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="text-center "
          style={{ flexShrink: 0, marginTop: "-4px" }}
        >
          <h1 className="fw-bold">Configuration</h1>
          <p className="text-muted mb-0">
            System configuration and lookup management
          </p>
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
        <div
          className="bg-white rounded shadow-sm p-4 flex-grow-1 hide-scroll-webkit"
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 200px)",
            paddingBottom: "100px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {(() => {
            const filteredItems = configurationCards.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase()),
            );

            return filteredItems.length > 0 ? (
              <div className="row gx-3 gy-3 mb-4 pb-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.lookupTypeId || item.key}
                    className="col-6 col-sm-4 col-md-3 col-lg-1-5 d-flex"
                  >
                    <div
                      onClick={() => openConfigurationCard(item)}
                      className="d-flex flex-column align-items-center justify-content-center border rounded bg-white p-4 w-100 text-center hover-shadow"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="mb-2">{item.icon}</div>
                      <p className="mb-0 small fw-medium text-dark">
                        {item.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0 text-center">
                {searchQuery
                  ? `No matches for "${searchQuery}".`
                  : "No lookup types found."}
              </p>
            );
          })()}
          {lookupsTypesloading &&
            (!lookupsTypes || lookupsTypes.length === 0) && (
              <p className="text-muted small mb-0 text-center">
                Loading lookup types...
              </p>
            )}
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
          size="small"
          rowKey={(record, index) =>
            record._id || record.id || record.key || index
          }
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
                pageSize={500}
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
          size="small"
          rowKey={(record, index) =>
            record._id || record.id || record.key || index
          }
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
                pageSize={500}
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
          <Input disabled={isDisable} placeholder="Please enter dummy field" />
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
          size="small"
          rowKey={(record, index) =>
            record._id || record.id || record.key || index
          }
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
          size="small"
          rowKey={(record, index) =>
            record._id || record.id || record.key || index
          }
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
                pageSize={500}
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

        {/* <Table
          columns={ProfileColumns}
          pagination={false}
          dataSource={tableData}
          className="drawer-tbl"
              size="small"
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
                pageSize={500}
              />
            </div>
          )}
        /> */}
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
              onChange={(e) =>
                handleInputChange00("RegionType", e.target.value)
              }
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter DisplayName"
              onChange={(e) =>
                handleInputChange00("DisplayName", e.target.value)
              }
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
          size="small"
          rowKey={(record, index) =>
            record._id || record.id || record.key || index
          }
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
                pageSize={500}
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
              onChange={(e) =>
                handleInputChange01("ContactType", e.target.value)
              }
            />
          </div>

          <div className="input-group">
            <p className="inpt-lbl">Display Name</p>
            <Input
              disabled={isDisable}
              placeholder="Please enter DisplayName"
              onChange={(e) =>
                handleInputChange01("DisplayName", e.target.value)
              }
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
          size="small"
          rowKey={(record, index) =>
            record._id || record.id || record.key || index
          }
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
                pageSize={500}
              />
            </div>
          )}
        />
      </MyDrawer>
      <MyDrawer
        isPagination={true}
        total={data?.county?.length}
        title="counties"
        open={drawerOpen?.counties}
        isLoading={lookupDetailLoading && editingLookupDrawer === "counties"}
        onClose={() => openCloseDrawerFtn("counties")}
        isEdit={isUpdateRec?.counties}
        add={async () => {
          if (!validateForm("counties")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.counties,
            "Data inserted successfully:",
            "Data did not insert:",
            () => resetCounteries("counties", dispatch(getAllLookups())),
          );
        }}
        update={async () => {
          if (!validateForm("counties")) return;
          await updateFtn("/lookup", drawerIpnuts?.counties, () =>
            resetCounteries("counties", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("counties", false);
        }}
        addLoading={buttonLoading.insert}
        updateLoading={buttonLoading.update}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={12}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                placeholder="Enter code"
                value={drawerIpnuts?.counties?.code}
                onChange={(e) =>
                  drawrInptChng("counties", "code", e.target.value)
                }
                required
                hasError={!!errors?.counties?.code}
                disabled={isDisable}
              />
            </Col>

            <Col span={12}>
              <MyInput
                label="County Name:"
                name="lookupname"
                placeholder="Enter county name"
                value={drawerIpnuts?.counties?.lookupname}
                onChange={(e) =>
                  drawrInptChng("counties", "lookupname", e.target.value)
                }
                required
                hasError={!!errors?.counties?.lookupname}
                disabled={isDisable}
              />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                placeholder="Enter display name"
                value={drawerIpnuts?.counties?.DisplayName}
                onChange={(e) =>
                  drawrInptChng("counties", "DisplayName", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Counteries?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="counties"
              lookuptypeId={drawerIpnuts?.counties?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.counties?.Parentlookupid}
              parentLabel={drawerIpnuts?.counties?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.counties?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.counties?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.counties?.lookuptypeId,
              )}
              hasError={!!errors?.counties?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("counties", payload)
              }
            />
          </Row>

          <Checkbox
            checked={drawerIpnuts?.counties?.isactive}
            onChange={(e) =>
              drawrInptChng("counties", "isactive", e.target.checked)
            }
            disabled={isDisable}
          >
            Active
          </Checkbox>

          <div className="mt-4 config-tbl-container">
            <p>History</p>
            <Table
              pagination={{ pageSize: 500 }}
              columns={columnCountry}
              loading={lookupsloading}
              dataSource={groupedLookups?.County}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Provinces"
        open={drawerOpen?.Provinces}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Provinces"}
        isPagination={true}
        onClose={() => openCloseDrawerFtn("Provinces")}
        add={async () => {
          if (!validateForm("Provinces")) return;
          try {
            await insertDataFtn(
              `/lookup`,
              drawerIpnuts?.Provinces,
              "Province added successfully!",
              "Failed to add province",
              null,
            );
            resetCounteries("Provinces", () => dispatch(getAllLookups()));
          } catch (error) {
            console.error("Error adding province:", error);
          }
        }}
        width="1100px"
        isEdit={isUpdateRec?.Provinces}
        update={async () => {
          if (!validateForm("Provinces")) return;
          await updateFtn("/lookup", drawerIpnuts?.Provinces, () =>
            resetCounteries("Provinces", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Provinces", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Provinces?.code}
                onChange={(e) =>
                  drawrInptChng("Provinces", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Provinces?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Province:"
                name="lookupname"
                value={drawerIpnuts?.Provinces?.lookupname}
                onChange={(e) =>
                  drawrInptChng("Provinces", "lookupname", e.target.value)
                }
                placeholder="Enter province"
                disabled={isDisable}
                required
                hasError={!!errors?.Provinces?.lookupname}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Provinces?.DisplayName}
                onChange={(e) =>
                  drawrInptChng("Provinces", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Provinces"
              lookuptypeId={drawerIpnuts?.Provinces?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Provinces?.Parentlookupid}
              parentLabel={drawerIpnuts?.Provinces?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Provinces?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Provinces?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Provinces?.lookuptypeId,
              )}
              hasError={!!errors?.Provinces?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Provinces", payload)
              }
            />
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Provinces", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Provinces?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Provinces</h6>
            <Table
              pagination={false}
              columns={columnProvince}
              loading={lookupsloading}
              dataSource={groupedLookups?.Provinces}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Countries"
        open={drawerOpen?.Countries}
        // isPagination={true}
        total={countriesData?.length}
        onClose={() => openCloseDrawerFtn("Countries")}
        add={() => {
          if (!validateForm("Countries")) return;
          insertDataFtn(
            `/countries`,
            drawerIpnuts?.Countries,
            "Data inserted successfully:",
            "Data did not insert:",
            () => resetCounteries("Countries", dispatch(fetchCountries())),
          );
        }}
        width="1100px"
        isEdit={isUpdateRec?.Countries}
        update={async () => {
          if (!validateForm("Countries")) return;
          await updateCountiesFtn(`/countries`, drawerIpnuts?.Countries, () =>
            resetCounteries("Countries", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Countries", false);
        }}
        addLoading={buttonLoading.insert}
        updateLoading={buttonLoading.update}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Countries?.code}
                onChange={(e) =>
                  drawrInptChng("Countries", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Countries?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Country:"
                name="lookupname"
                value={drawerIpnuts?.Countries?.name}
                onChange={(e) =>
                  drawrInptChng("Countries", "name", e.target.value)
                }
                placeholder="Enter Country"
                disabled={isDisable}
                required
                hasError={!!errors?.Countries?.name}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="displayname"
                value={drawerIpnuts?.Countries?.displayname}
                onChange={(e) =>
                  drawrInptChng("Countries", "displayname", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Calling Codes"
                name="callingCodes"
                value={drawerIpnuts?.Countries?.callingCodes}
                onChange={(e) =>
                  drawrInptChng("Countries", "callingCodes", e.target.value)
                }
                placeholder="Enter Calling Codes"
                disabled={isDisable}
                required
                hasError={!!errors?.Countries?.callingCodes}
              />
            </Col>
          </Row>
          <Row>
            {/* <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Countries", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Countries?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col> */}
          </Row>
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Countries</h6>
            <Table
              pagination={true}
              columns={countiesColumn}
              loading={lookupsloading}
              dataSource={countriesData}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="City"
        open={drawerOpen?.Cities}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Cities"}
        isPagination={true}
        isEdit={isUpdateRec?.Cities}
        onClose={() => openCloseDrawerFtn("Cities")}
        add={() => {
          if (!validateForm("Cities")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Cities,
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("Cities");
              dispatch(getAllLookups());
            },
          );
          dispatch(getAllLookups());
        }}
        update={async () => {
          if (!validateForm("Cities")) return;
          await updateFtn("/lookup", drawerIpnuts?.Cities, () =>
            resetCounteries("Cities", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Cities", false);
        }}
        addLoading={buttonLoading.insert}
        updateLoading={buttonLoading.update}
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
                  <MySelect
                    placeholder="City"
                    isSimple={true}
                    disabled={true}
                  />
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) =>
                      drawrInptChng("Cities", "code", e.target.value)
                    }
                    value={drawerIpnuts?.Cities?.code}
                  />
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) => {
                      drawrInptChng("Cities", "lookupname", e.target.value);
                    }}
                    value={drawerIpnuts?.Cities?.lookupname}
                  />
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(e) =>
                      drawrInptChng("Cities", "DisplayName", e.target.value)
                    }
                    value={drawerIpnuts?.Cities?.DisplayName}
                  />
                </div>
                {/* <p className="error">{errors?.Cities?.}</p> */}
              </div>
            </div>
            <Row gutter={24} style={{ marginTop: 8 }}>
              <ParentLookupSelect
                drawerKey="Cities"
                lookuptypeId={drawerIpnuts?.Cities?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Cities?.Parentlookupid}
                parentLabel={drawerIpnuts?.Cities?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Cities?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Cities?.Parentlookuptype}
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Cities?.lookuptypeId,
                )}
                hasError={!!errors?.Cities?.Parentlookupid}
                span={24}
                onChange={(payload) =>
                  handleParentLookupChange("Cities", payload)
                }
              />
            </Row>
            <div className="drawer-inpts-container">
              <div className="drawer-lbl-container">
                <p></p>
              </div>
              <div className="inpt-con">
                <p className="star-white">*</p>
                <div className="inpt-sub-con">
                  <Checkbox
                    disabled={isDisable}
                    checked={drawerIpnuts?.Cities?.isactive}
                    onChange={(e) =>
                      drawrInptChng("Cities", "isactive", e.target.checked)
                    }
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
              columns={columnCity}
              loading={lookupsloading}
              dataSource={data?.Cities}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Post Code"
        open={drawerOpen?.PostCode}
        isLoading={lookupDetailLoading && editingLookupDrawer === "PostCode"}
        isPagination={true}
        isEdit={isUpdateRec?.PostCode}
        onClose={() => {
          openCloseDrawerFtn("PostCode");
          IsUpdateFtn("PostCode", false);
        }}
        add={() => {
          if (!validateForm("PostCode")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.PostCode,
            "Data inserted successfully:",
            "Data did not insert:",
            () => resetCounteries("PostCode", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        update={async () => {
          if (!validateForm("PostCode")) return;
          await updateFtn("/lookup", drawerIpnuts?.PostCode, () =>
            resetCounteries("PostCode", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("PostCode", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Post Code */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.PostCode?.code || ""}
                onChange={(e) =>
                  drawrInptChng("PostCode", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.PostCode?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Post Code:"
                name="postcode"
                value={drawerIpnuts?.PostCode?.postcode || ""}
                onChange={(e) =>
                  drawrInptChng("PostCode", "postcode", e.target.value)
                }
                placeholder="Enter post code"
                disabled={isDisable}
                required
                hasError={!!errors?.PostCode?.postcode}
              />
            </Col>
          </Row>

          {/* Display Name + City */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.PostCode?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("PostCode", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.PostCode?.DisplayName}
              />
            </Col>
            <Col span={12}>
              <CustomSelect
                label="City:"
                name="cityId"
                value={drawerIpnuts?.PostCode?.cityId || ""}
                options={selectLokups?.Cities || []}
                onChange={(val) => drawrInptChng("PostCode", "cityId", val)}
                isSimple={true}
                disabled={isDisable}
                required
                hasError={!!errors?.PostCode?.cityId}
              />
            </Col>
          </Row>

          {/* Active */}
          <Row>
            <Col span={24}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("PostCode", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.PostCode?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Post Codes Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Post Codes</h6>
            <Table
              pagination={false}
              columns={columnPostCode}
              dataSource={groupedLookups["Post Code"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Branch"
        open={drawerOpen?.Districts}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Districts"}
        // isPagination={true}
        onClose={() => openCloseDrawerFtn("Districts")}
        isEdit={isUpdateRec?.Districts}
        isContact={true}
        update={async () => {
          if (!validateForm("Districts")) return;
          await updateFtn("/lookup", drawerIpnuts?.Districts, () => {
            resetCounteries("Districts");
            refreshLookups();
          });
          IsUpdateFtn("Districts", false);
        }}
        add={() => {
          if (!validateForm("Districts")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Districts,
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("Districts");
              refreshLookups();
            },
          );
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={24}>
              <CustomSelect
                label="Branch Officer"
                placeholder="Select Branch Manager"
                options={iroUsers.map((user) => ({
                  key: user._id,
                  label:
                    `${user.userFirstName || ""} ${user.userLastName || ""} (${user.userEmail || "No Email"})`.trim(),
                }))}
                value={
                  drawerIpnuts?.Districts?.officer?._id ||
                  drawerIpnuts?.Districts?.officer
                }
                // onChange={(e) => drawrInptChng("Districts", "officer", e.target.value)}
                onChange={(e) =>
                  drawrInptChng(
                    "Districts",
                    "officer",
                    e.target.value === "" ? null : e.target.value,
                  )
                }
                isIDs={true}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                placeholder="Enter code"
                value={drawerIpnuts?.Districts?.code}
                onChange={(e) =>
                  drawrInptChng("Districts", "code", e.target.value)
                }
                required
                hasError={!!errors?.Districts?.code}
                disabled={isDisable}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Branch"
                name="lookupname"
                placeholder="Enter branch name"
                value={drawerIpnuts?.Districts?.lookupname}
                onChange={(e) =>
                  drawrInptChng("Districts", "lookupname", e.target.value)
                }
                required
                hasError={!!errors?.Districts?.lookupname}
                disabled={isDisable}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                placeholder="Enter display name"
                value={drawerIpnuts?.Districts?.DisplayName}
                onChange={(e) =>
                  drawrInptChng("Districts", "DisplayName", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Districts?.DisplayName}
              />
            </Col>
          </Row>

          <Row gutter={24} className="config-drawer-parent-action-row" wrap={false}>
            <ParentLookupSelect
              drawerKey="Districts"
              lookuptypeId={drawerIpnuts?.Districts?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Districts?.Parentlookupid}
              parentLabel={drawerIpnuts?.Districts?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Districts?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Districts?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Districts?.lookuptypeId,
              )}
              hasError={!!errors?.Districts?.Parentlookupid}
              span={12}
              onChange={(payload) =>
                handleParentLookupChange("Districts", payload)
              }
            />
            <Col span={4} className="config-drawer-add-col">
              <Button
                className="butn primary-btn detail-btn config-drawer-add-btn"
                onClick={() => openCloseDrawerFtn("DivisionsForDistrict")}
              >
                +
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                checked={drawerIpnuts?.Districts?.isactive}
                onChange={(e) =>
                  drawrInptChng("Districts", "isactive", e.target.checked)
                }
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          <div className="mt-4 config-tbl-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h6 className="m-0 text-primary">Existing Branches</h6>
              <Button
                style={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px",
                }}
                onClick={() =>
                  navigate("/branch", { state: { search: "Branch" } })
                }
              >
                <FaArrowUpRightFromSquare size={14} />
              </Button>
            </div>
            <MyInput
              placeholder="Search branches..."
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              value={searchTermBranch}
              onChange={handleBranchSearchChange}
              onClear={clearBranchSearch}
              allowClear
            />
            <Table
              columns={columnsWithRegion}
              loading={lookupsloading}
              dataSource={filteredBranches}
              className="drawer-tbl"
              size="small"
              scroll={{ x: "max-content" }}
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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

        {/* Nested Regions Drawer */}
        <MyDrawer
          title="Regions"
          open={drawerOpen?.DivisionsForDistrict}
          isLoading={
            lookupDetailLoading &&
            editingLookupDrawer === "DivisionsForDistrict"
          }
          isPagination={true}
          isContact={true}
          onClose={() => openCloseDrawerFtn("DivisionsForDistrict")}
          add={() => {
            if (!validateForm("Divisions")) return;
            insertDataFtn(
              `/lookup`,
              drawerIpnuts?.Divisions,
              "Data inserted successfully:",
              "Data did not insert:",
              () => {
                resetCounteries("Divisions");
                refreshLookups();
              },
            );
          }}
          update={async () => {
            if (!validateForm("Divisions")) return;
            await updateFtn("/lookup", drawerIpnuts?.Divisions, () => {
              resetCounteries("Divisions");
              refreshLookups();
            });
            IsUpdateFtn("Divisions", false);
          }}
          isEdit={isUpdateRec?.Divisions}
        >
          <div className="drawer-main-cntainer p-4 me-2 ms-2">
            <Row gutter={24}>
              <Col span={12}>
                <CustomSelect
                  label="Region Officer"
                  placeholder="Select Region Officer"
                  options={iroUsers.map((user) => ({
                    key: user._id,
                    label:
                      `${user.userFirstName || ""} ${user.userLastName || ""} (${user.userEmail || "No Email"})`.trim(),
                  }))}
                  value={
                    drawerIpnuts?.Divisions?.officer?._id ||
                    drawerIpnuts?.Divisions?.officer
                  }
                  // onChange={(e) => drawrInptChng("Divisions", "officer", e.target.value)}
                  onChange={(e) =>
                    drawrInptChng(
                      "Divisions",
                      "officer",
                      e.target.value === "" ? null : e.target.value,
                    )
                  }
                  isIDs={true}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  placeholder="Enter code"
                  value={drawerIpnuts?.Divisions?.code}
                  onChange={(e) =>
                    drawrInptChng("Divisions", "code", e.target.value)
                  }
                  required
                  hasError={!!errors?.Divisions?.code}
                  disabled={isDisable}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Region"
                  name="lookupname"
                  placeholder="Enter region name"
                  value={drawerIpnuts?.Divisions?.lookupname}
                  onChange={(e) =>
                    drawrInptChng("Divisions", "lookupname", e.target.value)
                  }
                  required
                  hasError={!!errors?.Divisions?.lookupname}
                  disabled={isDisable}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  placeholder="Enter display name"
                  value={drawerIpnuts?.Divisions?.DisplayName}
                  onChange={(e) =>
                    drawrInptChng("Divisions", "DisplayName", e.target.value)
                  }
                  disabled={isDisable}
                />
              </Col>
              <Col span={12}>
                {/* <CustomSelect
                  label="County"
                  placeholder="Select County"
                  options={selectLokups?.Counteries}
                  onChange={(val) =>
                    drawrInptChng("Divisions", "Parentlookupid", val)
                  }
                  value={drawerIpnuts?.Divisions?.Parentlookupid}
                  required
                  hasError={!!errors?.Divisions?.parentLookup}
                  disabled={isDisable}
                /> */}
              </Col>
            </Row>

            <Row>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.Divisions?.isactive}
                  onChange={(e) =>
                    drawrInptChng("Divisions", "isactive", e.target.checked)
                  }
                  style={{ marginTop: "26px" }}
                >
                  Active
                </Checkbox>
              </Col>
            </Row>

            <div className="mt-4 config-tbl-container">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <h6 className="m-0 text-primary">Existing Regions</h6>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <Input
                    placeholder="Search Regions..."
                    prefix={<SearchOutlined />}
                    value={searchTermRegion}
                    onChange={handleRegionSearchChange}
                    style={{ width: 200 }}
                    allowClear
                  />
                  <Button
                    style={{
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 10px",
                    }}
                    onClick={() =>
                      navigate("/region", { state: { search: "Region" } })
                    }
                  >
                    <FaArrowUpRightFromSquare size={14} />
                  </Button>
                </div>
              </div>
              <Table
                pagination={{ pageSize: 500 }}
                columns={columnDivisions}
                dataSource={filteredRegions}
                loading={lookupsloading}
                className="drawer-tbl"
                size="small"
                rowKey={(record, index) =>
                  record._id || record.id || record.key || index
                }
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
        title="Regions"
        open={drawerOpen?.Divisions}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Divisions"}
        isPagination={true}
        isContact={true}
        onClose={() => openCloseDrawerFtn("Divisions")}
        isEdit={isUpdateRec?.Divisions}
        add={() => {
          if (!validateForm("Divisions")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Divisions,
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("Divisions");
              refreshLookups();
            },
          );
        }}
        update={async () => {
          if (!validateForm("Divisions")) return;
          await updateFtn("/lookup", drawerIpnuts?.Divisions, () => {
            resetCounteries("Divisions");
            refreshLookups();
          });
          IsUpdateFtn("Divisions", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <CustomSelect
                label="Region Officer"
                placeholder="Select Region Officer"
                options={iroUsers.map((user) => ({
                  key: user._id,
                  label:
                    `${user.userFirstName || ""} ${user.userLastName || ""} (${user.userEmail || "No Email"})`.trim(),
                }))}
                value={
                  drawerIpnuts?.Divisions?.officer?._id ||
                  drawerIpnuts?.Divisions?.officer
                }
                onChange={(e) =>
                  drawrInptChng("Divisions", "officer", e.target.value)
                }
                isIDs={true}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                required
                value={drawerIpnuts?.Divisions?.code}
                onChange={(e) =>
                  drawrInptChng("Divisions", "code", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Divisions?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Region"
                required
                value={drawerIpnuts?.Divisions?.lookupname}
                onChange={(e) =>
                  drawrInptChng("Divisions", "lookupname", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Divisions?.lookupname}
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                value={drawerIpnuts?.Divisions?.DisplayName}
                onChange={(e) =>
                  drawrInptChng("Divisions", "DisplayName", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Divisions?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Divisions"
              lookuptypeId={drawerIpnuts?.Divisions?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Divisions?.Parentlookupid}
              parentLabel={drawerIpnuts?.Divisions?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Divisions?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Divisions?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Divisions?.lookuptypeId,
              )}
              hasError={!!errors?.Divisions?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Divisions", payload)
              }
            />
          </Row>

          <Checkbox
            disabled={isDisable}
            checked={drawerIpnuts?.Divisions?.isactive}
            onChange={(e) =>
              drawrInptChng("Divisions", "isactive", e.target.checked)
            }
          >
            Active
          </Checkbox>

          <div className="mt-4 config-tbl-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h6 className="m-0 text-primary">Existing Regions</h6>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <Input
                  placeholder="Search Regions..."
                  prefix={<SearchOutlined />}
                  value={searchTermRegion}
                  onChange={handleRegionSearchChange}
                  style={{ width: 200 }}
                  allowClear
                />
                <Button
                  style={{
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 10px",
                  }}
                  onClick={() =>
                    navigate("/region", { state: { search: "Region" } })
                  }
                >
                  <FaArrowUpRightFromSquare size={14} />
                </Button>
              </div>
            </div>
            <Table
              pagination={{ pageSize: 500 }}
              columns={columnDivisions}
              dataSource={filteredRegions}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Work Location"
        isContact={true}
        open={drawerOpen?.Station}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Station"}
        // isPagination={true}
        onClose={() => openCloseDrawerFtn("Station")}
        add={() => {
          if (!validateForm("Station")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Station,
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("Station");
              refreshLookups();
            },
          );
        }}
        isEdit={isUpdateRec?.Station}
        update={async () => {
          if (!validateForm("Station")) return;
          await updateFtn("/lookup", drawerIpnuts?.Station, () => {
            resetCounteries("Station");
            refreshLookups();
          });
          IsUpdateFtn("Station", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-2">
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.Station?.code}
                  onChange={(val) =>
                    drawrInptChng("Station", "code", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.Station?.code}
                  errorMessage={errors?.Station?.code}
                  required
                />
              </Col>
              <Col span={12}>
                <CustomSelect
                  label="Officer (IRO)"
                  placeholder="Select Officer"
                  options={iroUsers.map((user) => ({
                    key: user._id,
                    label:
                      `${user.userFirstName || ""} ${user.userLastName || ""} (${user.userEmail || "No Email"})`.trim(),
                  }))}
                  value={
                    drawerIpnuts?.Station?.officer?._id ||
                    drawerIpnuts?.Station?.officer
                  }
                  // onChange={(e) => drawrInptChng("Station", "officer", e.target.value)}
                  onChange={(e) =>
                    drawrInptChng(
                      "Station",
                      "officer",
                      e.target.value === "" ? null : e.target.value,
                    )
                  }
                  isIDs={true}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Work Location Name"
                  name="lookupname"
                  value={drawerIpnuts?.Station?.lookupname}
                  onChange={(val) =>
                    drawrInptChng("Station", "lookupname", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.Station?.lookupname}
                  errorMessage={errors?.Station?.lookupname}
                  required
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.Station?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng("Station", "DisplayName", val.target.value)
                  }
                  disabled={isDisable}
                />
              </Col>
            </Row>

            <Row gutter={24} className="config-drawer-parent-action-row" wrap={false}>
              <ParentLookupSelect
                drawerKey="Station"
                lookuptypeId={drawerIpnuts?.Station?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Station?.Parentlookupid}
                parentLabel={drawerIpnuts?.Station?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Station?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Station?.Parentlookuptype}
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Station?.lookuptypeId,
                )}
                hasError={!!errors?.Station?.Parentlookupid}
                span={12}
                onChange={(payload) =>
                  handleParentLookupChange("Station", payload)
                }
              />
              <Col span={4} className="config-drawer-add-col">
                <Button
                  className="butn primary-btn detail-btn config-drawer-add-btn"
                  onClick={() => openCloseDrawerFtn("Districts")}
                >
                  +
                </Button>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.Station?.isactive}
                  onChange={(e) =>
                    drawrInptChng("Station", "isactive", e.target.checked)
                  }
                >
                  Active
                </Checkbox>
              </Col>
            </Row>

            <Row gutter={24} style={{ marginTop: 16 }}>
              <Col span={24}>
                <div className="mt-1 mb-2">
                  <h4
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1a1a1a",
                      margin: 0,
                      paddingBottom: "4px",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    Address
                  </h4>
                </div>
              </Col>

              {/* Eircode / address search */}
              <Col span={24}>
                {isMapsLoaded && (
                  <StandaloneSearchBox
                    onLoad={(ref) => (addressInputRef.current = ref)}
                    onPlacesChanged={handleStationPlacesChanged}
                  >
                    <MyInput
                      label="Search by Address or Eircode"
                      name="addressSearch"
                      placeholder="Enter Eircode (e.g., D01X4X0) or address"
                      disabled={isDisable}
                      value={addressSearchValue}
                      onChange={(e) => setAddressSearchValue(e.target.value)}
                    />
                  </StandaloneSearchBox>
                )}
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 1 (Building or House)"
                  name="buildingOrHouse"
                  value={
                    drawerIpnuts?.Station?.worklocationAddress?.buildingOrHouse
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "Station",
                      "worklocationAddress.buildingOrHouse",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 2 (Street or Road)"
                  name="streetOrRoad"
                  value={
                    drawerIpnuts?.Station?.worklocationAddress?.streetOrRoad
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "Station",
                      "worklocationAddress.streetOrRoad",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 3 (Area or Town)"
                  name="areaOrTown"
                  value={drawerIpnuts?.Station?.worklocationAddress?.areaOrTown}
                  onChange={(val) =>
                    drawrInptChng(
                      "Station",
                      "worklocationAddress.areaOrTown",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 4 (County, City or Postcode)"
                  name="countyCityOrPostCode"
                  value={
                    drawerIpnuts?.Station?.worklocationAddress
                      ?.countyCityOrPostCode
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "Station",
                      "worklocationAddress.countyCityOrPostCode",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Eircode"
                  name="eircode"
                  placeholder="Enter Eircode (e.g., D01X4X0)"
                  value={drawerIpnuts?.Station?.worklocationAddress?.eircode}
                  onChange={(val) =>
                    drawrInptChng(
                      "Station",
                      "worklocationAddress.eircode",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>

              <Col xs={24} md={12}>
                <CustomSelect
                  label="Country"
                  name="country"
                  value={drawerIpnuts?.Station?.worklocationAddress?.country}
                  options={countriesOptions}
                  onChange={(val) =>
                    drawrInptChng(
                      "Station",
                      "worklocationAddress.country",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>
            </Row>
          </div>

          {/* Table Header and Popout Btn */}
          <div className="mt-2 config-tbl-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h6 className="m-0 text-primary">Existing Work Locations</h6>
              <Button
                style={{
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 10px",
                }}
                onClick={() =>
                  navigate("/worklocation", {
                    state: { search: "Work Location" },
                  })
                }
              >
                <FaArrowUpRightFromSquare size={14} />
              </Button>
            </div>
            <MyInput
              placeholder="Search work locations..."
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
              value={searchTermStation}
              onChange={handleStationSearchChange}
              onClear={clearStationSearch}
              allowClear
            />
            <Table
              columns={columnStations}
              dataSource={filteredWorkLocations}
              className="drawer-tbl"
              size="small"
              scroll={{ x: "max-content" }}
              loading={lookupsloading}
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Study Location"
        // isContact={true}
        open={drawerOpen?.StudyLocation}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "StudyLocation"
        }
        isPagination={true}
        onClose={() => openCloseDrawerFtn("StudyLocation")}
        add={() => {
          if (!validateForm("Station")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Station,
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("Station", () => dispatch(getAllLookups()));
            },
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Station}
        update={async () => {
          if (!validateForm("Station")) return;
          await updateFtn("/lookup", drawerIpnuts?.Station, () =>
            resetCounteries("Station", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Station", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Work Location Name"
                  name="lookupname"
                  value={drawerIpnuts?.Station?.lookupname}
                  onChange={(val) =>
                    drawrInptChng("Station", "lookupname", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.Station?.lookupname}
                  errorMessage={errors?.Station?.lookupname}
                  required
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.Station?.code}
                  onChange={(val) =>
                    drawrInptChng("Station", "code", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.Station?.code}
                  errorMessage={errors?.Station?.code}
                  required
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.Station?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng("Station", "DisplayName", val.target.value)
                  }
                  disabled={isDisable}
                />
              </Col>
            </Row>

            <Row gutter={24} className="config-drawer-parent-action-row" wrap={false}>
              <ParentLookupSelect
                drawerKey="Station"
                lookuptypeId={drawerIpnuts?.Station?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Station?.Parentlookupid}
                parentLabel={drawerIpnuts?.Station?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Station?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Station?.Parentlookuptype}
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Station?.lookuptypeId,
                )}
                hasError={!!errors?.Station?.Parentlookupid}
                span={12}
                onChange={(payload) =>
                  handleParentLookupChange("Station", payload)
                }
              />
              <Col span={4} className="config-drawer-add-col">
                <Button
                  className="butn primary-btn detail-btn config-drawer-add-btn"
                  onClick={() => openCloseDrawerFtn("DivisionsForDistrict")}
                >
                  +
                </Button>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.Station?.isactive}
                  onChange={(e) =>
                    drawrInptChng("Station", "isactive", e.target.checked)
                  }
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* Popout Btn aligned right and bottom with inputs */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
            }}
          >
            <Button
              style={{ height: 40, marginBottom: 4 }}
              onClick={() =>
                navigate("/worklocation", {
                  state: { search: "Work Location" },
                })
              }
            >
              <FaArrowUpRightFromSquare />
            </Button>
          </div>

          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Work Locations</h6>
            <Table
              pagination={true}
              columns={columnStations}
              dataSource={groupedLookups?.Station}
              className="drawer-tbl"
              size="small"
              loading={lookupsloading}
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Contact Types"
        open={drawerOpen?.ContactType}
        isPagination={true}
        onClose={() => openCloseDrawerFtn("ContactType")}
        add={() => {
          if (!validateForm("ContactType")) return;
          insertDataFtn(
            `/contact-types`,
            drawerIpnuts?.ContactType,
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("ContactType", () => dispatch(getContactTypes()));
              dispatch(getContactTypes());
            },
          );
        }}
        isEdit={isUpdateRec?.ContactType}
        update={async () => {
          if (!validateForm("ContactType")) return;
          await updateFtn(
            `/contact-types/${drawerIpnuts?.ContactType?.id}`,
            drawerIpnuts?.ContactType,
            () =>
              resetCounteries("ContactType", () => dispatch(getContactTypes())),
          );
          dispatch(getContactTypes());
          // dispatch(getAllLookups());
          // IsUpdateFtn("Divisions", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.ContactType?.code}
                  onChange={(val) =>
                    drawrInptChng("ContactType", "code", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.ContactType?.code}
                  errorMessage={errors?.ContactType?.code}
                  required
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Contact Type"
                  name="ContactType"
                  value={drawerIpnuts?.ContactType?.contactType}
                  onChange={(val) =>
                    drawrInptChng(
                      "ContactType",
                      "contactType",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                  hasError={!!errors?.ContactType?.contactType}
                  errorMessage={errors?.ContactType?.contactType}
                  required
                />
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.ContactType?.displayName}
                  onChange={(val) =>
                    drawrInptChng(
                      "ContactType",
                      "displayName",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                  hasError={!!errors?.contactType?.displayName}
                  errorMessage={errors?.contactType?.displayName}
                />
              </Col>

              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.ContactType?.isactive}
                  onChange={(e) =>
                    drawrInptChng("ContactType", "isactive", e.target.checked)
                  }
                  style={{ marginTop: 26 }} // aligns with input fields
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* Table Section */}
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Contact Types</h6>
            <Table
              pagination={false}
              columns={contactType}
              dataSource={contactTypes}
              loading={contactTypesloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Lookup Type"
        open={drawerOpen?.LookupType}
        isPagination={false}
        isLoading={lookupTypeDetailLoading}
        onClose={() => {
          if (lookupTypeDetailLoading) return;
          openCloseDrawerFtn("LookupType");
          IsUpdateFtn("LookupType", false);
        }}
        isEdit={isUpdateRec?.LookupType}
        update={async () => {
          if (!validateForm("LookupType")) return;
          const lookupTypePayload = {
            ...drawerIpnuts?.LookupType,
            displayname:
              drawerIpnuts?.LookupType?.DisplayName ||
              drawerIpnuts?.LookupType?.displayname ||
              "",
          };
          await updateFtn("/lookuptype", lookupTypePayload, () => {
            resetCounteries("LookupType");
            refreshLookupTypes();
          });
          IsUpdateFtn("LookupType", false);
        }}
        add={async () => {
          if (!validateForm("LookupType")) return;
          await insertDataFtn(
            `/lookuptype`,
            {
              ...drawerIpnuts?.LookupType,
              displayname:
                drawerIpnuts?.LookupType?.DisplayName ||
                drawerIpnuts?.LookupType?.displayname ||
                "",
              userid: "67f3f9d812b014a0a7a94081",
            },
            "Data inserted successfully",
            "Data did not insert",
            () => {
              resetCounteries("Lookup Type");
              refreshLookupTypes();
            },
          );
        }}
        //   onChange={handlePageChange}
        // total={lookupsTypes?.length}
      >
        <Spin spinning={lookupTypeDetailLoading} tip="Loading lookup type...">
          <div className="drawer-main-cntainer p-4">
            <Row gutter={24}>
              <Col span={24}>
                <MyInput
                  label="Lookup Type"
                  name="lookuptype"
                  value={drawerIpnuts?.LookupType?.lookuptype || ""}
                  options={[{ label: "Lookup Type", value: "Lookup Type" }]}
                  onChange={(e) =>
                    drawrInptChng("LookupType", "lookuptype", e.target.value)
                  }
                  isSimple={true}
                  disabled={isDisable || lookupTypeDetailLoading}
                  required
                  hasError={!!errors?.LookupType?.lookuptype}
                />
              </Col>
            </Row>

            <Row gutter={24} className="mt-3">
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.LookupType?.code || ""}
                  onChange={(e) =>
                    drawrInptChng("LookupType", "code", e.target.value)
                  }
                  placeholder="Enter code"
                  disabled={isDisable || lookupTypeDetailLoading}
                  required
                  hasError={!!errors?.LookupType?.code}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.LookupType?.DisplayName || ""}
                  onChange={(e) =>
                    drawrInptChng("LookupType", "DisplayName", e.target.value)
                  }
                  placeholder="Enter display name"
                  disabled={isDisable || lookupTypeDetailLoading}
                  hasError={!!errors?.LookupType?.DisplayName}
                />
              </Col>
              <ParentLookupTypeSelect
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.LookupType?.ParentlookuptypeId}
                parentLabel={drawerIpnuts?.LookupType?.Parentlookuptype}
                excludeTypeId={
                  drawerIpnuts?.LookupType?._id || drawerIpnuts?.LookupType?.id
                }
                excludeTypeName={drawerIpnuts?.LookupType?.lookuptype}
                hasError={!!errors?.LookupType?.ParentlookuptypeId}
                disabled={lookupTypeDetailLoading}
                onChange={handleParentLookupTypeChange}
              />
            </Row>

            <Row gutter={24} className="mt-3">
              <Col span={12}>
                <Checkbox
                  disabled={isDisable || lookupTypeDetailLoading}
                  onChange={(e) =>
                    drawrInptChng("LookupType", "isactive", e.target.checked)
                  }
                  checked={drawerIpnuts?.LookupType?.isactive}
                  style={{ marginTop: "26px" }}
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>
        </Spin>

        <div className="mt-4 config-tbl-container">
          <h6 className="mb-3 text-primary">Existing Lookup Types</h6>
          <div className="mb-3">
            <MyInput
              label="Search Lookup Types"
              name="searchLookupTypes"
              placeholder="Search by type, code, or display name..."
              onChange={(e) => handleSearchLookupTypes(e.target.value)}
              isSimple={true}
              allowClear
              style={{ marginBottom: "16px" }}
            />
          </div>
          <Table
            pagination={true}
            columns={columnLookupType}
            dataSource={filteredLookupsTypes}
            className="drawer-tbl"
            size="small"
            rowKey={(record, index) =>
              record._id || record.id || record.key || index
            }
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{ type: selectionType, ...rowSelection }}
            bordered
            scroll={{ y: 270 }}
            loading={lookupsTypesloading}
          />
        </div>
      </MyDrawer>

      <MyDrawer
        title="Region Type"
        open={drawerOpen?.RegionType}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("RegionType");
          IsUpdateFtn("RegionType", false);
        }}
        isEdit={isUpdateRec?.RegionType}
        update={async () => {
          await updateFtn("/regiontype", drawerIpnuts?.RegionType, () =>
            dispatch(getAllRegionTypes()),
          );
          IsUpdateFtn("regiontype", false);
        }}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/regiontype`,
            {
              ...drawerIpnuts?.RegionType,
              userid: "67f3f9d812b014a0a7a94081",
            },
            "Data inserted successfully",
            "Data did not insert",
            () => {
              resetCounteries("RegionType");
              dispatch(getAllRegionTypes());
            },
            // Pass a function reference
          );
          // dispatch(getLookupTypes())
        }}
        total={regions?.length}
      >
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
                    disabled={isDisable}
                    className="inp"
                    onChange={(value) =>
                      drawrInptChng("RegionType", "code", value.target.value)
                    }
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
                    placeholder=""
                    onChange={(value) =>
                      drawrInptChng(
                        "RegionType",
                        "RegionType",
                        value.target.value,
                      )
                    }
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
                    placeholder=""
                    onChange={(value) =>
                      drawrInptChng(
                        "RegionType",
                        "DisplayName",
                        value.target.value,
                      )
                    }
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
                    disabled={isDisable}
                    onChange={(e) =>
                      drawrInptChng("RegionType", "isactive", e.target.checked)
                    }
                    checked={drawerIpnuts?.RegionType?.isactive}
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
              columns={columnRegionType}
              dataSource={regionTypes}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
            />
            ;
          </div>
        </div>
      </MyDrawer>
      <MyDrawer
        title="Lookup"
        open={drawerOpen?.Lookup}
        isPagination={false}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Lookup"}
        onClose={() => {
          if (lookupDetailLoading) return;
          openCloseDrawerFtn("Lookup");
          IsUpdateFtn("Lookup", false);
        }}
        add={async () => {
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Lookup,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetLookupDrawerForNextEntry(() => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Lookup}
        update={async () => {
          await updateFtn("/lookup", drawerIpnuts?.Lookup, () =>
            resetCounteries("Lookup", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Lookup", false);
        }}
      >
        <Spin spinning={lookupDetailLoading} tip="Loading lookup...">
          <div className="drawer-main-container p-4">
            <Row gutter={24}>
              <Col span={24}>
                <CustomSelect
                  label="Lookup Type"
                  disabled={isDisable || lookupDetailLoading}
                  name="lookuptype"
                  isIDs={true}
                  value={drawerIpnuts?.Lookup?.lookuptypeId || ""}
                  options={lookupsTypesSelect}
                  isSimple={true}
                  required
                  onChange={(value) => {
                    const nextTypeId = String(value.target.value);
                    setdrawerIpnuts((prev) => ({
                      ...prev,
                      Lookup: {
                        ...(prev.Lookup || {}),
                        lookuptypeId: nextTypeId,
                        Parentlookupid: null,
                        Parentlookup: "",
                        ParentlookuptypeId: null,
                        Parentlookuptype: "",
                      },
                    }));
                  }}
                  hasError={!!errors?.Lookup?.lookuptypeId}
                />
              </Col>
            </Row>

            <Row gutter={24} className="mt-3">
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.Lookup?.code || ""}
                  onChange={(e) =>
                    drawrInptChng("Lookup", "code", e.target.value)
                  }
                  placeholder="Enter code"
                  disabled={isDisable || lookupDetailLoading}
                  required
                  hasError={!!errors?.Lookup?.code}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Lookup Name"
                  name="lookupname"
                  value={drawerIpnuts?.Lookup?.lookupname || ""}
                  onChange={(e) =>
                    drawrInptChng("Lookup", "lookupname", e.target.value)
                  }
                  placeholder="Enter lookup name"
                  disabled={isDisable || lookupDetailLoading}
                  required
                  hasError={!!errors?.Lookup?.lookupname}
                />
              </Col>
            </Row>

            <Row gutter={24} className="mt-3">
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.Lookup?.DisplayName || ""}
                  onChange={(e) =>
                    drawrInptChng("Lookup", "DisplayName", e.target.value)
                  }
                  placeholder="Enter display name"
                  disabled={isDisable || lookupDetailLoading}
                  hasError={!!errors?.Lookup?.DisplayName}
                />
              </Col>
              <ParentLookupSelect
                drawerKey="Lookup"
                lookuptypeId={drawerIpnuts?.Lookup?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Lookup?.Parentlookupid}
                parentLabel={drawerIpnuts?.Lookup?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Lookup?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Lookup?.Parentlookuptype}
                disabled={isDisable || lookupDetailLoading}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Lookup?.lookuptypeId,
                )}
                hasError={!!errors?.Lookup?.Parentlookupid}
                onChange={(payload) =>
                  handleParentLookupChange("Lookup", payload)
                }
              />
            </Row>

            <Row gutter={24} className="">
              <Col span={12}>
                <Checkbox
                  disabled={isDisable || lookupDetailLoading}
                  onChange={(e) =>
                    drawrInptChng("Lookup", "isactive", e.target.checked)
                  }
                  checked={drawerIpnuts?.Lookup?.isactive}
                  style={{ marginTop: "0px" }}
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>
        </Spin>

        <div className="mt-4 config-tbl-container">
          <Row gutter={24} className="">
            <Col span={24}>
              <MyInput
                placeholder="Search by Code, Name, Display Name or Type..."
                prefix={<SearchOutlined />}
                value={searchTermLookup}
                onChange={(e) => handleLookupSearch(e.target.value)}
                allowClear
                style={{ marginBottom: 16 }}
              />
            </Col>
          </Row>
          <Table
            pagination={true}
            columns={columnLookup}
            dataSource={filteredLookups}
            loading={lookupsloading}
            className="drawer-tbl"
            size="small"
            rowKey={(record, index) =>
              record._id || record.id || record.key || index
            }
            rowClassName={(record, index) =>
              index % 2 !== 0 ? "odd-row" : "even-row"
            }
            rowSelection={{ type: selectionType, ...rowSelection }}
            scroll={{ y: 270 }}
            bordered
          />
        </div>
      </MyDrawer>
      <MyDrawer
        title={activeStandardLookupType?.lookuptype || "Lookup"}
        open={drawerOpen?.StandardLookup}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "StandardLookup"
        }
        isPagination={true}
        isEdit={isUpdateRec?.StandardLookup}
        onClose={() => {
          setActiveStandardLookupType(null);
          openCloseDrawerFtn("StandardLookup");
          IsUpdateFtn("StandardLookup", false);
        }}
        add={async () => {
          if (!validateForm("StandardLookup")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.StandardLookup,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("StandardLookup", () =>
                dispatch(getAllLookups()),
              ),
          );
          dispatch(getAllLookups());
        }}
        update={async () => {
          if (!validateForm("StandardLookup")) return;
          await updateFtn("/lookup", drawerIpnuts?.StandardLookup, () =>
            resetCounteries("StandardLookup", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("StandardLookup", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.StandardLookup?.code || ""}
                onChange={(e) =>
                  drawrInptChng("StandardLookup", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.StandardLookup?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label={`${activeStandardLookupType?.lookuptype || "Lookup"} Name:`}
                name="lookupname"
                value={drawerIpnuts?.StandardLookup?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("StandardLookup", "lookupname", e.target.value)
                }
                placeholder={`Enter ${activeStandardLookupType?.lookuptype || "lookup"} name`}
                disabled={isDisable}
                required
                hasError={!!errors?.StandardLookup?.lookupname}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.StandardLookup?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("StandardLookup", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.StandardLookup?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="StandardLookup"
              lookuptypeId={
                activeStandardLookupType?._id ||
                drawerIpnuts?.StandardLookup?.lookuptypeId
              }
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.StandardLookup?.Parentlookupid}
              parentLabel={drawerIpnuts?.StandardLookup?.Parentlookup}
              parentLookupTypeId={
                drawerIpnuts?.StandardLookup?.ParentlookuptypeId
              }
              parentLookupTypeName={
                drawerIpnuts?.StandardLookup?.Parentlookuptype
              }
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                activeStandardLookupType?._id ||
                  drawerIpnuts?.StandardLookup?.lookuptypeId,
              )}
              hasError={!!errors?.StandardLookup?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("StandardLookup", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("StandardLookup", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.StandardLookup?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">
              Existing {activeStandardLookupType?.lookuptype || "Lookups"}
            </h6>
            <Table
              pagination={false}
              columns={columnStandardLookup}
              dataSource={standardLookupTableData}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Bookmarks"
        open={drawerOpen?.Bookmarks}
        isPagination={false}
        onClose={() => {
          openCloseDrawerFtn("Bookmarks");
          IsUpdateFtn("Bookmarks", false);
        }}
        update={async () => {
          await updateFtn(
            "/bookmarks/fields",
            drawerIpnuts?.Bookmarks,
            () => {
              // Clear the form/reset state
              resetCounteries("Bookmarks");
              // Refresh the data
              dispatch(getAllLookups());
            },
            "updated successfully",
            true, // isCoum
          );
          IsUpdateFtn("Bookmarks", false);
        }}
        add={async () => {
          if (!validateForm("Bookmarks")) return;
          const bookmarkData = {
            key: drawerIpnuts?.Bookmarks?.key || "",
            label: drawerIpnuts?.Bookmarks?.label || "",
            path: drawerIpnuts?.Bookmarks?.path || "",
            dataType: drawerIpnuts?.Bookmarks?.dataType || "",
          };
          await insertDataFtn(
            `/bookmarks/fields`,
            bookmarkData,
            "Bookmark created successfully",
            "Failed to create bookmark",
            () => {
              // Test without resetCounteries first
              resetCounteries("Bookmarks", dispatch(getBookmarks()));
            },
            true,
          );
          // dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Bookmarks}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Key + Label */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Key:"
                name="key"
                value={drawerIpnuts?.Bookmarks?.key}
                onChange={(e) =>
                  drawrInptChng("Bookmarks", "key", e.target.value)
                }
                placeholder="Enter key (e.g., memberName)"
                disabled={isDisable}
                required
                hasError={!!errors?.Bookmarks?.key}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Label:"
                name="label"
                value={drawerIpnuts?.Bookmarks?.label}
                onChange={(e) =>
                  drawrInptChng("Bookmarks", "label", e.target.value)
                }
                placeholder="Enter display label (e.g., Member Name)"
                disabled={isDisable}
                required
                hasError={!!errors?.Bookmarks?.label}
              />
            </Col>
          </Row>

          {/* Path */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Path:"
                name="path"
                value={drawerIpnuts?.Bookmarks?.path}
                onChange={(e) =>
                  drawrInptChng("Bookmarks", "path", e.target.value)
                }
                placeholder="Enter data path (e.g., profile.personalInfo.forename)"
                disabled={isDisable}
                required
                hasError={!!errors?.Bookmarks?.path}
              />
            </Col>
            <Col span={12}>
              <CustomSelect
                label="Data Type:"
                name="dataType"
                value={drawerIpnuts?.Bookmarks?.dataType}
                onChange={(value) =>
                  drawrInptChng("Bookmarks", "dataType", value.target.value)
                }
                options={[
                  { label: "String", value: "string" },
                  { label: "Number", value: "number" },
                  { label: "Date", value: "date" },
                  { label: "Boolean", value: "boolean" },
                  { label: "Array", value: "array" },
                  { label: "Object", value: "object" },
                ]}
                placeholder="Select data type"
                disabled={isDisable}
                required
                hasError={!!errors?.Bookmarks?.dataType}
              />
            </Col>
          </Row>

          {/* Existing Bookmarks Table */}
          <div className="mt-4 config-tbl-container">
            <MyInput
              label="Search Bookmarks:"
              value={bookmarkSearch}
              onChange={(e) => setBookmarkSearch(e.target.value)}
              placeholder="Search by key or label..."
            />
            <h6 className="mb-3 text-primary">Existing Bookmarks</h6>
            <Table
              pagination={true}
              columns={columnBookmark}
              dataSource={filteredBookmarks}
              loading={bookmarksLoading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Gender"
        open={drawerOpen?.Gender}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Gender"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Gender");
          IsUpdateFtn("Gender", false);
        }}
        add={async () => {
          if (!validateForm("Gender")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Gender,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Gender", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Gender}
        update={async () => {
          if (!validateForm("Gender")) return;
          await updateFtn("/lookup", drawerIpnuts?.Gender, () =>
            resetCounteries("Gender", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Gender", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Gender Name */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Gender?.code}
                onChange={(e) =>
                  drawrInptChng("Gender", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Gender?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Gender Name:"
                name="lookupname"
                value={drawerIpnuts?.Gender?.lookupname}
                onChange={(e) =>
                  drawrInptChng("Gender", "lookupname", e.target.value)
                }
                placeholder="Enter gender name"
                disabled={isDisable}
                required
                hasError={!!errors?.Gender?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Gender?.DisplayName}
                onChange={(e) =>
                  drawrInptChng("Gender", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Gender?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Gender"
              lookuptypeId={drawerIpnuts?.Gender?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Gender?.Parentlookupid}
              parentLabel={drawerIpnuts?.Gender?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Gender?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Gender?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Gender?.lookuptypeId,
              )}
              hasError={!!errors?.Gender?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Gender", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Gender", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Gender?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Gender Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Gender</h6>
            <Table
              pagination={false}
              columns={columnGender}
              dataSource={groupedLookups?.Gender}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="City"
        open={drawerOpen?.Cities}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Cities"}
        isPagination={true}
        isEdit={isUpdateRec?.Cities}
        onClose={() => {
          openCloseDrawerFtn("Cities");
          IsUpdateFtn("Cities", false);
        }}
        add={() => {
          if (!validateForm("Cities")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Cities,
            "Data inserted successfully:",
            "Data did not insert:",
            () => resetCounteries("Cities", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        update={async () => {
          if (!validateForm("Cities")) return;
          await updateFtn("/lookup", drawerIpnuts?.Cities, () =>
            resetCounteries("Cities", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Cities", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + City Name */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Cities?.code || ""}
                onChange={(e) =>
                  drawrInptChng("Cities", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Cities?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="City Name:"
                name="lookupname"
                value={drawerIpnuts?.Cities?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("Cities", "lookupname", e.target.value)
                }
                placeholder="Enter city name"
                disabled={isDisable}
                required
                hasError={!!errors?.Cities?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + County */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Cities?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Cities", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Cities?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Cities"
              lookuptypeId={drawerIpnuts?.Cities?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Cities?.Parentlookupid}
              parentLabel={drawerIpnuts?.Cities?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Cities?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Cities?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Cities?.lookuptypeId,
              )}
              hasError={!!errors?.Cities?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Cities", payload)
              }
            />
          </Row>

          {/* Active */}
          <Row>
            <Col span={24}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Cities", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Cities?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Cities Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Cities</h6>
            <Table
              pagination={false}
              columns={columnCity}
              dataSource={groupedLookups["City"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Title"
        open={drawerOpen?.Title}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Title"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Title");
          IsUpdateFtn("Title", false);
        }}
        add={() => {
          if (!validateForm("Title")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Title,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Title", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Title}
        update={async () => {
          if (!validateForm("Title")) return;
          await updateFtn("/lookup", drawerIpnuts?.Title, () =>
            resetCounteries("Title", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Title", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Title?.code || ""}
                onChange={(e) => drawrInptChng("Title", "code", e.target.value)}
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Title?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Title Name:"
                name="lookupname"
                value={drawerIpnuts?.Title?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("Title", "lookupname", e.target.value)
                }
                placeholder="Enter title name"
                disabled={isDisable}
                required
                hasError={!!errors?.Title?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Title?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Title", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Title?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Title"
              lookuptypeId={drawerIpnuts?.Title?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Title?.Parentlookupid}
              parentLabel={drawerIpnuts?.Title?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Title?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Title?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Title?.lookuptypeId,
              )}
              hasError={!!errors?.Title?.Parentlookupid}
              onChange={(payload) => handleParentLookupChange("Title", payload)}
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Title", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Title?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Titles Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Titles</h6>
            <Table
              pagination={false}
              columns={columntTitles}
              dataSource={groupedLookups?.Title}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Roster Type"
        open={drawerOpen?.RosterType}
        isLoading={lookupDetailLoading && editingLookupDrawer === "RosterType"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("RosterType");
          IsUpdateFtn("RosterType", false);
        }}
        add={() => {
          if (!validateForm("RosterType")) return;
          insertDataFtn(
            `/lookup`,
            drawerIpnuts?.RosterType,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("RosterType", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.RosterType}
        update={async () => {
          if (!validateForm("RosterType")) return;
          await updateFtn("/lookup", drawerIpnuts?.RosterType, () =>
            resetCounteries("RosterType", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("RosterType", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            {/* Row 2: Code + Roster Type Name */}
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.RosterType?.code}
                  onChange={(val) => drawrInptChng("RosterType", "code", val)}
                  error={errors?.RosterType?.code}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Roster Type Name"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.RosterType?.lookupname}
                  onChange={(val) =>
                    drawrInptChng("RosterType", "lookupname", val)
                  }
                  error={errors?.RosterType?.lookupname}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  disabled={isDisable}
                  value={drawerIpnuts?.RosterType?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng("RosterType", "DisplayName", val)
                  }
                />
              </Col>
              <ParentLookupSelect
                drawerKey="RosterType"
                lookuptypeId={drawerIpnuts?.RosterType?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.RosterType?.Parentlookupid}
                parentLabel={drawerIpnuts?.RosterType?.Parentlookup}
                parentLookupTypeId={
                  drawerIpnuts?.RosterType?.ParentlookuptypeId
                }
                parentLookupTypeName={
                  drawerIpnuts?.RosterType?.Parentlookuptype
                }
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.RosterType?.lookuptypeId,
                )}
                hasError={!!errors?.RosterType?.Parentlookupid}
                onChange={(payload) =>
                  handleParentLookupChange("RosterType", payload)
                }
              />
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.RosterType?.isactive}
                  onChange={(e) =>
                    drawrInptChng("RosterType", "isactive", e.target.checked)
                  }
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* History Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Roster Types</h6>
            <Table
              pagination={false}
              columns={columnRosterTypes}
              dataSource={groupedLookups["Roster Type"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Marital Status"
        open={drawerOpen?.MaritalStatus}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "MaritalStatus"
        }
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("MaritalStatus");
          IsUpdateFtn("MaritalStatus", false);
        }}
        add={async () => {
          if (!validateForm("MaritalStatus")) return;
          await insertDataFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.MaritalStatus,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("MaritalStatus", () => dispatch(getAllLookups())),
          );
        }}
        isEdit={isUpdateRec?.MaritalStatus}
        update={async () => {
          if (!validateForm("MaritalStatus")) return;
          await updateFtn(
            `${baseURL}/lookup`,
            drawerIpnuts?.MaritalStatus,
            () =>
              resetCounteries("MaritalStatus", () => dispatch(getAllLookups())),
          );
          IsUpdateFtn("MaritalStatus", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                value={drawerIpnuts?.MaritalStatus?.code || ""}
                onChange={(e) =>
                  drawrInptChng("MaritalStatus", "code", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.MaritalStatus?.code}
                required
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Marital Status"
                name="lookupname"
                value={drawerIpnuts?.MaritalStatus?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("MaritalStatus", "lookupname", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.MaritalStatus?.lookupname}
                required
              />
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                value={drawerIpnuts?.MaritalStatus?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("MaritalStatus", "DisplayName", e.target.value)
                }
                disabled={isDisable}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="MaritalStatus"
              lookuptypeId={drawerIpnuts?.MaritalStatus?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.MaritalStatus?.Parentlookupid}
              parentLabel={drawerIpnuts?.MaritalStatus?.Parentlookup}
              parentLookupTypeId={
                drawerIpnuts?.MaritalStatus?.ParentlookuptypeId
              }
              parentLookupTypeName={
                drawerIpnuts?.MaritalStatus?.Parentlookuptype
              }
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.MaritalStatus?.lookuptypeId,
              )}
              hasError={!!errors?.MaritalStatus?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("MaritalStatus", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("MaritalStatus", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.MaritalStatus?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Marital Status</h6>
            <Table
              pagination={false}
              columns={columnGender}
              dataSource={groupedLookups["Marital Status"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Project Types"
        open={drawerOpen?.ProjectTypes}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "ProjectTypes"
        }
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("ProjectTypes");
          IsUpdateFtn("ProjectTypes", false);
        }}
        add={async () => {
          if (!validateForm("ProjectTypes")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.ProjectTypes,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("ProjectTypes", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.ProjectTypes}
        update={async () => {
          if (!validateForm("ProjectTypes")) return;
          await updateFtn("/lookup", drawerIpnuts?.ProjectTypes, () =>
            resetCounteries("ProjectTypes", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("ProjectTypes", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Project Type */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.ProjectTypes?.code || ""}
                onChange={(e) =>
                  drawrInptChng("ProjectTypes", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.ProjectTypes?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Project Type:"
                name="lookupname"
                value={drawerIpnuts?.ProjectTypes?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("ProjectTypes", "lookupname", e.target.value)
                }
                placeholder="Enter project type"
                disabled={isDisable}
                required
                hasError={!!errors?.ProjectTypes?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.ProjectTypes?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("ProjectTypes", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.ProjectTypes?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="ProjectTypes"
              lookuptypeId={drawerIpnuts?.ProjectTypes?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.ProjectTypes?.Parentlookupid}
              parentLabel={drawerIpnuts?.ProjectTypes?.Parentlookup}
              parentLookupTypeId={
                drawerIpnuts?.ProjectTypes?.ParentlookuptypeId
              }
              parentLookupTypeName={
                drawerIpnuts?.ProjectTypes?.Parentlookuptype
              }
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.ProjectTypes?.lookuptypeId,
              )}
              hasError={!!errors?.ProjectTypes?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("ProjectTypes", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("ProjectTypes", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.ProjectTypes?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Project Types Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Project Types</h6>
            <Table
              pagination={false}
              columns={ProjectTypesColumns}
              dataSource={data?.ProjectTypes}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Trainings"
        open={drawerOpen?.Trainings}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Trainings"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Trainings");
          IsUpdateFtn("Trainings", false);
        }}
        add={async () => {
          if (!validateForm("Trainings")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Trainings,
            "Data inserted successfully",
            "Data did not insert",
            () => {
              resetCounteries("Trainings");
              refreshLookups();
            },
          );
        }}
        isEdit={isUpdateRec?.Trainings}
        update={async () => {
          if (!validateForm("Trainings")) return;
          await updateFtn("/lookup", drawerIpnuts?.Trainings, () => {
            resetCounteries("Trainings");
            refreshLookups();
          });
          IsUpdateFtn("Trainings", false);
        }}
      >
        <div className="drawer-main-container">
          <Row gutter={24}>
            {/* Code - half width */}
            <Col span={12}>
              <CustomSelect
                label="Code"
                placeholder="Enter Code"
                value={drawerIpnuts?.Trainings?.code}
                onChange={(e) =>
                  drawrInptChng("Trainings", "code", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Trainings?.code}
              />
            </Col>

            {/* Trainings - half width */}
            <Col span={12}>
              <MyInput
                label="Training"
                placeholder="Enter Training"
                value={drawerIpnuts?.Trainings?.lookupname}
                onChange={(e) =>
                  drawrInptChng("Trainings", "lookupname", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Trainings?.lookupname}
              />
            </Col>

            {/* Display Name - half width */}
            <Col span={12}>
              <MyInput
                label="Display Name"
                placeholder="Enter Display Name"
                value={drawerIpnuts?.Trainings?.DisplayName}
                onChange={(e) =>
                  drawrInptChng("Trainings", "DisplayName", e.target.value)
                }
                disabled={isDisable}
                hasError={!!errors?.Trainings?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Trainings"
              lookuptypeId={drawerIpnuts?.Trainings?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Trainings?.Parentlookupid}
              parentLabel={drawerIpnuts?.Trainings?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Trainings?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Trainings?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Trainings?.lookuptypeId,
              )}
              hasError={!!errors?.Trainings?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Trainings", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12} style={{ marginTop: "30px" }}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Trainings", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Trainings?.isactive}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Table */}
          <div className="mt-4">
            <Table
              pagination={false}
              columns={columnTrainings}
              dataSource={data?.Trainings}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Document Type"
        open={drawerOpen?.DocumentType}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "DocumentType"
        }
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("DocumentType");
          IsUpdateFtn("DocumentType", false);
        }}
        add={async () => {
          if (!validateForm("DocumentType")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.DocumentType,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("DocumentType", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.DocumentType}
        update={async () => {
          if (!validateForm("DocumentType")) return;
          await updateFtn("/lookup", drawerIpnuts?.DocumentType, () =>
            resetCounteries("DocumentType", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("DocumentType", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Document Type */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                value={drawerIpnuts?.DocumentType?.code || ""}
                onChange={(e) =>
                  drawrInptChng("DocumentType", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.DocumentType?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Document Type"
                name="lookupname"
                value={drawerIpnuts?.DocumentType?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("DocumentType", "lookupname", e.target.value)
                }
                placeholder="Enter document type"
                disabled={isDisable}
                required
                hasError={!!errors?.DocumentType?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                value={drawerIpnuts?.DocumentType?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("DocumentType", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.DocumentType?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="DocumentType"
              lookuptypeId={drawerIpnuts?.DocumentType?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.DocumentType?.Parentlookupid}
              parentLabel={drawerIpnuts?.DocumentType?.Parentlookup}
              parentLookupTypeId={
                drawerIpnuts?.DocumentType?.ParentlookuptypeId
              }
              parentLookupTypeName={
                drawerIpnuts?.DocumentType?.Parentlookuptype
              }
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.DocumentType?.lookuptypeId,
              )}
              hasError={!!errors?.DocumentType?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("DocumentType", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("DocumentType", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.DocumentType?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Document Types Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Document Types</h6>
            <Table
              pagination={false}
              columns={columnDocumentType}
              dataSource={data?.DocumentType}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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

      {/* Claim Type Drawer */}
      <MyDrawer
        title="Claim Type"
        open={drawerOpen?.ClaimType}
        isLoading={lookupDetailLoading && editingLookupDrawer === "ClaimType"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("ClaimType");
          IsUpdateFtn("ClaimType", false);
        }}
        add={async () => {
          if (!validateForm("ClaimType")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.ClaimType,
            "Data inserted successfully",
            "Data did not insert",
          );
          resetCounteries("ClaimType", () => dispatch(getAllLookups()));
        }}
        isEdit={isUpdateRec?.ClaimType}
        update={async () => {
          if (!validateForm("ClaimType")) return;
          await updateFtn("/lookup", drawerIpnuts?.ClaimType, () =>
            resetCounteries("ClaimType", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("ClaimType", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                value={drawerIpnuts?.ClaimType?.code || ""}
                onChange={(e) =>
                  drawrInptChng("ClaimType", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.ClaimType?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Claim Type"
                name="lookupname"
                value={drawerIpnuts?.ClaimType?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("ClaimType", "lookupname", e.target.value)
                }
                placeholder="Enter claim type"
                disabled={isDisable}
                required
                hasError={!!errors?.ClaimType?.lookupname}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                value={drawerIpnuts?.ClaimType?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("ClaimType", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.ClaimType?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="ClaimType"
              lookuptypeId={drawerIpnuts?.ClaimType?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.ClaimType?.Parentlookupid}
              parentLabel={drawerIpnuts?.ClaimType?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.ClaimType?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.ClaimType?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.ClaimType?.lookuptypeId,
              )}
              hasError={!!errors?.ClaimType?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("ClaimType", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("ClaimType", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.ClaimType?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Claim Types</h6>
            <Table
              pagination={false}
              columns={columnClaimType}
              dataSource={data?.ClaimType}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />
          </div>
        </div>
      </MyDrawer>

      {/* Schemes Drawer */}
      <MyDrawer
        title="Schemes"
        open={drawerOpen?.Schemes}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Schemes"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Schemes");
          IsUpdateFtn("Schemes", false);
        }}
        add={async () => {
          if (!validateForm("Schemes")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Schemes,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Schemes", () => dispatch(getAllLookups())),
          );
        }}
        isEdit={isUpdateRec?.Schemes}
        update={async () => {
          if (!validateForm("Schemes")) return;
          await updateFtn("/lookup", drawerIpnuts?.Schemes, () =>
            resetCounteries("Schemes", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Schemes", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                value={drawerIpnuts?.Schemes?.code || ""}
                onChange={(e) =>
                  drawrInptChng("Schemes", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Schemes?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Schemes"
                name="lookupname"
                value={drawerIpnuts?.Schemes?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("Schemes", "lookupname", e.target.value)
                }
                placeholder="Enter scheme name"
                disabled={isDisable}
                required
                hasError={!!errors?.Schemes?.lookupname}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                value={drawerIpnuts?.Schemes?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Schemes", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Schemes?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Schemes"
              lookuptypeId={drawerIpnuts?.Schemes?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Schemes?.Parentlookupid}
              parentLabel={drawerIpnuts?.Schemes?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Schemes?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Schemes?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Schemes?.lookuptypeId,
              )}
              hasError={!!errors?.Schemes?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Schemes", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Schemes", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Schemes?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Schemes</h6>
            <Table
              pagination={false}
              columns={columnSchemes}
              dataSource={data?.Schemes}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />
          </div>
        </div>
      </MyDrawer>

      {/* Reasons Drawer */}
      <MyDrawer
        title="Reasons"
        open={drawerOpen?.Reasons}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Reasons"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Reasons");
          IsUpdateFtn("Reasons", false);
        }}
        add={async () => {
          if (!validateForm("Reasons")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Reasons,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Reasons", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Reasons}
        update={async () => {
          if (!validateForm("Reasons")) return;
          await updateFtn("/lookup", drawerIpnuts?.Reasons, () =>
            resetCounteries("Reasons", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Reasons", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                value={drawerIpnuts?.Reasons?.code || ""}
                onChange={(e) =>
                  drawrInptChng("Reasons", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Reasons?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Reasons"
                name="lookupname"
                value={drawerIpnuts?.Reasons?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("Reasons", "lookupname", e.target.value)
                }
                placeholder="Enter reason"
                disabled={isDisable}
                required
                hasError={!!errors?.Reasons?.lookupname}
              />
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                value={drawerIpnuts?.Reasons?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Reasons", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Reasons?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Reasons"
              lookuptypeId={drawerIpnuts?.Reasons?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Reasons?.Parentlookupid}
              parentLabel={drawerIpnuts?.Reasons?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Reasons?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Reasons?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Reasons?.lookuptypeId,
              )}
              hasError={!!errors?.Reasons?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Reasons", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Reasons", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Reasons?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Reasons</h6>
            <Table
              pagination={false}
              columns={columnReasons}
              dataSource={data?.Reasons}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
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
          insertDataFtn(`/api/lookup`, drawerIpnuts?.Schemes, 'Data inserted successfully:',
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
              size="small"
              rowKey={(record, index) => record._id || record.id || record.key || index}
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
        isLoading={lookupDetailLoading && editingLookupDrawer === "Duties"}
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
            () => resetCounteries("Duties", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Duties}
        update={async () => {
          if (!validateForm("Duties")) return;
          await updateFtn("/lookup", drawerIpnuts?.Duties, () =>
            resetCounteries("Duties", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Duties", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            {/* Row 2: Code + Duties Name */}
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.Duties?.code}
                  onChange={(val) => drawrInptChng("Duties", "code", val)}
                  error={errors?.Duties?.code}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Duties Name"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.Duties?.lookupname}
                  onChange={(val) => drawrInptChng("Duties", "lookupname", val)}
                  error={errors?.Duties?.lookupname}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  disabled={isDisable}
                  value={drawerIpnuts?.Duties?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng("Duties", "DisplayName", val)
                  }
                />
              </Col>
              <ParentLookupSelect
                drawerKey="Duties"
                lookuptypeId={drawerIpnuts?.Duties?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Duties?.Parentlookupid}
                parentLabel={drawerIpnuts?.Duties?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Duties?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Duties?.Parentlookuptype}
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Duties?.lookuptypeId,
                )}
                hasError={!!errors?.Duties?.Parentlookupid}
                onChange={(payload) =>
                  handleParentLookupChange("Duties", payload)
                }
              />
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.Duties?.isactive}
                  onChange={(e) =>
                    drawrInptChng("Duties", "isactive", e.target.checked)
                  }
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* History Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Duties</h6>
            <Table
              pagination={false}
              columns={columnDuties}
              dataSource={groupedLookups["Duties"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Grade"
        open={drawerOpen?.Ranks}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Ranks"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Ranks");
          IsUpdateFtn("Ranks", false);
        }}
        add={async () => {
          if (!validateForm("Ranks")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Ranks,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Ranks", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Ranks}
        update={async () => {
          if (!validateForm("Ranks")) return;
          await updateFtn("/lookup", drawerIpnuts?.Ranks, () =>
            resetCounteries("Ranks", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Ranks", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            {/* Row 2: Code + Rank */}
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.Ranks?.code}
                  onChange={(val) => drawrInptChng("Ranks", "code", val)}
                  error={errors?.Ranks?.code}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Grade"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.Ranks?.lookupname}
                  onChange={(val) => drawrInptChng("Ranks", "lookupname", val)}
                  error={errors?.Ranks?.lookupname}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  disabled={isDisable}
                  value={drawerIpnuts?.Ranks?.DisplayName}
                  onChange={(val) => drawrInptChng("Ranks", "DisplayName", val)}
                />
              </Col>
              <ParentLookupSelect
                drawerKey="Ranks"
                lookuptypeId={drawerIpnuts?.Ranks?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Ranks?.Parentlookupid}
                parentLabel={drawerIpnuts?.Ranks?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Ranks?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Ranks?.Parentlookuptype}
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Ranks?.lookuptypeId,
                )}
                hasError={!!errors?.Ranks?.Parentlookupid}
                onChange={(payload) =>
                  handleParentLookupChange("Ranks", payload)
                }
              />
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  onChange={(e) =>
                    drawrInptChng("Ranks", "isactive", e.target.checked)
                  }
                  checked={drawerIpnuts?.Ranks?.isactive}
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* History Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Grades</h6>
            <Table
              pagination={false}
              columns={columnRanks}
              dataSource={groupedLookups["Ranks"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Boards"
        open={drawerOpen?.Boards}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Boards"}
        isPagination={true}
        isEdit={isUpdateRec?.Boards}
        onClose={() => {
          openCloseDrawerFtn("Boards");
          IsUpdateFtn("Boards", false);
        }}
        add={async () => {
          if (!validateForm("Boards")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Boards,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Boards", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        update={async () => {
          if (!validateForm("Boards")) return;
          await updateFtn("/lookup", drawerIpnuts?.Boards, () =>
            resetCounteries("Boards", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Boards", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Board Name */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Boards?.code || ""}
                onChange={(e) =>
                  drawrInptChng("Boards", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Boards?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Board:"
                name="lookupname"
                value={drawerIpnuts?.Boards?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("Boards", "lookupname", e.target.value)
                }
                placeholder="Enter board name"
                disabled={isDisable}
                required
                hasError={!!errors?.Boards?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Boards?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Boards", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Boards?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Boards"
              lookuptypeId={drawerIpnuts?.Boards?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Boards?.Parentlookupid}
              parentLabel={drawerIpnuts?.Boards?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Boards?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Boards?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Boards?.lookuptypeId,
              )}
              hasError={!!errors?.Boards?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Boards", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Boards", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Boards?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Boards Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Boards</h6>
            <Table
              pagination={false}
              columns={columnBoards}
              dataSource={groupedLookups["Boards"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Councils"
        open={drawerOpen?.Councils}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Councils"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Councils");
          IsUpdateFtn("Councils", false);
        }}
        add={async () => {
          if (!validateForm("Councils")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Councils,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Councils", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Councils}
        update={async () => {
          if (!validateForm("Councils")) return;
          await updateFtn("/lookup", drawerIpnuts?.Councils, () =>
            resetCounteries("Councils", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Councils", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Council Name */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.Councils?.code || ""}
                onChange={(e) =>
                  drawrInptChng("Councils", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Councils?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Council Name:"
                name="lookupname"
                value={drawerIpnuts?.Councils?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("Councils", "lookupname", e.target.value)
                }
                placeholder="Enter council name"
                disabled={isDisable}
                required
                hasError={!!errors?.Councils?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Councils?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Councils", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Councils?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="Councils"
              lookuptypeId={drawerIpnuts?.Councils?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.Councils?.Parentlookupid}
              parentLabel={drawerIpnuts?.Councils?.Parentlookup}
              parentLookupTypeId={drawerIpnuts?.Councils?.ParentlookuptypeId}
              parentLookupTypeName={drawerIpnuts?.Councils?.Parentlookuptype}
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.Councils?.lookuptypeId,
              )}
              hasError={!!errors?.Councils?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("Councils", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Councils", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Councils?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Councils Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Councils</h6>
            <Table
              pagination={false}
              columns={columnCouncils}
              dataSource={groupedLookups["Council"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Correspondence Type"
        open={drawerOpen?.CorrespondenceType}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "CorrespondenceType"
        }
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("CorrespondenceType");
          IsUpdateFtn("CorrespondenceType", false);
        }}
        add={async () => {
          if (!validateForm("CorrespondenceType")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.CorrespondenceType,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("CorrespondenceType", () =>
                dispatch(getAllLookups()),
              ),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.CorrespondenceType}
        update={async () => {
          if (!validateForm("CorrespondenceType")) return;
          await updateFtn("/lookup", drawerIpnuts?.CorrespondenceType, () =>
            resetCounteries("CorrespondenceType", () =>
              dispatch(getAllLookups()),
            ),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("CorrespondenceType", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Correspondence Type */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code"
                name="code"
                value={drawerIpnuts?.CorrespondenceType?.code || ""}
                onChange={(e) =>
                  drawrInptChng("CorrespondenceType", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.CorrespondenceType?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Correspondence Type"
                name="lookupname"
                value={drawerIpnuts?.CorrespondenceType?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng(
                    "CorrespondenceType",
                    "lookupname",
                    e.target.value,
                  )
                }
                placeholder="Enter correspondence type"
                disabled={isDisable}
                required
                hasError={!!errors?.CorrespondenceType?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name"
                name="DisplayName"
                value={drawerIpnuts?.CorrespondenceType?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng(
                    "CorrespondenceType",
                    "DisplayName",
                    e.target.value,
                  )
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.CorrespondenceType?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="CorrespondenceType"
              lookuptypeId={drawerIpnuts?.CorrespondenceType?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.CorrespondenceType?.Parentlookupid}
              parentLabel={drawerIpnuts?.CorrespondenceType?.Parentlookup}
              parentLookupTypeId={
                drawerIpnuts?.CorrespondenceType?.ParentlookuptypeId
              }
              parentLookupTypeName={
                drawerIpnuts?.CorrespondenceType?.Parentlookuptype
              }
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.CorrespondenceType?.lookuptypeId,
              )}
              hasError={!!errors?.CorrespondenceType?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("CorrespondenceType", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng(
                    "CorrespondenceType",
                    "isactive",
                    e.target.checked,
                  )
                }
                checked={drawerIpnuts?.CorrespondenceType?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Correspondence Types Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Correspondence Types</h6>
            <Table
              pagination={false}
              columns={columnCorrespondenceType}
              dataSource={data?.CorrespondenceType}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Spoken Languages"
        open={drawerOpen?.SpokenLanguages}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "SpokenLanguages"
        }
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("SpokenLanguages");
          IsUpdateFtn("SpokenLanguages", false);
        }}
        add={async () => {
          if (!validateForm("SpokenLanguages")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.SpokenLanguages,
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetCounteries("SpokenLanguages", () =>
                dispatch(getAllLookups()),
              ),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.SpokenLanguages}
        update={async () => {
          if (!validateForm("SpokenLanguages")) return;
          await updateFtn("/lookup", drawerIpnuts?.SpokenLanguages, () =>
            resetCounteries("SpokenLanguages", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("SpokenLanguages", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          {/* Code + Spoken Language */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Code:"
                name="code"
                value={drawerIpnuts?.SpokenLanguages?.code || ""}
                onChange={(e) =>
                  drawrInptChng("SpokenLanguages", "code", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.SpokenLanguages?.code}
              />
            </Col>
            <Col span={12}>
              <MyInput
                label="Spoken Language:"
                name="lookupname"
                value={drawerIpnuts?.SpokenLanguages?.lookupname || ""}
                onChange={(e) =>
                  drawrInptChng("SpokenLanguages", "lookupname", e.target.value)
                }
                placeholder="Enter spoken language"
                disabled={isDisable}
                required
                hasError={!!errors?.SpokenLanguages?.lookupname}
              />
            </Col>
          </Row>

          {/* Display Name + Active */}
          <Row gutter={24}>
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.SpokenLanguages?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng(
                    "SpokenLanguages",
                    "DisplayName",
                    e.target.value,
                  )
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.SpokenLanguages?.DisplayName}
              />
            </Col>
            <ParentLookupSelect
              drawerKey="SpokenLanguages"
              lookuptypeId={drawerIpnuts?.SpokenLanguages?.lookuptypeId}
              lookups={lookups}
              lookupsTypes={lookupsTypes}
              value={drawerIpnuts?.SpokenLanguages?.Parentlookupid}
              parentLabel={drawerIpnuts?.SpokenLanguages?.Parentlookup}
              parentLookupTypeId={
                drawerIpnuts?.SpokenLanguages?.ParentlookuptypeId
              }
              parentLookupTypeName={
                drawerIpnuts?.SpokenLanguages?.Parentlookuptype
              }
              disabled={isDisable}
              required={lookupTypeRequiresParent(
                lookupsTypes,
                drawerIpnuts?.SpokenLanguages?.lookuptypeId,
              )}
              hasError={!!errors?.SpokenLanguages?.Parentlookupid}
              onChange={(payload) =>
                handleParentLookupChange("SpokenLanguages", payload)
              }
            />
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("SpokenLanguages", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.SpokenLanguages?.isactive}
                style={{ marginTop: "26px" }}
              >
                Active
              </Checkbox>
            </Col>
          </Row>

          {/* Existing Spoken Languages Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Spoken Languages</h6>
            <Table
              pagination={false}
              columns={SLColumns}
              dataSource={groupedLookups["Spoken Languages"]}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
        title="Solicitors"
        open={drawerOpen?.Solicitors}
        isPagination={false}
        onClose={() => openCloseDrawerFtn("Solicitors")}
        add={() => {
          if (!validateSolicitors("Solicitors")) return;
          insertDataFtn(
            `/contacts`,
            drawerIpnuts?.Solicitors,
            "Data inserted successfully",
            "Data did not insert",
            () => {
              resetCounteries("Solicitors", () => dispatch(getContacts()));
              dispatch(getContacts());
            },
          );
        }}
        update={async () => {
          const simplified = simplifyContact(drawerIpnuts?.Solicitors);
          if (!validateSolicitors("Solicitors")) return;
          await updateFtn(
            `/contacts/${drawerIpnuts?.Solicitors?.id}`,
            simplified,
            () => resetCounteries("Solicitors", () => dispatch(getContacts())),
          );
          // dispatch(getAllLookups());
          // IsUpdateFtn("Solicitors", false);
        }}
        isEdit={isUpdateRec?.Solicitors}
        width={"1020px"}
      >
        {/* Personal Information */}
        <div className="drawer-main-container">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <CustomSelect
                label="Contact Type:"
                placeholder="Select Contact Type"
                options={contactTypelookup}
                value={drawerIpnuts?.Solicitors?.contactTypeId}
                onChange={(e) =>
                  drawrInptChng("Solicitors", "contactTypeId", e.target.value)
                }
                disabled={true}
                required
                hasError={!!errors?.Solicitors?.contactTypeId}
                errorMessage={errors?.Solicitors?.contactTypeId}
              />
            </Col>

            <Col xs={24} md={12}>
              <CustomSelect
                label="Title:"
                placeholder="Select Title"
                options={lookupsForSelect?.Titles}
                disabled={true}
                value={drawerIpnuts?.Solicitors?.title}
                onChange={(e) =>
                  drawrInptChng("Solicitors", "title", e.target.value)
                }
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Forename:"
                value={drawerIpnuts?.Solicitors?.forename}
                onChange={(e) =>
                  drawrInptChng("Solicitors", "forename", e.target.value)
                }
                disabled={isDisable}
                required
                hasError={!!errors?.Solicitors?.forename}
                errorMessage={errors?.Solicitors?.forename}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Surname:"
                value={drawerIpnuts?.Solicitors?.surname}
                onChange={(e) =>
                  drawrInptChng("Solicitors", "surname", e.target.value)
                }
                disabled={isDisable}
                required
                hasError={!!errors?.Solicitors?.surname}
                errorMessage={errors?.Solicitors?.surname}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Email:"
                type="email"
                value={drawerIpnuts?.Solicitors?.contactEmail}
                onChange={(e) =>
                  drawrInptChng("Solicitors", "contactEmail", e.target.value)
                }
                disabled={isDisable}
                required
                hasError={!!errors?.Solicitors?.contactEmail}
                errorMessage={errors?.Solicitors?.contactEmail}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Mobile:"
                type="mobile"
                value={drawerIpnuts?.Solicitors?.contactPhone}
                onChange={(e) =>
                  drawrInptChng("Solicitors", "contactPhone", e.target.value)
                }
                disabled={isDisable}
                required
                hasError={!!errors?.Solicitors?.contactPhone}
                errorMessage={errors?.Solicitors?.contactPhone}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Building or House:"
                value={
                  drawerIpnuts?.Solicitors?.contactAddress?.buildingOrHouse
                }
                onChange={(e) =>
                  drawrInptChng(
                    "Solicitors",
                    "contactAddress.buildingOrHouse",
                    e.target.value,
                  )
                }
                disabled={isDisable}
                hasError={!!errors?.Solicitors?.buildingOrHouse}
                errorMessage={errors?.Solicitors?.buildingOrHouse}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Street or Road:"
                value={drawerIpnuts?.Solicitors?.contactAddress?.streetOrRoad}
                onChange={(e) =>
                  drawrInptChng(
                    "Solicitors",
                    "contactAddress.streetOrRoad",
                    e.target.value,
                  )
                }
                disabled={isDisable}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Area or Town:"
                value={drawerIpnuts?.Solicitors?.contactAddress?.areaOrTown}
                onChange={(e) =>
                  drawrInptChng(
                    "Solicitors",
                    "contactAddress.areaOrTown",
                    e.target.value,
                  )
                }
                disabled={isDisable}
                hasError={!!errors?.Solicitors?.areaOrTown}
                errorMessage={errors?.Solicitors?.areaOrTown}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="County, City or Postcode:"
                value={
                  drawerIpnuts?.Solicitors?.contactAddress?.cityCountyOrPostCode
                }
                onChange={(e) =>
                  drawrInptChng(
                    "Solicitors",
                    "contactAddress.cityCountyOrPostCode",
                    e.target.value,
                  )
                }
                disabled={isDisable}
              />
            </Col>

            <Col xs={24} md={12}>
              <MyInput
                label="Eircode:"
                value={drawerIpnuts?.Solicitors?.contactAddress?.eircode}
                onChange={(e) =>
                  drawrInptChng(
                    "Solicitors",
                    "contactAddress.eircode",
                    e.target.value,
                  )
                }
                disabled={isDisable}
              />
            </Col>

            <Col span={24}>
              <Table
                pagination={false}
                columns={columnsSolicitors}
                dataSource={data?.Solicitors}
                loading={contactsLoading}
                className="drawer-tbl"
                size="small"
                rowKey={(record, index) =>
                  record._id || record.id || record.key || index
                }
                rowClassName={(record, index) =>
                  index % 2 !== 0 ? "odd-row" : "even-row"
                }
                rowSelection={{
                  type: selectionType,
                  ...rowSelection,
                }}
                bordered
              />
            </Col>
          </Row>
        </div>
      </MyDrawer>

      <MyDrawer
        title="Committees"
        open={drawerOpen?.Committees}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Committees"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Committees");
          IsUpdateFtn("Committees", false);
        }}
        isAddMemeber={true}
        add={async () => {
          await insertDataFtn(
            `${baseURL}/lookup`,
            { region: drawerIpnuts?.Committees },
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Lookup", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Committees}
        update={async () => {
          await updateFtn("/lookup", drawerIpnuts?.Lookup, () =>
            resetCounteries("Committees", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Lookup", false);
        }}
        // width="680"
      >
        <div className="drawer-main-cntainer p-4">
          {/* Code + Committee Name */}
          <Row gutter={24}>
            {" "}
            <Col span={12}>
              {" "}
              <MyInput
                label="Code:"
                name="RegionCode"
                value={drawerIpnuts?.Committees?.RegionCode || ""}
                onChange={(e) =>
                  drawrInptChng("Committees", "RegionCode", e.target.value)
                }
                placeholder="Enter code"
                disabled={isDisable}
                required
                hasError={!!errors?.Committees?.RegionCode}
              />{" "}
            </Col>
            <Col span={12}>
              {" "}
              <MyInput
                label="Committee Name:"
                name="RegionName"
                value={drawerIpnuts?.Committees?.RegionName || ""}
                onChange={(e) =>
                  drawrInptChng("Committees", "RegionName", e.target.value)
                }
                placeholder="Enter committee name"
                disabled={isDisable}
                required
                hasError={!!errors?.Committees?.RegionName}
              />{" "}
            </Col>
          </Row>{" "}
          {/* Display Name + Active */}
          <Row gutter={24}>
            {" "}
            <Col span={12}>
              <MyInput
                label="Display Name:"
                name="DisplayName"
                value={drawerIpnuts?.Committees?.DisplayName || ""}
                onChange={(e) =>
                  drawrInptChng("Committees", "DisplayName", e.target.value)
                }
                placeholder="Enter display name"
                disabled={isDisable}
                hasError={!!errors?.Committees?.DisplayName}
              />{" "}
            </Col>
            <Col span={10}>
              <CustomSelect
                label="Parent:"
                isSimple={true}
                placeholder="Select parent"
                options={lookupsType}
                value={drawerIpnuts?.Committees?.ParentId}
                onChange={(value) =>
                  drawrInptChng("Committees", "ParentId", String(value))
                }
                disabled={isDisable}
              />
            </Col>
            <Col span={2}>
              <Button
                className="butn primary-btn detail-btn"
                disabled={isDisable}
                style={{ marginTop: 25, width: "100%", height: "40px" }}
              >
                +
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Checkbox
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Committees", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Committees?.isactive}
              >
                Active
              </Checkbox>
            </Col>
          </Row>
          {/* Parent */}
          <div className="mt-4 config-tbl-container">
            <h6 className="mb-3 text-primary">Existing Committees</h6>
            <Table
              pagination={false}
              columns={Committeescolumns}
              dataSource={groupedLookups?.Committees || []}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record) => record._id || record.id || record.RegionCode}
              rowClassName={(record, index) =>
                index % 2 !== 0 ? "odd-row" : "even-row"
              }
              rowSelection={{ type: selectionType, ...rowSelection }}
              bordered
            />{" "}
          </div>{" "}
        </div>
      </MyDrawer>

      <MyDrawer
        title="Sections"
        open={drawerOpen?.Sections}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Sections"}
        isPagination={true}
        onClose={() => {
          openCloseDrawerFtn("Sections");
          IsUpdateFtn("Sections", false);
        }}
        add={async () => {
          if (!validateForm("Sections")) return;
          await insertDataFtn(
            `/lookup`,
            drawerIpnuts?.Sections,
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("Sections", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Sections}
        update={async () => {
          if (!validateForm("Sections")) return;
          await updateFtn("/lookup", drawerIpnuts?.Sections, () =>
            resetCounteries("Sections", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Sections", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            {/* Row 2: Code + Section Name */}
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.Sections?.code}
                  onChange={(val) => drawrInptChng("Sections", "code", val)}
                  error={errors?.Sections?.code}
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Section Name"
                  required
                  disabled={isDisable}
                  value={drawerIpnuts?.Sections?.lookupname}
                  onChange={(val) =>
                    drawrInptChng("Sections", "lookupname", val)
                  }
                  error={errors?.Sections?.lookupname}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  disabled={isDisable}
                  value={drawerIpnuts?.Sections?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng("Sections", "DisplayName", val)
                  }
                />
              </Col>
              <ParentLookupSelect
                drawerKey="Sections"
                lookuptypeId={drawerIpnuts?.Sections?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.Sections?.Parentlookupid}
                parentLabel={drawerIpnuts?.Sections?.Parentlookup}
                parentLookupTypeId={drawerIpnuts?.Sections?.ParentlookuptypeId}
                parentLookupTypeName={drawerIpnuts?.Sections?.Parentlookuptype}
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.Sections?.lookuptypeId,
                )}
                hasError={!!errors?.Sections?.Parentlookupid}
                onChange={(payload) =>
                  handleParentLookupChange("Sections", payload)
                }
              />
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  onChange={(e) =>
                    drawrInptChng("Sections", "isactive", e.target.checked)
                  }
                  checked={drawerIpnuts?.Sections?.isactive}
                >
                  Active
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* History Table */}
          <div className="mt-4 config-tbl-container">
            <h6 className=" mb-3 text-primary">Existing Sections</h6>
            <Table
              pagination={false}
              columns={columnSections}
              dataSource={data?.Sections}
              loading={lookupsloading}
              className="drawer-tbl"
              size="small"
              rowKey={(record, index) =>
                record._id || record.id || record.key || index
              }
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
};

export default Configuration;
