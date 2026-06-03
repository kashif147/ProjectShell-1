import { formatCount } from "./executiveDashboardUtils";
import { VARIANCE_COLORS } from "./comparison/comparisonVarianceTheme";

/**
 * Floating waterfall: opening → joiners → resigned/cancelled → closing
 * (same layout as comparison variance waterfall mockup)
 */
export function buildWaterfallBridge({
  opening: openingIn,
  closing: closingIn,
  joiners: joinersIn,
  leavers: leaversIn,
  startLabel = "Opening",
  endLabel = "Closing",
}) {
  const opening = Math.max(0, Number(openingIn) || 0);
  const closing = Math.max(0, Number(closingIn) || 0);

  if (!opening && !closing) {
    return { steps: [], yDomain: [0, 1] };
  }

  let joiners = Math.max(0, Number(joinersIn) || 0);
  let leavers = Math.max(0, Number(leaversIn) || 0);

  const net = closing - opening;
  const movement = joiners - leavers;
  if (movement !== net) {
    if (net > movement) {
      joiners += net - movement;
    } else if (net < movement) {
      leavers += movement - net;
    } else if (net > 0) {
      joiners = net;
      leavers = 0;
    } else if (net < 0) {
      joiners = 0;
      leavers = Math.abs(net);
    }
  }

  let resigned = leavers > 0 ? Math.round(leavers * 0.72) : 0;
  let cancelled = Math.max(0, leavers - resigned);
  if (leavers > 0 && resigned + cancelled !== leavers) {
    cancelled = Math.max(0, leavers - resigned);
  }

  const afterJoiners = opening + joiners;
  const afterResigned = afterJoiners - resigned;
  const afterCancelled = afterResigned - cancelled;

  const steps = [
    {
      name: startLabel,
      offset: 0,
      value: opening,
      top: opening,
      bottom: 0,
      fill: VARIANCE_COLORS.neutral,
      type: "total",
      label: formatCount(opening),
    },
    {
      name: "Joiners",
      offset: opening,
      value: joiners,
      top: afterJoiners,
      bottom: opening,
      fill: VARIANCE_COLORS.up,
      type: "delta",
      label: joiners > 0 ? `+${formatCount(joiners)}` : "0",
    },
    {
      name: "Resigned",
      offset: afterResigned,
      value: resigned,
      top: afterJoiners,
      bottom: afterResigned,
      fill: VARIANCE_COLORS.down,
      type: "delta",
      label: resigned > 0 ? `-${formatCount(resigned)}` : "0",
    },
    {
      name: "Cancelled",
      offset: afterCancelled,
      value: cancelled,
      top: afterResigned,
      bottom: afterCancelled,
      fill: VARIANCE_COLORS.down,
      type: "delta",
      label: cancelled > 0 ? `-${formatCount(cancelled)}` : "0",
    },
    {
      name: endLabel,
      offset: 0,
      value: closing,
      top: closing,
      bottom: 0,
      fill: VARIANCE_COLORS.total,
      type: "total",
      label: formatCount(closing),
    },
  ];

  const levels = [0, opening, afterJoiners, afterResigned, afterCancelled, closing];
  const minV = Math.min(...levels);
  const maxV = Math.max(...levels);
  const span = Math.max(maxV - minV, Math.max(opening, closing) * 0.05, 1);
  const pad = Math.max(span * 0.08, 50);
  const yMin = Math.max(0, Math.floor(minV - pad));
  const yMax = Math.ceil(maxV + pad);

  return { steps, yDomain: [yMin, yMax] };
}
