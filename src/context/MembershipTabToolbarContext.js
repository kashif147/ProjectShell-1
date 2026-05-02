import { createContext, useContext } from "react";

/**
 * Lets `MembershipForm` render actions (e.g. Save) into the main profile `Tabs`
 * bar (`tabBarExtraContent`) while the Membership tab is active.
 */
export const MembershipTabToolbarContext = createContext(null);

export function useMembershipTabToolbar() {
  return useContext(MembershipTabToolbarContext);
}
