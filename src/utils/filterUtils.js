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
};

export const transformFiltersForApi = (filters, screenCols) => {
    const labelMap = getLabelToKeyMap(screenCols);
    const normalizedLabelMap = Object.entries(labelMap).reduce((acc, [label, key]) => {
        acc[String(label).trim().toLowerCase()] = key;
        return acc;
    }, {});
    const transformed = {};

    Object.keys(filters).forEach(label => {
        const filter = filters[label];
        if (filter?.selectedValues?.length > 0) {
            const normalizedLabel = String(label).trim().toLowerCase();
            const key = labelMap[label] || normalizedLabelMap[normalizedLabel];
            if (!key) return; // Ignore unknown labels to avoid backend validation errors
            transformed[key] = {
                operator: filter.operator === '==' ? 'equal_to' : 'not_equal_to',
                values: filter.selectedValues
            };
        }
    });
    return transformed;
};

export const transformFiltersFromApi = (apiFilters, screenCols) => {
    const labelMap = getLabelToKeyMap(screenCols);
    // Reverse the map for loading
    const keyToLabel = {};
    Object.keys(labelMap).forEach(label => {
        keyToLabel[labelMap[label]] = label;
    });

    const transformed = {};
    Object.keys(apiFilters || {}).forEach(key => {
        const filter = apiFilters[key];
        const label =
            keyToLabel[key] || APPLICATION_API_FILTER_KEY_TO_LABEL[key] || key;
        transformed[label] = {
            operator: filter.operator === 'equal_to' ? '==' : '!=',
            selectedValues: filter.values || filter.selectedValues || []
        };
    });
    return transformed;
};

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
            const values = (filter?.selectedValues || [])
                .map(v => String(v))
                .filter(v => v.trim() !== "")
                .sort();

            if (values.length > 0) {
                normalized[key] = {
                    operator: filter.operator || "==",
                    values: values
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
