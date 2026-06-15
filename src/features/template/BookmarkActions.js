/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all bookmarks
export const getBookmarks = createAsyncThunk(
  "bookmarks/getBookmarks",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkBaseUrl = process.env.REACT_APP_CUMM;

      if (!bookmarkBaseUrl) {
        // Silently return empty array if bookmark service is not configured
        console.warn(
          "REACT_APP_CUMM is not configured, bookmarks feature disabled"
        );
        return [];
      }

      const apiUrl = `${bookmarkBaseUrl}/bookmarks/fields`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log(response.data, "Bookmarks API Response");
      return response.data?.data?.fields;
    } catch (error) {
      // Silently handle 404 errors - bookmark service may not be available
      if (error.response?.status === 404) {
        console.warn("Bookmark service not available");
        return [];
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookmarks"
      );
    }
  },
  {
    condition: (arg, { getState }) => {
      if (arg?.force) return true;
      return !getState().bookmarks.bookmarksLoading;
    },
  }
);

// Create new bookmark
export const createBookmark = createAsyncThunk(
  "bookmarks/createBookmark",
  async (bookmarkData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkBaseUrl = process.env.REACT_APP_CUMM;
      const apiUrl = process.env.REACT_APP_CUMM_API_URL || "/bookmarks/fields";

      if (!bookmarkBaseUrl) {
        return rejectWithValue("Bookmark service URL is not configured");
      }

      const response = await axios.post(
        `${bookmarkBaseUrl}${apiUrl}`,
        bookmarkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "Create Bookmark API Response");
      return response.data?.data?.field ?? response.data?.field;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create bookmark"
      );
    }
  }
);

// Update bookmark
export const updateBookmark = createAsyncThunk(
  "bookmarks/updateBookmark",
  async ({ id, bookmarkData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkBaseUrl = process.env.REACT_APP_CUMM;
      const apiUrl = process.env.REACT_APP_CUMM_API_URL || "/bookmarks/fields";

      if (!bookmarkBaseUrl) {
        return rejectWithValue("Bookmark service URL is not configured");
      }

      const response = await axios.put(
        `${bookmarkBaseUrl}${apiUrl}/${id}`,
        bookmarkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "Update Bookmark API Response");
      return response.data?.data?.field ?? response.data?.field;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update bookmark"
      );
    }
  }
);

// Delete bookmark
export const deleteBookmark = createAsyncThunk(
  "bookmarks/deleteBookmark",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const bookmarkBaseUrl = process.env.REACT_APP_CUMM;
      const apiUrl = process.env.REACT_APP_CUMM_API_URL || "/bookmarks/fields";

      if (!bookmarkBaseUrl) {
        return rejectWithValue("Bookmark service URL is not configured");
      }

      await axios.delete(`${bookmarkBaseUrl}${apiUrl}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("Bookmark deleted successfully");
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete bookmark"
      );
    }
  }
);

const bookmarkSlice = createSlice({
  name: "bookmarks",
  initialState: {
    bookmarks: [],
    bookmarksLoading: false,
    bookmarksError: null,
    creatingBookmark: false,
    updatingBookmark: false,
    deletingBookmark: false,
    createError: null,
    updateError: null,
    deleteError: null,
  },
  reducers: {
    clearBookmarksError: (state) => {
      state.bookmarksError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    resetBookmarks: (state) => {
      state.bookmarks = [];
      state.bookmarksLoading = false;
      state.bookmarksError = null;
      state.creatingBookmark = false;
      state.updatingBookmark = false;
      state.deletingBookmark = false;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Bookmarks
      .addCase(getBookmarks.pending, (state) => {
        state.bookmarksLoading = true;
        state.bookmarksError = null;
      })
      .addCase(getBookmarks.fulfilled, (state, action) => {
        state.bookmarksLoading = false;
        state.bookmarks = Array.isArray(action.payload) ? action.payload : [];
        state.bookmarksError = null;
      })
      .addCase(getBookmarks.rejected, (state, action) => {
        state.bookmarksLoading = false;
        state.bookmarksError = action.payload;
      })
      // Create Bookmark
      .addCase(createBookmark.pending, (state) => {
        state.creatingBookmark = true;
        state.createError = null;
      })
      .addCase(createBookmark.fulfilled, (state, action) => {
        state.creatingBookmark = false;
        if (action.payload) {
          state.bookmarks.push(action.payload);
        }
        state.createError = null;
      })
      .addCase(createBookmark.rejected, (state, action) => {
        state.creatingBookmark = false;
        state.createError = action.payload;
      })
      // Update Bookmark
      .addCase(updateBookmark.pending, (state) => {
        state.updatingBookmark = true;
        state.updateError = null;
      })
      .addCase(updateBookmark.fulfilled, (state, action) => {
        state.updatingBookmark = false;
        const updated = action.payload;
        const updatedId = updated?._id || updated?.id;
        const index = state.bookmarks.findIndex(
          (bookmark) =>
            bookmark._id === updatedId ||
            bookmark.id === updatedId ||
            bookmark.id === action.meta?.arg?.id,
        );
        if (index !== -1 && updated) {
          state.bookmarks[index] = updated;
        }
        state.updateError = null;
      })
      .addCase(updateBookmark.rejected, (state, action) => {
        state.updatingBookmark = false;
        state.updateError = action.payload;
      })
      // Delete Bookmark
      .addCase(deleteBookmark.pending, (state) => {
        state.deletingBookmark = true;
        state.deleteError = null;
      })
      .addCase(deleteBookmark.fulfilled, (state, action) => {
        state.deletingBookmark = false;
        state.bookmarks = state.bookmarks.filter(
          (bookmark) =>
            bookmark._id !== action.payload && bookmark.id !== action.payload,
        );
        state.deleteError = null;
      })
      .addCase(deleteBookmark.rejected, (state, action) => {
        state.deletingBookmark = false;
        state.deleteError = action.payload;
      });
  },
});

export const { clearBookmarksError, resetBookmarks } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
