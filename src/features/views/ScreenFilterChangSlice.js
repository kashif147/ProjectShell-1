import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  screenFilterChanged: {}, // { applications: true, profile: false, ... }
};

const screenFilterSlice = createSlice({
  name: 'ScreenFilterChang',
  initialState,
  reducers: {
    // Mark a screen as having unsaved filter changes
    markScreenChanged: (state, action) => {
      const { screen } = action.payload;
      debugger
      state.screenFilterChanged[screen.toLowerCase()] = true;
    },

    resetScreenChanged: (state, action) => {
      const { screen } = action.payload;
      if (screen) {
        state.screenFilterChanged[screen.toLowerCase()] = false;
      } else {
        state.screenFilterChanged = {};
      }
    },
  },
});

export const { markScreenChanged, resetScreenChanged } = screenFilterSlice.actions;

export default screenFilterSlice.reducer;