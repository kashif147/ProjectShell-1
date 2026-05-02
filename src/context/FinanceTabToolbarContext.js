import { createContext, useContext } from "react";

/**
 * Lets `FinanceByID` render Summary / Full View + actions into the main profile
 * `Tabs` bar (`tabBarExtraContent`) while the Finance tab is active.
 */
export const FinanceTabToolbarContext = createContext(null);

export function useFinanceTabToolbar() {
  return useContext(FinanceTabToolbarContext);
}
