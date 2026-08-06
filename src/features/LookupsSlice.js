// lookupsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
  getLookupId,
  getLookupName,
  getLookupTypeName,
  normalizeLookup,
  normalizeLookups,
} from "../utils/lookupHierarchy";
import {
  filterMembershipCategoryOptionsForPortalUser,
} from "../utils/membershipCategoryLabels";

const API_URL = process.env.REACT_APP_POLICY_SERVICE_URL;
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

// Normalize a LookupType's display name before matching, so bucketing
// survives however an admin actually typed it (casing/whitespace vary -
// e.g. "Event Type" vs "Event type" vs "EVENT TYPE " all match the same way).
const normalizeTypeKey = (typeName) =>
  String(typeName || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

const sortArray = (array, key, order = 'asc') => {
  if (!Array.isArray(array)) return [];

  return [...array].sort((a, b) => {
    const aValue = a[key] || '';
    const bValue = b[key] || '';

    const comparison = String(aValue).toLowerCase()
      .localeCompare(String(bValue).toLowerCase());

    return order === 'desc' ? -comparison : comparison;
  });
};

export const getAllLookups = createAsyncThunk(
  "lookups/getAllLookups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/lookup`, {
        headers: getAuthHeaders(),
      });
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch lookups"
      );
    }
  },
  {
    condition: (_, { getState }) => !getState().lookups.lookupsloading,
  }
);

export const getLookupById = createAsyncThunk(
  "lookups/fetchLookupById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_URL}/lookup/${id}`, {
        headers: getAuthHeaders(),
      });
      const payload = data?.data ?? data;
      return normalizeLookup(payload);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch lookup",
      );
    }
  },
);

const lookupsSlice = createSlice({
  name: "lookups",
  initialState: {
    // Separate states for each lookup type with label-value format
    titleOptions: [],
    genderOptions: [],
    workLocationOptions: [],
    gradeOptions: [],
    sectionOptions: [],
    membershipCategoryOptions: [],
    paymentTypeOptions: [],
    branchOptions: [],
    regionOptions: [],
    secondarySectionOptions: [],
    studyLocationOptions: [],
    disciplineOptions: [],
    youthForumOptions: [],
    countryOptions: [],
    provincesOption: [],
    eventTypeOptions: [],
    eventCategoryOptions: [],
    venueOptions: [],
    accreditationBodyOptions: [],

    selectedWorkLocations: [], // Adding selectedWorkLocations to Redux

    // Raw API response (optional - remove if not needed)
    lookups: [],
    lookupsloading: false,
    lookupDetailLoading: false,
    lookupDetailError: null,
    error: null,
    lastErrorTime: null,
  },
  reducers: {
    clearLookupsError: (state) => {
      state.error = null;
    },
    setSelectedWorkLocations: (state, action) => {
      state.selectedWorkLocations = action.payload;
    },
    resetLookups: (state) => {
      // Reset all arrays to empty
      state.titleOptions = [];
      state.genderOptions = [];
      state.workLocationOptions = [];
      state.gradeOptions = [];
      state.sectionOptions = [];
      state.membershipCategoryOptions = [];
      state.paymentTypeOptions = [];
      state.branchOptions = [];
      state.regionOptions = [];
      state.secondarySectionOptions = [];
      state.studyLocationOptions = [];
      state.disciplineOptions = [];
      state.youthForumOptions = [];
      state.countryOptions = [];
      state.provincesOption = [];
      state.eventTypeOptions = [];
      state.eventCategoryOptions = [];
      state.venueOptions = [];
      state.accreditationBodyOptions = [];
      state.selectedWorkLocations = [];
      state.lookups = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllLookups.pending, (state) => {
        state.lookupsloading = true;
        // Don't clear error on pending - keep it to prevent retries
      })
      .addCase(getAllLookups.fulfilled, (state, { payload }) => {
        state.lookupsloading = false;
        state.error = null;
        state.lastErrorTime = null;
        state.lookups = normalizeLookups(payload);

        // Reset all arrays
        state.titleOptions = [];
        state.genderOptions = [];
        state.workLocationOptions = [];
        state.gradeOptions = [];
        state.sectionOptions = [];
        state.membershipCategoryOptions = [];
        state.paymentTypeOptions = [];
        state.branchOptions = [];
        state.regionOptions = [];
        state.secondarySectionOptions = [];
        state.studyLocationOptions = [];
        state.disciplineOptions = [];
        state.youthForumOptions = [];
        state.countryOptions = [];
        state.provincesOption = []
        state.eventTypeOptions = [];
        state.eventCategoryOptions = [];
        state.venueOptions = [];
        state.accreditationBodyOptions = [];

        if (Array.isArray(state.lookups)) {
          state.lookups.forEach((item) => {
            const lookuptype = getLookupTypeName(item);
            const normalizedType = normalizeTypeKey(lookuptype);
            const optionItem = {
              value: getLookupId(item),
              key: getLookupId(item),
              label: getLookupName(item),
              ...(normalizedType === "worklocation"
                ? { processSalaryDeduction: !!item.processSalaryDeduction }
                : {}),
            };
            // Matched on a normalized (trimmed/lowercased/whitespace-stripped)
            // key so bucketing survives however an admin actually typed the
            // LookupType name when creating it via Configuration.
            switch (normalizedType) {
              case "title":
                state.titleOptions.push(optionItem);
                break;
              case "gender":
                state.genderOptions.push(optionItem);
                break;
              case "worklocation":
                state.workLocationOptions.push(optionItem);
                break;
              case "grade":
                state.gradeOptions.push(optionItem);
                break;
              case "section":
                state.sectionOptions.push(optionItem);
                break;
              case "membershipcategory":
                state.membershipCategoryOptions.push(optionItem);
                break;
              case "paymenttype":
                state.paymentTypeOptions.push(optionItem);
                break;
              case "branch":
                state.branchOptions.push(optionItem);
                break;
              case "region":
                state.regionOptions.push(optionItem);
                break;
              case "secondarysection":
                state.secondarySectionOptions.push(optionItem);
                break;
              case "studylocation":
                state.studyLocationOptions.push(optionItem);
                break;
              case "discipline":
                state.disciplineOptions.push(optionItem);
                break;
              case "eventtype":
                // Retain the parent Event Category lookup id so the Event
                // Drawer can filter Event Type options by selected category.
                state.eventTypeOptions.push({
                  ...optionItem,
                  eventCategoryLookupId: item.Parentlookupid || null,
                });
                break;
              case "eventcategory":
                state.eventCategoryOptions.push({ ...optionItem, code: item.code || null });
                break;
              case "accreditationbody":
                state.accreditationBodyOptions.push(optionItem);
                break;
              case "venue":
                state.venueOptions.push({
                  ...optionItem,
                  venueAddress: item.venueAddress || null,
                });
                break;
              case "youthforum":
                state.youthForumOptions.push(optionItem);
                break;
              case "country":
                state.countryOptions.push(optionItem);
                break;
              case "provinces":
                state.provincesOption.push(optionItem);
                break;
              default:
                break;
            }
          });
        }

        // Add standard Irish banks to branchOptions (used as Bank Name in Standing Orders)
        const irishBanks = [
          { value: "Allied Irish Banks (AIB)", label: "Allied Irish Banks (AIB)", key: "AIB" },
          { value: "Bank of Ireland", label: "Bank of Ireland", key: "BOI" },
          { value: "Permanent TSB", label: "Permanent TSB", key: "PTSB" },
          { value: "Ulster Bank", label: "Ulster Bank", key: "Ulster" },
          { value: "EBS", label: "EBS", key: "EBS" },
          { value: "KBC Bank Ireland", label: "KBC Bank Ireland", key: "KBC" },
          { value: "Danske Bank", label: "Danske Bank", key: "Danske" },
          { value: "An Post Money", label: "An Post Money", key: "AnPost" },
          { value: "Revolut", label: "Revolut", key: "Revolut" },
        ];

        irishBanks.forEach(bank => {
          if (!state.branchOptions.find(b => b.label === bank.label)) {
            state.branchOptions.push(bank);
          }
        });

        const otherOption = {
          id: "Other",
          value: "Other",
          label: "Other",
        };

        // Add "Other" to Secondary Section
        if (state.secondarySectionOptions.length > 0) {
          state.secondarySectionOptions.push(otherOption);
        }

        if (state.sectionOptions.length > 0) {
          state.sectionOptions.push(otherOption);
        }

        // Add "Other" to Grade
        if (state.gradeOptions.length > 0) {
          state.gradeOptions.push(otherOption);
        }

        // Add "Other" to Work Location
        if (state.workLocationOptions.length > 0) {
          state.workLocationOptions.push(otherOption);
        }

        // Sort all arrays in ascending order by label
        state.titleOptions = sortArray(state.titleOptions, 'label', 'asc');
        state.genderOptions = sortArray(state.genderOptions, 'label', 'asc');
        state.workLocationOptions = sortArray(state.workLocationOptions, 'label', 'asc');
        state.gradeOptions = sortArray(state.gradeOptions, 'label', 'asc');
        state.sectionOptions = sortArray(state.sectionOptions, 'label', 'asc');
        state.membershipCategoryOptions = filterMembershipCategoryOptionsForPortalUser(
          sortArray(state.membershipCategoryOptions, 'label', 'asc'),
        );
        state.paymentTypeOptions = sortArray(state.paymentTypeOptions, 'label', 'asc');
        state.branchOptions = sortArray(state.branchOptions, 'label', 'asc');
        state.regionOptions = sortArray(state.regionOptions, 'label', 'asc');
        state.secondarySectionOptions = sortArray(state.secondarySectionOptions, 'label', 'asc');
        state.studyLocationOptions = sortArray(state.studyLocationOptions, 'label', 'asc');
        state.disciplineOptions = sortArray(state.disciplineOptions, 'label', 'asc');
        state.eventTypeOptions = sortArray(state.eventTypeOptions, 'label', 'asc');
        state.eventCategoryOptions = sortArray(state.eventCategoryOptions, 'label', 'asc');
        state.venueOptions = sortArray(state.venueOptions, 'label', 'asc');
        state.accreditationBodyOptions = sortArray(state.accreditationBodyOptions, 'label', 'asc');
        state.youthForumOptions = sortArray(state.youthForumOptions, 'label', 'asc');
        state.countryOptions = sortArray(state.countryOptions, 'label', 'asc');
        state.Provinces = sortArray(state.Provinces, 'label', 'asc');
      })
      .addCase(getAllLookups.rejected, (state, action) => {
        state.lookupsloading = false;
        state.error = action.payload;
        state.lastErrorTime = Date.now();
      })
      .addCase(getLookupById.pending, (state) => {
        state.lookupDetailLoading = true;
        state.lookupDetailError = null;
      })
      .addCase(getLookupById.fulfilled, (state) => {
        state.lookupDetailLoading = false;
      })
      .addCase(getLookupById.rejected, (state, action) => {
        state.lookupDetailLoading = false;
        state.lookupDetailError = action.payload;
      });
  },
});

export const { clearLookupsError, resetLookups, setSelectedWorkLocations } = lookupsSlice.actions;
export default lookupsSlice.reducer;