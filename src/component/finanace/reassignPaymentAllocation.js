function sortPaymentsOldestFirst(payments) {
  return [...(payments || [])].sort((a, b) => {
    const da = a?.date ? new Date(a.date).getTime() : 0;
    const db = b?.date ? new Date(b.date).getTime() : 0;
    if (da !== db) return da - db;
    return String(a.receiptDocNo || "").localeCompare(
      String(b.receiptDocNo || ""),
    );
  });
}

/** Preview when total to move is 0 — all rows skip; table stays visible. */
export function buildZeroMovePreview(payments) {
  const sorted = sortPaymentsOldestFirst(payments);
  const selectedTotalCents = sorted.reduce(
    (s, p) => s + Math.max(0, Math.floor(Number(p.totalCents) || 0)),
    0,
  );
  if (selectedTotalCents <= 0) {
    return { ok: false, reason: "Selected payments have no amount" };
  }
  const plan = [];
  for (const p of sorted) {
    const docNo = String(p.receiptDocNo || "").trim();
    const lineTotal = Math.max(0, Math.floor(Number(p.totalCents) || 0));
    if (!docNo || lineTotal <= 0) continue;
    plan.push({
      receiptDocNo: docNo,
      action: "skip",
      moveCents: 0,
      retainCents: lineTotal,
      totalCents: lineTotal,
    });
  }
  return {
    ok: true,
    plan,
    totalMoveCents: 0,
    selectedTotalCents,
    untouchedCount: plan.length,
  };
}

/**
 * Client-side mirror of account-service allocateTotalMoveAcrossPayments.
 * Oldest payment first; full moves until pool exhausted; one partial; rest skipped.
 */
export function allocateTotalMoveAcrossPayments(payments, totalMoveCents) {
  const moveTotal = Math.floor(Number(totalMoveCents) || 0);
  const sorted = sortPaymentsOldestFirst(payments);

  const selectedTotalCents = sorted.reduce(
    (s, p) => s + Math.max(0, Math.floor(Number(p.totalCents) || 0)),
    0,
  );

  if (selectedTotalCents <= 0) {
    return { ok: false, reason: "Selected payments have no amount" };
  }
  if (moveTotal <= 0) {
    return { ok: false, reason: "Enter a positive total to move" };
  }
  if (moveTotal > selectedTotalCents) {
    return {
      ok: false,
      reason: `Total to move cannot exceed €${(selectedTotalCents / 100).toFixed(2)}`,
    };
  }

  let remaining = moveTotal;
  const plan = [];

  for (const p of sorted) {
    const docNo = String(p.receiptDocNo || "").trim();
    const lineTotal = Math.max(0, Math.floor(Number(p.totalCents) || 0));
    if (!docNo || lineTotal <= 0) continue;

    if (remaining <= 0) {
      plan.push({
        receiptDocNo: docNo,
        action: "skip",
        moveCents: 0,
        retainCents: lineTotal,
        totalCents: lineTotal,
      });
      continue;
    }

    if (remaining >= lineTotal) {
      plan.push({
        receiptDocNo: docNo,
        action: "full",
        moveCents: lineTotal,
        retainCents: 0,
        totalCents: lineTotal,
      });
      remaining -= lineTotal;
    } else {
      plan.push({
        receiptDocNo: docNo,
        action: "partial",
        moveCents: remaining,
        retainCents: lineTotal - remaining,
        totalCents: lineTotal,
      });
      remaining = 0;
    }
  }

  return {
    ok: true,
    plan,
    totalMoveCents: moveTotal,
    selectedTotalCents,
    untouchedCount: plan.filter((x) => x.action === "skip").length,
  };
}
