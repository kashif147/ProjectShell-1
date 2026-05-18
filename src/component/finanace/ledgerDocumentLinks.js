/**
 * Resolve finance workspace navigation targets from a member ledger row.
 * @returns {{ path: string, label: string, state?: object, search?: string } | null}
 */
export function resolveLedgerDocumentLink(record, memberIdFallback = "") {
  if (!record) return null;

  const docNo = String(
    record.docNo ?? record.doc_no ?? record.reference ?? "",
  ).trim();
  const docType = String(record.docType ?? record.documentType ?? "")
    .trim()
    .toLowerCase();
  const displayType = String(record.ledgerDisplayDocType ?? "")
    .trim()
    .toLowerCase();
  const paymentIntentId = String(record.paymentIntentId ?? "").trim();
  const payLabel = String(record.paymentType ?? "").toLowerCase();

  const mid =
    record.memberId ?? record.member_id ?? memberIdFallback ?? "";
  const highlight = { highlightDocNo: docNo, memberId: mid };

  if (docType === "creditnote" || displayType === "credit note") {
    return {
      path: "/CreditNotes",
      label: "Credit notes",
      state: { search: "Credit notes", highlightDocNo: docNo, memberId: mid },
    };
  }

  if (docType === "writeoff") {
    return {
      path: "/write-offs",
      label: "Write-offs",
      state: { search: "Write-offs", highlightDocNo: docNo },
    };
  }

  if (
    docType === "adjustment" &&
    (record.ledgerPresentation === "fee_change_simple" ||
      String(record.memo || "").toLowerCase().includes("category change"))
  ) {
    return null;
  }

  if (docType === "adjustment") {
    return {
      path: "/JournalAdjustments",
      label: "Journal adj.",
      state: { search: "Journal adjustments", highlightDocNo: docNo },
    };
  }

  if (docType === "claim" || record.displayType === "application_credit_claim") {
    return {
      path: "/onlinePayment",
      label: "Online payment",
      state: {
        search: "Online Payment",
        highlightDocNo: docNo,
        paymentIntentId,
      },
    };
  }

  if (docType === "receipt" || docType === "refund") {
    if (paymentIntentId || /stripe|card|online|gateway/i.test(payLabel)) {
      return {
        path: "/onlinePayment",
        label: "Online payment",
        state: {
          search: "Online Payment",
          highlightDocNo: docNo,
          paymentIntentId,
        },
      };
    }

    const batchId = extractBatchIdFromDocNo(docNo);
    if (batchId) {
      if (/deduction|salary|payroll/i.test(payLabel)) {
        return {
          path: `/BatchMemberSummary/${batchId}`,
          label: "Deduction batch",
          state: { search: "Deductions", batchId },
        };
      }
      if (/direct.?debit|dd\b/i.test(payLabel)) {
        return {
          path: "/DirectDebit",
          label: "DD batch",
          state: { search: "Direct Debit", highlightDocNo: docNo, batchId },
        };
      }
      return {
        path: `/BatchMemberSummary/${batchId}`,
        label: "Payment batch",
        state: { batchId, highlightDocNo: docNo },
      };
    }

    if (/standing\s*order/i.test(payLabel)) {
      return {
        path: "/StandingOrders",
        label: "Standing orders",
        state: { ...highlight, search: "Standing Orders" },
      };
    }
    if (/deduction|salary|payroll/i.test(payLabel)) {
      return {
        path: "/Deductions",
        label: "Deductions",
        state: { ...highlight, search: "Deductions" },
      };
    }
    if (/direct.?debit/i.test(payLabel)) {
      return {
        path: "/DirectDebit",
        label: "Direct debit",
        state: { ...highlight, search: "Direct Debit" },
      };
    }
    if (/cheque/i.test(payLabel)) {
      return {
        path: "/Cheque",
        label: "Cheques",
        state: { ...highlight, search: "Cheques" },
      };
    }

    if (/^rcp-[a-f0-9]{24}$/i.test(docNo)) {
      return {
        path: "/onlinePayment",
        label: "Payment",
        state: { search: "Online Payment", highlightDocNo: docNo },
      };
    }
  }

  if (docType === "invoice") {
    return null;
  }

  return null;
}

/** RCP-{batchObjectId}-... or embedded 24-char hex batch segment */
function extractBatchIdFromDocNo(docNo) {
  if (!docNo) return null;
  const m = /^RCP-([a-f0-9]{24})(?:-|$)/i.exec(docNo);
  if (m) return m[1];
  return null;
}
