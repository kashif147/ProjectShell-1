/** Brief tooltips for member finance summary metrics and ledger columns. */

export const SUMMARY_METRIC_HELP = {
  outstandingBalance:
    "Amount the member still owes on open subscription invoices.\n\nFormula: sum of positive balances on account 1400 (Accounts Receivable — Members) for arrears + current period buckets.\n\nDoes not net against payment on account (2020).",
  availableCredit:
    "Credit on the member account from overpayments or approved credit notes.\n\nFormula: max(2020 Payment on Account advance balance, stored member credit) for the selected year.\n\nCan be applied to future invoices or arrears.",
  refundableBalance:
    "Portion of available credit that can be refunded to the member.\n\nFormula: derived from available 2020 credit subject to refund rules (payment method, claim settlement, and finance policy).\n\nWhen equal to available credit, the full on-account balance is refundable under current rules.",
  deferredIncomeBalance:
    "Membership fees received in advance not yet recognised as revenue.\n\nFormula: sum of |negative| balances on account 2030 (Deferred Subscription Income) for the member year.",
  writtenOffBalance:
    "Bad debt written off against this member's receivable in the year.\n\nFormula: sum of 1400 credit entries on WriteOff journals for this member in the calendar year.",
  unreconciledClearingBalance:
    "Payments still in clearing accounts pending finance reconciliation.\n\nFormula: sum of clearing account entries (1210–1250) on Receipt/Refund journals where settlement.status = PENDING for this member in the year.\n\nFinance users reconcile these in Reconciliations.",
};

export const SUMMARY_FOOTER_HELP = {
  lastPayment:
    "Most recent cash receipt or online payment (claim) linked to this member that reduced receivable (1400) and/or increased payment on account (2020).\n\nClaims are online payments taken at application time before the member record existed; they are linked when subscription is generated.",
  lastInvoice:
    "Most recent subscription invoice posted to the member's receivable (1400).",
  pendingCreditNote:
    "Credit notes awaiting approval. Approving posts GL (reverses original 4xxx revenue) and may create member credit on 2020 when the invoice was already paid.",
};

export const LEDGER_COLUMN_HELP = {
  date: "General ledger transaction (posting) date used for reporting and sorting.",
  docType:
    "Operational document type (invoice, receipt, credit note, fee adjustment, etc.).\n\nWhen underlined, click to open the related finance record (online payment, credit notes, write-offs, journal adjustment, or payment batch). Invoices and membership fee adjustments are not linked.",
  paymentType:
    "How money was received or paid out. Online payments (claims) are card/application payments linked to this member after subscription is created. Empty for non-payment documents — see the note in Tx Type.",
  status:
    "Posted = on the general ledger. Draft = credit note not yet approved. Refunded / Written Off = document type indicates that outcome.\n\nClearing/reconciliation state is shown in Badges (CLEARING PENDING), not here.",
  badges:
    "Row-specific flags only: clearing pending, pending approval, refunded, written off, etc. Member-level credit is on the summary cards above.",
  amount:
    "Effect of this transaction on the member account.\n\n(Dr) = member owes more (e.g. invoice). (Cr) = member owes less or is in credit (e.g. payment, credit note).\n\nFormula: debit − credit on member receivable lines for this row (net).",
  balance:
    "Running balance after this row (newest at top ≈ current position).\n\nFormula: previous balance + (debit − credit) for this row.\n\n(Dr) = overall amount owed; (Cr) = overall in credit.\n\nFor open invoice total use Outstanding; for money on account use Available credit on the cards above.",
  memo: "Journal memo and reference for this transaction. Double-click the Memo header to expand the column; drag the edge to resize.",
  ledgerCreatedAt: "Date and time this entry was created in the accounting system.",
  actions:
    "Contextual actions allowed for this document type, balance, and your permissions.",
};

/** Tooltip text for ledger badge chips (Badges column). */
export const LEDGER_BADGE_HELP = {
  "CLEARING PENDING":
    "Payment is posted to a clearing account (card, cheque, salary, standing order, or direct debit) and is not yet reconciled to bank in the finance workspace.",
  "PENDING APPROVAL": "Credit note is in draft — approve to post GL.",
  REFUNDED: "This document is a refund to the member or clearing account.",
  "WRITTEN OFF": "This document is a bad debt write-off (5200 → 1400).",
  "PARTIALLY REFUNDED": "A portion of this payment has been refunded.",
};

/** Shown in Tx Type when there is no payment method (non-payment documents). */
export const LEDGER_TX_DOC_HINT = {
  Invoice: "Subscription charge",
  "Credit Note": "Revenue reversal",
  "Fee Adjustment": "Fee correction (4900)",
  "Fee Increase": "Category upgrade",
  "Fee Decrease": "Category downgrade",
  Adjustment: "GL adjustment",
  "Write-Off": "Bad debt",
  Receipt: "Payment",
};
