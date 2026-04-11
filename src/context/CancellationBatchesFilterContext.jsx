import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const CancellationBatchesFilterContext = createContext(null);

export function CancellationBatchesFilterProvider({ children }) {
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
    <CancellationBatchesFilterContext.Provider value={value}>
      {children}
    </CancellationBatchesFilterContext.Provider>
  );
}

export function useCancellationBatchesFilter() {
  const ctx = useContext(CancellationBatchesFilterContext);
  if (!ctx) {
    throw new Error(
      "useCancellationBatchesFilter must be used within CancellationBatchesFilterProvider",
    );
  }
  return ctx;
}
