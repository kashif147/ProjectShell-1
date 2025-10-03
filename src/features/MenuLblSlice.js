import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  Subscriptions: false,
  "Subscriptions & Rewards": true,
  Finance: false,
  Correspondence: false,
  "Issue Management": false,
  Events: false,
  Courses: false,
  "Professional Development": false,
  Settings: false,
  Configuration: false,
  Profiles: false,
  Membership: false,
  Reports: false,
  // "Issues":false,
};
const menuLblSlice = createSlice({
  name: "menuLbl",
  initialState,
  reducers: {
    updateMenuLbl: (state, action) => {
      const { key, value, isManual = false } = action.payload;

      console.log("MenuLblSlice - updateMenuLbl called with:", {
        key,
        value,
        isManual,
      });
      console.log("MenuLblSlice - Current state before update:", state);

      // Only update menu if it's not a manual selection or if the user hasn't made a manual selection yet
      const isManualSelectionMade = sessionStorage.getItem(
        "menuManualSelection"
      );
      if (!isManualSelectionMade || isManual) {
        if (value) {
          // Set all keys to false, except the one being updated
          for (const k in state) {
            state[k] = k === key;
          }
          // Manual selection is tracked in sessionStorage
        } else {
          // If setting to false, just set that key to false (no effect on others)
          state[key] = false;
        }
      } else {
        console.log(
          "MenuLblSlice - Skipping update due to manual selection protection"
        );
      }

      console.log("MenuLblSlice - State after update:", state);
      console.log(
        "MenuLblSlice - Active key after update:",
        Object.keys(state).find((k) => state[k])
      );
    },
    resetMenuLbl: (state) => {
      // Reset to initial state
      state.Subscriptions = false;
      state["Subscriptions & Rewards"] = true;
      state.Finance = false;
      state.Correspondence = false;
      state["Issue Management"] = false;
      state.Events = false;
      state.Courses = false;
      state["Professional Development"] = false;
      state.Settings = false;
      state.Configuration = false;
      state.Profiles = false;
      state.Membership = false;
      state.Reports = false;
    },
  },
});

export const { updateMenuLbl, resetMenuLbl } = menuLblSlice.actions;
export default menuLblSlice.reducer;
