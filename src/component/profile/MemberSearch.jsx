import React, { useState, useEffect, useRef } from "react";
import { AutoComplete, Input, Button, message, Spin } from "antd";
import { SearchOutlined, LoadingOutlined, UserAddOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getSubscriptionByProfileId,
  profileDetailActiveSubscriptionArgs,
} from "../../features/subscription/profileSubscriptionSlice";
import { searchProfiles } from "../../features/profiles/SearchProfile";
import { buildDetailsSearch } from "../../utils/detailsRoute";
import MemberSearchOptionLabel from "./MemberSearchOptionLabel";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const MemberSearch = ({
  fullWidth = false,
  headerStyle = false,
  showAddButton = false,
  style = {},
  disable = false,
  // Selection behavior props
  onSelectBehavior = "navigate", // "navigate", "callback", "both", or "none"
  onSelectCallback = null, // Callback function when onSelectBehavior is "callback" or "both"
  navigateTo = "/Details", // Route to navigate to when onSelectBehavior is "navigate" or "both"

  // Add member functionality
  onAddMember = null, // Callback function when "Add Member" button is clicked
  addMemberLabel = "Add Member", // Label for the add member button

  // Search props
  searchType = "profiles", // "profiles", "subscriptions", or "both"
  searchContext = null, // Context for subscription search

  // NEW: Controlled input props
  value: externalValue = undefined, // External control value
  onChange: externalOnChange = null, // External onChange handler
  onClear: externalOnClear = null, // Optional external clear callback

  // NEW: Layout control props
  showStatus = true, // Whether to show "Searching..." and "Found X members" text
  getPopupContainer = null, // Custom popup container function
}) => {
  // Internal state for backward compatibility
  const [internalValue, setInternalValue] = useState("");

  // Determine if component is controlled or uncontrolled
  const isControlled = externalValue !== undefined;
  const searchValue = isControlled ? externalValue : internalValue;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showNoMatchOption, setShowNoMatchOption] = useState(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const searchRequestIdRef = useRef(0);
  const inputRef = useRef(null);
  /** When true, skip debounced API search (e.g. after selecting a member). */
  const selectionLockRef = useRef(false);

  const rankMembersForQuery = (members, query) => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return members;

    const exact = members.filter(
      (m) => String(m.membershipNumber || "").trim().toLowerCase() === q,
    );
    if (exact.length > 0) return exact;

    return [...members].sort((a, b) => {
      const aNo = String(a.membershipNumber || "").toLowerCase();
      const bNo = String(b.membershipNumber || "").toLowerCase();
      const aStarts = aNo.startsWith(q);
      const bStarts = bNo.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return aNo.localeCompare(bNo);
    });
  };

  const membersToOptions = (members, searchTerm) =>
    members.map((member) => ({
      value: JSON.stringify({
        displayValue: `${member.personalInfo?.forename || ""} ${member.personalInfo?.surname || ""}`,
        membershipNumber: member.membershipNumber,
        searchTerm,
        memberData: member,
      }),
      label: <MemberSearchOptionLabel member={member} />,
      memberId: member._id,
      membershipNumber: member.membershipNumber,
      memberData: member,
    }));

  // Use debounce for search input
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Update value internally when external value changes
  useEffect(() => {
    if (isControlled) {
      // When external value is cleared, clear internal states too
      if (externalValue === "") {
        selectionLockRef.current = false;
        setOptions([]);
        setApiError(null);
        setCurrentSearchTerm("");
        setSelectedOption(null);
        setShowNoMatchOption(false);
        setIsSearchTriggered(false);
      }
    }
  }, [externalValue, isControlled]);

  // Direct API call function for searching profiles (for search only)
  const searchProfilesDirect = async (query) => {
    try {
      const baseUrl = process.env.REACT_APP_PROFILE_SERVICE_URL;
      const token = localStorage.getItem("token");
      const que = String(query).trim();

      if (!que) {
        throw new Error('Search query cannot be empty');
      }

      const response = await axios.get(`${baseUrl}/profile/search?q=${que}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Network error'
      );
    }
  };

  // Handle search API call with debounce using direct API call
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchValue.trim() || debouncedSearchValue.length < 2) {
        selectionLockRef.current = false;
        setOptions([]);
        setCurrentSearchTerm("");
        setSelectedOption(null);
        setShowNoMatchOption(false);
        setIsSearchTriggered(false);
        setLoading(false);
        return;
      }

      // After a confirmed selection, the display value is not a search query.
      if (selectionLockRef.current) {
        setOptions([]);
        setShowNoMatchOption(false);
        setIsSearchTriggered(false);
        setLoading(false);
        return;
      }

      const requestId = ++searchRequestIdRef.current;

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, 100);

      setApiError(null);
      setCurrentSearchTerm(debouncedSearchValue);
      setIsSearchTriggered(true);

      try {
        const result = await searchProfilesDirect(debouncedSearchValue);

        if (requestId !== searchRequestIdRef.current) {
          return;
        }

        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }

        if (result && result.results && Array.isArray(result.results) && result.results.length > 0) {
          const members = rankMembersForQuery(result.results, debouncedSearchValue);
          setShowNoMatchOption(false);
          setOptions(membersToOptions(members, debouncedSearchValue));
        } else {
          // No results found - show "Add Member" option
          setShowNoMatchOption(true);
          setOptions([
            {
              value: "__no_match__",
              label: (
                <div style={{ padding: "12px", textAlign: "center" }}>
                  <div style={{ color: "#999", fontSize: "14px", marginBottom: "12px" }}>
                    No member found for "{debouncedSearchValue}"
                  </div>
                  {onAddMember && (
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddMember) {
                          onAddMember(debouncedSearchValue);
                          // Clear the search after clicking
                          clearSearch();
                        }
                      }}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                        fontWeight: 500
                      }}
                    >
                      {addMemberLabel}
                    </Button>
                  )}
                </div>
              ),
              disabled: false,
            },
          ]);
        }
      } catch (error) {
        if (requestId !== searchRequestIdRef.current) {
          return;
        }
        setApiError(error.message || "Search failed");
        message.error(
          `Search failed: ${error.message || "Unknown error"}. Please try again.`,
        );
        setOptions([]);
        setShowNoMatchOption(false);
      } finally {
        if (requestId === searchRequestIdRef.current) {
          setLoading(false);
          if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
          }
        }
      }
    };

    fetchSearchResults();

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedSearchValue, onAddMember, addMemberLabel]);

  const handleSelect = async (value, option) => {
    console.log('Selected value:', value);
    console.log('Selected option:', option);
    console.log('onSelectBehavior:', onSelectBehavior);

    // Check if this is a "no match" option with Add Member button
    if (value === "__no_match__") {
      return;
    }

    try {
      // Parse the stringified value to get member data
      const parsedValue = JSON.parse(value);
      console.log('Parsed value:', parsedValue);

      setLoading(true);
      setApiError(null);
      setSelectedOption(parsedValue);

      // Use the stored member data directly
      if (parsedValue.memberData) {
        const memberData = parsedValue.memberData;
        const searchTerm = parsedValue.searchTerm;

        // Handle selection based on onSelectBehavior prop
        switch (onSelectBehavior) {
          case "navigate":
            // First clear the search input immediately
            handleClear();

            // Use Redux for BOTH subscription AND profile search when selecting
            try {
              // Dispatch searchProfiles to update Redux state
              await dispatch(searchProfiles(searchTerm)).unwrap();

              // Dispatch subscription lookup
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  ...profileDetailActiveSubscriptionArgs,
                })
              ).unwrap();

              // Navigate to the specified route
              navigate({
                pathname: navigateTo,
                search: buildDetailsSearch(memberData._id),
                state: {
                  name: memberData.fullName ||
                    `${memberData.personalInfo?.forename} ${memberData.personalInfo?.surname}`,
                  code: memberData.membershipNumber,
                  search: "Profile",
                  memberData: memberData,
                  searchTerm: searchTerm
                }
              });

              message.success(`Member ${memberData.membershipNumber} loaded successfully`);
            } catch (error) {
              console.error("Redux dispatch error:", error);
              message.error(`Failed to load member data: ${error.message}`);
            }
            break;

          case "callback":
            try {
              // DON'T clear search value - keep it visible in the input!
              // The search value should show the selected member's name or membership number
              const displayValue = `${memberData.personalInfo?.forename || ''} ${memberData.personalInfo?.surname || ''} (${memberData.membershipNumber || ''})`.trim();

              selectionLockRef.current = true;
              searchRequestIdRef.current += 1;
              setShowNoMatchOption(false);
              setIsSearchTriggered(false);

              // Update the value to show selected member
              handleInputChange(displayValue, { fromSelection: true });

              // Clear options dropdown
              setOptions([]);

              // Call the provided callback function and wait for it to complete
              if (onSelectCallback && typeof onSelectCallback === 'function') {
                await onSelectCallback(memberData, parsedValue);
              }

              // Also dispatch Redux actions for callback mode if needed
              if (memberData?._id) {
                await dispatch(
                  getSubscriptionByProfileId({
                    profileId: memberData?._id,
                    ...profileDetailActiveSubscriptionArgs,
                  })
                ).unwrap();
              }

              message.success(`Member ${memberData.membershipNumber} selected`);
            } catch (error) {
              console.error("Callback error:", error);
              message.error(`Failed in callback: ${error.message}`);
            } finally {
              setCurrentSearchTerm("");
              setShowNoMatchOption(false);
              setIsSearchTriggered(false);
            }
            break;

          case "both":
            // Clear search input
            handleClear();

            // Use Redux for BOTH subscription AND profile search when selecting
            try {
              // Dispatch searchProfiles to update Redux state
              await dispatch(searchProfiles(searchTerm)).unwrap();

              // Dispatch subscription lookup
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  ...profileDetailActiveSubscriptionArgs,
                })
              ).unwrap();

              // Both navigate and call callback
              navigate({
                pathname: navigateTo,
                search: buildDetailsSearch(memberData._id),
                state: {
                  name: memberData.fullName ||
                    `${memberData.personalInfo?.forename} ${memberData.personalInfo?.surname}`,
                  code: memberData.membershipNumber,
                  search: "Profile",
                  memberData: memberData,
                  searchTerm: searchTerm
                }
              });

              // Call the provided callback function
              if (onSelectCallback && typeof onSelectCallback === 'function') {
                await onSelectCallback(memberData, parsedValue);
              }

              message.success(`Member ${memberData.membershipNumber} loaded successfully`);
            } catch (error) {
              console.error("Redux dispatch error:", error);
              message.error(`Failed to load member data: ${error.message}`);
            }
            break;

          case "none":
            // Just show success message and keep search value visible
            const displayValueNone = `${memberData.personalInfo?.forename || ''} ${memberData.personalInfo?.surname || ''} (${memberData.membershipNumber || ''})`.trim();
            selectionLockRef.current = true;
            searchRequestIdRef.current += 1;
            setShowNoMatchOption(false);
            setIsSearchTriggered(false);
            handleInputChange(displayValueNone, { fromSelection: true }); // Keep value visible
            setOptions([]); // Clear dropdown

            message.success(`Member ${memberData.membershipNumber} selected`);

            // Still dispatch Redux actions even for "none" behavior
            if (memberData?._id) {
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  ...profileDetailActiveSubscriptionArgs,
                })
              ).unwrap();
            }

            setCurrentSearchTerm("");
            setShowNoMatchOption(false);
            setIsSearchTriggered(false);
            break;

          default:
            // Default to navigate behavior
            handleClear();

            // Use Redux for BOTH subscription AND profile search when selecting
            try {
              // Dispatch searchProfiles to update Redux state
              await dispatch(searchProfiles(searchTerm)).unwrap();

              // Dispatch subscription lookup
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  ...profileDetailActiveSubscriptionArgs,
                })
              ).unwrap();

              navigate({
                pathname: navigateTo,
                search: buildDetailsSearch(memberData._id),
                state: {
                  name: memberData.fullName ||
                    `${memberData.personalInfo?.forename} ${memberData.personalInfo?.surname}`,
                  code: memberData.membershipNumber,
                  search: "Profile",
                  memberData: memberData,
                  searchTerm: searchTerm
                }
              });
              message.success(`Member ${memberData.membershipNumber} loaded successfully`);
            } catch (error) {
              console.error("Redux dispatch error:", error);
              message.error(`Failed to load member data: ${error.message}`);
            }
            break;
        }

        setCurrentSearchTerm("");
        setShowNoMatchOption(false);
        setIsSearchTriggered(false);
        return;
      }

    } catch (error) {
      console.error("Error handling selection:", error);
      message.error(`Error: ${error.message || 'Unknown error'}. Please try again or contact support.`);
      setApiError(error.message || 'Failed to handle selection');

      handleClear();
    } finally {
      setLoading(false);
    }
  };

  // Handle input change (for typing)
  const handleInputChange = (value, { fromSelection = false } = {}) => {
    console.log('Input changed to:', value);

    // Update value based on control mode
    if (isControlled && externalOnChange) {
      externalOnChange(value); // Call external onChange
    } else {
      setInternalValue(value); // Use internal state
    }

    if (fromSelection) {
      return;
    }

    selectionLockRef.current = false;
    setSelectedOption(null);
    setShowNoMatchOption(false);

    if (value === "") {
      setIsSearchTriggered(false);
    }
  };

  const handleClear = () => {
    selectionLockRef.current = false;
    // Clear value based on control mode
    if (isControlled && externalOnChange) {
      externalOnChange(""); // Clear external value
    } else {
      setInternalValue(""); // Clear internal value
    }

    // Clear all other states
    setOptions([]);
    setApiError(null);
    setCurrentSearchTerm("");
    setSelectedOption(null);
    setShowNoMatchOption(false);
    setIsSearchTriggered(false);

    // Call external clear callback if provided
    if (externalOnClear) {
      externalOnClear();
    }
  };

  // Clear search function (for internal use)
  const clearSearch = () => {
    handleClear();
  };

  // Handle keyboard events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchValue.trim().length >= 2) {
      e.preventDefault();
      e.stopPropagation();

      if (options.length > 0 && options[0].value !== "__no_match__") {
        const firstOption = options[0];
        handleSelect(firstOption.value, firstOption);
      }
    }

    // Clear on Escape
    if (e.key === 'Escape' && searchValue) {
      handleClear();
    }
  };

  // Handle input click - prevent search trigger on click
  const handleInputClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={{
      width: fullWidth ? "100%" : headerStyle ? "100%" : "400px",
      position: "relative",
      ...style
    }}>
      <AutoComplete
        style={{ width: "100%" }}
        options={options}
        onSelect={handleSelect}
        value={searchValue}
        onChange={handleInputChange}
        filterOption={false}
        popupMatchSelectWidth={false}
        notFoundContent={null}
        defaultActiveFirstOption={false}
        backfill={false}
        getPopupContainer={getPopupContainer || (trigger => trigger.parentNode)}
        styles={{
          popup: {
            root: {
              maxHeight: "400px",
              overflowY: "auto",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              padding: "0",
              backgroundColor: "#ffffff",
              position: "absolute",
              zIndex: 1050,
            },
          },
        }}
      >
        <Input
          disabled={disable || loading}
          ref={inputRef}
          size={headerStyle ? "middle" : "large"}
          prefix={
            loading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 14 }} spin />}
                size="small"
              />
            ) : (
              <SearchOutlined />
            )
          }
          placeholder={
            headerStyle
              ? "Search by name, email, or membership number..."
              : "Search by name, email, membership number..."
          }
          className="p-2 my-input-field"
          style={{
            width: "100%",
            borderRadius: headerStyle ? "4px" : "4px",
            border: apiError ? "1px solid #ff4d4f" : "1px solid #d9d9d9",
            height: headerStyle ? "32px" : "40px",
            fontSize: headerStyle ? "14px" : "16px",
            backgroundColor: "#ffffff",
            lineHeight: headerStyle ? "20px" : "24px"
          }}
          suffix={
            searchValue && !loading && (
              <Button
                type="text"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                style={{
                  width: "16px",
                  height: "16px",
                  minWidth: "16px",
                  padding: 0,
                  marginRight: 0,
                  fontSize: "10px",
                  lineHeight: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </Button>
            )
          }
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          allowClear={false}
        />
      </AutoComplete>

      {/* Show search status - ONLY when actively searching AND showStatus is true */}
      {showStatus && isSearchTriggered && searchValue && searchValue.length >= 2 && !showNoMatchOption && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          fontSize: "12px",
          color: loading ? "#1890ff" : options.length > 0 ? "#52c41a" : "#ff4d4f",
          padding: "4px 8px",
          backgroundColor: "transparent",
          marginTop: "4px",
          zIndex: 1
        }}>
          {loading
            ? `Searching for "${searchValue}"...`
            : options.length > 0 && options[0].value !== "__no_match__"
              ? `Found ${options.length} member(s) for "${searchValue}"`
              : ""
          }
        </div>
      )}

      {/* Show "no results" status with add member option - ONLY if showStatus is true */}
      {showStatus && showNoMatchOption && !loading && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          fontSize: "12px",
          color: "#fa8c16",
          padding: "8px",
          backgroundColor: "#fff7e6",
          border: "1px solid #ffd591",
          borderRadius: "4px",
          marginTop: "4px",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span>
            No member found for "{searchValue}"
          </span>
          {onAddMember && (
            <Button
              type="primary"
              size="small"
              icon={<UserAddOutlined />}
              onClick={() => {
                onAddMember(searchValue);
                handleClear();
              }}
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                fontSize: "12px",
                height: "24px"
              }}
            >
              {addMemberLabel}
            </Button>
          )}
        </div>
      )}

      {/* Error message display */}
      {apiError && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          fontSize: "12px",
          color: "#ff4d4f",
          padding: "4px 8px",
          backgroundColor: "#fff2f0",
          border: "1px solid #ffccc7",
          borderRadius: "0 0 4px 4px",
          marginTop: "-1px",
          zIndex: 1
        }}>
          ⚠️ {apiError}
        </div>
      )}
    </div>
  );
};

export default MemberSearch;