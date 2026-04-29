import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const ReminderBatchesFilterContext = createContext(null);

export function ReminderBatchesFilterProvider({ children }) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftYear, setDraftYear] = useState(null);
  const [applied, setApplied] = useState({ title: "", year: null });

  const applySearch = useCallback(() => {
    const y =
      draftYear && typeof draftYear.year === "function"
        ? draftYear.year()
        : null;
    setApplied({
      title: (draftTitle || "").trim().toLowerCase(),
      year: y,
    });
  }, [draftTitle, draftYear]);

  const reset = useCallback(() => {
    setDraftTitle("");
    setDraftYear(null);
    setApplied({ title: "", year: null });
  }, []);

  const value = useMemo(
    () => ({
      draftTitle,
      setDraftTitle,
      draftYear,
      setDraftYear,
      applied,
      applySearch,
      reset,
    }),
    [draftTitle, draftYear, applied, applySearch, reset],
  );

  return (
    <ReminderBatchesFilterContext.Provider value={value}>
      {children}
    </ReminderBatchesFilterContext.Provider>
  );
}

export function useReminderBatchesFilter() {
  const ctx = useContext(ReminderBatchesFilterContext);
  if (!ctx) {
    throw new Error(
      "useReminderBatchesFilter must be used within ReminderBatchesFilterProvider",
    );
  }
  return ctx;
}
