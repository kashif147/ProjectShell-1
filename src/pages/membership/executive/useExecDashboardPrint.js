import { useEffect } from "react";

const ROOT_CLASS = "exec-print-active";
const PREPARE_CLASS = "exec-print-prepare";
const CHART_ROOT_SELECTOR =
  ".exec-chart-area, .exec-variance-chart, .exec-kpi-card__spark";
const DEFAULT_CHART_PRINT_HEIGHT_PX = 160;

function lockChartHeightsForPrint() {
  document.querySelectorAll(CHART_ROOT_SELECTOR).forEach((el) => {
    const measured = Math.round(el.getBoundingClientRect().height);
    const height =
      measured >= 80 ? measured : DEFAULT_CHART_PRINT_HEIGHT_PX;
    el.style.setProperty("height", `${height}px`, "important");
    el.style.setProperty("min-height", `${height}px`, "important");
    el.style.setProperty("max-height", `${height + 20}px`, "important");
    el.style.setProperty("width", "100%", "important");
    el.style.setProperty("overflow", "visible", "important");
  });

  document
    .querySelectorAll(
      `${CHART_ROOT_SELECTOR} .recharts-responsive-container, ${CHART_ROOT_SELECTOR} .recharts-wrapper`,
    )
    .forEach((el) => {
      const root = el.closest(CHART_ROOT_SELECTOR);
      if (!root) return;
      const height = Math.round(root.getBoundingClientRect().height);
      if (height < 8) return;
      el.style.setProperty("height", `${height}px`, "important");
      el.style.setProperty("width", "100%", "important");
    });
}

function clearLockedChartHeights() {
  document.querySelectorAll(CHART_ROOT_SELECTOR).forEach((el) => {
    el.style.removeProperty("height");
    el.style.removeProperty("min-height");
    el.style.removeProperty("max-height");
    el.style.removeProperty("width");
    el.style.removeProperty("overflow");
  });

  document
    .querySelectorAll(
      `${CHART_ROOT_SELECTOR} .recharts-responsive-container, ${CHART_ROOT_SELECTOR} .recharts-wrapper`,
    )
    .forEach((el) => {
      el.style.removeProperty("height");
      el.style.removeProperty("width");
    });
}

function notifyChartsToResize() {
  window.dispatchEvent(new Event("resize"));
}

/**
 * Recharts ResponsiveContainer often measures 0×0 until after layout;
 * lock heights and fire resize before opening the print dialog.
 */
export function prepareChartsForPrint() {
  document.body.classList.add(PREPARE_CLASS);
  activateExecDashboardPrintLayout();
  lockChartHeightsForPrint();
  notifyChartsToResize();
}

export function prepareChartsForPrintAsync() {
  prepareChartsForPrint();
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      lockChartHeightsForPrint();
      notifyChartsToResize();
      requestAnimationFrame(() => {
        lockChartHeightsForPrint();
        notifyChartsToResize();
        setTimeout(() => {
          lockChartHeightsForPrint();
          notifyChartsToResize();
          resolve();
        }, 200);
      });
    });
  });
}

export function activateExecDashboardPrintLayout() {
  document.documentElement.classList.add(ROOT_CLASS);
}

export function deactivateExecDashboardPrintLayout() {
  document.documentElement.classList.remove(ROOT_CLASS);
  document.body.classList.remove(PREPARE_CLASS);
  clearLockedChartHeights();
}

export default function useExecDashboardPrint() {
  useEffect(() => {
    const onBeforePrint = () => {
      prepareChartsForPrint();
    };
    const onAfterPrint = () => {
      deactivateExecDashboardPrintLayout();
    };

    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);

    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      deactivateExecDashboardPrintLayout();
    };
  }, []);
}
