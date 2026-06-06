import { useEffect } from "react";
import {
  clearGridFilterRows,
  registerGridFilterRows,
} from "../utils/gridFilterOptionsRegistry";

/**
 * Publishes loaded grid rows to FilterContext for dynamic filter dropdown options.
 */
export function useRegisterGridFilterRows(screenKey, rows, screenCols) {
  useEffect(() => {
    if (!screenKey) return undefined;
    registerGridFilterRows(screenKey, rows, screenCols);
    return () => clearGridFilterRows(screenKey);
  }, [screenKey, rows, screenCols]);
}
