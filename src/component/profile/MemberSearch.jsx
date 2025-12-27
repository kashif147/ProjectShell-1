import React, { useState, useEffect, useRef } from "react";
import { AutoComplete, Input, Button, message, Spin } from "antd";
import { SearchOutlined, LoadingOutlined, UserAddOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getSubscriptionByProfileId } from "../../features/subscription/profileSubscriptionSlice";
import { searchProfiles } from "../../features/profiles/SearchProfile"; // Import Redux action for selection

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
  crosFtn,
  // Search props
  searchType = "profiles", // "profiles", "subscriptions", or "both"
  searchContext = null, // Context for subscription search
}) => {
  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(null);
  const [showNoMatchOption, setShowNoMatchOption] = useState(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Use debounce for search input
  const debouncedSearchValue = useDebounce(searchValue, 300);

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
    // Only search if search was manually triggered by typing
    if (!isManualSearch) {
      return;
    }

    const fetchSearchResults = async () => {
      if (!debouncedSearchValue.trim() || debouncedSearchValue.length < 2) {
        setOptions([]);
        setCurrentSearchTerm("");
        setSelectedOption(null);
        setShowNoMatchOption(false);
        setIsSearchTriggered(false);
        return;
      }

      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Set loading state after a short delay to prevent flickering
      searchTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, 100);

      setApiError(null);
      setCurrentSearchTerm(debouncedSearchValue);
      setIsSearchTriggered(true);

      try {
        // Direct API call to search profiles (NO Redux)
        const result = await searchProfilesDirect(debouncedSearchValue);

        // Clear the timeout
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }

        // Check if result has data and results array
        if (result && result.results && Array.isArray(result.results) && result.results.length > 0) {
          const members = result.results;
          setShowNoMatchOption(false);

          setOptions(
            members.map((member) => ({
              value: JSON.stringify({
                // Store member data as stringified JSON
                displayValue: `${member.personalInfo?.forename || ''} ${member.personalInfo?.surname || ''}`,
                membershipNumber: member.membershipNumber,
                searchTerm: debouncedSearchValue,
                memberData: member
              }),
              label: (
                <div style={{ padding: "8px 0" }}>
                  {/* Row 1: Name, Membership Number, Email */}
                  <div style={{ fontWeight: "600" }}>
                    {`${member.personalInfo?.title || ''} ${member.personalInfo?.forename || ''} ${member.personalInfo?.surname || ''}`.trim()}
                    <span style={{ color: "#555", fontWeight: "normal" }}>
                      • {member.membershipNumber} • {member.contactInfo?.personalEmail || 'No email'}
                    </span>
                  </div>

                  {/* Row 2: Mobile Number, Address */}
                  <div style={{ fontSize: "13px", color: "#555" }}>
                    📱 {member.contactInfo?.mobileNumber || 'No phone'} •
                    📍 {member.contactInfo?.fullAddress || 'No address'}
                  </div>

                  {/* Row 3: Additional Info */}
                  <div style={{ fontSize: "13px", marginTop: "2px" }}>
                    <span>👤 {member.additionalInformation?.membershipStatus || 'Unknown'}</span> •{" "}
                    <span>🎂 {member.personalInfo?.dateOfBirth ? new Date(member.personalInfo.dateOfBirth).toLocaleDateString() : 'No DOB'}</span> •{" "}
                    <span>💼 {member.professionalDetails?.grade || 'No grade'}</span>
                  </div>
                </div>
              ),
              memberId: member._id,
              membershipNumber: member.membershipNumber,
              memberData: member
            }))
          );
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
        setApiError(error.message || 'Search failed');
        message.error(`Search failed: ${error.message || 'Unknown error'}. Please try again.`);
        setOptions([]);
        setShowNoMatchOption(false);
      } finally {
        setLoading(false);
        setIsManualSearch(false); // Reset manual search flag
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = null;
        }
      }
    };

    fetchSearchResults();

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [debouncedSearchValue, onAddMember, addMemberLabel, isManualSearch]);

  // Simplified search handler - only trigger on manual typing
  const handleSearch = (value) => {
    console.log('Search triggered with:', value);
    // Only trigger search if value length >= 2 and it's a new search
    if (value.length >= 2) {
      setIsManualSearch(true);
    }

    setSearchValue(value);
    setSelectedOption(null);

    if (!value) {
      setOptions([]);
      setApiError(null);
      setCurrentSearchTerm("");
      setShowNoMatchOption(false);
      setIsSearchTriggered(false);
      setIsManualSearch(false);
    }
  };

  const handleSelect = async (value, option) => {
    console.log('Selected value:', value);
    console.log('Selected option:', option);
    console.log('onSelectBehavior:', onSelectBehavior);
    debugger
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
      setIsManualSearch(false);

      // Use the stored member data directly
      if (parsedValue.memberData) {
        const memberData = parsedValue.memberData;
        const searchTerm = parsedValue.searchTerm;

        // Handle selection based on onSelectBehavior prop
        switch (onSelectBehavior) {
          case "navigate":
            // First clear the search input immediately
            setSearchValue("");
            setOptions([]);

            // Use Redux for BOTH subscription AND profile search when selecting
            try {
              // Dispatch searchProfiles to update Redux state
              await dispatch(searchProfiles(searchTerm)).unwrap();

              // Dispatch subscription lookup
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  isCurrent: true,
                })
              ).unwrap();

              // Navigate to the specified route
              navigate(navigateTo, {
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

            clearSearch();
            break;

          case "callback":
            try {
              // Clear search input immediately before callback
              setSearchValue("");
              setOptions([]);

              // Call the provided callback function and wait for it to complete
              if (onSelectCallback && typeof onSelectCallback === 'function') {
                await onSelectCallback(memberData, parsedValue);
              }

              // Also dispatch Redux actions for callback mode if needed
              if (memberData?.profileId) {
                await dispatch(
                  getSubscriptionByProfileId({
                    profileId: memberData?.profileId,
                    isCurrent: true,
                  })
                ).unwrap();
              }

              message.success(`Member ${memberData.membershipNumber} selected`);
            } finally {
              // Clear search regardless of callback success/failure
              clearSearch();
            }
            break;

          case "both":
            // Clear search input immediately
            setSearchValue("");
            setOptions([]);

            // Use Redux for BOTH subscription AND profile search when selecting
            try {
              // Dispatch searchProfiles to update Redux state
              await dispatch(searchProfiles(searchTerm)).unwrap();

              // Dispatch subscription lookup
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  isCurrent: true,
                })
              ).unwrap();

              // Both navigate and call callback
              navigate(navigateTo, {
                state: {
                  name: memberData.fullName ||
                    `${memberData.personalInfo?.forename} ${memberData.personalInfo?.surname}`,
                  code: memberData.membershipNumber,
                  search: "Profile",
                  memberData: memberData,
                  searchTerm: searchTerm
                }
              });

              try {
                // Call the provided callback function
                if (onSelectCallback && typeof onSelectCallback === 'function') {
                  await onSelectCallback(memberData, parsedValue);
                }
              } finally {
                clearSearch();
              }

              message.success(`Member ${memberData.membershipNumber} loaded successfully`);
            } catch (error) {
              console.error("Redux dispatch error:", error);
              message.error(`Failed to load member data: ${error.message}`);
            }
            break;

          case "none":
            // Just show success message and clear search
            message.success(`Member ${memberData.membershipNumber} selected`);

            // Still dispatch Redux actions even for "none" behavior
            if (memberData?.profileId) {
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  isCurrent: true,
                })
              ).unwrap();
            }

            clearSearch();
            break;

          default:
            // Default to navigate behavior
            setSearchValue("");
            setOptions([]);

            // Use Redux for BOTH subscription AND profile search when selecting
            try {
              // Dispatch searchProfiles to update Redux state
              await dispatch(searchProfiles(searchTerm)).unwrap();

              // Dispatch subscription lookup
              await dispatch(
                getSubscriptionByProfileId({
                  profileId: memberData?._id,
                  isCurrent: true,
                })
              ).unwrap();

              navigate(navigateTo, {
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

            clearSearch();
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

      setSearchValue("");
      setOptions([]);
      setCurrentSearchTerm("");
      setShowNoMatchOption(false);
      setIsSearchTriggered(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change (for typing)
  const handleInputChange = (value) => {
    console.log('Input changed to:', value);
    setSearchValue(value);
    setSelectedOption(null);

    if (value === "") {
      setShowNoMatchOption(false);
      setIsSearchTriggered(false);
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setOptions([]);
    setApiError(null);
    setCurrentSearchTerm("");
    setSelectedOption(null);
    setShowNoMatchOption(false);
    setIsSearchTriggered(false);
    setIsManualSearch(false);
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
        onSearch={handleSearch}
        onSelect={handleSelect}
        value={searchValue}
        onChange={handleInputChange}
        dropdownMatchSelectWidth={true}
        notFoundContent={null}
        dropdownStyle={{
          maxHeight: "400px",
          overflowY: "auto",
          borderRadius: "4px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: "0",
          position: "absolute",
          zIndex: 1050
        }}
        filterOption={false}
        defaultActiveFirstOption={false}
        backfill={false}
        getPopupContainer={trigger => trigger.parentNode}
      >
        <Input
          disabled={disable}
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
                  clearSearch();
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
          disabled={loading}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          allowClear={false}
        />
      </AutoComplete>

      {/* Show search status - ONLY when actively searching */}
      {isSearchTriggered && searchValue && searchValue.length >= 2 && !showNoMatchOption && (
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

      {/* Show "no results" status with add member option */}
      {showNoMatchOption && !loading && (
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
                clearSearch();
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