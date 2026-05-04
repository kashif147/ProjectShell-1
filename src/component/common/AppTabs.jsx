import {
  useState,
  Suspense,
  lazy,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { getProfileDetailsById } from "../../features/profiles/ProfileDetailsSlice";
import {
  getSubscriptionByProfileId,
  getSubscriptionById,
  getSubscriptionHistoryByProfileId,
  pickPrimarySubscription,
  profileDetailActiveSubscriptionArgs,
} from "../../features/subscription/profileSubscriptionSlice";
import { getApplicationById } from "../../features/ApplicationDetailsSlice";
import { buildApplicationMgtSearch } from "../../utils/applicationMgtRoute";
import { getProfileApplications } from "../../features/profiles/profileApplicationsSlice";
import { Tabs, Spin, Drawer, Button, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import MyTable from "./MyTable";
import {
  FaFolder,
  FaProjectDiagram,
  FaBook,
  FaHistory,
  FaEdit,
  FaClone,
  FaUserSlash,
  FaBan,
  FaUndo,
  FaExchangeAlt,
  FaTags,
  FaRegClock,
  FaIdCard,
  FaCalendarAlt,
  FaBalanceScale,
} from "react-icons/fa";
import { useTableColumns } from "../../context/TableColumnsContext ";
import TransferRequests from "../TransferRequests";
import CategoryChangeRequest from "../details/ChangeCategoryDrawer";
import Reminder from "../profile/Reminder";
import { formatDateOnly } from "../../utils/Utilities";
import { FinanceTabToolbarContext } from "../../context/FinanceTabToolbarContext";
import { MembershipTabToolbarContext } from "../../context/MembershipTabToolbarContext";

const { TabPane } = Tabs;

const MyDeatails = lazy(() => import("../profile/MembershipForm"));
const CasesById = lazy(() => import("../../pages/Cases/CasesById"));
const ClaimsById = lazy(() => import("../../pages/Claims/ClaimsById"));
const FinanceByID = lazy(() => import("../finanace/FinanceByID"));
const DoucmentsById = lazy(() => import("../corespondence/DoucmentsById"));
const CommunicationHistory = lazy(
  () => import("../corespondence/CommunicationHistory"),
);
const ThreeDotsMenu = lazy(() => import("../common/ThreeDotsMenu"));
const Roster = lazy(() => import("../../pages/roster/RosterDetails"));
const HistoryByID = lazy(() => import("../../pages/HistoryByID"));
const ProfileHeader = lazy(() => import("../common/ProfileHeader"));
const DuplicateMembers = lazy(() => import("../profile/DuplicateMembers"));

/** Events ("16") and Claims ("7") are overflow-only, not shown on first load. */
const staticTabKeys = ["1", "2", "4", "5", "6", "3"];

/** Primary subscription row banner copy on profile detail (CRM). Keys match subscriptionStatus from API. */
const MEMBERSHIP_STATUS_DETAIL_BANNERS = {
  Resigned:
    "Member has resigned. This profile is read-only, and the subscription has been cancelled.",
  Lapsed: "This membership has lapsed. Please renew to restore active status.",
  Cancelled: "This membership has been cancelled due to non-payment.",
  Suspended:
    "This membership is currently suspended. Please reinstate to restore active status.",
  Archived:
    "This membership has been archived. Please reinstate to restore active status.",
};

/** Strong brown for subscription banner copy (readable on light red / amber / gray fills). */
const SUBSCRIPTION_BANNER_TEXT_BROWN = "#4a3228";

const SUBSCRIPTION_BANNER_THEME_DEFAULT = {
  backgroundColor: "#fff1f0",
  borderColor: "#ffa39e",
  color: SUBSCRIPTION_BANNER_TEXT_BROWN,
};

/** Distinct banner chrome for non-payment / resign vs lapsed vs suspended vs archived. */
const SUBSCRIPTION_BANNER_THEME_BY_STATUS = {
  Lapsed: {
    backgroundColor: "#E6F0FF",
    borderColor: "#F59E0B",
    color: "#1B3A8A",
    icon: <FaRegClock />,
    iconColor: "#1B3A8A",
  },
  Suspended: {
    backgroundColor: "#FFF4E5",
    borderColor: "#F59E0B",
    color: "#92400E",
    icon: <FaRegClock />,
    iconColor: "#F59E0B",
  },
  Archived: {
    backgroundColor: "#F3F4F6",
    borderColor: "#9CA3AF",
    color: "#374151",
    icon: <FaRegClock />,
    iconColor: "#6B7280",
  },
};

const PAYMENT_REMINDER_BANNER_THEME = {
  backgroundColor: "#fffbe6",
  borderColor: "#ffe58f",
  color: SUBSCRIPTION_BANNER_TEXT_BROWN,
};

const REMINDER_HISTORY_TIER_RANK = { R3: 3, R2: 2, R1: 1 };

function coerceSubscriptionDate(value) {
  if (value == null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Banner for arrears reminder pipeline — CRM profile summary only when subscriptionStatus is Active. */
function buildPaymentReminderBanner(subscription) {
  if (!subscription || typeof subscription !== "object") return null;

  if (String(subscription.subscriptionStatus || "").trim() !== "Active") {
    return null;
  }

  const rem = subscription.reminders;
  if (rem && typeof rem === "object" && !Array.isArray(rem) && rem.clearedAt) {
    return null;
  }

  let tierKey = null;
  let dateObj = null;

  if (rem && typeof rem === "object" && !Array.isArray(rem)) {
    const r3 = coerceSubscriptionDate(rem.reminder3At);
    const r2 = coerceSubscriptionDate(rem.reminder2At);
    const r1 = coerceSubscriptionDate(rem.reminder1At);
    if (r3) {
      tierKey = "final";
      dateObj = r3;
    } else if (r2) {
      tierKey = "second";
      dateObj = r2;
    } else if (r1) {
      tierKey = "first";
      dateObj = r1;
    }
  }

  if (
    !tierKey &&
    Array.isArray(subscription.reminderHistory) &&
    subscription.reminderHistory.length > 0
  ) {
    let best = null;
    for (const h of subscription.reminderHistory) {
      const rank = REMINDER_HISTORY_TIER_RANK[h?.type];
      if (!rank) continue;
      const d = coerceSubscriptionDate(h.reminderDate);
      if (!d) continue;
      if (!best || rank > best.rank) {
        best = {
          rank,
          date: d,
          tierKey:
            rank === 3 ? "final" : rank === 2 ? "second" : "first",
        };
      } else if (rank === best.rank && d > best.date) {
        best = { ...best, date: d };
      }
    }
    if (best) {
      tierKey = best.tierKey;
      dateObj = best.date;
    }
  }

  if (!tierKey || !dateObj) return null;

  const reminderDateStr = formatDateOnly(dateObj);
  if (!reminderDateStr) return null;

  const templates = {
    first:
      "The member is falling behind on payments. The first reminder was issued on {ReminderDate}.",
    second:
      "The member is falling behind on payments. The second reminder was issued on {ReminderDate}.",
    final:
      "The member is falling behind on payments. The final reminder was issued on {ReminderDate}.",
  };

  return {
    message: templates[tierKey].replace("{ReminderDate}", reminderDateStr),
  };
}

const MEMBERSHIP_MORE_ICON = {
  edit: "#1890ff",
  duplicate: "#722ed1",
  activate: "#52c41a",
  activateMuted: "rgba(82, 196, 26, 0.45)",
  cancel: "#ff4d4f",
  deceased: "#fa8c16",
};

function membershipMoreIcon(Icon, color) {
  return <Icon style={{ color, fontSize: 14 }} aria-hidden />;
}

const profileMoreActionsButtonStyle = {
  backgroundColor: "#45669d",
  borderColor: "#45669d",
  color: "#fff",
};

const initialMembershipHeaderActionsMeta = {
  showCancelMembership: false,
  showActivateMembership: false,
  activateMembershipDisabled: false,
  activateMembershipTitle: undefined,
};

function AppTabs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const profileIdParam = normalizeRouteId(searchParams.get("profileId"));
  const subscriptionIdParam = normalizeRouteId(
    searchParams.get("subscriptionId"),
  );
  const activeTabParam = String(searchParams.get("activeTab") || "")
    .trim()
    .toLowerCase();

  const refreshDetailsData = useCallback(() => {
    if (!profileIdParam) return;
    dispatch(getProfileDetailsById(profileIdParam));
    if (subscriptionIdParam) {
      dispatch(getSubscriptionById(subscriptionIdParam));
    } else {
      dispatch(
        getSubscriptionByProfileId({
          profileId: profileIdParam,
          ...profileDetailActiveSubscriptionArgs,
        }),
      );
    }
  }, [dispatch, profileIdParam, subscriptionIdParam]);

  useEffect(() => {
    refreshDetailsData();
  }, [refreshDetailsData]);

  useEffect(() => {
    const handler = () => refreshDetailsData();
    window.addEventListener("projectshell:details-refresh", handler);
    return () =>
      window.removeEventListener("projectshell:details-refresh", handler);
  }, [refreshDetailsData]);

  const { profileDetails } = useSelector((state) => state.profileDetails || {});
  const { ProfileSubData } = useSelector(
    (state) => state.profileSubscription || {},
  );
  const currentSubscriptionStatus =
    pickPrimarySubscription(ProfileSubData?.data || [])?.subscriptionStatus ||
    "";
  const normalizedPrimarySubscriptionStatus = String(
    currentSubscriptionStatus,
  ).trim();
  const subscriptionStatusBannerMessage =
    MEMBERSHIP_STATUS_DETAIL_BANNERS[normalizedPrimarySubscriptionStatus] ??
    null;
  const showSubscriptionStatusBanner = Boolean(subscriptionStatusBannerMessage);
  const subscriptionBannerTheme =
    SUBSCRIPTION_BANNER_THEME_BY_STATUS[normalizedPrimarySubscriptionStatus] ??
    SUBSCRIPTION_BANNER_THEME_DEFAULT;

  const primarySubscriptionRow = useMemo(
    () => pickPrimarySubscription(ProfileSubData?.data || []),
    [ProfileSubData],
  );

  const paymentReminderBanner = useMemo(
    () => buildPaymentReminderBanner(primarySubscriptionRow),
    [primarySubscriptionRow],
  );

  const showPaymentReminderBanner = Boolean(paymentReminderBanner?.message);

  const [activeKey, setActiveKey] = useState("1");
  const [visibleTabs, setVisibleTabs] = useState(staticTabKeys);
  const [TransferDrawer, setTransferDrawer] = useState(false);
  const [isReminder, setIsReminder] = useState(false);
  const [isDrawerOpen, setisDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeceased, setIsDeceased] = useState(false);

  const profileIdForDeceased = profileDetails?._id || profileDetails?.id || "";
  useEffect(() => {
    if (!profileIdForDeceased) {
      setIsDeceased(false);
      return;
    }
    const pi = profileDetails?.personalInfo || {};
    const fromApi = Boolean(pi.deceased) || Boolean(pi.deceasedDate);
    setIsDeceased(fromApi);
  }, [
    profileIdForDeceased,
    profileDetails?.personalInfo?.deceased,
    profileDetails?.personalInfo?.deceasedDate,
  ]);

  const [isDuplicateDrawerOpen, setIsDuplicateDrawerOpen] = useState(false);
  const [isApplicationDrawerOpen, setIsApplicationDrawerOpen] = useState(false);
  const [isSubscriptionDrawerOpen, setIsSubscriptionDrawerOpen] =
    useState(false);

  const profileHeaderRef = useRef(null);
  const [membershipHeaderActionsMeta, setMembershipHeaderActionsMeta] =
    useState(initialMembershipHeaderActionsMeta);
  const onMembershipHeaderActionsMetaChange = useCallback((meta) => {
    setMembershipHeaderActionsMeta(meta);
  }, []);

  const [financeTabBarExtra, setFinanceTabBarExtra] = useState(null);
  useEffect(() => {
    if (activeKey !== "2") setFinanceTabBarExtra(null);
  }, [activeKey]);

  const financeToolbarApi = useMemo(
    () => ({ setFinanceTabBarExtra: setFinanceTabBarExtra }),
    [],
  );

  const [membershipTabBarExtra, setMembershipTabBarExtra] = useState(null);
  useEffect(() => {
    if (activeKey !== "1") setMembershipTabBarExtra(null);
  }, [activeKey]);

  const membershipToolbarApi = useMemo(
    () => ({ setMembershipTabBarExtra }),
    [],
  );

  const { columns } = useTableColumns();
  const userApplications = useSelector(
    (state) => state.userApplications?.applications || [],
  );
  const { ProfileSubHistory, ProfileSubHistoryLoading } = useSelector(
    (state) => state.profileSubscription || {},
  );
  const { profileApplications, loading: profileApplicationsLoading } =
    useSelector((state) => state.profileApplications || {});

  useEffect(() => {
    if (activeKey === "3" && profileDetails?._id) {
      dispatch(getProfileApplications({ profileId: profileDetails._id }));
    }
  }, [activeKey, profileDetails?._id, dispatch]);

  useEffect(() => {
    const requestedTab = String(location.state?.activeTab || "")
      .trim()
      .toLowerCase();
    const resolvedTab = requestedTab || activeTabParam;
    if (resolvedTab === "2" || resolvedTab === "finance") {
      setActiveKey("2");
    }
  }, [location.state, activeTabParam]);

  const applicationColumns =
    columns?.Applications?.map((col) => {
      // Correctly check if it's the Membership Category column
      const isCategoryColumn = Array.isArray(col.dataIndex)
        ? col.dataIndex.includes("membershipCategory")
        : col.dataIndex === "membershipCategory";

      if (isCategoryColumn) {
        return {
          ...col,
          render: (text, record) => (
            <a
              style={{ color: "#1890ff", fontWeight: "500" }}
              onClick={() => {
                const appId = record._id || record.id;
                dispatch(getApplicationById({ id: appId }));
                navigate({
                  pathname: "/applicationMgt",
                  search: buildApplicationMgtSearch({
                    applicationId: appId,
                    edit: true,
                  }),
                });
                setIsApplicationDrawerOpen(false);
              }}
            >
              {text || "View Application"}
            </a>
          ),
        };
      }
      return col;
    }) || [];

  const subscriptionHistoryColumns = [
    {
      title: "Category",
      dataIndex: "membershipCategory",
      key: "membershipCategory",
    },
    {
      title: "Status",
      dataIndex: "subscriptionStatus",
      key: "subscriptionStatus",
    },
    { title: "Year", dataIndex: "subscriptionYear", key: "subscriptionYear" },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => formatDateOnly(date),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => formatDateOnly(date),
    },
    {
      title: "Frequency",
      dataIndex: "paymentFrequency",
      key: "paymentFrequency",
    },
    {
      title: "Movement",
      dataIndex: "membershipMovement",
      key: "membershipMovement",
    },
  ];

  const profileApplicationColumns = [
    {
      title: "Category",
      dataIndex: "membershipCategory",
      key: "membershipCategory",
      render: (text, record) => (
        <a
          style={{ color: "#1890ff", fontWeight: "500" }}
          onClick={() => {
            dispatch(getApplicationById({ id: record.applicationId }));
            navigate({
              pathname: "/applicationMgt",
              search: buildApplicationMgtSearch({
                applicationId: record.applicationId,
                edit: true,
              }),
            });
            setIsApplicationDrawerOpen(false);
          }}
        >
          {text || "View Application"}
        </a>
      ),
    },
    {
      title: "Submission Date",
      dataIndex: "submissionDate",
      key: "submissionDate",
      render: (date) => formatDateOnly(date),
    },
    {
      title: "Approval Date",
      dataIndex: "approvalDate",
      key: "approvalDate",
      render: (date) => formatDateOnly(date),
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (date) => formatDateOnly(date),
    },
    { title: "Approved By", dataIndex: "approvedBy", key: "approvedBy" },
    {
      title: "Status",
      dataIndex: "applicationStatus",
      key: "applicationStatus",
    },
  ];

  const allItems = [
    {
      key: "1",
      label: "Membership",
      children: (
        <MyDeatails
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          isDeceased={isDeceased}
          setIsDeceased={setIsDeceased}
        />
      ),
    },
    // { key: "15", label: "Duplicate Members", children: <DuplicateMembers /> },
    { key: "2", label: "Finance", children: <FinanceByID /> },
    { key: "4", label: "Documents", children: <DoucmentsById /> },
    {
      key: "5",
      label: "Correspondence",
      children: <CommunicationHistory />,
    },
    { key: "6", label: "Cases", children: <CasesById /> },
    {
      key: "3",
      label: "Applications",
      children: (
        <div style={{ padding: 20 }}>
          <MyTable
            columns={profileApplicationColumns}
            dataSource={profileApplications}
            loading={profileApplicationsLoading}
            selection={false}
          />
        </div>
      ),
    },
    {
      key: "16",
      label: "Events",
      children: <div>Events</div>,
    },
    { key: "7", label: "Claims", children: <ClaimsById /> },
    { key: "8", label: "Roster", children: <Roster /> },
    { key: "11", label: "Audit History", children: <HistoryByID /> },
    { key: "9", label: "Projects", children: <div>Projects</div> },
    {
      key: "10",
      label: "Trainings (CPD)",
      children: <div>Trainings (CPD)</div>,
    },
  ];

  const handleMenuClick = (key) => {
    const isStatic = staticTabKeys.includes(activeKey);

    setVisibleTabs((prev) => {
      const newTabs = [...prev];

      // Remove existing dynamic (non-static) tabs
      const updatedTabs = newTabs.filter((tabKey) =>
        staticTabKeys.includes(tabKey),
      );

      // Add new tab if it's not already in the list
      if (!updatedTabs.includes(key)) {
        updatedTabs.push(key);
      }

      return updatedTabs;
    });

    setActiveKey(key);
  };
  const handleTabChange = (key) => {
    const isStatic = staticTabKeys.includes(key);

    if (isStatic) {
      // Remove all dynamic tabs
      setVisibleTabs((prev) =>
        prev.filter((tabKey) => staticTabKeys.includes(tabKey)),
      );
    }

    setActiveKey(key);
  };
  const filteredItems = allItems.filter((item) =>
    visibleTabs.includes(item.key),
  );
  /** Alphabetical by label (profile tab overflow ⋮ menu). */
  const Menuitems = [
    {
      key: "11",
      label: "Audit History",
      icon: <FaHistory />,
      iconColor: "#722ed1",
      onClick: () => handleMenuClick("11"),
    },
    {
      key: "13",
      label: "Category Changes",
      icon: <FaTags />,
      iconColor: "#2f54eb",
      onClick: () => setisDrawerOpen(true),
    },
    {
      key: "7",
      label: "Claims",
      icon: <FaBalanceScale />,
      iconColor: "#fa541c",
      onClick: () => handleMenuClick("7"),
    },
    {
      key: "16",
      label: "Events",
      icon: <FaCalendarAlt />,
      iconColor: "#13c2c2",
      onClick: () => handleMenuClick("16"),
    },
    {
      key: "9",
      label: "Projects",
      icon: <FaProjectDiagram />,
      iconColor: "#1890ff",
      onClick: () => handleMenuClick("9"),
    },
    {
      key: "14",
      label: "Reminders",
      icon: <FaRegClock />,
      iconColor: "#faad14",
      onClick: () => setIsReminder(true),
    },
    {
      key: "8",
      label: "Roster",
      icon: <FaFolder />,
      iconColor: "#13c2c2",
      onClick: () => handleMenuClick("8"),
    },
    {
      key: "subscriptionhistory",
      label: "Subscription History",
      icon: <FaIdCard />,
      iconColor: "#597ef7",
      onClick: () => {
        if (profileDetails?._id) {
          dispatch(
            getSubscriptionHistoryByProfileId({
              profileId: profileDetails._id,
            }),
          );
        }
        setIsSubscriptionDrawerOpen(true);
      },
    },
    {
      key: "10",
      label: "Trainings (CPD)",
      icon: <FaBook />,
      iconColor: "#eb2f96",
      onClick: () => handleMenuClick("10"),
    },
    {
      key: "12",
      label: "Transfer Requests",
      icon: <FaExchangeAlt />,
      iconColor: "#fa8c16",
      onClick: () => setTransferDrawer(true),
    },
  ];

  /** Ant Design menu items for the tab bar "More actions" button — extend per `activeKey` as needed. */
  const profileTabMoreActionMenuItems = useMemo(() => {
    switch (String(activeKey)) {
      case "1": {
        const items = [
          {
            key: "membership-edit",
            label: isEditMode ? "Cancel Edit" : "Edit Profile",
            icon: membershipMoreIcon(FaEdit, MEMBERSHIP_MORE_ICON.edit),
            onClick: () => setIsEditMode((v) => !v),
          },
          {
            key: "membership-duplicate",
            label: "Check Duplicate",
            icon: membershipMoreIcon(FaClone, MEMBERSHIP_MORE_ICON.duplicate),
            onClick: () => setIsDuplicateDrawerOpen(true),
          },
        ];
        if (membershipHeaderActionsMeta.showActivateMembership) {
          items.push({
            key: "membership-activate",
            label: "Activate Membership",
            icon: membershipMoreIcon(
              FaUndo,
              membershipHeaderActionsMeta.activateMembershipDisabled
                ? MEMBERSHIP_MORE_ICON.activateMuted
                : MEMBERSHIP_MORE_ICON.activate,
            ),
            disabled: membershipHeaderActionsMeta.activateMembershipDisabled,
            title: membershipHeaderActionsMeta.activateMembershipTitle,
            onClick: () =>
              profileHeaderRef.current?.openActivateMembershipModal?.(),
          });
        }
        if (membershipHeaderActionsMeta.showCancelMembership) {
          items.push({
            key: "membership-cancel",
            label: "Cancel Membership",
            icon: membershipMoreIcon(FaBan, MEMBERSHIP_MORE_ICON.cancel),
            danger: true,
            onClick: () =>
              profileHeaderRef.current?.openCancelMembershipModal?.(),
          });
        }
        items.push(
          { type: "divider", key: "membership-divider-deceased" },
          {
            key: "membership-deceased",
            label: isDeceased ? "Unmark as Deceased" : "Mark as Deceased",
            icon: membershipMoreIcon(
              FaUserSlash,
              MEMBERSHIP_MORE_ICON.deceased,
            ),
            onClick: () => setIsDeceased((v) => !v),
          },
        );
        return items;
      }
      default:
        return [];
    }
  }, [activeKey, isEditMode, isDeceased, membershipHeaderActionsMeta]);

  const historyData = [
    {
      key: "1",
      oldCategory: "general",
      newCategory: "postgraduate_student",
      effectiveDate: "01/12/2023",
      reason: "Member enrolled in postgraduate program",
      remarks: "Approved by admin after verification",
      insertedAtSystem: "01/12/2023 09:00 AM",
      insertedBySystem: "System",
      insertedAtAdmin: "01/12/2023 10:30 AM",
      insertedByAdmin: "Admin User",
    },
    {
      key: "2",
      oldCategory: "postgraduate_student",
      newCategory: "affiliate_non_practicing",
      effectiveDate: "15/03/2024",
      reason: "Requested due to career break",
      remarks: "Confirmed with HR letter",
      insertedAtSystem: "15/03/2024 08:45 AM",
      insertedBySystem: "System",
      insertedAtAdmin: "16/03/2024 09:15 AM",
      insertedByAdmin: "Membership Officer",
    },
    {
      key: "3",
      oldCategory: "affiliate_non_practicing",
      newCategory: "retired_associate",
      effectiveDate: "01/08/2024",
      reason: "Retirement request submitted",
      remarks: "Final approval granted",
      insertedAtSystem: "01/08/2024 12:00 PM",
      insertedBySystem: "System",
      insertedAtAdmin: "02/08/2024 01:00 PM",
      insertedByAdmin: "Super Admin",
    },
  ];

  const columnHistory = [
    { title: "Old Category", dataIndex: "oldCategory", key: "oldCategory" },
    { title: "New Category", dataIndex: "newCategory", key: "newCategory" },
    {
      title: "Effective Date",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
    },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    { title: "Remarks", dataIndex: "remarks", key: "remarks" },
    {
      title: "Inserted At",
      dataIndex: "insertedAtSystem",
      key: "insertedAtSystem",
    },
    {
      title: "Inserted By",
      dataIndex: "insertedBySystem",
      key: "insertedBySystem",
    },
    {
      title: "Inserted At",
      dataIndex: "insertedAtAdmin",
      key: "insertedAtAdmin",
    },
    {
      title: "Inserted By",
      dataIndex: "insertedByAdmin",
      key: "insertedByAdmin",
    },
  ];

  return (
    <div
      className="d-flex"
      style={{
        flex: "1 1 0%",
        minHeight: 0,
        minWidth: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ProfileHeader
        ref={profileHeaderRef}
        showButtons={activeKey === "1"}
        isDeceased={isDeceased}
        onMembershipHeaderActionsMetaChange={
          onMembershipHeaderActionsMetaChange
        }
      />
      <MembershipTabToolbarContext.Provider value={membershipToolbarApi}>
        <FinanceTabToolbarContext.Provider value={financeToolbarApi}>
          <div
            style={{
              flex: "1 1 0%",
              minWidth: 0,
              minHeight: 0,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {showSubscriptionStatusBanner && (
              <div
                style={{
                  flexShrink: 0,
                  backgroundColor: subscriptionBannerTheme.backgroundColor,
                  border: `1px solid ${subscriptionBannerTheme.borderColor}`,
                  borderRadius: "4px",
                  padding: "12px 16px",
                  marginBottom: "8px",
                  marginInline: "0 8px",
                  marginTop: "4px",
                  color: subscriptionBannerTheme.color,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                ⚠️ {subscriptionStatusBannerMessage}
              </div>
            )}
            {showPaymentReminderBanner && (
              <div
                style={{
                  flexShrink: 0,
                  backgroundColor: PAYMENT_REMINDER_BANNER_THEME.backgroundColor,
                  border: `1px solid ${PAYMENT_REMINDER_BANNER_THEME.borderColor}`,
                  borderRadius: "4px",
                  padding: "12px 16px",
                  marginBottom: "8px",
                  marginInline: "0 8px",
                  marginTop: showSubscriptionStatusBanner ? 0 : "4px",
                  color: PAYMENT_REMINDER_BANNER_THEME.color,
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                ⚠️ {paymentReminderBanner.message}
              </div>
            )}
            {isDeceased && (
              <div
                style={{
                  flexShrink: 0,
                  backgroundColor: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: "4px",
                  padding: "12px 16px",
                  marginBottom: "8px",
                  marginInline: "0 8px",
                  marginTop:
                    showSubscriptionStatusBanner || showPaymentReminderBanner
                      ? 0
                      : "4px",
                  color: "#ad6800",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                ⚠️ Member is marked as deceased. Profile is read-only and
                subscription has been cancelled.
              </div>
            )}
            <Tabs
              className="profile-details-tabs"
              activeKey={activeKey}
              onChange={handleTabChange}
              destroyInactiveTabPane
              tabBarExtraContent={{
                right: (
                  <div
                    className="d-flex align-items-center gap-2 flex-wrap"
                    style={{ marginInlineEnd: 8 }}
                  >
                    {activeKey === "1" ? membershipTabBarExtra : null}
                    {activeKey === "2" ? financeTabBarExtra : null}
                    {activeKey !== "2" &&
                      (profileTabMoreActionMenuItems.length > 0 ? (
                        <Dropdown
                          menu={{ items: profileTabMoreActionMenuItems }}
                          trigger={["click"]}
                        >
                          <Button
                            type="default"
                            style={profileMoreActionsButtonStyle}
                            icon={<MoreOutlined />}
                            aria-label="More actions"
                          />
                        </Dropdown>
                      ) : (
                        <Button
                          type="default"
                          style={{
                            ...profileMoreActionsButtonStyle,
                            opacity: 0.45,
                          }}
                          icon={<MoreOutlined />}
                          aria-label="More actions"
                          disabled
                        />
                      ))}
                  </div>
                ),
              }}
              style={{
                flex: "1 1 0%",
                minWidth: 0,
                minHeight: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {filteredItems.map((item) => (
                <TabPane tab={item.label} key={item.key}>
                  <Suspense fallback={<Spin />}>{item.children}</Suspense>
                </TabPane>
              ))}
              <TabPane
                key="menu"
                tab={
                  <div style={{ marginLeft: 8 }}>
                    <Suspense fallback={<Spin size="small" />}>
                      <ThreeDotsMenu items={Menuitems} />
                    </Suspense>
                  </div>
                }
                disabled
              />
            </Tabs>
          </div>
        </FinanceTabToolbarContext.Provider>
      </MembershipTabToolbarContext.Provider>
      <TransferRequests
        open={TransferDrawer}
        onClose={() => setTransferDrawer(false)}
        isSearch={false}
        isChangeCat={false}
      />
      <CategoryChangeRequest
        open={isDrawerOpen}
        onClose={() => setisDrawerOpen(false)}
        columnHistory={columnHistory}
        historyData={historyData}
      />
      <Reminder open={isReminder} onClose={() => setIsReminder(false)} />

      <Drawer
        title="Duplicate Members"
        open={isDuplicateDrawerOpen}
        onClose={() => setIsDuplicateDrawerOpen(false)}
        width={1000}
        styles={{ body: { padding: 0 } }}
      >
        <DuplicateMembers />
      </Drawer>

      <Drawer
        title="Member Applications"
        open={isApplicationDrawerOpen}
        onClose={() => setIsApplicationDrawerOpen(false)}
        width={1000}
        styles={{ body: { padding: "20px" } }}
      >
        <MyTable
          columns={profileApplicationColumns}
          dataSource={profileApplications}
          loading={profileApplicationsLoading}
          selection={false}
        />
      </Drawer>

      <Drawer
        title="Subscription History"
        open={isSubscriptionDrawerOpen}
        onClose={() => setIsSubscriptionDrawerOpen(false)}
        width={1000}
        styles={{ body: { padding: "20px" } }}
      >
        <MyTable
          columns={subscriptionHistoryColumns}
          dataSource={ProfileSubHistory}
          loading={ProfileSubHistoryLoading}
          selection={false}
        />
      </Drawer>
    </div>
  );
}

export default AppTabs;

function normalizeRouteId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const lowered = raw.toLowerCase();
  if (lowered === "undefined" || lowered === "null") return "";
  return raw;
}
