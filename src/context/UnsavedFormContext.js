import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  UNSAFE_NavigationContext as NavigationContext,
  useBeforeUnload,
} from "react-router-dom";
import { Modal } from "antd";

const UNSAVED_LEAVE_MESSAGE =
  "Unsaved information will be lost. Do you want to continue?";

const UnsavedFormContext = createContext(null);

export function confirmUnsavedLeave() {
  return new Promise((resolve) => {
    Modal.confirm({
      title: "Unsaved changes",
      content: UNSAVED_LEAVE_MESSAGE,
      okText: "Yes, continue",
      cancelText: "No",
      centered: true,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

function UnsavedFormNavigationBlocker() {
  const {
    hasActiveUnsavedChanges,
    confirmLeaveUnsavedChanges,
    skipNextNavigationBlockRef,
  } = useUnsavedForm();
  const { navigator } = useContext(NavigationContext);

  const hasChangesRef = useRef(hasActiveUnsavedChanges);
  hasChangesRef.current = hasActiveUnsavedChanges;

  const confirmRef = useRef(confirmLeaveUnsavedChanges);
  confirmRef.current = confirmLeaveUnsavedChanges;

  useEffect(() => {
    if (!navigator) return undefined;

    const { push, replace, go } = navigator;

    const wrapNavigation = (original, ...args) => {
      if (!hasChangesRef.current() || skipNextNavigationBlockRef.current) {
        skipNextNavigationBlockRef.current = false;
        original.apply(navigator, args);
        return;
      }
      confirmRef.current().then((ok) => {
        if (ok) {
          skipNextNavigationBlockRef.current = false;
          original.apply(navigator, args);
        }
      });
    };

    navigator.push = (...args) => wrapNavigation(push, ...args);
    navigator.replace = (...args) => wrapNavigation(replace, ...args);
    navigator.go = (...args) => wrapNavigation(go, ...args);

    return () => {
      navigator.push = push;
      navigator.replace = replace;
      navigator.go = go;
    };
  }, [navigator]);

  useBeforeUnload(
    useCallback((event) => {
      if (!hasChangesRef.current()) return;
      event.preventDefault();
      event.returnValue = UNSAVED_LEAVE_MESSAGE;
    }, []),
    { capture: true },
  );

  return null;
}

export function UnsavedFormProvider({ children }) {
  const guardsRef = useRef(new Map());
  const skipNextNavigationBlockRef = useRef(false);

  const registerGuard = useCallback((id, guardRefs) => {
    guardsRef.current.set(id, guardRefs);
    return () => {
      guardsRef.current.delete(id);
    };
  }, []);

  const hasActiveUnsavedChanges = useCallback(() => {
    for (const guard of guardsRef.current.values()) {
      if (guard.enabledRef?.current === false) continue;
      if (guard.isDirtyRef?.current) return true;
    }
    return false;
  }, []);

  const confirmLeaveUnsavedChanges = useCallback(async () => {
    if (!hasActiveUnsavedChanges()) return true;
    return confirmUnsavedLeave();
  }, [hasActiveUnsavedChanges]);

  const allowNextNavigationAfterConfirm = useCallback(() => {
    skipNextNavigationBlockRef.current = true;
  }, []);

  const value = {
    registerGuard,
    hasActiveUnsavedChanges,
    confirmLeaveUnsavedChanges,
    allowNextNavigationAfterConfirm,
    skipNextNavigationBlockRef,
  };

  return (
    <UnsavedFormContext.Provider value={value}>
      <UnsavedFormNavigationBlocker />
      {children}
    </UnsavedFormContext.Provider>
  );
}

export function useUnsavedForm() {
  const context = useContext(UnsavedFormContext);
  if (!context) {
    throw new Error("useUnsavedForm must be used within UnsavedFormProvider");
  }
  return context;
}

export function useConfirmUnsavedLeave() {
  return useUnsavedForm().confirmLeaveUnsavedChanges;
}

export function useAllowNextNavigationAfterConfirm() {
  return useUnsavedForm().allowNextNavigationAfterConfirm;
}

export function useRegisterUnsavedFormGuard(id, isDirty, enabled = true) {
  const { registerGuard } = useUnsavedForm();
  const isDirtyRef = useRef(isDirty);
  const enabledRef = useRef(enabled);

  isDirtyRef.current = isDirty;
  enabledRef.current = enabled;

  useEffect(() => registerGuard(id, { isDirtyRef, enabledRef }), [
    id,
    registerGuard,
  ]);
}
