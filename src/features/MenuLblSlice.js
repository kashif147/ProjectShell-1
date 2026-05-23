import { createSlice } from "@reduxjs/toolkit";
import {
  getHomeMenuKeyFromRoles,
  getRoleCodesFromStorage,
  MENU_MODULE_KEYS,
} from "../utils/roleHomeModule";

const ACTIVE_MENU_STORAGE_KEY = "activeMenuModule";

const defaultMenuState = {
  Subscriptions: false,
  "Subscriptions & Rewards": false,
  Finance: false,
  Correspondence: false,
  "Issues Management": false,
  Events: false,
  Courses: false,
  Cases: false,
  Settings: false,
  Configuration: false,
  Profiles: false,
  Membership: false,
  Reports: false,
};

function buildMenuState(activeKey) {
  const next = { ...defaultMenuState };
  if (activeKey && Object.prototype.hasOwnProperty.call(next, activeKey)) {
    next[activeKey] = true;
    return next;
  }
  next["Subscriptions & Rewards"] = true;
  return next;
}

function resolveInitialMenuKey() {
  const saved = localStorage.getItem(ACTIVE_MENU_STORAGE_KEY);
  if (saved && MENU_MODULE_KEYS.includes(saved)) {
    return saved;
  }

  const roleCodes = getRoleCodesFromStorage();
  if (roleCodes.length > 0) {
    return getHomeMenuKeyFromRoles(roleCodes);
  }

  return "Subscriptions & Rewards";
}

const initialState = buildMenuState(resolveInitialMenuKey());

const menuLblSlice = createSlice({
  name: "menuLbl",
  initialState,
  reducers: {
    updateMenuLbl: (state, action) => {
      const { key, value } = action.payload;

      if (value) {
        for (const k in state) {
          state[k] = k === key;
        }
        try {
          localStorage.setItem(ACTIVE_MENU_STORAGE_KEY, key);
        } catch {
          // ignore quota / private mode
        }
      } else {
        state[key] = false;
      }
    },
    restoreMenuLblFromRoles: (state) => {
      const homeKey = getHomeMenuKeyFromRoles(getRoleCodesFromStorage());
      for (const k in state) {
        state[k] = k === homeKey;
      }
      try {
        localStorage.setItem(ACTIVE_MENU_STORAGE_KEY, homeKey);
      } catch {
        // ignore
      }
    },
  },
});

export const { updateMenuLbl, restoreMenuLblFromRoles } = menuLblSlice.actions;
export const ACTIVE_MENU_MODULE_STORAGE_KEY = ACTIVE_MENU_STORAGE_KEY;
export default menuLblSlice.reducer;
