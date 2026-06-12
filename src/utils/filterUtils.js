import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getRowFieldValue } from "./gridFilterOptionsRegistry";
import {
    NUMERIC_COMPARISON_OPERATORS,
    NUMERIC_FILTER_OPERATORS,
    STRING_FILTER_OPERATORS,
} from "./filterOperatorConstants";

dayjs.extend(customParseFormat);

export const DATE_RANGE_OPERATORS = new Set(["between", "within", "more_than"]);

export { NUMERIC_COMPARISON_OPERATORS, NUMERIC_FILTER_OPERATORS, STRING_FILTER_OPERATORS };

const DATE_FIELD_KEY_EXACT = new Set([
    "effective",
    "effectiveDate",
    "createdAt",
    "updatedAt",
    "submissionDate",
    "joinDate",
    "renewalDate",
    "startDate",
    "endDate",
]);

const NUMERIC_FILTER_LABEL_PATTERN =
    /\b(amount|balance|fee|paid amount|last payment amount|membership fee|outstanding balance)\b/i;

const DATE_FILTER_LABEL_PATTERN =
    /\b(date|effective|expiry|created at|updated at|retired|joining|reminder|renewal|rollover|start date|end date|incident date|event date|submission|payment date|last payment|date of birth)\b/i;

export const columnKeyToString = (col) => {
    if (!col?.dataIndex) return "";
    return Array.isArray(col.dataIndex)
        ? col.dataIndex.join(".")
        : String(col.dataIndex);
};

export const isDateColumn = (col) => {
    if (!col) return false;
    if (col.filterValueType === "date") return true;
    if (col.filterValueType === "string" || col.filterValueType === "number") {
        return false;
    }

    const key = columnKeyToString(col).toLowerCase();
    if (DATE_FIELD_KEY_EXACT.has(key)) return true;
    if (key.includes(".date") || key.endsWith("date")) return true;
    if (key.endsWith("at") && (key.includes("created") || key.includes("updated"))) {
        return true;
    }

    const title = String(col.title || "");
    if (title.toLowerCase().includes("date")) return true;
    return DATE_FILTER_LABEL_PATTERN.test(title);
};

export const isStringColumn = (col) => {
    if (!col) return false;
    if (col.filterValueType === "string") return true;
    if (col.filterValueType === "date" || col.filterValueType === "number") {
        return false;
    }
    return false;
};

export const isStringFilterLabel = (label, screenCols = []) => {
    if (!label) return false;

    const col = (screenCols || []).find((c) => c.title === label);
    if (isStringColumn(col)) return true;

    return false;
};

export const isDateFilterLabel = (label, screenCols = []) => {
    if (!label) return false;
    if (String(label) === "Reporting Period") return true;
    if (isStringFilterLabel(label, screenCols)) return false;
    if (String(label).toLowerCase().includes("date")) return true;
    if (DATE_FILTER_LABEL_PATTERN.test(String(label))) return true;

    const col = (screenCols || []).find((c) => c.title === label);
    return isDateColumn(col);
};

export const isNumericColumn = (col) => {
    if (!col) return false;
    if (col.filterValueType === "number") return true;

    const key = columnKeyToString(col).toLowerCase();
    if (
        key.includes("amount") ||
        key.includes("balance") ||
        key.endsWith("fee")
    ) {
        return true;
    }

    const title = String(col.title || "");
    return NUMERIC_FILTER_LABEL_PATTERN.test(title);
};

export const isNumericFilterLabel = (label, screenCols = []) => {
    if (!label) return false;
    if (NUMERIC_FILTER_LABEL_PATTERN.test(String(label))) return true;

    const col = (screenCols || []).find((c) => c.title === label);
    return isNumericColumn(col);
};

export const parseNumericCellValue = (value) => {
    if (value == null || value === "" || value === "—" || value === "-") {
        return null;
    }
    if (typeof value === "number" && Number.isFinite(value)) return value;

    const str = String(value).trim().replace(/[€£$,]/g, "");
    if (!str) return null;
    const parsed = Number(str);
    return Number.isFinite(parsed) ? parsed : null;
};

export const rowMatchesNumericFilter = (
    rowValue,
    { operator = "==", selectedValues = [] } = {},
) => {
    const values = (selectedValues || []).filter((v) => {
        if (v === null || v === undefined) return false;
        return String(v).trim() !== "";
    });
    if (!values.length) return true;

    const rowNumber = parseNumericCellValue(rowValue);
    const op = NUMERIC_FILTER_OPERATORS.has(operator) ? operator : "==";

    if (rowNumber == null) return op === "!=";

    if (op === "between") {
        const start = parseNumericCellValue(values[0]);
        const end = parseNumericCellValue(values[1]);
        if (start == null || end == null) return true;
        const min = Math.min(start, end);
        const max = Math.max(start, end);
        return rowNumber >= min && rowNumber <= max;
    }

    const target = parseNumericCellValue(values[0]);
    if (target == null) return true;

    switch (op) {
        case "==":
            return rowNumber === target;
        case "!=":
            return rowNumber !== target;
        case "<":
            return rowNumber < target;
        case ">":
            return rowNumber > target;
        case "<=":
            return rowNumber <= target;
        case ">=":
            return rowNumber >= target;
        default:
            return rowNumber === target;
    }
};

export const parseFlexibleDate = (value) => {
    if (value == null || value === "" || value === "—") return null;
    if (typeof value === "number" && Number.isFinite(value)) {
        const numeric = dayjs(value);
        return numeric.isValid() ? numeric : null;
    }
    if (dayjs.isDayjs(value)) return value.isValid() ? value : null;

    const str = String(value).trim();
    if (!str) return null;

    const formats = [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DDTHH:mm:ss.SSSZ",
        "YYYY-MM-DDTHH:mm:ss",
        "YYYY-MM-DD",
        "DD/MM/YYYY HH:mm",
        "DD/MM/YYYY",
    ];

    for (const format of formats) {
        const parsed = dayjs(str, format, true);
        if (parsed.isValid()) return parsed;
    }

    const fallback = dayjs(str);
    return fallback.isValid() ? fallback : null;
};

export const rowMatchesDateFilter = (
    rowValue,
    { operator = "between", selectedValues = [] } = {},
) => {
    const values = (selectedValues || []).filter((v) => {
        if (v === null || v === undefined) return false;
        if (typeof v === "number" && Number.isFinite(v)) return true;
        return String(v).trim() !== "";
    });
    if (!values.length) return true;

    const rowDate = parseFlexibleDate(rowValue);
    const op = DATE_RANGE_OPERATORS.has(operator)
        ? operator
        : operator === "!="
          ? "!="
          : "==";

    if (!rowDate) return op === "!=";

    if (op === "between") {
        const start = parseFlexibleDate(values[0]);
        const end = parseFlexibleDate(values[1]);
        if (!start || !end) return true;
        return !rowDate.isBefore(start) && !rowDate.isAfter(end);
    }

    if (op === "within") {
        const amount = Number(values[0]);
        const unit = values[1] || "days";
        if (!Number.isFinite(amount)) return true;
        const threshold = dayjs().subtract(amount, unit);
        return !rowDate.isBefore(threshold);
    }

    if (op === "more_than") {
        const amount = Number(values[0]);
        const unit = values[1] || "days";
        if (!Number.isFinite(amount)) return true;
        const threshold = dayjs().subtract(amount, unit);
        return rowDate.isBefore(threshold);
    }

    const target = parseFlexibleDate(values[0]);
    if (!target) return true;
    const sameDay = rowDate.isSame(target, "day");
    return op === "!=" ? !sameDay : sameDay;
};

const normalizeFilterValues = (values = []) =>
    values
        .map((v) => String(v).trim())
        .filter((v) => v !== "");

function matchTextField(rowValue, selectedValues, operator) {
    const cell = String(rowValue ?? "").toLowerCase();
    const needles = normalizeFilterValues(selectedValues);
    if (!needles.length) return true;
    const anyMatch = needles.some((n) => cell.includes(n.toLowerCase()));
    if (operator === "!=") return !anyMatch;
    return anyMatch;
}

export const rowMatchesStringFilter = (
    rowValue,
    { operator = "contains", selectedValues = [] } = {},
) => {
    const values = (selectedValues || []).filter((v) => {
        if (v === null || v === undefined) return false;
        return String(v).trim() !== "";
    });
    if (!values.length) return true;

    const cell = String(rowValue ?? "");
    const needle = String(values[0] ?? "").trim();
    if (!needle) return true;

    const op = STRING_FILTER_OPERATORS.has(operator) ? operator : "contains";
    const cellLower = cell.toLowerCase();
    const needleLower = needle.toLowerCase();

    switch (op) {
        case "contains":
            return cellLower.includes(needleLower);
        case "not_contains":
            return !cellLower.includes(needleLower);
        case "starts_with":
            return cellLower.startsWith(needleLower);
        case "ends_with":
            return cellLower.endsWith(needleLower);
        case "==":
            return cellLower === needleLower;
        case "!=":
            return cellLower !== needleLower;
        default:
            return cellLower.includes(needleLower);
    }
};

export const applyClientSideRowFilters = (
    rows,
    filtersState = {},
    screenCols = [],
) => {
    if (!Array.isArray(rows) || !rows.length) return rows || [];

    const labelMap = getLabelToKeyMap(screenCols);

    return rows.filter((row) => {
        for (const [label, config] of Object.entries(filtersState)) {
            const key = labelMap[label];
            if (!key) continue;

            const operator = config?.operator || "==";
            const selectedValues = (config?.selectedValues || []).filter((v) => {
                if (v === null || v === undefined) return false;
                if (typeof v === "number" && Number.isFinite(v)) return true;
                if (
                    DATE_RANGE_OPERATORS.has(operator) &&
                    typeof v === "number" &&
                    Number.isFinite(v)
                ) {
                    return true;
                }
                return String(v).trim() !== "";
            });
            if (!selectedValues.length) continue;

            if (isDateFilterLabel(label, screenCols)) {
                if (
                    !rowMatchesDateFilter(getRowFieldValue(row, key), {
                        operator,
                        selectedValues,
                    })
                ) {
                    return false;
                }
                continue;
            }

            if (isNumericFilterLabel(label, screenCols)) {
                if (
                    !rowMatchesNumericFilter(getRowFieldValue(row, key), {
                        operator,
                        selectedValues,
                    })
                ) {
                    return false;
                }
                continue;
            }

            if (isStringFilterLabel(label, screenCols)) {
                if (
                    !rowMatchesStringFilter(getRowFieldValue(row, key), {
                        operator,
                        selectedValues,
                    })
                ) {
                    return false;
                }
                continue;
            }

            if (!matchTextField(getRowFieldValue(row, key), selectedValues, operator)) {
                return false;
            }
        }
        return true;
    });
};

export const getLabelToKeyMap = (screenCols) => {
    const mapping = {};
    const hasSubscriptionStatusColumn = Array.isArray(screenCols)
        ? screenCols.some((col) => {
            const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex;
            return key === 'subscriptionStatus';
        })
        : false;

    // Default manual overrides for common mismatches across screens
    const overrides = {
        'Application Status': 'applicationStatus',
        'Status': 'applicationStatus',
        'Membership Status': hasSubscriptionStatusColumn ? 'subscriptionStatus' : 'membershipStatus',
        'Membership Category': 'membershipCategory',
        'Work Location': 'workLocation',
        'Grade': 'grade',
        'Region': 'region',
        'Branch': 'branch',
        'Department': 'department',
        'Gender': 'gender',
        'Email': 'email',
        'Mobile No': 'mobileNumber',
        'Mobile': 'mobileNumber',
        'Forename': 'firstName',
        'Surname': 'lastName',
        'Membership No': 'membershipNumber',
        'Membership Number': 'membershipNumber',
        'Section (Primary)': 'primarySection',
        'Section (Primary Section)': 'primarySection',
        'Category': 'category',
        'Payment Type': 'paymentType',
        'Payment Frequency': 'paymentFrequency',
        'Subscription Year': 'subscriptionYear',
        'Membership Movement': 'membershipMovement',
        'Country of Qualification': 'countryPrimaryQualification',
        'Preferred Address': 'preferredAddress',
        'Personal Email': 'personalEmail',
        'Work Email': 'workEmail',
        'Rank': 'grade', // Sometimes labeled as Rank but mapped to grade
        'CN Status': 'status',
        'CN ref': 'docNo',
        'Invoice': 'invoiceDocNo',
        'JA Status': 'approvalStatus',
        'Adjustment reference': 'docNo',
        'Debit': 'debitAccount',
        'Credit': 'creditAccount',
        'Member': 'memberId',
        'Amount': 'amountEuro',
        'Reason': 'reason',
        'Created By': 'createdBy',
        'Effective': 'effectiveDate',
        'Payment Method': 'paymentMethod',
        'Payment Status': 'paymentStatus',
        'Billing Cycle': 'billingCycle',
        'Member / Application No': 'memberNo',
        'Transaction ID': 'transactionId',
        'Full Name': 'fullName',
        Phone: 'phone',
        'Renewal Date': 'renewalDate',
        'Payment Date': 'date',
        'Join Date': 'joinDate',
        'Paid Amount': 'paidAmountEuro',
        'Refund Amount': 'refundAmountEuro',
        'Refund ID': 'refundId',
        'Ref No': 'refNo',
        'Refund Date': 'refundDate',
        'Refund Type': 'refundType',
        'Refund Source': 'refundSource',
        'Member No / Application No': 'memberNo',
        'WriteOff': 'writeOff',
        'WriteOff Date': 'writeOffDate',
        'WO Status': 'status',
        'Doc ref': 'docNo',
        'Tx date': 'date',
        'Tx type': 'docTypeLabel',
        'GL Debit': 'debitEuro',
        'GL Credit': 'creditEuro',
        'GL Status': 'approvalStatus',
        Posted: 'createdAt',
        'Rec Status': 'reconciliationStatus',
        'Clearing Account': 'clearingAccountCode',
        'Bank ref': 'bankRef',
        Expected: 'expectedAmountEuro',
        Difference: 'amountDifferenceEuro',
        Confidence: 'matchConfidence',
        'Suggested action': 'suggestedAction',
        'Matched GL': 'matchedGlDocNo',
        Source: 'sourceType',
        'Membership Start Date': 'startDateRange',
        'Expiry Date': 'expiryDateRange',
        'Cancelled Date': 'cancelledDateRange',
        'Resigned Date': 'resignedDateRange',
        'Processed At Date': 'processedDateRange',
        'Last Payment Date': 'paymentDate',
        'Payment Method': 'paymentType',
    };

    if (screenCols && Array.isArray(screenCols)) {
        screenCols.forEach(col => {
            const key = Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : col.dataIndex;
            if (col.title) mapping[col.title] = key;
        });
    }

    return { ...mapping, ...overrides };
};

/** API stores camelCase keys; use when column list is empty or does not list a key (avoids `filtersState['applicationStatus']` vs "Application Status"). */
const APPLICATION_API_FILTER_KEY_TO_LABEL = {
    applicationStatus: "Application Status",
    membershipCategory: "Membership Category",
    workLocation: "Work Location",
    grade: "Grade",
    branch: "Branch",
    region: "Region",
    subscriptionStatus: "Membership Status",
    submissionDate: "Submission Date",
    primarySection: "Section (Primary)",
    paymentType: "Payment Type",
    payrollNo: "Payroll No",
    mobileNumber: "Mobile No",
    preferredEmail: "Preferred Email",
    personalEmail: "Personal Email",
    workEmail: "Work Email",
    status: "CN Status",
    docNo: "CN ref",
    invoiceDocNo: "Invoice",
    approvalStatus: "JA Status",
    debitAccount: "Debit",
    creditAccount: "Credit",
    memberId: "Member",
    effectiveDate: "Effective",
    createdAt: "Created At",
    paymentMethod: "Payment Method",
    paymentStatus: "Payment Status",
    billingCycle: "Billing Cycle",
    memberNo: "Member / Application No",
    transactionId: "Transaction ID",
    fullName: "Full Name",
    phone: "Phone",
    renewalDate: "Renewal Date",
    date: "Payment Date",
    reportingPeriod: "Reporting Period",
    joinDate: "Join Date",
    paidAmount: "Paid Amount",
    amount: "Amount",
    reason: "Reason",
    createdBy: "Created By",
    refundId: "Refund ID",
    refNo: "Ref No",
    memo: "Memo",
    refundDate: "Refund Date",
    refundAmount: "Refund Amount",
    refundType: "Refund Type",
    refundSource: "Refund Source",
    writeOff: "WriteOff",
    writeOffDate: "WriteOff Date",
    ref: "Ref",
    type: "Type",
    updatedBy: "Updated By",
    updatedAt: "Updated At",
    docTypeLabel: "Tx type",
    debit: "GL Debit",
    credit: "GL Credit",
    approvalStatus: "GL Status",
    bankRef: "Bank ref",
    expectedAmount: "Expected",
    amountDifference: "Difference",
    matchConfidence: "Confidence",
    suggestedAction: "Suggested action",
    clearingAccountCode: "Clearing Account",
    reconciliationStatus: "Rec Status",
    matchedGlDocNo: "Matched GL",
    sourceType: "Source",
    dateRange: "Membership Start Date",
    startDateRange: "Membership Start Date",
    expiryDateRange: "Expiry Date",
    cancelledDateRange: "Cancelled Date",
    resignedDateRange: "Resigned Date",
    processedDateRange: "Processed At Date",
    paymentDate: "Last Payment Date",
    membershipStatuses: "Membership Status",
    membershipMovements: "Membership Movement",
    membershipStatus: "Membership Status",
    paymentTypes: "Payment Type",
    paymentType: "Payment Type",
    paymentFrequencies: "Payment Frequency",
    paymentFrequency: "Payment Frequency",
    membershipCategories: "Membership Category",
    membershipCategory: "Membership Category",
    sections: "Section (Primary Section)",
    grades: "Grade",
    regions: "Region",
    branches: "Branch",
    workLocations: "Work Location",
};

/** UI row field names that differ from template API filter keys. */
const FILTER_API_KEY_ALIASES = {
    amountEuro: "amount",
    refundAmountEuro: "refundAmount",
    debitEuro: "debit",
    creditEuro: "credit",
    paidAmountEuro: "paidAmount",
    expectedAmountEuro: "expectedAmount",
    amountDifferenceEuro: "amountDifference",
};

const MEMBERSHIP_LISTING_TEMPLATE_TYPES = new Set([
    "membershiplisting",
    "MembershipListing",
    "membershipListing",
    "statisticsreport",
    "StatisticsReport",
    "statisticsReport",
    "workplacebreakdownreport",
    "WorkplaceBreakdownReport",
    "workplaceBreakdownReport",
    "creditorslistreport",
    "CreditorsListReport",
    "creditorsListReport",
    "debtorslistreport",
    "DebtorsListReport",
    "debtorsListReport",
]);

/** UI / column keys → reporting-service template filter keys. */
const MEMBERSHIP_LISTING_FILTER_KEY_ALIASES = {
    membershipCategory: "membershipCategories",
    membershipStatus: "membershipStatuses",
    membershipMovement: "membershipMovements",
    grade: "grades",
    primarySection: "sections",
    section: "sections",
    region: "regions",
    branch: "branches",
    workLocation: "workLocations",
    paymentType: "paymentTypes",
    paymentFrequency: "paymentFrequencies",
    subscriptionYear: "subscriptionYears",
    startDate: "startDateRange",
    expiryDate: "expiryDateRange",
    cancelledAt: "cancelledDateRange",
    resignedAt: "resignedDateRange",
    processedAt: "processedDateRange",
    renewalDate: "renewalDate",
    paymentDate: "paymentDate",
    invoiceAmount: "invoiceAmount",
    arrearsAmount: "arrearsAmount",
    deferredAmount: "deferredAmount",
    balance: "balance",
};

function normalizeMembershipListingFilterKeys(transformed = {}) {
    const out = { ...transformed };
    for (const [fromKey, toKey] of Object.entries(MEMBERSHIP_LISTING_FILTER_KEY_ALIASES)) {
        if (out[fromKey] && !out[toKey]) {
            out[toKey] = out[fromKey];
        }
        if (out[fromKey] && toKey !== fromKey) {
            delete out[fromKey];
        }
    }
    if (out.dateRange) {
        if (!out.startDateRange) {
            out.startDateRange = out.dateRange;
        }
        delete out.dateRange;
    }
    return out;
}

function isMembershipListingTemplateType(templateType) {
    if (!templateType) return false;
    return MEMBERSHIP_LISTING_TEMPLATE_TYPES.has(String(templateType).trim());
}

function isCreditorsListTemplateType(templateType) {
    if (!templateType) return false;
    const normalized = String(templateType).trim().toLowerCase();
    return normalized === "creditorslistreport";
}

function isDebtorsListTemplateType(templateType) {
    if (!templateType) return false;
    const normalized = String(templateType).trim().toLowerCase();
    return normalized === "debtorslistreport";
}

function isAccountsListReportTemplateType(templateType) {
    return (
        isCreditorsListTemplateType(templateType) ||
        isDebtorsListTemplateType(templateType)
    );
}

export const transformFiltersForApi = (filters, screenCols, options = {}) => {
    const labelMap = getLabelToKeyMap(screenCols);
    const normalizedLabelMap = Object.entries(labelMap).reduce((acc, [label, key]) => {
        acc[String(label).trim().toLowerCase()] = key;
        return acc;
    }, {});
    const transformed = {};

    Object.keys(filters).forEach(label => {
        const filter = filters[label];
        if (filter?.selectedValues?.length > 0) {
            if (
                isAccountsListReportTemplateType(options.templateType) &&
                label === "Reporting Period"
            ) {
                const operator = filter.operator || "between";
                transformed.reportingPeriod = {
                    operator: DATE_RANGE_OPERATORS.has(operator) ? operator : "between",
                    values: (filter.selectedValues || []).map((v) => String(v)),
                };
                return;
            }

            const normalizedLabel = String(label).trim().toLowerCase();
            const key = labelMap[label] || normalizedLabelMap[normalizedLabel];
            if (!key) return; // Ignore unknown labels to avoid backend validation errors
            const apiKey = FILTER_API_KEY_ALIASES[key] || key;
            const isDate = isDateFilterLabel(label, screenCols);
            const isNumeric = isNumericFilterLabel(label, screenCols);
            const isString = isStringFilterLabel(label, screenCols);
            const operator = filter.operator || "==";
            let apiOperator;
            if (isDate && DATE_RANGE_OPERATORS.has(operator)) {
                apiOperator = operator;
            } else if (isNumeric && NUMERIC_FILTER_OPERATORS.has(operator)) {
                if (operator === "==") apiOperator = "equal_to";
                else if (operator === "!=") apiOperator = "not_equal_to";
                else if (operator === "<") apiOperator = "less_than";
                else if (operator === ">") apiOperator = "greater_than";
                else if (operator === "<=") apiOperator = "less_than_or_equal";
                else if (operator === ">=") apiOperator = "greater_than_or_equal";
                else apiOperator = operator;
            } else if (isString && STRING_FILTER_OPERATORS.has(operator)) {
                if (operator === "==") apiOperator = "equal_to";
                else if (operator === "!=") apiOperator = "not_equal_to";
                else apiOperator = operator;
            } else {
                apiOperator = operator === "==" ? "equal_to" : "not_equal_to";
            }
            transformed[apiKey] = {
                operator: apiOperator,
                values: (filter.selectedValues || []).map((v) => String(v)),
            };
        }
    });

    if (isMembershipListingTemplateType(options.templateType)) {
        return normalizeMembershipListingFilterKeys(transformed);
    }

    return transformed;
};

export const transformFiltersFromApi = (apiFilters, screenCols, options = {}) => {
    const labelMap = getLabelToKeyMap(screenCols);
    // Reverse the map for loading
    const keyToLabel = {};
    Object.keys(labelMap).forEach(label => {
        keyToLabel[labelMap[label]] = label;
    });

    const transformed = {};
    const listingTemplate = isMembershipListingTemplateType(options.templateType);

    Object.keys(apiFilters || {}).forEach(key => {
        if (
            isAccountsListReportTemplateType(options.templateType) &&
            ["year", "month", "dateFrom", "dateTo", "periodMode"].includes(key)
        ) {
            return;
        }

        const filter = apiFilters[key];
        let label =
            APPLICATION_API_FILTER_KEY_TO_LABEL[key] || keyToLabel[key] || key;
        if (listingTemplate && (key === "dateRange" || label === "Date Range")) {
            label = "Membership Start Date";
        }
        if (listingTemplate && label === "Payment Date") {
            label = "Last Payment Date";
        }
        const apiOp = filter.operator;
        let operator;
        if (DATE_RANGE_OPERATORS.has(apiOp)) {
            operator = apiOp;
        } else if (apiOp === "equal_to") {
            operator = "==";
        } else if (apiOp === "not_equal_to") {
            operator = "!=";
        } else if (apiOp === "less_than") {
            operator = "<";
        } else if (apiOp === "greater_than") {
            operator = ">";
        } else if (apiOp === "less_than_or_equal") {
            operator = "<=";
        } else if (apiOp === "greater_than_or_equal") {
            operator = ">=";
        } else if (NUMERIC_FILTER_OPERATORS.has(apiOp)) {
            operator = apiOp;
        } else if (STRING_FILTER_OPERATORS.has(apiOp)) {
            operator = apiOp;
        } else {
            operator = "==";
        }
        transformed[label] = {
            operator,
            selectedValues: (filter.values || filter.selectedValues || []).map((v) => {
                const num = Number(v);
                return Number.isFinite(num) ? num : v;
            }),
        };
    });
    return transformed;
};

/** Applications uses "Application Status" — drop legacy duplicate "Status" chip. */
export function consolidateApplicationsStatusFilter(
    filtersState = {},
    visibleFilters = [],
) {
    const nextState = { ...(filtersState || {}) };
    const legacy = nextState.Status;
    const canonical = nextState["Application Status"];

    if (legacy) {
        delete nextState.Status;
        if (!canonical) {
            nextState["Application Status"] = legacy;
        }
    }

    let nextVisible = (visibleFilters || []).filter((label) => label !== "Status");
    if (
        nextState["Application Status"] &&
        !nextVisible.includes("Application Status")
    ) {
        nextVisible = [...nextVisible, "Application Status"];
    }

    return { filtersState: nextState, visibleFilters: nextVisible };
}

/** Drop legacy "Date Range" chip; map values onto Membership Start Date. */
export function consolidateMembershipListingFilters(
    filtersState = {},
    visibleFilters = [],
) {
    const nextState = { ...(filtersState || {}) };
    const legacy = nextState["Date Range"];
    const canonical = nextState["Membership Start Date"];

    if (legacy) {
        delete nextState["Date Range"];
        if (!canonical) {
            nextState["Membership Start Date"] = legacy;
        } else if (
            (canonical.selectedValues || []).length === 0 &&
            (legacy.selectedValues || []).length > 0
        ) {
            nextState["Membership Start Date"] = legacy;
        }
    }

    let nextVisible = (visibleFilters || []).filter(
        (label) => label !== "Date Range",
    );
    if (
        nextState["Membership Start Date"] &&
        !nextVisible.includes("Membership Start Date")
    ) {
        nextVisible = [...nextVisible, "Membership Start Date"];
    }

    const legacyPaymentDate = nextState["Payment Date"];
    const lastPaymentDate = nextState["Last Payment Date"];
    if (legacyPaymentDate) {
        delete nextState["Payment Date"];
        if (!lastPaymentDate) {
            nextState["Last Payment Date"] = legacyPaymentDate;
        } else if (
            (lastPaymentDate.selectedValues || []).length === 0 &&
            (legacyPaymentDate.selectedValues || []).length > 0
        ) {
            nextState["Last Payment Date"] = legacyPaymentDate;
        }
    }

    nextVisible = nextVisible.filter((label) => label !== "Payment Date");
    if (
        nextState["Last Payment Date"] &&
        !nextVisible.includes("Last Payment Date")
    ) {
        nextVisible = [...nextVisible, "Last Payment Date"];
    }

    return { filtersState: nextState, visibleFilters: nextVisible };
}

/**
 * Some gateways return GET /templates/:id with the real document nested under
 * .data. Ensures we read filters, columns, and _id for apply + chips.
 */
export const normalizeViewTemplatePayload = (raw) => {
    if (raw == null || typeof raw !== "object") return raw;
    const inner = raw.data;
    if (
        inner &&
        typeof inner === "object" &&
        (inner.filters != null || inner.columns != null) &&
        raw.filters == null
    ) {
        return {
            ...inner,
            _id: inner._id != null ? inner._id : raw._id,
            name: inner.name != null ? inner.name : raw.name,
        };
    }
    return raw;
};

/**
 * Performs a deep comparison between two filter states.
 * Considers operator and selectedValues (order-independent).
 * Treats null/undefined/empty filters as equal.
 */
export const areFiltersEqual = (filtersA, filtersB) => {
    const normalize = (filters) => {
        const normalized = {};
        if (!filters) return normalized;

        Object.keys(filters).forEach(key => {
            const filter = filters[key];
            const operator = filter?.operator || "==";
            const preserveOrder = DATE_RANGE_OPERATORS.has(operator);
            const values = (filter?.selectedValues || [])
                .map(v => String(v))
                .filter(v => v.trim() !== "");
            const normalizedValues = preserveOrder ? values : [...values].sort();

            if (normalizedValues.length > 0) {
                normalized[key] = {
                    operator,
                    values: normalizedValues
                };
            }
        });
        return normalized;
    };

    const normA = normalize(filtersA);
    const normB = normalize(filtersB);

    const keysA = Object.keys(normA);
    const keysB = Object.keys(normB);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => {
        if (!normB[key]) return false;
        if (normA[key].operator !== normB[key].operator) return false;
        if (normA[key].values.length !== normB[key].values.length) return false;
        return normA[key].values.every((v, i) => v === normB[key].values[i]);
    });
};

/** Ordered visible column keys (dataIndex) for template save/compare. */
export const getVisibleColumnKeys = (screenColumns = []) => {
    return (screenColumns || [])
        .filter((col) => col.isGride)
        .map((col) =>
            Array.isArray(col.dataIndex) ? col.dataIndex.join(".") : col.dataIndex,
        )
        .map(String);
};

/**
 * True if visible column keys (order matters) match the template's saved columns list.
 * If the template has no column list, only the empty layout matches.
 */
export const areColumnKeysEqual = (screenColumns, templateColumnKeys) => {
    const a = getVisibleColumnKeys(screenColumns);
    const b = (templateColumnKeys || []).map(String);
    if (b.length === 0) return a.length === 0;
    if (a.length !== b.length) return false;
    return a.every((k, i) => k === b[i]);
};
