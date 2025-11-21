/** @format */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { baseURL } from "../utils/Utilities";
const baseURL = `${process.env.REACT_APP_CUMM}`;
// Fetch all bookmarks
export const getBookmarks = createAsyncThunk(
  "bookmarks/getBookmarks",
  async (_, { rejectWithValue }) => {
    debugger
    try {
        const token = localStorage.getItem("token");
        const apiUrl = `${process.env.REACT_APP_CUMM}/bookmarks/fields`;
        
        const response = await axios.get(
            `${apiUrl}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        debugger
      console.log(response.data, "Bookmarks API Response");
      return response.data?.data?.fields;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch bookmarks"
      );
    }
  }
);

// Create new bookmark
export const createBookmark = createAsyncThunk(
  "bookmarks/createBookmark",
  async (bookmarkData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_CUMM_API_URL;
      
      const response = await axios.post(
        `${baseURL}${apiUrl}`,
        bookmarkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "Create Bookmark API Response");
      return response.data;
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
      const apiUrl = process.env.REACT_APP_CUMM_API_URL;
      
      const response = await axios.put(
        `${baseURL}${apiUrl}/${id}`,
        bookmarkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data, "Update Bookmark API Response");
      return response.data;
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
      const apiUrl = process.env.REACT_APP_CUMM_API_URL;
      
      await axios.delete(
        `${baseURL}${apiUrl}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
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
        state.bookmarks = action.payload;
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
        state.bookmarks.push(action.payload);
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
        const index = state.bookmarks.findIndex(
          (bookmark) => bookmark.id === action.payload.id
        );
        if (index !== -1) {
          state.bookmarks[index] = action.payload;
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
          (bookmark) => bookmark.id !== action.payload
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