import { createSlice } from '@reduxjs/toolkit';

const initialState = {   "Subscriptions": false,
  "Subscriptions & Rewards":false,
  "Finance": true,
  "Correspondence": false,
  "Issue Management": false,
  "Events": false,
  "Courses": false,
  "Professional Development": false,
  "Settings": false,
  'Configuration':false,
  'Profiles':false,
  "Membership":false,
  "Reports":false,
  // "Issues":false,

}
  ;

  const menuLblSlice = createSlice({
    name: 'menuLbl',
    initialState,
    reducers: {
      updateMenuLbl: (state, action) => {
        const { key, value } = action.payload;
  
        if (value) {
          // Set all keys to false, except the one being updated
          for (const k in state) {
            state[k] = k === key;
          }
        } else {
          // If setting to false, just set that key to false (no effect on others)
          state[key] = false;
        }
      },
    },
  });

export const { updateMenuLbl } = menuLblSlice.actions;
export default menuLblSlice.reducer;
