import { createSlice } from "@reduxjs/toolkit";

// Bumped whenever an event is created/updated/deleted from anywhere in the
// app (e.g. the global header quick-create drawer, which isn't a route
// change so page-level "refetch on navigation" effects never see it).
// Screens that list events subscribe to `version` and add it to their data-
// loading effect's dependency array to pick up the change.
const eventsRefreshSlice = createSlice({
  name: "eventsRefresh",
  initialState: { version: 0 },
  reducers: {
    bumpEventsRefresh: (state) => {
      state.version += 1;
    },
  },
});

export const { bumpEventsRefresh } = eventsRefreshSlice.actions;
export default eventsRefreshSlice.reducer;
