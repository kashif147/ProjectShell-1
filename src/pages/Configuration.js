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
  getLookupTypeFieldProps,
  resolveConfigurationDrawerKey,
  getLookupsForLookupType,
  getLookupTypeFieldPropsForRecord,
  isWorkLocationLookupType,
  withDynamicLookupTypeId,
  isLookupDrawerKey,
} from "../utils/configurationLookupHelpers";
import ParentLookupSelect from "../component/configuration/ParentLookupSelect";
import LookupRecordDrawer from "../component/configuration/LookupRecordDrawer";
import {
  lookupTypeRequiresParent,
  resolveParentLookupIdFromRecord,
  resolveParentLookupLabelFromRecord,
  resolveParentLookupTypeIdFromRecord,
  resolveParentLookupTypeLabelFromRecord,
  mapLookupTypeToFormValues,
  mapLookupToFormValues,
  buildLookupApiPayload,
  getParentLookupType,
  getDrawerParentFieldLabel,
} from "../utils/lookupHierarchy";
import ParentLookupTypeSelect from "../component/configuration/ParentLookupTypeSelect";
import { set } from "react-hook-form";
import MyInput from "../component/common/MyInput";
import { useNavigate } from "react-router-dom";
import { fetchCountries, clearCountriesData } from "../features/CountriesSlice";
import { getBookmarks, resetBookmarks } from "../features/template/BookmarkActions";
import { useJsApiLoader, StandaloneSearchBox } from "@react-google-maps/api";
import { useOfficerRoleUsers } from "../hooks/useOfficerRoleUsers";
import {
  buildOfficerSelectOptions,
  resolveOfficerSelectValue,
} from "../utils/officerRoles";

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
                  ? "var(--app-brand-bg)"
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
  const {
    iroOptions: officerIroOptions,
    branchOptions: officerBranchOptions,
    regionOptions: officerRegionOptions,
  } = useOfficerRoleUsers();

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
  const [searchTermStudyLocation, setSearchTermStudyLocation] = useState("");
  const [searchTermVenue, setSearchTermVenue] = useState("");
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

  const studyLocationRecords = useMemo(() => {
    const lookupType = getLookupTypeRecordForDrawer(
      "StudyLocation",
      lookupsTypes,
    );
    const byType = getLookupsForLookupType(lookupType, lookups);
    if (byType.length) return byType;
    return (
      groupedLookups["Study Location"] ||
      groupedLookups.StudyLocation ||
      []
    );
  }, [lookupsTypes, lookups, groupedLookups]);

  const filteredStudyLocations = useMemo(() => {
    if (!searchTermStudyLocation.trim()) return studyLocationRecords;
    const term = searchTermStudyLocation.toLowerCase().trim();
    return studyLocationRecords.filter(
      (item) =>
        (item.lookupname || "").toLowerCase().includes(term) ||
        (item.code || "").toLowerCase().includes(term) ||
        (item.DisplayName || "").toLowerCase().includes(term) ||
        (item.Parentlookup || "").toLowerCase().includes(term) ||
        (item.officer?.userEmail || "").toLowerCase().includes(term),
    );
  }, [studyLocationRecords, searchTermStudyLocation]);

  const venueRecords = useMemo(() => {
    const lookupType = getLookupTypeRecordForDrawer("Venue", lookupsTypes);
    return getLookupsForLookupType(lookupType, lookups);
  }, [lookupsTypes, lookups]);

  const filteredVenues = useMemo(() => {
    if (!searchTermVenue.trim()) return venueRecords;
    const term = searchTermVenue.toLowerCase().trim();
    return venueRecords.filter(
      (item) =>
        (item.lookupname || "").toLowerCase().includes(term) ||
        (item.code || "").toLowerCase().includes(term) ||
        (item.DisplayName || "").toLowerCase().includes(term) ||
        (item.venueAddress?.fullAddress || "").toLowerCase().includes(term),
    );
  }, [venueRecords, searchTermVenue]);

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
  const handleStudyLocationSearchChange = (e) =>
    setSearchTermStudyLocation(e.target.value);
  const clearStudyLocationSearch = () => setSearchTermStudyLocation("");
  const handleVenueSearchChange = (e) => setSearchTermVenue(e.target.value);
  const clearVenueSearch = () => setSearchTermVenue("");

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

      setButtonLoading((prev) => ({ ...prev, update: true }));
      const response = await axios.put(`${baseUrl}${endPoint}`, data1, {
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

      const isParentBlocked = /parent of other lookups/i.test(errMsg);

      MyAlert(
        "error",
        isParentBlocked ? "Cannot delete this record" : "Delete failed",
        isParentBlocked
          ? "This lookup is used as a parent by other records. Reassign or delete those child lookups first, then try again."
          : errMsg,
      );

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

  const refreshBookmarks = useCallback(() => {
    dispatch(resetBookmarks());
    dispatch(getBookmarks());
  }, [dispatch]);

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
              IsUpdateFtn("Bookmarks", !isUpdateRec?.Bookmarks, record);
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
                    () => {
                      dispatch(resetBookmarks());
                      dispatch(getBookmarks());
                    },
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
  const [studyLocationAddressSearchValue, setStudyLocationAddressSearchValue] =
    useState("");
  const [venueAddressSearchValue, setVenueAddressSearchValue] = useState("");
  const addressInputRef = useRef(null);
  const studyLocationAddressInputRef = useRef(null);
  const venueAddressInputRef = useRef(null);
  const mapsLibraries = ["places", "maps"];
  const { isLoaded: isMapsLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCJYpj8WV5Rzof7O3jGhW9XabD0J4Yqe1o",
    libraries: mapsLibraries,
  });

  const handleLocationPlacesChanged = (
    drawerKey,
    searchBoxRef,
    setSearchValue,
    addressFieldName = "worklocationAddress",
  ) => {
    const places = searchBoxRef.current?.getPlaces();
    if (!places || places.length === 0) return;

    const place = places[0];
    if (place.formatted_address) setSearchValue(place.formatted_address);

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
          [drawerKey]: {
            ...prev[drawerKey],
            [addressFieldName]: {
              ...prev[drawerKey]?.[addressFieldName],
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

  const handleStationPlacesChanged = () =>
    handleLocationPlacesChanged(
      "Station",
      addressInputRef,
      setAddressSearchValue,
      "worklocationAddress",
    );

  const handleStudyLocationPlacesChanged = () =>
    handleLocationPlacesChanged(
      "StudyLocation",
      studyLocationAddressInputRef,
      setStudyLocationAddressSearchValue,
      "worklocationAddress",
    );

  const handleVenuePlacesChanged = () =>
    handleLocationPlacesChanged(
      "Venue",
      venueAddressInputRef,
      setVenueAddressSearchValue,
      "venueAddress",
    );
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
    Venue: false,
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
    StudyLocation: false,
    Venue: false,
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
      officerLabel: "",
      worklocationAddress: {
        eircode: "",
        buildingOrHouse: "",
        streetOrRoad: "",
        areaOrTown: "",
        countyCityOrPostCode: "",
        country: "",
        fullAddress: "",
      },
      processSalaryDeduction: false,
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
      officerLabel: "",
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
      officerLabel: "",
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
      processSalaryDeduction: false,
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
      processSalaryDeduction: false,
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
      Parentlookupid: null,
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
      officer: null,
      officerLabel: "",
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
    Venue: {
      lookuptypeId: "",
      DisplayName: "",
      lookupname: "",
      code: "",
      userid: "67f3f9d812b014a0a7a94081",
      isactive: true,
      isDeleted: false,
      venueAddress: {
        eircode: "",
        buildingOrHouse: "",
        streetOrRoad: "",
        areaOrTown: "",
        countyCityOrPostCode: "",
        country: "",
        fullAddress: "",
      },
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
    // MyInput passes a synthetic event; some handlers also pass the raw string.
    const nextValue =
      value != null &&
      typeof value === "object" &&
      Object.prototype.hasOwnProperty.call(value, "target")
        ? value.target?.type === "checkbox"
          ? value.target.checked
          : value.target?.value
        : value;

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
              [child]: nextValue, // Update only the specific nested field
            },
          },
        };
      } else {
        return {
          ...prevState,
          [drawer]: {
            ...prevState[drawer],
            [field]: nextValue, // Update top-level field
          },
        };
      }
    });
  };

  const handleParentLookupChange = (drawer, { parentId, parentLabel }) => {
    const parentType = getParentLookupType(
      lookupsTypes,
      drawerIpnuts?.[drawer]?.lookuptypeId,
      drawer,
    );
    const parentTypeLabel =
      getDrawerParentFieldLabel(drawer, "") ||
      parentType?.lookuptype ||
      parentType?.DisplayName ||
      "";

    setdrawerIpnuts((prev) => ({
      ...prev,
      [drawer]: {
        ...prev[drawer],
        Parentlookupid: parentId,
        Parentlookup: parentLabel ?? "",
        ...(parentType
          ? {
              ParentlookuptypeId: parentType._id || parentType.id || null,
              Parentlookuptype: parentTypeLabel || parentType.lookuptype || "",
            }
          : {}),
      },
    }));
  };

  const getLookupDrawerPayload = (drawerKey) => {
    const form = drawerIpnuts?.[drawerKey] || {};
    const forcedTypeId =
      drawerKey === "StandardLookup" && activeStandardLookupType?._id
        ? String(activeStandardLookupType._id)
        : null;
    return buildLookupApiPayload(
      forcedTypeId ? { ...form, lookuptypeId: forcedTypeId } : form,
      lookupsTypes,
      drawerKey,
    );
  };

  const handleOfficerChange = (drawer, options, e) => {
    const selectedId = e.target.value === "" ? null : e.target.value;
    const selected = options.find(
      (opt) => String(opt.key) === String(selectedId),
    );
    setdrawerIpnuts((prev) => ({
      ...prev,
      [drawer]: {
        ...prev[drawer],
        officer: selectedId,
        officerLabel: selected?.label || "",
      },
    }));
  };

  const stationOfficerOptions = useMemo(
    () =>
      buildOfficerSelectOptions(
        officerIroOptions,
        drawerIpnuts?.Station?.officer,
        drawerIpnuts?.Station?.officerLabel,
      ),
    [
      officerIroOptions,
      drawerIpnuts?.Station?.officer,
      drawerIpnuts?.Station?.officerLabel,
    ],
  );

  const studyLocationOfficerOptions = useMemo(
    () =>
      buildOfficerSelectOptions(
        officerIroOptions,
        drawerIpnuts?.StudyLocation?.officer,
        drawerIpnuts?.StudyLocation?.officerLabel,
      ),
    [
      officerIroOptions,
      drawerIpnuts?.StudyLocation?.officer,
      drawerIpnuts?.StudyLocation?.officerLabel,
    ],
  );

  const branchOfficerOptions = useMemo(
    () =>
      buildOfficerSelectOptions(
        officerBranchOptions,
        drawerIpnuts?.Districts?.officer,
        drawerIpnuts?.Districts?.officerLabel,
      ),
    [
      officerBranchOptions,
      drawerIpnuts?.Districts?.officer,
      drawerIpnuts?.Districts?.officerLabel,
    ],
  );

  const regionOfficerOptions = useMemo(
    () =>
      buildOfficerSelectOptions(
        officerRegionOptions,
        drawerIpnuts?.Divisions?.officer,
        drawerIpnuts?.Divisions?.officerLabel,
      ),
    [
      officerRegionOptions,
      drawerIpnuts?.Divisions?.officer,
      drawerIpnuts?.Divisions?.officerLabel,
    ],
  );

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
    setdrawerIpnuts((prevState) => {
      let nextForm = getDrawerInputsTemplate(drawer);
      if (drawer === "StandardLookup" && activeStandardLookupType?._id) {
        nextForm = {
          ...nextForm,
          lookuptypeId: String(activeStandardLookupType._id),
        };
      }
      return {
        ...prevState,
        [drawer]: nextForm,
      };
    });
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
              // StandardLookup: start a clean form with the selected card type
              // (Bank, Secondary Section, …), not leftover state from another card.
              ...(name === "StandardLookup"
                ? getDrawerInputsTemplate(name)
                : prev[name] || getDrawerInputsTemplate(name) || {}),
              lookuptypeId: String(lookupType._id),
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
      title: "Process Salary Deduction",
      key: "processSalaryDeduction",
      render: (_, record) => (
        <Checkbox disabled checked={!!record?.processSalaryDeduction} />
      ),
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
  const columnStudyLocations = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      filterDropdown: createFilterDropdown(
        studyLocationRecords,
        (record) => record.code,
      ),
      onFilter: (value, record) => (record.code || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Study Location",
      dataIndex: "lookupname",
      key: "lookupname",
      sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
      filterDropdown: createFilterDropdown(
        studyLocationRecords,
        (record) => record.lookupname,
      ),
      onFilter: (value, record) =>
        (record.lookupname || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      sorter: (a, b) =>
        (a.DisplayName || "").localeCompare(b.DisplayName || ""),
      filterDropdown: createFilterDropdown(
        studyLocationRecords,
        (record) => record.DisplayName,
      ),
      onFilter: (value, record) =>
        (record.DisplayName || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Branch",
      dataIndex: "Parentlookup",
      key: "Parentlookup",
      sorter: (a, b) =>
        (a.Parentlookup || "").localeCompare(b.Parentlookup || ""),
      filterDropdown: createFilterDropdown(
        studyLocationRecords,
        (record) => record.Parentlookup,
      ),
      onFilter: (value, record) =>
        (record.Parentlookup || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Officer",
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
      filterDropdown: createFilterDropdown(studyLocationRecords, (record) => {
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
      render: (_, record) => {
        const o = record?.officer;
        if (!o) return "-";
        if (typeof o === "object") {
          return (
            o.userFullName ||
            `${o.userFirstName || ""} ${o.userLastName || ""}`.trim() ||
            o.userEmail ||
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
            onClick={() => loadLookupForEdit("StudyLocation", record)}
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

  const columnVenues = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => (a.code || "").localeCompare(b.code || ""),
      filterDropdown: createFilterDropdown(
        venueRecords,
        (record) => record.code,
      ),
      onFilter: (value, record) => (record.code || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Venue Name",
      dataIndex: "lookupname",
      key: "lookupname",
      sorter: (a, b) => (a.lookupname || "").localeCompare(b.lookupname || ""),
      filterDropdown: createFilterDropdown(
        venueRecords,
        (record) => record.lookupname,
      ),
      onFilter: (value, record) =>
        (record.lookupname || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Display Name",
      dataIndex: "DisplayName",
      key: "DisplayName",
      sorter: (a, b) =>
        (a.DisplayName || "").localeCompare(b.DisplayName || ""),
      filterDropdown: createFilterDropdown(
        venueRecords,
        (record) => record.DisplayName,
      ),
      onFilter: (value, record) =>
        (record.DisplayName || "").toString() === value,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
      ),
    },
    {
      title: "Address",
      key: "venueAddress",
      render: (_, record) => {
        const addr = record?.venueAddress;
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
            onClick={() => loadLookupForEdit("Venue", record)}
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
        <SearchOutlined style={{ color: filtered ? "var(--app-brand-accent)" : undefined }} />
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
      className="configuration-main configuration-page"
      style={{ paddingBottom: "120px" }}
    >
      <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
        <div className="configuration-page-header">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="mb-1">Configuration</h4>
              <p className="text-muted mb-0">
                System configuration and lookup management
              </p>
            </div>
          </div>
          <div className="mb-3">
            <Input
              placeholder="Search lookups..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              allowClear
            />
          </div>
        </div>
        <div
          className="flex-grow-1 hide-scroll-webkit configuration-cards-panel"
          style={{
            overflowY: "auto",
            maxHeight: "calc(100vh - 160px)",
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
              <div className="row configuration-cards-grid">
                {filteredItems.map((item) => (
                  <div
                    key={item.lookupTypeId || item.key}
                    className="col-4 col-sm-3 col-md-2 col-lg-1-5 d-flex"
                  >
                    <div
                      onClick={() => openConfigurationCard(item)}
                      className="configuration-card d-flex flex-column align-items-center justify-content-center border rounded bg-white w-100 text-center"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="configuration-card__icon">
                        {item.icon}
                      </div>
                      <p className="configuration-card__label mb-0 text-dark">
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
        title="Branch"
        open={drawerOpen?.Districts}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Districts"}
        // isPagination={true}
        onClose={() => openCloseDrawerFtn("Districts")}
        isEdit={isUpdateRec?.Districts}
        isContact={true}
        update={async () => {
          if (!validateForm("Districts")) return;
          await updateFtn(
            "/lookup",
            getLookupDrawerPayload("Districts"),
            () => {
              resetCounteries("Districts");
              refreshLookups();
            },
          );
          IsUpdateFtn("Districts", false);
        }}
        add={() => {
          if (!validateForm("Districts")) return;
          insertDataFtn(
            `/lookup`,
            getLookupDrawerPayload("Districts"),
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
              <CustomSelect
                label="Branch Officer"
                placeholder="Select Branch Manager"
                options={branchOfficerOptions}
                value={resolveOfficerSelectValue(
                  drawerIpnuts?.Districts?.officer,
                )}
                onChange={(e) =>
                  handleOfficerChange("Districts", branchOfficerOptions, e)
                }
                isIDs={true}
              />
            </Col>
          </Row>

          <Row gutter={24}>
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

          <Row
            gutter={24}
            className="config-drawer-parent-action-row"
            wrap={false}
          >
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
              getLookupDrawerPayload("Divisions"),
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
            await updateFtn(
              "/lookup",
              getLookupDrawerPayload("Divisions"),
              () => {
                resetCounteries("Divisions");
                refreshLookups();
              },
            );
            IsUpdateFtn("Divisions", false);
          }}
          isEdit={isUpdateRec?.Divisions}
        >
          <div className="drawer-main-cntainer p-4 me-2 ms-2">
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
                <CustomSelect
                  label="Region Officer"
                  placeholder="Select Region Officer"
                  options={regionOfficerOptions}
                  value={resolveOfficerSelectValue(
                    drawerIpnuts?.Divisions?.officer,
                  )}
                  onChange={(e) =>
                    handleOfficerChange("Divisions", regionOfficerOptions, e)
                  }
                  isIDs={true}
                />
              </Col>
            </Row>

            <Row gutter={24}>
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
            </Row>

            <Row gutter={24}>
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
            getLookupDrawerPayload("Divisions"),
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
          await updateFtn(
            "/lookup",
            getLookupDrawerPayload("Divisions"),
            () => {
              resetCounteries("Divisions");
              refreshLookups();
            },
          );
          IsUpdateFtn("Divisions", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
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
              <CustomSelect
                label="Region Officer"
                placeholder="Select Region Officer"
                options={regionOfficerOptions}
                value={resolveOfficerSelectValue(
                  drawerIpnuts?.Divisions?.officer,
                )}
                onChange={(e) =>
                  handleOfficerChange("Divisions", regionOfficerOptions, e)
                }
                isIDs={true}
              />
            </Col>
          </Row>
          <Row gutter={24}>
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
          </Row>
          <Row gutter={24}>
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
            getLookupDrawerPayload("Station"),
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
          await updateFtn("/lookup", getLookupDrawerPayload("Station"), () => {
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
                  options={stationOfficerOptions}
                  value={resolveOfficerSelectValue(
                    drawerIpnuts?.Station?.officer,
                  )}
                  onChange={(e) =>
                    handleOfficerChange("Station", stationOfficerOptions, e)
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

            <Row
              gutter={24}
              className="config-drawer-parent-action-row"
              wrap={false}
            >
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
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={!!drawerIpnuts?.Station?.processSalaryDeduction}
                  onChange={(e) =>
                    drawrInptChng(
                      "Station",
                      "processSalaryDeduction",
                      e.target.checked,
                    )
                  }
                >
                  Process Salary Deduction
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
        add={async () => {
          if (!validateForm("StudyLocation")) return;
          await insertDataFtn(
            `/lookup`,
            getLookupDrawerPayload("StudyLocation"),
            "Data inserted successfully:",
            "Data did not insert:",
            () => resetCounteries("StudyLocation"),
          );
          await dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.StudyLocation}
        update={async () => {
          if (!validateForm("StudyLocation")) return;
          await updateFtn(
            "/lookup",
            getLookupDrawerPayload("StudyLocation"),
            () => resetCounteries("StudyLocation"),
          );
          await dispatch(getAllLookups());
          IsUpdateFtn("StudyLocation", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.StudyLocation?.code}
                  onChange={(val) =>
                    drawrInptChng("StudyLocation", "code", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.StudyLocation?.code}
                  errorMessage={errors?.StudyLocation?.code}
                  required
                />
              </Col>
              <Col span={12}>
                <CustomSelect
                  label="Officer"
                  placeholder="Select Officer"
                  options={studyLocationOfficerOptions}
                  value={resolveOfficerSelectValue(
                    drawerIpnuts?.StudyLocation?.officer,
                  )}
                  onChange={(e) =>
                    handleOfficerChange(
                      "StudyLocation",
                      studyLocationOfficerOptions,
                      e,
                    )
                  }
                  isIDs={true}
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Study Location Name"
                  name="lookupname"
                  value={drawerIpnuts?.StudyLocation?.lookupname}
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
                      "lookupname",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                  hasError={!!errors?.StudyLocation?.lookupname}
                  errorMessage={errors?.StudyLocation?.lookupname}
                  required
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.StudyLocation?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
                      "DisplayName",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>
            </Row>

            <Row
              gutter={24}
              className="config-drawer-parent-action-row"
              wrap={false}
            >
              <ParentLookupSelect
                drawerKey="StudyLocation"
                lookuptypeId={drawerIpnuts?.StudyLocation?.lookuptypeId}
                lookups={lookups}
                lookupsTypes={lookupsTypes}
                value={drawerIpnuts?.StudyLocation?.Parentlookupid}
                parentLabel={drawerIpnuts?.StudyLocation?.Parentlookup}
                parentLookupTypeId={
                  drawerIpnuts?.StudyLocation?.ParentlookuptypeId
                }
                parentLookupTypeName={
                  drawerIpnuts?.StudyLocation?.Parentlookuptype
                }
                disabled={isDisable}
                required={lookupTypeRequiresParent(
                  lookupsTypes,
                  drawerIpnuts?.StudyLocation?.lookuptypeId,
                  "StudyLocation",
                )}
                hasError={!!errors?.StudyLocation?.Parentlookupid}
                span={12}
                onChange={(payload) =>
                  handleParentLookupChange("StudyLocation", payload)
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
                  checked={drawerIpnuts?.StudyLocation?.isactive}
                  onChange={(e) =>
                    drawrInptChng(
                      "StudyLocation",
                      "isactive",
                      e.target.checked,
                    )
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

              <Col span={24}>
                {isMapsLoaded && (
                  <StandaloneSearchBox
                    onLoad={(ref) =>
                      (studyLocationAddressInputRef.current = ref)
                    }
                    onPlacesChanged={handleStudyLocationPlacesChanged}
                  >
                    <MyInput
                      label="Search by Address or Eircode"
                      name="studyLocationAddressSearch"
                      placeholder="Enter Eircode (e.g., D01X4X0) or address"
                      disabled={isDisable}
                      value={studyLocationAddressSearchValue}
                      onChange={(e) =>
                        setStudyLocationAddressSearchValue(e.target.value)
                      }
                    />
                  </StandaloneSearchBox>
                )}
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 1 (Building or House)"
                  name="buildingOrHouse"
                  value={
                    drawerIpnuts?.StudyLocation?.worklocationAddress
                      ?.buildingOrHouse
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
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
                    drawerIpnuts?.StudyLocation?.worklocationAddress
                      ?.streetOrRoad
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
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
                  value={
                    drawerIpnuts?.StudyLocation?.worklocationAddress?.areaOrTown
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
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
                    drawerIpnuts?.StudyLocation?.worklocationAddress
                      ?.countyCityOrPostCode
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
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
                  value={
                    drawerIpnuts?.StudyLocation?.worklocationAddress?.eircode
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
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
                  value={
                    drawerIpnuts?.StudyLocation?.worklocationAddress?.country
                  }
                  options={countriesOptions}
                  onChange={(val) =>
                    drawrInptChng(
                      "StudyLocation",
                      "worklocationAddress.country",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>
            </Row>
          </div>

          <div className="mt-4 config-tbl-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h6 className="m-0 text-primary">Existing Study Locations</h6>
              <MyInput
                placeholder="Search study locations..."
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
                value={searchTermStudyLocation}
                onChange={handleStudyLocationSearchChange}
                onClear={clearStudyLocationSearch}
                allowClear
              />
            </div>
            <Table
              pagination={true}
              columns={columnStudyLocations}
              dataSource={filteredStudyLocations}
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
        title="Venue"
        open={drawerOpen?.Venue}
        isLoading={lookupDetailLoading && editingLookupDrawer === "Venue"}
        isPagination={true}
        onClose={() => openCloseDrawerFtn("Venue")}
        add={() => {
          if (!validateForm("Venue")) return;
          insertDataFtn(
            `/lookup`,
            getLookupDrawerPayload("Venue"),
            "Data inserted successfully:",
            "Data did not insert:",
            () => {
              resetCounteries("Venue", () => dispatch(getAllLookups()));
            },
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Venue}
        update={async () => {
          if (!validateForm("Venue")) return;
          await updateFtn(
            "/lookup",
            getLookupDrawerPayload("Venue"),
            () => resetCounteries("Venue", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Venue", false);
        }}
      >
        <div className="drawer-main-cntainer p-4 me-2 ms-2">
          <div className="mb-4 pb-4">
            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Code"
                  name="code"
                  value={drawerIpnuts?.Venue?.code}
                  onChange={(val) =>
                    drawrInptChng("Venue", "code", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.Venue?.code}
                  errorMessage={errors?.Venue?.code}
                  required
                />
              </Col>
              <Col span={12}>
                <MyInput
                  label="Venue Name"
                  name="lookupname"
                  value={drawerIpnuts?.Venue?.lookupname}
                  onChange={(val) =>
                    drawrInptChng("Venue", "lookupname", val.target.value)
                  }
                  disabled={isDisable}
                  hasError={!!errors?.Venue?.lookupname}
                  errorMessage={errors?.Venue?.lookupname}
                  required
                />
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={12}>
                <MyInput
                  label="Display Name"
                  name="DisplayName"
                  value={drawerIpnuts?.Venue?.DisplayName}
                  onChange={(val) =>
                    drawrInptChng("Venue", "DisplayName", val.target.value)
                  }
                  disabled={isDisable}
                />
              </Col>
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={drawerIpnuts?.Venue?.isactive}
                  onChange={(e) =>
                    drawrInptChng("Venue", "isactive", e.target.checked)
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

              <Col span={24}>
                {isMapsLoaded && (
                  <StandaloneSearchBox
                    onLoad={(ref) => (venueAddressInputRef.current = ref)}
                    onPlacesChanged={handleVenuePlacesChanged}
                  >
                    <MyInput
                      label="Search by Address or Eircode"
                      name="venueAddressSearch"
                      placeholder="Enter Eircode (e.g., D01X4X0) or address"
                      disabled={isDisable}
                      value={venueAddressSearchValue}
                      onChange={(e) =>
                        setVenueAddressSearchValue(e.target.value)
                      }
                    />
                  </StandaloneSearchBox>
                )}
              </Col>

              <Col xs={24} md={12}>
                <MyInput
                  label="Address Line 1 (Building or House)"
                  name="buildingOrHouse"
                  value={
                    drawerIpnuts?.Venue?.venueAddress?.buildingOrHouse
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "Venue",
                      "venueAddress.buildingOrHouse",
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
                  value={drawerIpnuts?.Venue?.venueAddress?.streetOrRoad}
                  onChange={(val) =>
                    drawrInptChng(
                      "Venue",
                      "venueAddress.streetOrRoad",
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
                  value={drawerIpnuts?.Venue?.venueAddress?.areaOrTown}
                  onChange={(val) =>
                    drawrInptChng(
                      "Venue",
                      "venueAddress.areaOrTown",
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
                    drawerIpnuts?.Venue?.venueAddress?.countyCityOrPostCode
                  }
                  onChange={(val) =>
                    drawrInptChng(
                      "Venue",
                      "venueAddress.countyCityOrPostCode",
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
                  value={drawerIpnuts?.Venue?.venueAddress?.eircode}
                  onChange={(val) =>
                    drawrInptChng(
                      "Venue",
                      "venueAddress.eircode",
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
                  value={drawerIpnuts?.Venue?.venueAddress?.country}
                  options={countriesOptions}
                  onChange={(val) =>
                    drawrInptChng(
                      "Venue",
                      "venueAddress.country",
                      val.target.value,
                    )
                  }
                  disabled={isDisable}
                />
              </Col>
            </Row>
          </div>

          <div className="mt-4 config-tbl-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <h6 className="m-0 text-primary">Existing Venues</h6>
              <MyInput
                placeholder="Search venues..."
                style={{ width: 250 }}
                prefix={<SearchOutlined />}
                value={searchTermVenue}
                onChange={handleVenueSearchChange}
                onClear={clearVenueSearch}
                allowClear
              />
            </div>
            <Table
              pagination={true}
              columns={columnVenues}
              dataSource={filteredVenues}
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
            `/regiontype`,
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
            getLookupDrawerPayload("Lookup"),
            "Data inserted successfully",
            "Data did not insert",
            () =>
              resetLookupDrawerForNextEntry(() => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
        }}
        isEdit={isUpdateRec?.Lookup}
        update={async () => {
          await updateFtn("/lookup", getLookupDrawerPayload("Lookup"), () =>
            resetCounteries("Lookup", () => dispatch(getAllLookups())),
          );
          dispatch(getAllLookups());
          IsUpdateFtn("Lookup", false);
        }}
      >
        <div className="drawer-main-container p-4">
          <Row gutter={24}>
            <Col span={24}>
              <CustomSelect
                label="Lookup Type"
                disabled={isDisable}
                name="lookuptype"
                isIDs={true}
                value={drawerIpnuts?.Lookup?.lookuptypeId || ""}
                options={lookupsTypesSelect}
                isSimple={true}
                required
                onChange={(value) => {
                  const nextTypeId = String(value.target.value);
                  const isWorkLoc = isWorkLocationLookupType(
                    nextTypeId,
                    lookupsTypes,
                  );
                  setdrawerIpnuts((prev) => ({
                    ...prev,
                    Lookup: {
                      ...(prev.Lookup || {}),
                      lookuptypeId: nextTypeId,
                      Parentlookupid: null,
                      Parentlookup: "",
                      ...(isWorkLoc ? {} : { processSalaryDeduction: false }),
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
                disabled={isDisable}
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
                disabled={isDisable}
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
                disabled={isDisable}
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
              disabled={isDisable}
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
                disabled={isDisable}
                onChange={(e) =>
                  drawrInptChng("Lookup", "isactive", e.target.checked)
                }
                checked={drawerIpnuts?.Lookup?.isactive}
                style={{ marginTop: "0px" }}
              >
                Active
              </Checkbox>
            </Col>
            {isWorkLocationLookupType(
              drawerIpnuts?.Lookup?.lookuptypeId,
              lookupsTypes,
            ) ? (
              <Col span={12}>
                <Checkbox
                  disabled={isDisable}
                  checked={!!drawerIpnuts?.Lookup?.processSalaryDeduction}
                  onChange={(e) =>
                    drawrInptChng(
                      "Lookup",
                      "processSalaryDeduction",
                      e.target.checked,
                    )
                  }
                  style={{ marginTop: "0px" }}
                >
                  Process Salary Deduction
                </Checkbox>
              </Col>
            ) : null}
          </Row>
        </div>

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
      <LookupRecordDrawer
        open={drawerOpen?.StandardLookup}
        lookupType={activeStandardLookupType}
        formValues={drawerIpnuts?.StandardLookup}
        lookups={lookups}
        lookupsTypes={lookupsTypes}
        tableData={standardLookupTableData}
        tableLoading={lookupsloading}
        isLoading={
          lookupDetailLoading && editingLookupDrawer === "StandardLookup"
        }
        isEdit={isUpdateRec?.StandardLookup}
        disabled={isDisable}
        errors={errors?.StandardLookup || {}}
        selectionType={selectionType}
        rowSelection={rowSelection}
        onClose={() => {
          setActiveStandardLookupType(null);
          openCloseDrawerFtn("StandardLookup");
          IsUpdateFtn("StandardLookup", false);
        }}
        onAdd={async () => {
          if (!validateForm("StandardLookup")) return;
          await insertDataFtn(
            `/lookup`,
            getLookupDrawerPayload("StandardLookup"),
            "Data inserted successfully",
            "Data did not insert",
            () => resetCounteries("StandardLookup"),
          );
          await dispatch(getAllLookups());
        }}
        onUpdate={async () => {
          if (!validateForm("StandardLookup")) return;
          await updateFtn(
            "/lookup",
            getLookupDrawerPayload("StandardLookup"),
            () => resetCounteries("StandardLookup"),
          );
          await dispatch(getAllLookups());
          IsUpdateFtn("StandardLookup", false);
        }}
        onFieldChange={(field, value) =>
          drawrInptChng("StandardLookup", field, value)
        }
        onParentChange={(payload) =>
          handleParentLookupChange("StandardLookup", payload)
        }
        onEditRecord={(record) =>
          loadLookupForEdit("StandardLookup", record)
        }
        onDeleteRecord={async (record) => {
          await deleteFtn("/lookup/", { id: record?._id });
          await dispatch(getAllLookups());
        }}
      />
      <MyDrawer
        title="Bookmarks"
        open={drawerOpen?.Bookmarks}
        isPagination={false}
        onClose={() => {
          openCloseDrawerFtn("Bookmarks");
          IsUpdateFtn("Bookmarks", false);
        }}
        update={async () => {
          if (!validateForm("Bookmarks")) return;
          const bookmarkId =
            drawerIpnuts?.Bookmarks?._id || drawerIpnuts?.Bookmarks?.id;
          if (!bookmarkId) {
            MyAlert("error", "Update failed", "Bookmark ID is missing");
            return;
          }
          const { _id, id, ...bookmarkData } = drawerIpnuts?.Bookmarks || {};
          await updateFtn(
            `/bookmarks/fields/${bookmarkId}`,
            bookmarkData,
            () => {
              resetCounteries("Bookmarks");
              dispatch(resetBookmarks());
              dispatch(getBookmarks());
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
              resetCounteries("Bookmarks");
              dispatch(resetBookmarks());
              dispatch(getBookmarks());
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
                placeholder="Enter data path (e.g., profile.personalInfo.forename, system.currentUtcDate:dd MMM yyyy, profile.contactInfo.fullAddress:lines)"
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
                isIDs={true}
                options={[
                  { label: "String", value: "string" },
                  { label: "Number", value: "number" },
                  { label: "Date", value: "date" },
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0 text-primary">Existing Bookmarks</h6>
              <Button
                type="default"
                size="small"
                icon={<LuRefreshCw />}
                loading={bookmarksLoading}
                onClick={refreshBookmarks}
              >
                Refresh
              </Button>
            </div>
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







      {/* Claim Type Drawer */}

      {/* Schemes Drawer */}

      {/* Reasons Drawer */}

      {/* */}






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


    </div>
    // </div>
  );
};

export default Configuration;
