const ROOT_CLASS = "membership-report-print-active";
const STATS_CLASS = "statistics-report-print-active";

export function activateMembershipReportPrint({ statistics = false } = {}) {
  document.documentElement.classList.add(ROOT_CLASS);
  document.body.classList.add(ROOT_CLASS);
  if (statistics) {
    document.documentElement.classList.add(STATS_CLASS);
    document.body.classList.add(STATS_CLASS);
  }
}

export function deactivateMembershipReportPrint({ statistics = false } = {}) {
  document.documentElement.classList.remove(ROOT_CLASS);
  document.body.classList.remove(ROOT_CLASS);
  if (statistics) {
    document.documentElement.classList.remove(STATS_CLASS);
    document.body.classList.remove(STATS_CLASS);
  }
}

export function bindMembershipReportPrintCleanup(onCleanup) {
  const cleanup = () => {
    onCleanup?.();
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  return cleanup;
}
