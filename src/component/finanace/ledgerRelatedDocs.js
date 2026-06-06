import { extractBatchIdFromDocNo } from "./ledgerDocumentLinks";

const MEMO_SOURCE_RE =
  /\b(?:for|against|invoice|inv\.?|receipt|rcp\.?)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-_/]{2,})\b/i;

/** GL reference or memo-derived upstream document (not the row's own docNo). */
export function extractSourceDocRef(record) {
  if (!record) return "";
  const docNo = String(record.docNo ?? "").trim();
  const gl = record.glTransaction ?? record.glTransactions?.[0];
  const candidates = [
    record.sourceDocRef,
    record.invoiceDocNo,
    gl?.reference,
    record.reference,
  ];
  for (const raw of candidates) {
    const ref = String(raw ?? "").trim();
    if (ref && ref !== docNo && ref !== "—" && ref !== "-") return ref;
  }
  const memo = String(record.memo ?? "");
  const m = MEMO_SOURCE_RE.exec(memo);
  if (m?.[1] && m[1] !== docNo) return m[1];
  return "";
}

/** Batch / payout identifier for full-view column and source navigation. */
export function extractBatchRef(record) {
  if (!record) return "";
  const payoutId = String(record?.settlement?.payoutId ?? "").trim();
  if (payoutId) return payoutId;
  const batchFromDoc = extractBatchIdFromDocNo(String(record.docNo ?? ""));
  if (batchFromDoc) return batchFromDoc;
  const importBatchId = String(record?.importBatchId ?? "").trim();
  if (importBatchId) return importBatchId;
  return "";
}

/**
 * Build related-document links for each ledger row (same member ledger).
 * @returns {Map<string, { docNo: string, docType?: string }[]>}
 */
export function buildLedgerRelatedDocIndex(rows) {
  const byDocNo = new Map();
  for (const row of rows || []) {
    const docNo = String(row?.docNo ?? "").trim();
    if (docNo) byDocNo.set(docNo, row);
  }

  const index = new Map();
  const addLink = (rowKey, docNo) => {
    const key = String(rowKey ?? "");
    const ref = String(docNo ?? "").trim();
    if (!key || !ref) return;
    const target = byDocNo.get(ref);
    if (!target) return;
    const list = index.get(key) || [];
    if (list.some((x) => x.docNo === ref)) return;
    list.push({ docNo: ref, docType: target.docType });
    index.set(key, list);
  };

  for (const row of rows || []) {
    const rowKey = row.key;
    const src = extractSourceDocRef(row);
    if (src) addLink(rowKey, src);

    const sourceDocNos = row.sourceDocNos;
    if (Array.isArray(sourceDocNos)) {
      for (const d of sourceDocNos) addLink(rowKey, d);
    }

    const docNo = String(row.docNo ?? "").trim();
    if (!docNo) continue;
    for (const other of rows) {
      if (other.key === rowKey) continue;
      const otherSrc = extractSourceDocRef(other);
      if (otherSrc === docNo) addLink(rowKey, other.docNo);
      if (String(other.invoiceDocNo ?? "") === docNo) {
        addLink(rowKey, other.docNo);
      }
    }
  }

  return index;
}
